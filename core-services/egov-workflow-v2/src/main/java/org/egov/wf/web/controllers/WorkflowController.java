package org.egov.wf.web.controllers;


import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.apache.commons.lang3.StringUtils;
import org.egov.wf.service.WorkflowReminderService;
import org.egov.wf.service.WorkflowService;
import org.egov.wf.util.ResponseInfoFactory;
import org.egov.wf.web.models.ProcessInstance;
import org.egov.wf.web.models.ProcessInstanceRequest;
import org.egov.wf.web.models.ProcessInstanceResponse;
import org.egov.wf.web.models.ProcessInstanceSearchCriteria;
import org.egov.wf.web.models.RequestInfoWrapper;
import org.egov.wf.web.models.StatusCountRequest;
import org.egov.wf.web.models.WorkflowReminderRequest;
import org.egov.wf.web.models.WorkflowReminderResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;


@RestController
@RequestMapping("/egov-wf")
public class WorkflowController {


    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;

    private final WorkflowService workflowService;

    private final ResponseInfoFactory responseInfoFactory;

    @Autowired
    private WorkflowReminderService workflowReminderService;


    @Autowired
    public WorkflowController(ObjectMapper objectMapper, HttpServletRequest request,
                              WorkflowService workflowService, ResponseInfoFactory responseInfoFactory) {
        this.objectMapper = objectMapper;
        this.request = request;
        this.workflowService = workflowService;
        this.responseInfoFactory = responseInfoFactory;
    }



        @RequestMapping(value="/process/_transition", method = RequestMethod.POST)
        public ResponseEntity<ProcessInstanceResponse> processTransition(@Valid @RequestBody ProcessInstanceRequest processInstanceRequest) {
                List<ProcessInstance> processInstances =  workflowService.transition(processInstanceRequest);
                ProcessInstanceResponse response = ProcessInstanceResponse.builder().processInstances(processInstances)
                        .responseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(processInstanceRequest.getRequestInfo(), true))
                        .build();
                return new ResponseEntity<>(response,HttpStatus.OK);
        }




        @RequestMapping(value="/process/_search", method = RequestMethod.POST)
        public ResponseEntity<ProcessInstanceResponse> search(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                              @Valid @ModelAttribute ProcessInstanceSearchCriteria criteria) {
        List<ProcessInstance> processInstances = workflowService.search(requestInfoWrapper.getRequestInfo(),criteria);
        Integer count = workflowService.getUserBasedProcessInstancesCount(requestInfoWrapper.getRequestInfo(),criteria);
            ProcessInstanceResponse response  = ProcessInstanceResponse.builder().processInstances(processInstances).totalCount(count).build();
                return new ResponseEntity<>(response,HttpStatus.OK);
        }

    /**
     * Returns the count of records matching the given criteria
     * @param requestInfoWrapper
     * @param criteria
     * @return
     */
    @RequestMapping(value="/process/_count", method = RequestMethod.POST)
        public ResponseEntity<Integer> count(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                              @Valid @ModelAttribute ProcessInstanceSearchCriteria criteria) {
    		criteria.setIsNearingSlaCount(Boolean.FALSE);
            Integer count = workflowService.count(requestInfoWrapper.getRequestInfo(),criteria);
            return new ResponseEntity<>(count,HttpStatus.OK);
        }

    @RequestMapping(value="/escalate/_search", method = RequestMethod.POST)
    public ResponseEntity<ProcessInstanceResponse> searchEscalatedApplications(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                          @Valid @ModelAttribute ProcessInstanceSearchCriteria criteria) {
        List<ProcessInstance> processInstances = workflowService.escalatedApplicationsSearch(requestInfoWrapper.getRequestInfo(),criteria);
        Integer count = workflowService.countEscalatedApplications(requestInfoWrapper.getRequestInfo(),criteria);
        ProcessInstanceResponse response  = ProcessInstanceResponse.builder().processInstances(processInstances).totalCount(count)
                .build();
        return new ResponseEntity<>(response,HttpStatus.OK);
    }

    /**
     * Returns the count of each status of records matching the given criteria
     * @param requestInfoWrapper
     * @param criteria
     * @return
     */
    @RequestMapping(value = "/process/_statuscount", method = RequestMethod.POST)
    public ResponseEntity<List> StatusCount(@Valid @RequestBody StatusCountRequest statusCountRequest,
            @Valid @ModelAttribute ProcessInstanceSearchCriteria criteria) {
        ProcessInstanceSearchCriteria statusCriteria = statusCountRequest.getProcessInstanceSearchCriteria();
        if (statusCriteria == null) {
            statusCriteria = criteria;
        }
        List result = workflowService.statusCount(statusCountRequest.getRequestInfo(), statusCriteria);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
    
    @RequestMapping(value="/process/_nearingslacount", method = RequestMethod.POST)
    public ResponseEntity<Integer> nearingSlaCount(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                         @Valid @ModelAttribute ProcessInstanceSearchCriteria criteria) {
        criteria.setIsNearingSlaCount(Boolean.TRUE);
        Integer count = workflowService.count(requestInfoWrapper.getRequestInfo(),criteria);
        return new ResponseEntity<>(count,HttpStatus.OK);
    }
    
    @PostMapping("/escalate/_searchautoescalationeligibleapp")
    public ResponseEntity<ProcessInstanceResponse> searchAutoEscalationEligibleApplications(@Valid @RequestBody RequestInfoWrapper requestInfoWrapper,
                                                          @Valid @ModelAttribute ProcessInstanceSearchCriteria criteria) {
        List<ProcessInstance> processInstances = workflowService.getAutoEscalationEligibleApplications(criteria);
        ProcessInstanceResponse response  = ProcessInstanceResponse.builder()
        		.processInstances(processInstances)
        		.totalCount(processInstances.size())
        		.build();
        return new ResponseEntity<>(response,HttpStatus.OK);
    }

    /**
     * Single Daily Reminder API to initiate notification triggers (SMS & Email) to assignees of
     * active applications across business services that are neither in START state nor in TERMINATE/END state.
     */
    @RequestMapping(value = {"/process/_sendreminder", "/process/_remind"}, method = RequestMethod.POST)
    public ResponseEntity<WorkflowReminderResponse> sendDailyReminders(
            @Valid @RequestBody(required = false) WorkflowReminderRequest reminderRequest,
            @RequestParam(value = "tenantId", required = false) String tenantId,
            @RequestParam(value = "businessService", required = false) String businessService,
            @RequestParam(value = "assignee", required = false) String assignee,
            @RequestParam(value = "force", required = false) Boolean force) {

        if (reminderRequest == null) {
            reminderRequest = new WorkflowReminderRequest();
        }
        if (StringUtils.isNotBlank(tenantId)) {
            reminderRequest.setTenantId(tenantId);
        }
        if (StringUtils.isNotBlank(businessService)) {
            reminderRequest.setBusinessService(businessService);
        }
        if (StringUtils.isNotBlank(assignee)) {
            reminderRequest.setAssignee(assignee);
        }
        if (Boolean.TRUE.equals(force) || Boolean.TRUE.equals(reminderRequest.getForce())) {
            reminderRequest.setForce(true);
        }
        if (reminderRequest.getAsync() == null) {
            reminderRequest.setAsync(true);
        }

        WorkflowReminderResponse response = workflowReminderService.triggerDailyReminders(reminderRequest);
        response.setResponseInfo(responseInfoFactory.createResponseInfoFromRequestInfo(reminderRequest.getRequestInfo(), true));

        HttpStatus httpStatus = HttpStatus.OK;
        if ("TRIGGERED".equalsIgnoreCase(response.getStatus())) {
            httpStatus = HttpStatus.ACCEPTED;
        } else if ("ALREADY_RUNNING".equalsIgnoreCase(response.getStatus())) {
            httpStatus = HttpStatus.CONFLICT;
        }

        return new ResponseEntity<>(response, httpStatus);
    }

    /**
     * Resets any stale or stuck reminder job lock so the reminder job can run immediately.
     */
    @RequestMapping(value = "/process/_resetreminder", method = RequestMethod.POST)
    public ResponseEntity<WorkflowReminderResponse> resetReminderJob() {
        boolean wasRunning = workflowReminderService.resetReminderJob();
        WorkflowReminderResponse response = WorkflowReminderResponse.builder()
                .status(wasRunning ? "RESET_SUCCESS" : "NOT_RUNNING")
                .message(wasRunning
                        ? "Workflow daily reminder job lock was actively held and has now been forcibly reset."
                        : "Workflow daily reminder job lock was not actively held. Ready to accept new runs.")
                .build();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
