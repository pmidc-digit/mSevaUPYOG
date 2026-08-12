package org.egov.infra.mdms.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.HashMap;
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

        // Initial Kafka message (Create/Save)
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

        // Updated Kafka message (Update with same ID but changed name)
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

        // Verify that record was updated in place and NO duplicate entry was created
        assertEquals(1, masterData.size());
        Map<?, ?> updatedRecord = (Map<?, ?>) masterData.get(0);
        assertEquals("ADVT.GANTRY_FIELD_FEE_000", updatedRecord.get("name"));
    }

    @Test
    public void testUpdateCache_InactivateRecord() {
        String tenantId = "pb.amritsar";
        String schemaCode = "ADVT.Gantry";
        String id = "fc20db08-2540-452e-9935-0569ecb2cc9f";

        // Initial record
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

        // Inactive message
        Map<String, Object> inactiveMdmsObj = new HashMap<>();
        inactiveMdmsObj.put("id", id);
        inactiveMdmsObj.put("tenantId", tenantId);
        inactiveMdmsObj.put("schemaCode", schemaCode);
        inactiveMdmsObj.put("isActive", false);

        Map<String, Object> inactiveKafkaMessage = new HashMap<>();
        inactiveKafkaMessage.put("Mdms", inactiveMdmsObj);

        mdmsCacheService.updateCache(inactiveKafkaMessage);

        // Verify record is removed
        assertEquals(0, masterData.size());
    }
}
