package org.egov.rl.services.service;

import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.egov.rl.services.models.Address;
import org.egov.rl.services.models.AllotmentCriteria;
import org.egov.rl.services.models.AllotmentDetails;
import org.egov.rl.services.models.OwnerInfo;
import org.egov.rl.services.models.PropertyReport;
import org.egov.rl.services.models.PropertyReportSearchRequest;
import org.egov.rl.services.models.RLProperty;
import org.egov.rl.services.models.enums.Status;
import org.egov.rl.services.models.user.User;
import org.egov.rl.services.repository.AllotmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SearchPropertyService {

	@Value("${egov.location.host}")
	private String locationHost;

	@Value("${egov.location.context.path}")
	private String locationContextPath;

	@Value("${egov.location.endpoint}")
	private String locationEndpoint;

	@Autowired
	private AllotmentRepository allotmentRepository;

	@Autowired
	RestTemplate restTemplate;

	@Autowired
	BoundaryService boundaryService;
	
	@Autowired
	AllotmentService allotmentService;
	
	@Autowired
	UserService userService;


	public Object propertyListSearch(PropertyReportSearchRequest propertyReportSearchRequest) {
		AllotmentCriteria allotmentCriteria = new AllotmentCriteria();
		allotmentCriteria.setFromDate(propertyReportSearchRequest.getSearchProperty().getFromDate());
		allotmentCriteria.setToDate(propertyReportSearchRequest.getSearchProperty().getToDate());
//		allotmentCriteria.setFromDate(1764547200000l);
//		allotmentCriteria.setToDate(1825094400000l);

		Set<String> allotmentId = new HashSet<>();
		allotmentId.add(propertyReportSearchRequest.getSearchProperty().getAllotmentId());
		allotmentCriteria.setAllotmentIds(allotmentId);
		Set<Status> status = new HashSet<>();
		status.add(Status.APPROVED);
		status.add(Status.REQUEST_FOR_DISCONNECTION);
		allotmentCriteria.setTenantId(propertyReportSearchRequest.getSearchProperty().getTenantId());
		List<AllotmentDetails> allotmentDetailsList = allotmentRepository.getAllotmentSearch(allotmentCriteria).stream().map(d->{
			AllotmentDetails al1=d;
			al1.setOwnerInfo(userList(d, propertyReportSearchRequest.getSearchProperty().getTenantId()));
			return al1;
		}).collect(Collectors.toList());
		
		List<String> propertyIdList = allotmentDetailsList.stream().map(d -> d.getPropertyId())
				.collect(Collectors.toList());
		List<RLProperty> propertyList = boundaryService.loadPropertyData(propertyReportSearchRequest);
		boolean isVacant = propertyReportSearchRequest.getSearchProperty().getSearchType().equals("1");
		Object propertyLists = isVacant
				? (propertyList.stream().filter(prop -> !propertyIdList.contains(prop.getPropertyId()))
						.collect(Collectors.toList()))
				: (propertyList.stream().filter(prop -> propertyIdList.contains(prop.getPropertyId())).map(d -> {
					AllotmentDetails al = allotmentDetailsList.stream().filter(d2 -> d2.getPropertyId().equals(d.getPropertyId())).collect(Collectors.toList()).get(0);
					LocalDate endDate = new Date(al.getEndDate()).toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
					LocalDate currentDate = LocalDate.now();
					// Calculate difference
					Period period = Period.between(endDate, currentDate);
					String months = String.valueOf(period.getMonths()).replace("-", "");
					String days = String.valueOf(period.getDays()).replace("-", "");
                    String afterProperty="after "+months+" month "+days+" day"+(Long.valueOf(days)>1?"s":"")+" expaire".replaceAll("-", "");
                   return PropertyReport.builder().exapire(afterProperty).allocatedTo(al.getOwnerInfo()).property(d).build();
				}).collect(Collectors.toList()));

		return propertyLists;
	}
	
	private List<OwnerInfo> userList(AllotmentDetails allotmentDetails,String tenantIds){
		List<OwnerInfo> ownerList=allotmentDetails.getOwnerInfo().stream().map(u->{
			String[] tenantId=tenantIds.split("\\.");
			User userDetails=userService.searchByUuid(u.getUserUuid(),tenantId.length>1?tenantId[0]:tenantIds).getUser().get(0);
			String names=userDetails.getName();
			u.setName(names);
			Address permemantAddress=Address.builder()
					.addressLine1(userDetails.getPermanentAddress())
					.city(userDetails.getPermanentCity())
					.pincode(userDetails.getPermanentPincode())
					.build();
			u.setPermanentAddress(permemantAddress);
			Address crosAddress=Address.builder()
					.addressLine1(userDetails.getCorrespondenceAddress())
					.city(userDetails.getCorrespondenceCity())
					.pincode(userDetails.getCorrespondencePincode())
					.build();
			u.setCorrespondenceAddress(crosAddress);
			u.setMobileNo(userDetails.getMobileNumber());
			u.setEmailId(userDetails.getEmailId());
			u.setDob(userDetails.getDob());
			u.setActive(userDetails.getActive());
			return u;
		}).collect(Collectors.toList());
		
		return ownerList;
	}


}
