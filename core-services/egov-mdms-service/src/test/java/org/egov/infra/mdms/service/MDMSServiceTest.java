package org.egov.infra.mdms.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.egov.MDMSApplicationRunnerImpl;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.junit.Before;
import org.junit.Test;

import net.minidev.json.JSONArray;

public class MDMSServiceTest {

    private MDMSService mdmsService;

    @Before
    public void setUp() {
        mdmsService = new MDMSService();
        MDMSApplicationRunnerImpl.getTenantMap().clear();
        MDMSApplicationRunnerImpl.getMasterConfigMap().clear();
    }

    @Test
    public void searchMaster_shouldHideTopLevelIdFromResponseAndKeepCacheIntact() {
        String tenantId = "pb";
        String moduleName = "MDMS";
        String masterName = "SecurityPolicy";

        Map<String, Object> nestedObject = new LinkedHashMap<>();
        nestedObject.put("id", "nested-id");

        Map<String, Object> cachedRecord = new LinkedHashMap<>();
        cachedRecord.put("id", "b195da39-ab96-46ca-97b4-9c99b7df4091");
        cachedRecord.put("model", "User");
        cachedRecord.put("details", nestedObject);

        JSONArray cachedMasterData = getOrCreateMasterArray(tenantId, moduleName, masterName);
        cachedMasterData.add(cachedRecord);

        Map<String, Map<String, JSONArray>> response = mdmsService.searchMaster(buildRequest(tenantId, moduleName, masterName));

        JSONArray responseMasterData = response.get(moduleName).get(masterName);
        Map<?, ?> responseRecord = (Map<?, ?>) responseMasterData.get(0);
        Map<?, ?> responseNestedObject = (Map<?, ?>) responseRecord.get("details");
        Map<?, ?> cachedResponseRecord = (Map<?, ?>) cachedMasterData.get(0);

        assertFalse(responseRecord.containsKey("id"));
        assertEquals("User", responseRecord.get("model"));
        assertEquals("nested-id", responseNestedObject.get("id"));
        assertTrue(cachedResponseRecord.containsKey("id"));
    }

    @Test
    public void searchMaster_shouldKeepTopLevelIdForFileBackedMasters() {
        String tenantId = "pb";
        String moduleName = "Advertisement";
        String masterName = "Advertisements";

        Map<String, Object> cachedRecord = new LinkedHashMap<>();
        cachedRecord.put("id", "36");
        cachedRecord.put("code", "GANTRY");
        cachedRecord.put("name", "Gantry");

        JSONArray cachedMasterData = getOrCreateMasterArray(tenantId, moduleName, masterName);
        cachedMasterData.add(cachedRecord);
        MDMSApplicationRunnerImpl.refreshMasterTopLevelIdState(tenantId, moduleName, masterName, cachedMasterData);

        Map<String, Map<String, JSONArray>> response = mdmsService.searchMaster(buildRequest(tenantId, moduleName, masterName));

        JSONArray responseMasterData = response.get(moduleName).get(masterName);
        Map<?, ?> responseRecord = (Map<?, ?>) responseMasterData.get(0);

        assertEquals("36", responseRecord.get("id"));
        assertEquals("GANTRY", responseRecord.get("code"));
    }

    private MdmsCriteriaReq buildRequest(String tenantId, String moduleName, String masterName) {
        MasterDetail masterDetail = new MasterDetail();
        masterDetail.setName(masterName);

        ArrayList<MasterDetail> masterDetails = new ArrayList<>();
        masterDetails.add(masterDetail);

        ModuleDetail moduleDetail = new ModuleDetail();
        moduleDetail.setModuleName(moduleName);
        moduleDetail.setMasterDetails(masterDetails);

        ArrayList<ModuleDetail> moduleDetails = new ArrayList<>();
        moduleDetails.add(moduleDetail);

        MdmsCriteria mdmsCriteria = new MdmsCriteria();
        mdmsCriteria.setTenantId(tenantId);
        mdmsCriteria.setModuleDetails(moduleDetails);

        MdmsCriteriaReq request = new MdmsCriteriaReq();
        request.setMdmsCriteria(mdmsCriteria);
        return request;
    }

    private JSONArray getOrCreateMasterArray(String tenantId, String moduleName, String masterName) {
        Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
        return tenantMap
                .computeIfAbsent(tenantId, key -> new HashMap<>())
                .computeIfAbsent(moduleName, key -> new HashMap<>())
                .computeIfAbsent(masterName, key -> new JSONArray());
    }
}
