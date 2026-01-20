package org.egov.commons.edcr.mdms.filter;

public class MdmsFilter {
	//public static final String FAR_PATH = "$.MdmsRes.EDCR.MasterPlan[*].FAR[*]";
	public static final String ULB_TYPE_FILTER = "$.MdmsRes.tenant.tenants[0]";
	
	public static final String FAR_PATH = "$.MdmsRes.EDCR.MasterPlan[*]";
	
	public static final String MASTER_PLAN_FILTER = "$.MdmsRes.EDCR.MasterPlan";

    public static final String CATEGORY_PATH = "$.MdmsRes.BPA.MasterPlan[*].Category";

    public static final String NORMAL_FAR_PATH = "$.MdmsRes.BPA.MasterPlan[*].FAR[*].NormalFAR";
    
    public static final String  ROLE_FILTER = "$.MdmsRes.EDCR-ROLES.roles[?(@.code=='%s')]";
    
    public static final String SITE_COVERAGE_PATH = "$[0].MasterPlan[0].siteCoverage";
    
    public static final String MIN_PLOT_AREA = "$[0].MasterPlan[0].minPlotArea";

    public static final String LIST_FRONT_SETBACK_PATH = "$[0].MasterPlan[0].frontSetBack";
    
    public static final String LIST_REAR_SETBACK_PATH = "$[0].MasterPlan[0].rearSetBack";
    
    public static final String LIST_SIDE_SETBACK_PATH = "$[0].MasterPlan[0].sideSetBack1";
    
    public static final String FRONT_SETBACK_PATH = "$[0].MasterPlan[0].frontSetBack";
    
    public static final String REAR_SETBACK_PATH = "$[0].MasterPlan[0].rearSetBack";
    
    public static final String NORMAL_FAR = "$[0].MasterPlan[0].NormalFAR";
    
    public static final String PURCHASABLE_FAR = "$[0].MasterPlan[0].PurchasableFAR";
    
    public static final String MAX_ALLOWED_HEIGHT = "$[0].MasterPlan[0].maxHeight";
    
    public static final String MAX_ALLOWED_HEIGHT_WITH_STILT = "$[0].MasterPlan[0].maxHeightWithStilt";
    
    public static final String SIDE_SETBACK_PATH = "$[0].MasterPlan[0].sideSetBack1";
    
    public static final String MIN_ROAD_WIDTH = "$[0].MasterPlan[0].minRoad";

}
