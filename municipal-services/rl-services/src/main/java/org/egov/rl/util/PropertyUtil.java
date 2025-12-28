package org.egov.rl.util;

import static org.egov.rl.util.RLConstants.ASMT_MODULENAME;
import static org.egov.rl.util.RLConstants.BILL_AMOUNT_PATH;
import static org.egov.rl.util.RLConstants.BILL_NO_DEMAND_ERROR_CODE;
import static org.egov.rl.util.RLConstants.BILL_NO_PAYABLE_DEMAND_ERROR_CODE;
import static org.egov.rl.util.RLConstants.RL_MASTER_MODULE_NAME;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import net.minidev.json.JSONArray;


import net.logstash.logback.encoder.org.apache.commons.lang.StringUtils;
import org.egov.common.contract.request.RequestInfo;
import org.egov.common.contract.request.Role;
import org.egov.common.contract.request.User;
import org.egov.mdms.model.MasterDetail;
import org.egov.mdms.model.MdmsCriteria;
import org.egov.mdms.model.MdmsCriteriaReq;
import org.egov.mdms.model.MdmsResponse;
import org.egov.mdms.model.ModuleDetail;
import org.egov.rl.config.RentLeaseConfiguration;
import org.egov.rl.models.AdditionalFeeRate;
import org.egov.rl.models.RLProperty;
import org.egov.rl.models.TaxRate;
import org.egov.rl.repository.ServiceRequestRepository;
import org.egov.rl.service.BoundaryService;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PropertyUtil extends CommonUtils {

	
		@Autowired
		private ServiceRequestRepository restRepo;

		@Autowired
		private ObjectMapper mapper;

		@Autowired
		private RentLeaseConfiguration config;
		
		@Autowired
		BoundaryService boundaryService;


	
	}
