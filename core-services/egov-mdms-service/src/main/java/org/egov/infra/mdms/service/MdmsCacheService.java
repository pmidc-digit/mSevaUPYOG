package org.egov.infra.mdms.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

					LinkedHashMap<String, Object> data = (LinkedHashMap<String, Object>) dataObj;

					JSONArray masterData = getOrCreateMasterData(tenantId, moduleName, masterName);
					upsertRecord(masterData, data, moduleName, masterName);
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
			removeMasterRecord(masterData, uniqueIdentifier, moduleName, masterName);
			return;
		}

		/*
		 * Convert Kafka data into individual records and upsert each
		 */
		if (data instanceof List) {
			for (Object record : (List<?>) data) {
				upsertRecord(masterData, record, moduleName, masterName);
			}
		} else if (data != null) {
			upsertRecord(masterData, data, moduleName, masterName);
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
	 * "code" exists, it is replaced; otherwise the new record is added. Used by
	 * both DB startup loading and Kafka runtime updates.
	 */
	private void upsertRecord(JSONArray masterData, Object newRecord, String moduleName, String masterName) {
		if (newRecord == null || !(newRecord instanceof Map)) {
			return;
		}

		Map<?, ?> newRecordMap = (Map<?, ?>) newRecord;
		List<String> configuredKeys = getUniqueKeysFromConfig(moduleName, masterName);

		for (int i = 0; i < masterData.size(); i++) {
			Object existing = masterData.get(i);
			if (!(existing instanceof Map))
				continue;

			Map<?, ?> existingMap = (Map<?, ?>) existing;
			boolean matched = false;

			if (configuredKeys != null && !configuredKeys.isEmpty()) {
				matched = true;
				for (String key : configuredKeys) {
					Object existingVal = getNestedValue(existingMap, key);
					Object newVal = getNestedValue(newRecordMap, key);
					if (existingVal == null || newVal == null
							|| !String.valueOf(existingVal).equals(String.valueOf(newVal))) {
						matched = false;
						break;
					}
				}
			} else {
				matched = compareWithoutUuid(existingMap, newRecordMap);
			}

			if (matched) {
				masterData.set(i, newRecord);
				log.info("Updated MDMS cache record for {}.{}", moduleName, masterName);
				return;
			}
		}
		log.info("Added new MDMS cache record for {}.{}", moduleName, masterName);
		masterData.add(newRecord);
	}

	/**
	 * Removes a record from the master data array by its unique identifier.
	 */
	private void removeMasterRecord(JSONArray masterData, String uniqueIdentifier, String moduleName,
			String masterName) {
		if (uniqueIdentifier == null) {
			return;
		}
		List<String> configuredKeys = getUniqueKeysFromConfig(moduleName, masterName);

		for (int i = 0; i < masterData.size(); i++) {
			Object record = masterData.get(i);
			if (!(record instanceof Map))
				continue;

			Map<?, ?> recordMap = (Map<?, ?>) record;

			if (configuredKeys != null && !configuredKeys.isEmpty()) {
				String firstKey = configuredKeys.get(0);
				Object existingValue = getNestedValue(recordMap, firstKey);
				if (existingValue != null && uniqueIdentifier.equals(String.valueOf(existingValue))) {
					masterData.remove(i);
					log.info("Removed inactive MDMS cache record for {}.{}", moduleName, masterName);
					return;
				}
			} else {
				for (Object val : recordMap.values()) {
					if (val != null && uniqueIdentifier.equals(String.valueOf(val))) {
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
		Map<String, Map<String, Object>> configMap = org.egov.MDMSApplicationRunnerImpl.getMasterConfigMap();
		if (configMap != null && configMap.containsKey(moduleName)
				&& configMap.get(moduleName).containsKey(masterName)) {
			Object masterConfig = configMap.get(moduleName).get(masterName);
			if (masterConfig instanceof Map) {
				List<String> configKeys = (List<String>) ((Map<?, ?>) masterConfig).get("uniqueKeys");
				if (configKeys != null && !configKeys.isEmpty()) {
					List<String> cleanedKeys = new java.util.ArrayList<>();
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

	private boolean compareWithoutUuid(Map<?, ?> existingMap, Map<?, ?> newRecordMap) {
		java.util.Set<String> ignoreKeys = new java.util.HashSet<>(
				java.util.Arrays.asList("id", "uuid", "auditDetails"));

		for (Object keyObj : existingMap.keySet()) {
			String key = String.valueOf(keyObj);
			if (ignoreKeys.contains(key))
				continue;

			Object existingVal = existingMap.get(key);
			Object newVal = newRecordMap.get(key);

			if (existingVal == null && newVal != null)
				return false;
			if (existingVal != null && !existingVal.equals(newVal))
				return false;
		}

		for (Object keyObj : newRecordMap.keySet()) {
			String key = String.valueOf(keyObj);
			if (ignoreKeys.contains(key))
				continue;
			if (!existingMap.containsKey(key))
				return false;
		}

		return true;
	}
}