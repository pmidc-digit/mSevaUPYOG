package org.egov.rl.util;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class RLConstants {

    private RLConstants() {}
    
    public static final String NEW_RL_APPLICATION = "NEW";

	public static final String RENEWAL_RL_APPLICATION = "RENEWAL";
	
    public static final String APPROVED_RL_APPLICATION = "APPROVE";
    
    public static final String FORWARD_FOR_SATELMENT_RL_APPLICATION = "FORWARD_FOT_SETLEMENT";
  
    public static final String PENDING_FOR_PAYMENT_RL_APPLICATION = "PENDING_FOR_PAYMENT";
    
    public static final String CURRENT_DATE = "CURRENT_DATE";

	public static final String RL_ALLOTMENT_FEE = "RL_ALLOTMENT_FEE";
	
	public static final String APPLY_RL_APPLICATION = "APPLY";
	

	public static final String RL_MASTER_MODULE_NAME = "rentAndLease";
	
	public static final String RL_PROPERTY_NAME = "RLProperty";
	

	public static final String RL_SERVICE_NAME = "rl-services";

	public static final String RL_WORKFLOW_NAME = "RENT_N_LEASE_NEW";
	
	public static final String SECURITY_DEPOSIT_FEE_RL_APPLICATION = "RL_SECURITY_DEPOSIT_FEE";

	public static final String RENT_LEASE_FEE_RL_APPLICATION = "RENT_LEASE_FEE";

	public static final String COWCESS_FEE_RL_APPLICATION = "RL_COWCESS_FEE";

	public static final String PENALTY_FEE_RL_APPLICATION = "RL_PENALTY_FEE";
	
	public static final String SGST_FEE_RL_APPLICATION = "RL_SGST_FEE";

	public static final String CGST_FEE_RL_APPLICATION = "RL_CGST_FEE";
	
	
	public static final String NOTIFICATION_DOCVERIFY = "rl.en.counter.doc.verify";

	public static final String NOTIFICATION_APPLY = "rl.en.counter.apply";

	public static final String NOTIFICATION_APPROVE = "rl.en.counter.approve";

	public static final String NOTIFICATION_REJECT = "rl.en.counter.reject";

	public static final String NOTIFICATION_FIELDINSPECTION = "rl.en.counter.field.inspection";

	public static final String NOTIFICATION_DISCONNECTION_REQUEST = "rl.en.counter.disconnection.request";

	public static final String NOTIFICATION_DISCONNECTION_FIELD_INSPECTION = "rl.en.counter.disconnection.field.inspection";

	public static final String NOTIFICATION_CLOSED = "rl.en.counter.closed";

	
//    public static final String MDMS_RL_MOD_NAME = "rentAndLease";
//
//    public static final String PT_TYPE_VACANT = "VACANT";
//    
//    public static final String PT_TYPE_SHAREDPROPERTY = "SHAREDPROPERTY";
//    
//    public static final String PT_TYPE_BUILTUP = "BUILTUP";
//    
//    public static final String JSONPATH_CODES = "$.MdmsRes.PropertyTax";
//
//    public static final String MDMS_PT_MOD_NAME = "PropertyTax";
//
//    public static final String MDMS_PT_PROPERTYTYPE = "PropertyType";
//    
//    public static final String MDMS_PT_MUTATIONREASON = "MutationReason";
//    
//    public static final String MDMS_PT_USAGECATEGORY = "UsageCategory";
//
//    public static final String MDMS_PT_PROPERTYSUBTYPE = "PropertySubType";
//
//    public static final String MDMS_PT_OCCUPANCYTYPE = "OccupancyType";
//
//    public static final String MDMS_PT_CONSTRUCTIONTYPE = "ConstructionType";
//
//    public static final String MDMS_PT_CONSTRUCTIONSUBTYPE = "ConstructionSubType";
//
//    public static final String MDMS_PT_OWNERSHIPCATEGORY = "OwnerShipCategory";
//
//    public static final String MDMS_PT_SUBOWNERSHIP = "SubOwnerShipCategory";
//
//    public static final String MDMS_PT_USAGEMAJOR = "UsageCategoryMajor";
//
//    public static final String MDMS_PT_USAGEMINOR = "UsageCategoryMinor";
//
//    public static final String MDMS_PT_USAGEDETAIL = "UsageCategoryDetail";
//
//    public static final String MDMS_PT_USAGESUBMINOR = "UsageCategorySubMinor";

    public static final String MDMS_PT_OWNERTYPE = "OwnerType";

    public static final String MDMS_PT_EGF_MASTER = "egf-master";

    public static final String MDMS_PT_FINANCIALYEAR = "FinancialYear";

    public static final String JSONPATH_FINANCIALYEAR = "$.MdmsRes.egf-master";

    public static final String BOUNDARY_HEIRARCHY_CODE = "REVENUE";

    public static final String NOTIFICATION_LOCALE = "en_IN";

    
    public static final String DUES_NOTIFICATION = "DUES_NOTIFICATION";

    public static final String ACTION_PAY = "PAY";

    public static final String ACTION_PAID = "PAID";

    public static final String  USREVENTS_EVENT_TYPE = "SYSTEMGENERATED";
	public static final String  USREVENTS_EVENT_NAME = "Rent And Lease Tax";
	public static final String  USREVENTS_EVENT_POSTEDBY = "SYSTEM-RL";



	// Variable names for diff
	public static final String MDMS_WC_ROLE_MODLENAME = "common-masters";
	
	public static final String MDMS_WC_ROLE_MASTERNAME = "thirdparty";
	public static final String MODULE_NAME = "pb";
	public static final String MDMS_RESPONSE_KEY = "MdmsRes";
	public static final String CATEGORY_KEY = "category";
	public static final String ROLE_CODE_KEY = "rolecode";

    public static final String VARIABLE_ACTION = "action";

    public static final String VARIABLE_WFDOCUMENTS = "wfDocuments";

    public static final String VARIABLE_ACTIVE = "active";

    public static final String VARIABLE_USERACTIVE = "status";

    public static final String VARIABLE_CREATEDBY = "createdBy";

    public static final String VARIABLE_LASTMODIFIEDBY = "lastModifiedBy";

    public static final String VARIABLE_CREATEDTIME = "createdTime";

    public static final String VARIABLE_LASTMODIFIEDTIME = "lastModifiedTime";

    public static final String VARIABLE_OWNER = "ownerInfo";



    public static final String CITIZEN_SENDBACK_ACTION = "SENDBACKTOCITIZEN";
    
    public static final String WORKFLOW_START_ACTION = "INITIATE";

	
	
	/* notification constants */
	
	public static final String WF_STATUS_PAID = "PAID";
	
	public static final String WF_STATUS_PAYMENT_PENDING = "PAYMENT_PENDING";
	
	public static final String WF_STATUS_REJECTED = "REJECTED";
	
	public static final String WF_STATUS_FIELDVERIFIED = "FIELDVERIFIED";
	
	public static final String WF_STATUS_DOCVERIFIED = "DOCVERIFIED";
	
	public static final String WF_STATUS_CANCELLED = "CANCELLED";
	
	public static final String WF_STATUS_APPROVED = "APPROVE";
	
	public static final String WF_STATUS_OPEN = "OPEN";
	
	public static final String WF_NO_WORKFLOW = "NO_WORKFLOW";

    public static final String ACTION_UPDATE_MOBILE = "UPDATE_MOBILE";

    public static final String ACTION_ALTERNATE_MOBILE = "ALTERNATE_MOBILE";

    public static final String ACTION_FOR_DUES = "DUE";


	public static final String NOTIFICATION_MODULENAME = "rl-services";
	
	

	//  NOTIFICATION PLACEHOLDER

    public static final String NOTIFICATION_OWNERNAME = "{OWNER_NAME}";

    public static final String NOTIFICATION_EMAIL = "{EMAIL_ID}";

    public static final String NOTIFICATION_STATUS = "{STATUS}";
    
    public static final String NOTIFICATION_UPDATED_CREATED_REPLACE = "{updated/created}";
    
    public static final String CREATE_STRING = "Create";
    
    public static final String UPDATE_STRING = "Update";
    
    public static final String CREATED_STRING = "Created";
    
    public static final String UPDATED_STRING = "Updated";

    public static final String MUTATED_STRING = "MUTATED";

    public static final String PAYMENT_STRING = "PAYMENT";



    public static final String NOTIFICATION_APPLICATIONNUMBER = "{applicationNumber}";
    


    public static final String ONLINE_PAYMENT_MODE = "ONLINE";

    public static final String URL_PARAMS_SEPARATER = "?";

    public static final String TENANT_ID_FIELD_FOR_SEARCH_URL = "tenantId=";

    public static final String LIMIT_FIELD_FOR_SEARCH_URL = "limit=";

    public static final String OFFSET_FIELD_FOR_SEARCH_URL = "offset=";

    public static final String SEPARATER = "&";



    public static final String ADHOC_PENALTY = "adhocPenalty";

    public static final String ADHOC_PENALTY_REASON = "adhocPenaltyReason";

    public static final String ADHOC_REBATE = "adhocExemption";

    public static final String ADHOC_REBATE_REASON = "adhocExemptionReason";


    //Notification Enhancement
    public static final String CHANNEL_NAME_SMS = "SMS";

    public static final String CHANNEL_NAME_EVENT = "EVENT";

    public static final String CHANNEL_NAME_EMAIL = "EMAIL";

    public static final String MODULE = "module";

    public static final String ACTION = "action";

    public static final String CHANNEL_LIST = "channelList";

    public static final String CHANNEL = "Channel";

    public static final String LOCALIZATION_CODES_JSONPATH = "$.messages.*.code";
  
    public static final String LOCALIZATION_MSGS_JSONPATH = "$.messages.*.message";

  //EVENT PAY
    public static final String EVENT_PAY_TENANTID = "$tenantId";

    public static final String EVENT_PAY_BUSINESSSERVICE = "$businessService";

    public static final String EVENT_PAY_PROPERTYID = "$propertyId";

    //Notification Strings for In App

    public static final String TRACK_APPLICATION_STRING = "You can track your application on the link given below - {PTURL} Thank you";

    public static final String VIEW_PROPERTY_STRING = "You can view your property on the link given below - {PTURL} Thank you";

    public static final String PAY_ONLINE_STRING = "Click on the URL to view the details and pay online {PAYMENT_LINK}";

    public static final String PT_ONLINE_STRING = "You can pay your Property Tax online here - {PAYMENT_LINK}";

    public static final String MT_TRACK_APPLICATION_STRING ="You can track your application on the link given below - {MTURL} Thank you";

    public static final String MT_PAYLINK_STRING = "You can pay your mutation fee on the below link - {PAYLINK} or visit your ULB to pay your dues. Thank you";

    public static final String MT_CERTIFICATE_STRING = "You can download your mutation certificate on the below link - {MTURL} Thank you";

    public static final String MT_RECEIPT_STRING = "You can download your receipt on the below link - {MTURL} Thank you";

    public static final String PT_TAX_FAIL = "Please try again. Ignore this message if you have completed your payment. You can pay your Property Tax online here - {payLink}";

    public static final String PT_TAX_FULL = "Click on the link to download payment receipt {receipt download link}";

    public static final String PT_TAX_PARTIAL = "You can pay your Property Tax online here - {payLink} Click on the link to download payment receipt {receipt download link}";

    public static final String TENANT_MASTER_MODULE = "tenant";

    public static final String TENANTS_MASTER_ROOT = "tenants";

    public static final String TENANTS_JSONPATH_ROOT = "$.MdmsRes.tenant.tenants";

    public static final String PROPERTY_MODEL = "Property";

    public static final String PROPERTY_DECRYPT_MODEL = "PropertyDecrypDisabled";

    //Citizen Feedback Notifications

    public static final String FEEDBACK_URL = "{FeedbackURL}";

    //// workflow send notification

    public static final String RL_WF_APPLY = "APPLY";

	public static final String RL_WF_DOC_VERIFY = "FORWARD_FOR_FIELDINSPECTION";

	public static final String RL_WF_FIELDINSPECTION = "FORWARD_FOR_APPROVAL";
	
	public static final String RL_WF_APPROVE = "APPROVE";

	public static final String RL_WF_REJECT = "REJECT";

	public static final String RL_WF_DISCONNECTION_REQUEST = "FORWARD_FOR_DISCONNECTION_FIELD_INSPECTION";
	
	public static final String RL_WF_DISCONNECTION_FIELD_INSPECTION = "FORWARD_FOT_SETLEMENT";

	public static final String RL_WF_CLOSED = "CLOSED";

}

