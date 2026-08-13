package org.egov.infra.mdms.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.egov.MDMSApplicationRunnerImpl;
import org.egov.infra.mdms.repository.MdmsDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;

/**
 * Unified service for managing the MDMS in-memory cache (tenantMap).
 *
 * Responsibilities: 1. Load all active MDMS data from the database at
 * application startup and merge into cache. 2. Process Kafka messages
 * (create/update) to keep the cache in sync at runtime.
 *
 * Merge strategy (both DB load and Kafka updates): - Records with matching
 * "code" are updated in place. - New records are added. - Inactive records are
 * removed (Kafka updates only).
 */
@Service
@Slf4j
public class MdmsCacheService {

	private final MdmsDataRepository mdmsDataRepository;

	@Value("${egov.mdms.load.from.db.enabled}")
	private boolean dbLoadEnabled;

	@Autowired
	public MdmsCacheService(MdmsDataRepository mdmsDataRepository) {
		this.mdmsDataRepository = mdmsDataRepository;
	}

	/**
	 * Loads all active MDMS data from the database and merges it into the in-memory
	 * tenantMap cache. Called after file-based loading is complete so DB data takes
	 * precedence over file data when records share the same "code".
	 */
	public void loadAndMergeDbData() {
		if (!dbLoadEnabled) {
			log.info("MDMS DB loading is disabled (egov.mdms.load.from.db.enabled=false). Skipping.");
			return;
		}

		log.info("Starting to load MDMS data from database...");

		try {
			List<Map<String, Object>> rows = mdmsDataRepository.searchAll();
			Set<String> clearedMasters = new HashSet<>();
			int recordCount = 0;

			for (Map<String, Object> row : rows) {
				try {
					String tenantId = (String) row.get("tenantid");
					String schemaCode = (String) row.get("schemacode");
					Object dataObj = row.get("data");
					if (tenantId == null || schemaCode == null || dataObj == null) {
						log.warn("Skipping DB row with null tenantId/schemaCode/data: {}", row);
						continue;
					}

					String[] parts = schemaCode.split("\\.", 2);
					if (parts.length != 2) {
						log.warn("Invalid schemaCode format (expected ModuleName.MasterName): {}", schemaCode);
						continue;
					}

					String moduleName = parts[0];
					String masterName = parts[1];

					@SuppressWarnings("unchecked")
					LinkedHashMap<String, Object> data = (LinkedHashMap<String, Object>) dataObj;

					JSONArray masterData = getOrCreateMasterData(tenantId, moduleName, masterName);
					
					String masterKey = tenantId + "-" + moduleName + "-" + masterName;
					if (!clearedMasters.contains(masterKey)) {
						masterData.clear();
						clearedMasters.add(masterKey);
						log.info("Cleared file-based cache for DB replacement: {}", masterKey);
					}

					masterData.add(data);
					recordCount++;
				} catch (Exception e) {
					log.error("Error processing DB row: {}", row, e);
				}
			}

			log.info("Successfully loaded {} MDMS records from database into cache.", recordCount);

		} catch (Exception e) {
			log.error("Error loading MDMS data from database. File-based cache remains intact.", e);
		}
	}

	/**
	 * Processes a Kafka message (create or update) and updates the in-memory cache.
	 */
	@SuppressWarnings("unchecked")
	public synchronized void updateCache(Map<String, Object> message) {
		Map<String, Object> mdms = (Map<String, Object>) message.get("Mdms");
		if (mdms == null) {
			log.warn("Mdms object not found in Kafka message");
			return;
		}

		String tenantId = String.valueOf(mdms.get("tenantId"));
		String schemaCode = String.valueOf(mdms.get("schemaCode"));

		String uniqueIdentifier = mdms.get("uniqueIdentifier") != null ? String.valueOf(mdms.get("uniqueIdentifier"))
				: null;

		String id = mdms.get("id") != null ? String.valueOf(mdms.get("id")) : null;

		Boolean isActive = mdms.get("isActive") == null ? Boolean.TRUE
				: Boolean.valueOf(String.valueOf(mdms.get("isActive")));

		Object data = mdms.get("data");

		if (tenantId == null || schemaCode == null) {
			log.warn("Invalid MDMS cache message: {}", message);
			return;
		}

		String[] parts = schemaCode.split("\\.", 2);

		if (parts.length != 2) {
			log.warn("Invalid schemaCode: {}", schemaCode);
			return;
		}

		String moduleName = parts[0];
		String masterName = parts[1];

		JSONArray masterData = getOrCreateMasterData(tenantId, moduleName, masterName);

		/*
		 * If record is inactive, remove it
		 */
		if (Boolean.FALSE.equals(isActive)) {
			removeMasterRecord(masterData, id, uniqueIdentifier, moduleName, masterName);
			return;
		}

		/*
		 * Convert Kafka data into individual records and upsert each
		 */
		if (data instanceof List) {
			for (Object record : (List<?>) data) {
				upsertRecordFromKafka(masterData, record, moduleName, masterName, id, uniqueIdentifier);
			}
		} else if (data != null) {
			upsertRecordFromKafka(masterData, data, moduleName, masterName, id, uniqueIdentifier);
		}
	}

	/**
	 * Gets or creates the JSONArray for a given tenant/module/master path in the
	 * tenantMap.
	 */
	private JSONArray getOrCreateMasterData(String tenantId, String moduleName, String masterName) {
		Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
		Map<String, Map<String, JSONArray>> moduleMap = tenantMap.computeIfAbsent(tenantId, k -> new HashMap<>());
		Map<String, JSONArray> masterMap = moduleMap.computeIfAbsent(moduleName, k -> new HashMap<>());
		return masterMap.computeIfAbsent(masterName, k -> new JSONArray());
	}

	/**
	 * Upserts a single record into the master data array. If a record with the same
	 * "code" or id/uniqueIdentifier exists, it is replaced; otherwise the new
	 * record is added.
	 * Used by both DB startup loading and Kafka runtime updates.
	 */
    @SuppressWarnings("unchecked")
	private void upsertRecordFromKafka(JSONArray masterData, Object newRecord, String moduleName, String masterName,
			String topLevelId, String topLevelUniqueIdentifier) {
		if (newRecord == null || !(newRecord instanceof Map)) {
			return;
		}

		Map<?, ?> newRecordMap = (Map<?, ?>) newRecord;
		
		// For Kafka, we expect 'id' to be present and used strictly to identify the data
		Object newIdObj = newRecordMap.get("id") != null ? newRecordMap.get("id") : topLevelId;
		String newIdStr = topLevelId != null ? topLevelId
				: (newRecordMap.get("id") != null ? String.valueOf(newRecordMap.get("id")) : null);

		for (int i = 0; i < masterData.size(); i++) {
			Object existing = masterData.get(i);
			if (!(existing instanceof Map))
				continue;

			Map<?, ?> existingMap = (Map<?, ?>) existing;
			boolean matched = false;

			Object existingIdObj = existingMap.get("id");

			// Match strictly by 'id'
			if (!matched && newIdObj != null && existingIdObj != null) {
				matched = isDeepEqual(newIdObj, existingIdObj);
			}
			if (!matched && newIdStr != null && existingIdObj != null) {
				matched = newIdStr.equalsIgnoreCase(String.valueOf(existingIdObj));
			}

			// Fallback to uniqueIdentifier for Kafka updates if id is missing in existing record
			// This prevents duplicates when a file record (no id) is updated via Kafka
			if (!matched && existingIdObj == null) {
				Object newUniqueObj = newRecordMap.get("uniqueIdentifier") != null ? newRecordMap.get("uniqueIdentifier")
						: topLevelUniqueIdentifier;
				Object existingUniqueObj = existingMap.get("uniqueIdentifier");
				String newUniqueStr = topLevelUniqueIdentifier != null ? topLevelUniqueIdentifier
						: (newRecordMap.get("uniqueIdentifier") instanceof String
								? (String) newRecordMap.get("uniqueIdentifier")
								: null);

				if (newUniqueObj != null && existingUniqueObj != null) {
					matched = isDeepEqual(newUniqueObj, existingUniqueObj);
				}
				if (!matched && newUniqueStr != null && existingUniqueObj != null) {
					matched = newUniqueStr.equalsIgnoreCase(String.valueOf(existingUniqueObj));
				}
			}

			if (matched) {
				masterData.set(i, newRecord);
				log.info("Updated MDMS cache record from Kafka for {}.{}", moduleName, masterName);
				return;
			}
		}
		log.info("Added new MDMS cache record from Kafka for {}.{}", moduleName, masterName);
		masterData.add(newRecord);
	}



	private void removeMasterRecord(JSONArray masterData, String id, String uniqueIdentifier, String moduleName,
			String masterName) {
		if (id == null && uniqueIdentifier == null) {
			return;
		}
		List<String> configuredKeys = getUniqueKeysFromConfig(moduleName, masterName);

		for (int i = 0; i < masterData.size(); i++) {
			Object record = masterData.get(i);
			if (!(record instanceof Map))
				continue;

			Map<?, ?> recordMap = (Map<?, ?>) record;

			Object recId = recordMap.get("id");
			Object recUnique = recordMap.get("uniqueIdentifier");
			Object recCode = recordMap.get("code");

			if (id != null && recId != null && isDeepEqual(id, recId)) {
				masterData.remove(i);
				log.info("Removed inactive MDMS cache record for {}.{}", moduleName, masterName);
				return;
			}

			if (uniqueIdentifier != null) {
				if (recUnique != null && isDeepEqual(uniqueIdentifier, recUnique)) {
					masterData.remove(i);
					log.info("Removed inactive MDMS cache record for {}.{}", moduleName, masterName);
					return;
				}
				if (recId != null && isDeepEqual(uniqueIdentifier, recId)) {
					masterData.remove(i);
					log.info("Removed inactive MDMS cache record for {}.{}", moduleName, masterName);
					return;
				}
				if (recCode != null && isDeepEqual(uniqueIdentifier, recCode)) {
					masterData.remove(i);
					log.info("Removed inactive MDMS cache record for {}.{}", moduleName, masterName);
					return;
				}
			}

			if (configuredKeys != null && !configuredKeys.isEmpty()) {
				String firstKey = configuredKeys.get(0);
				Object existingValue = getNestedValue(recordMap, firstKey);
				if (existingValue != null
						&& (uniqueIdentifier != null && isDeepEqual(uniqueIdentifier, existingValue))) {
					masterData.remove(i);
					log.info("Removed inactive MDMS cache record for {}.{}", moduleName, masterName);
					return;
				}
			} else {
				for (Object val : recordMap.values()) {
					if (val != null && (uniqueIdentifier != null && isDeepEqual(uniqueIdentifier, val))) {
						masterData.remove(i);
						log.info("Removed inactive MDMS cache record for {}.{}", moduleName, masterName);
						return;
					}
				}
			}
		}
	}

	@SuppressWarnings("unchecked")
	private List<String> getUniqueKeysFromConfig(String moduleName, String masterName) {
		Map<String, Map<String, Object>> configMap = MDMSApplicationRunnerImpl.getMasterConfigMap();
		if (configMap != null && configMap.containsKey(moduleName)
				&& configMap.get(moduleName).containsKey(masterName)) {
			Object masterConfig = configMap.get(moduleName).get(masterName);
			if (masterConfig instanceof Map) {
				List<String> configKeys = (List<String>) ((Map<?, ?>) masterConfig).get("uniqueKeys");
				if (configKeys != null && !configKeys.isEmpty()) {
					List<String> cleanedKeys = new ArrayList<>();
					for (String k : configKeys) {
						cleanedKeys.add(k.replace("$.", ""));
					}
					return cleanedKeys;
				}
			}
		}
		return null;
	}

	private Object getNestedValue(Map<?, ?> map, String path) {
		if (path == null || map == null)
			return null;
		String[] parts = path.split("\\.");
		Object current = map;
		for (String part : parts) {
			if (current instanceof Map) {
				current = ((Map<?, ?>) current).get(part);
			} else {
				return null;
			}
		}
		return current;
	}

	private boolean isDeepEqual(Object obj1, Object obj2) {
		if (obj1 == obj2) {
			return true;
		}
		if (obj1 == null || obj2 == null) {
			return false;
		}
		if (obj1 instanceof Map && obj2 instanceof Map) {
			Map<?, ?> map1 = (Map<?, ?>) obj1;
			Map<?, ?> map2 = (Map<?, ?>) obj2;
			if (map1.size() != map2.size()) {
				return false;
			}
			for (Object key : map1.keySet()) {
				if (!map2.containsKey(key)) {
					return false;
				}
				if (!isDeepEqual(map1.get(key), map2.get(key))) {
					return false;
				}
			}
			return true;
		}
		if (obj1 instanceof List && obj2 instanceof List) {
			List<?> list1 = (List<?>) obj1;
			List<?> list2 = (List<?>) obj2;
			if (list1.size() != list2.size()) {
				return false;
			}
			for (int i = 0; i < list1.size(); i++) {
				if (!isDeepEqual(list1.get(i), list2.get(i))) {
					return false;
				}
			}
			return true;
		}
		return String.valueOf(obj1).equalsIgnoreCase(String.valueOf(obj2));
	}
}