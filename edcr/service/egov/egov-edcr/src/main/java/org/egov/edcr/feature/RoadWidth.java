/*
 * eGov  SmartCity eGovernance suite aims to improve the internal efficiency,transparency,


 * accountability and the service delivery of the government  organizations.
 *
 *  Copyright (C) <2019>  eGovernments Foundation
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
 *      Further, all user interfaces, including but not limited to citizen facing interfaces,
 *         Urban Local Bodies interfaces, dashboards, mobile applications, of the program and any
 *         derived works should carry eGovernments Foundation logo on the top right corner.
 *
 *      For the logo, please refer http://egovernments.org/html/logo/egov_logo.png.
 *      For any further queries on attribution, including queries on brand guidelines,
 *         please contact contact@egovernments.org
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

package org.egov.edcr.feature;

//RESIDENTIAL - Occupancies code
import static org.egov.edcr.constants.DxfFileConstants.A;
//RESIDENTIAL - Sub occupancies code
import static org.egov.edcr.constants.DxfFileConstants.A2; // Old Age Home
import static org.egov.edcr.constants.DxfFileConstants.A_R; //Single family Residential
import static org.egov.edcr.constants.DxfFileConstants.A_AF; // Apartment/Flat
import static org.egov.edcr.constants.DxfFileConstants.A_FH; // Farm House
import static org.egov.edcr.constants.DxfFileConstants.A_SR; // Special Residential
import static org.egov.edcr.constants.DxfFileConstants.A_HE; // Hostel Educational
import static org.egov.edcr.constants.DxfFileConstants.A_SA; // Service Apartment
import static org.egov.edcr.constants.DxfFileConstants.A_PO; // Professional Office
import static org.egov.edcr.constants.DxfFileConstants.A_AF_GH;
import static org.egov.edcr.constants.DxfFileConstants.B;
import static org.egov.edcr.constants.DxfFileConstants.D;
import static org.egov.edcr.constants.DxfFileConstants.F;
import static org.egov.edcr.constants.DxfFileConstants.F_CB;
import static org.egov.edcr.constants.DxfFileConstants.F_RT;
import static org.egov.edcr.constants.DxfFileConstants.G;
import static org.egov.edcr.utility.DcrConstants.OBJECTNOTDEFINED;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.egov.common.entity.dcr.helper.OccupancyHelperDetail;
import org.egov.common.entity.edcr.OccupancyTypeHelper;
import org.egov.common.entity.edcr.Plan;
import org.egov.common.entity.edcr.Result;
import org.egov.common.entity.edcr.ScrutinyDetail;
import org.egov.edcr.constants.DxfFileConstants;
import org.springframework.stereotype.Service;

@Service
public class RoadWidth extends FeatureProcess {

    private static final Logger LOG = LogManager.getLogger(RoadWidth.class);
    private static final String RULE_34 = "34-1";
    public static final String ROADWIDTH_DESCRIPTION = "Road Width and Type";
    public static final BigDecimal TWELVE_POINT_TWENTY = BigDecimal.valueOf(12.20);
    public static final BigDecimal THREE = BigDecimal.valueOf(3);
    public static final String NEW = "NEW";
    public static final String ROADWIDTH = "Road Width";
    
 // Road Width Required (in meters)
    private static final BigDecimal ROAD_WIDTH_12  = BigDecimal.valueOf(12);
    private static final BigDecimal ROAD_WIDTH_18  = BigDecimal.valueOf(18);
    private static final BigDecimal ROAD_WIDTH_24  = BigDecimal.valueOf(24);

    @Override
    public Map<String, Date> getAmendments() {
        return new LinkedHashMap<>();
    }

    @Override
    public Plan validate(Plan pl) {  
        return pl;
    }

    @Override
    public Plan process(Plan pl) {
    	
        if (pl.getPlanInformation() != null && pl.getPlanInformation().getRoadWidth() != null) {
            BigDecimal roadWidth = pl.getPlanInformation().getRoadWidth();
            if (roadWidth == null || roadWidth.compareTo(BigDecimal.ZERO) == 0) {
                boolean skipValidation = false;

                if ("SCHEME_AREA".equalsIgnoreCase(pl.getEdcrRequest().getAreaType())
                		&& !Boolean.TRUE.equals(pl.getEdcrRequest().getApprovedCS())) {
                    skipValidation = true;
                } else if ("NON_SCHEME_AREA".equalsIgnoreCase(pl.getEdcrRequest().getAreaType())
                        && Boolean.TRUE.equals(pl.getEdcrRequest().getCluApprove())) {
                    skipValidation = true;
                }

                if (!skipValidation) {
                    pl.addError(ROADWIDTH, getLocaleMessage(OBJECTNOTDEFINED, ROADWIDTH));
                }
            }
            String roadType = pl.getPlanInformation().getRoadType() != null ? pl.getPlanInformation().getRoadType() : "Mention Road type in PlanInfo" ;
            String typeOfArea = pl.getPlanInformation().getTypeOfArea();
            if (typeOfArea != null
//            		&& NEW.equalsIgnoreCase(typeOfArea)
            		) {
                ScrutinyDetail scrutinyDetail = new ScrutinyDetail();
                scrutinyDetail.setKey("Common_Road Width And Type");
                scrutinyDetail.addColumnHeading(1, RULE_NO);
                scrutinyDetail.addColumnHeading(2, DESCRIPTION);
                scrutinyDetail.addColumnHeading(3, OCCUPANCY +" - "+ ROADTYPE);
//                scrutinyDetail.addColumnHeading(4, PERMITTED);
                scrutinyDetail.addColumnHeading(4, PROVIDED);
//                scrutinyDetail.addColumnHeading(6, STATUS);

                Map<String, String> details = new HashMap<>();
                details.put(RULE_NO, RULE_34);
                details.put(DESCRIPTION, ROADWIDTH_DESCRIPTION);

                Map<String, BigDecimal> occupancyValuesMap = getOccupancyValues();
                
               

                if (pl.getVirtualBuilding() != null && pl.getVirtualBuilding().getMostRestrictiveFarHelper() != null) {
                    OccupancyHelperDetail occupancyType = pl.getVirtualBuilding().getMostRestrictiveFarHelper()
                            .getSubtype() != null
                                    ? pl.getVirtualBuilding().getMostRestrictiveFarHelper().getSubtype()
                                    : pl.getVirtualBuilding().getMostRestrictiveFarHelper().getType();

                    if (occupancyType != null) {
                        details.put(OCCUPANCY +" - "+ ROADTYPE, occupancyType.getName() +" - "+ "("+ roadType +")");
                        // get occupancy for industrial
                        OccupancyHelperDetail occupancyType1 = pl.getVirtualBuilding().getMostRestrictiveFarHelper().getType();
                        if (G.equals(occupancyType1.getCode())) {
                        	validateRoadWidthForIndustrial(pl,roadWidth);
                        }
                        BigDecimal roadWidthRequired = occupancyValuesMap.get(occupancyType.getCode());
                        if (roadWidthRequired != null) {
//                            if (roadWidth.compareTo(roadWidthRequired) >= 0) {
//                                details.put(PERMITTED, String.valueOf(roadWidthRequired) + "m");
                                details.put(PROVIDED, roadWidth.toString() + "m");
//                                details.put(STATUS, Result.Accepted.getResultVal());
                                scrutinyDetail.getDetail().add(details);
                              //  pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
//                            } else {
//                                details.put(PERMITTED, String.valueOf(roadWidthRequired) + "m");
//                                details.put(PROVIDED, roadWidth.toString() + "m");
//                                details.put(STATUS, Result.Not_Accepted.getResultVal());
//                                scrutinyDetail.getDetail().add(details);
//                                pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
//                            }
                        }
                    }
                }
            }
        }
        return pl;
    }

    public Map<String, BigDecimal> getOccupancyValues() {

        Map<String, BigDecimal> roadWidthValues = new HashMap<>();
        roadWidthValues.put(A, THREE);
        roadWidthValues.put(A_R, THREE);
        roadWidthValues.put(A2, THREE);
        roadWidthValues.put(A_AF, THREE);
        roadWidthValues.put(A_FH, THREE);
        roadWidthValues.put(A_SR, THREE);
        roadWidthValues.put(A_HE, THREE);
        roadWidthValues.put(A_SA, THREE);
        roadWidthValues.put(A_PO, THREE);
        roadWidthValues.put(A_AF_GH, THREE);
        roadWidthValues.put(B, TWELVE_POINT_TWENTY);
        roadWidthValues.put(D, TWELVE_POINT_TWENTY);
        roadWidthValues.put(G, TWELVE_POINT_TWENTY);
        roadWidthValues.put(F, TWELVE_POINT_TWENTY);
        roadWidthValues.put(F_RT, TWELVE_POINT_TWENTY);
        roadWidthValues.put(F_CB, TWELVE_POINT_TWENTY);
        return roadWidthValues;

    }
    
    public void validateRoadWidthForIndustrial(Plan pl, BigDecimal roadWidth) {       
        OccupancyTypeHelper mostRestrictiveOccupancy = pl.getVirtualBuilding().getMostRestrictiveFarHelper();
        OccupancyHelperDetail subtype = mostRestrictiveOccupancy.getSubtype();
        String subType = subtype.getCode();        
        if (subType == null) {
            return; // Cannot validate without subtype
        }       

        BigDecimal requiredRoadWidth = null;

        switch (subType) {
            case DxfFileConstants.G_SP:  // Sports Industry
            case DxfFileConstants.G_RS:  // Retail Service Industry
            case DxfFileConstants.G_H:   // Hazard Industries
            case DxfFileConstants.G_S:   // Storage
            case DxfFileConstants.G_F:   // Factory
            case DxfFileConstants.G_I:   // Industrial
            case DxfFileConstants.G_IT:  // Information Technology
            case DxfFileConstants.G_T:   // Textile Industry
            case DxfFileConstants.G_K:   // Knitwear Industry
                requiredRoadWidth = ROAD_WIDTH_12;
                break;

            case DxfFileConstants.G_W:   // Warehouse
                requiredRoadWidth = ROAD_WIDTH_24;
                break;

            case DxfFileConstants.G_GI:  // General Industry
                requiredRoadWidth = ROAD_WIDTH_18;
                break;

            default:
                // Not applicable for other types
                break;
        }

        if (requiredRoadWidth != null && roadWidth.compareTo(requiredRoadWidth) < 0) {
            HashMap<String, String> errors = new HashMap<>();
            errors.put("Road width Error:", "Minimum Required Road width is " + requiredRoadWidth + " m");
            pl.addErrors(errors);
        }
    }

    
}