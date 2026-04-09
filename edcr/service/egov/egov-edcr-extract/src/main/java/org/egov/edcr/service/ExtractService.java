package org.egov.edcr.service;

import static org.egov.edcr.utility.DcrConstants.OBJECTNOTDEFINED;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.egov.common.entity.edcr.Plan;
import org.egov.common.entity.edcr.PlanFeature;
import org.egov.common.entity.edcr.PlanInformation;
import org.egov.commons.edcr.mdms.filter.MdmsFilter;
import org.egov.commons.mdms.BpaMdmsUtil;
import org.egov.commons.mdms.EDCRMdmsUtil;
import org.egov.commons.mdms.config.MdmsConfiguration;
import org.egov.commons.mdms.model.MdmsEdcrResponse;
import org.egov.commons.mdms.validator.MDMSValidator;
import org.egov.edcr.constants.DxfFileConstants;
import org.egov.edcr.entity.Amendment;
import org.egov.edcr.entity.AmendmentDetails;
import org.egov.edcr.entity.blackbox.PlanDetail;
import org.egov.edcr.entity.blackbox.PlotDetail;
import org.egov.edcr.feature.FeatureExtract;
import org.egov.edcr.utility.DcrConstants;
import org.egov.edcr.utility.Util;
import org.egov.infra.admin.master.entity.AppConfigValues;
import org.egov.infra.admin.master.entity.City;
import org.egov.infra.admin.master.service.AppConfigValueService;
import org.egov.infra.admin.master.service.CityService;
import org.egov.infra.config.core.ApplicationThreadLocals;
import org.egov.infra.custom.CustomImplProvider;
import org.egov.infra.microservice.models.RequestInfo;
import org.egov.infra.microservice.models.Role;
import org.egov.infra.validation.exception.ValidationError;
import org.egov.infra.validation.exception.ValidationException;
import org.json.simple.JSONObject;
import org.kabeja.dxf.DXFDocument;
import org.kabeja.dxf.DXFLWPolyline;
import org.kabeja.parser.DXFParser;
import org.kabeja.parser.ParseException;
import org.kabeja.parser.Parser;
import org.kabeja.parser.ParserBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ExtractService {
	@Autowired
	private CustomImplProvider specificRuleService;
	@Autowired
	private AppConfigValueService appConfigValueService;
	@Autowired
	private EDCRMdmsUtil edcrMdmsUtil;
	@Autowired
	private MdmsConfiguration mdmsConfiguration;
	@Autowired
	private CityService cityService;
	@Autowired
	private MDMSValidator mdmsValidator;

	private Logger LOG = LogManager.getLogger(ExtractService.class);

//	public static final String ROLE_ARCHITECT = "BPA_ARCHITECT";
//	public static final String ROLE_ENGINEER = "BPA_ENGINEER";
//	public static final String ROLE_TOWNPLANNER = "BPA_TOWNPLANNER";
//	public static final String ROLE_SUPERVISOR = "BPA_SUPERVISOR";
//	public static final String ROLE_DESIGNER = "BPA_DESIGNER";
//
//	// Constants for role-based plot area limits
//	private static final BigDecimal LIMIT_ENGINEER = new BigDecimal("500");
//	private static final BigDecimal LIMIT_TOWNPLANNER = new BigDecimal("500");
//	private static final BigDecimal LIMIT_SUPERVISOR = new BigDecimal("250");
	
	public static final String COMPETENCY_CHECK_ERROR_MESSAGE =
	        "Permissible limit exceeded!\n" +
	        "The maximum permissible plot size for an %s is %s sq. meters, " +
	        "but the uploaded file indicates %s sq. meters. " +
	        "Please review and modify the entry as per the applicable limit.";
	
	public static final String UN_AUTHORISED_ERROR_MESSAGE = "%s is not permitted to scrutinize any plan.";

	public Plan extract(File dxfFile, Amendment amd, Date scrutinyDate, List<PlanFeature> features, String tenantID) {

		PlanInformation pi = new PlanInformation();
		DXFDocument doc = getDxfDocument(dxfFile);
		PlanDetail planDetail = new PlanDetail();
		planDetail.setDoc(doc);
		planDetail.setPlanInformation(pi);
		planDetail.setApplicationDate(scrutinyDate);
		Map<String, String> cityDetails = specificRuleService.getCityDetails();

		if (doc.getDXFHeader().getVariable("$INSUNITS") != null) {
			String unitValue = doc.getDXFHeader().getVariable("$INSUNITS").getValue("70");
			if ("1".equalsIgnoreCase(unitValue)) {
				planDetail.getDrawingPreference().setUom(DxfFileConstants.INCH_UOM);
			} else if ("2".equalsIgnoreCase(unitValue)) {
				planDetail.getDrawingPreference().setUom(DxfFileConstants.FEET_UOM);
			} else if ("6".equalsIgnoreCase(unitValue)) {
				planDetail.getDrawingPreference().setUom(DxfFileConstants.METER_UOM);
			} else {
				planDetail.getDrawingPreference().setInMeters(false);
				planDetail.getErrors().put("units not in meters", "The 'Drawing Unit' is not as per standard. ");
			}
		}

		/*
		 * // dimension length factor should be 1 if (doc.getDXFHeader() != null &&
		 * doc.getDXFHeader().getVariable("$DIMLFAC") != null) { BigDecimal
		 * dimensionLengthFactor = new BigDecimal(
		 * doc.getDXFHeader().getVariable("$DIMLFAC").getValue("40")); if
		 * (dimensionLengthFactor.compareTo(BigDecimal.ONE) != 0) {
		 * planDetail.getDrawingPreference().setLengthFactor(false);
		 * planDetail.getErrors().put("length factor",
		 * "The dimension length factor is not 1."); } }
		 */
		if (planDetail.getErrors().size() > 0)
			return (Plan) planDetail;
		Boolean mdmsEnabled = mdmsConfiguration.getMdmsEnabled();
		LOG.info("mdms enable : " + mdmsEnabled);
		if (mdmsEnabled != null && mdmsEnabled) {
			City stateCity = cityService.fetchStateCityDetails();
			//String tenantID = ApplicationThreadLocals.getTenantID();
			//String tenantID = plan.getEdcrRequest().getTenantId();
//			Object mdmsData = edcrMdmsUtil.mDMSCall(new RequestInfo(),
//					new StringBuilder().append(stateCity.getCode()).append(".").append(tenantID).toString());
			Object mdmsData = edcrMdmsUtil.mDMSCall(new RequestInfo(),ApplicationThreadLocals.getStateName());

			if (mdmsData == null) {
				tenantID = stateCity.getCode();
				mdmsData = edcrMdmsUtil.mDMSCall(new RequestInfo(), tenantID);
			}
			if (mdmsData != null) {
				Map<String, List<Object>> edcrMdmsConfig = mdmsValidator.getAttributeValues(mdmsData,
						DcrConstants.MDMS_EDCR_MODULE);
				List<Object> dimensionConfig = edcrMdmsConfig.get("DimensionConfig");
				LinkedHashMap<String, String> configs = new LinkedHashMap<>();
				for (Object obj : dimensionConfig) {
					try {
						String jsonString = new JSONObject((LinkedHashMap<?, ?>) obj).toString();
						ObjectMapper mapper = new ObjectMapper();
						MdmsEdcrResponse res = mapper.readValue(jsonString, MdmsEdcrResponse.class);
						configs.put(res.getCode(), res.getEnabled());
					} catch (IOException e) {
						LOG.error("Error occured while reading mdms data", e);
					}

				}
				if (!configs.isEmpty()) {
					planDetail.setStrictlyValidateDimension(
							Boolean.valueOf(configs.get(DcrConstants.MDMS_STRICTLY_VALIDATE_DIMENSION)));
					planDetail.setStrictlyValidateBldgHeightDimension(
							Boolean.valueOf(configs.get(DcrConstants.MDMS_STRICTLY_VALIDATE_BLDG_HGHT_DIMENSION)));
				}

			}
		} else {
			List<AppConfigValues> appConfigValueList = appConfigValueService.getConfigValuesByModuleAndKey(
					DcrConstants.APPLICATION_MODULE_TYPE, DcrConstants.STRICTLY_VALIDATE_DIMENSION);

			if (appConfigValueList != null && !appConfigValueList.isEmpty()) {
				String value = appConfigValueList.get(0).getValue();
				planDetail.setStrictlyValidateDimension(DcrConstants.YES.equalsIgnoreCase(value));
			}
			List<AppConfigValues> bldgHghtDimensionValidation = appConfigValueService.getConfigValuesByModuleAndKey(
					DcrConstants.APPLICATION_MODULE_TYPE, DcrConstants.STRICTLY_VALIDATE_BLDG_HGHT_DIMENSION);
			if (bldgHghtDimensionValidation != null && !bldgHghtDimensionValidation.isEmpty()) {
				String value = bldgHghtDimensionValidation.get(0).getValue();
				planDetail.setStrictlyValidateBldgHeightDimension(DcrConstants.YES.equalsIgnoreCase(value));
			}
		}

		int index = -1;
		AmendmentDetails[] a = null;
		int length = amd.getDetails().size();
		if (!amd.getDetails().isEmpty()) {
			index = amd.getIndex(planDetail.getApplicationDate());
			a = new AmendmentDetails[amd.getDetails().size()];
			amd.getDetails().toArray(a);
		}

		Date start = new Date();
		LOG.info("Initializeing fetch extract api" + start);
		for (PlanFeature ruleClass : features) {
			FeatureExtract rule = null;

			try {

				if (ruleClass.getRuleClass() != null) {
					String str = ruleClass.getRuleClass().getSimpleName();
					str = str.substring(0, 1).toLowerCase() + str.substring(1);
					LOG.info("Looking for bean " + str);

					if (amd.getDetails().isEmpty() || index == -1)
						rule = (FeatureExtract) specificRuleService.find(str + "Extract");
					else {

						if (index >= 0) {
							for (int i = index; i < length; i++) {
								if (a[i].getChanges().keySet().contains(ruleClass.getClass().getSimpleName())) {
									String strNew = str + "Extract_" + a[i].getDateOfBylawString();

									rule = (FeatureExtract) specificRuleService.find(strNew);
									if (rule != null)
										break;
								}

							}

						}

						if (rule == null) {
							rule = (FeatureExtract) specificRuleService.find(str + "Extract");
						}
						// for all amendments

					}

				}
			} catch (Exception e) {
				LOG.error("Exception while finding extract api for  " + ruleClass.getRuleClass(), e);
			}

			if (rule != null) {
				LOG.info("Got bean ..." + rule.getClass().getSimpleName());
				try {
					rule.extract(planDetail);
				} catch (Exception e) {
					String str = ruleClass.getRuleClass().getSimpleName();
//					planDetail.addError("msg.error.failed.on.extraction",
//							"Please contact the adminstrator for the further information. The plan is failing while extracting data from plan in the feature "
//									+ rule);
					String errorFeatureKey = "Error in "+ str +" extraction";
					planDetail.addError(errorFeatureKey,
							"The plan is failing while extracting data from plan in the "+ str);
					// FULL STACKTRACE logged
                    LOG.error("Exception while processing feature: {}", str, e);
				}
			} else
				LOG.error("Extract Api is not defined for " + ruleClass.getRuleClass());

		}
		Date end = new Date();
		LOG.info("Ending fetch extract api" + end);
		return (Plan) planDetail;

	}

	private DXFDocument getDxfDocument(File file) {
		Parser parser = ParserBuilder.createDefaultParser();
		try {
			parser.parse(file.getPath(), DXFParser.DEFAULT_ENCODING);
		} catch (ParseException e) {
			LOG.error("Error in gettting default parser", e);
			// throw e;

			StackTraceElement[] stackTrace = e.getStackTrace();
			for (StackTraceElement ele : stackTrace) {
				if (ele.toString().toLowerCase().contains("font")) {
					throw new ValidationException(
							Arrays.asList(new ValidationError("Unsupported font is used", "Unsupported font is used")));
				}
			}

		} catch (NoSuchElementException e) {
			StackTraceElement[] stackTrace = e.getStackTrace();
			for (StackTraceElement ele : stackTrace) {
				if (ele.toString().toLowerCase().contains("font")) {
					throw new ValidationException(
							Arrays.asList(new ValidationError("Unsupported font is used", "Unsupported font is used")));
				}
			}
		} catch (Exception e) {
			StackTraceElement[] stackTrace = e.getStackTrace();
			for (StackTraceElement ele : stackTrace) {
				if (ele.toString().toLowerCase().contains("font")) {
					throw new ValidationException(
							Arrays.asList(new ValidationError("Unsupported font is used", "Unsupported font is used")));
				}
			}
		}
		// Extract DXF Data
		DXFDocument doc = parser.getDocument();
		return doc;
	}

//    public void validateRolesWisePlotArea(File dxfFile, Date scrutinyDate, List<Role> roles, 
//    		BigDecimal plotArea, Plan plan) {
//    	PlanInformation pi = new PlanInformation();
//        DXFDocument doc = getDxfDocument(dxfFile);
//
//        if (plotArea == null || plotArea.compareTo(BigDecimal.ZERO) <= 0) {
//        	plotArea = extractPlotDetails(doc);
//        } 
//        
//      // ✅ Iterate roles
//      for (Role role : roles) {
//          String roleCode = role.getCode();
//          Boolean mdmsEnabled = mdmsConfiguration.getMdmsEnabled();
//	  	    if (Boolean.TRUE.equals(mdmsEnabled)) {
//	  	    	Object mdmsData = edcrMdmsUtil.mdmsRolesCall(new RequestInfo(), plan.getEdcrRequest().getTenantId(),roleCode);
//	  	    	if (ROLE_ARCHITECT.equalsIgnoreCase(roleCode)) {
//	                // Architect has no restriction
//	                //return planDetail;
//	            }
//	  	    }
//
//          if (ROLE_ARCHITECT.equalsIgnoreCase(roleCode)) {
//              // Architect has no restriction
//              //return planDetail;
//          }
//
//          if (ROLE_ENGINEER.equalsIgnoreCase(roleCode)) {
//              if (plotArea.compareTo(LIMIT_ENGINEER) <= 0) {
//                  //return planDetail;
//              } else {
//            	  plan.getErrors().put(
//                      "Not authorized to scrutinize",
//                      "Your role [BPA_ENGINEER] allows maximum plot area of "
//                              + LIMIT_ENGINEER + " Sqm, but provided plot area is " + plotArea + " Sqm."
//                  );
//                  //return plan;
//              }
//          }
//
//          if (ROLE_TOWNPLANNER.equalsIgnoreCase(roleCode)) {
//              if (plotArea.compareTo(LIMIT_TOWNPLANNER) <= 0) {
//                  //return planDetail;
//              } else {
//            	  plan.getErrors().put(
//                      "Not authorized to scrutinize",
//                      "Your role [BPA_TOWNPLANNER] allows maximum plot area of "
//                              + LIMIT_TOWNPLANNER + " Sqm, but provided plot area is " + plotArea + " Sqm."
//                  );
//                  //return (Plan) planDetail;
//              }
//          }
//
//          if (ROLE_SUPERVISOR.equalsIgnoreCase(roleCode) || "BPA_DESIGNER".equalsIgnoreCase(roleCode)) {
//              if (plotArea.compareTo(LIMIT_SUPERVISOR) <= 0) {
//                  //return planDetail;
//              } else {
//            	  plan.getErrors().put(
//                      "Not authorized to scrutinize",
//                      "Your role [" + roleCode + "] allows maximum plot area of "
//                              + LIMIT_SUPERVISOR + " Sqm, but provided plot area is " + plotArea + " Sqm."
//                  );
//                  //return (Plan) planDetail;
//              }
//          }
//      }
//
//      // No recognized role      
////      plan.getErrors().put(
////          "Role not permitted",
////          "You don't have a valid role to perform plot area scrutiny. Allowed roles are Architect, Engineer, TownPlanner, Supervisor, Designer."
////      );
//      //return (Plan) planDetail;
//  }

//	public void validateRolesWisePlotArea(File dxfFile, Date scrutinyDate, List<Role> roles, BigDecimal plotArea,
//			Plan plan) {
//		LOG.info("Inside validateRolesWisePlotArea ");
//		
//		//Extract plot area if not provided
//		LOG.info("Plot area is : " + plotArea);
//		if (plotArea == null || plotArea.compareTo(BigDecimal.ZERO) <= 0) {
//			LOG.info("before getDxf document");		
//			DXFDocument doc = getDxfDocument(dxfFile);
//			LOG.info("successfully get getDxf document");
//			LOG.info("Plot area is null , extracting plot Area : " + plotArea);
//			plotArea = extractPlotDetails(doc);
//			LOG.info("extracted Plot area : " + plotArea);
//		}
//		LOG.info("Roles info Size : " + roles.size());
//
//		//Boolean mdmsEnabled = mdmsConfiguration.getMdmsEnabled();
//		// Iterate through roles and validate via MDMS configuration
//		for (Role role : roles) {
//			String roleCode = role.getCode();
//			LOG.info("fetching role wise data for  : " + roleCode);
//			// Skip if MDMS not enabled
////			if (!Boolean.TRUE.equals(mdmsEnabled)) {
////				continue;
////			}
//
//			try {
//				//Fetch MDMS data for this role
//				Object mdmsData = edcrMdmsUtil.mdmsRolesCall(new RequestInfo(), plan.getEdcrRequest().getTenantId(),
//						roleCode);
//
//				if (mdmsData!=null) {
//					// Parse MDMS response
//					Map<String, List<Map<String, Object>>> mdmsResponse = BpaMdmsUtil.mdmsResponseMapper(mdmsData,
//							String.format(MdmsFilter.ROLE_FILTER, roleCode));
//					
//					if (mdmsResponse.isEmpty()) {
//						LOG.warn("Empty role data from MDMS for role: {}", roleCode);
//						continue;
//					}
//
//					// Extract the role configuration
//					List<Map<String, Object>> rolesList = mdmsResponse.values().iterator().next();
//					if (rolesList.isEmpty())
//						continue;
//
//					Map<String, Object> roleData = rolesList.get(0);
//					Boolean isScrutinizeAllow = roleData.get("isScrutinizeAllow") != null
//							? Boolean.valueOf(roleData.get("isScrutinizeAllow").toString())
//							: Boolean.FALSE;
//
//					//Skip roles not allowed for scrutiny
//					if (!isScrutinizeAllow) {
//						plan.getErrors().put("Not authorized to scrutinize",
//								"Your role [" + roleCode + "] is not permitted to scrutinize any plan.");
//						continue;
//					}else {
//						// Extract max allowed plot area and scrutiny flag
//						BigDecimal maxAllowedPlotArea = roleData.get("maxAllowedPlotArea") != null
//								? new BigDecimal(roleData.get("maxAllowedPlotArea").toString())
//								: BigDecimal.ZERO;
//						
//						//Validate plot area limit
//						if (plotArea.compareTo(maxAllowedPlotArea) > 0) {
//							plan.getErrors().put("Not authorized to scrutinize",
//									"Your role [" + roleCode + "] allows maximum plot area of " + maxAllowedPlotArea
//											+ " Sqm, but provided plot area is " + plotArea + " Sqm.");
//						} 
//							//else {
////							LOG.info("Role [{}] authorized for plot area {} (limit: {})", roleCode, plotArea,
////									maxAllowedPlotArea);
////						}
//					}					
//				}else {
//					LOG.info("No MDMS data found for role: {}", roleCode);
//					plan.getErrors().put("Not authorized to scrutinize",
//							"Your role [" + roleCode + "] is not permitted to scrutinize any plan.");
//					continue;
//				}
//
//			} catch (Exception e) {
//				LOG.error("Error fetching role details from MDMS for role: {}", roleCode, e);
//			}
//		}
//
//		// If no roles were recognized or authorized, log warning
//		if (plan.getErrors().isEmpty()) {
//			LOG.info("All roles validated successfully for plot area: {}", plotArea);
//		}
//		LOG.info("exits validateRolesWisePlotArea ");
//	}
	
	public void validateRolesWisePlotArea(File dxfFile, Date scrutinyDate, List<Role> roles, BigDecimal plotArea, Plan plan) {
	    LOG.info("Inside validateRolesWisePlotArea ");
	    LOG.info("Plot area is : {}", plotArea);

	    if (Boolean.TRUE.equals(mdmsConfiguration.getMdmsEnabled())) {
	    	// Extract plot area if not provided
		    if (plotArea == null || plotArea.compareTo(BigDecimal.ZERO) <= 0) {
		        LOG.info("Plot area is null or zero. Attempting to extract from DXF...");

		        if (dxfFile == null) {
		            LOG.error("DXF file is null. Cannot extract plot area.");
		            plan.getErrors().put("DXF File Missing", "DXF file is required to extract plot area.");
		            return;
		        }

		        DXFDocument doc = getDxfDocument(dxfFile);
		        if (doc == null) {
		            LOG.error("Failed to load DXFDocument. Extraction aborted.");
		            plan.getErrors().put("DXF Load Failed", "Unable to parse DXF file for plot area extraction.");
		            return;
		        }

		        plotArea = extractPlotDetails(doc);
		        LOG.info("Extracted Plot Area: {}", plotArea);
		    }

		    // Safe check for roles
		    if (roles == null || roles.isEmpty()) {
		        LOG.info("No roles provided for validation. Skipping role-wise plot area check.");
		        //plan.getErrors().put("Role Missing", "No roles assigned to current user.");
		        return;
		    }

		    LOG.info("Roles info Size : {}", roles.size());

		    // Iterate through roles and validate via MDMS configuration
		    for (Role role : roles) {
		        if (role == null) continue; // extra safety
		        String roleCode = role.getCode();
		        LOG.info("Fetching role wise data for: {}", roleCode);
		        
		        try {
		        	LOG.info("fetching roles data from mdms");
		            Object mdmsData = edcrMdmsUtil.mdmsRolesCall(new RequestInfo(), "pb", roleCode);

		            if (mdmsData != null) {
		                Map<String, List<Map<String, Object>>> mdmsResponse =
		                        BpaMdmsUtil.mdmsResponseMapper(mdmsData, String.format(MdmsFilter.ROLE_FILTER, roleCode));

		                if (mdmsResponse.isEmpty()) {
		                    LOG.warn("Empty role data from MDMS for role: {}", roleCode);
		                    continue;
		                }

		                List<Map<String, Object>> rolesList = mdmsResponse.values().iterator().next();
		                if (rolesList.isEmpty()) continue;

		                Map<String, Object> roleData = rolesList.get(0);
		                Boolean isScrutinizeAllow = roleData.get("isScrutinizeAllow") != null
		                        ? Boolean.valueOf(roleData.get("isScrutinizeAllow").toString())
		                        : Boolean.FALSE;
		                String roleName = String.valueOf(roleData.get("name"));

		                if (!isScrutinizeAllow) {
		                	String errorMessage = String.format(
		                			UN_AUTHORISED_ERROR_MESSAGE, roleName); 
		                	plan.getErrors().clear();
		                    plan.getErrors().put("Not authorized to scrutinize", errorMessage);
		                    continue;
		                } else {
		                    BigDecimal maxAllowedPlotArea = roleData.get("maxAllowedPlotArea") != null
		                            ? new BigDecimal(roleData.get("maxAllowedPlotArea").toString())
		                            : BigDecimal.ZERO;

		                    if (plotArea != null && plotArea.compareTo(maxAllowedPlotArea) > 0) {
		                    	String errorMessage = String.format(
		                    	        COMPETENCY_CHECK_ERROR_MESSAGE,
		                    	        roleName,
		                    	        maxAllowedPlotArea,
		                    	        plotArea
		                    	);
//		                        plan.getErrors().put("Not authorized to scrutinize",
//		                                "Your role [" + roleCode + "] allows maximum plot area of " + maxAllowedPlotArea
//		                                        + " Sqm, but provided plot area is " + plotArea + " Sqm.");
		                    	//clear all the errors from , only show un-authorised error message
		                    	plan.getErrors().clear();
		                    	plan.getErrors().put("Not authorized to scrutinize", errorMessage);
		                    	
		                    }
		                }
		            } else {
		                LOG.info("No MDMS data found for role: {}", roleCode);
		                plan.getErrors().put("Not authorized to scrutinize",
		                        "Your role [" + roleCode + "] is not permitted to scrutinize any plan.");
		            }

		        } catch (Exception e) {
		            LOG.error("Error fetching role details from MDMS for role: {}", roleCode, e);
		        }
		    }

		    if (plan.getErrors().isEmpty()) {
		        LOG.info("All roles validated successfully for plot area: {}", plotArea);
		    }

	    }else {
	        LOG.info("MDSM enable property is : False , Skipping role-wise plot area validations check.");
	    }
	    
	    LOG.info("Exits validateRolesWisePlotArea ");
	}


	private BigDecimal extractPlotDetails(DXFDocument doc) {
		LOG.info("Inside extractPlotDetails");
		List<DXFLWPolyline> plotBoundaries = Util.getPolyLinesByLayer(doc, "PLOT_BOUNDARY");
		BigDecimal area = BigDecimal.valueOf(0.0);
		if (!plotBoundaries.isEmpty()) {
			DXFLWPolyline plotBndryPolyLine = plotBoundaries.get(0);
			// ((PlotDetail) pl.getPlot()).setPolyLine(plotBndryPolyLine);
			// pl.getPlot().setPlotBndryArea(Util.getPolyLineArea(plotBndryPolyLine));
			area = Util.getPolyLineArea(plotBndryPolyLine);
			if (area == null) {
				// pl.getPlot().setPlotBndryArea(BigDecimal.valueOf(0.0));
			} else {
				// pl.getPlot().setPlotBndryArea(area);
				area = area.setScale(2, RoundingMode.HALF_UP);
			}
		} else {
			// pl.getPlot().setPlotBndryArea(BigDecimal.valueOf(0.0));
			// pl.addError("PLOT_BOUNDARY", OBJECTNOTDEFINED + "PLOT_BOUNDARY");
		}
		LOG.info("extracted plotArea : " + area);
		LOG.info("exit extractPlotDetails");
		return area;
	}

}
