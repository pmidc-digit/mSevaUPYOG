package org.egov.wf.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.User;
import org.egov.tracer.model.CustomException;
import org.egov.wf.config.WorkflowConfig;
import org.egov.wf.repository.BusinessServiceRepository;
import org.egov.wf.repository.WorKflowRepository;
import org.egov.wf.util.WorkflowUtil;
import org.egov.wf.validator.WorkflowValidator;
import org.egov.wf.web.models.ProcessInstance;
import org.egov.wf.web.models.ProcessInstanceRequest;
import org.egov.wf.web.models.ProcessInstanceSearchCriteria;
import org.egov.wf.web.models.ProcessStateAndAction;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class WorkflowServiceTest {
    @Mock
    private BusinessMasterService businessMasterService;

    @Mock
    private BusinessServiceRepository businessServiceRepository;

    @Mock
    private EnrichmentService enrichmentService;

    @Mock
    private MDMSService mDMSService;

    @Mock
    private StatusUpdateService statusUpdateService;

    @Mock
    private TransitionService transitionService;

    @Mock
    private WorKflowRepository worKflowRepository;

    @Mock
    private WorkflowConfig workflowConfig;

    @InjectMocks
    private WorkflowService workflowService;

    @Mock
    private WorkflowUtil workflowUtil;

    @Mock
    private WorkflowValidator workflowValidator;


    @Test
    void testTransition() {
        doNothing().when(this.workflowValidator)
                .validateRequest((org.egov.common.contract.request.RequestInfo) any(), (List<ProcessStateAndAction>) any());
        when(this.transitionService.getProcessStateAndActions((List<ProcessInstance>) any(), (Boolean) any()))
                .thenReturn(new ArrayList<>());
        doNothing().when(this.statusUpdateService)
                .updateStatus((org.egov.common.contract.request.RequestInfo) any(), (List<ProcessStateAndAction>) any());
        doNothing().when(this.enrichmentService)
                .enrichProcessRequest((org.egov.common.contract.request.RequestInfo) any(),
                        (List<ProcessStateAndAction>) any());
        assertNull(this.workflowService.transition(new ProcessInstanceRequest()));
        verify(this.workflowValidator).validateRequest((org.egov.common.contract.request.RequestInfo) any(),
                (List<ProcessStateAndAction>) any());
        verify(this.transitionService).getProcessStateAndActions((List<ProcessInstance>) any(), (Boolean) any());
        verify(this.statusUpdateService).updateStatus((org.egov.common.contract.request.RequestInfo) any(),
                (List<ProcessStateAndAction>) any());
        verify(this.enrichmentService).enrichProcessRequest((org.egov.common.contract.request.RequestInfo) any(),
                (List<ProcessStateAndAction>) any());
    }


    @Test
    void testTransitionWithErrorCode() {
    	lenient().doNothing().when(this.workflowValidator)
                .validateRequest((org.egov.common.contract.request.RequestInfo) any(), (List<ProcessStateAndAction>) any());
        lenient().when(this.transitionService.getProcessStateAndActions((List<ProcessInstance>) any(), (Boolean) any()))
                .thenReturn(new ArrayList<>());
        lenient().doNothing().when(this.statusUpdateService)
                .updateStatus((org.egov.common.contract.request.RequestInfo) any(), (List<ProcessStateAndAction>) any());
        lenient().doThrow(new CustomException("Code", "An error occurred")).when(this.enrichmentService)
                .enrichProcessRequest((org.egov.common.contract.request.RequestInfo) any(),
                        (List<ProcessStateAndAction>) any());
        assertThrows(CustomException.class, () -> this.workflowService.transition(new ProcessInstanceRequest()));
        verify(this.transitionService).getProcessStateAndActions((List<ProcessInstance>) any(), (Boolean) any());
        verify(this.enrichmentService).enrichProcessRequest((org.egov.common.contract.request.RequestInfo) any(),
                (List<ProcessStateAndAction>) any());
    }


    @Test
    void testTransitions() {
        doNothing().when(this.workflowValidator)
                .validateRequest((org.egov.common.contract.request.RequestInfo) any(), (List<ProcessStateAndAction>) any());
        when(this.transitionService.getProcessStateAndActions((List<ProcessInstance>) any(), (Boolean) any()))
                .thenReturn(new ArrayList<>());
        doThrow(new CustomException("Code", "An error occurred")).when(this.statusUpdateService)
                .updateStatus((org.egov.common.contract.request.RequestInfo) any(), (List<ProcessStateAndAction>) any());
        doNothing().when(this.enrichmentService)
                .enrichProcessRequest((org.egov.common.contract.request.RequestInfo) any(),
                        (List<ProcessStateAndAction>) any());
        assertThrows(CustomException.class, () -> this.workflowService.transition(new ProcessInstanceRequest()));
        verify(this.workflowValidator).validateRequest((org.egov.common.contract.request.RequestInfo) any(),
                (List<ProcessStateAndAction>) any());
        verify(this.transitionService).getProcessStateAndActions((List<ProcessInstance>) any(), (Boolean) any());
        verify(this.statusUpdateService).updateStatus((org.egov.common.contract.request.RequestInfo) any(),
                (List<ProcessStateAndAction>) any());
        verify(this.enrichmentService).enrichProcessRequest((org.egov.common.contract.request.RequestInfo) any(),
                (List<ProcessStateAndAction>) any());
    }


    @Test
    void testSearch() {
        ArrayList<ProcessInstance> processInstanceList = new ArrayList<>();
        when(this.worKflowRepository.getProcessInstances((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList);
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        List<ProcessInstance> actualSearchResult = this.workflowService.search(requestInfo, processInstanceSearchCriteria);
        assertSame(processInstanceList, actualSearchResult);
        assertTrue(actualSearchResult.isEmpty());
        verify(this.worKflowRepository).getProcessInstances((ProcessInstanceSearchCriteria) any());
    }


    @Test
    void testSearchWithActualSearchResult() {
        ArrayList<ProcessInstance> processInstanceList = new ArrayList<>();
        processInstanceList.add(new ProcessInstance());
        when(this.worKflowRepository.getProcessInstances((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList);
        when(this.enrichmentService.enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any()))
                .thenReturn(new ArrayList<>());
        doNothing().when(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        doNothing().when(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        List<ProcessInstance> actualSearchResult = this.workflowService.search(requestInfo, processInstanceSearchCriteria);
        assertSame(processInstanceList, actualSearchResult);
        assertEquals(1, actualSearchResult.size());
        verify(this.worKflowRepository).getProcessInstances((ProcessInstanceSearchCriteria) any());
        verify(this.enrichmentService).enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        verify(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        verify(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());
    }


    @Test
    void testSearchWithErrorCode() {
        doThrow(new CustomException("Code", "An error occurred")).when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());

        ArrayList<ProcessInstance> processInstanceList = new ArrayList<>();
        processInstanceList.add(new ProcessInstance());
        lenient().when(this.worKflowRepository.getProcessInstances((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList);
        lenient().when(this.enrichmentService.enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any()))
                .thenReturn(new ArrayList<>());
        lenient().doNothing().when(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        lenient().doNothing().when(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        RequestInfo requestInfo = new RequestInfo();
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        lenient().doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertThrows(CustomException.class, () -> this.workflowService.search(requestInfo, processInstanceSearchCriteria));
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void testSearchWithEmpty() {
        doNothing().when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());

        ArrayList<ProcessInstance> processInstanceList = new ArrayList<>();
        processInstanceList.add(new ProcessInstance());
        ArrayList<ProcessInstance> processInstanceList1 = new ArrayList<>();
        lenient().when(this.worKflowRepository.getProcessInstancesForUserInbox((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList1);
        lenient().when(this.worKflowRepository.getProcessInstances((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList);
        lenient().when(this.enrichmentService.enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any()))
                .thenReturn(new ArrayList<>());
        lenient().doNothing().when(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        lenient().doNothing().when(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());

        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        List<ProcessInstance> actualSearchResult = this.workflowService.search(requestInfo, processInstanceSearchCriteria);
        assertSame(processInstanceList1, actualSearchResult);
        assertTrue(actualSearchResult.isEmpty());
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getProcessInstancesForUserInbox((ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria, atLeast(1)).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void TestSearch() {
        doNothing().when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());

        ArrayList<ProcessInstance> processInstanceList = new ArrayList<>();
        processInstanceList.add(new ProcessInstance());

        ArrayList<ProcessInstance> processInstanceList1 = new ArrayList<>();
        processInstanceList1.add(new ProcessInstance());
        lenient().when(this.worKflowRepository.getProcessInstancesForUserInbox((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList1);
        lenient().when(this.worKflowRepository.getProcessInstances((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList);
        lenient().when(this.enrichmentService.enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any()))
                .thenReturn(new ArrayList<>());
        doNothing().when(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        doNothing().when(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());

        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertEquals(1, this.workflowService.search(requestInfo, processInstanceSearchCriteria).size());
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getProcessInstancesForUserInbox((ProcessInstanceSearchCriteria) any());
        verify(this.enrichmentService).enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        verify(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        verify(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria, atLeast(1)).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void testCount() {
        when(this.worKflowRepository.getProcessInstancesCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
        when(this.mDMSService.fetchSlotPercentageForNearingSla((RequestInfo) any())).thenReturn(1);
        when(this.businessMasterService.getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any())).thenReturn(1L);
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertEquals(3, this.workflowService.count(requestInfo, processInstanceSearchCriteria).intValue());
        verify(this.worKflowRepository).getProcessInstancesCount((ProcessInstanceSearchCriteria) any());
        verify(this.mDMSService).fetchSlotPercentageForNearingSla((RequestInfo) any());
        verify(this.businessMasterService).getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any());
        assertEquals(1L, processInstanceSearchCriteria.getSlotPercentageSlaLimit().longValue());
    }


    @Test
    void testCountWithErrorCode() {
        when(this.worKflowRepository.getProcessInstancesCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
        when(this.mDMSService.fetchSlotPercentageForNearingSla((RequestInfo) any())).thenReturn(1);
        when(this.businessMasterService.getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any()))
                .thenThrow(new CustomException("Code", "An error occurred"));
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertThrows(CustomException.class, () -> this.workflowService.count(requestInfo, processInstanceSearchCriteria));
        verify(this.mDMSService).fetchSlotPercentageForNearingSla((RequestInfo) any());
        verify(this.businessMasterService).getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any());
    }


    @Test
    void testCountWithSerachCriteria() {
        doThrow(new CustomException("Code", "An error occurred")).when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());
        lenient().when(this.worKflowRepository.getProcessInstancesCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
        lenient().when(this.mDMSService.fetchSlotPercentageForNearingSla((RequestInfo) any())).thenReturn(1);
        lenient().when(this.businessMasterService.getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any())).thenReturn(1L);
        RequestInfo requestInfo = new RequestInfo();
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        lenient().when(processInstanceSearchCriteria.getBusinessService()).thenReturn("Business Service");
        lenient().when(processInstanceSearchCriteria.getIsNearingSlaCount()).thenReturn(true);
        lenient().when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertThrows(CustomException.class, () -> this.workflowService.count(requestInfo, processInstanceSearchCriteria));
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.mDMSService).fetchSlotPercentageForNearingSla((RequestInfo) any());
        verify(this.businessMasterService).getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).getIsNearingSlaCount();
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria).getBusinessService();
        verify(processInstanceSearchCriteria).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria, atLeast(1)).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void testCountWithBusinessService() {
        doNothing().when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());
        lenient().when(this.worKflowRepository.getInboxCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
        lenient().when(this.worKflowRepository.getProcessInstancesCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
        //when(this.mDMSService.fetchSlotPercentageForNearingSla((RequestInfo) any())).thenReturn(1);
        lenient().when(this.businessMasterService.getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any())).thenReturn(1L);

        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        lenient().when(processInstanceSearchCriteria.getBusinessService()).thenReturn("Business Service");
        lenient().when(processInstanceSearchCriteria.getIsNearingSlaCount()).thenReturn(true);
        lenient().when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        //assertEquals(3, this.workflowService.count(requestInfo, processInstanceSearchCriteria).intValue());
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getInboxCount((ProcessInstanceSearchCriteria) any());
        //verify(this.mDMSService).fetchSlotPercentageForNearingSla((RequestInfo) any());
        verify(this.businessMasterService).getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).getIsNearingSlaCount();
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria).getBusinessService();
        verify(processInstanceSearchCriteria, atLeast(1)).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria, atLeast(1)).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void testCountWithEmptyString() {
    	lenient().doNothing().when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());
    	lenient().when(this.worKflowRepository.getInboxCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
    	lenient().when(this.worKflowRepository.getProcessInstancesCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
    	//lenient().when(this.mDMSService.fetchSlotPercentageForNearingSla((RequestInfo) any())).thenReturn(1);
    	lenient().when(this.businessMasterService.getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any())).thenReturn(1L);

        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        lenient().when(processInstanceSearchCriteria.getBusinessService()).thenReturn("");
        lenient().when(processInstanceSearchCriteria.getIsNearingSlaCount()).thenReturn(true);
        lenient().when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertThrows(CustomException.class, () -> this.workflowService.count(requestInfo, processInstanceSearchCriteria));
        verify(processInstanceSearchCriteria).getIsNearingSlaCount();
        verify(processInstanceSearchCriteria).getBusinessService();
        verify(processInstanceSearchCriteria).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void testCountWithFalse() {
        doNothing().when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());
        lenient().when(this.worKflowRepository.getInboxCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
        lenient().when(this.worKflowRepository.getProcessInstancesCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
        lenient().when(this.mDMSService.fetchSlotPercentageForNearingSla((RequestInfo) any())).thenReturn(1);
        lenient().when(this.businessMasterService.getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any())).thenReturn(1L);

        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        lenient().when(processInstanceSearchCriteria.getBusinessService()).thenReturn("Business Service");
        lenient().when(processInstanceSearchCriteria.getIsNearingSlaCount()).thenReturn(false);
        lenient().when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertEquals(3, this.workflowService.count(requestInfo, processInstanceSearchCriteria).intValue());
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getInboxCount((ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).getIsNearingSlaCount();
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria, atLeast(1)).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void testCountWithTrue() {
        doNothing().when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());
        when(this.worKflowRepository.getInboxCount((ProcessInstanceSearchCriteria) any()))
                .thenThrow(new CustomException("Code", "An error occurred"));
        when(this.worKflowRepository.getProcessInstancesCount((ProcessInstanceSearchCriteria) any())).thenReturn(3);
        when(this.mDMSService.fetchSlotPercentageForNearingSla((RequestInfo) any())).thenReturn(1);
        when(this.businessMasterService.getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any())).thenReturn(1L);

        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        when(processInstanceSearchCriteria.getBusinessService()).thenReturn("Business Service");
        when(processInstanceSearchCriteria.getIsNearingSlaCount()).thenReturn(true);
        when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertThrows(CustomException.class, () -> this.workflowService.count(requestInfo, processInstanceSearchCriteria));
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getInboxCount((ProcessInstanceSearchCriteria) any());
        verify(this.mDMSService).fetchSlotPercentageForNearingSla((RequestInfo) any());
        verify(this.businessMasterService).getMaxBusinessServiceSla((ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).getIsNearingSlaCount();
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria).getBusinessService();
        verify(processInstanceSearchCriteria, atLeast(1)).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria, atLeast(1)).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }

    @Test
    void testGetUserBasedProcessInstancesCount() {
        when(this.worKflowRepository.getProcessInstancesForUserInboxCount((ProcessInstanceSearchCriteria) any()))
                .thenReturn(3);
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertEquals(3,
                this.workflowService.getUserBasedProcessInstancesCount(requestInfo, processInstanceSearchCriteria).intValue());
        verify(this.worKflowRepository).getProcessInstancesForUserInboxCount((ProcessInstanceSearchCriteria) any());
    }

    @Test
    void testGetUserBasedProcessInstancesCountWithErrorCode() {
        when(this.worKflowRepository.getProcessInstancesForUserInboxCount((ProcessInstanceSearchCriteria) any()))
                .thenThrow(new CustomException("Code", "An error occurred"));
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertThrows(CustomException.class,
                () -> this.workflowService.getUserBasedProcessInstancesCount(requestInfo, processInstanceSearchCriteria));
        verify(this.worKflowRepository).getProcessInstancesForUserInboxCount((ProcessInstanceSearchCriteria) any());
    }


    @Test
    void testStatusCount() {
        ArrayList<Object> objectList = new ArrayList<>();
        when(this.worKflowRepository.getProcessInstancesStatusCount((ProcessInstanceSearchCriteria) any()))
                .thenReturn(objectList);
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        List actualStatusCountResult = this.workflowService.statusCount(requestInfo, processInstanceSearchCriteria);
        assertSame(objectList, actualStatusCountResult);
        assertTrue(actualStatusCountResult.isEmpty());
        verify(this.worKflowRepository).getProcessInstancesStatusCount((ProcessInstanceSearchCriteria) any());
    }


    @Test
    void testStatusCountWithErrorFSM() {
        doThrow(new CustomException("FSM", "An error occurred")).when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());
        lenient().when(this.worKflowRepository.getProcessInstancesStatusCount((ProcessInstanceSearchCriteria) any()))
                .thenReturn(new ArrayList<>());
        RequestInfo requestInfo = new RequestInfo();
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        lenient().when(processInstanceSearchCriteria.getBusinessService()).thenReturn("Business Service");
        lenient().when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertThrows(CustomException.class,
                () -> this.workflowService.statusCount(requestInfo, processInstanceSearchCriteria));
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria, atLeast(1)).getBusinessService();
        verify(processInstanceSearchCriteria).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void testStatusCountWithTrueService() {
        doNothing().when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());
        ArrayList<Object> objectList = new ArrayList<>();
        lenient().when(this.worKflowRepository.getInboxStatusCount((ProcessInstanceSearchCriteria) any())).thenReturn(objectList);
        lenient().when(this.worKflowRepository.getProcessInstancesStatusCount((ProcessInstanceSearchCriteria) any()))
                .thenReturn(new ArrayList<>());

        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        lenient().when(processInstanceSearchCriteria.getBusinessService()).thenReturn("Business Service");
        lenient().when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        List actualStatusCountResult = this.workflowService.statusCount(requestInfo, processInstanceSearchCriteria);
        assertSame(objectList, actualStatusCountResult);
        assertTrue(actualStatusCountResult.isEmpty());
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getInboxStatusCount((ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria, atLeast(1)).getBusinessService();
        verify(processInstanceSearchCriteria, atLeast(1)).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }

    @Test
    void testStatusCountWithFSM() {
		/*
		 * //doNothing().when(this.workflowUtil)
		 * .enrichStatusesInSearchCriteria((RequestInfo) any(),
		 * (ProcessInstanceSearchCriteria) any());
		 * //lenient().when(this.worKflowRepository.getInboxStatusCount((
		 * ProcessInstanceSearchCriteria) any())) .thenReturn(new ArrayList<>());
		 * ArrayList<Object> objectList = new ArrayList<>();
		 * //lenient().when(this.worKflowRepository.getProcessInstancesStatusCount((
		 * ProcessInstanceSearchCriteria) any())) .thenReturn(objectList);
		 */
    	ArrayList<Object> objectList = new ArrayList<>();
    	 lenient().doNothing().when(this.workflowUtil)
                .enrichStatusesInSearchCriteria(any(RequestInfo.class), any(ProcessInstanceSearchCriteria.class));

                lenient().when(this.worKflowRepository.getInboxStatusCount(any(ProcessInstanceSearchCriteria.class)))
                .thenReturn(new ArrayList<>());

                lenient().when(this.worKflowRepository.getProcessInstancesStatusCount(any(ProcessInstanceSearchCriteria.class)))
                .thenReturn(objectList);

        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        lenient().when(processInstanceSearchCriteria.getBusinessService()).thenReturn("FSM");
        lenient().when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        List actualStatusCountResult = this.workflowService.statusCount(requestInfo, processInstanceSearchCriteria);
        assertSame(objectList, actualStatusCountResult);
        assertTrue(actualStatusCountResult.isEmpty());
        verify(this.worKflowRepository).getProcessInstancesStatusCount((ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria, atLeast(1)).getBusinessService();
        verify(processInstanceSearchCriteria).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void TestStatusCount() {
        doNothing().when(this.workflowUtil)
                .enrichStatusesInSearchCriteria((RequestInfo) any(), (ProcessInstanceSearchCriteria) any());
        lenient().when(this.worKflowRepository.getInboxStatusCount((ProcessInstanceSearchCriteria) any()))
                .thenThrow(new CustomException("FSM", "An error occurred"));
        lenient().when(this.worKflowRepository.getProcessInstancesStatusCount((ProcessInstanceSearchCriteria) any()))
                .thenReturn(new ArrayList<>());

        RequestInfo requestInfo = new RequestInfo();
        requestInfo.setUserInfo(new User());
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        when(processInstanceSearchCriteria.getBusinessService()).thenReturn("Business Service");
        when(processInstanceSearchCriteria.isNull()).thenReturn(true);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertThrows(CustomException.class,
                () -> this.workflowService.statusCount(requestInfo, processInstanceSearchCriteria));
        verify(this.workflowUtil).enrichStatusesInSearchCriteria((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getInboxStatusCount((ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).isNull();
        verify(processInstanceSearchCriteria, atLeast(1)).getBusinessService();
        verify(processInstanceSearchCriteria, atLeast(1)).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }

    @Test
    void testEscalatedApplicationsSearch() {
        when(this.worKflowRepository.fetchEscalatedApplicationsBusinessIdsFromDb((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any())).thenReturn(new ArrayList<>());
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertTrue(this.workflowService.escalatedApplicationsSearch(requestInfo, processInstanceSearchCriteria).isEmpty());
        verify(this.worKflowRepository).fetchEscalatedApplicationsBusinessIdsFromDb((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        assertFalse(processInstanceSearchCriteria.getIsEscalatedCount());
    }


    @Test
    void testEscalatedApplicationsSearchWithAddStirngList() {
        ArrayList<String> stringList = new ArrayList<>();
        stringList.add("foo");
        ArrayList<ProcessInstance> processInstanceList = new ArrayList<>();
        when(this.worKflowRepository.getProcessInstances((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList);
        when(this.worKflowRepository.fetchEscalatedApplicationsBusinessIdsFromDb((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any())).thenReturn(stringList);
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        List<ProcessInstance> actualEscalatedApplicationsSearchResult = this.workflowService
                .escalatedApplicationsSearch(requestInfo, processInstanceSearchCriteria);
        assertSame(processInstanceList, actualEscalatedApplicationsSearchResult);
        assertTrue(actualEscalatedApplicationsSearchResult.isEmpty());
        verify(this.worKflowRepository).fetchEscalatedApplicationsBusinessIdsFromDb((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getProcessInstances((ProcessInstanceSearchCriteria) any());
        assertFalse(processInstanceSearchCriteria.getIsEscalatedCount());
    }


    @Test
    void TestEscalatedApplicationsSearch() {
        ArrayList<String> stringList = new ArrayList<>();
        stringList.add("foo");

        ArrayList<ProcessInstance> processInstanceList = new ArrayList<>();
        processInstanceList.add(new ProcessInstance());
        when(this.worKflowRepository.getProcessInstances((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList);
        when(this.worKflowRepository.fetchEscalatedApplicationsBusinessIdsFromDb((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any())).thenReturn(stringList);
        when(this.enrichmentService.enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any()))
                .thenReturn(new ArrayList<>());
        doNothing().when(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        doNothing().when(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        List<ProcessInstance> actualEscalatedApplicationsSearchResult = this.workflowService
                .escalatedApplicationsSearch(requestInfo, processInstanceSearchCriteria);
        assertSame(processInstanceList, actualEscalatedApplicationsSearchResult);
        assertEquals(1, actualEscalatedApplicationsSearchResult.size());
        verify(this.worKflowRepository).fetchEscalatedApplicationsBusinessIdsFromDb((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getProcessInstances((ProcessInstanceSearchCriteria) any());
        verify(this.enrichmentService).enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        verify(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        verify(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        assertFalse(processInstanceSearchCriteria.getIsEscalatedCount());
    }


    @Test
    void testEscalatedApplicationsSearchWithResult() {
        ArrayList<String> stringList = new ArrayList<>();
        stringList.add("foo");

        ArrayList<ProcessInstance> processInstanceList = new ArrayList<>();
        processInstanceList.add(new ProcessInstance());
        when(this.worKflowRepository.getProcessInstances((ProcessInstanceSearchCriteria) any()))
                .thenReturn(processInstanceList);
        when(this.worKflowRepository.fetchEscalatedApplicationsBusinessIdsFromDb((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any())).thenReturn(stringList);
        when(this.enrichmentService.enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any()))
                .thenReturn(new ArrayList<>());
        doNothing().when(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        doNothing().when(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        RequestInfo requestInfo = new RequestInfo();
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        when(processInstanceSearchCriteria.getBusinessService()).thenReturn("Business Service");
        when(processInstanceSearchCriteria.getTenantId()).thenReturn("42");
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        List<ProcessInstance> actualEscalatedApplicationsSearchResult = this.workflowService
                .escalatedApplicationsSearch(requestInfo, processInstanceSearchCriteria);
        assertSame(processInstanceList, actualEscalatedApplicationsSearchResult);
        assertEquals(1, actualEscalatedApplicationsSearchResult.size());
        verify(this.worKflowRepository).fetchEscalatedApplicationsBusinessIdsFromDb((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(this.worKflowRepository).getProcessInstances((ProcessInstanceSearchCriteria) any());
        verify(this.enrichmentService).enrichNextActionForSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        verify(this.enrichmentService).enrichAndUpdateSlaForSearch((List<ProcessInstance>) any());
        verify(this.enrichmentService).enrichUsersFromSearch((RequestInfo) any(), (List<ProcessInstance>) any());
        verify(processInstanceSearchCriteria).getBusinessService();
        verify(processInstanceSearchCriteria).getTenantId();
        verify(processInstanceSearchCriteria).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria, atLeast(1)).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }


    @Test
    void testCountEscalatedApplications() {
        when(this.worKflowRepository.getEscalatedApplicationsCount((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any())).thenReturn(3);
        RequestInfo requestInfo = new RequestInfo();

        ProcessInstanceSearchCriteria processInstanceSearchCriteria = new ProcessInstanceSearchCriteria();
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertEquals(3,
                this.workflowService.countEscalatedApplications(requestInfo, processInstanceSearchCriteria).intValue());
        verify(this.worKflowRepository).getEscalatedApplicationsCount((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        assertTrue(processInstanceSearchCriteria.getIsEscalatedCount());
    }


    @Test
    void testCountEscalatedApplication() {
        when(this.worKflowRepository.getEscalatedApplicationsCount((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any())).thenReturn(3);
        RequestInfo requestInfo = new RequestInfo();
        ProcessInstanceSearchCriteria processInstanceSearchCriteria = mock(ProcessInstanceSearchCriteria.class);
        doNothing().when(processInstanceSearchCriteria).setAssignee((String) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setBusinessService((String) any());
        doNothing().when(processInstanceSearchCriteria).setFromDate((Long) any());
        doNothing().when(processInstanceSearchCriteria).setHistory((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsEscalatedCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        doNothing().when(processInstanceSearchCriteria).setLimit((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setModuleName((String) any());
        doNothing().when(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setOffset((Integer) any());
        doNothing().when(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        doNothing().when(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setTenantId((String) any());
        doNothing().when(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        doNothing().when(processInstanceSearchCriteria).setToDate((Long) any());
        processInstanceSearchCriteria.setAssignee("Assignee");
        processInstanceSearchCriteria.setBusinessIds(new ArrayList<>());
        processInstanceSearchCriteria.setBusinessService("Business Service");
        processInstanceSearchCriteria.setFromDate(1L);
        processInstanceSearchCriteria.setHistory(true);
        processInstanceSearchCriteria.setIds(new ArrayList<>());
        processInstanceSearchCriteria.setIsAssignedToMeCount(true);
        processInstanceSearchCriteria.setIsEscalatedCount(true);
        processInstanceSearchCriteria.setIsNearingSlaCount(true);
        processInstanceSearchCriteria.setLimit(1);
        processInstanceSearchCriteria.setModuleName("Module Name");
        processInstanceSearchCriteria.setMultipleAssignees(new ArrayList<>());
        processInstanceSearchCriteria.setOffset(2);
        processInstanceSearchCriteria.setSlotPercentageSlaLimit(1L);
        processInstanceSearchCriteria.setStatesToIgnore(new ArrayList<>());
        processInstanceSearchCriteria.setStatus(new ArrayList<>());
        processInstanceSearchCriteria.setStatusesIrrespectiveOfTenant(new ArrayList<>());
        processInstanceSearchCriteria.setTenantId("42");
        processInstanceSearchCriteria.setTenantSpecifiStatus(new ArrayList<>());
        processInstanceSearchCriteria.setToDate(1L);
        assertEquals(3,
                this.workflowService.countEscalatedApplications(requestInfo, processInstanceSearchCriteria).intValue());
        verify(this.worKflowRepository).getEscalatedApplicationsCount((RequestInfo) any(),
                (ProcessInstanceSearchCriteria) any());
        verify(processInstanceSearchCriteria).setAssignee((String) any());
        verify(processInstanceSearchCriteria).setBusinessIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setBusinessService((String) any());
        verify(processInstanceSearchCriteria).setFromDate((Long) any());
        verify(processInstanceSearchCriteria).setHistory((Boolean) any());
        verify(processInstanceSearchCriteria).setIds((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setIsAssignedToMeCount((Boolean) any());
        verify(processInstanceSearchCriteria, atLeast(1)).setIsEscalatedCount((Boolean) any());
        verify(processInstanceSearchCriteria).setIsNearingSlaCount((Boolean) any());
        verify(processInstanceSearchCriteria).setLimit((Integer) any());
        verify(processInstanceSearchCriteria).setModuleName((String) any());
        verify(processInstanceSearchCriteria).setMultipleAssignees((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setOffset((Integer) any());
        verify(processInstanceSearchCriteria).setSlotPercentageSlaLimit((Long) any());
        verify(processInstanceSearchCriteria).setStatesToIgnore((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setStatusesIrrespectiveOfTenant((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setTenantId((String) any());
        verify(processInstanceSearchCriteria).setTenantSpecifiStatus((java.util.List<String>) any());
        verify(processInstanceSearchCriteria).setToDate((Long) any());
    }
}

