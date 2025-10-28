package org.egov.echallan.workflow;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.echallan.enums.ChallanStatusEnum;
import org.egov.echallan.model.Challan;
import org.egov.echallan.web.models.workflow.ProcessInstance;
import org.egov.echallan.web.models.workflow.ProcessInstanceRequest;
import org.egov.echallan.web.models.workflow.ProcessInstanceResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Collections;

/**
 * Minimal client to integrate with egov-workflow-v2 service.
 * This only scaffolds the transition call; service wiring can be added later.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowIntegrator {

  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${workflow.context.path:${egov.workflow.host:https://egov-workflow-v2.egov:8080}}")
  private String workflowHost;

  @Value("${workflow.transition.path:${egov.workflow.transition.path:/egov-workflow-v2/egov-wf/process/_transition}}")
  private String transitionPath;

  @Value("${challan.module.name:Challan}")
  private String moduleName;

  @Value("${challan.workflow.businessService:Challan_Generation}")
  private String defaultBusinessService;

  /**
   * Triggers a workflow transition and returns the resultant state (if
   * available).
   *
   * @param requestInfo RequestInfo
   * @param booking     BookingDetail containing businessService, tenantId,
   *                    bookingNo as businessId
   * @param action      Workflow action (e.g.,
   *                    INITIATE/APPLY/APPROVE/REJECT/CANCEL)
   * @return state after transition (nullable if not provided by wf)
   */
  public String transition(RequestInfo requestInfo, Challan booking, String action) {
    try {
      String businessService = booking.getBusinessService() != null ? booking.getBusinessService()
          : defaultBusinessService;
      ProcessInstance pi = ProcessInstance.builder()
          .businessService(businessService)
          .businessId(booking.getChallanNo())
          .tenantId(booking.getTenantId())
          .action(action)
          // optional module name used by some WF configs
          .moduleName(moduleName)
          .comment(booking.getWorkflow() != null ? booking.getWorkflow().getComment() : null)
          .build();

      ProcessInstanceRequest requestBody = ProcessInstanceRequest.builder()
          .requestInfo(requestInfo)
          .processInstances(Collections.singletonList(pi))
          .build();

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<ProcessInstanceRequest> entity = new HttpEntity<>(requestBody, headers);

      URI uri = URI.create(workflowHost + transitionPath);
      ResponseEntity<ProcessInstanceResponse> response = restTemplate.exchange(uri, HttpMethod.POST, entity,
          ProcessInstanceResponse.class);

      ProcessInstanceResponse responseBody = response.getBody();
      if (response.getStatusCode() == HttpStatus.OK && responseBody != null 
          && responseBody.getProcessInstances() != null
          && !responseBody.getProcessInstances().isEmpty()
          && responseBody.getProcessInstances().get(0).getState() != null) {
        // Extract workflow returned statuses
        String applicationStatus = responseBody.getProcessInstances().get(0).getState().getApplicationStatus();
        String state = responseBody.getProcessInstances().get(0).getState().getState();

        // First: map the action to our ChallanStatusEnum (minimal surface change)
        String mapped = mapToBookingStatus(action, applicationStatus, state);
        if (mapped != null) return mapped;

        // Next: if WF returned status already matches our enum, allow it
        if (isValidEnum(applicationStatus)) return applicationStatus;
        if (isValidEnum(state)) return state;
      }
    } catch (Exception ex) {
      log.error("Workflow transition failed for bookingNo={} action={}", booking.getChallanNo(), action, ex);
    }
    return null;
  }

  // Map workflow action or returned status to our existing enums without broader code changes
  private String mapToBookingStatus(String action, String wfApplicationStatus, String wfState) {
    String act = action == null ? null : action.trim().toUpperCase();
    if (act != null) {
      switch (act) {
        case "INITIATE":
          return ChallanStatusEnum.CHALLAN_CREATED.toString();
        case "SUBMIT":
          return ChallanStatusEnum.PENDING_FOR_PAYMENT.toString();
        case "PAY":
          return ChallanStatusEnum.CHALLAN_GENERATED.toString();
        case "APPROVE":
          return ChallanStatusEnum.CHALLAN_GENERATED.toString();
        default:
          break;
      }
    }

    // Fallbacks using WF-provided status names when they align with our enums
    if (isValidEnum(wfApplicationStatus)) return wfApplicationStatus;
    if (isValidEnum(wfState)) return wfState;
    return null;
  }

  private boolean isValidEnum(String status) {
    if (status == null || status.isEmpty()) return false;
    try {
      ChallanStatusEnum.valueOf(status);
      return true;
    } catch (Exception ignore) {
      return false;
    }
  }
}
