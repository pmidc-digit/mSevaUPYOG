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

/* 
 * Edited by @Bhupesh Dewangan
 */
package org.egov.edcr.feature;

import static org.egov.edcr.constants.DxfFileConstants.*;

//import static org.egov.edcr.constants.DxfFileConstants.J;
import static org.egov.edcr.utility.DcrConstants.OBJECTNOTDEFINED;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.dcr.helper.OccupancyHelperDetail;
import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Floor;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.Occupancy;
import org.egov.common.entity.edcr.OccupancyType;
import org.egov.common.entity.edcr.OccupancyTypeHelper;
import org.egov.common.entity.edcr.Plan;
import org.egov.common.entity.edcr.Result;
import org.egov.common.entity.edcr.ScrutinyDetail;
import org.egov.commons.edcr.mdms.filter.MdmsFilter;
import org.egov.edcr.utility.DcrConstants;
import org.springframework.stereotype.Service;
import org.egov.commons.mdms.BpaMdmsUtil;
import org.egov.commons.edcr.mdms.filter.MdmsFilter;


@Service
public class Coverage extends FeatureProcess {
	// private static final String OCCUPANCY2 = "OCCUPANCY";

	private static final Logger LOG = LogManager.getLogger(Coverage.class);

	// private static final String RULE_NAME_KEY = "coverage.rulename";
	private static final String RULE_DESCRIPTION_KEY = "coverage.description";
	private static final String RULE_EXPECTED_KEY = "coverage.expected";
	private static final String RULE_ACTUAL_KEY = "coverage.actual";
//	private static final BigDecimal Thirty = BigDecimal.valueOf(30);
//	private static final BigDecimal ThirtyFive = BigDecimal.valueOf(35);
//	private static final BigDecimal Forty = BigDecimal.valueOf(40);

	/*
	 * private static final BigDecimal FortyFive = BigDecimal.valueOf(45); private
	 * static final BigDecimal Fifty = BigDecimal.valueOf(50); private static final
	 * BigDecimal FiftyFive = BigDecimal.valueOf(55); private static final
	 * BigDecimal Sixty = BigDecimal.valueOf(60); private static final BigDecimal
	 * SixtyFive = BigDecimal.valueOf(65); private static final BigDecimal Seventy =
	 * BigDecimal.valueOf(70); private static final BigDecimal SeventyFive =
	 * BigDecimal.valueOf(75); private static final BigDecimal Eighty =
	 * BigDecimal.valueOf(80);
	 */

	public static final String RULE_38 = "38";
	public static final String RULE_7_C_1 = "Table 7-C-1";
	public static final String RULE = "4.4.4";
	private static final BigDecimal ROAD_WIDTH_TWELVE_POINTTWO = BigDecimal.valueOf(12.2);
	private static final BigDecimal ROAD_WIDTH_THIRTY_POINTFIVE = BigDecimal.valueOf(30.5);
	
	// -------------------- Industrial coverage constants --------------------
	private static final BigDecimal COVERAGE_65 = BigDecimal.valueOf(65);
	private static final BigDecimal COVERAGE_40 = BigDecimal.valueOf(40);

	private static final BigDecimal LIMIT_300   = BigDecimal.valueOf(300);
	private static final BigDecimal LIMIT_2000  = BigDecimal.valueOf(2000);
	private static final BigDecimal LIMIT_10000 = BigDecimal.valueOf(10000);

	@Override
	public Plan validate(Plan pl) {
		for (Block block : pl.getBlocks()) {
			if (block.getCoverage().isEmpty()) {
				pl.addError("coverageArea" + block.getNumber(),
						"Coverage Area for block " + block.getNumber() + " not Provided");
			}
		}
		return pl;
	}

	@Override
	public Plan process(Plan pl) {
		HashMap<String, String> errorMsgs = new HashMap<>();
		LOG.info("inside Coverage process()");
		validate(pl);
		LOG.info("coverage corearea : " + pl.getCoreArea());
		BigDecimal totalCoverage = BigDecimal.ZERO;
		BigDecimal totalCoverageArea = BigDecimal.ZERO;
//		BigDecimal area = pl.getPlot().getArea(); // add for get total plot area
		BigDecimal plotArea = pl.getPlot().getArea(); // add for get total plot area

		String coreArea = pl.getCoreArea();
		BigDecimal coverageArea = BigDecimal.ZERO;
		int noOfFloors = 0;
		Set<OccupancyTypeHelper> occupancyList = new HashSet<>();
		// add for getting OccupancyType
		OccupancyTypeHelper mostRestrictiveOccupancy = pl.getVirtualBuilding().getMostRestrictiveFarHelper();
//		String a=mostRestrictiveOccupancy.getType().getCode();
		// add for getting OccupancyType
//		OccupancyType mostRestrictiveOccupancy = getMostRestrictiveCoverage(pl.getVirtualBuilding().getOccupancies());
		for (Block block : pl.getBlocks()) {

			for (Floor flr : block.getBuilding().getFloors()) {
				for (Occupancy occupancy : flr.getOccupancies()) {
					if (occupancy.getTypeHelper() != null && occupancy.getTypeHelper().getType() != null)
						occupancyList.add(occupancy.getTypeHelper());
				}
			}

			BigDecimal coverageAreaWithoutDeduction = BigDecimal.ZERO;
			BigDecimal coverageDeductionArea = BigDecimal.ZERO;

			noOfFloors = block.getBuilding().getFloors().size();

			for (Measurement coverage : block.getCoverage()) {
				coverageAreaWithoutDeduction = coverageAreaWithoutDeduction.add(coverage.getArea());
			}
			for (Measurement deduct : block.getCoverageDeductions()) {
				coverageDeductionArea = coverageDeductionArea.add(deduct.getArea());
			}
			if (block.getBuilding() != null) {
				block.getBuilding().setCoverageArea(coverageAreaWithoutDeduction.subtract(coverageDeductionArea));
				
				try {
					if (plotArea != null && plotArea.compareTo(BigDecimal.ZERO) > 0) {
				        coverageArea = block.getBuilding()
				                .getCoverageArea()
				                .multiply(BigDecimal.valueOf(100))
				                .divide(
				                    plotArea,
				                    DcrConstants.DECIMALDIGITS_MEASUREMENTS,
				                    DcrConstants.ROUNDMODE_MEASUREMENTS
				                );
				    }
				} catch (ArithmeticException ex) {
				    // Log or handle divide-by-zero safely
				    // LOGGER.warn("Divide by zero while calculating coverage", ex);
					coverageArea = BigDecimal.ZERO;
				}

				block.getBuilding().setCoverage(coverageArea);

				totalCoverageArea = totalCoverageArea.add(block.getBuilding().getCoverageArea());
				// totalCoverage =
				// totalCoverage.add(block.getBuilding().getCoverage());
			}

		}

		// pl.setCoverageArea(totalCoverageArea);
		// use plotArea
		if (pl.getPlot() != null && pl.getPlot().getArea().doubleValue() > 0)
			totalCoverage = totalCoverageArea.multiply(BigDecimal.valueOf(100)).divide(plotArea,
					DcrConstants.DECIMALDIGITS_MEASUREMENTS, DcrConstants.ROUNDMODE_MEASUREMENTS);
		pl.setCoverage(totalCoverage);
		if (pl.getVirtualBuilding() != null) {
			pl.getVirtualBuilding().setTotalCoverageArea(totalCoverageArea);
		}

		BigDecimal roadWidth = pl.getPlanInformation().getRoadWidth();
//		String areaCategory = pl.getAreaCategory();
		BigDecimal permissibleCoverageValue = BigDecimal.ZERO;
		//String developmentZone = pl.getPlanInformation().getDevelopmentZone(); //
//		if (developmentZone == null) {
//			pl.addError(getLocaleMessage(OBJECTNOTDEFINED, DEVELOPMENT_ZONE + " of PLAN_INFO layer"));
//		}
//		String occupancyType;

		// get coverage permissible value from method and store in
		// permissibleCoverageValue
//		if (plotArea.compareTo(BigDecimal.valueOf(0)) > 0 && mostRestrictiveOccupancy != null &&
//				A.equals(mostRestrictiveOccupancy.getType().getCode())
//				) {
////			occupancyType = mostRestrictiveOccupancy.getType().getCode();
//			
//			if(mostRestrictiveOccupancy.getSubtype().getCode() !=null &&
//					(A_AF.equals(mostRestrictiveOccupancy.getSubtype().getCode()) 
//							|| A_AIF.equals(mostRestrictiveOccupancy.getSubtype().getCode()))
//					) {
//				// getting permissible value from mdms
//				Optional<BigDecimal> minPlotArea = BpaMdmsUtil.extractMdmsValue(pl.getMdmsMasterData().get("masterMdmsData"), MdmsFilter.MIN_PLOT_AREA, BigDecimal.class);
//				minPlotArea.ifPresent(min -> LOG.info("Min plot are required : " + min));
//		        
//				if (plotArea == null || plotArea.compareTo(minPlotArea.get()) <= 0) {
//					errorMsgs.put("Plot Area Error:", "Plot area must be greater than : " + minPlotArea.get());
//			        pl.addErrors(errorMsgs);
//			        
//			    }
//				
//				if(pl.getMdmsMasterData().get("masterMdmsData")!=null) {					
//					Optional<BigDecimal> scOpt = BpaMdmsUtil.extractMdmsValue(pl.getMdmsMasterData().get("masterMdmsData"), MdmsFilter.SITE_COVERAGE_PATH, BigDecimal.class);
//			        scOpt.ifPresent(sc -> LOG.info("Site Coverage Value: " + sc));
//			        permissibleCoverageValue = scOpt.get();
//				}				
//			}else {
//				permissibleCoverageValue = getPermissibleCoverageForResidentialFromMdms(pl, plotArea, coreArea);
//			}
//		
//		}
		if (plotArea.compareTo(BigDecimal.valueOf(0)) > 0 && mostRestrictiveOccupancy != null &&
				(A.equals(mostRestrictiveOccupancy.getType().getCode())
				|| A_AF.equals(mostRestrictiveOccupancy.getSubtype().getCode()) 
				|| A_AIF.equals(mostRestrictiveOccupancy.getSubtype().getCode())
				|| A_R.equals(mostRestrictiveOccupancy.getSubtype().getCode()))
		) {

			if(A_AIF.equals(mostRestrictiveOccupancy.getSubtype().getCode())
					|| A_R.equals(mostRestrictiveOccupancy.getSubtype().getCode())) {
				//permissibleCoverageValue = calculateGroundCoverage(plotArea, pl).setScale(2, RoundingMode.HALF_UP);	
				
				if(pl.getMdmsMasterData().get("masterMdmsData")!=null) {					
					Optional<BigDecimal> scOpt = BpaMdmsUtil.extractMdmsValue(pl.getMdmsMasterData().get("masterMdmsData"), MdmsFilter.SITE_COVERAGE_PATH, BigDecimal.class);
			        scOpt.ifPresent(sc -> LOG.info("Site Coverage Value: " + sc));
			        permissibleCoverageValue = scOpt.get();
				}
			}else {
				// getting permissible value from mdms
//				Optional<BigDecimal> minPlotArea = BpaMdmsUtil.extractMdmsValue(pl.getMdmsMasterData().get("masterMdmsData"), MdmsFilter.MIN_PLOT_AREA, BigDecimal.class);
//				minPlotArea.ifPresent(min -> LOG.info("Min plot are required : " + min));
//		        
//				if (plotArea == null || plotArea.compareTo(minPlotArea.get()) <= 0) {
//					errorMsgs.put("Plot Area Error:", "Plot area must be greater than : " + minPlotArea.get());
//			        pl.addErrors(errorMsgs);			        
//			    }
				
				if(pl.getMdmsMasterData().get("masterMdmsData")!=null) {					
					Optional<BigDecimal> scOpt = BpaMdmsUtil.extractMdmsValue(pl.getMdmsMasterData().get("masterMdmsData"), MdmsFilter.SITE_COVERAGE_PATH, BigDecimal.class);
			        scOpt.ifPresent(sc -> LOG.info("Site Coverage Value: " + sc));
			        permissibleCoverageValue = scOpt.get();
				}
			}
			
				
		
		}else if (F.equals(mostRestrictiveOccupancy.getType().getCode())) { // if
			//permissibleCoverageValue = getPermissibleCoverageForCommercial(plotArea, developmentZone, noOfFloors);
			//permissibleCoverageValue = getPermissibleCoverageForCommercial(plotArea, noOfFloors,coreArea);
			//permissibleCoverageValue = calculateGroundCoverage(plotArea, pl).setScale(2, RoundingMode.HALF_UP);
			
			if(pl.getMdmsMasterData().get("masterMdmsData")!=null) {					
				Optional<BigDecimal> scOpt = BpaMdmsUtil.extractMdmsValue(pl.getMdmsMasterData().get("masterMdmsData"), MdmsFilter.SITE_COVERAGE_PATH, BigDecimal.class);
		        scOpt.ifPresent(sc -> LOG.info("Site Coverage Value: " + sc));
		        permissibleCoverageValue = scOpt.get();
			}
			
		}else if (G.equals(mostRestrictiveOccupancy.getType().getCode())) { // if
			//permissibleCoverageValue = getPermissibleCoverageForIndustrial(plotArea,mostRestrictiveOccupancy, errorMsgs, pl);
			if(pl.getMdmsMasterData().get("masterMdmsData")!=null) {					
				Optional<BigDecimal> scOpt = BpaMdmsUtil.extractMdmsValue(pl.getMdmsMasterData().get("masterMdmsData"), MdmsFilter.SITE_COVERAGE_PATH, BigDecimal.class);
				scOpt.ifPresent(sc -> LOG.info("Site Coverage Value: " + sc));
				permissibleCoverageValue = scOpt.get();
			}
		}
		 
		
		 // if
//			permissibleCoverageValue = getPermissibleCoverageForIndustrial();
//		}
				//permissibleCoverageValue = getPermissibleCoverageForMix(plotArea);
//			} else if (A.equals(mostRestrictiveOccupancy.getType().getCode())) { // if
//				permissibleCoverageValue = getPermissibleCoverageForResidential(plotArea);
//			} else if (F.equals(mostRestrictiveOccupancy.getType().getCode())) { // if
//				permissibleCoverageValue = getPermissibleCoverageForCommercial(plotArea, developmentZone, noOfFloors);
//			} else if (J.equals(mostRestrictiveOccupancy.getType().getCode())) { // if
//				permissibleCoverageValue = getPermissibleCoverageForGovernment(plotArea, developmentZone,
//						noOfFloors);
//			} else if (G.equals(mostRestrictiveOccupancy.getType().getCode())) { // if
//				permissibleCoverageValue = getPermissibleCoverageForIndustrial();
//			}
		

		if (permissibleCoverageValue.compareTo(BigDecimal.valueOf(0)) > 0
				&& A.equals(mostRestrictiveOccupancy.getType().getCode())) {
			//if (occupancyList != null && occupancyList.size() > 1) {
//				processCoverage(pl,mostRestrictiveOccupancy.getType().getName(), totalCoverage, 
//						permissibleCoverageValue,coverageArea,plotArea);
			processCoverage(pl,mostRestrictiveOccupancy, totalCoverage, 
					permissibleCoverageValue,coverageArea,plotArea);
//			processCoverage(pl,mostRestrictiveOccupancy, totalCoverageArea, 
//					permissibleCoverageValue,coverageArea,plotArea);
			}else if (F.equals(mostRestrictiveOccupancy.getType().getCode())) {
				processCoverage(pl, mostRestrictiveOccupancy, totalCoverage,
						permissibleCoverageValue,coverageArea,plotArea);
			} 
			else {
				processCoverage(pl, mostRestrictiveOccupancy, totalCoverage,
						permissibleCoverageValue,coverageArea,plotArea);
			}
		//}

//		if (roadWidth != null && roadWidth.compareTo(ROAD_WIDTH_TWELVE_POINTTWO) >= 0
//				&& roadWidth.compareTo(ROAD_WIDTH_THIRTY_POINTFIVE) <= 0) {
//
//			processCoverage(pl, StringUtils.EMPTY, totalCoverage, permissibleCoverageValue);
//		}

		return pl;
	}

//	private BigDecimal getPermissibleCoverage(OccupancyType type, BigDecimal area) {

	/*
	 * to get coverage permissible value for Residential
	 */
//	private BigDecimal getPermissibleCoverageForResidential(BigDecimal plotArea, String coreArea) {
//		LOG.info("inside getPermissibleCoverageForResidential()");
//		BigDecimal permissibleCoverage = BigDecimal.ZERO;
//
//		if(coreArea.equalsIgnoreCase("Yes")) {
//			permissibleCoverage = BigDecimal.valueOf(90);
//		}else {
//			if (plotArea.compareTo(BigDecimal.valueOf(150)) <= 0) {
//				
//	            permissibleCoverage = BigDecimal.valueOf(90); // 90% coverage for plot area up to 150 sqm
//	//            Log.info("permissibleCoverage: for plotare: "+plotArea +"is: "+ permissibleCoverage);
//	//        
//	//            Log.info("permissibleCoverage: for plotare: "+plotArea +"is: "+ permissibleCoverage);
//	        } else if (plotArea.compareTo(BigDecimal.valueOf(150)) > 0 &&  plotArea.compareTo(BigDecimal.valueOf(200)) <= 0) {
//	            permissibleCoverage = BigDecimal.valueOf(70); // 70% coverage for plot area 150-200 sqm
//	         //   Log.info("permissibleCoverage: for plotare: "+plotArea +"is: "+ permissibleCoverage);
//	        } else if (plotArea.compareTo(BigDecimal.valueOf(200)) > 0 && plotArea.compareTo(BigDecimal.valueOf(300)) <= 0) {
//	            permissibleCoverage =  BigDecimal.valueOf(65); // 65% coverage for plot area 200-300 sqm
//	          //  Log.info("permissibleCoverage: for plotare: "+plotArea +"is: "+ permissibleCoverage);
//	        } else if (plotArea.compareTo(BigDecimal.valueOf(300)) > 0 && plotArea.compareTo(BigDecimal.valueOf(500)) <= 0) {
//	            permissibleCoverage =  BigDecimal.valueOf(60); // 60% coverage for plot area 300-500 sqm
//	          //  Log.info("permissibleCoverage: for plotare: "+plotArea +"is: "+ permissibleCoverage);
//	        } else if (plotArea.compareTo(BigDecimal.valueOf(500)) > 0 && plotArea.compareTo(BigDecimal.valueOf(1000)) <= 0) {
//	            permissibleCoverage =  BigDecimal.valueOf(50); // 50% coverage for plot area 500-1000 sqm
//	           // Log.info("permissibleCoverage: for plotare: "+plotArea +"is: "+ permissibleCoverage);
//	        } else {
//	            permissibleCoverage =  BigDecimal.valueOf(40); // 40% coverage for plot area above 1000 sqm
//	          //  Log.info("permissibleCoverage: for plotare: "+plotArea +"is: "+ permissibleCoverage);
//	        }
//		}
//		return permissibleCoverage;
//	}
	
	
	/*
	 * to get coverage permissible value for Commercial
	 */

	//private BigDecimal getPermissibleCoverageForCommercial(BigDecimal area, int noOfFloors) {
	private BigDecimal getPermissibleCoverageForCommercial(BigDecimal plotArea, int noOfFloors, String coreArea) {
	    LOG.info("inside getPermissibleCoverageForCommercial()");
	    BigDecimal permissibleCoverage = BigDecimal.ZERO;

	    if ("Yes".equalsIgnoreCase(coreArea)) {
	        permissibleCoverage = BigDecimal.valueOf(100);
	    } else {
	        if (plotArea.compareTo(BigDecimal.valueOf(41.82)) <= 0) {
	            permissibleCoverage = BigDecimal.valueOf(80); // 0–41.82 sqm → 80%
	        } else if (plotArea.compareTo(BigDecimal.valueOf(41.82)) > 0
	                && plotArea.compareTo(BigDecimal.valueOf(104.5)) <= 0) {
	            permissibleCoverage = BigDecimal.valueOf(75); // 41.83–104.5 sqm → 75%
	        } else if (plotArea.compareTo(BigDecimal.valueOf(104.5)) > 0
	                && plotArea.compareTo(BigDecimal.valueOf(209)) <= 0) {
	            permissibleCoverage = BigDecimal.valueOf(65); // 104.51–209 sqm → 65%
	        } else if (plotArea.compareTo(BigDecimal.valueOf(209)) > 0
	                && plotArea.compareTo(BigDecimal.valueOf(418.21)) <= 0) {
	            permissibleCoverage = BigDecimal.valueOf(60); // 209.01–418.21 sqm → 60%
	        } else if (plotArea.compareTo(BigDecimal.valueOf(418.21)) > 0) {
	            permissibleCoverage = BigDecimal.valueOf(50); // >418.21 sqm → 50%
	        }
	    }

	    return permissibleCoverage;
	}


	private BigDecimal getPermissibleCoverageForMix(BigDecimal area, String developmentZone, int noOfFloors) {
		LOG.info("inside getPermissibleCoverageForCommercial()");
		BigDecimal permissibleCoverage = BigDecimal.ZERO;

		if (area.compareTo(BigDecimal.valueOf(1000)) <= 0) {
			permissibleCoverage = BigDecimal.valueOf(60);
		} else if (area.compareTo(BigDecimal.valueOf(1000)) > 0) {
			permissibleCoverage = BigDecimal.valueOf(50);
		}

		return permissibleCoverage;
	}

	private BigDecimal getPermissibleCoverageForIndustrial(BigDecimal plotArea, OccupancyTypeHelper mostRestrictiveOccupancy, HashMap<String, String> errors, Plan pl) {
    OccupancyHelperDetail subtype = mostRestrictiveOccupancy.getSubtype();
    String subType = subtype.getCode();

    LOG.info("inside getPermissibleCoverageForIndustrial(), subType: {}, plotArea: {}", subType, plotArea);

    if (plotArea == null || plotArea.compareTo(BigDecimal.ZERO) <= 0 || subType == null) {
        errors.put("Plot Area Error:", "Plot area must be greater than 0.");
        pl.addErrors(errors);
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    BigDecimal coveragePercent = BigDecimal.ZERO;

    switch (subType) {
        // ---------------- 65% coverage, minPlotArea = 300 ----------------
        case "G-SP": // Sports Industry
        case "G-RS": // Retail Service Industry
        case "G-H":  // Hazard Industries
        case "G-S":  // Storage
        case "G-F":  // Factory
        case "G-I":  // Industrial
            if (plotArea.compareTo(LIMIT_300) >= 0) {
                coveragePercent = COVERAGE_65;
            } else {
                errors.put("Plot Area Error:", "Minimum plot area required is 300 sqm for " + subType);
                pl.addErrors(errors);
            }
            break;

        // ---------------- Knitwear / Textile Industry, minPlotArea = 2000 ----------------
        case "G-K": // Knitwear Industry
        case "G-T": // Textile Industry
            if (plotArea.compareTo(LIMIT_2000) >= 0) {
                coveragePercent = COVERAGE_65;
            } else {
                errors.put("Plot Area Error:", "Minimum plot area required is 2000 sqm for " + subType);
                pl.addErrors(errors);
            }
            break;

        // ---------------- Information Technology, minPlotArea = 2000 ----------------
        case "G-IT":
            if (plotArea.compareTo(LIMIT_2000) >= 0) {
                coveragePercent = COVERAGE_40;
            } else {
                errors.put("Plot Area Error:", "Minimum plot area required is 2000 sqm for " + subType);
                pl.addErrors(errors);
            }
            break;

        // ---------------- General Industry, minPlotArea = 2000 ----------------
        case "G-GI":
            if (plotArea.compareTo(LIMIT_2000) >= 0) {
                coveragePercent = COVERAGE_40;
            } else {
                errors.put("Plot Area Error:", "Minimum plot area required is 2000 sqm for " + subType);
                pl.addErrors(errors);
            }
            break;

        // ---------------- Warehouse, minPlotArea = 300 ----------------
        case "G-W":
            if (plotArea.compareTo(LIMIT_10000) >= 0) {
                coveragePercent = COVERAGE_40;
            } else {
                errors.put("Plot Area Error:", "Minimum plot area required is 300 sqm for " + subType);
                pl.addErrors(errors);
            }
            break;

        default:
            LOG.warn("No industrial coverage rule for subType: {}", subType);
    }

    // If no valid rule matched, return 0
    if (coveragePercent.compareTo(BigDecimal.ZERO) == 0) {
        LOG.info("No permissible coverage found for subType {} with plotArea {}", subType, plotArea);
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    //BigDecimal permissibleCoverage = plotArea.multiply(coveragePercent);
    //return coveragePercent.setScale(2, RoundingMode.HALF_UP);
    return coveragePercent;
}


	private BigDecimal getPermissibleCoverageForGovernment(BigDecimal area, String developmentZone, int noOfFloors) {
		LOG.info("inside getPermissibleCoverageForGovernment()");
		BigDecimal permissibleCoverage = BigDecimal.ZERO;

		if (area.compareTo(BigDecimal.valueOf(1000)) <= 0) {
			permissibleCoverage = BigDecimal.valueOf(40);
		} else if (area.compareTo(BigDecimal.valueOf(1000)) > 0) {
			permissibleCoverage = BigDecimal.valueOf(30);
		}

		return permissibleCoverage;
	}

	private void processCoverage(Plan pl, OccupancyTypeHelper occupancyTypeHelper, BigDecimal coverage, BigDecimal upperLimit,
		BigDecimal coverageArea, BigDecimal plotArea) {
		LOG.info("inside processCoverage()");
		String occupancy = null;
		
		ScrutinyDetail scrutinyDetail = new ScrutinyDetail();
		scrutinyDetail.setKey("Common_Coverage");
		scrutinyDetail.setHeading("Ground Coverage");
		scrutinyDetail.addColumnHeading(1, RULE_NO);
	   // scrutinyDetail.addColumnHeading(2, DEVELOPMENT_ZONE);
		scrutinyDetail.addColumnHeading(2, OCCUPANCY);
		scrutinyDetail.addColumnHeading(3, PERMISSIBLE);
		scrutinyDetail.addColumnHeading(4, PROVIDED);
		scrutinyDetail.addColumnHeading(5, STATUS);
		

		String desc = getLocaleMessage(RULE_DESCRIPTION_KEY, upperLimit.toString());
//		String actualResult = getLocaleMessage(RULE_ACTUAL_KEY, coverage.setScale(2, RoundingMode.HALF_UP).toString() +" %");
		
//		BigDecimal totalExpectedPlotArea = plotArea.setScale(2, RoundingMode.HALF_UP)
//		        .multiply(upperLimit.divide(BigDecimal.valueOf(100)))
//		        .setScale(2, RoundingMode.HALF_UP);
//		String expectedResult = getLocaleMessage(RULE_EXPECTED_KEY, upperLimit.toString() +"%");
			
		String actualResult = null;
		String expectedResult = null;
		
		if(occupancyTypeHelper!=null && occupancyTypeHelper.getType().getName()!=null) {
			occupancy = occupancyTypeHelper.getType().getName();
//			if(A_AIF.equalsIgnoreCase(occupancyTypeHelper.getSubtype().getCode())
//					|| A_R.equalsIgnoreCase(occupancyTypeHelper.getSubtype().getCode())
//					|| F.equalsIgnoreCase(occupancyTypeHelper.getType().getCode())
//					) {
//				actualResult = getLocaleMessage(RULE_ACTUAL_KEY, coverage.setScale(2, RoundingMode.HALF_UP).toString()) + " m²";
//				expectedResult = getLocaleMessage(RULE_EXPECTED_KEY, upperLimit.toString()) + "m²";
//			}else {
				actualResult = getLocaleMessage(RULE_ACTUAL_KEY, coverageArea.setScale(2, RoundingMode.HALF_UP).toString() +" %");
				expectedResult = getLocaleMessage(RULE_EXPECTED_KEY, upperLimit.toString() +"%");
			//}
		}
		
		if (!(occupancy.equalsIgnoreCase("Residential") || occupancy.equalsIgnoreCase("Mercantile / Commercial")
				|| (occupancy.equalsIgnoreCase("Industrial")))) {
			scrutinyDetail.addColumnHeading(6, DESCRIPTION);
			//scrutinyDetail.addColumnHeading(5, PERMISSIBLE);
		}
		
		Boolean validateCoverage = false;
		
		if(Far.shouldSkipValidation(pl.getEdcrRequest(), DcrConstants.EDCR_SKIP_PLOT_COVERAGE)) {
			validateCoverage = true;
		}else {
			if (coverage.compareTo(BigDecimal.ZERO) > 0 
			        && coverage.compareTo(upperLimit) <= 0) {
			    validateCoverage = true;
			} else {
			    validateCoverage = false;
			}

		}
		
		if (validateCoverage 
				&& (occupancy.equalsIgnoreCase("Residential")
				|| occupancy.equalsIgnoreCase("Mercantile / Commercial"))
				|| (occupancy.equalsIgnoreCase("Industrial"))) {
			Map<String, String> details = new HashMap<>();
			details.put(RULE_NO, RULE);
			//details.put(DEVELOPMENT_ZONE, developmentZone);
			details.put(OCCUPANCY, occupancy);
			details.put(PERMISSIBLE, expectedResult);
			details.put(PROVIDED, actualResult);
			details.put(STATUS, Result.Accepted.getResultVal());

			if (!(occupancy.equalsIgnoreCase("Residential") || occupancy.equalsIgnoreCase("Mercantile / Commercial"))) {
				details.put(DESCRIPTION, desc);
				//details.put(PERMISSIBLE, expectedResult);
			}
			scrutinyDetail.getDetail().add(details);
			pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);

		} else {
			Map<String, String> details = new HashMap<>();
			details.put(RULE_NO, RULE);
			//details.put(DEVELOPMENT_ZONE, developmentZone);
			details.put(OCCUPANCY, occupancy);
			details.put(PERMISSIBLE, expectedResult);
			details.put(PROVIDED, actualResult);
			details.put(STATUS, Result.Not_Accepted.getResultVal());

			if (!(occupancy.equalsIgnoreCase("Residential") || occupancy.equalsIgnoreCase("Mercantile / Commercial"))) {
				details.put(DESCRIPTION, desc);
				//details.put(PERMISSIBLE, expectedResult);
			}
			scrutinyDetail.getDetail().add(details);
			pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
		}

	}

	protected OccupancyType getMostRestrictiveCoverage(EnumSet<OccupancyType> distinctOccupancyTypes) {

		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_B1))
			return OccupancyType.OCCUPANCY_B1;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_B2))
			return OccupancyType.OCCUPANCY_B2;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_B3))
			return OccupancyType.OCCUPANCY_B3;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_D))
			return OccupancyType.OCCUPANCY_D;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_D1))
			return OccupancyType.OCCUPANCY_D1;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_I2))
			return OccupancyType.OCCUPANCY_I2;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_I1))
			return OccupancyType.OCCUPANCY_I1;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_C))
			return OccupancyType.OCCUPANCY_C;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_A1))
			return OccupancyType.OCCUPANCY_A1;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_A4))
			return OccupancyType.OCCUPANCY_A4;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_A2))
			return OccupancyType.OCCUPANCY_A2;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_G1))
			return OccupancyType.OCCUPANCY_G1;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_E))
			return OccupancyType.OCCUPANCY_E;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_F))
			return OccupancyType.OCCUPANCY_F;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_F4))
			return OccupancyType.OCCUPANCY_F4;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_G2))
			return OccupancyType.OCCUPANCY_G2;
		if (distinctOccupancyTypes.contains(OccupancyType.OCCUPANCY_H))
			return OccupancyType.OCCUPANCY_H;

		else
			return null;
	}

	@Override
	public Map<String, Date> getAmendments() {
		return new LinkedHashMap<>();
	}
	
//	public static BigDecimal calculateGroundCoverage(BigDecimal plotArea) {
//
//        LOG.info("=== Ground Coverage Calculation Started ===");
//        LOG.info("Input Plot Area: {}", plotArea.toPlainString());
//
//        BigDecimal remaining = plotArea;
//        BigDecimal totalCoverage = BigDecimal.ZERO;
//
//        // Updated slabs as per your image:
//        BigDecimal[][] slabs = {
//                { new BigDecimal("100"), new BigDecimal("0.90") },   // Up to 100 sq.m – 90%
//                { new BigDecimal("50"),  new BigDecimal("0.80") },   // Next 50 sq.m – 80%
//                { new BigDecimal("100"), new BigDecimal("0.70") },   // Next 100 sq.m – 70%
//                { new BigDecimal("100"), new BigDecimal("0.60") },   // Next 100 sq.m – 60%
//                { new BigDecimal("100"), new BigDecimal("0.50") },   // Next 100 sq.m – 50%
//                { null, new BigDecimal("0.40") }                     // Remaining – 40%
//        };
//
//        for (int i = 0; i < slabs.length; i++) {
//
//            LOG.info("\n--- Processing Slab {} ---", (i + 1));
//            LOG.info("Remaining Plot Area Before Slab: {}", remaining.toPlainString());
//
//            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
//                LOG.info("No remaining area. Stopping calculation.");
//                break;
//            }
//
//            BigDecimal limit = slabs[i][0];
//            BigDecimal percent = slabs[i][1];
//
//            LOG.info("Slab Limit: {}", (limit == null ? "Infinity (Remaining)" : limit.toPlainString()));
//            LOG.info("Slab Coverage %: {}", percent.toPlainString());
//
//            BigDecimal areaToUse = (limit == null) ? remaining : remaining.min(limit);
//
//            LOG.info("Area Used in This Slab: {}", areaToUse.toPlainString());
//
//            BigDecimal coverage = areaToUse.multiply(percent);
//
//            LOG.info("Coverage for This Slab: {} ({} * {})",
//                    coverage.toPlainString(),
//                    areaToUse.toPlainString(),
//                    percent.toPlainString()
//            );
//
//            totalCoverage = totalCoverage.add(coverage);
//
//            LOG.info("Total Coverage After This Slab: {}", totalCoverage.toPlainString());
//
//            remaining = remaining.subtract(areaToUse);
//            LOG.info("Remaining Plot Area After Slab: {}", remaining.toPlainString());
//        }
//
//        LOG.info("\n=== Final Total Ground Coverage Allowed: {} sq.m ===", totalCoverage.toPlainString());
//        LOG.info("=== Ground Coverage Calculation Completed ===");
//
//        return totalCoverage;
//    }
	
	public static BigDecimal calculateGroundCoverage(BigDecimal plotArea, Plan pl) {

	    LOG.info("=== Ground Coverage Calculation Started ===");

	    if (plotArea == null || plotArea.compareTo(BigDecimal.ZERO) <= 0) {
	        LOG.warn("Invalid Plot Area: {}. Coverage = 0",
	                (plotArea == null ? "null" : plotArea.toPlainString()));
	        return BigDecimal.ZERO;
	    }

	    // ------------------ LOAD SLABS FROM MDMS ------------------
	    LOG.info("Fetching Site Coverage Slabs from MDMS...");

	    Optional<List> fullListOpt = BpaMdmsUtil.extractMdmsValue(
        		pl.getMdmsMasterData().get("masterMdmsData"), 
        		MdmsFilter.SITE_COVERAGE_PATH, List.class);
	    
	    if (!fullListOpt.isPresent()) {
	        LOG.error("No Site Coverage data found in MDMS!");
	        pl.addError("No Site Coverage data found in MDMS", "No Site Coverage data found in MDMS");
	        return BigDecimal.ZERO;
	    }

	    @SuppressWarnings("unchecked")
	    List<Map<String, Object>> slabList = (List<Map<String, Object>>) fullListOpt.get();

	    if (slabList.isEmpty()) {
	        LOG.error("Site Coverage slab list is EMPTY in MDMS!");	       
	        return BigDecimal.ZERO;
	    }

	    LOG.info("Site Coverage Slabs Loaded From MDMS: {}", slabList);

	    // Convert using Streams
	    BigDecimal[][] slabs = slabList.stream()
	            .map(slab -> {

	                // Extract limit
	                int limitInt = Integer.parseInt(slab.get("limit").toString());
	                BigDecimal limitBD = (limitInt == -1)
	                        ? new BigDecimal("-1")
	                        : new BigDecimal(slab.get("limit").toString());

	                // Extract percentage
	                BigDecimal percentBD = new BigDecimal(slab.get("percentage").toString());

	                LOG.info("Loaded Slab → Limit: {}, Percentage: {}",
	                        limitBD.toPlainString(),
	                        percentBD.toPlainString());

	                return new BigDecimal[]{limitBD, percentBD};

	            })
	            .toArray(BigDecimal[][]::new);

	    // ------------------ START CALCULATION ------------------
	    LOG.info("Input Plot Area: {}", plotArea.toPlainString());

	    BigDecimal remaining = plotArea;
	    BigDecimal totalCoverage = BigDecimal.ZERO;

	    for (int i = 0; i < slabs.length; i++) {

	        LOG.info("\n--- Processing Slab {} ---", (i + 1));
	        LOG.info("Remaining Plot Area Before Slab: {}", remaining.toPlainString());

	        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
	            LOG.info("No remaining area. Stopping calculation.");
	            break;
	        }

	        BigDecimal limit = slabs[i][0];
	        BigDecimal percent = slabs[i][1];

	        boolean isRemainingSlab = limit.compareTo(BigDecimal.ZERO) < 0;

	        LOG.info("Slab Limit: {}", 
	                isRemainingSlab ? "Remaining (∞)" : limit.toPlainString());
	        LOG.info("Slab Coverage %: {}", percent.toPlainString());

	        BigDecimal areaToUse = isRemainingSlab ? remaining : remaining.min(limit);

	        LOG.info("Area Used in This Slab: {}", areaToUse.toPlainString());

	        BigDecimal coverage = areaToUse.multiply(percent);

	        LOG.info("Coverage for This Slab: {} ({} * {})",
	                coverage.toPlainString(),
	                areaToUse.toPlainString(),
	                percent.toPlainString()
	        );

	        totalCoverage = totalCoverage.add(coverage);
	        LOG.info("Total Coverage After This Slab: {}", totalCoverage.toPlainString());

	        remaining = remaining.subtract(areaToUse);
	        LOG.info("Remaining Plot Area After Slab: {}", remaining.toPlainString());
	    }

	    LOG.info("\n=== Final Total Ground Coverage Allowed: {} sq.m ===",
	            totalCoverage.toPlainString());
	    LOG.info("=== Ground Coverage Calculation Completed ===");

	    return totalCoverage;
	}

}
