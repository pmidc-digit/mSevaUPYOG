package org.egov.infra.mdms.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.when;

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
import org.springframework.test.util.ReflectionTestUtils;

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

    @Test
    public void testUpdateCache_UpdateExistingRecordByKafkaData() {
        String tenantId = "pb";
        String schemaCode = "ws-services-masters.billingPeriod";
        String moduleName = "ws-services-masters";
        String masterName = "billingPeriod";

        // Initial record in cache
        Map<String, Object> initialRecord = new LinkedHashMap<>();
        initialRecord.put("code", "Metered");
        initialRecord.put("connectionType", "Metered");
        initialRecord.put("billingCycle", "quarterly");
        initialRecord.put("active", true);

        JSONArray masterData = getOrCreateMasterArray(tenantId, moduleName, masterName);
        masterData.add(initialRecord);

        assertEquals(1, masterData.size());

        // Kafka update payload modifying billingCycle to monthly and adding taxPeriodFrom
        Map<String, Object> updatedData = new LinkedHashMap<>();
        updatedData.put("code", "Metered");
        updatedData.put("connectionType", "Metered");
        updatedData.put("billingCycle", "monthly");
        updatedData.put("taxPeriodFrom", 1759276800000L);
        updatedData.put("active", true);

        Map<String, Object> mdmsObj = new HashMap<>();
        mdmsObj.put("id", "billing-period-id-1");
        mdmsObj.put("tenantId", tenantId);
        mdmsObj.put("schemaCode", schemaCode);
        mdmsObj.put("uniqueIdentifier", "Metered");
        mdmsObj.put("isActive", true);
        mdmsObj.put("data", updatedData);

        Map<String, Object> kafkaMessage = new HashMap<>();
        kafkaMessage.put("Mdms", mdmsObj);

        // Process Kafka update
        mdmsCacheService.updateCache(kafkaMessage);

        // Verify record in cache was updated in place without duplicate
        assertEquals(1, masterData.size());
        Map<?, ?> cacheRecord = (Map<?, ?>) masterData.get(0);
        assertEquals("monthly", cacheRecord.get("billingCycle"));
        assertEquals(1759276800000L, cacheRecord.get("taxPeriodFrom"));
        assertEquals("Metered", cacheRecord.get("connectionType"));
    }

    @Test
    public void testUpdateCache_BulkListPayloadByKafkaData() {
        String tenantId = "pb";
        String schemaCode = "ws-services-masters.billingPeriod";
        String moduleName = "ws-services-masters";
        String masterName = "billingPeriod";

        JSONArray masterData = getOrCreateMasterArray(tenantId, moduleName, masterName);

        // Kafka update containing a List payload with 2 records
        Map<String, Object> rec1 = new LinkedHashMap<>();
        rec1.put("code", "Metered");
        rec1.put("connectionType", "Metered");
        rec1.put("billingCycle", "quarterly");

        Map<String, Object> rec2 = new LinkedHashMap<>();
        rec2.put("code", "Non Metered");
        rec2.put("connectionType", "Non Metered");
        rec2.put("billingCycle", "quarterly");

        Map<String, Object> mdmsObj = new HashMap<>();
        mdmsObj.put("tenantId", tenantId);
        mdmsObj.put("schemaCode", schemaCode);
        mdmsObj.put("isActive", true);
        mdmsObj.put("data", Arrays.asList(rec1, rec2));

        Map<String, Object> kafkaMessage = new HashMap<>();
        kafkaMessage.put("Mdms", mdmsObj);

        // Process Kafka message
        mdmsCacheService.updateCache(kafkaMessage);

        // Verify both records added to cache
        assertEquals(2, masterData.size());
        Map<?, ?> first = (Map<?, ?>) masterData.get(0);
        Map<?, ?> second = (Map<?, ?>) masterData.get(1);

        assertEquals("Metered", first.get("code"));
        assertEquals("Non Metered", second.get("code"));
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

    @Test
    public void testUpdateCache_ReplacesWholeRecordAndRefreshesTopLevelIdTracking() {
        String tenantId = "pb";
        String moduleName = "tenant";
        String masterName = "tenants";
        String schemaCode = moduleName + "." + masterName;
        String id = "tenant-row-1";

        Map<String, Object> fileRecord = new LinkedHashMap<>();
        fileRecord.put("id", id);
        fileRecord.put("code", "pb.test");
        fileRecord.put("name", "Old Name");
        fileRecord.put("obsolete", "remove-me");

        JSONArray masterData = getOrCreateMasterArray(tenantId, moduleName, masterName);
        masterData.add(fileRecord);

        Map<String, Object> dbRecord = new LinkedHashMap<>();
        dbRecord.put("code", "pb.test");
        dbRecord.put("name", "New Name");

        Map<String, Object> mdmsObj = new HashMap<>();
        mdmsObj.put("id", id);
        mdmsObj.put("tenantId", tenantId);
        mdmsObj.put("schemaCode", schemaCode);
        mdmsObj.put("uniqueIdentifier", "pb.test");
        mdmsObj.put("isActive", true);
        mdmsObj.put("data", dbRecord);

        Map<String, Object> kafkaMessage = new HashMap<>();
        kafkaMessage.put("Mdms", mdmsObj);

        mdmsCacheService.updateCache(kafkaMessage);

        assertEquals(1, masterData.size());
        Map<?, ?> updatedRecord = (Map<?, ?>) masterData.get(0);
        assertEquals("New Name", updatedRecord.get("name"));
        assertEquals("pb.test", updatedRecord.get("code"));
        assertEquals(true, updatedRecord.containsKey("id"));
        assertEquals(true, updatedRecord.containsKey("obsolete"));
    }

    @Test
    public void testLoadAndMergeDbData_ReplacesMasterAndRefreshesTopLevelIdTracking() {
        String tenantId = "pb";
        String moduleName = "tenant";
        String masterName = "tenants";

        Map<String, Object> fileRecord = new LinkedHashMap<>();
        fileRecord.put("id", "file-id");
        fileRecord.put("code", "pb.test");

        JSONArray masterData = getOrCreateMasterArray(tenantId, moduleName, masterName);
        masterData.add(fileRecord);

        Map<String, Object> dbRecord = new LinkedHashMap<>();
        dbRecord.put("code", "pb.test");
        dbRecord.put("name", "DB Name");

        Map<String, Object> dbRow = new HashMap<>();
        dbRow.put("tenantid", tenantId);
        dbRow.put("schemacode", moduleName + "." + masterName);
        dbRow.put("data", dbRecord);

        when(mdmsDataRepository.searchAll()).thenReturn(Arrays.asList(dbRow));
        ReflectionTestUtils.setField(mdmsCacheService, "dbLoadEnabled", true);

        mdmsCacheService.loadAndMergeDbData();

        JSONArray currentMasterData = MDMSApplicationRunnerImpl.getTenantMap().get(tenantId).get(moduleName).get(masterName);
        assertEquals(1, currentMasterData.size());
        Map<?, ?> replacedRecord = (Map<?, ?>) currentMasterData.get(0);
        assertEquals("DB Name", replacedRecord.get("name"));
        assertEquals(true, replacedRecord.containsKey("id"));
    }

    @Test
    public void testLoadAndMergeDbData_PreservesExistingFileRecordsAndUpdatesMatchingDbRecords() {
        String tenantId = "pb";

        // File-loaded record in tenant.tenants
        JSONArray fileTenantMaster = getOrCreateMasterArray(tenantId, "tenant", "tenants");
        Map<String, Object> fileTenantRecord = new LinkedHashMap<>();
        fileTenantRecord.put("code", "pb.test");
        fileTenantRecord.put("name", "File Name");
        fileTenantMaster.add(fileTenantRecord);

        // File-loaded records in BillingService.BusinessService (TL and ADVT.Hoardings)
        JSONArray fileBusinessServices = getOrCreateMasterArray(tenantId, "BillingService", "BusinessService");
        Map<String, Object> tlRecord = new LinkedHashMap<>();
        tlRecord.put("code", "TL");
        tlRecord.put("businessService", "TradeLicense");
        fileBusinessServices.add(tlRecord);

        Map<String, Object> advtFileRecord = new LinkedHashMap<>();
        advtFileRecord.put("code", "ADVT.Hoardings");
        advtFileRecord.put("businessService", "Advertisement Tax.Hoardings");
        advtFileRecord.put("isVoucherCreationEnabled", false);
        fileBusinessServices.add(advtFileRecord);

        // DB record for ADVT.Hoardings (updated voucher creation setting)
        Map<String, Object> dbAdvtRecord = new LinkedHashMap<>();
        dbAdvtRecord.put("code", "ADVT.Hoardings");
        dbAdvtRecord.put("businessService", "Advertisement Tax.Hoardings");
        dbAdvtRecord.put("isVoucherCreationEnabled", true);

        Map<String, Object> dbRow = new HashMap<>();
        dbRow.put("tenantid", tenantId);
        dbRow.put("schemacode", "BillingService.BusinessService");
        dbRow.put("data", dbAdvtRecord);

        when(mdmsDataRepository.searchAll()).thenReturn(Arrays.asList(dbRow));
        ReflectionTestUtils.setField(mdmsCacheService, "dbLoadEnabled", true);

        mdmsCacheService.loadAndMergeDbData();

        Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
        
        // Assert that tenant.tenants from file is STILL INTACT (not present in DB)
        assertEquals(true, tenantMap.get(tenantId).containsKey("tenant"));
        assertEquals(1, tenantMap.get(tenantId).get("tenant").get("tenants").size());

        // Assert that BusinessService array still has BOTH TL (from file) and updated ADVT.Hoardings (from DB)
        JSONArray updatedBusinessServices = tenantMap.get(tenantId).get("BillingService").get("BusinessService");
        assertEquals(2, updatedBusinessServices.size());

        Map<?, ?> firstBs = (Map<?, ?>) updatedBusinessServices.get(0);
        assertEquals("TL", firstBs.get("code"));

        Map<?, ?> secondBs = (Map<?, ?>) updatedBusinessServices.get(1);
        assertEquals("ADVT.Hoardings", secondBs.get("code"));
        assertEquals(true, secondBs.get("isVoucherCreationEnabled"));
    }

    @Test
    public void testLoadAndMergeDbData_DeepMergeNestedCityAndTenantFields() {
        String tenantId = "pb";

        // Existing file record with top-level fields and nested city fields
        Map<String, Object> existingCity = new LinkedHashMap<>();
        existingCity.put("name", "Itbarnala");
        existingCity.put("code", "2011");
        existingCity.put("districtName", "Barnala");

        Map<String, Object> existingTenant = new LinkedHashMap<>();
        existingTenant.put("code", "pb.itbarnala");
        existingTenant.put("name", "Improvement Trust Barnala");
        existingTenant.put("emailId", "info@barnala.gov");
        existingTenant.put("city", existingCity);

        JSONArray tenantMaster = getOrCreateMasterArray(tenantId, "tenant", "tenants");
        tenantMaster.add(existingTenant);

        // DB record updating address and city.municipalityName
        Map<String, Object> dbCity = new LinkedHashMap<>();
        dbCity.put("code", "2011");
        dbCity.put("municipalityName", "Improvement Trust Barnala");

        Map<String, Object> dbTenant = new LinkedHashMap<>();
        dbTenant.put("code", "pb.itbarnala");
        dbTenant.put("address", "22 Acre Scheme, Barnala");
        dbTenant.put("city", dbCity);

        Map<String, Object> dbRow = new HashMap<>();
        dbRow.put("tenantid", tenantId);
        dbRow.put("schemacode", "tenant.tenants");
        dbRow.put("data", dbTenant);

        when(mdmsDataRepository.searchAll()).thenReturn(Arrays.asList(dbRow));
        ReflectionTestUtils.setField(mdmsCacheService, "dbLoadEnabled", true);

        mdmsCacheService.loadAndMergeDbData();

        JSONArray resultMaster = MDMSApplicationRunnerImpl.getTenantMap().get(tenantId).get("tenant").get("tenants");
        assertEquals(1, resultMaster.size());

        Map<?, ?> mergedTenant = (Map<?, ?>) resultMaster.get(0);
        // Preserved from file
        assertEquals("Improvement Trust Barnala", mergedTenant.get("name"));
        assertEquals("info@barnala.gov", mergedTenant.get("emailId"));

        // Updated/Added from DB
        assertEquals("22 Acre Scheme, Barnala", mergedTenant.get("address"));

        // Nested city deep-merged
        Map<?, ?> mergedCity = (Map<?, ?>) mergedTenant.get("city");
        assertEquals("Itbarnala", mergedCity.get("name"));
        assertEquals("Barnala", mergedCity.get("districtName"));
        assertEquals("Improvement Trust Barnala", mergedCity.get("municipalityName"));
    }

    @Test
    public void testLoadAndMergeDbData_DifferentCityCodes201And2011DoNotOverlap() {
        String tenantId = "pb";

        // File record for 201 (pb.barnala)
        Map<String, Object> city201 = new LinkedHashMap<>();
        city201.put("code", "201");
        city201.put("name", "Barnala");
        city201.put("districtTenantCode", "pb.barnala");

        Map<String, Object> tenant201 = new LinkedHashMap<>();
        tenant201.put("code", "pb.barnala");
        tenant201.put("name", "Barnala MC");
        tenant201.put("city", city201);

        JSONArray tenantMaster = getOrCreateMasterArray(tenantId, "tenant", "tenants");
        tenantMaster.add(tenant201);

        // DB record for 2011 (pb.itbarnala) sharing the same districtTenantCode "pb.barnala"
        Map<String, Object> city2011 = new LinkedHashMap<>();
        city2011.put("code", "2011");
        city2011.put("name", "Itbarnala");
        city2011.put("districtTenantCode", "pb.barnala");

        Map<String, Object> tenant2011 = new LinkedHashMap<>();
        tenant2011.put("code", "pb.itbarnala");
        tenant2011.put("name", "Improvement Trust Barnala");
        tenant2011.put("city", city2011);

        Map<String, Object> dbRow = new HashMap<>();
        dbRow.put("tenantid", tenantId);
        dbRow.put("schemacode", "tenant.tenants");
        dbRow.put("data", tenant2011);

        when(mdmsDataRepository.searchAll()).thenReturn(Arrays.asList(dbRow));
        ReflectionTestUtils.setField(mdmsCacheService, "dbLoadEnabled", true);

        mdmsCacheService.loadAndMergeDbData();

        JSONArray resultMaster = MDMSApplicationRunnerImpl.getTenantMap().get(tenantId).get("tenant").get("tenants");
        
        // Should contain BOTH records (size 2), 201 should NOT be replaced by 2011 even though both have districtTenantCode="pb.barnala"!
        assertEquals(2, resultMaster.size());

        Map<?, ?> first = (Map<?, ?>) resultMaster.get(0);
        Map<?, ?> second = (Map<?, ?>) resultMaster.get(1);

        assertEquals("pb.barnala", first.get("code"));
        assertEquals("Barnala MC", first.get("name"));
        assertEquals("pb.itbarnala", second.get("code"));
        assertEquals("Improvement Trust Barnala", second.get("name"));
    }

    @Test
    public void testLoadAndMergeDbData_MismatchedTopLevelCodeDoesNotOverwrite() {
        String tenantId = "pb";

        // File record for pb.barnala with city code 201
        Map<String, Object> city201 = new LinkedHashMap<>();
        city201.put("code", "201");
        city201.put("name", "Barnala");

        Map<String, Object> tenant201 = new LinkedHashMap<>();
        tenant201.put("code", "pb.barnala");
        tenant201.put("name", "Barnala MC");
        tenant201.put("city", city201);

        JSONArray tenantMaster = getOrCreateMasterArray(tenantId, "tenant", "tenants");
        tenantMaster.add(tenant201);

        // Corrupted DB record for pb.itbarnala having city code 201
        Map<String, Object> cityCorrupted = new LinkedHashMap<>();
        cityCorrupted.put("code", "201"); // Mismatched nested city code
        cityCorrupted.put("name", "Itbarnala");

        Map<String, Object> tenant2011 = new LinkedHashMap<>();
        tenant2011.put("code", "pb.itbarnala");
        tenant2011.put("name", "Improvement Trust Barnala");
        tenant2011.put("city", cityCorrupted);

        Map<String, Object> dbRow = new HashMap<>();
        dbRow.put("tenantid", tenantId);
        dbRow.put("schemacode", "tenant.tenants");
        dbRow.put("data", tenant2011);

        when(mdmsDataRepository.searchAll()).thenReturn(Arrays.asList(dbRow));
        ReflectionTestUtils.setField(mdmsCacheService, "dbLoadEnabled", true);

        mdmsCacheService.loadAndMergeDbData();

        JSONArray resultMaster = MDMSApplicationRunnerImpl.getTenantMap().get(tenantId).get("tenant").get("tenants");

        // Top-level code mismatch ("pb.barnala" vs "pb.itbarnala") MUST prevent pb.barnala from being overwritten!
        assertEquals(2, resultMaster.size());

        Map<?, ?> first = (Map<?, ?>) resultMaster.get(0);
        Map<?, ?> second = (Map<?, ?>) resultMaster.get(1);

        assertEquals("pb.barnala", first.get("code"));
        assertEquals("Barnala MC", first.get("name"));
        assertEquals("pb.itbarnala", second.get("code"));
        assertEquals("Improvement Trust Barnala", second.get("name"));
    }

    private JSONArray getOrCreateMasterArray(String tenantId, String moduleName, String masterName) {
        Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
        return tenantMap
                .computeIfAbsent(tenantId, k -> new HashMap<>())
                .computeIfAbsent(moduleName, k -> new HashMap<>())
                .computeIfAbsent(masterName, k -> new JSONArray());
    }
}
