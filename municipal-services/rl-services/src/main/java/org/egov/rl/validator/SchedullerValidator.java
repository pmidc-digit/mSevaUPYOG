package org.egov.rl.validator;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.NotificationSchedule;
import org.egov.rl.models.SchedullerRequest;
import org.egov.rl.repository.AllotmentRepository;
import org.egov.rl.repository.ClsureRepository;
import org.egov.rl.util.EncryptionDecryptionUtil;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class SchedullerValidator {

	@Autowired
	private RentLeaseConfiguration configs;

	@Autowired
	RestTemplate restTemplate;// = new RestTemplate();

	@Autowired
	AllotmentRepository allotmentRepository;

	@Autowired
	ClsureRepository clsureRepository;

	@Autowired
	EncryptionDecryptionUtil encryptionDecryptionUtil;

	/**
	 * Validate the masterData and ctizenInfo of the given propertyRequest
	 * 
	 * @param request PropertyRequest for create
	 */
	public void validateCreateSchedullerRequest(SchedullerRequest schedullerRequest) {

		NotificationSchedule notificationSchedule = schedullerRequest.getScheduller().stream().findFirst().orElse(null);

		if (notificationSchedule == null)
			throw new CustomException("SCHEDULLER INFO ERROR",
					"SCHEDULLER cannot be empty, please provide the SCHEDULLER information");
//
//			if (schedullerRequest.getTenantId() == null) {
//				throw new CustomException("CLSURE INFO ERROR",
//						"tenant_id can't be null or empty, please provide the CLSURE information");
//			}

//		AllotmentCriteria allotmentCriteria = new AllotmentCriteria();
//		Set<String> applicationNumber = new HashSet<>();
//		applicationNumber.add(notificationSchedule.getApplicationNumber());
//		allotmentCriteria.setApplicationNumbers(applicationNumber);
//
//		AllotmentDetails alllAllotmentDetails = allotmentRepository.getAllotmentByApplicationNumber(allotmentCriteria)
//				.stream().findAny().orElse(null);
//		if (alllAllotmentDetails == null) {
//			throw new CustomException("SCHEDULLER INFO ERROR",
//					"Enter valid applicationNumber , please provide the applicationNumber information");
//		}
	}

}
