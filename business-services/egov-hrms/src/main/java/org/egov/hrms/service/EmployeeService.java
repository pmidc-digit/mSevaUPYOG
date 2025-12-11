/*
 * eGov suite of products aim to improve the internal efficiency,transparency,
 * accountability and the service delivery of the government  organizations.
 *
 *  Copyright (C) 2016  eGovernments Foundation
 *
 *  The updated version of eGov suite of products as by eGovernments Foundation
 *  is available at http://www.egovernments.org
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see http://www.gnu.org/licenses/ or
 *  http://www.gnu.org/licenses/gpl.html .
 *
 *  In addition to the terms of the GPL license to be adhered to in using this
 *  program, the following additional terms are to be complied with:
 *
 *      1) All versions of this program, verbatim or modified must carry this
 *         Legal Notice.
 *
 *      2) Any misrepresentation of the origin of the material is prohibited. It
 *         is required that all modified versions of this material be marked in
 *         reasonable ways as different from the original version.
 *
 *      3) This license does not grant any rights to any user of the program
 *         with regards to rights under trademark law for use of the trade names
 *         or trademarks of eGovernments Foundation.
 *
 *  In case of any queries, you can reach eGovernments Foundation at contact@egovernments.org.
 */

package org.egov.hrms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.response.ResponseInfo;
import org.egov.hrms.config.PropertiesManager;
import org.egov.hrms.model.AuditDetails;
import org.egov.hrms.model.Employee;
import org.egov.hrms.model.EmployeeWithWard;
import org.egov.hrms.model.EmployeewardResponse;
import org.egov.hrms.model.ObpasEmployee;
import org.egov.hrms.model.enums.UserType;
import org.egov.hrms.producer.HRMSProducer;
import org.egov.hrms.repository.EmployeeRepository;
import org.egov.hrms.utils.ErrorConstants;
import org.egov.hrms.utils.HRMSConstants;
import org.egov.hrms.utils.HRMSUtils;
import org.egov.hrms.utils.ResponseInfoFactory;
import org.egov.hrms.web.contract.*;
import org.egov.tracer.kafka.LogAwareKafkaTemplate;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Data
@Slf4j
@Service
public class EmployeeService {


	@Autowired
	private UserService userService;

	@Autowired
	private IdGenService idGenService;

	@Autowired
	private ResponseInfoFactory factory;

	@Autowired
	private LogAwareKafkaTemplate<String, Object> kafkaTemplate;

	@Autowired
	private PropertiesManager propertiesManager;

	@Autowired
	private HRMSProducer hrmsProducer;
	
	@Autowired
	private EmployeeRepository repository;
	
	@Autowired
	private HRMSUtils hrmsUtils;
	
	@Autowired
	private NotificationService notificationService;
	
	@Autowired
	private ObjectMapper objectMapper;

	/**
	 * Service method for create employee. Does following:
	 * 1. Sets ids to all the objects using idgen service.
	 * 2. Enriches the employee object with required parameters
	 * 3. Creates user in the egov-user service.
	 * 4. Sends notification upon successful creation
	 * 
	 * @param employeeRequest
	 * @return
	 */
	public EmployeeResponse create(EmployeeRequest employeeRequest) {
		RequestInfo requestInfo = employeeRequest.getRequestInfo();
		Map<String, String> pwdMap = new HashMap<>();
		idGenService.setIds(employeeRequest);
		employeeRequest.getEmployees().stream().forEach(employee -> {
			enrichCreateRequest(employee, requestInfo);
			createUser(employee, requestInfo);
			pwdMap.put(employee.getUuid(), employee.getUser().getPassword());
			employee.getUser().setPassword(null);
		});
		hrmsProducer.push(propertiesManager.getSaveEmployeeTopic(), employeeRequest);
		notificationService.sendNotification(employeeRequest, pwdMap);
		return generateResponse(employeeRequest);
	}
	
	
	public ObpassEmployeeResponse create(ObpasEmployeeRequest employeeRequest) {

	    RequestInfo requestInfo = employeeRequest.getRequestInfo();

	    for (ObpasEmployee employee : employeeRequest.getEmployees()) {

	        // 1️⃣ Check if user exists in HRMS using UUID
	        Map<String, Object> userSearchCriteria = new HashMap<>();
	        userSearchCriteria.put("tenantId", employee.getTenantId());
	        userSearchCriteria.put("uuid", Collections.singletonList(employee.getUserUUID())); // ✅ wrap in list

	        UserResponse userResponse = userService.getUser(requestInfo, userSearchCriteria);

	        if (CollectionUtils.isEmpty(userResponse.getUser())) {
	            throw new RuntimeException(
	                "User with UUID " + employee.getUserUUID() +
	                " does not exist in tenant " + employee.getTenantId()
	            );
	        }
	        enrichObpasCreateRequest(employee, requestInfo);
	    }

	    // 4️⃣ Push to Kafka
	    hrmsProducer.push(propertiesManager.getSaveObpasEmployeeTopic(), employeeRequest);

	    // 5️⃣ Generate response
	    return generateObpassResponse(employeeRequest);
	}

	public ObpassEmployeeResponse delete(ObpasEmployeeRequest deleteRequest) {

	    RequestInfo requestInfo = deleteRequest.getRequestInfo();
	    List<ObpasEmployee> employeesToDelete = new ArrayList<>();

	    for (ObpasEmployee criteria : deleteRequest.getEmployees()) {

	        // 1️⃣ tenantId must always be present
	        if (StringUtils.isEmpty(criteria.getTenantId())) {
	            throw new CustomException(
	                    ErrorConstants.OBPAS_INVALID_SEARCH_TENANT_CODE,
	                    ErrorConstants.OBPAS_INVALID_SEARCH_TENANT_MSG
	            );
	        }

	        // -------------------------
	        // VALIDATION LOGIC
	        // -------------------------

	        // 2️⃣ If uuid is present → either accept UUID only OR UUID + all other fields
	        if (!StringUtils.isEmpty(criteria.getUuid())) {

	            boolean anyOtherFieldPresent =
	                    !StringUtils.isEmpty(criteria.getUserUUID()) ||
	                    !StringUtils.isEmpty(criteria.getCategory()) ||
	                    !StringUtils.isEmpty(criteria.getSubcategory()) ||
	                    !StringUtils.isEmpty(criteria.getZone()) ||
	                    !StringUtils.isEmpty(criteria.getAssignedTenantId());

	            boolean anyOtherFieldMissing =
	                    StringUtils.isEmpty(criteria.getUserUUID()) ||
	                    StringUtils.isEmpty(criteria.getCategory()) ||
	                    StringUtils.isEmpty(criteria.getSubcategory()) ||
	                    StringUtils.isEmpty(criteria.getZone()) ||
	                    StringUtils.isEmpty(criteria.getAssignedTenantId());

	            // ❌ invalid mix: some fields present, some missing
	            if (anyOtherFieldPresent && anyOtherFieldMissing) {
	                throw new CustomException(
	                        "OBPAS_INVALID_DELETE_CRITERIA",
	                        "When uuid is provided, either provide NO other fields or ALL fields together."
	                );
	            }

	            // uuid case is valid → proceed
	        }

	        // 3️⃣ If uuid is NOT present → all other fields mandatory INCLUDING userUUID
	        else {
	            if (StringUtils.isEmpty(criteria.getUserUUID()) ||
	                StringUtils.isEmpty(criteria.getCategory()) ||
	                StringUtils.isEmpty(criteria.getSubcategory()) ||
	                StringUtils.isEmpty(criteria.getZone()) ||
	                StringUtils.isEmpty(criteria.getAssignedTenantId())) {

	                throw new CustomException(
	                        "OBPAS_INVALID_DELETE_CRITERIA",
	                        "Either provide uuid OR provide userUUID, category, subcategory, zone, and assignedTenantId for tenant "
	                                + criteria.getTenantId()
	                );
	            }
	        }

	        // -------------------------
	        // BUILD SEARCH CRITERIA
	        // -------------------------

	        ObpasEmployeeSearchCriteria searchCriteria = new ObpasEmployeeSearchCriteria();
	        searchCriteria.setTenantId(criteria.getTenantId());

	        // If uuid is present → search only by uuid + tenantId
	        if (!StringUtils.isEmpty(criteria.getUuid())) {
	            searchCriteria.setUuid(criteria.getUuid());
	        } 
	        else {
	            // search by full criteria
	            searchCriteria.setUserUUID(criteria.getUserUUID());
	            searchCriteria.setCategory(criteria.getCategory());
	            searchCriteria.setSubcategory(criteria.getSubcategory());
	            searchCriteria.setZone(criteria.getZone());
	            searchCriteria.setAssignedTenantId(criteria.getAssignedTenantId());
	        }

	        // -------------------------
	        // SEARCH EMPLOYEES
	        // -------------------------

	        ObpassEmployeeResponse searchResponse = obpasSearch(searchCriteria, requestInfo);

	        if (CollectionUtils.isEmpty(searchResponse.getEmployees())) {
	            throw new CustomException(
	                    "EMPLOYEE_NOT_FOUND",
	                    "No employee found for the given criteria in tenant " + criteria.getTenantId()
	            );
	        }

	        // -------------------------
	        // BUILD DELETE LIST
	        // -------------------------

	        for (ObpasEmployee emp : searchResponse.getEmployees()) {

	            ObpasEmployee empToDelete = new ObpasEmployee();
	            empToDelete.setUuid(emp.getUuid());               // required for delete
	            empToDelete.setTenantId(emp.getTenantId());       // required for delete
	            empToDelete.setUserUUID(emp.getUserUUID());       // optional but useful

	            employeesToDelete.add(empToDelete);
	        }
	    }

	 
	    Map<String, Object> kafkaPayload = new HashMap<>();
	    kafkaPayload.put("Employees", employeesToDelete);

	    hrmsProducer.push(propertiesManager.getDeleteObpasEmployeeTopic(), kafkaPayload);

	    return ObpassEmployeeResponse.builder()
	            .responseInfo(factory.createResponseInfoFromRequestInfo(deleteRequest.getRequestInfo(), true))
	            .employees(employeesToDelete)
	            .build();

	}

	

	  
	private void enrichObpasCreateRequest(ObpasEmployee employee, RequestInfo requestInfo) {
	    if (requestInfo == null || requestInfo.getUserInfo() == null || requestInfo.getUserInfo().getUuid() == null) {
	        throw new IllegalArgumentException("RequestInfo or UserInfo UUID cannot be null");
	    }

	    String userId = requestInfo.getUserInfo().getUuid();
	    long now = new Date().getTime();

	    AuditDetails auditDetails = AuditDetails.builder()
	            .createdBy(userId)
	            .createdDate(now)
	            .lastModifiedBy(userId)
	            .lastModifiedDate(now)
	            .build();

	    employee.setAuditDetails(auditDetails);
	}

	
	/**
	 * Searches employees on a given criteria.
	 * 
	 * @param criteria
	 * @param requestInfo
	 * @return
	 */
	public EmployeeResponse search(EmployeeSearchCriteria criteria, RequestInfo requestInfo) {
		boolean  userChecked = false;
		/*if(null == criteria.getIsActive() || criteria.getIsActive())
			criteria.setIsActive(true);
		else
			criteria.setIsActive(false);*/
        Map<String, User> mapOfUsers = new HashMap<String, User>();
		if(!StringUtils.isEmpty(criteria.getPhone()) || !CollectionUtils.isEmpty(criteria.getRoles())) {
            Map<String, Object> userSearchCriteria = new HashMap<>();
            userSearchCriteria.put(HRMSConstants.HRMS_USER_SEARCH_CRITERA_TENANTID,criteria.getTenantId());
            if(!StringUtils.isEmpty(criteria.getPhone()))
                userSearchCriteria.put(HRMSConstants.HRMS_USER_SEARCH_CRITERA_MOBILENO,criteria.getPhone());
            if( !CollectionUtils.isEmpty(criteria.getRoles()) )
                userSearchCriteria.put(HRMSConstants.HRMS_USER_SEARCH_CRITERA_ROLECODES,criteria.getRoles());
            UserResponse userResponse = userService.getUser(requestInfo, userSearchCriteria);
			userChecked =true;
            if(!CollectionUtils.isEmpty(userResponse.getUser())) {
                 mapOfUsers.putAll(userResponse.getUser().stream()
                        .collect(Collectors.toMap(User::getUuid, Function.identity())));
            }
			List<String> userUUIDs = userResponse.getUser().stream().map(User :: getUuid).collect(Collectors.toList());
            if(!CollectionUtils.isEmpty(criteria.getUuids()))
                criteria.setUuids(criteria.getUuids().stream().filter(userUUIDs::contains).collect(Collectors.toList()));
            else
                criteria.setUuids(userUUIDs);
		}
		//checks if above criteria met and result is not  null will check for name search if list of names are given as user search on name is not bulk api

		if(!((!CollectionUtils.isEmpty(criteria.getRoles()) || !StringUtils.isEmpty(criteria.getPhone())) && CollectionUtils.isEmpty(criteria.getUuids()))){
			if(!CollectionUtils.isEmpty(criteria.getNames())) {
				List<String> userUUIDs = new ArrayList<>();
				for(String name: criteria.getNames()) {
					Map<String, Object> userSearchCriteria = new HashMap<>();
					userSearchCriteria.put(HRMSConstants.HRMS_USER_SEARCH_CRITERA_TENANTID,criteria.getTenantId());
					userSearchCriteria.put(HRMSConstants.HRMS_USER_SEARCH_CRITERA_NAME,name);
					UserResponse userResponse = userService.getUser(requestInfo, userSearchCriteria);
					userChecked =true;
					if(!CollectionUtils.isEmpty(userResponse.getUser())) {
						mapOfUsers.putAll(userResponse.getUser().stream()
								.collect(Collectors.toMap(User::getUuid, Function.identity())));
					}
					List<String> uuids = userResponse.getUser().stream().map(User :: getUuid).collect(Collectors.toList());
					userUUIDs.addAll(uuids);
				}
				if(!CollectionUtils.isEmpty(criteria.getUuids()))
					criteria.setUuids(criteria.getUuids().stream().filter(userUUIDs::contains).collect(Collectors.toList()));
				else
					criteria.setUuids(userUUIDs);
			}
		}
		if(userChecked)
			criteria.setTenantId(null);
        List <Employee> employees = new ArrayList<>();
        if(!((!CollectionUtils.isEmpty(criteria.getRoles()) || !CollectionUtils.isEmpty(criteria.getNames()) || !StringUtils.isEmpty(criteria.getPhone())) && CollectionUtils.isEmpty(criteria.getUuids())))
            employees = repository.fetchEmployees(criteria, requestInfo);
        List<String> uuids = employees.stream().map(Employee :: getUuid).collect(Collectors.toList());
        log.info("Active employees are::" + employees.size() + "uuids are :::" + uuids);

		if(!CollectionUtils.isEmpty(uuids)){
            Map<String, Object> UserSearchCriteria = new HashMap<>();
            UserSearchCriteria.put(HRMSConstants.HRMS_USER_SEARCH_CRITERA_UUID,uuids);
            if(mapOfUsers.isEmpty()){
            UserResponse userResponse = userService.getUser(requestInfo, UserSearchCriteria);
			if(!CollectionUtils.isEmpty(userResponse.getUser())) {
				mapOfUsers = userResponse.getUser().stream()
						.collect(Collectors.toMap(User :: getUuid, Function.identity()));
            }
            }
            for(Employee employee: employees){
                employee.setUser(mapOfUsers.get(employee.getUuid()));
            }
		}
		return EmployeeResponse.builder().responseInfo(factory.createResponseInfoFromRequestInfo(requestInfo, true))
				.employees(employees).build();
	}
	
	public ObpassEmployeeResponse obpasSearch(ObpasEmployeeSearchCriteria criteria, RequestInfo requestInfo) {

	    Map<String, String> errorMap = new HashMap<>();

	    // Validate tenantId
	    if (criteria == null || StringUtils.isEmpty(criteria.getTenantId())) {
	        errorMap.put(ErrorConstants.OBPAS_INVALID_SEARCH_TENANT_CODE,
	                     ErrorConstants.OBPAS_INVALID_SEARCH_TENANT_MSG);
	        throw new CustomException(errorMap);
	    }

	    // Fetch results
	    List<ObpasEmployee> employees = repository.fetchObpasEmployees(criteria, requestInfo);

	    return ObpassEmployeeResponse.builder()
	            .responseInfo(factory.createResponseInfoFromRequestInfo(requestInfo, true))
	            .employees(employees)
	            .build();
	}

	
	
	
	
	public EmployeewardResponse searchemployee(EmployeeWithWard criteria, RequestInfo requestInfo) {
	
	    List<EmployeeWithWard> employees = new ArrayList<>();

	    // Fetch employees based on criteria
	    employees = repository.fetchEmployeesward(criteria, requestInfo);

	    return EmployeewardResponse.builder()
	            .responseInfo(factory.createResponseInfoFromRequestInfo(requestInfo, true))
	            .employees(employees)
	            .build();
	}

	
	/**
	 * Creates user by making call to egov-user.
	 * 
	 * @param employee
	 * @param requestInfo
	 */
	private void createUser(Employee employee, RequestInfo requestInfo) {
		enrichUser(employee);
		UserRequest request = UserRequest.builder().requestInfo(requestInfo).user(employee.getUser()).build();
		try {
			UserResponse response = userService.createUser(request);
			User user = response.getUser().get(0);
			employee.setId(user.getId());
			employee.setUuid(user.getUuid());
			employee.getUser().setId(user.getId());
			employee.getUser().setUuid(user.getUuid());
		}catch(Exception e) {
			log.error("Exception while creating user: ",e);
			log.error("request: "+request);
			throw new CustomException(ErrorConstants.HRMS_USER_CREATION_FAILED_CODE, ErrorConstants.HRMS_USER_CREATION_FAILED_MSG);
		}

	}

	/**
	 * Enriches the user object.
	 * 
	 * @param employee
	 */
	private void enrichUser(Employee employee) {
		List<String> pwdParams = new ArrayList<>();
		pwdParams.add(employee.getCode());
		pwdParams.add(employee.getUser().getMobileNumber());
		pwdParams.add(employee.getTenantId());
		pwdParams.add(employee.getUser().getName().toUpperCase());
		employee.getUser().setPassword(hrmsUtils.generatePassword(pwdParams));
		employee.getUser().setUserName(employee.getCode());
		employee.getUser().setActive(true);
		employee.getUser().setType(UserType.EMPLOYEE.toString());
	}

	/**
	 * Enriches employee object by setting parent ids to all the child objects
	 * 
	 * @param employee
	 * @param requestInfo
	 */
	private void enrichCreateRequest(Employee employee, RequestInfo requestInfo) {

		AuditDetails auditDetails = AuditDetails.builder()
				.createdBy(requestInfo.getUserInfo().getUuid())
				.createdDate(new Date().getTime())
				.build();
		
		employee.getJurisdictions().stream().forEach(jurisdiction -> {
			jurisdiction.setId(UUID.randomUUID().toString());
			jurisdiction.setAuditDetails(auditDetails);
			if(null == jurisdiction.getIsActive())
				jurisdiction.setIsActive(true);
		});
		employee.getAssignments().stream().forEach(assignment -> {
			assignment.setId(UUID.randomUUID().toString());
			assignment.setAuditDetails(auditDetails);
			assignment.setPosition(getPosition());
		});
		if(!CollectionUtils.isEmpty(employee.getServiceHistory())) {
			employee.getServiceHistory().stream().forEach(serviceHistory -> {
				serviceHistory.setId(UUID.randomUUID().toString());
				serviceHistory.setAuditDetails(auditDetails);
				if(null == serviceHistory.getIsCurrentPosition())
					serviceHistory.setIsCurrentPosition(false);
			});
		}
		if(!CollectionUtils.isEmpty(employee.getEducation())) {
			employee.getEducation().stream().forEach(educationalQualification -> {
				educationalQualification.setId(UUID.randomUUID().toString());
				educationalQualification.setAuditDetails(auditDetails);
				if(null == educationalQualification.getIsActive())
					educationalQualification.setIsActive(true);
			});
		}
		if(!CollectionUtils.isEmpty(employee.getTests())) {
			employee.getTests().stream().forEach(departmentalTest -> {
				departmentalTest.setId(UUID.randomUUID().toString());
				departmentalTest.setAuditDetails(auditDetails);
				if(null == departmentalTest.getIsActive())
					departmentalTest.setIsActive(true);
			});
		}
		if(!CollectionUtils.isEmpty(employee.getDocuments())) {
			employee.getDocuments().stream().forEach(document -> {
				document.setId(UUID.randomUUID().toString());
				document.setAuditDetails(auditDetails);
			});
		}
		employee.setAuditDetails(auditDetails);
		employee.setIsActive(true);
	}
	
	/**
	 * Fetches next value from the position sequence table
	 * @return
	 */
	public Long getPosition() {
		return repository.fetchPosition();
	}

	/**
	 * Service method to update user. Performs the following:
	 * 1. Enriches the employee object with required parameters.
	 * 2. Updates user by making call to the user service.
	 * 
	 * @param employeeRequest
	 * @return
	 */
	public EmployeeResponse update(EmployeeRequest employeeRequest) {
		RequestInfo requestInfo = employeeRequest.getRequestInfo();
		List <String> uuidList= new ArrayList<>();
		for(Employee employee: employeeRequest.getEmployees()) {
			uuidList.add(employee.getUuid());
		}
		EmployeeResponse existingEmployeeResponse = search(EmployeeSearchCriteria.builder().uuids(uuidList).build(),requestInfo);
		List <Employee> existingEmployees = existingEmployeeResponse.getEmployees();
		employeeRequest.getEmployees().stream().forEach(employee -> {
			enrichUpdateRequest(employee, requestInfo, existingEmployees);
			updateUser(employee, requestInfo);
		});
		hrmsProducer.push(propertiesManager.getUpdateTopic(), employeeRequest);
		//notificationService.sendReactivationNotification(employeeRequest);
		return generateResponse(employeeRequest);
	}
	
	/**
	 * Updates the user by making call to the user service.
	 * 
	 * @param employee
	 * @param requestInfo
	 */
	private void updateUser(Employee employee, RequestInfo requestInfo) {
		UserRequest request = UserRequest.builder().requestInfo(requestInfo).user(employee.getUser()).build();
		try {
			userService.updateUser(request);
		}catch(Exception e) {
			log.error("Exception while updating user: ",e);
			log.error("request: "+request);
			throw new CustomException(ErrorConstants.HRMS_USER_UPDATION_FAILED_CODE, ErrorConstants.HRMS_USER_UPDATION_FAILED_MSG);
		}

	}

	/**
	 * Enriches update request with required parameters.
	 * 
	 * @param employee
	 * @param requestInfo
	 * @param existingEmployeesData
	 */
	private void enrichUpdateRequest(Employee employee, RequestInfo requestInfo, List<Employee> existingEmployeesData) {
		AuditDetails auditDetails = AuditDetails.builder()
				.createdBy(requestInfo.getUserInfo().getUserName())
				.createdDate(new Date().getTime())
				.build();
		Employee existingEmpData = existingEmployeesData.stream().filter(existingEmployee -> existingEmployee.getUuid().equals(employee.getUuid())).findFirst().get();

		employee.getUser().setUserName(employee.getCode());
		if(!employee.getIsActive())
			employee.getUser().setActive(false);
		else
			employee.getUser().setActive(true);

		employee.getJurisdictions().stream().forEach(jurisdiction -> {

			if(null == jurisdiction.getIsActive())
				jurisdiction.setIsActive(true);
			if(jurisdiction.getId()==null) {
				jurisdiction.setId(UUID.randomUUID().toString());
				jurisdiction.setAuditDetails(auditDetails);
			}else{
				if(!existingEmpData.getJurisdictions().stream()
						.filter(jurisdictionData ->jurisdictionData.getId().equals(jurisdiction.getId() ))
						.findFirst().orElse(null)
						.equals(jurisdiction)){
					jurisdiction.getAuditDetails().setLastModifiedBy(requestInfo.getUserInfo().getUserName());
					jurisdiction.getAuditDetails().setLastModifiedDate(new Date().getTime());
				}
			}
		});
		employee.getAssignments().stream().forEach(assignment -> {
			if(assignment.getId()==null) {
				assignment.setId(UUID.randomUUID().toString());
				assignment.setAuditDetails(auditDetails);
			}else {
				if(!existingEmpData.getAssignments().stream()
						.filter(assignmentData -> assignmentData.getId().equals(assignment.getId()))
						.findFirst().orElse(null)
						.equals(assignment)){
					assignment.getAuditDetails().setLastModifiedBy(requestInfo.getUserInfo().getUserName());
					assignment.getAuditDetails().setLastModifiedDate(new Date().getTime());
				}
			}
		});

		if(employee.getServiceHistory()!=null){
			employee.getServiceHistory().stream().forEach(serviceHistory -> {
				if(null == serviceHistory.getIsCurrentPosition())
					serviceHistory.setIsCurrentPosition(false);
				if(serviceHistory.getId()==null) {
					serviceHistory.setId(UUID.randomUUID().toString());
					serviceHistory.setAuditDetails(auditDetails);
				}else {
					if(!existingEmpData.getServiceHistory().stream()
							.filter(serviceHistoryData -> serviceHistoryData.getId().equals(serviceHistory.getId()))
							.findFirst().orElse(null)
							.equals(serviceHistory)){
						serviceHistory.getAuditDetails().setLastModifiedBy(requestInfo.getUserInfo().getUserName());
						serviceHistory.getAuditDetails().setLastModifiedDate(new Date().getTime());
					}
				}
			});

		}

		if(employee.getEducation() != null){
			employee.getEducation().stream().forEach(educationalQualification -> {
				if(null == educationalQualification.getIsActive())
					educationalQualification.setIsActive(true);
				if(educationalQualification.getId()==null) {
					educationalQualification.setId(UUID.randomUUID().toString());
					educationalQualification.setAuditDetails(auditDetails);
				}else {

					if(!existingEmpData.getEducation().stream()
							.filter(educationalQualificationData -> educationalQualificationData.getId().equals(educationalQualification.getId()))
							.findFirst().orElse(null)
							.equals(educationalQualification)){
						educationalQualification.getAuditDetails().setLastModifiedBy(requestInfo.getUserInfo().getUserName());
						educationalQualification.getAuditDetails().setLastModifiedDate(new Date().getTime());
					}
				}
			});

		}

		if(employee.getTests() != null){
			employee.getTests().stream().forEach(departmentalTest -> {

				if(null == departmentalTest.getIsActive())
					departmentalTest.setIsActive(true);
				if(departmentalTest.getId()==null) {
					departmentalTest.setId(UUID.randomUUID().toString());
					departmentalTest.setAuditDetails(auditDetails);
				}else {
					if(!existingEmpData.getTests().stream()
							.filter(departmentalTestData -> departmentalTestData.getId().equals(departmentalTest.getId()))
							.findFirst().orElse(null)
							.equals(departmentalTest)){
						departmentalTest.getAuditDetails().setLastModifiedBy(requestInfo.getUserInfo().getUserName());
						departmentalTest.getAuditDetails().setLastModifiedDate(new Date().getTime());
					}
				}
			});

		}

		if(employee.getDocuments() != null){
			employee.getDocuments().stream().forEach(document -> {
				if(document.getId()==null) {
					document.setId(UUID.randomUUID().toString());
					document.setAuditDetails(auditDetails);
				}else {
					if(!existingEmpData.getDocuments().stream()
							.filter(documentData -> documentData.getId().equals(document.getId()))
							.findFirst().orElse(null)
							.equals(document)){
						document.getAuditDetails().setLastModifiedBy(requestInfo.getUserInfo().getUserName());
						document.getAuditDetails().setLastModifiedDate(new Date().getTime());
					}
				}
			});

		}

		if(employee.getDeactivationDetails() != null){
			employee.getDeactivationDetails().stream().forEach(deactivationDetails -> {
				if(deactivationDetails.getId()==null) {
					deactivationDetails.setId(UUID.randomUUID().toString());
					deactivationDetails.setAuditDetails(auditDetails);
					employee.getDocuments().forEach(employeeDocument -> {
						employeeDocument.setReferenceId( deactivationDetails.getId());
					});
				}else {
					if(!existingEmpData.getDeactivationDetails().stream()
							.filter(deactivationDetailsData -> deactivationDetailsData.getId().equals(deactivationDetails.getId()))
							.findFirst().orElse(null)
							.equals(deactivationDetails)){
						deactivationDetails.getAuditDetails().setLastModifiedBy(requestInfo.getUserInfo().getUserName());
						deactivationDetails.getAuditDetails().setLastModifiedDate(new Date().getTime());
					}
				}
			});

		}
		if(employee.getReactivationDetails() != null){
			employee.getReactivationDetails().stream().forEach(reactivationDetails -> {
				if(reactivationDetails.getId() == null){
					reactivationDetails.setId(UUID.randomUUID().toString());
					reactivationDetails.setAuditDetails(auditDetails);
					employee.getDocuments().forEach(employeeDocument -> {
						employeeDocument.setReferenceId(reactivationDetails.getId());
					});
				}
				else{
					if(!existingEmpData.getReactivationDetails().stream()
							.filter(reactivationDetails1 -> reactivationDetails1.getId().equals(reactivationDetails.getId()))
							.findFirst().orElse(null)
							.equals(reactivationDetails)){
						reactivationDetails.getAuditDetails().setLastModifiedBy(requestInfo.getUserInfo().getUserName());
						reactivationDetails.getAuditDetails().setLastModifiedDate(new Date().getTime());
					}
				}
			});

		}


	}

	private EmployeeResponse generateResponse(EmployeeRequest employeeRequest) {
		return EmployeeResponse.builder()
				.responseInfo(factory.createResponseInfoFromRequestInfo(employeeRequest.getRequestInfo(), true))
				.employees(employeeRequest.getEmployees()).build();
	}
	
	private ObpassEmployeeResponse generateObpassResponse(ObpasEmployeeRequest employeeRequest) {
	    return ObpassEmployeeResponse.builder()
	            .responseInfo(factory.createResponseInfoFromRequestInfo(employeeRequest.getRequestInfo(), true))
	            .employees(employeeRequest.getEmployees())
	            .build();
	}


	public Map<String,Object> getEmployeeCountResponse(RequestInfo requestInfo, String tenantId){
		Map<String,Object> response = new HashMap<>();
		Map<String,String> results = new HashMap<>();
		ResponseInfo responseInfo = factory.createResponseInfoFromRequestInfo(requestInfo, true);

		response.put("ResponseInfo",responseInfo);
		results	= repository.fetchEmployeeCount(tenantId);

		if(CollectionUtils.isEmpty(results) || results.get("totalEmployee").equalsIgnoreCase("0")){
			Map<String,String> error = new HashMap<>();
			error.put("NO_RECORDS","No records found for the tenantId: "+tenantId);
			throw new CustomException(error);
		}

		response.put("EmployeCount",results);
		return  response;
	}

}