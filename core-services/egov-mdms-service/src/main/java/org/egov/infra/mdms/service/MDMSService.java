package org.egov.infra.mdms.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.egov.MDMSApplicationRunnerImpl;
import org.egov.infra.mdms.utils.MDMSConstants;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.tracer.model.CustomException;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;

import lombok.extern.slf4j.Slf4j;
import net.minidev.json.JSONArray;

@Service
@Slf4j
public class MDMSService {
    public Map<String, Map<String, JSONArray>> searchMaster(MdmsCriteriaReq mdmsCriteriaReq) {

        Map<String, Map<String, Map<String, JSONArray>>> tenantIdMap = MDMSApplicationRunnerImpl.getTenantMap();

        String tenantId = mdmsCriteriaReq.getMdmsCriteria().getTenantId();

        Map<String, Map<String, JSONArray>> stateLevel = null;
        Map<String, Map<String, JSONArray>> ulbLevel = null;

        if (tenantId.contains(".")) {
            String array[] = tenantId.split("\\.");
            stateLevel = tenantIdMap.get(array[0]);
            ulbLevel = tenantIdMap.get(tenantId);
            if (ulbLevel == null)
                throw new CustomException("Invalid_tenantId.MdmsCriteria.tenantId", "Invalid Tenant Id");
        } else {
            stateLevel = tenantIdMap.get(tenantId);
            if (stateLevel == null)
                throw new CustomException("Invalid_tenantId.MdmsCriteria.tenantId", "Invalid Tenant Id");
        }

        List<ModuleDetail> moduleDetails = mdmsCriteriaReq.getMdmsCriteria().getModuleDetails();
        Map<String, Map<String, JSONArray>> responseMap = new HashMap<>();
        for (ModuleDetail moduleDetail : moduleDetails) {
            List<MasterDetail> masterDetails = moduleDetail.getMasterDetails();

            if (stateLevel != null || ulbLevel != null) {
                if (stateLevel != null && ulbLevel == null) {
                    if (stateLevel.get(moduleDetail.getModuleName()) == null)
                        continue;
                } else if (ulbLevel != null && stateLevel == null) {
                    if (ulbLevel.get(moduleDetail.getModuleName()) == null)
                        continue;
                }
                if (stateLevel != null || ulbLevel != null) {
                    if (stateLevel.get(moduleDetail.getModuleName()) == null
                            && ulbLevel.get(moduleDetail.getModuleName()) == null)
                        continue;
                }
            }

            Map<String, JSONArray> finalMasterMap = new HashMap<>();

            for (MasterDetail masterDetail : masterDetails) {
                // JSONArray masterData = masters.get(masterDetail.getName());
                JSONArray masterData = null;
                try {
                    masterData = getMasterData(stateLevel, ulbLevel, moduleDetail.getModuleName(),
                            masterDetail.getName(), tenantId);
                } catch (Exception e) {
                    // TODO Auto-generated catch block
                    log.error("Exception occurred while reading master data", e);
                }
                if (masterData == null)
                    continue;

                if (masterDetail.getFilter() != null)
                    masterData = filterMaster(masterData, masterDetail.getFilter());

                finalMasterMap.put(masterDetail.getName(),
                        sanitizeMasterDataForResponse(masterData, tenantId, moduleDetail.getModuleName(),
                                masterDetail.getName()));
            }
            responseMap.put(moduleDetail.getModuleName(), finalMasterMap);
        }
        return responseMap;
    }

    private JSONArray getMasterData(Map<String, Map<String, JSONArray>> stateLevel,
                                    Map<String, Map<String, JSONArray>> ulbLevel, String moduleName, String masterName, String tenantId) throws Exception {

        Map<String, Map<String, Object>> masterConfigMap = MDMSApplicationRunnerImpl.getMasterConfigMap();

        Map<String, Object> moduleData = masterConfigMap.get(moduleName);
        Boolean isStateLevel = false;

        Object masterData = null;
        ObjectMapper mapper = new ObjectMapper();
        if (moduleData != null)
            masterData = moduleData.get(masterName);

        if (null != masterData) {
            try {
                isStateLevel = JsonPath.read(mapper.writeValueAsString(masterData),
                        MDMSConstants.STATE_LEVEL_JSONPATH);
            } catch (Exception e) {
                log.error("Error while determining state level, falling back to false state.");
                isStateLevel = false;
            }
        }
        log.info("MasterName... " + masterName + "isStateLevelConfiguration.." + isStateLevel);
        if (ulbLevel == null || isStateLevel) {
            if (stateLevel.get(moduleName) != null) {
                return stateLevel.get(moduleName).get(masterName);
            } else {
                return null;
            }
        } else if (ulbLevel != null && ulbLevel.get(moduleName) != null) {
            return ulbLevel.get(moduleName).get(masterName);
        } else {
            return null;
        }
    }

    public JSONArray filterMaster(JSONArray masters, String filterExp) {
        JSONArray filteredMasters = JsonPath.read(masters, filterExp);
        return filteredMasters;
    }

    private static final java.util.regex.Pattern UUID_PATTERN = java.util.regex.Pattern.compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

    private JSONArray sanitizeMasterDataForResponse(JSONArray masterData, String tenantId, String moduleName,
                                                    String masterName) {
        boolean preserveTopLevelId = MDMSApplicationRunnerImpl.hasTopLevelIdInCache(tenantId, moduleName,
                masterName);
        JSONArray sanitizedMasterData = new JSONArray();
        for (Object record : masterData) {
            sanitizedMasterData.add(sanitizeRecordForResponse(record, preserveTopLevelId));
        }
        return sanitizedMasterData;
    }

    private Object sanitizeRecordForResponse(Object record, boolean preserveTopLevelId) {
        if (!(record instanceof Map)) {
            return record;
        }

        Map<?, ?> recordMap = (Map<?, ?>) record;
        Object idObj = recordMap.get("id");

        // If top-level 'id' exists and is a random UUID, remove 'id' from response
        if (idObj != null && isRandomUuid(idObj)) {
            Map<String, Object> sanitizedRecord = new LinkedHashMap<>();
            for (Map.Entry<?, ?> entry : recordMap.entrySet()) {
                if ("id".equals(entry.getKey())) {
                    continue;
                }
                sanitizedRecord.put(String.valueOf(entry.getKey()), entry.getValue());
            }
            return sanitizedRecord;
        }

        // If top-level 'id' exists and is NOT a random UUID, keep it
        if (preserveTopLevelId || idObj != null) {
            return record;
        }

        // Fallback: if record has an id field (e.g. null) that should be removed
        if (recordMap.containsKey("id")) {
            Map<String, Object> sanitizedRecord = new LinkedHashMap<>();
            for (Map.Entry<?, ?> entry : recordMap.entrySet()) {
                if ("id".equals(entry.getKey())) {
                    continue;
                }
                sanitizedRecord.put(String.valueOf(entry.getKey()), entry.getValue());
            }
            return sanitizedRecord;
        }

        return record;
    }

    private boolean isRandomUuid(Object idObj) {
        if (idObj == null) {
            return false;
        }
        String idStr = String.valueOf(idObj).trim();
        return UUID_PATTERN.matcher(idStr).matches();
    }
}
