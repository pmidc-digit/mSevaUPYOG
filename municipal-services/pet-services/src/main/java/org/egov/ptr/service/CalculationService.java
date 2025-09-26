package org.egov.ptr.service;

import org.egov.ptr.models.BreedType;
import org.egov.ptr.models.CalculationType;
import org.egov.ptr.models.DemandDetail;
import org.egov.ptr.models.PetRegistrationRequest;
import org.egov.ptr.util.PTRConstants;
import org.egov.ptr.util.PetUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CalculationService {

	@Autowired
	private PetUtil mdmsUtil;

	/**
	 * Calculates the demand based on the provided PetRegistrationRequest.
	 *
	 * @param petRegistrationRequest The request containing pet registration
	 *                               applications.
	 * @return A list of DemandDetail objects representing the calculated demand.
	 */
	public List<DemandDetail> calculateDemand(PetRegistrationRequest petRegistrationRequest) {
		String tenantId = petRegistrationRequest.getPetRegistrationApplications().get(0).getTenantId();

		List<BreedType> calculationTypes = mdmsUtil.getcalculationType(petRegistrationRequest.getRequestInfo(),
				tenantId, PTRConstants.PET_MASTER_MODULE_NAME);

		log.info("Retrieved calculation types: {}", calculationTypes);

		return processCalculationForDemandGeneration(tenantId, calculationTypes, petRegistrationRequest);
	}

	private List<DemandDetail> processCalculationForDemandGeneration(String tenantId,
																	 List<BreedType> calculationTypes, PetRegistrationRequest petRegistrationRequest) {

		String applicationType = petRegistrationRequest.getPetRegistrationApplications().get(0).getApplicationType();

		List<DemandDetail> demandDetails = new ArrayList<>();
		for (BreedType type : calculationTypes) {
			if(applicationType.equalsIgnoreCase("NEWAPPLICATION") && petRegistrationRequest.getPetRegistrationApplications().get(0).getPetDetails().getBreedType().equals(type.getName())) {
//			if (type.getNewapplication().equalsIgnoreCase(applicationType)) {
				DemandDetail demandDetail = DemandDetail.builder()
						.taxAmount(type.getNewapplication())
						.taxHeadMasterCode(type.getFeeType())
						.tenantId(tenantId)
						.build();
				demandDetails.add(demandDetail);
			}
			if(applicationType.equalsIgnoreCase("RENEWAPPLICATION")){
//			if (type.getNewapplication().equalsIgnoreCase(applicationType)) {
				DemandDetail demandDetail = DemandDetail.builder()
						.taxAmount(type.getRenewapplication())
						.taxHeadMasterCode(type.getFeeType())
						.tenantId(tenantId)
						.build();
				demandDetails.add(demandDetail);
			}
		}
		return demandDetails;

	}
}

