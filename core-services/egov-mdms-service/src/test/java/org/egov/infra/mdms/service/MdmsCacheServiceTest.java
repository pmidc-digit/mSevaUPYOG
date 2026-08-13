package org.egov.infra.mdms.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.egov.MDMSApplicationRunnerImpl;
import org.egov.infra.mdms.repository.MdmsDataRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import net.minidev.json.JSONArray;

@RunWith(MockitoJUnitRunner.class)
public class MdmsCacheServiceTest {

    @Mock
    private MdmsDataRepository mdmsDataRepository;

    private MdmsCacheService mdmsCacheService;

    @Before
    public void setUp() {
        mdmsCacheService = new MdmsCacheService(mdmsDataRepository);
        MDMSApplicationRunnerImpl.getTenantMap().clear();
    }

    @Test
    public void testUpdateCache_PreventDuplicateOnUpdate() {
        String tenantId = "pb.amritsar";
        String schemaCode = "ADVT.Gantry";
        String id = "fc20db08-2540-452e-9935-0569ecb2cc9f";

        Map<String, Object> initialRecordData = new HashMap<>();
        initialRecordData.put("id", id);
        initialRecordData.put("code", "ADVT.GANTRY_FIELD_FEE");
        initialRecordData.put("name", "ADVT.GANTRY_FIELD_FEE_00000");
        initialRecordData.put("order", "0");
        initialRecordData.put("isDebit", false);

        Map<String, Object> initialMdmsObj = new HashMap<>();
        initialMdmsObj.put("id", id);
        initialMdmsObj.put("tenantId", tenantId);
        initialMdmsObj.put("schemaCode", schemaCode);
        initialMdmsObj.put("uniqueIdentifier", "ADVT.GANTRY_FIELD_FEE");
        initialMdmsObj.put("isActive", true);
        initialMdmsObj.put("data", initialRecordData);

        Map<String, Object> initialKafkaMessage = new HashMap<>();
        initialKafkaMessage.put("Mdms", initialMdmsObj);

        mdmsCacheService.updateCache(initialKafkaMessage);

        Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
        JSONArray masterData = tenantMap.get(tenantId).get("ADVT").get("Gantry");

        assertNotNull(masterData);
        assertEquals(1, masterData.size());
        Map<?, ?> firstRecord = (Map<?, ?>) masterData.get(0);
        assertEquals("ADVT.GANTRY_FIELD_FEE_00000", firstRecord.get("name"));

        // Updated Kafka message (same ID, changed name)
        Map<String, Object> updatedRecordData = new HashMap<>();
        updatedRecordData.put("id", id);
        updatedRecordData.put("code", "ADVT.GANTRY_FIELD_FEE");
        updatedRecordData.put("name", "ADVT.GANTRY_FIELD_FEE_000");
        updatedRecordData.put("order", "0");
        updatedRecordData.put("isDebit", false);

        Map<String, Object> updatedMdmsObj = new HashMap<>();
        updatedMdmsObj.put("id", id);
        updatedMdmsObj.put("tenantId", tenantId);
        updatedMdmsObj.put("schemaCode", schemaCode);
        updatedMdmsObj.put("uniqueIdentifier", "ADVT.GANTRY_FIELD_FEE");
        updatedMdmsObj.put("isActive", true);
        updatedMdmsObj.put("data", updatedRecordData);

        Map<String, Object> updatedKafkaMessage = new HashMap<>();
        updatedKafkaMessage.put("Mdms", updatedMdmsObj);

        mdmsCacheService.updateCache(updatedKafkaMessage);

        assertEquals(1, masterData.size());
        Map<?, ?> updatedRecord = (Map<?, ?>) masterData.get(0);
        assertEquals("ADVT.GANTRY_FIELD_FEE_000", updatedRecord.get("name"));
    }

    @Test
    public void testUpdateCache_InactivateRecord() {
        String tenantId = "pb.amritsar";
        String schemaCode = "ADVT.Gantry";
        String id = "fc20db08-2540-452e-9935-0569ecb2cc9f";

        Map<String, Object> initialRecordData = new HashMap<>();
        initialRecordData.put("id", id);
        initialRecordData.put("code", "ADVT.GANTRY_FIELD_FEE");

        Map<String, Object> initialMdmsObj = new HashMap<>();
        initialMdmsObj.put("id", id);
        initialMdmsObj.put("tenantId", tenantId);
        initialMdmsObj.put("schemaCode", schemaCode);
        initialMdmsObj.put("isActive", true);
        initialMdmsObj.put("data", initialRecordData);

        Map<String, Object> initialKafkaMessage = new HashMap<>();
        initialKafkaMessage.put("Mdms", initialMdmsObj);

        mdmsCacheService.updateCache(initialKafkaMessage);

        JSONArray masterData = MDMSApplicationRunnerImpl.getTenantMap().get(tenantId).get("ADVT").get("Gantry");
        assertEquals(1, masterData.size());

        Map<String, Object> inactiveMdmsObj = new HashMap<>();
        inactiveMdmsObj.put("id", id);
        inactiveMdmsObj.put("tenantId", tenantId);
        inactiveMdmsObj.put("schemaCode", schemaCode);
        inactiveMdmsObj.put("isActive", false);

        Map<String, Object> inactiveKafkaMessage = new HashMap<>();
        inactiveKafkaMessage.put("Mdms", inactiveMdmsObj);

        mdmsCacheService.updateCache(inactiveKafkaMessage);

        assertEquals(0, masterData.size());
    }

    /**
     * Simulates the SecurityPolicy / WnSConnection scenario:
     * - File-based record loaded first: has 'model' field but NO 'id'
     * - DB record loaded via Kafka/updateCache: has 'id' (UUID) and
     *   top-level uniqueIdentifier = "WnSConnection" (a plain string from the DB column, matching 'model')
     * - Expectation: DB record REPLACES the file record (no duplicate).
     */
    @Test
    public void testDbLoad_SecurityPolicyNoDuplicate_MatchByModel() {
        String tenantId = "pb";
        String moduleName = "MDMS";
        String masterName = "SecurityPolicy";

        Map<String, Object> uniqueIdentifierMap = new LinkedHashMap<>();
        uniqueIdentifierMap.put("name", "applicationNo");
        uniqueIdentifierMap.put("jsonPath", "applicationNo");

        // File-loaded record: no 'id', uniqueIdentifier is a Map object
        Map<String, Object> fileRecord = new LinkedHashMap<>();
        fileRecord.put("model", "WnSConnection");
        fileRecord.put("uniqueIdentifier", uniqueIdentifierMap);
        fileRecord.put("attributes", Arrays.asList("ownerType", "mobileNumber"));

        JSONArray masterData = getOrCreateMasterArray(tenantId, moduleName, masterName);
        masterData.add(fileRecord);

        assertEquals("File record should be in cache", 1, masterData.size());

        // DB-loaded record (via Kafka): has 'id', uniqueIdentifier (top-level) = "WnSConnection"
        Map<String, Object> dbRecord = new LinkedHashMap<>();
        dbRecord.put("id", "0acf70a5-b27f-4df4-8172-f379673c5285");
        dbRecord.put("model", "WnSConnection");
        dbRecord.put("uniqueIdentifier", uniqueIdentifierMap);
        dbRecord.put("attributes", Arrays.asList("ownerType", "mobileNumber"));

        Map<String, Object> mdmsObj = new HashMap<>();
        mdmsObj.put("id", "0acf70a5-b27f-4df4-8172-f379673c5285");
        mdmsObj.put("tenantId", tenantId);
        mdmsObj.put("schemaCode", moduleName + "." + masterName);
        // DB uniqueidentifier column = plain string = value of 'model' field
        mdmsObj.put("uniqueIdentifier", "WnSConnection");
        mdmsObj.put("isActive", true);
        mdmsObj.put("data", dbRecord);

        Map<String, Object> kafkaMessage = new HashMap<>();
        kafkaMessage.put("Mdms", mdmsObj);

        mdmsCacheService.updateCache(kafkaMessage);

        assertEquals("Should be exactly 1 record (DB merged into file record)", 1, masterData.size());
        Map<?, ?> resultRecord = (Map<?, ?>) masterData.get(0);
        assertEquals("WnSConnection", resultRecord.get("model"));
        assertEquals("0acf70a5-b27f-4df4-8172-f379673c5285", resultRecord.get("id"));
    }

    @Test
    public void testDbLoad_SecurityPolicyNoDuplicate_FileRecordHasNoId() {
        String tenantId = "pb";
        String moduleName = "MDMS";
        String masterName = "SecurityPolicy";

        Map<String, Object> uniqueIdentifierMap = new LinkedHashMap<>();
        uniqueIdentifierMap.put("name", "applicationNo");
        uniqueIdentifierMap.put("jsonPath", "applicationNo");

        // File-loaded record (no id)
        Map<String, Object> fileRecord = new LinkedHashMap<>();
        fileRecord.put("model", "WnSConnection");
        fileRecord.put("uniqueIdentifier", uniqueIdentifierMap);

        JSONArray masterData = getOrCreateMasterArray(tenantId, moduleName, masterName);
        masterData.add(fileRecord);
        assertEquals(1, masterData.size());

        // Second record (from DB) - same model but different id
        Map<String, Object> dbData = new LinkedHashMap<>();
        dbData.put("model", "WnSConnection");
        dbData.put("uniqueIdentifier", uniqueIdentifierMap);

        Map<String, Object> mdmsObj = new HashMap<>();
        mdmsObj.put("id", "d5d9cbb5-d801-4bd3-955f-ef3c7d38e28a");
        mdmsObj.put("tenantId", tenantId);
        mdmsObj.put("schemaCode", moduleName + "." + masterName);
        mdmsObj.put("uniqueIdentifier", "WnSConnection");
        mdmsObj.put("isActive", true);
        mdmsObj.put("data", dbData);

        Map<String, Object> kafkaMessage = new HashMap<>();
        kafkaMessage.put("Mdms", mdmsObj);

        mdmsCacheService.updateCache(kafkaMessage);

        assertEquals("Should be exactly 1 record (no duplicate)", 1, masterData.size());
    }

    private JSONArray getOrCreateMasterArray(String tenantId, String moduleName, String masterName) {
        Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
        return tenantMap
                .computeIfAbsent(tenantId, k -> new HashMap<>())
                .computeIfAbsent(moduleName, k -> new HashMap<>())
                .computeIfAbsent(masterName, k -> new JSONArray());
    }
}
