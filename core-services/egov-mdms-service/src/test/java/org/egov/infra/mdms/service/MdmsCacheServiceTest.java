package org.egov.infra.mdms.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
        dbRow.put("id", "db-uuid-abc123");
        dbRow.put("tenantid", tenantId);
        dbRow.put("schemacode", moduleName + "." + masterName);
        dbRow.put("data", dbRecord);

        when(mdmsDataRepository.searchAll()).thenReturn(Arrays.asList(dbRow));
        ReflectionTestUtils.setField(mdmsCacheService, "dbLoadEnabled", true);

        mdmsCacheService.loadAndMergeDbData();

        JSONArray currentMasterData = MDMSApplicationRunnerImpl.getTenantMap().get(tenantId).get(moduleName).get(masterName);
        // File record is cleared; only DB record is present
        assertEquals(1, currentMasterData.size());
        Map<?, ?> replacedRecord = (Map<?, ?>) currentMasterData.get(0);
        assertEquals("DB Name", replacedRecord.get("name"));
        // id is injected from the DB row
        assertEquals(true, replacedRecord.containsKey("id"));
        assertEquals("db-uuid-abc123", replacedRecord.get("id"));
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

        // Assert that BusinessService master array is replaced by authoritative DB records for BusinessService
        JSONArray updatedBusinessServices = tenantMap.get(tenantId).get("BillingService").get("BusinessService");
        assertEquals(1, updatedBusinessServices.size());

        Map<?, ?> firstBs = (Map<?, ?>) updatedBusinessServices.get(0);
        assertEquals("ADVT.Hoardings", firstBs.get("code"));
        assertEquals(true, firstBs.get("isVoucherCreationEnabled"));
    }

    @Test
    public void testLoadAndMergeDbData_DbRecordReplacesFileMasterOnLoad() {
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

        // DB record with address and partial city
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
        // File master was cleared; only the DB record is present
        assertEquals(1, resultMaster.size());

        Map<?, ?> dbOnlyRecord = (Map<?, ?>) resultMaster.get(0);
        // Only DB fields are present — file-only fields are gone since master was replaced
        assertEquals("pb.itbarnala", dbOnlyRecord.get("code"));
        assertEquals("22 Acre Scheme, Barnala", dbOnlyRecord.get("address"));
        assertNull("File-only 'name' field must not survive master replacement", dbOnlyRecord.get("name"));
        assertNull("File-only 'emailId' field must not survive master replacement", dbOnlyRecord.get("emailId"));

        // Nested city comes fully from DB
        Map<?, ?> mergedCity = (Map<?, ?>) dbOnlyRecord.get("city");
        assertEquals("2011", mergedCity.get("code"));
        assertEquals("Improvement Trust Barnala", mergedCity.get("municipalityName"));
        assertNull("districtName was file-only, must not be present", mergedCity.get("districtName"));
    }

    @Test
    public void testLoadAndMergeDbData_DbMasterReplacesFileMaster_OnlyDbRecordRetained() {
        String tenantId = "pb";

        // File record for 201 (pb.barnala) - this will be CLEARED when DB data loads
        Map<String, Object> city201 = new LinkedHashMap<>();
        city201.put("code", "201");
        city201.put("name", "Barnala");

        Map<String, Object> tenant201 = new LinkedHashMap<>();
        tenant201.put("code", "pb.barnala");
        tenant201.put("name", "Barnala MC");
        tenant201.put("city", city201);

        JSONArray tenantMaster = getOrCreateMasterArray(tenantId, "tenant", "tenants");
        tenantMaster.add(tenant201);

        // DB record for 2011 (pb.itbarnala) — different tenant code
        Map<String, Object> city2011 = new LinkedHashMap<>();
        city2011.put("code", "2011");
        city2011.put("name", "Itbarnala");

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

        // File master was cleared on first DB record; only pb.itbarnala (DB) survives
        assertEquals(1, resultMaster.size());

        Map<?, ?> only = (Map<?, ?>) resultMaster.get(0);
        assertEquals("pb.itbarnala", only.get("code"));
        assertEquals("Improvement Trust Barnala", only.get("name"));
    }

    @Test
    public void testLoadAndMergeDbData_DbMasterClearsFileMaster_EvenIfCityCodeDiffers() {
        String tenantId = "pb";

        // File record for pb.barnala
        Map<String, Object> city201 = new LinkedHashMap<>();
        city201.put("code", "201");
        city201.put("name", "Barnala");

        Map<String, Object> tenant201 = new LinkedHashMap<>();
        tenant201.put("code", "pb.barnala");
        tenant201.put("name", "Barnala MC");
        tenant201.put("city", city201);

        JSONArray tenantMaster = getOrCreateMasterArray(tenantId, "tenant", "tenants");
        tenantMaster.add(tenant201);

        // DB record for a DIFFERENT tenant pb.itbarnala
        Map<String, Object> cityCorrupted = new LinkedHashMap<>();
        cityCorrupted.put("code", "201");
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

        // File master (pb.barnala) is cleared when DB loads tenant.tenants; only DB record survives
        assertEquals(1, resultMaster.size());

        Map<?, ?> only = (Map<?, ?>) resultMaster.get(0);
        assertEquals("pb.itbarnala", only.get("code"));
        assertEquals("Improvement Trust Barnala", only.get("name"));
    }



    private JSONArray getOrCreateMasterArray(String tenantId, String moduleName, String masterName) {
        Map<String, Map<String, Map<String, JSONArray>>> tenantMap = MDMSApplicationRunnerImpl.getTenantMap();
        return tenantMap
                .computeIfAbsent(tenantId, k -> new HashMap<>())
                .computeIfAbsent(moduleName, k -> new HashMap<>())
                .computeIfAbsent(masterName, k -> new JSONArray());
    }
}
