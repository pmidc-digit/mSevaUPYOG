package org.egov.wscalculation.service;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.wscalculation.config.WSCalculationConfiguration;
import org.egov.wscalculation.repository.ServiceRequestRepository;
import org.egov.wscalculation.web.models.AuditDetails;
import org.egov.wscalculation.web.models.Connection;
import org.egov.wscalculation.web.models.MeterConnectionRequest;
import org.egov.wscalculation.web.models.WaterConnection;
import org.springframework.beans.factory.annotation.Autowired;
import org.egov.wscalculation.web.models.MeterConnectionRequests;
import org.egov.wscalculation.web.models.MeterReadingList;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.egov.wscalculation.web.models.BulkMeterReading;
import org.egov.wscalculation.web.models.MeterReading;
import org.springframework.util.CollectionUtils;

import static org.egov.wscalculation.constants.WSCalculationConstant.*;

@Service
@Slf4j
public class EnrichmentService {

	/**
	 * Enriches the incoming createRequest
	 * 
	 * @param meterConnectionRequest The create request for the meter reading
	 */
	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
	private WSCalculationConfiguration config;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	public void enrichMeterReadingRequest(MeterConnectionRequest meterConnectionRequest) {
		AuditDetails auditDetails = getAuditDetails(meterConnectionRequest.getRequestInfo().getUserInfo().getUuid(),
				true);
		meterConnectionRequest.getMeterReading().setId(UUID.randomUUID().toString());
		if (meterConnectionRequest.getMeterReading().getLastReadingDate() == null
				|| meterConnectionRequest.getMeterReading().getLastReadingDate() == 0) {
			Long lastReadingDate = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(30);
			meterConnectionRequest.getMeterReading().setLastReadingDate(lastReadingDate);
		}
		meterConnectionRequest.getMeterReading().setAuditDetails(auditDetails);
	}
	
	/**
     * Method to return auditDetails for create/update flows
     *
     * @param by - UUID of the User
     * @param isCreate - TRUE in case of create scenario and FALSE for modify scenario.
     * @return AuditDetails
     */
    public AuditDetails getAuditDetails(String by, Boolean isCreate) {
        Long time = System.currentTimeMillis();
        if(isCreate)
            return AuditDetails.builder().createdBy(by).lastModifiedBy(by).createdTime(time).lastModifiedTime(time).build();
        else
            return AuditDetails.builder().lastModifiedBy(by).lastModifiedTime(time).build();
    }

	public List<WaterConnection> filterConnections(List<WaterConnection> connectionList) {
		HashMap<String, Connection> connectionHashMap = new HashMap<>();
		connectionList.forEach(connection -> {
			if (!StringUtils.isEmpty(connection.getConnectionNo())) {
				if (connectionHashMap.get(connection.getConnectionNo()) == null
						&& FINAL_CONNECTION_STATES.contains(connection.getApplicationStatus())) {
					connectionHashMap.put(connection.getConnectionNo(), connection);
				} else if (connectionHashMap.get(connection.getConnectionNo()) != null
						&& FINAL_CONNECTION_STATES.contains(connection.getApplicationStatus())) {
					if (connectionHashMap.get(connection.getConnectionNo()).getApplicationStatus()
							.equals(connection.getApplicationStatus())) {
						HashMap additionalDetail1 = new HashMap<>();
						HashMap additionalDetail2 = new HashMap<>();
						additionalDetail1 = mapper.convertValue(
								connectionHashMap.get(connection.getConnectionNo()).getAdditionalDetails(),
								HashMap.class);
						additionalDetail2 = mapper.convertValue(connection.getAdditionalDetails(), HashMap.class);
						BigDecimal creationDate1 = (BigDecimal) additionalDetail1.get(APP_CREATED_DATE);
						BigDecimal creationDate2 = (BigDecimal) additionalDetail2.get(APP_CREATED_DATE);
						if (creationDate1.compareTo(creationDate2) == -1) {
							connectionHashMap.put(connection.getConnectionNo(), connection);
						}
					} else if (connection.getApplicationStatus().equals(MODIFIED_FINAL_STATE)) {
							connectionHashMap.put(connection.getConnectionNo(), connection);
						}
				}
			}
		});
		return new ArrayList(connectionHashMap.values());
	}
	
	public void enrichUserNames(List<MeterReading> meterReadings, RequestInfo requestInfo, String tenantId) {
		if (CollectionUtils.isEmpty(meterReadings)) return;
		Set<String> uuids = new HashSet<>();
		for (MeterReading meterReading : meterReadings) {
			if (meterReading.getAuditDetails() != null) {
				if (!StringUtils.isEmpty(meterReading.getAuditDetails().getCreatedBy())) {
					uuids.add(meterReading.getAuditDetails().getCreatedBy());
				}
				if (!StringUtils.isEmpty(meterReading.getAuditDetails().getLastModifiedBy())) {
					uuids.add(meterReading.getAuditDetails().getLastModifiedBy());
				}
			}
		}
		if (uuids.isEmpty()) return;

		Map<String, String> uuidToNameMap = fetchUserNamesByUUIDs(uuids, requestInfo, tenantId);
		for (MeterReading meterReading : meterReadings) {
			if (meterReading.getAuditDetails() != null) {
				if (meterReading.getAuditDetails().getCreatedBy() != null) {
					meterReading.setCreatedByName(uuidToNameMap.get(meterReading.getAuditDetails().getCreatedBy()));
				}
				if (meterReading.getAuditDetails().getLastModifiedBy() != null) {
					meterReading.setLastModifiedByName(uuidToNameMap.get(meterReading.getAuditDetails().getLastModifiedBy()));
				}
			}
		}
	}

	public void enrichBulkMeterUserNames(List<BulkMeterReading> bulkMeterReadings, RequestInfo requestInfo, String tenantId) {
		if (CollectionUtils.isEmpty(bulkMeterReadings)) return;
		Set<String> uuids = new HashSet<>();
		for (BulkMeterReading bulkMeterReading : bulkMeterReadings) {
			if (bulkMeterReading.getAuditDetails() != null) {
				if (!StringUtils.isEmpty(bulkMeterReading.getAuditDetails().getCreatedBy())) {
					uuids.add(bulkMeterReading.getAuditDetails().getCreatedBy());
				}
				if (!StringUtils.isEmpty(bulkMeterReading.getAuditDetails().getLastModifiedBy())) {
					uuids.add(bulkMeterReading.getAuditDetails().getLastModifiedBy());
				}
			}
		}
		if (uuids.isEmpty()) return;

		Map<String, String> uuidToNameMap = fetchUserNamesByUUIDs(uuids, requestInfo, tenantId);
		for (BulkMeterReading bulkMeterReading : bulkMeterReadings) {
			if (bulkMeterReading.getAuditDetails() != null) {
				if (bulkMeterReading.getAuditDetails().getCreatedBy() != null) {
					bulkMeterReading.setCreatedByName(uuidToNameMap.get(bulkMeterReading.getAuditDetails().getCreatedBy()));
				}
				if (bulkMeterReading.getAuditDetails().getLastModifiedBy() != null) {
					bulkMeterReading.setLastModifiedByName(uuidToNameMap.get(bulkMeterReading.getAuditDetails().getLastModifiedBy()));
				}
			}
		}
	}

	private Map<String, String> fetchUserNamesByUUIDs(Set<String> uuids, RequestInfo requestInfo, String tenantId) {
		Map<String, String> uuidToNameMap = new HashMap<>();
		if (CollectionUtils.isEmpty(uuids)) {
			return uuidToNameMap;
		}

		User userInfoCopy = requestInfo != null ? requestInfo.getUserInfo() : null;
		try {
			String host = config.getUserHost();
			String endpoint = config.getUserSearchEndpoint();
			if (host != null && host.endsWith("/") && endpoint != null && endpoint.startsWith("/")) {
				endpoint = endpoint.substring(1);
			}
			StringBuilder uri = new StringBuilder();
			uri.append(host).append(endpoint);

			String searchTenantId = !StringUtils.isEmpty(tenantId) ? tenantId : "pb";
			String rootTenantId = searchTenantId.split("\\.")[0];

			Role role = Role.builder()
					.name("Internal Microservice Role").code("INTERNAL_MICROSERVICE_ROLE")
					.tenantId(rootTenantId).build();

			User internalUser = User.builder()
					.uuid(config.getEgovInternalMicroserviceUserUuid())
					.type("SYSTEM")
					.roles(Collections.singletonList(role))
					.id(0L)
					.build();

			if (requestInfo == null) {
				requestInfo = new RequestInfo();
			}
			requestInfo.setUserInfo(internalUser);

			Map<String, Object> userSearchRequest = new HashMap<>();
			userSearchRequest.put("RequestInfo", requestInfo);
			userSearchRequest.put("tenantId", searchTenantId);
			userSearchRequest.put("uuid", new ArrayList<>(uuids));

			log.info("Searching users with URI: {} and UUIDs: {} for tenantId: {}", uri, uuids, searchTenantId);
			LinkedHashMap<String, Object> responseMap = (LinkedHashMap<String, Object>) serviceRequestRepository.fetchResult(uri, userSearchRequest);
			
			if (responseMap != null) {
				List<LinkedHashMap<String, Object>> users = null;
				if (responseMap.get("user") != null) {
					users = (List<LinkedHashMap<String, Object>>) responseMap.get("user");
				} else if (responseMap.get("User") != null) {
					users = (List<LinkedHashMap<String, Object>>) responseMap.get("User");
				}

				if (!CollectionUtils.isEmpty(users)) {
					for (LinkedHashMap<String, Object> userMap : users) {
						String uuid = (String) userMap.get("uuid");
						String name = (String) userMap.get("name");
						if (StringUtils.isEmpty(name)) {
							name = (String) userMap.get("userName");
						}
						if (uuid != null) {
							uuidToNameMap.put(uuid, name);
						}
					}
				}
			}
			log.info("Fetched uuidToNameMap: {}", uuidToNameMap);
		} catch (Exception e) {
			log.error("Exception while fetching user details for UUIDs: {}", uuids, e);
		} finally {
			if (requestInfo != null) {
				requestInfo.setUserInfo(userInfoCopy);
			}
		}
		return uuidToNameMap;
	}

}
