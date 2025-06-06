package org.egov.ndc.util;

import org.springframework.stereotype.Component;

@Component
public class NDCConstants {

	public static final String SEARCH_MODULE = "rainmaker-ndcsrv";
	
	public static final String NDC_MODULE = "NDC";
	public static final String NDC_BUSINESS_SERVICE = "ndc-services";

	public static final String NDC_TYPE = "NdcType";
	
	// mdms path codes

    public static final String NDC_JSONPATH_CODE = "$.MdmsRes.NDC";

    // error constants

	public static final String INVALID_TENANT_ID_MDMS_KEY = "INVALID TENANTID";

	public static final String INVALID_TENANT_ID_MDMS_MSG = "No data found for this tenentID";

	public static final String APPROVED_STATE = "APPROVED";	
	
	public static final String AUTOAPPROVED_STATE = "AUTO_APPROVED";	
	
	public static final String ACTION_APPROVE = "APPROVE";	
	
	public static final String ACTION_AUTO_APPROVE="AUTO_APPROVE";
	
	public static final String MODE = "mode";	
	
	public static final String ONLINE_MODE = "online";	
	
	public static final String OFFLINE_MODE = "offline";	
	
	public static final String ONLINE_WF = "onlineWF";	

	public static final String OFFLINE_WF = "offlineWF";
	
	public static final String ACTION_REJECT = "REJECT";	
	
	public static final String WORKFLOWCODE = "workflowCode";	
	
    public static final String NDCTYPE_JSONPATH_CODE = "$.MdmsRes.NDC.NdcType";
    
    public static final String NDC_DOC_TYPE_MAPPING = "DocumentTypeMapping";
    
	public static final String DOCUMENT_TYPE = "DocumentType";
	
	public static final String COMMON_MASTERS_MODULE = "common-masters";
	    
	public static final String COMMON_MASTER_JSONPATH_CODE = "$.MdmsRes.common-masters";
	
    public static final String CREATED_STATUS = "CREATED";	
    
	public static final String ACTION_VOID = "VOID";	
	
	public static final String VOIDED_STATUS = "VOIDED";	
	
	public static final String ACTION_INITIATE = "INITIATE";	

	public static final String INITIATED_TIME = "SubmittedOn";	
	
	//sms notification

	public static final String ACTION_STATUS_CREATED = "null_CREATED";
	
	public static final String ACTION_STATUS_INITIATED = "INITIATE_INPROGRESS";
	
	public static final String ACTION_STATUS_REJECTED = "REJECT_REJECTED";
	
	public static final String ACTION_STATUS_APPROVED = "APPROVE_APPROVED";
	
	public static final String FIRE_NDC_TYPE = "FIRE_NDC";
	
	public static final String AIRPORT_NDC_TYPE = "AIRPORT_AUTHORITY";

	public static final String PARSING_ERROR = "PARSING_ERROR";

    public static final String PROPERTY_BUSINESS_SERVICE_CODE = "PT";
	public static final String WATER_TAX_SERVICE_CODE = "WS";
	public static final String SEWERAGE_TAX_SERVICE_CODE = "SW";
}
