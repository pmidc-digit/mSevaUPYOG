package org.egov.infra.mdms.service;

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
 * Service for managing the MDMS in-memory cache (tenantMap).
 *
 * Responsibilities:
 * 1. Load all active MDMS data from the database at application startup and merge it into the in-memory cache.
 *
 * Cache is loaded once at startup via database loading only. Cache refresh requires a Application restart.
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
	 * Resolves tenantId to root state tenantId if the master is state-level or
	 * exists at state level.
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

		return tenantId;
	}

	/**
	 * Loads all active MDMS data from the database and merges individual records
	 * into the in-memory tenantMap cache (which was initialized from files). Called
	 * once at application startup.
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
			Set<String> clearedMasters = new HashSet<>();

			for (Map<String, Object> row : rows) {
				try {
					String tenantId = (String) row.get("tenantid");
					String schemaCode = (String) row.get("schemacode");
					Object dataObj = row.get("data");
					String dbId = row.get("id") != null ? String.valueOf(row.get("id")) : null;
					String dbUniqueIdentifier = row.get("uniqueidentifier") != null
							? String.valueOf(row.get("uniqueidentifier"))
							: null;

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

					// Clear file-loaded data for this specific master on first DB record encounter
					String masterKey = effectiveTenantId + "." + moduleName + "." + masterName;
					if (clearedMasters.add(masterKey)) {
						masterData.clear();
						log.info("Cleared file-loaded master data for {}.{} under tenant {} to replace with DB data",
								moduleName, masterName, effectiveTenantId);
					}

					if (dataObj instanceof List) {
						for (Object rec : (List<?>) dataObj) {
							upsertDbRecord(masterData, rec, dbId, dbUniqueIdentifier);
							recordCount++;
						}
					} else {
						upsertDbRecord(masterData, dataObj, dbId, dbUniqueIdentifier);
						recordCount++;
					}

					MDMSApplicationRunnerImpl.refreshMasterTopLevelIdState(effectiveTenantId, moduleName, masterName,
							masterData);
				} catch (Exception e) {
					log.error("Error processing DB row: {}", row, e);
				}

			}

			log.info("Merged {} DB records into in-memory MDMS cache.", recordCount);

		} catch (Exception e) {
			log.error("Error loading MDMS data from database. File-based cache remains intact.", e);
		}
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
	 * Adds a database record into the in-memory cache master array.
	 */
	@SuppressWarnings("unchecked")
	private void upsertDbRecord(JSONArray masterData, Object dbRecord, String dbId, String dbUniqueIdentifier) {
		if (dbRecord == null || !(dbRecord instanceof Map)) {
			return;
		}

		Map<String, Object> newRecordMap = new LinkedHashMap<>();
		for (Map.Entry<?, ?> entry : ((Map<?, ?>) dbRecord).entrySet()) {
			newRecordMap.put(String.valueOf(entry.getKey()), entry.getValue());
		}
		if (dbId != null && !dbId.trim().isEmpty() && !newRecordMap.containsKey("id")) {
			newRecordMap.put("id", dbId);
		}
		masterData.add(newRecordMap);
	}
}
