package org.egov.layout.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.layout.config.CLUConfiguration;
import org.egov.layout.repository.CLURepository;
import org.egov.layout.util.CLUConstants;
import org.egov.layout.util.CLUUtil;
import org.egov.layout.web.model.Clu;
import org.egov.layout.web.model.CluRequest;
import org.egov.layout.web.model.Workflow;
import org.egov.layout.web.model.bill.PaymentDetail;
import org.egov.layout.web.model.bill.PaymentRequest;
import org.egov.layout.web.model.LayoutSearchCriteria;
import org.egov.layout.workflow.WorkflowIntegrator;
import org.egov.layout.workflow.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;


@Service
@Slf4j
public class PaymentUpdateService {

	private CLUService nocService;

	private CLUConfiguration config;

	private CLURepository repository;

	private WorkflowIntegrator wfIntegrator;

	private EnrichmentService enrichmentService;

	private ObjectMapper mapper;

	private WorkflowService workflowService;

	private CLUUtil util;

//	@Value("${workflow.bpa.businessServiceCode.fallback_enabled}")
//	private Boolean pickWFServiceNameFromTradeTypeOnly;

	@Autowired
	public PaymentUpdateService(CLUService service, CLUConfiguration config, CLURepository repository,
								WorkflowIntegrator wfIntegrator, EnrichmentService enrichmentService, ObjectMapper mapper,
								WorkflowService workflowService, CLUUtil util) {
		this.nocService = service;
		this.config = config;
		this.repository = repository;
		this.wfIntegrator = wfIntegrator;
		this.enrichmentService = enrichmentService;
		this.mapper = mapper;
		this.workflowService = workflowService;
		this.util = util;
	}



	/**
	 * Process the message from kafka and updates the status to paid
	 * 
	 * @param record The incoming message from receipt create consumer
	 */
	public void process(PaymentRequest record) {

		log.info("Start PaymentUpdateService.process method.");
		try {
			PaymentRequest paymentRequest = mapper.convertValue(record,PaymentRequest.class);
			RequestInfo requestInfo = paymentRequest.getRequestInfo();
			List<PaymentDetail> paymentDetails = paymentRequest.getPayment().getPaymentDetails();
			String tenantIdFromPaymentDetails = paymentRequest.getPayment().getTenantId();
			for(PaymentDetail paymentDetail : paymentDetails){
				if (paymentDetail.getBusinessService().equalsIgnoreCase(CLUConstants.NOC_BUSINESS_SERVICE )|| paymentDetail.getBusinessService().equalsIgnoreCase(CLUConstants.CLU_MODULE)) {
					log.info("Start PaymentUpdateService.process method.");
					LayoutSearchCriteria searchCriteria = new LayoutSearchCriteria();
					searchCriteria.setTenantId(tenantIdFromPaymentDetails);
					searchCriteria.setApplicationNo(paymentDetail.getBill().getConsumerCode());
					List<Clu> nocs = nocService.search(searchCriteria, requestInfo);




					String tenantIdFromSearch = nocs.get(0).getTenantId();

					Object additionalDetailsData =nocs.get(0).getNocDetails().getAdditionalDetails();

					// Cast to LinkedHashMap
					Map<String, Object> additionalDetailsMap = (Map<String, Object>) additionalDetailsData;

					// Get siteDetails as a Map
					Map<String, Object> siteDetails = (Map<String, Object>) additionalDetailsMap.get("siteDetails");
					String businessService = (String) siteDetails.get("businessService");

                    nocs.forEach(application -> {

								Workflow workflow=new Workflow();
								workflow.setAction(CLUConstants.ACTION_PAY);
								application.setWorkflow(workflow);
//								application.setAction(CLUConstants.ACTION_PAY);
							}
						);

					Role role = Role.builder().code("SYSTEM_PAYMENT").tenantId(tenantIdFromSearch).build();
					requestInfo.getUserInfo().getRoles().add(role);
//					CluRequest updateRequest = CluRequest.builder()
//							.requestInfo(requestInfo)
//							.layout(nocs.get(0))
//							.build();
					CluRequest updateRequest = new CluRequest();
						updateRequest.setRequestInfo(requestInfo);
						updateRequest.setLayout(nocs.get(0));

					/*
					 * calling workflow to update status
					 */
//					wfIntegrator.callWorkFlow(updateRequest,CLUConstants.NOC_BUSINESS_SERVICE);
//                    log.info(" applications uuid is : {}", updateRequest.getApplications().get(0).getUuid());
//                    log.info(" the status of the applications is : {}", updateRequest.getApplications().get(0).getApplicationStatus());
					enrichmentService.postStatusEnrichment(updateRequest, businessService);

					/*
					 * calling repository to update the object in ndc tables
					 */


					nocService.update(updateRequest);
			}
		 }
		} catch (Exception e) {
			log.error("KAFKA_PROCESS_ERROR", e);
		}

	}

}
