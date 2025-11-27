package org.egov.rl.service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AllotmentCriteria;
import org.egov.rl.models.AllotmentDetails;
import org.egov.rl.models.AllotmentRequest;
import org.egov.rl.models.PropertyReportSearchRequest;
import org.egov.rl.models.RLProperty;
import org.egov.rl.repository.AllotmentRepository;
import org.egov.rl.repository.ServiceRequestRepository;
import org.egov.rl.util.EncryptionDecryptionUtil;
import org.egov.rl.validator.AllotmentValidator;
import org.egov.rl.workflow.AllotmentWorkflowService;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
	private RentLeaseConfiguration configs;

	@Autowired
	RestTemplate restTemplate;// = new RestTemplate();
	
	@Autowired
	private AllotmentEnrichmentService allotmentEnrichmentService;

	@Autowired
	BoundaryService boundaryService;

	@Autowired
    private ObjectMapper mapper;
		
	public List<RLProperty> propertyListSearch(PropertyReportSearchRequest propertyReportSearchRequest){
		AllotmentCriteria allotmentCriteria=new AllotmentCriteria();
		
		Set<String> id=new HashSet<>();
		id.add(propertyReportSearchRequest.getSearchProperty().getAllotmentId());
		allotmentCriteria.setAllotmentIds(id);
		allotmentCriteria.setTenantId(propertyReportSearchRequest.getSearchProperty().getTenantId());
		List<AllotmentDetails> allotmentDetailsList=allotmentRepository.getAllotedByTanentIds(allotmentCriteria);
		List<String> propertyIdList=allotmentDetailsList.stream().map(d->d.getPropertyId()).collect(Collectors.toList());
		List<RLProperty> propertyList=boundaryService.loadPropertyData(propertyReportSearchRequest);
		boolean isVacant=propertyReportSearchRequest.getSearchProperty().getSearchType().equals("1");
		
		List<RLProperty> propertyLists = isVacant?(propertyList.stream()
	                .filter(prop ->!propertyIdList.contains(prop.getPropertyId()))
	                .collect(Collectors.toList())):(propertyList.stream()
	    	                .filter(prop ->propertyIdList.contains(prop.getPropertyId()))
	    	                .collect(Collectors.toList()));
		 
		 return propertyLists;
	}


}
