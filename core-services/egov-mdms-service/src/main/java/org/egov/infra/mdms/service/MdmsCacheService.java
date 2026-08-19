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
import org.egov.infra.mdms.utils.MDMSConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;

/**
 * Unified service for managing the MDMS in-memory cache (tenantMap).
 *
 * Responsibilities: 1. Load all active MDMS data from the database at
 * application startup and replace the in-memory cache with a DB snapshot.
 * 2. Process Kafka messages
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
	 * Resolves tenantId to root state tenantId if the master is state-level or exists at state level.
	 */
	public static String getEffectiveTenantId(String tenantId, String moduleName, String masterName) {
		if (tenantId == null || !tenantId.contains(".")) {
			return tenantId;
		}

		String stateTenantId = tenantId.split("\\.")[0];

		Map<String, Map<String, Object>> masterConfigMap = MDMSApplicationRunnerImpl.getMasterConfigMap();
		if (masterConfigMap != null && masterConfigMap.containsKey(moduleName)) {
			Map<String, Object> moduleData = masterConfigMap.get(moduleName);
			if (moduleData != null && moduleData.containsKey(masterName)) {
				Object masterConfig = moduleData.get(masterName);
				if (masterConfig != null) {
					try {
						ObjectMapper mapper = new ObjectMapper();
						Boolean isStateLevel = JsonPath.read(mapper.writeValueAsString(masterConfig),
								MDMSConstants.STATE_LEVEL_JSONPATH);
						if (Boolean.TRUE.equals(isStateLevel)) {
							return stateTenantId;
						}
					} catch (Exception e) {
						// ignore
					}
				}
			}
		}

		Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
		if (tenantMap != null && tenantMap.containsKey(stateTenantId)) {
			Map<String, Map<String, JSONArray>> stateModules = tenantMap.get(stateTenantId);
			if (stateModules != null && stateModules.containsKey(moduleName)) {
				Map<String, JSONArray> stateMasters = stateModules.get(moduleName);
				if (stateMasters != null && stateMasters.containsKey(masterName)) {
					return stateTenantId;
				}
			}
		}

		return tenantId;
	}

	/**
	 * Loads all active MDMS data from the database and replaces the in-memory
	 * tenantMap cache with the DB snapshot. Called after file-based loading is
	 * complete so the runtime cache contains only the data that exists in DB when
	 * DB loading is enabled.
	 */
	/**
	 * Loads all active MDMS data from the database and merges individual records into
	 * the in-memory tenantMap cache (which was initialized from files).
	 */
	public void loadAndMergeDbData() {
		if (!dbLoadEnabled) {
			log.info("MDMS DB loading is disabled (egov.mdms.load.from.db.enabled=false). Skipping.");
			return;
		}

		deduplicateAllMasters();
		log.info("Starting to load MDMS data from database...");

		try {
			List<Map<String, Object>> rows = mdmsDataRepository.searchAll();
			int recordCount = 0;

			for (Map<String, Object> row : rows) {
				try {
					String tenantId = (String) row.get("tenantid");
					String schemaCode = (String) row.get("schemacode");
					Object dataObj = row.get("data");
					String dbId = row.get("id") != null ? String.valueOf(row.get("id")) : null;
					String dbUniqueIdentifier = row.get("uniqueidentifier") != null ? String.valueOf(row.get("uniqueidentifier")) : null;

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

					String effectiveTenantId = getEffectiveTenantId(tenantId, moduleName, masterName);
					JSONArray masterData = getOrCreateMasterData(effectiveTenantId, moduleName, masterName);

					if (dataObj instanceof List) {
						for (Object rec : (List<?>) dataObj) {
							upsertRecordFromKafka(masterData, rec, moduleName, masterName, dbId, dbUniqueIdentifier);
							recordCount++;
						}
					} else {
						upsertRecordFromKafka(masterData, dataObj, moduleName, masterName, dbId, dbUniqueIdentifier);
						recordCount++;
					}

					MDMSApplicationRunnerImpl.refreshMasterTopLevelIdState(effectiveTenantId, moduleName, masterName, masterData);
				} catch (Exception e) {
					log.error("Error processing DB row: {}", row, e);
				}
			}

			log.info("Merged {} DB records into in-memory MDMS cache.", recordCount);

			// Deduplicate all cached master arrays to collapse any duplicate entries originating from seed JSON files or DB loading
			deduplicateAllMasters();

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

		String effectiveTenantId = getEffectiveTenantId(tenantId, moduleName, masterName);
		JSONArray masterData = getOrCreateMasterData(effectiveTenantId, moduleName, masterName);

		/*
		 * If record is inactive, remove it
		 */
		if (Boolean.FALSE.equals(isActive)) {
			removeMasterRecord(masterData, id, uniqueIdentifier, moduleName, masterName);
			MDMSApplicationRunnerImpl.refreshMasterTopLevelIdState(effectiveTenantId, moduleName, masterName, masterData);
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

		MDMSApplicationRunnerImpl.refreshMasterTopLevelIdState(effectiveTenantId, moduleName, masterName, masterData);
	}

	/**
	 * Gets or creates the JSONArray for a given tenant/module/master path in the
	 * tenantMap.
	 */
	private JSONArray getOrCreateMasterData(String tenantId, String moduleName, String masterName) {
		return getOrCreateMasterData(MDMSApplicationRunnerImpl.getTenantMap(), tenantId, moduleName, masterName);
	}

	private JSONArray getOrCreateMasterData(Map<String, Map<String, Map<String, JSONArray>>> tenantMap, String tenantId,
			String moduleName, String masterName) {
		Map<String, Map<String, JSONArray>> moduleMap = tenantMap.computeIfAbsent(tenantId, key -> new HashMap<>());
		Map<String, JSONArray> masterMap = moduleMap.computeIfAbsent(moduleName, key -> new HashMap<>());
		return masterMap.computeIfAbsent(masterName, key -> new JSONArray());
	}

	/**
	 * Upserts a single record into the master data array. If a record with matching
	 * id, uniqueIdentifier, code, model, businessService, or dynamic field schema exists,
	 * it is replaced in place; otherwise the new record is added.
	 * Used by both DB startup loading and Kafka runtime updates.
	 */
	@SuppressWarnings("unchecked")
	private void upsertRecordFromKafka(JSONArray masterData, Object newRecord, String moduleName, String masterName,
			String topLevelId, String topLevelUniqueIdentifier) {
		if (newRecord == null || !(newRecord instanceof Map)) {
			return;
		}

		Map<?, ?> newRecordMap = (Map<?, ?>) newRecord;

		for (int i = 0; i < masterData.size(); i++) {
			Object existing = masterData.get(i);
			if (!(existing instanceof Map))
				continue;

			Map<?, ?> existingMap = (Map<?, ?>) existing;

			if (isRecordMatching(existingMap, newRecordMap, moduleName, masterName, topLevelId, topLevelUniqueIdentifier)) {
				Map<String, Object> mergedRecord = deepMergeMaps(existingMap, newRecordMap);
				masterData.set(i, mergedRecord);
				log.info("Merged MDMS cache record for {}.{}", moduleName, masterName);
				return;
			}
		}

		log.info("Added new MDMS cache record for {}.{}", moduleName, masterName);
		masterData.add(newRecord);
		deduplicateMasterData(masterData, moduleName, masterName);
	}

	private static final java.util.regex.Pattern UUID_PATTERN = java.util.regex.Pattern.compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

	public void deduplicateAllMasters() {
		Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
		if (tenantMap == null) return;

		for (Map.Entry<String, Map<String, Map<String, JSONArray>>> tEntry : tenantMap.entrySet()) {
			Map<String, Map<String, JSONArray>> moduleMap = tEntry.getValue();
			if (moduleMap == null) continue;

			for (Map.Entry<String, Map<String, JSONArray>> mEntry : moduleMap.entrySet()) {
				String moduleName = mEntry.getKey();
				Map<String, JSONArray> masterMap = mEntry.getValue();
				if (masterMap == null) continue;

				for (Map.Entry<String, JSONArray> masterEntry : masterMap.entrySet()) {
					String masterName = masterEntry.getKey();
					JSONArray masterData = masterEntry.getValue();
					if (masterData != null && masterData.size() > 1) {
						deduplicateMasterData(masterData, moduleName, masterName);
					}
				}
			}
		}
	}

	@SuppressWarnings("unchecked")
	private void deduplicateMasterData(JSONArray masterData, String moduleName, String masterName) {
		if (masterData == null || masterData.size() <= 1) {
			return;
		}

		List<String> configuredKeys = getUniqueKeysFromConfig(moduleName, masterName);

		List<Object> deduplicatedList = new ArrayList<>(masterData.size());
		Map<String, List<Integer>> codeToIndicesMap = new HashMap<>();
		Map<String, Integer> uniqueKeyToIdxMap = (configuredKeys != null && !configuredKeys.isEmpty()) ? new HashMap<>() : null;
		List<Set<String>> indexToCandidateCodes = new ArrayList<>();

		for (Object item : masterData) {
			if (!(item instanceof Map)) {
				deduplicatedList.add(item);
				indexToCandidateCodes.add(java.util.Collections.emptySet());
				continue;
			}

			Map<?, ?> currentMap = (Map<?, ?>) item;
			Set<String> candidateCodes = extractCandidateCodes(currentMap, null, null);
			String currentTopCode = getTopLevelCode(currentMap);
			String currentCityCode = getNestedCityCode(currentMap);

			int matchIdx = -1;

			if (!candidateCodes.isEmpty()) {
				for (String code : candidateCodes) {
					String lowerCode = code.toLowerCase();
					List<Integer> existingIndices = codeToIndicesMap.get(lowerCode);
					if (existingIndices != null) {
						for (int idx : existingIndices) {
							Object exObj = deduplicatedList.get(idx);
							if (exObj instanceof Map) {
								String exTopCode = getTopLevelCode((Map<?, ?>) exObj);
								if (hasTopCodeConflict(exTopCode, currentTopCode)) {
									continue;
								}
								String exCityCode = getNestedCityCode((Map<?, ?>) exObj);
								if (hasCityCodeConflict(exCityCode, currentCityCode)) {
									continue;
								}
								matchIdx = idx;
								break;
							}
						}
						if (matchIdx != -1) {
							break;
						}
					}
				}
			}

			if (matchIdx == -1 && candidateCodes.isEmpty() && uniqueKeyToIdxMap != null) {
				String ukVal = buildUniqueKeysString(currentMap, configuredKeys);
				if (ukVal != null) {
					Integer existingIdx = uniqueKeyToIdxMap.get(ukVal);
					if (existingIdx != null) {
						matchIdx = existingIdx;
					}
				}
			}

			if (matchIdx != -1) {
				Map<?, ?> existingMap = (Map<?, ?>) deduplicatedList.get(matchIdx);
				Map<String, Object> merged = deepMergeMaps(currentMap, existingMap);
				deduplicatedList.set(matchIdx, merged);

				Set<String> existingCodesSet = indexToCandidateCodes.get(matchIdx);
				for (String code : candidateCodes) {
					if (existingCodesSet.add(code)) {
						codeToIndicesMap.computeIfAbsent(code.toLowerCase(), k -> new ArrayList<>()).add(matchIdx);
					}
				}
			} else {
				int newIdx = deduplicatedList.size();
				deduplicatedList.add(currentMap);
				indexToCandidateCodes.add(new HashSet<>(candidateCodes));

				for (String code : candidateCodes) {
					codeToIndicesMap.computeIfAbsent(code.toLowerCase(), k -> new ArrayList<>()).add(newIdx);
				}

				if (candidateCodes.isEmpty() && uniqueKeyToIdxMap != null) {
					String ukVal = buildUniqueKeysString(currentMap, configuredKeys);
					if (ukVal != null) {
						uniqueKeyToIdxMap.put(ukVal, newIdx);
					}
				}
			}
		}

		masterData.clear();
		masterData.addAll(deduplicatedList);
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> deepMergeMaps(Map<?, ?> existingMap, Map<?, ?> newMap) {
		Map<String, Object> merged = new LinkedHashMap<>();

		for (Map.Entry<?, ?> entry : existingMap.entrySet()) {
			merged.put(String.valueOf(entry.getKey()), entry.getValue());
		}

		for (Map.Entry<?, ?> entry : newMap.entrySet()) {
			String key = String.valueOf(entry.getKey());
			Object newVal = entry.getValue();
			Object existingVal = merged.get(key);

			if (existingVal instanceof Map && newVal instanceof Map) {
				merged.put(key, deepMergeMaps((Map<?, ?>) existingVal, (Map<?, ?>) newVal));
			} else {
				merged.put(key, newVal);
			}
		}

		return merged;
	}

	private boolean isRecordMatching(Map<?, ?> existingMap, Map<?, ?> newRecordMap, String moduleName, String masterName,
			String topLevelId, String topLevelUniqueIdentifier) {

		// 1. Strict match by 'id' if present in both and not random UUID
		Object existingId = existingMap.get("id");
		Object newId = newRecordMap.get("id") != null ? newRecordMap.get("id") : topLevelId;
		if (newId != null && existingId != null && !isRandomUuid(newId) && !isRandomUuid(existingId)) {
			return isDeepEqual(newId, existingId);
		}

		// 2. Strict mismatch check on top-level 'code': if both records have a 'code' and they differ, they CANNOT match
		Object existingCode = existingMap.get("code");
		Object newCode = newRecordMap.get("code");
		if (existingCode != null && newCode != null) {
			String exCodeStr = String.valueOf(existingCode).trim();
			String newCodeStr = String.valueOf(newCode).trim();
			if (!exCodeStr.isEmpty() && !newCodeStr.isEmpty()) {
				if (!exCodeStr.equalsIgnoreCase(newCodeStr)) {
					return false;
				}
			}
		}

		// 2b. Strict mismatch check on nested 'city.code': if both records have 'city.code' and they differ, they CANNOT match
		String existingCityCode = getNestedCityCode(existingMap);
		String newCityCode = getNestedCityCode(newRecordMap);
		if (existingCityCode != null && newCityCode != null) {
			if (!existingCityCode.equalsIgnoreCase(newCityCode)) {
				return false;
			}
		}

		// 3. Extract candidate identifier codes for both records and check for intersection
		Set<String> existingCodes = extractCandidateCodes(existingMap, null, null);
		Set<String> newCodes = extractCandidateCodes(newRecordMap, topLevelId, topLevelUniqueIdentifier);

		if (!existingCodes.isEmpty() && !newCodes.isEmpty()) {
			for (String code : newCodes) {
				if (existingCodes.contains(code)) {
					return true;
				}
			}
			return false;
		}

		// 4. Match by configured uniqueKeys in masterConfigMap
		List<String> configuredKeys = getUniqueKeysFromConfig(moduleName, masterName);
		if (configuredKeys != null && !configuredKeys.isEmpty()) {
			boolean allMatch = true;
			for (String k : configuredKeys) {
				Object exVal = getNestedValue(existingMap, k);
				Object newVal = getNestedValue(newRecordMap, k);
				if (exVal == null || newVal == null || !isDeepEqual(exVal, newVal)) {
					allMatch = false;
					break;
				}
			}
			if (allMatch) return true;
		}

		return false;
	}

	private Set<String> extractCandidateCodes(Map<?, ?> map, String topLevelId, String topLevelUniqueIdentifier) {
		Set<String> codes = new HashSet<>();
		if (map == null) return codes;

		if (map.get("code") != null) {
			codes.add(String.valueOf(map.get("code")).trim());
		}
		if (map.get("uniqueIdentifier") != null) {
			codes.add(String.valueOf(map.get("uniqueIdentifier")).trim());
		}
		if (map.get("id") != null && !isRandomUuid(map.get("id"))) {
			codes.add(String.valueOf(map.get("id")).trim());
		}
		if (map.get("model") != null) {
			codes.add(String.valueOf(map.get("model")).trim());
		}
		if (map.get("businessService") != null) {
			codes.add(String.valueOf(map.get("businessService")).trim());
		}
		if (map.get("service") != null) {
			codes.add(String.valueOf(map.get("service")).trim());
		}
		if (map.get("city") instanceof Map) {
			Map<?, ?> cityMap = (Map<?, ?>) map.get("city");
			if (cityMap.get("code") != null) {
				codes.add(String.valueOf(cityMap.get("code")).trim());
			}
		}

		if (topLevelId != null && !isRandomUuid(topLevelId)) {
			codes.add(topLevelId.trim());
		}
		if (topLevelUniqueIdentifier != null) {
			codes.add(topLevelUniqueIdentifier.trim());
		}

		return codes;
	}

	private String getTopLevelCode(Map<?, ?> map) {
		if (map == null) return null;
		Object codeObj = map.get("code");
		if (codeObj == null) return null;
		String str = String.valueOf(codeObj).trim();
		return str.isEmpty() ? null : str;
	}

	private boolean hasTopCodeConflict(String code1, String code2) {
		if (code1 != null && code2 != null) {
			return !code1.equalsIgnoreCase(code2);
		}
		return false;
	}

	private String getNestedCityCode(Map<?, ?> map) {
		if (map == null) return null;
		if (map.get("city") instanceof Map) {
			Map<?, ?> cityMap = (Map<?, ?>) map.get("city");
			if (cityMap.get("code") != null) {
				String str = String.valueOf(cityMap.get("code")).trim();
				return str.isEmpty() ? null : str;
			}
		}
		return null;
	}

	private boolean hasCityCodeConflict(String cityCode1, String cityCode2) {
		if (cityCode1 != null && cityCode2 != null) {
			return !cityCode1.equalsIgnoreCase(cityCode2);
		}
		return false;
	}

	private String buildUniqueKeysString(Map<?, ?> map, List<String> configuredKeys) {
		if (configuredKeys == null || configuredKeys.isEmpty()) return null;
		StringBuilder sb = new StringBuilder();
		for (String k : configuredKeys) {
			Object val = getNestedValue(map, k);
			if (val == null) return null;
			sb.append(String.valueOf(val).toLowerCase().trim()).append("\u0000");
		}
		return sb.toString();
	}

	private boolean isRandomUuid(Object idObj) {
		if (idObj == null) return false;
		String str = String.valueOf(idObj).trim();
		return UUID_PATTERN.matcher(str).matches();
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
