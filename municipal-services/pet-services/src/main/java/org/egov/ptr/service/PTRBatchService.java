package org.egov.ptr.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.egov.common.contract.request.RequestInfo;
import org.egov.ptr.config.PetConfiguration;
import org.egov.ptr.models.PetApplicationSearchCriteria;
import org.egov.ptr.models.PetRegistrationApplication;
import org.egov.ptr.models.PetRegistrationRequest;
import org.egov.ptr.producer.Producer;
import org.egov.ptr.repository.PetRegistrationRepository;
import static org.egov.ptr.util.PTRConstants.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PTRBatchService {

	@Value("${ptr.inactivation.tenant.id:pb.ludhiana}")
	private String targetTenantId;

	@Autowired
	private PetConfiguration config;

	@Autowired
	private PetRegistrationRepository repository;

	@Autowired
	private WorkflowService workflowIntegrator;

	@Autowired
	private Producer producer;

	/**
	 * Searches pet applications which are active and expire their status and sends
	 * reminder sms to owner's of the pet license(pending)
	 * 
	 * @param serviceName
	 * @param requestInfo
	 */
	public void getPetApplicationsAndPerformAction(String serviceName, String jobName, RequestInfo requestInfo) {
		if (JOB_NAME_INACTIVE.equalsIgnoreCase(jobName) || "inactivate".equalsIgnoreCase(jobName)) {
			log.info("Starting batch process to inactivate stale INITIATED applications created > 1 month ago");
			inactivateStaleApplications(requestInfo);
			return;
		}

		// Pre-calculate validity date outside the loop
		LocalDate today = LocalDate.now();
		LocalDate nextMarch31 = LocalDate.of(today.getYear(), Month.MARCH, 31);
		if (today.isAfter(nextMarch31)) {
			nextMarch31 = nextMarch31.plusYears(1);
		}
		LocalDateTime nextMarch31At8PM = LocalDateTime.of(nextMarch31, LocalTime.of(20, 0));
		long validityDateUnix = nextMarch31At8PM.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

		List<String> tenantIdsFromRepository = repository.fetchPetApplicationTenantIds();

		tenantIdsFromRepository.forEach(tenantIdFromRepository -> {
			try {
				processTenantApplications(tenantIdFromRepository, validityDateUnix, requestInfo);
			} catch (Exception ex) {
				log.error("Batch process failed for tenant ID: " + tenantIdFromRepository, ex);
			}
		});
	}

	@Scheduled(cron = "${ptr.inactivation.cron:0 0 2 * * ?}")
	public void runScheduledInactivation() {
		log.info("Running automated scheduled cron for inactivating stale INITIATED applications");
		inactivateStaleApplications(null);
	}

	public void inactivateStaleApplications(RequestInfo requestInfo) {
		long oneMonthAgoMs = System.currentTimeMillis() - (30L * 24 * 60 * 60 * 1000L);
		List<String> targetTenants;

		if (targetTenantId == null || targetTenantId.trim().isEmpty() || "ALL".equalsIgnoreCase(targetTenantId.trim())) {
			log.info("Inactivation batch processing ALL tenants from repository");
			targetTenants = repository.fetchPetApplicationTenantIds();
		} else {
			targetTenants = Arrays.stream(targetTenantId.split(","))
					.map(String::trim)
					.filter(t -> !t.isEmpty())
					.collect(Collectors.toList());
			log.info("Inactivation batch processing specified tenants: {}", targetTenants);
		}

		targetTenants.forEach(tenantId -> {
			try {
				inactivateStaleApplicationsForTenant(tenantId, oneMonthAgoMs, requestInfo);
			} catch (Exception ex) {
				log.error("Inactivation batch process failed for tenant ID: " + tenantId, ex);
			}
		});
	}

	private void inactivateStaleApplicationsForTenant(String tenantId, long cutoffTimeMs, RequestInfo requestInfo) {
		int pageSize = 50;
		int offset = 0;

		PetApplicationSearchCriteria criteria = PetApplicationSearchCriteria.builder()
				.tenantId(tenantId)
				.status(STATUS_INITIATED)
				.toDate(String.valueOf(cutoffTimeMs))
				.limit(pageSize)
				.build();

		while (true) {
			criteria.setOffset(offset);
			log.info("Fetching INITIATED applications for inactivation for tenant {} with offset: {}, limit: {}", tenantId, offset, pageSize);

			List<PetRegistrationApplication> petApplications = repository.getApplications(criteria);

			if (CollectionUtils.isEmpty(petApplications)) {
				log.info("No more INITIATED applications found for tenant {}", tenantId);
				break;
			}

			// Directly update status to INACTIVE without workflow transition
			petApplications.forEach(petApplication -> {
				petApplication.setStatus(STATUS_INACTIVE);
				if (petApplication.getAuditDetails() != null) {
					petApplication.getAuditDetails().setLastModifiedTime(System.currentTimeMillis());
					if (requestInfo != null && requestInfo.getUserInfo() != null) {
						petApplication.getAuditDetails().setLastModifiedBy(requestInfo.getUserInfo().getUuid());
					}
				}
			});

			try {
				PetRegistrationRequest petRegistrationRequest = new PetRegistrationRequest(requestInfo, petApplications);
				producer.push(config.getUpdatePtrTopic(), petRegistrationRequest);
				log.info("Successfully pushed {} inactivated applications to Kafka for tenant: {}", petApplications.size(), tenantId);
			} catch (Exception e) {
				log.error("Failed to push inactivated pet applications batch for tenant: " + tenantId, e);
			}

			offset += pageSize;
		}
	}

	private void processTenantApplications(String tenantId, long validityDateUnix, RequestInfo requestInfo) {
		PetApplicationSearchCriteria criteria = PetApplicationSearchCriteria.builder().validityDate(validityDateUnix)
				.status(STATUS_APPROVED).tenantId(tenantId).build();

		int offset = 0;
//		int pageSize = config.getPaginationSize();

		while (true) {
			// Set pagination for current batch
//			criteria.setOffset(offset);
//			criteria.setLimit(pageSize);

			log.info("Fetching applications with offset: " + offset);

			List<PetRegistrationApplication> petApplications = repository.getApplications(criteria);

			// If no more applications, break the loop
			if (CollectionUtils.isEmpty(petApplications)) {
				break;
			}

			// Expire and update applications
			expireAndUpdatePetApplications(requestInfo, petApplications);

			// Move to the next batch
//			offset += pageSize;
		}
	}

	private void expireAndUpdatePetApplications(RequestInfo requestInfo,
			List<PetRegistrationApplication> petApplications) {
		// Expire applications
		petApplications.forEach(petApplication -> {
			petApplication.setExpireFlag(true);
			petApplication.setStatus(STATUS_EXPIRED);
		});

		try {
			// Update applications in batch
			PetRegistrationRequest petRegistrationRequest = new PetRegistrationRequest(requestInfo, petApplications);
			producer.push(config.getUpdatePtrTopic(), petRegistrationRequest);
		} catch (Exception e) {
			log.error("Failed to update pet applications batch.", e);
		}

		try {
			// Update workflow status in batch
			PetRegistrationRequest petRegistrationRequest = new PetRegistrationRequest(requestInfo, petApplications);
			workflowIntegrator.updateWorkflowStatus(petRegistrationRequest);
		} catch (Exception e) {
			log.error("Workflow status update failed for expiring applications.", e);
		}
	}

}

