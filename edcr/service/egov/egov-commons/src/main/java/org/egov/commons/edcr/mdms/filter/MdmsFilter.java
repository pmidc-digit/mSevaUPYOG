package org.egov.commons.edcr.mdms.filter;

public class MdmsFilter {
	//public static final String FAR_PATH = "$.MdmsRes.EDCR.MasterPlan[*].FAR[*]";
	public static final String FAR_PATH = "$.MdmsRes.EDCR.MasterPlan[*]";
	
	public static final String MASTER_PLAN_FILTER = "$.MdmsRes.EDCR.MasterPlan";

    public static final String CATEGORY_PATH = "$.MdmsRes.BPA.MasterPlan[*].Category";

    public static final String NORMAL_FAR_PATH = "$.MdmsRes.BPA.MasterPlan[*].FAR[*].NormalFAR";
    
    public static final String  ROLE_FILTER = "$.MdmsRes.EDCR-ROLES.roles[?(@.code=='%s')]";


}
