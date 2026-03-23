package org.egov.gccalculation.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.egov.gccalculation.repository.BillGeneratorDao;
import org.egov.gccalculation.repository.GCCalculationDao;
import org.egov.gccalculation.validator.BillGenerationValidator;
import org.egov.gccalculation.web.models.AuditDetails;
import org.egov.gccalculation.web.models.BillGenerationReq;
import org.egov.gccalculation.web.models.BillGenerationSearchCriteria;
import org.egov.gccalculation.web.models.BillScheduler;
import org.egov.gccalculation.web.models.BillStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import org.egov.gccalculation.constants.GCCalculationConstant;


@Service
@Slf4j
public class BillGeneratorService {

	@Autowired
	private EnrichmentService enrichmentService;

	@Autowired
	private BillGeneratorDao billGeneratorDao;
	
	@Autowired
	private GCCalculationDao waterCalculatorDao;
	
	@Autowired
	private BillGenerationValidator billGenerationValidator;
	

	@Autowired
	private BillGeneratorService billGeneratorService;

	public List<BillScheduler> saveBillGenerationDetails(BillGenerationReq billRequest) {
		List<BillScheduler> billSchedulers = new ArrayList<>();
		AuditDetails auditDetails = enrichmentService
				.getAuditDetails(billRequest.getRequestInfo().getUserInfo().getUuid(), true);

		billRequest.getBillScheduler().setId(UUID.randomUUID().toString());
		billRequest.getBillScheduler().setAuditDetails(auditDetails);
		billRequest.getBillScheduler().setStatus(BillStatus.INITIATED);
		billRequest.getBillScheduler().setTransactionType(GCCalculationConstant.WS_BILL_SCHEDULER_TRANSACTION);
		
		billGeneratorDao.saveBillGenertaionDetails(billRequest);
		billSchedulers.add(billRequest.getBillScheduler());
		return billSchedulers;
	}

	public List<BillScheduler> getBillGenerationDetails(BillGenerationSearchCriteria criteria) {

		return billGeneratorDao.getBillGenerationDetails(criteria);
	}
	
	
	public List<BillScheduler> getBillGenerationGroup(BillGenerationSearchCriteria criteria) {

		return billGeneratorDao.getBillGenerationGroup(criteria);
	}
	
	public List<BillScheduler> bulkbillgeneration(BillGenerationReq billGenerationReq) {

		List<BillScheduler> billDetails = new ArrayList<BillScheduler>();
	       
    	if(billGenerationReq.getBillScheduler().getIsBatch())
    	{		
		List<String> listOfLocalities = waterCalculatorDao.getLocalityList(billGenerationReq.getBillScheduler().getTenantId(),billGenerationReq.getBillScheduler().getLocality());
		for(String localityName : listOfLocalities)
		{		
			billGenerationReq.getBillScheduler().setLocality(localityName);			
			boolean localityStatus = billGenerationValidator.checkBillingCycleDates(billGenerationReq, billGenerationReq.getRequestInfo());
			if(!localityStatus) 
			{
			billDetails = billGeneratorService.saveBillGenerationDetails(billGenerationReq);
			}
			
		}
    	}
        else if (billGenerationReq.getBillScheduler().getGroup() != null && !billGenerationReq.getBillScheduler().getGroup().isEmpty()) 

		{
			
			
		
				List<String> temp=billGenerationReq.getBillScheduler().getGroup();
				billGenerationReq.getBillScheduler().setGroup(null);
				for(String grup:temp)
				{
					billGenerationReq.getBillScheduler().setGrup(grup);
					 Boolean Check=billGenerationValidator.checkBillingCycleDates(billGenerationReq, billGenerationReq.getRequestInfo());
					
					 if (!Check)
						 billDetails = billGeneratorService.saveBillGenerationDetails(billGenerationReq);
					 else 
						 log.info("Bills Are Already In Initieated Or InProgress For Group--> "+ billGenerationReq.getBillScheduler().getGrup());
				}
			
			

		}
    	
    	else {
				billGenerationValidator.validateBillingCycleDates(billGenerationReq, billGenerationReq.getRequestInfo());
				billDetails = billGeneratorService.saveBillGenerationDetails(billGenerationReq);
			   // billDetails1.addAll(billDetails);
	}
    	
    	return billDetails;
	}
		
	
	
	
	
	
}
