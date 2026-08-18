package org.egov.swcalculation.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.egov.swcalculation.repository.BillGeneratorDao;
import org.egov.swcalculation.repository.SewerageCalculatorDao;
import org.egov.swcalculation.web.models.AuditDetails;
import org.egov.swcalculation.web.models.BillGenerationRequest;
import org.egov.swcalculation.web.models.BillGenerationSearchCriteria;
import org.egov.swcalculation.web.models.BillScheduler;
import org.egov.swcalculation.web.models.BillStatus;
import org.egov.swcalculation.service.BillGeneratorService;
import org.egov.swcalculation.validator.BillGenerationValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import org.egov.swcalculation.constants.SWCalculationConstant;

@Service
@Slf4j
public class BillGeneratorService {

	@Autowired
	private EnrichmentService enrichmentService;

	@Autowired
	private BillGeneratorDao billGeneratorDao;

	@Autowired
	private BillGeneratorService billGeneratorService;
	
	@Autowired
	private SewerageCalculatorDao SewerageCalculatorDao;
	
	@Autowired
	private BillGenerationValidator billGenerationValidator;
	
	public List<BillScheduler> saveBillGenerationDetails(BillGenerationRequest billRequest) {
		List<BillScheduler> billSchedulers = new ArrayList<>();
		AuditDetails auditDetails = enrichmentService
				.getAuditDetails(billRequest.getRequestInfo().getUserInfo().getUuid(), true);

		billRequest.getBillScheduler().setId(UUID.randomUUID().toString());
		billRequest.getBillScheduler().setAuditDetails(auditDetails);
		billRequest.getBillScheduler().setStatus(BillStatus.INITIATED);
		billRequest.getBillScheduler().setTransactionType(SWCalculationConstant.SW_BILL_SCHEDULER_TRANSACTION);
		billGeneratorDao.saveBillGenertaionDetails(billRequest);
		billSchedulers.add(billRequest.getBillScheduler());
		return billSchedulers;
	}
	
	
	
	public List<BillScheduler> bulkbillgeneration(BillGenerationRequest billGenerationReq) {

		List<BillScheduler> billDetails = new ArrayList<BillScheduler>();
	       
    	if(billGenerationReq.getBillScheduler().getIsBatch())
    	{		
		List<String> listOfLocalities = SewerageCalculatorDao.getLocalityList(billGenerationReq.getBillScheduler().getTenantId(),billGenerationReq.getBillScheduler().getLocality());
		for(String localityName : listOfLocalities)
		{		
			BillGenerationRequest cloneReq = BillGenerationRequest.builder()
					.requestInfo(billGenerationReq.getRequestInfo())
					.billScheduler(BillScheduler.builder()
							.tenantId(billGenerationReq.getBillScheduler().getTenantId())
							.locality(localityName)
							.billingcycleStartdate(billGenerationReq.getBillScheduler().getBillingcycleStartdate())
							.billingcycleEnddate(billGenerationReq.getBillScheduler().getBillingcycleEnddate())
							.isBatch(billGenerationReq.getBillScheduler().getIsBatch())
							.build())
					.build();

			boolean localityStatus = billGenerationValidator.checkBillingCycleDates(cloneReq, cloneReq.getRequestInfo());
			if(!localityStatus) 
			{
				billDetails = billGeneratorService.saveBillGenerationDetails(cloneReq);
			}
			
		}
    	}
        else if (billGenerationReq.getBillScheduler().getGroup() != null && !billGenerationReq.getBillScheduler().getGroup().isEmpty()) 

		{
				List<String> temp=billGenerationReq.getBillScheduler().getGroup();
				for(String grup:temp)
				{
					BillGenerationRequest cloneReq = BillGenerationRequest.builder()
							.requestInfo(billGenerationReq.getRequestInfo())
							.billScheduler(BillScheduler.builder()
									.tenantId(billGenerationReq.getBillScheduler().getTenantId())
									.grup(grup)
									.billingcycleStartdate(billGenerationReq.getBillScheduler().getBillingcycleStartdate())
									.billingcycleEnddate(billGenerationReq.getBillScheduler().getBillingcycleEnddate())
									.isBatch(billGenerationReq.getBillScheduler().getIsBatch())
									.build())
							.build();
					 Boolean Check=billGenerationValidator.checkBillingCycleDates(cloneReq, cloneReq.getRequestInfo());
					
					 if (!Check)
						 billDetails = billGeneratorService.saveBillGenerationDetails(cloneReq);
					 else 
						 log.info("Bills Are Already In Initieated Or InProgress For Group--> "+ cloneReq.getBillScheduler().getGrup());
				}
		}
    	else {
				billGenerationValidator.validateBillingCycleDates(billGenerationReq, billGenerationReq.getRequestInfo());
				billDetails = billGeneratorService.saveBillGenerationDetails(billGenerationReq);
			   // billDetails1.addAll(billDetails);
	}
    	
    	return billDetails;
	}
		
	
	
	

	public List<BillScheduler> getBillGenerationDetails(BillGenerationSearchCriteria criteria) {

		return billGeneratorDao.getBillGenerationDetails(criteria);
	}
	
	public List<BillScheduler> getBillGenerationGroup(BillGenerationSearchCriteria criteria) {

		return billGeneratorDao.getBillGenerationGroup(criteria);
	}
}
