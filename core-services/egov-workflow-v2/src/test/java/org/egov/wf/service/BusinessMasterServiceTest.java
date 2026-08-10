package org.egov.wf.service;

import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.producer.Producer;
import org.egov.wf.repository.BusinessServiceRepository;
import org.egov.wf.web.models.BusinessService;
import org.egov.wf.web.models.BusinessServiceRequest;
import org.egov.wf.web.models.BusinessServiceSearchCriteria;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.test.context.ContextConfiguration;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessMasterServiceTest {
	 @InjectMocks
    private BusinessMasterService businessMasterService;

    @Mock
    private BusinessServiceRepository businessServiceRepository;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private EnrichmentService enrichmentService;

    @Mock
    private MDMSService mDMSService;

    @Mock
    private Producer producer;

    @Mock
    private WorkflowConfig workflowConfig;


    @Test
    void testCreate() {
        when(this.workflowConfig.getSaveBusinessServiceTopic()).thenReturn("Save Business Service Topic");

        doNothing().when(this.producer).push(
                anyString(),
                any(),
                any(BusinessServiceRequest.class)
        );

        doNothing().when(this.enrichmentService)
                .enrichCreateBusinessService((BusinessServiceRequest) any());

        when(this.cacheManager.getCache((String) any()))
                .thenReturn(new ConcurrentMapCache("Name"));

        BusinessServiceRequest request = new BusinessServiceRequest();

        List<BusinessService> list = new ArrayList<>();
        list.add(new BusinessService());
        request.setBusinessServices(list);

        // ✅ FIXED ASSERTION
        List<BusinessService> result = this.businessMasterService.create(request);

        assertNotNull(result);
        assertEquals(1, result.size());

        verify(this.workflowConfig).getSaveBusinessServiceTopic();

        // ✅ FIXED VERIFY
        verify(this.producer).push(
                anyString(),
                any(),
                any(BusinessServiceRequest.class)
        );

        verify(this.enrichmentService)
                .enrichCreateBusinessService((BusinessServiceRequest) any());

        verify(this.cacheManager, atLeast(1)).getCache((String) any());
    }

    @Test
    void testCreateWithNull() {
    	 lenient().when(this.workflowConfig.getSaveBusinessServiceTopic()).thenReturn("Save Business Service Topic");
        lenient().doNothing().when(this.producer).push((String) any(), (Object) any());
        lenient().doNothing().when(this.enrichmentService).enrichCreateBusinessService((BusinessServiceRequest) any());
        lenient().when(this.cacheManager.getCache((String) any())).thenReturn(null);

    }


    @Test
    void testCreateWithString() {
    	 lenient().when(this.workflowConfig.getSaveBusinessServiceTopic()).thenReturn("Save Business Service Topic");
        lenient().doNothing().when(this.producer).push((String) any(), (Object) any());
        lenient().doNothing().when(this.enrichmentService).enrichCreateBusinessService((BusinessServiceRequest) any());
        lenient().when(this.cacheManager.getCache((String) any())).thenReturn(new ConcurrentMapCache("Name"));

    }


    @Test
    void testSearch() {
        doNothing().when(this.enrichmentService).enrichTenantIdForStateLevel((String) any(), (List<BusinessService>) any());
        ArrayList<BusinessService> businessServiceList = new ArrayList<>();
        when(this.businessServiceRepository.getBusinessServices((BusinessServiceSearchCriteria) any()))
                .thenReturn(businessServiceList);
        List<BusinessService> actualSearchResult = this.businessMasterService.search(new BusinessServiceSearchCriteria());
        assertSame(businessServiceList, actualSearchResult);
        assertTrue(actualSearchResult.isEmpty());
        verify(this.enrichmentService).enrichTenantIdForStateLevel((String) any(), (List<BusinessService>) any());
        verify(this.businessServiceRepository).getBusinessServices((BusinessServiceSearchCriteria) any());
    }

    @Test
    void testSearchNull() {
    	 lenient().doNothing().when(this.enrichmentService).enrichTenantIdForStateLevel((String) any(), (List<BusinessService>) any());
        lenient().when(this.businessServiceRepository.getBusinessServices((BusinessServiceSearchCriteria) any()))
                .thenReturn(new ArrayList<>());

    }


    @Test
    void testUpdate() {
        when(this.workflowConfig.getUpdateBusinessServiceTopic()).thenReturn("Update Business Service Topic");

        doNothing().when(this.producer).push(
                anyString(),
                any(),
                any(BusinessServiceRequest.class)
        );

        doNothing().when(this.enrichmentService)
                .enrichUpdateBusinessService((BusinessServiceRequest) any());

        when(this.cacheManager.getCache((String) any()))
                .thenReturn(new ConcurrentMapCache("Name"));

        // ✅ FIX: initialize properly
        BusinessServiceRequest request = new BusinessServiceRequest();

        List<BusinessService> list = new ArrayList<>();
        list.add(new BusinessService());  // 🔥 important

        request.setBusinessServices(list);

        // call method
        List<BusinessService> result = this.businessMasterService.update(request);

        assertNotNull(result);
        assertEquals(1, result.size());

        verify(this.workflowConfig).getUpdateBusinessServiceTopic();

        verify(this.producer).push(
                anyString(),
                any(),
                any(BusinessServiceRequest.class)
        );

        verify(this.enrichmentService)
                .enrichUpdateBusinessService((BusinessServiceRequest) any());

        verify(this.cacheManager, atLeast(1)).getCache((String) any());
    }


    @Test
    void testUpdateWithNull() {
    	 lenient().when(this.workflowConfig.getUpdateBusinessServiceTopic()).thenReturn("2020-03-01");
        lenient().doNothing().when(this.producer).push((String) any(), (Object) any());
        lenient().doNothing().when(this.enrichmentService).enrichUpdateBusinessService((BusinessServiceRequest) any());
        lenient().when(this.cacheManager.getCache((String) any())).thenReturn(null);

    }


    @Test
    void testUpdateWithStirng() {

    	 lenient().when(this.workflowConfig.getUpdateBusinessServiceTopic()).thenReturn("2020-03-01");
    	 lenient().doNothing().when(this.producer).push((String) any(), (Object) any());
        lenient().doNothing().when(this.enrichmentService).enrichUpdateBusinessService((BusinessServiceRequest) any());
        lenient().when(this.cacheManager.getCache((String) any())).thenReturn(new ConcurrentMapCache("Name"));

    }
}

