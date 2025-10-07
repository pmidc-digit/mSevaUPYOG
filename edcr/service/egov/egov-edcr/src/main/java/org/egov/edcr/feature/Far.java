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

import static org.egov.edcr.constants.DxfFileConstants.A;
import static org.egov.edcr.constants.DxfFileConstants.A2;
import static org.egov.edcr.constants.DxfFileConstants.A_AF;
import static org.egov.edcr.constants.DxfFileConstants.A_FH;
import static org.egov.edcr.constants.DxfFileConstants.A_R;
import static org.egov.edcr.constants.DxfFileConstants.A_SA;
import static org.egov.edcr.constants.DxfFileConstants.B2;
import static org.egov.edcr.constants.DxfFileConstants.D_A;
import static org.egov.edcr.constants.DxfFileConstants.D_B;
import static org.egov.edcr.constants.DxfFileConstants.D_C;
import static org.egov.edcr.constants.DxfFileConstants.E_CLG;
import static org.egov.edcr.constants.DxfFileConstants.E_EARC;
import static org.egov.edcr.constants.DxfFileConstants.E_NS;
import static org.egov.edcr.constants.DxfFileConstants.E_PS;
import static org.egov.edcr.constants.DxfFileConstants.E_SACA;
import static org.egov.edcr.constants.DxfFileConstants.E_SFDAP;
import static org.egov.edcr.constants.DxfFileConstants.E_SFMC;
import static org.egov.edcr.constants.DxfFileConstants.F;
import static org.egov.edcr.constants.DxfFileConstants.H_PP;
import static org.egov.edcr.constants.DxfFileConstants.M_DFPAB;
import static org.egov.edcr.constants.DxfFileConstants.M_HOTHC;
import static org.egov.edcr.constants.DxfFileConstants.M_NAPI;
import static org.egov.edcr.constants.DxfFileConstants.M_OHF;
import static org.egov.edcr.constants.DxfFileConstants.M_VH;
import static org.egov.edcr.constants.DxfFileConstants.S_BH;
import static org.egov.edcr.constants.DxfFileConstants.S_CA;
import static org.egov.edcr.constants.DxfFileConstants.S_CRC;
import static org.egov.edcr.constants.DxfFileConstants.S_ECFG;
import static org.egov.edcr.constants.DxfFileConstants.S_ICC;
import static org.egov.edcr.constants.DxfFileConstants.S_MCH;
import static org.egov.edcr.constants.DxfFileConstants.S_SAS;
import static org.egov.edcr.constants.DxfFileConstants.S_SC;
import static org.egov.edcr.constants.DxfFileConstants.G;
import static org.egov.edcr.constants.DxfFileConstants.G_PHI;
import static org.egov.edcr.constants.DxfFileConstants.G_NPHI;
import static org.egov.edcr.utility.DcrConstants.DECIMALDIGITS_MEASUREMENTS;
import static org.egov.edcr.utility.DcrConstants.OBJECTNOTDEFINED;
import static org.egov.edcr.utility.DcrConstants.PLOT_AREA;
import static org.egov.edcr.utility.DcrConstants.ROUNDMODE_MEASUREMENTS;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.egov.common.edcr.model.EdcrRequest;
import org.egov.common.entity.dcr.helper.ErrorDetail;
import org.egov.common.entity.dcr.helper.OccupancyHelperDetail;
import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Building;
import org.egov.common.entity.edcr.FarDetails;
import org.egov.common.entity.edcr.Floor;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.Occupancy;
import org.egov.common.entity.edcr.OccupancyTypeHelper;
import org.egov.common.entity.edcr.Plan;
import org.egov.common.entity.edcr.Result;
import org.egov.common.entity.edcr.ScrutinyDetail;
import org.egov.commons.edcr.mdms.filter.MdmsFilter;
import org.egov.commons.mdms.BpaMdmsUtil;
import org.egov.commons.mdms.config.MdmsConfiguration;
import org.egov.commons.mdms.validator.MDMSValidator;
import org.egov.edcr.constants.DxfFileConstants;
import org.egov.edcr.service.ProcessPrintHelper;
import org.egov.edcr.utility.DcrConstants;
import org.egov.infra.microservice.models.RequestInfo;
import org.egov.infra.utils.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.egov.commons.edcr.mdms.dataParser.*;

@Service
public class Far extends FeatureProcess {

	private static final Logger LOG = LogManager.getLogger(Far.class);
	
	@Autowired
    private MdmsConfiguration mdmsConfiguration;
	
	@Autowired
    private BpaMdmsUtil bpaMdmsUtil;
	
	@Autowired
    private MDMSValidator mDMSValidator;

	private static final String VALIDATION_NEGATIVE_FLOOR_AREA = "msg.error.negative.floorarea.occupancy.floor";
	private static final String VALIDATION_NEGATIVE_EXISTING_FLOOR_AREA = "msg.error.negative.existing.floorarea.occupancy.floor";
	private static final String VALIDATION_NEGATIVE_BUILTUP_AREA = "msg.error.negative.builtuparea.occupancy.floor";
	private static final String VALIDATION_NEGATIVE_EXISTING_BUILTUP_AREA = "msg.error.negative.existing.builtuparea.occupancy.floor";
	public static final String RULE_31_1 = "31-1";
	public static final String RULE = "4.4.4";

	private static final BigDecimal POINTTWO = BigDecimal.valueOf(0.2);
	private static final BigDecimal POINTFOUR = BigDecimal.valueOf(0.4);
	private static final BigDecimal POINTFIVE = BigDecimal.valueOf(0.5);
	private static final BigDecimal POINTSIX = BigDecimal.valueOf(0.6);
	private static final BigDecimal POINTSEVEN = BigDecimal.valueOf(0.7);
	private static final BigDecimal ONE = BigDecimal.valueOf(1);
	private static final BigDecimal ONE_POINTTWO = BigDecimal.valueOf(1.2);
	private static final BigDecimal ONE_POINTFIVE = BigDecimal.valueOf(1.5);
	private static final BigDecimal ONE_POINTEIGHT = BigDecimal.valueOf(1.8);
	private static final BigDecimal TWO = BigDecimal.valueOf(2);
	private static final BigDecimal TWO_POINTFIVE = BigDecimal.valueOf(2.5);
	private static final BigDecimal THREE = BigDecimal.valueOf(3);
	private static final BigDecimal THREE_POINTTWOFIVE = BigDecimal.valueOf(3.25);
	private static final BigDecimal THREE_POINTFIVE = BigDecimal.valueOf(3.5);
	private static final BigDecimal FIFTEEN = BigDecimal.valueOf(15);

	private static final BigDecimal ROAD_WIDTH_TWO_POINTFOUR = BigDecimal.valueOf(2.4);
	private static final BigDecimal ROAD_WIDTH_TWO_POINTFOURFOUR = BigDecimal.valueOf(2.44);
	private static final BigDecimal ROAD_WIDTH_THREE_POINTSIX = BigDecimal.valueOf(3.6);
	private static final BigDecimal ROAD_WIDTH_FOUR_POINTEIGHT = BigDecimal.valueOf(4.8);
	private static final BigDecimal ROAD_WIDTH_SIX_POINTONE = BigDecimal.valueOf(6.1);
	private static final BigDecimal ROAD_WIDTH_NINE_POINTONE = BigDecimal.valueOf(9.1);
	private static final BigDecimal ROAD_WIDTH_TWELVE_POINTTWO = BigDecimal.valueOf(12.2);

	private static final BigDecimal ROAD_WIDTH_EIGHTEEN_POINTTHREE = BigDecimal.valueOf(18.3);
	private static final BigDecimal ROAD_WIDTH_TWENTYFOUR_POINTFOUR = BigDecimal.valueOf(24.4);
	private static final BigDecimal ROAD_WIDTH_TWENTYSEVEN_POINTFOUR = BigDecimal.valueOf(27.4);
	private static final BigDecimal ROAD_WIDTH_THIRTY_POINTFIVE = BigDecimal.valueOf(30.5);

	public static final String OLD = "OLD";
	public static final String NEW = "NEW";
	public static final String OLD_AREA_ERROR = "road width old area";
	public static final String NEW_AREA_ERROR = "road width new area";
	public static final String OLD_AREA_ERROR_MSG = "No construction shall be permitted if the road width is less than 2.4m for old area.";
	public static final String NEW_AREA_ERROR_MSG = "No construction shall be permitted if the road width is less than 6.1m for new area.";

	// Constants for Residential FAR Added by Bimal Kumar
	public static final BigDecimal FAR_UP_TO_2_00 = new BigDecimal("2.00");
	public static final BigDecimal FAR_UP_TO_1_90 = new BigDecimal("1.90");
	public static final BigDecimal FAR_UP_TO_1_75 = new BigDecimal("1.75");
	public static final BigDecimal FAR_UP_TO_1_65 = new BigDecimal("1.65");
	public static final BigDecimal FAR_UP_TO_1_50 = new BigDecimal("1.50");
	public static final BigDecimal FAR_UP_TO_1_25 = new BigDecimal("1.25");

	// Plot Area Categories (Integer Values) Added by Bimal Kumar on 11 March 2024
	// for residential far updation
	public static final BigDecimal PLOT_AREA_UP_TO_100_SQM = new BigDecimal("100");
	public static final BigDecimal PLOT_AREA_100_150_SQM = new BigDecimal("150");
	public static final BigDecimal PLOT_AREA_150_200_SQM = new BigDecimal("200");
	public static final BigDecimal PLOT_AREA_200_300_SQM = new BigDecimal("300");
	public static final BigDecimal PLOT_AREA_300_500_SQM = new BigDecimal("500");
	public static final BigDecimal PLOT_AREA_500_1000_SQM = new BigDecimal("1000");
	public static final BigDecimal PLOT_AREA_ABOVE_1000_SQM = new BigDecimal(Integer.MAX_VALUE); // Use an appropriate
																									// upper bound

	public static final BigDecimal EXCLUDE_BALCONY_WIDTH_ABOVE_4_FEET_FROM_FAR = new BigDecimal("0.91");
	
	// Constants for Commercial
	private static final BigDecimal COMMERCIAL_PLOTAREA_LIMIT_41_82   = BigDecimal.valueOf(41.82);
	private static final BigDecimal COMMERCIAL_PLOTAREA_LIMIT_104_5   = BigDecimal.valueOf(104.5);
	private static final BigDecimal COMMERCIAL_PLOTAREA_LIMIT_209     = BigDecimal.valueOf(209);
	private static final BigDecimal COMMERCIAL_PLOTAREA_LIMIT_418_21  = BigDecimal.valueOf(418.21);

	private static final BigDecimal COMMERCIAL_FAR_1_50 = BigDecimal.valueOf(1.50);
	private static final BigDecimal COMMERCIAL_FAR_1_75 = BigDecimal.valueOf(1.75);
	private static final BigDecimal COMMERCIAL_FAR_2_00 = BigDecimal.valueOf(2.00);
	private static final BigDecimal COMMERCIAL_FAR_2_50 = BigDecimal.valueOf(2.50);
	private static final BigDecimal COMMERCIAL_FAR_3_00 = BigDecimal.valueOf(3.00);
	
	// Constants for Industrial FAR
	private static final BigDecimal INDUSTRIAL_FAR_1_50 = BigDecimal.valueOf(1.50);
	private static final BigDecimal INDUSTRIAL_FAR_3_00 = BigDecimal.valueOf(3.00);
	private static final BigDecimal INDUSTRIAL_FAR_2_50 = BigDecimal.valueOf(2.50);

	// Industrial Plot Area Limits
	private static final BigDecimal INDUSTRIAL_PLOTAREA_LIMIT_300 = BigDecimal.valueOf(300);
	private static final BigDecimal INDUSTRIAL_PLOTAREA_LIMIT_2000 = BigDecimal.valueOf(2000);
	private static final BigDecimal INDUSTRIAL_PLOTAREA_LIMIT_10000 = BigDecimal.valueOf(10000);
	
	@Override
	public Plan validate(Plan pl) {
		if (pl.getPlot() == null || (pl.getPlot() != null
				&& (pl.getPlot().getArea() == null || pl.getPlot().getArea().doubleValue() == 0))) {
			pl.addError(PLOT_AREA, getLocaleMessage(OBJECTNOTDEFINED, PLOT_AREA));
			
		}
		return pl;
	}

	@Override
	public Plan process(Plan pl) {
		decideNocIsRequired(pl);
		HashMap<String, String> errorMsgs = new HashMap<>();
		int errors = pl.getErrors().size();
		LOG.info("hi inside process");
		validate(pl);
		
		LOG.info("plotarea : " + pl.getPlot().getArea());
		
		int validatedErrors = pl.getErrors().size();
		if (validatedErrors > errors) {
			LOG.info("hi inside error");
			LOG.error("error" + pl.getErrors().get(PLOT_AREA));
			return pl;
		}
		BigDecimal totalExistingBuiltUpArea = BigDecimal.ZERO;
		BigDecimal totalExistingFloorArea = BigDecimal.ZERO;
		BigDecimal totalBuiltUpArea = BigDecimal.ZERO;
		BigDecimal totalFloorArea = BigDecimal.ZERO;
		BigDecimal totalCarpetArea = BigDecimal.ZERO;
		BigDecimal totalExistingCarpetArea = BigDecimal.ZERO;
		Set<OccupancyTypeHelper> distinctOccupancyTypesHelper = new HashSet<>();
		for (Block blk : pl.getBlocks()) {
			BigDecimal flrArea = BigDecimal.ZERO;
			BigDecimal bltUpArea = BigDecimal.ZERO;
			BigDecimal existingFlrArea = BigDecimal.ZERO;
			BigDecimal existingBltUpArea = BigDecimal.ZERO;
			BigDecimal carpetArea = BigDecimal.ZERO;
			BigDecimal existingCarpetArea = BigDecimal.ZERO;
			Building building = blk.getBuilding();
			for (Floor flr : building.getFloors()) {
				for (Occupancy occupancy : flr.getOccupancies()) {
					validate2(pl, blk, flr, occupancy);
					/*
					 * occupancy.setCarpetArea(occupancy.getFloorArea().multiply
					 * (BigDecimal.valueOf(0.80))); occupancy
					 * .setExistingCarpetArea(occupancy.getExistingFloorArea().
					 * multiply(BigDecimal.valueOf(0.80)));
					 */

					bltUpArea = bltUpArea.add(
							occupancy.getBuiltUpArea() == null ? BigDecimal.valueOf(0) : occupancy.getBuiltUpArea());
					existingBltUpArea = existingBltUpArea
							.add(occupancy.getExistingBuiltUpArea() == null ? BigDecimal.valueOf(0)
									: occupancy.getExistingBuiltUpArea());
					flrArea = flrArea.add(occupancy.getFloorArea());
					existingFlrArea = existingFlrArea.add(occupancy.getExistingFloorArea());
					carpetArea = carpetArea.add(occupancy.getCarpetArea());
					existingCarpetArea = existingCarpetArea.add(occupancy.getExistingCarpetArea());
				}
			}
			building.setTotalFloorArea(flrArea);
			building.setTotalBuitUpArea(bltUpArea);
			building.setTotalExistingBuiltUpArea(existingBltUpArea);
			building.setTotalExistingFloorArea(existingFlrArea);

			// check block is completely existing building or not.
			if (existingBltUpArea.compareTo(bltUpArea) == 0)
				blk.setCompletelyExisting(Boolean.TRUE);

			totalFloorArea = totalFloorArea.add(flrArea);
			totalBuiltUpArea = totalBuiltUpArea.add(bltUpArea);
			totalExistingBuiltUpArea = totalExistingBuiltUpArea.add(existingBltUpArea);
			totalExistingFloorArea = totalExistingFloorArea.add(existingFlrArea);
			totalCarpetArea = totalCarpetArea.add(carpetArea);
			totalExistingCarpetArea = totalExistingCarpetArea.add(existingCarpetArea);

			// Find Occupancies by block and add
			Set<OccupancyTypeHelper> occupancyByBlock = new HashSet<>();
			for (Floor flr : building.getFloors()) {
				for (Occupancy occupancy : flr.getOccupancies()) {
					if (occupancy.getTypeHelper() != null)
						occupancyByBlock.add(occupancy.getTypeHelper());
				}
			}

			List<Map<String, Object>> listOfMapOfAllDtls = new ArrayList<>();
			List<OccupancyTypeHelper> listOfOccupancyTypes = new ArrayList<>();

			for (OccupancyTypeHelper occupancyType : occupancyByBlock) {

				Map<String, Object> allDtlsMap = new HashMap<>();
				BigDecimal blockWiseFloorArea = BigDecimal.ZERO;
				BigDecimal blockWiseBuiltupArea = BigDecimal.ZERO;
				BigDecimal blockWiseExistingFloorArea = BigDecimal.ZERO;
				BigDecimal blockWiseExistingBuiltupArea = BigDecimal.ZERO;
				for (Floor flr : blk.getBuilding().getFloors()) {
					for (Occupancy occupancy : flr.getOccupancies()) {
						if (occupancyType.getType() != null && occupancyType.getType().getCode() != null
								&& occupancy.getTypeHelper() != null && occupancy.getTypeHelper().getType() != null
								&& occupancy.getTypeHelper().getType().getCode() != null && occupancy.getTypeHelper()
										.getType().getCode().equals(occupancyType.getType().getCode())) {
							blockWiseFloorArea = blockWiseFloorArea.add(occupancy.getFloorArea());
							blockWiseBuiltupArea = blockWiseBuiltupArea
									.add(occupancy.getBuiltUpArea() == null ? BigDecimal.valueOf(0)
											: occupancy.getBuiltUpArea());
							blockWiseExistingFloorArea = blockWiseExistingFloorArea
									.add(occupancy.getExistingFloorArea());
							blockWiseExistingBuiltupArea = blockWiseExistingBuiltupArea
									.add(occupancy.getExistingBuiltUpArea() == null ? BigDecimal.valueOf(0)
											: occupancy.getExistingBuiltUpArea());

						}
					}
				}
				Occupancy occupancy = new Occupancy();
				occupancy.setBuiltUpArea(blockWiseBuiltupArea);
				occupancy.setFloorArea(blockWiseFloorArea);
				occupancy.setExistingFloorArea(blockWiseExistingFloorArea);
				occupancy.setExistingBuiltUpArea(blockWiseExistingBuiltupArea);
				occupancy.setCarpetArea(blockWiseFloorArea.multiply(BigDecimal.valueOf(.80)));
				occupancy.setTypeHelper(occupancyType);
				building.getTotalArea().add(occupancy);

				allDtlsMap.put("occupancy", occupancyType);
				allDtlsMap.put("totalFloorArea", blockWiseFloorArea);
				allDtlsMap.put("totalBuiltUpArea", blockWiseBuiltupArea);
				allDtlsMap.put("existingFloorArea", blockWiseExistingFloorArea);
				allDtlsMap.put("existingBuiltUpArea", blockWiseExistingBuiltupArea);

				listOfOccupancyTypes.add(occupancyType);

				listOfMapOfAllDtls.add(allDtlsMap);
			}
			Set<OccupancyTypeHelper> setOfOccupancyTypes = new HashSet<>(listOfOccupancyTypes);

			List<Occupancy> listOfOccupanciesOfAParticularblock = new ArrayList<>();
			// for each distinct converted occupancy types
			for (OccupancyTypeHelper occupancyType : setOfOccupancyTypes) {
				if (occupancyType != null) {
					Occupancy occupancy = new Occupancy();
					BigDecimal totalFlrArea = BigDecimal.ZERO;
					BigDecimal totalBltUpArea = BigDecimal.ZERO;
					BigDecimal totalExistingFlrArea = BigDecimal.ZERO;
					BigDecimal totalExistingBltUpArea = BigDecimal.ZERO;

					for (Map<String, Object> dtlsMap : listOfMapOfAllDtls) {
						if (occupancyType.equals(dtlsMap.get("occupancy"))) {
							totalFlrArea = totalFlrArea.add((BigDecimal) dtlsMap.get("totalFloorArea"));
							totalBltUpArea = totalBltUpArea.add((BigDecimal) dtlsMap.get("totalBuiltUpArea"));

							totalExistingBltUpArea = totalExistingBltUpArea
									.add((BigDecimal) dtlsMap.get("existingBuiltUpArea"));
							totalExistingFlrArea = totalExistingFlrArea
									.add((BigDecimal) dtlsMap.get("existingFloorArea"));

						}
					}
					occupancy.setTypeHelper(occupancyType);
					occupancy.setBuiltUpArea(totalBltUpArea);
					occupancy.setFloorArea(totalFlrArea);
					occupancy.setExistingBuiltUpArea(totalExistingBltUpArea);
					occupancy.setExistingFloorArea(totalExistingFlrArea);
					occupancy.setExistingCarpetArea(totalExistingFlrArea.multiply(BigDecimal.valueOf(0.80)));
					occupancy.setCarpetArea(totalFlrArea.multiply(BigDecimal.valueOf(0.80)));

					listOfOccupanciesOfAParticularblock.add(occupancy);
				}
			}
			blk.getBuilding().setOccupancies(listOfOccupanciesOfAParticularblock);

			if (!listOfOccupanciesOfAParticularblock.isEmpty()) {
				// listOfOccupanciesOfAParticularblock already converted. In
				// case of professional building type, converted into A1
				// type
				boolean singleFamilyBuildingTypeOccupancyPresent = false;
				boolean otherThanSingleFamilyOccupancyTypePresent = false;

				for (Occupancy occupancy : listOfOccupanciesOfAParticularblock) {
					if (occupancy.getTypeHelper().getSubtype() != null
							&& A_R.equals(occupancy.getTypeHelper().getSubtype().getCode()))
						singleFamilyBuildingTypeOccupancyPresent = true;
					else {
						otherThanSingleFamilyOccupancyTypePresent = true;
						break;
					}
				}
				blk.setSingleFamilyBuilding(
						!otherThanSingleFamilyOccupancyTypePresent && singleFamilyBuildingTypeOccupancyPresent);
				int allResidentialOccTypes = 0;
				int allResidentialOrCommercialOccTypes = 0;

				for (Occupancy occupancy : listOfOccupanciesOfAParticularblock) {
					if (occupancy.getTypeHelper() != null && occupancy.getTypeHelper().getType() != null) {
						// setting residentialBuilding
						int residentialOccupancyType = 0;
						if (A.equals(occupancy.getTypeHelper().getType().getCode())) {
							residentialOccupancyType = 1;
						}
						if (residentialOccupancyType == 0) {
							allResidentialOccTypes = 0;
							break;
						} else {
							allResidentialOccTypes = 1;
						}
					}
				}
				blk.setResidentialBuilding(allResidentialOccTypes == 1);
				for (Occupancy occupancy : listOfOccupanciesOfAParticularblock) {
					if (occupancy.getTypeHelper() != null && occupancy.getTypeHelper().getType() != null) {
						// setting residentialOrCommercial Occupancy Type
						int residentialOrCommercialOccupancyType = 0;
						if (A.equals(occupancy.getTypeHelper().getType().getCode())
								|| F.equals(occupancy.getTypeHelper().getType().getCode())) {
							residentialOrCommercialOccupancyType = 1;
						}
						if (residentialOrCommercialOccupancyType == 0) {
							allResidentialOrCommercialOccTypes = 0;
							break;
						} else {
							allResidentialOrCommercialOccTypes = 1;
						}
					}
				}
				blk.setResidentialOrCommercialBuilding(allResidentialOrCommercialOccTypes == 1);
			}

			if (blk.getBuilding().getFloors() != null && !blk.getBuilding().getFloors().isEmpty()) {
				BigDecimal noOfFloorsAboveGround = BigDecimal.ZERO;
				for (Floor floor : blk.getBuilding().getFloors()) {
					if (floor.getNumber() != null && floor.getNumber() >= 0) {
						noOfFloorsAboveGround = noOfFloorsAboveGround.add(BigDecimal.valueOf(1));
					}
				}

				boolean hasTerrace = blk.getBuilding().getFloors().stream()
						.anyMatch(floor -> floor.getTerrace().equals(Boolean.TRUE));

				noOfFloorsAboveGround = hasTerrace ? noOfFloorsAboveGround.subtract(BigDecimal.ONE)
						: noOfFloorsAboveGround;

				blk.getBuilding().setMaxFloor(noOfFloorsAboveGround);
				blk.getBuilding().setFloorsAboveGround(noOfFloorsAboveGround);
				blk.getBuilding().setTotalFloors(BigDecimal.valueOf(blk.getBuilding().getFloors().size()));
			}

		}

		for (Block blk : pl.getBlocks()) {
			Building building = blk.getBuilding();
			List<OccupancyTypeHelper> blockWiseOccupancyTypes = new ArrayList<>();
			for (Occupancy occupancy : blk.getBuilding().getOccupancies()) {
				if (occupancy.getTypeHelper() != null)
					blockWiseOccupancyTypes.add(occupancy.getTypeHelper());
			}
			Set<OccupancyTypeHelper> setOfBlockDistinctOccupancyTypes = new HashSet<>(blockWiseOccupancyTypes);
			OccupancyTypeHelper mostRestrictiveFar = getMostRestrictiveFar(setOfBlockDistinctOccupancyTypes);
			blk.getBuilding().setMostRestrictiveFarHelper(mostRestrictiveFar);

			for (Floor flr : building.getFloors()) {
				BigDecimal flrArea = BigDecimal.ZERO;
				BigDecimal existingFlrArea = BigDecimal.ZERO;
				BigDecimal carpetArea = BigDecimal.ZERO;
				BigDecimal existingCarpetArea = BigDecimal.ZERO;
				BigDecimal existingBltUpArea = BigDecimal.ZERO;
				for (Occupancy occupancy : flr.getOccupancies()) {
					flrArea = flrArea.add(occupancy.getFloorArea());
					existingFlrArea = existingFlrArea.add(occupancy.getExistingFloorArea());
					carpetArea = carpetArea.add(occupancy.getCarpetArea());
					existingCarpetArea = existingCarpetArea.add(occupancy.getExistingCarpetArea());
				}

				List<Occupancy> occupancies = flr.getOccupancies();
				for (Occupancy occupancy : occupancies) {
					existingBltUpArea = existingBltUpArea
							.add(occupancy.getExistingBuiltUpArea() != null ? occupancy.getExistingBuiltUpArea()
									: BigDecimal.ZERO);
				}

				if (mostRestrictiveFar != null && mostRestrictiveFar.getConvertedSubtype() != null
						&& !A_R.equals(mostRestrictiveFar.getSubtype().getCode())) {
					if (carpetArea.compareTo(BigDecimal.ZERO) == 0) {
						pl.addError("Carpet area in block " + blk.getNumber() + "floor " + flr.getNumber(),
								"Carpet area is not defined in block " + blk.getNumber() + "floor " + flr.getNumber());
					}

					if (existingBltUpArea.compareTo(BigDecimal.ZERO) > 0
							&& existingCarpetArea.compareTo(BigDecimal.ZERO) == 0) {
						pl.addError("Existing Carpet area in block " + blk.getNumber() + "floor " + flr.getNumber(),
								"Existing Carpet area is not defined in block " + blk.getNumber() + "floor "
										+ flr.getNumber());
					}
				}

				if (flrArea.setScale(DcrConstants.DECIMALDIGITS_MEASUREMENTS, DcrConstants.ROUNDMODE_MEASUREMENTS)
						.compareTo(carpetArea.setScale(DcrConstants.DECIMALDIGITS_MEASUREMENTS,
								DcrConstants.ROUNDMODE_MEASUREMENTS)) < 0) {
					pl.addError("Floor area in block " + blk.getNumber() + "floor " + flr.getNumber(),
							"Floor area is less than carpet area in block " + blk.getNumber() + "floor "
									+ flr.getNumber());
				}

				if (existingBltUpArea.compareTo(BigDecimal.ZERO) > 0 && existingFlrArea
						.setScale(DcrConstants.DECIMALDIGITS_MEASUREMENTS, DcrConstants.ROUNDMODE_MEASUREMENTS)
						.compareTo(existingCarpetArea.setScale(DcrConstants.DECIMALDIGITS_MEASUREMENTS,
								DcrConstants.ROUNDMODE_MEASUREMENTS)) < 0) {
					pl.addError("Existing floor area in block " + blk.getNumber() + "floor " + flr.getNumber(),
							"Existing Floor area is less than carpet area in block " + blk.getNumber() + "floor "
									+ flr.getNumber());
				}
			}
		}

		List<OccupancyTypeHelper> plotWiseOccupancyTypes = new ArrayList<>();
		for (Block block : pl.getBlocks()) {
			for (Occupancy occupancy : block.getBuilding().getOccupancies()) {
				if (occupancy.getTypeHelper() != null)
					plotWiseOccupancyTypes.add(occupancy.getTypeHelper());
			}
		}

		Set<OccupancyTypeHelper> setOfDistinctOccupancyTypes = new HashSet<>(plotWiseOccupancyTypes);

		distinctOccupancyTypesHelper.addAll(setOfDistinctOccupancyTypes);

		List<Occupancy> occupanciesForPlan = new ArrayList<>();

		for (OccupancyTypeHelper occupancyType : setOfDistinctOccupancyTypes) {
			if (occupancyType != null) {
				BigDecimal totalFloorAreaForAllBlks = BigDecimal.ZERO;
				BigDecimal totalBuiltUpAreaForAllBlks = BigDecimal.ZERO;
				BigDecimal totalCarpetAreaForAllBlks = BigDecimal.ZERO;
				BigDecimal totalExistBuiltUpAreaForAllBlks = BigDecimal.ZERO;
				BigDecimal totalExistFloorAreaForAllBlks = BigDecimal.ZERO;
				BigDecimal totalExistCarpetAreaForAllBlks = BigDecimal.ZERO;
				Occupancy occupancy = new Occupancy();
				for (Block block : pl.getBlocks()) {
					for (Occupancy buildingOccupancy : block.getBuilding().getOccupancies()) {
						if (occupancyType.equals(buildingOccupancy.getTypeHelper())) {
							totalFloorAreaForAllBlks = totalFloorAreaForAllBlks.add(buildingOccupancy.getFloorArea());
							totalBuiltUpAreaForAllBlks = totalBuiltUpAreaForAllBlks
									.add(buildingOccupancy.getBuiltUpArea());
							totalCarpetAreaForAllBlks = totalCarpetAreaForAllBlks
									.add(buildingOccupancy.getCarpetArea());
							totalExistBuiltUpAreaForAllBlks = totalExistBuiltUpAreaForAllBlks
									.add(buildingOccupancy.getExistingBuiltUpArea());
							totalExistFloorAreaForAllBlks = totalExistFloorAreaForAllBlks
									.add(buildingOccupancy.getExistingFloorArea());
							totalExistCarpetAreaForAllBlks = totalExistCarpetAreaForAllBlks
									.add(buildingOccupancy.getExistingCarpetArea());
						}
					}
				}
				occupancy.setTypeHelper(occupancyType);
				occupancy.setBuiltUpArea(totalBuiltUpAreaForAllBlks);
				occupancy.setCarpetArea(totalCarpetAreaForAllBlks);
				occupancy.setFloorArea(totalFloorAreaForAllBlks);
				occupancy.setExistingBuiltUpArea(totalExistBuiltUpAreaForAllBlks);
				occupancy.setExistingFloorArea(totalExistFloorAreaForAllBlks);
				occupancy.setExistingCarpetArea(totalExistCarpetAreaForAllBlks);
				occupanciesForPlan.add(occupancy);
			}
		}

		pl.setOccupancies(occupanciesForPlan);
		pl.getVirtualBuilding().setTotalFloorArea(totalFloorArea); //pl.getPlot().getArea()
		pl.getVirtualBuilding().setTotalFloorArea(pl.getPlot().getArea());
		pl.getVirtualBuilding().setTotalCarpetArea(totalCarpetArea);
		pl.getVirtualBuilding().setTotalExistingBuiltUpArea(totalExistingBuiltUpArea);
		pl.getVirtualBuilding().setTotalExistingFloorArea(totalExistingFloorArea);
		pl.getVirtualBuilding().setTotalExistingCarpetArea(totalExistingCarpetArea);
		pl.getVirtualBuilding().setOccupancyTypes(distinctOccupancyTypesHelper);
		pl.getVirtualBuilding().setTotalBuitUpArea(totalBuiltUpArea);
		pl.getVirtualBuilding().setMostRestrictiveFarHelper(getMostRestrictiveFar(setOfDistinctOccupancyTypes));

		if (!distinctOccupancyTypesHelper.isEmpty()) {
			int allResidentialOccTypesForPlan = 0;
			for (OccupancyTypeHelper occupancy : distinctOccupancyTypesHelper) {
				LOG.info("occupancy :" + occupancy.getType().getName());
				// setting residentialBuilding
				int residentialOccupancyType = 0;
				if (occupancy.getType() != null && A.equals(occupancy.getType().getCode())) {
					residentialOccupancyType = 1;
				}
				if (residentialOccupancyType == 0) {
					allResidentialOccTypesForPlan = 0;
					break;
				} else {
					allResidentialOccTypesForPlan = 1;
				}
			}
			pl.getVirtualBuilding().setResidentialBuilding(allResidentialOccTypesForPlan == 1);
			int allResidentialOrCommercialOccTypesForPlan = 0;
			for (OccupancyTypeHelper occupancyType : distinctOccupancyTypesHelper) {
				int residentialOrCommercialOccupancyTypeForPlan = 0;
				if (occupancyType.getType() != null && (A.equals(occupancyType.getType().getCode())
						|| F.equals(occupancyType.getType().getCode()))) {
					residentialOrCommercialOccupancyTypeForPlan = 1;
				}
				if (residentialOrCommercialOccupancyTypeForPlan == 0) {
					allResidentialOrCommercialOccTypesForPlan = 0;
					break;
				} else {
					allResidentialOrCommercialOccTypesForPlan = 1;
				}
			}
			pl.getVirtualBuilding().setResidentialOrCommercialBuilding(allResidentialOrCommercialOccTypesForPlan == 1);
		}

		OccupancyTypeHelper mostRestrictiveOccupancy = pl.getVirtualBuilding() != null
				? pl.getVirtualBuilding().getMostRestrictiveFarHelper()
				: null;

		/*
		 * if (!(pl.getVirtualBuilding().getResidentialOrCommercialBuilding() ||
		 * (mostRestrictiveOccupancy != null && mostRestrictiveOccupancy.getType() !=
		 * null &&
		 * DxfFileConstants.G.equalsIgnoreCase(mostRestrictiveOccupancy.getType().
		 * getCode())))) { pl.getErrors().put(DxfFileConstants.OCCUPANCY_ALLOWED_KEY,
		 * DxfFileConstants.OCCUPANCY_ALLOWED); return pl; }
		 */

		Set<String> occupancyCodes = new HashSet<>();
		for (OccupancyTypeHelper oth : pl.getVirtualBuilding().getOccupancyTypes()) {
			if (oth.getSubtype() != null) {
				occupancyCodes.add(oth.getSubtype().getCode());
			}
		}

		/*
		 * if (occupancyCodes.size() == 1 &&
		 * occupancyCodes.contains(DxfFileConstants.A_PO)) {
		 * pl.getErrors().put(DxfFileConstants.OCCUPANCY_PO_NOT_ALLOWED_KEY,
		 * DxfFileConstants.OCCUPANCY_PO_NOT_ALLOWED); return pl; }
		 */

		OccupancyTypeHelper mostRestrictiveOccupancyType = pl.getVirtualBuilding().getMostRestrictiveFarHelper();
		BigDecimal providedFar = BigDecimal.ZERO;
		BigDecimal surrenderRoadArea = BigDecimal.ZERO;

		if (!pl.getSurrenderRoads().isEmpty()) {
			for (Measurement measurement : pl.getSurrenderRoads()) {
				surrenderRoadArea = surrenderRoadArea.add(measurement.getArea());
			}
		}

		pl.setTotalSurrenderRoadArea(surrenderRoadArea.setScale(DcrConstants.DECIMALDIGITS_MEASUREMENTS,
				DcrConstants.ROUNDMODE_MEASUREMENTS));
		BigDecimal plotArea = pl.getPlot() != null ? pl.getPlot().getArea().add(surrenderRoadArea) : BigDecimal.ZERO;
		
		updateFarAsPerBalconyWidth(pl);
		
		if (plotArea.doubleValue() > 0)
			providedFar = pl.getVirtualBuilding().getTotalBuitUpArea()
							.divide(plotArea, DECIMALDIGITS_MEASUREMENTS,ROUNDMODE_MEASUREMENTS);		
		
		
		
		pl.setFarDetails(new FarDetails());
		pl.getFarDetails().setProvidedFar(providedFar.doubleValue());
		
		
		
		String typeOfArea = pl.getPlanInformation().getTypeOfArea();
		BigDecimal roadWidth = pl.getPlanInformation().getRoadWidth();

		if (mostRestrictiveOccupancyType != null && StringUtils.isNotBlank(typeOfArea) && roadWidth != null
				&& !processFarForSpecialOccupancy(pl, mostRestrictiveOccupancyType, providedFar, typeOfArea, roadWidth,
						errorMsgs)) {
			if ((mostRestrictiveOccupancyType.getType() != null
					&& DxfFileConstants.A.equalsIgnoreCase(mostRestrictiveOccupancyType.getType().getCode()))
					|| (mostRestrictiveOccupancyType.getSubtype() != null
							&& (A_R.equalsIgnoreCase(mostRestrictiveOccupancyType.getSubtype().getCode())
									|| A_AF.equalsIgnoreCase(mostRestrictiveOccupancyType.getSubtype().getCode())))) {
				// extra parameter added plotArea by Bimal Kumar on 12 March 2024

				processFarResidential(pl, mostRestrictiveOccupancyType, providedFar, typeOfArea, roadWidth, errorMsgs,
						plotArea);
			}
			if (mostRestrictiveOccupancyType.getType() != null
					&& (DxfFileConstants.G.equalsIgnoreCase(mostRestrictiveOccupancyType.getType().getCode())
							|| DxfFileConstants.B.equalsIgnoreCase(mostRestrictiveOccupancyType.getType().getCode())
							|| DxfFileConstants.D.equalsIgnoreCase(mostRestrictiveOccupancyType.getType().getCode()))) {
				processFarForGBDOccupancy(pl, mostRestrictiveOccupancyType, providedFar, typeOfArea, roadWidth,
						errorMsgs, plotArea);
			}
			if (mostRestrictiveOccupancyType.getType() != null
					&& DxfFileConstants.I.equalsIgnoreCase(mostRestrictiveOccupancyType.getType().getCode())) {
				processFarHaazardous(pl, mostRestrictiveOccupancyType, providedFar, typeOfArea, roadWidth, errorMsgs);
			}
			if (mostRestrictiveOccupancyType.getType() != null
					&& DxfFileConstants.F.equalsIgnoreCase(mostRestrictiveOccupancyType.getType().getCode())) {
				processFarNonResidential(pl, mostRestrictiveOccupancyType, providedFar, typeOfArea, roadWidth,
						errorMsgs,plotArea);
			}
		}
		
		//getFarDetailsFromMDMS(pl,mostRestrictiveOccupancyType.getType().getCode());
		
		ProcessPrintHelper.print(pl);
		//getFarDetailsFromMDMS(pl, );
		return pl;
	}

	private void decideNocIsRequired(Plan pl) {
		Boolean isHighRise = false;
		for (Block b : pl.getBlocks()) {
			if ((b.getBuilding() != null && b.getBuilding().getBuildingHeight() != null
					&& b.getBuilding().getBuildingHeight().compareTo(new BigDecimal(5)) > 0)
					|| (b.getBuilding() != null && b.getBuilding().getCoverageArea() != null
							&& b.getBuilding().getCoverageArea().compareTo(new BigDecimal(500)) > 0)) {
				isHighRise = true;

			}
		}
		if (isHighRise) {
			pl.getPlanInformation().setNocFireDept("YES");
		}

		if (StringUtils.isNotBlank(pl.getPlanInformation().getBuildingNearMonument())
				&& "YES".equalsIgnoreCase(pl.getPlanInformation().getBuildingNearMonument())) {
			BigDecimal minDistanceFromMonument = BigDecimal.ZERO;
			List<BigDecimal> distancesFromMonument = pl.getDistanceToExternalEntity().getMonuments();
			if (!distancesFromMonument.isEmpty()) {

				minDistanceFromMonument = distancesFromMonument.stream().reduce(BigDecimal::min).get();

				if (minDistanceFromMonument.compareTo(BigDecimal.valueOf(300)) > 0) {
					pl.getPlanInformation().setNocNearMonument("YES");
				}
			}

		}

	}

	private void validate2(Plan pl, Block blk, Floor flr, Occupancy occupancy) {
		String occupancyTypeHelper = StringUtils.EMPTY;
		if (occupancy.getTypeHelper() != null) {
			if (occupancy.getTypeHelper().getType() != null) {
				occupancyTypeHelper = occupancy.getTypeHelper().getType().getName();
			} else if (occupancy.getTypeHelper().getSubtype() != null) {
				occupancyTypeHelper = occupancy.getTypeHelper().getSubtype().getName();
			}
		}

		if (occupancy.getBuiltUpArea() != null && occupancy.getBuiltUpArea().compareTo(BigDecimal.valueOf(0)) < 0) {
			pl.addError(VALIDATION_NEGATIVE_BUILTUP_AREA, getLocaleMessage(VALIDATION_NEGATIVE_BUILTUP_AREA,
					blk.getNumber(), flr.getNumber().toString(), occupancyTypeHelper));
		}
		if (occupancy.getExistingBuiltUpArea() != null
				&& occupancy.getExistingBuiltUpArea().compareTo(BigDecimal.valueOf(0)) < 0) {
			pl.addError(VALIDATION_NEGATIVE_EXISTING_BUILTUP_AREA,
					getLocaleMessage(VALIDATION_NEGATIVE_EXISTING_BUILTUP_AREA, blk.getNumber(),
							flr.getNumber().toString(), occupancyTypeHelper));
		}
		occupancy.setFloorArea((occupancy.getBuiltUpArea() == null ? BigDecimal.ZERO : occupancy.getBuiltUpArea())
				.subtract(occupancy.getDeduction() == null ? BigDecimal.ZERO : occupancy.getDeduction()));
		if (occupancy.getFloorArea() != null && occupancy.getFloorArea().compareTo(BigDecimal.valueOf(0)) < 0) {
			pl.addError(VALIDATION_NEGATIVE_FLOOR_AREA, getLocaleMessage(VALIDATION_NEGATIVE_FLOOR_AREA,
					blk.getNumber(), flr.getNumber().toString(), occupancyTypeHelper));
		}
		occupancy.setExistingFloorArea(
				(occupancy.getExistingBuiltUpArea() == null ? BigDecimal.ZERO : occupancy.getExistingBuiltUpArea())
						.subtract(occupancy.getExistingDeduction() == null ? BigDecimal.ZERO
								: occupancy.getExistingDeduction()));
		if (occupancy.getExistingFloorArea() != null
				&& occupancy.getExistingFloorArea().compareTo(BigDecimal.valueOf(0)) < 0) {
			pl.addError(VALIDATION_NEGATIVE_EXISTING_FLOOR_AREA,
					getLocaleMessage(VALIDATION_NEGATIVE_EXISTING_FLOOR_AREA, blk.getNumber(),
							flr.getNumber().toString(), occupancyTypeHelper));
		}
	}

	protected OccupancyTypeHelper getMostRestrictiveFar(Set<OccupancyTypeHelper> distinctOccupancyTypes) {
		Set<String> codes = new HashSet<>();
		Map<String, OccupancyTypeHelper> codesMap = new HashMap<>();
		for (OccupancyTypeHelper typeHelper : distinctOccupancyTypes) {

			if (typeHelper.getType() != null)
				codesMap.put(typeHelper.getType().getCode(), typeHelper);
			if (typeHelper.getSubtype() != null)
				codesMap.put(typeHelper.getSubtype().getCode(), typeHelper);
		}
		codes = codesMap.keySet();
		if (codes.contains(S_ECFG))
			return codesMap.get(S_ECFG);
		else if (codes.contains(A_FH))
			return codesMap.get(A_FH);
		else if (codes.contains(S_SAS))
			return codesMap.get(S_SAS);
		else if (codes.contains(D_B))
			return codesMap.get(D_B);
		else if (codes.contains(D_C))
			return codesMap.get(D_C);
		else if (codes.contains(D_A))
			return codesMap.get(D_A);
		else if (codes.contains(H_PP))
			return codesMap.get(H_PP);
		else if (codes.contains(E_NS))
			return codesMap.get(E_NS);
		else if (codes.contains(M_DFPAB))
			return codesMap.get(M_DFPAB);
		else if (codes.contains(E_PS))
			return codesMap.get(E_PS);
		else if (codes.contains(E_SFMC))
			return codesMap.get(E_SFMC);
		else if (codes.contains(E_SFDAP))
			return codesMap.get(E_SFDAP);
		else if (codes.contains(E_EARC))
			return codesMap.get(E_EARC);
		else if (codes.contains(S_MCH))
			return codesMap.get(S_MCH);
		else if (codes.contains(S_BH))
			return codesMap.get(S_BH);
		else if (codes.contains(S_CRC))
			return codesMap.get(S_CRC);
		else if (codes.contains(S_CA))
			return codesMap.get(S_CA);
		else if (codes.contains(S_SC))
			return codesMap.get(S_SC);
		else if (codes.contains(S_ICC))
			return codesMap.get(S_ICC);
		else if (codes.contains(A2))
			return codesMap.get(A2);
		else if (codes.contains(E_CLG))
			return codesMap.get(E_CLG);
		else if (codes.contains(M_OHF))
			return codesMap.get(M_OHF);
		else if (codes.contains(M_VH))
			return codesMap.get(M_VH);
		else if (codes.contains(M_NAPI))
			return codesMap.get(M_NAPI);
		else if (codes.contains(A_SA))
			return codesMap.get(A_SA);
		else if (codes.contains(M_HOTHC))
			return codesMap.get(M_HOTHC);
		else if (codes.contains(E_SACA))
			return codesMap.get(E_SACA);
		else if (codes.contains(G))
			return codesMap.get(G);
		else if (codes.contains(F))
			return codesMap.get(F);
		else if (codes.contains(A))
			return codesMap.get(A);
		else
			return null;

	}

	private Boolean processFarForSpecialOccupancy(Plan pl, OccupancyTypeHelper occupancyType, BigDecimal far,
			String typeOfArea, BigDecimal roadWidth, HashMap<String, String> errors) {

		OccupancyTypeHelper mostRestrictiveOccupancyType = pl.getVirtualBuilding() != null
				? pl.getVirtualBuilding().getMostRestrictiveFarHelper()
				: null;
		String expectedResult = StringUtils.EMPTY;
		boolean isAccepted = false;
		if (mostRestrictiveOccupancyType != null && mostRestrictiveOccupancyType.getSubtype() != null) {
			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(S_ECFG)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(A_FH)) {
				isAccepted = far.compareTo(POINTTWO) <= 0;
				expectedResult = "<= 0.2";
				return true;
			}

			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(S_SAS)) {
				isAccepted = far.compareTo(POINTFOUR) <= 0;
				expectedResult = "<= 0.4";
				return true;
			}

			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(D_B)) {
				isAccepted = far.compareTo(POINTFIVE) <= 0;
				expectedResult = "<= 0.5";
				return true;
			}

			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(D_C)) {
				isAccepted = far.compareTo(POINTSIX) <= 0;
				expectedResult = "<= 0.6";
				return true;
			}

			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(D_A)) {
				isAccepted = far.compareTo(POINTSEVEN) <= 0;
				expectedResult = "<= 0.7";
				return true;
			}

			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(H_PP)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(E_NS)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(M_DFPAB)) {
				isAccepted = far.compareTo(ONE) <= 0;
				expectedResult = "<= 1";
				return true;
			}

			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(E_PS)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(E_SFMC)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(E_SFDAP)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(E_EARC)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(S_MCH)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(S_BH)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(S_CRC)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(S_CA)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(S_SC)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(S_ICC)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(A2)) {
				isAccepted = far.compareTo(ONE_POINTTWO) <= 0;
				expectedResult = "<= 1.2";
				return true;
			}

			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(B2)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(E_CLG)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(M_OHF)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(M_VH)
					|| mostRestrictiveOccupancyType.getSubtype().getCode().equals(M_NAPI)) {
				isAccepted = far.compareTo(ONE_POINTFIVE) <= 0;
				expectedResult = "<= 1.5";
				return true;
			}

			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(A_SA)) {
				isAccepted = far.compareTo(TWO_POINTFIVE) <= 0;
				expectedResult = "<= 2.5";
				return true;
			}

			if (mostRestrictiveOccupancyType.getSubtype().getCode().equals(E_SACA)) {
				isAccepted = far.compareTo(FIFTEEN) <= 0;
				expectedResult = "<= 15";
				return true;
			}

		}

		String occupancyName = occupancyType.getSubtype() != null ? occupancyType.getSubtype().getName()
				: occupancyType.getType().getName();

		if (StringUtils.isNotBlank(expectedResult)) {
			buildResult(pl, occupancyName, far, typeOfArea, roadWidth, expectedResult, isAccepted);
		}

		return false;
	}

	// Method updated by Bimal Kumar on 14 March 2024
	private void processFarResidential(Plan pl, OccupancyTypeHelper occupancyType, BigDecimal far, String typeOfArea,
			BigDecimal roadWidth, HashMap<String, String> errors, BigDecimal plotArea) {

		String expectedResult = StringUtils.EMPTY;
		boolean isAccepted = false;
		
		LOG.info("Processing FAR (Residential) for punjab as per new Bylaws");
		LOG.info("Processing FAR (Residential) for punjab as per new Bylaws");
		LOG.info("Type of area: " + typeOfArea);
		LOG.info("Type of area: " + typeOfArea);
		
		// Start Rule updated by Bimal on 14 March 2024
		
//			if (plotArea.compareTo(BigDecimal.ZERO) < 0) {				
//				if (!shouldSkipValidation(pl.getEdcrRequest(),DcrConstants.EDCR_SKIP_PLOT_AREA)) {
//					errors.put("Plot Area Error:", "Plot area cannot be less than 0.");
//					pl.addErrors(errors);
//                }
//				
//			} else if (plotArea.compareTo(PLOT_AREA_UP_TO_100_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_2_00) <= 0;
//				LOG.info("FAR_UP_TO_2_00: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_2_00.doubleValue());
//				expectedResult = "<= 2.00";
//			} else if (plotArea.compareTo(PLOT_AREA_100_150_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_90) <= 0;
//				LOG.info("FAR_UP_TO_1_90: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_90.doubleValue());
//				expectedResult = "<= 1.90";
//			} else if (plotArea.compareTo(PLOT_AREA_150_200_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_75) <= 0;
//				LOG.info("FAR_UP_TO_1_75: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_75.doubleValue());
//				expectedResult = "<= 1.75";
//			} else if (plotArea.compareTo(PLOT_AREA_200_300_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_65) <= 0;
//				LOG.info("FAR_UP_TO_1_65: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_65.doubleValue());
//				expectedResult = "<= 1.65";
//			} else if (plotArea.compareTo(PLOT_AREA_300_500_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_50) <= 0;
//				LOG.info("FAR_UP_TO_1_50: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_50.doubleValue());
//				expectedResult = "<= 1.50";
//			} else if (plotArea.compareTo(PLOT_AREA_500_1000_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_50) <= 0;
//				LOG.info("FAR_UP_TO_1_50 2nd: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_50.doubleValue());
//				expectedResult = "<= 1.50";
//			} else {
//				isAccepted = far.compareTo(FAR_UP_TO_1_25) <= 0;
//				LOG.info("FAR_UP_TO_1_25: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_25.doubleValue());
//				expectedResult = "<= 1.25";
//			}
		

//		if (typeOfArea.equalsIgnoreCase(NEW)) {
//
//			if (plotArea.compareTo(BigDecimal.ZERO) < 0) {
//				errors.put("Plot Area Error:", "Plot area cannot be less than 0.");
//				pl.addErrors(errors);
//			} else if (plotArea.compareTo(PLOT_AREA_UP_TO_100_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_2_00) <= 0;
//				LOG.info("FAR_UP_TO_2_00: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_2_00.doubleValue());
//				expectedResult = "<= 2.00";
//			} else if (plotArea.compareTo(PLOT_AREA_100_150_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_90) <= 0;
//				LOG.info("FAR_UP_TO_1_90: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_90.doubleValue());
//				expectedResult = "<= 1.90";
//			} else if (plotArea.compareTo(PLOT_AREA_150_200_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_75) <= 0;
//				LOG.info("FAR_UP_TO_1_75: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_75.doubleValue());
//				expectedResult = "<= 1.75";
//			} else if (plotArea.compareTo(PLOT_AREA_200_300_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_65) <= 0;
//				LOG.info("FAR_UP_TO_1_65: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_65.doubleValue());
//				expectedResult = "<= 1.65";
//			} else if (plotArea.compareTo(PLOT_AREA_300_500_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_50) <= 0;
//				LOG.info("FAR_UP_TO_1_50: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_50.doubleValue());
//				expectedResult = "<= 1.50";
//			} else if (plotArea.compareTo(PLOT_AREA_500_1000_SQM) <= 0) {
//				isAccepted = far.compareTo(FAR_UP_TO_1_50) <= 0;
//				LOG.info("FAR_UP_TO_1_50 2nd: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_50.doubleValue());
//				expectedResult = "<= 1.50";
//			} else {
//				isAccepted = far.compareTo(FAR_UP_TO_1_25) <= 0;
//				LOG.info("FAR_UP_TO_1_25: " + isAccepted);
//				pl.getFarDetails().setPermissableFar(FAR_UP_TO_1_25.doubleValue());
//				expectedResult = "<= 1.25";
//			}
//		}
		// End Rule updated by Bimal on 14 March 2024

		// Old rules commented by Bimal on 14 March 2024
		/*
		 * if (typeOfArea.equalsIgnoreCase(OLD)) { if
		 * (roadWidth.compareTo(ROAD_WIDTH_TWO_POINTFOUR) < 0) {
		 * errors.put(OLD_AREA_ERROR, OLD_AREA_ERROR_MSG); pl.addErrors(errors); } else
		 * if (roadWidth.compareTo(ROAD_WIDTH_TWO_POINTFOURFOUR) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_THREE_POINTSIX) < 0) { isAccepted =
		 * far.compareTo(ONE_POINTTWO) <= 0;
		 * pl.getFarDetails().setPermissableFar(ONE_POINTTWO.doubleValue());
		 * expectedResult = "<= 1.2"; } else if
		 * (roadWidth.compareTo(ROAD_WIDTH_THREE_POINTSIX) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_FOUR_POINTEIGHT) < 0) { isAccepted =
		 * far.compareTo(ONE_POINTFIVE) <= 0;
		 * pl.getFarDetails().setPermissableFar(ONE_POINTFIVE.doubleValue());
		 * expectedResult = "<= 1.5"; } else if
		 * (roadWidth.compareTo(ROAD_WIDTH_FOUR_POINTEIGHT) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) < 0) { isAccepted =
		 * far.compareTo(ONE_POINTEIGHT) <= 0;
		 * pl.getFarDetails().setPermissableFar(ONE_POINTEIGHT.doubleValue());
		 * expectedResult = "<= 1.8"; } else if
		 * (roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_NINE_POINTONE) < 0) { isAccepted =
		 * far.compareTo(TWO) <= 0;
		 * pl.getFarDetails().setPermissableFar(TWO.doubleValue()); expectedResult =
		 * "<= 2"; } else if (roadWidth.compareTo(ROAD_WIDTH_NINE_POINTONE) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_TWELVE_POINTTWO) < 0) { isAccepted =
		 * far.compareTo(TWO_POINTFIVE) <= 0;
		 * pl.getFarDetails().setPermissableFar(TWO_POINTFIVE.doubleValue());
		 * expectedResult = "<= 2.5"; } else if
		 * (roadWidth.compareTo(ROAD_WIDTH_TWELVE_POINTTWO) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_EIGHTEEN_POINTTHREE) < 0) { isAccepted =
		 * far.compareTo(TWO_POINTFIVE) <= 0;
		 * pl.getFarDetails().setPermissableFar(TWO_POINTFIVE.doubleValue());
		 * expectedResult = "<= 2.5"; } else if
		 * (roadWidth.compareTo(ROAD_WIDTH_EIGHTEEN_POINTTHREE) >= 0) { isAccepted =
		 * far.compareTo(TWO_POINTFIVE) <= 0;
		 * pl.getFarDetails().setPermissableFar(TWO_POINTFIVE.doubleValue());
		 * expectedResult = "<= 2.5"; }
		 * 
		 * }
		 * 
		 * if (typeOfArea.equalsIgnoreCase(NEW)) { if
		 * (roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) < 0) {
		 * errors.put(NEW_AREA_ERROR, NEW_AREA_ERROR_MSG); pl.addErrors(errors); } else
		 * if (roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_NINE_POINTONE) < 0) { isAccepted =
		 * far.compareTo(TWO) <= 0;
		 * pl.getFarDetails().setPermissableFar(TWO.doubleValue()); expectedResult =
		 * "<= 2"; } else if (roadWidth.compareTo(ROAD_WIDTH_NINE_POINTONE) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_TWELVE_POINTTWO) < 0) { isAccepted =
		 * far.compareTo(TWO_POINTFIVE) <= 0;
		 * pl.getFarDetails().setPermissableFar(TWO_POINTFIVE.doubleValue());
		 * expectedResult = "<= 2.5"; } else if
		 * (roadWidth.compareTo(ROAD_WIDTH_TWELVE_POINTTWO) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_EIGHTEEN_POINTTHREE) < 0) { isAccepted =
		 * far.compareTo(TWO_POINTFIVE) <= 0;
		 * pl.getFarDetails().setPermissableFar(TWO_POINTFIVE.doubleValue());
		 * expectedResult = "<= 2.5"; } else if
		 * (roadWidth.compareTo(ROAD_WIDTH_EIGHTEEN_POINTTHREE) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_TWENTYFOUR_POINTFOUR) < 0) { isAccepted =
		 * far.compareTo(TWO_POINTFIVE) <= 0;
		 * pl.getFarDetails().setPermissableFar(TWO_POINTFIVE.doubleValue());
		 * expectedResult = "<= 2.5"; } else if
		 * (roadWidth.compareTo(ROAD_WIDTH_TWENTYFOUR_POINTFOUR) >= 0 &&
		 * roadWidth.compareTo(ROAD_WIDTH_TWENTYSEVEN_POINTFOUR) < 0) { isAccepted =
		 * far.compareTo(THREE) <= 0;
		 * pl.getFarDetails().setPermissableFar(THREE.doubleValue()); expectedResult =
		 * "<= 3"; } else if (roadWidth.compareTo(ROAD_WIDTH_TWENTYSEVEN_POINTFOUR) >= 0
		 * && roadWidth.compareTo(ROAD_WIDTH_THIRTY_POINTFIVE) < 0) { isAccepted =
		 * far.compareTo(THREE_POINTTWOFIVE) <= 0;
		 * pl.getFarDetails().setPermissableFar(THREE_POINTTWOFIVE.doubleValue());
		 * expectedResult = "<= 3.25"; } else if
		 * (roadWidth.compareTo(ROAD_WIDTH_THIRTY_POINTFIVE) >= 0) { isAccepted =
		 * far.compareTo(THREE_POINTFIVE) <= 0;
		 * pl.getFarDetails().setPermissableFar(THREE_POINTFIVE.doubleValue());
		 * expectedResult = "<= 3.5"; }
		 * 
		 * }
		 */

		getFarDetailsFromMDMS(pl, occupancyType.getType().getCode(), typeOfArea, occupancyType);
			
		String occupancyName = occupancyType.getType().getName();
		if (errors.isEmpty() && StringUtils.isNotBlank(expectedResult)) {
			//buildResult(pl, occupancyType, far, typeOfArea, roadWidth, expectedResult, isAccepted);
		}
	}

	private void processFarNonResidential(Plan pl, OccupancyTypeHelper occupancyType, BigDecimal far, String typeOfArea,
			BigDecimal roadWidth, HashMap<String, String> errors, BigDecimal plotArea) {

		String expectedResult = StringUtils.EMPTY;
		boolean isAccepted = false;
		
		if (plotArea == null || plotArea.compareTo(BigDecimal.ZERO) <= 0) {				
		    if (!shouldSkipValidation(pl.getEdcrRequest(), DcrConstants.EDCR_SKIP_PLOT_AREA)) {
		        errors.put("Plot Area Error:", "Plot area must be greater than 0.");
		        pl.addErrors(errors);
		    }
		} else if (plotArea.compareTo(COMMERCIAL_PLOTAREA_LIMIT_41_82) <= 0) {
		    // 0–41.82 sqm → FAR = 1.50
		    isAccepted = far.compareTo(COMMERCIAL_FAR_1_50) <= 0;
		    LOG.info("COMMERCIAL_FAR_1_50: " + isAccepted);
		    pl.getFarDetails().setPermissableFar(COMMERCIAL_FAR_1_50.doubleValue());
		    expectedResult = "<= " + COMMERCIAL_FAR_1_50;

		} else if (plotArea.compareTo(COMMERCIAL_PLOTAREA_LIMIT_104_5) <= 0) {
		    // 41.82–104.5 sqm → FAR = 2.50
		    isAccepted = far.compareTo(COMMERCIAL_FAR_2_50) <= 0;
		    LOG.info("COMMERCIAL_FAR_2_50: " + isAccepted);
		    pl.getFarDetails().setPermissableFar(COMMERCIAL_FAR_2_50.doubleValue());
		    expectedResult = "<= " + COMMERCIAL_FAR_2_50;

		} else if (plotArea.compareTo(COMMERCIAL_PLOTAREA_LIMIT_209) <= 0) {
		    // 104.5–209 sqm → FAR = 1.75
		    isAccepted = far.compareTo(COMMERCIAL_FAR_1_75) <= 0;
		    LOG.info("COMMERCIAL_FAR_1_75: " + isAccepted);
		    pl.getFarDetails().setPermissableFar(COMMERCIAL_FAR_1_75.doubleValue());
		    expectedResult = "<= " + COMMERCIAL_FAR_1_75;

		} else if (plotArea.compareTo(COMMERCIAL_PLOTAREA_LIMIT_418_21) <= 0) {
		    // 209–418.21 sqm → FAR = 2.00
		    isAccepted = far.compareTo(COMMERCIAL_FAR_2_00) <= 0;
		    LOG.info("COMMERCIAL_FAR_2_00: " + isAccepted);
		    pl.getFarDetails().setPermissableFar(COMMERCIAL_FAR_2_00.doubleValue());
		    expectedResult = "<= " + COMMERCIAL_FAR_2_00;

		} else {
		    // >418.21 sqm → FAR = 3.00
		    isAccepted = far.compareTo(COMMERCIAL_FAR_3_00) <= 0;
		    LOG.info("COMMERCIAL_FAR_3_00: " + isAccepted);
		    pl.getFarDetails().setPermissableFar(COMMERCIAL_FAR_3_00.doubleValue());
		    expectedResult = "<= " + COMMERCIAL_FAR_3_00;
		}

//		if (typeOfArea.equalsIgnoreCase(OLD)) {
//			if (roadWidth.compareTo(ROAD_WIDTH_TWO_POINTFOUR) < 0) {
//				errors.put(OLD_AREA_ERROR, OLD_AREA_ERROR_MSG);
//				pl.addErrors(errors);
//			} else if (roadWidth.compareTo(ROAD_WIDTH_TWO_POINTFOURFOUR) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_THREE_POINTSIX) < 0) {
//				isAccepted = far.compareTo(ONE_POINTTWO) <= 0;
//				pl.getFarDetails().setPermissableFar(TWO.doubleValue());
//				expectedResult = "<= 1.2";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_THREE_POINTSIX) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_FOUR_POINTEIGHT) < 0) {
//				isAccepted = far.compareTo(BigDecimal.ZERO) >= 0;
//				pl.getFarDetails().setPermissableFar(BigDecimal.ZERO.doubleValue());
//				expectedResult = "0";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_FOUR_POINTEIGHT) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) < 0) {
//				isAccepted = far.compareTo(BigDecimal.ZERO) >= 0;
//				pl.getFarDetails().setPermissableFar(BigDecimal.ZERO.doubleValue());
//				expectedResult = "0";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_NINE_POINTONE) < 0) {
//				isAccepted = far.compareTo(BigDecimal.ZERO) >= 0;
//				pl.getFarDetails().setPermissableFar(BigDecimal.ZERO.doubleValue());
//				expectedResult = "0";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_NINE_POINTONE) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_TWELVE_POINTTWO) < 0) {
//				isAccepted = far.compareTo(BigDecimal.ZERO) >= 0;
//				pl.getFarDetails().setPermissableFar(BigDecimal.ZERO.doubleValue());
//				expectedResult = "0";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_TWELVE_POINTTWO) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_EIGHTEEN_POINTTHREE) < 0) {
//				isAccepted = far.compareTo(TWO) <= 0;
//				pl.getFarDetails().setPermissableFar(TWO.doubleValue());
//				expectedResult = "<= 2";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_TWENTYFOUR_POINTFOUR) >= 0) {
//				isAccepted = far.compareTo(TWO_POINTFIVE) <= 0;
//				pl.getFarDetails().setPermissableFar(TWO_POINTFIVE.doubleValue());
//				expectedResult = "<= 2.5";
//			}
//
//		}

//		if (typeOfArea.equalsIgnoreCase(NEW)) {
//			if (roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) < 0) {
//				errors.put(NEW_AREA_ERROR, NEW_AREA_ERROR_MSG);
//				pl.addErrors(errors);
//			} else if (roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_NINE_POINTONE) < 0) {
//				isAccepted = far.compareTo(BigDecimal.ZERO) >= 0;
//				pl.getFarDetails().setPermissableFar(BigDecimal.ZERO.doubleValue());
//				expectedResult = "0";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_NINE_POINTONE) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_TWELVE_POINTTWO) < 0) {
//				isAccepted = far.compareTo(BigDecimal.ZERO) >= 0;
//				pl.getFarDetails().setPermissableFar(BigDecimal.ZERO.doubleValue());
//				expectedResult = "0";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_TWELVE_POINTTWO) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_EIGHTEEN_POINTTHREE) < 0) {
//				isAccepted = far.compareTo(TWO) <= 0;
//				pl.getFarDetails().setPermissableFar(TWO.doubleValue());
//				expectedResult = "<= 2";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_EIGHTEEN_POINTTHREE) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_TWENTYFOUR_POINTFOUR) < 0) {
//				isAccepted = far.compareTo(TWO_POINTFIVE) <= 0;
//				pl.getFarDetails().setPermissableFar(TWO_POINTFIVE.doubleValue());
//				expectedResult = "<= 2.5";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_TWENTYFOUR_POINTFOUR) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_TWENTYSEVEN_POINTFOUR) < 0) {
//				isAccepted = far.compareTo(TWO_POINTFIVE) <= 0;
//				pl.getFarDetails().setPermissableFar(TWO_POINTFIVE.doubleValue());
//				expectedResult = "<= 2.5";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_TWENTYSEVEN_POINTFOUR) >= 0
//					&& roadWidth.compareTo(ROAD_WIDTH_THIRTY_POINTFIVE) < 0) {
//				isAccepted = far.compareTo(THREE) <= 0;
//				pl.getFarDetails().setPermissableFar(THREE.doubleValue());
//				expectedResult = "<= 3";
//			} else if (roadWidth.compareTo(ROAD_WIDTH_THIRTY_POINTFIVE) >= 0) {
//				isAccepted = far.compareTo(THREE_POINTFIVE) <= 0;
//				pl.getFarDetails().setPermissableFar(THREE_POINTFIVE.doubleValue());
//				expectedResult = "<= 3";
//			}
//
//		}

		String occupancyName = occupancyType.getType().getName();

		if (errors.isEmpty() && StringUtils.isNotBlank(expectedResult)) {
			buildResult(pl, occupancyName, far, typeOfArea, roadWidth, expectedResult, isAccepted);
		}
	}

	private void processFarForGBDOccupancy(Plan pl, OccupancyTypeHelper occupancyType, BigDecimal far,
			String typeOfArea, BigDecimal roadWidth, HashMap<String, String> errors, BigDecimal plotArea) {

		String expectedResult = StringUtils.EMPTY;
		boolean isAccepted = false;
		String occupancyName = occupancyType.getType().getName();

//		if (typeOfArea.equalsIgnoreCase(OLD)) {
//			if (roadWidth.compareTo(ROAD_WIDTH_TWO_POINTFOUR) < 0) {
//				errors.put(OLD_AREA_ERROR, OLD_AREA_ERROR_MSG);
//				pl.addErrors(errors);
//				return;
//			} else {
//				isAccepted = far.compareTo(ONE_POINTFIVE) <= 0;
//				pl.getFarDetails().setPermissableFar(ONE_POINTFIVE.doubleValue());
//				expectedResult = "<=" + ONE_POINTFIVE;
//			}
//
//		}

//		if (typeOfArea.equalsIgnoreCase(NEW)) {
//			if (roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) < 0) {
//				errors.put(NEW_AREA_ERROR, NEW_AREA_ERROR_MSG);
//				pl.addErrors(errors);
//				//return;
//			} else {
//				isAccepted = far.compareTo(ONE_POINTFIVE) <= 0;
//				pl.getFarDetails().setPermissableFar(ONE_POINTFIVE.doubleValue());
//				expectedResult = "<=" + ONE_POINTFIVE;
//			}
//
//		}

//		String occupancyName1 = occupancyType.getType().getName();
//
//		if (occupancyType.getSubtype() != null) {
//			OccupancyHelperDetail subtype = occupancyType.getSubtype();
//			occupancyName = subtype.getName();
//			String code = subtype.getCode();
//
//			if (G_PHI.equalsIgnoreCase(code)) {
//				isAccepted = far.compareTo(POINTFIVE) <= 0;
//				pl.getFarDetails().setPermissableFar(POINTFIVE.doubleValue());
//				expectedResult = "<=" + POINTFIVE;
//			} else if (G_NPHI.equalsIgnoreCase(code)) {
//				isAccepted = far.compareTo(ONE_POINTFIVE) <= 0;
//				pl.getFarDetails().setPermissableFar(ONE_POINTFIVE.doubleValue());
//				expectedResult = "<=" + ONE_POINTFIVE;
//			}
//		}

		if (plotArea == null || plotArea.compareTo(BigDecimal.ZERO) <= 0) {				
		    if (!shouldSkipValidation(pl.getEdcrRequest(), DcrConstants.EDCR_SKIP_PLOT_AREA)) {
		        errors.put("Plot Area Error:", "Plot area must be greater than 0.");
		        pl.addErrors(errors);
		    }
		} else if (occupancyType != null 
		        && occupancyType.getType() != null 
		        && occupancyType.getType().getCode() != null) {
			OccupancyHelperDetail subtype = occupancyType.getSubtype();
			occupancyName = subtype.getName();
			String subType = subtype.getCode();
		    
		    //String subType = occupancyType.getSubtype().get().getCode();

		    switch (subType) {
		        // *********** INDUSTRIAL PLOTTED ***********
		        case "G-I": // Industrial
		            if (plotArea.compareTo(INDUSTRIAL_PLOTAREA_LIMIT_300) <= 0) {
		                isAccepted = far.compareTo(INDUSTRIAL_FAR_1_50) <= 0;
		                pl.getFarDetails().setPermissableFar(INDUSTRIAL_FAR_1_50.doubleValue());
		                expectedResult = "<= " + INDUSTRIAL_FAR_1_50;
		            } else {
		                isAccepted = far.compareTo(INDUSTRIAL_FAR_3_00) <= 0;
		                pl.getFarDetails().setPermissableFar(INDUSTRIAL_FAR_3_00.doubleValue());
		                expectedResult = "<= " + INDUSTRIAL_FAR_3_00;
		            }
		            break;

		        // *********** INFORMATION TECHNOLOGY PLOTTED ***********
		        case "G-IT": // Information Technology
		            if (plotArea.compareTo(INDUSTRIAL_PLOTAREA_LIMIT_300) > 0) {
		                isAccepted = far.compareTo(INDUSTRIAL_FAR_2_50) <= 0;
		                pl.getFarDetails().setPermissableFar(INDUSTRIAL_FAR_2_50.doubleValue());
		                expectedResult = "<= " + INDUSTRIAL_FAR_2_50;
		            }
		            break;

		        // *********** TEXTILE PLOTTED ***********
		        case "G-T": // Textile Industry
		            if (plotArea.compareTo(INDUSTRIAL_PLOTAREA_LIMIT_2000) > 0) {
		                isAccepted = far.compareTo(INDUSTRIAL_FAR_2_50) <= 0;
		                pl.getFarDetails().setPermissableFar(INDUSTRIAL_FAR_2_50.doubleValue());
		                expectedResult = "<= " + INDUSTRIAL_FAR_2_50;
		            }
		            break;

		        // *********** KNITWEAR PLOTTED ***********
		        case "G-K": // Knitwear Industry
		            if (plotArea.compareTo(INDUSTRIAL_PLOTAREA_LIMIT_2000) > 0) {
		                isAccepted = far.compareTo(INDUSTRIAL_FAR_2_50) <= 0;
		                pl.getFarDetails().setPermissableFar(INDUSTRIAL_FAR_2_50.doubleValue());
		                expectedResult = "<= " + INDUSTRIAL_FAR_2_50;
		            }
		            break;

		        // *********** GENERAL INDUSTRY FLATTED ***********
		        case "G-GI": // General Industry
		            if (plotArea.compareTo(INDUSTRIAL_PLOTAREA_LIMIT_2000) > 0) {
		                isAccepted = far.compareTo(INDUSTRIAL_FAR_3_00) <= 0;
		                pl.getFarDetails().setPermissableFar(INDUSTRIAL_FAR_3_00.doubleValue());
		                expectedResult = "<= " + INDUSTRIAL_FAR_3_00;
		            }
		            break;

		        // *********** TEXTILE FLATTED ***********
		        // Same rule as Textile PLOTTED
		        case "G-TF": // Textile Flatted (custom code if needed)
		            if (plotArea.compareTo(INDUSTRIAL_PLOTAREA_LIMIT_2000) > 0) {
		                isAccepted = far.compareTo(INDUSTRIAL_FAR_2_50) <= 0;
		                pl.getFarDetails().setPermissableFar(INDUSTRIAL_FAR_2_50.doubleValue());
		                expectedResult = "<= " + INDUSTRIAL_FAR_2_50;
		            }
		            break;

		        // *********** KNITWEAR FLATTED ***********
		        // Same rule as Knitwear PLOTTED
		        case "G-KF": // Knitwear Flatted (custom code if needed)
		            if (plotArea.compareTo(INDUSTRIAL_PLOTAREA_LIMIT_2000) > 0) {
		                isAccepted = far.compareTo(INDUSTRIAL_FAR_2_50) <= 0;
		                pl.getFarDetails().setPermissableFar(INDUSTRIAL_FAR_2_50.doubleValue());
		                expectedResult = "<= " + INDUSTRIAL_FAR_2_50;
		            }
		            break;

		        // *********** WHOLESALE TRADE / WAREHOUSE / FREIGHT COMPLEX ***********
		        case "G-W": // Warehouse
		            if (plotArea.compareTo(INDUSTRIAL_PLOTAREA_LIMIT_10000) > 0) {
		                isAccepted = far.compareTo(INDUSTRIAL_FAR_1_50) <= 0;
		                pl.getFarDetails().setPermissableFar(INDUSTRIAL_FAR_1_50.doubleValue());
		                expectedResult = "<= " + INDUSTRIAL_FAR_1_50;
		            }
		            break;

		        default:
		            LOG.info("No Industrial FAR rule matched for subType: " + subType);
		    }
		}
		
		if (errors.isEmpty() && StringUtils.isNotBlank(expectedResult)) {
			buildResult(pl, occupancyName, far, typeOfArea, roadWidth, expectedResult, isAccepted);
		}
	}

	private void processFarHaazardous(Plan pl, OccupancyTypeHelper occupancyType, BigDecimal far, String typeOfArea,
			BigDecimal roadWidth, HashMap<String, String> errors) {

		String expectedResult = StringUtils.EMPTY;
		boolean isAccepted = false;

		if (typeOfArea.equalsIgnoreCase(OLD)) {
			if (roadWidth.compareTo(ROAD_WIDTH_TWO_POINTFOUR) < 0) {
				errors.put(OLD_AREA_ERROR, OLD_AREA_ERROR_MSG);
				pl.addErrors(errors);
			} else {
				isAccepted = far.compareTo(POINTFIVE) <= 0;
				pl.getFarDetails().setPermissableFar(POINTFIVE.doubleValue());
				expectedResult = "<=" + POINTFIVE;
			}

		}

		if (typeOfArea.equalsIgnoreCase(NEW)) {
			if (roadWidth.compareTo(ROAD_WIDTH_SIX_POINTONE) < 0) {
				errors.put(NEW_AREA_ERROR, NEW_AREA_ERROR_MSG);
				pl.addErrors(errors);
			} else {
				isAccepted = far.compareTo(POINTFIVE) <= 0;
				pl.getFarDetails().setPermissableFar(POINTFIVE.doubleValue());
				expectedResult = "<=" + POINTFIVE;
			}

		}

		String occupancyName = occupancyType.getType().getName();

		if (errors.isEmpty() && StringUtils.isNotBlank(expectedResult)) {
			buildResult(pl, occupancyName, far, typeOfArea, roadWidth, expectedResult, isAccepted);
		}
	}

	private void buildResult1(Plan pl, String occupancyName, Double totalProvidedFar, Double purchasableFar, String typeOfArea,
			Double expectedResult, boolean isAccepted) {
		ScrutinyDetail scrutinyDetail = new ScrutinyDetail();
		scrutinyDetail.addColumnHeading(1, RULE_NO);
		scrutinyDetail.addColumnHeading(2, OCCUPANCY);
		scrutinyDetail.addColumnHeading(3, AREA_TYPE);
		//scrutinyDetail.addColumnHeading(4, ROAD_WIDTH);
		scrutinyDetail.addColumnHeading(5, PERMISSIBLE);
		scrutinyDetail.addColumnHeading(6, PURCHASABLE);
		scrutinyDetail.addColumnHeading(7, PROVIDED);
		scrutinyDetail.addColumnHeading(8, STATUS);
		scrutinyDetail.setKey("Common_FAR");

		String totalProvidedFar1 = totalProvidedFar.toString();

		Map<String, String> details = new HashMap<>();
		details.put(RULE_NO, RULE);
		details.put(OCCUPANCY, occupancyName);
		details.put(AREA_TYPE, typeOfArea);
	//	details.put(ROAD_WIDTH, roadWidth.toString());
		details.put(PERMISSIBLE, String.valueOf(expectedResult));
		details.put(PURCHASABLE, String.valueOf(purchasableFar));		
		details.put(PROVIDED, totalProvidedFar1);
		details.put(STATUS, isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal());

		scrutinyDetail.getDetail().add(details);
		pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
//		Map<String, String> details1 = new HashMap<>();
//		details1.put(RULE_NO, RULE);
//		details1.put(OCCUPANCY, "Purchaseable FAR");
//		details1.put(AREA_TYPE, typeOfArea);
//	//	details.put(ROAD_WIDTH, roadWidth.toString());
//		details1.put(PERMISSIBLE, expectedResult);
//		details1.put(PROVIDED, actualResult);
//		details1.put(STATUS, isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal());
//		scrutinyDetail.getDetail().add(details1);
//		pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
	}
	
	private void buildResult(Plan pl, String occupancyName, BigDecimal far, String typeOfArea, BigDecimal roadWidth,
			String expectedResult, boolean isAccepted) {
		ScrutinyDetail scrutinyDetail = new ScrutinyDetail();
		scrutinyDetail.addColumnHeading(1, RULE_NO);
		scrutinyDetail.addColumnHeading(2, OCCUPANCY);
		scrutinyDetail.addColumnHeading(3, AREA_TYPE);
		//scrutinyDetail.addColumnHeading(4, ROAD_WIDTH);
		scrutinyDetail.addColumnHeading(5, PERMISSIBLE);
		scrutinyDetail.addColumnHeading(6, PROVIDED);
		scrutinyDetail.addColumnHeading(7, STATUS);
		scrutinyDetail.setKey("Common_FAR");

		String actualResult = far.toString();

		Map<String, String> details = new HashMap<>();
		details.put(RULE_NO, RULE);
		details.put(OCCUPANCY, occupancyName);
		details.put(AREA_TYPE, typeOfArea);
	//	details.put(ROAD_WIDTH, roadWidth.toString());
		details.put(PERMISSIBLE, expectedResult);
		details.put(PROVIDED, actualResult);
		details.put(STATUS, isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal());

//		scrutinyDetail.getDetail().add(details);
//		//pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
//		Map<String, String> details1 = new HashMap<>();
//		details1.put(RULE_NO, RULE);
//		details1.put(OCCUPANCY, "Purchaseable FAR");
//		details1.put(AREA_TYPE, typeOfArea);
//	//	details.put(ROAD_WIDTH, roadWidth.toString());
//		details1.put(PERMISSIBLE, expectedResult);
//		details1.put(PROVIDED, actualResult);
//		details1.put(STATUS, isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal());
//		scrutinyDetail.getDetail().add(details1);
//		pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
	}

	private ScrutinyDetail getFarScrutinyDetail(String key) {
		ScrutinyDetail scrutinyDetail = new ScrutinyDetail();
		scrutinyDetail.addColumnHeading(1, RULE_NO);
		scrutinyDetail.addColumnHeading(2, "Area Type");
		//scrutinyDetail.addColumnHeading(3, "Road Width");
		scrutinyDetail.addColumnHeading(4, PERMISSIBLE);
		scrutinyDetail.addColumnHeading(5, PROVIDED);
		scrutinyDetail.addColumnHeading(6, STATUS);
		scrutinyDetail.setKey(key);
		return scrutinyDetail;
	}

	@Override
	public Map<String, Date> getAmendments() {
		return new LinkedHashMap<>();
	}
	
	private void updateFarAsPerBalconyWidth(Plan pl){
		BigDecimal totalBuiltUpArea1 = pl.getVirtualBuilding().getTotalBuitUpArea();
		//LOG.info("Far before new case added 0.91 > -> Far : " +  " totalBuildUpArea : " + totalBuiltUpArea);
		// Code added for: Balcony width > 0.91m is included in FAR calculation
		//BigDecimal totalBuiltUpArea1 = BigDecimal.ZERO;

		for (Block block : pl.getBlocks()) {
		    for (Floor floor : block.getBuilding().getFloors()) {
	            //BigDecimal floorArea = floor.getArea() != null ? floor.getArea() : BigDecimal.ZERO;
	            
	            //LOG.info("Floor Area : -> " + floorArea);

		        for (org.egov.common.entity.edcr.Balcony balcony : floor.getBalconies()) {
		        	
		        	LOG.info("Data for Floor :::: " + floor.getNumber());

		            List<BigDecimal> widths = balcony.getWidths();
		            List<Measurement> measurements = balcony.getMeasurements();

		            // Skip if measurement list is empty
		            if (measurements == null || measurements.isEmpty()) {
		                LOG.warn("No measurement found for balcony, skipping.");
		                continue;
		            }

		            Measurement m = measurements.get(0);

		            // Round measurement values once
		            BigDecimal area = m.getArea() != null
		                ? m.getArea().setScale(DcrConstants.DECIMALDIGITS_MEASUREMENTS, DcrConstants.ROUNDMODE_MEASUREMENTS)
		                : BigDecimal.ZERO;
		            BigDecimal length = m.getLength() != null
		                ? m.getLength().setScale(DcrConstants.DECIMALDIGITS_MEASUREMENTS, DcrConstants.ROUNDMODE_MEASUREMENTS)
		                : BigDecimal.ZERO;
		            BigDecimal height = m.getHeight() != null
		                ? m.getHeight().setScale(DcrConstants.DECIMALDIGITS_MEASUREMENTS, DcrConstants.ROUNDMODE_MEASUREMENTS)
		                : BigDecimal.ZERO;

		            // Round threshold for comparison
		            BigDecimal threshold = EXCLUDE_BALCONY_WIDTH_ABOVE_4_FEET_FROM_FAR.setScale(
		                DcrConstants.DECIMALDIGITS_MEASUREMENTS,
		                DcrConstants.ROUNDMODE_MEASUREMENTS
		            );

		            boolean addedToFar = false;

		            for (BigDecimal rawWidth : widths) {
		                BigDecimal width = rawWidth.setScale(
		                    DcrConstants.DECIMALDIGITS_MEASUREMENTS,
		                    DcrConstants.ROUNDMODE_MEASUREMENTS
		                );

		                LOG.info("Balcony width above 0.91m, included in FAR: " + width);
	                    LOG.info("Balcony area   : " + area);
	                    LOG.info("Balcony length : " + length);
	                    LOG.info("Balcony height : " + height);
		                if (width.compareTo(threshold) > 0) {
		                    

		                    //totalBuiltUpArea1 = totalBuiltUpArea1.add(area);
		                    //providedFar = providedFar.add(area);
		                    
		                    // Add to this floor’s floor area
	                        //floorArea = floorArea.add(area);
		                    
		                 // Add to total built-up area
	                        totalBuiltUpArea1 = totalBuiltUpArea1.add(area);

	                        // ✅ Also distribute balcony area into each occupancy of this floor
	                        for (Occupancy occ : floor.getOccupancies()) {
	                            BigDecimal occFloorArea = occ.getFloorArea() != null ? occ.getFloorArea() : BigDecimal.ZERO;
	                            BigDecimal occBuiltUpArea = occ.getBuiltUpArea() != null ? occ.getBuiltUpArea() : BigDecimal.ZERO;

	                            LOG.info("Floor Area : " + occ.getFloorArea());
	                            LOG.info("Floor Built Up Area : " + occ.getBuiltUpArea());

	                            
	                            occ.setFloorArea(occFloorArea.add(area));
	                            occ.setBuiltUpArea(occBuiltUpArea.add(area));

	                            LOG.info("Updated Occupancy [type=" + occ.getType() + "] floorArea=" + occ.getFloorArea()
	                                    + ", builtUpArea=" + occ.getBuiltUpArea());
	                        }
		                    
		                    addedToFar = true;
		                    break; // Only add once per balcony
		                }
		            }

		            if (!addedToFar) {
		                LOG.info("Balcony width <= 0.91m, excluded from FAR.");
		            }
		        }
		     // update floor area for current floor
	            //floor.setArea(floorArea);
	            //LOG.info("Updated floor area for Floor " + floor.getNumber() + " : " + floorArea);
		    }
		}

		//pl.getVirtualBuilding().setTotalBuitUpArea(totalBuiltUpArea1);


		LOG.info("Far after new case added 0.91 > " + " totalBuildUpArea : " + totalBuiltUpArea1);
		pl.getVirtualBuilding().setTotalBuitUpArea(totalBuiltUpArea1);
	}
	
	static boolean shouldSkipValidation(EdcrRequest edcrRequest, String validationType) {
	    if (edcrRequest == null || edcrRequest.getAreaType() == null) {
	        return false;
	    }

	    // SCHEME_AREA
	    if ("SCHEME_AREA".equalsIgnoreCase(edcrRequest.getAreaType())) {
	        if (edcrRequest.getSchName() != null && !edcrRequest.getSchName().isEmpty()) {
	            if (Boolean.TRUE.equals(edcrRequest.getSiteReserved())) {
	                if (!Boolean.TRUE.equals(edcrRequest.getApprovedCS())) {
	                    // Skip PlotArea & RoadWidth validation
	                    if ("PlotArea".equalsIgnoreCase(validationType) || "RoadWidth".equalsIgnoreCase(validationType)) {
	                        return true;
	                    }
	                }
	            }
	        }
	    }

	    // NON_SCHEME_AREA
	    else if ("NON_SCHEME_AREA".equalsIgnoreCase(edcrRequest.getAreaType())) {
	        if (Boolean.TRUE.equals(edcrRequest.getCluApprove())) {
	            // Skip PlotArea & RoadWidth validation
	            if ("PlotArea".equalsIgnoreCase(validationType) || "RoadWidth".equalsIgnoreCase(validationType)) {
	                return true;
	            }
	        }

	        if ("yes".equalsIgnoreCase(edcrRequest.getCoreArea())) {
	            // Skip plot coverage, front setback and ECS validation
	            if ("PlotCoverage".equalsIgnoreCase(validationType)
	                    || "FrontSetback".equalsIgnoreCase(validationType)
	                    || "ECS".equalsIgnoreCase(validationType)) {
	                return true;
	            }
	        }
	    }

	    return false;
	}
	
	private void processPurchasableFar(Plan pl, OccupancyTypeHelper occupancyType, BigDecimal far, String typeOfArea, 
			HashMap<String, String> errors) {

		String expectedResult = StringUtils.EMPTY;
		boolean isAccepted = false;

		
		String occupancyName = occupancyType.getType().getName();

		if (errors.isEmpty() && StringUtils.isNotBlank(expectedResult)) {
			//buildResult(pl, occupancyName, far, typeOfArea,  expectedResult, isAccepted);
		}
	}
	
	private void getFarDetailsFromMDMS(Plan pl, String occType, String typeOfArea, OccupancyTypeHelper occupancyType) {
	    //Boolean mdmsEnabled = mdmsConfiguration.getMdmsEnabled();
	    //if (Boolean.TRUE.equals(mdmsEnabled)) {
	        try {
	            BigDecimal plotArea = pl.getPlot().getArea() != null ? pl.getPlot().getArea() : BigDecimal.ZERO;
	            Object mdmsData = bpaMdmsUtil.mDMSCall(new RequestInfo(), pl.getEdcrRequest(), occType, plotArea);

	            if (mdmsData != null) {
	                //String filterPath = "$.MdmsRes.EDCR.MasterPlan";
	                Map<String, List<Map<String, Object>>> masterPlanData = BpaMdmsUtil.mdmsResponseMapper(mdmsData, MdmsFilter.MASTER_PLAN_FILTER);

	                if (masterPlanData != null && !masterPlanData.isEmpty()) {

	                    String key = masterPlanData.keySet().iterator().next();
	                    List<Map<String, Object>> masterPlanList = masterPlanData.get(key);

	                    if (masterPlanList != null && !masterPlanList.isEmpty()) {
	                        Map<String, Object> planEntry = masterPlanList.get(0);

	                        Double regularPermissableFar = mdmsDataParser.toDouble(planEntry.get("NormalFAR"));
	                        Double purchasablePermissableFar = mdmsDataParser.toDouble(planEntry.get("PurchasableFAR"));
	                        Double providedFar = pl.getFarDetails() != null ? pl.getFarDetails().getProvidedFar() : 0.0;	                     
	                        Double purchasableFar = 0.0;	                                                
	                        
	                        if (Boolean.TRUE.equals(pl.getEdcrRequest().getPurchasableFar())) {

	                            // Step 1: Calculate purchasable FAR (if provided > regular)
	                            if (providedFar != null && regularPermissableFar != null && providedFar > regularPermissableFar) {
	                                purchasableFar = providedFar - regularPermissableFar;
	                            }

	                            // Step 2: Determine total permissible FAR conditionally
	                            Double totalPermissableFar;
	                            if (providedFar != null && regularPermissableFar != null && providedFar > regularPermissableFar) {
	                                // Provided FAR exceeds regular, allow adding purchasable permissible FAR
	                                totalPermissableFar = (regularPermissableFar != null ? regularPermissableFar : 0.0)
	                                        + (purchasablePermissableFar != null ? purchasablePermissableFar : 0.0);
	                            } else {
	                                // Provided FAR is within regular permissible, no need to add extra FAR
	                                totalPermissableFar = regularPermissableFar != null ? regularPermissableFar : 0.0;
	                            }

	                            // Step 3: Round all values to 2 decimals
	                            regularPermissableFar = BigDecimal.valueOf(regularPermissableFar).setScale(2, RoundingMode.HALF_UP).doubleValue();
	                            purchasablePermissableFar = BigDecimal.valueOf(purchasablePermissableFar).setScale(2, RoundingMode.HALF_UP).doubleValue();
	                            providedFar = BigDecimal.valueOf(providedFar).setScale(2, RoundingMode.HALF_UP).doubleValue();
	                            purchasableFar = BigDecimal.valueOf(purchasableFar).setScale(2, RoundingMode.HALF_UP).doubleValue();
	                            totalPermissableFar = BigDecimal.valueOf(totalPermissableFar).setScale(2, RoundingMode.HALF_UP).doubleValue();

	                            // Step 4: Check acceptance
	                            boolean isAccepted = (providedFar <= totalPermissableFar);

	                            // Step 5: Update FAR details in plan
	                            pl.getFarDetails().setPermissableFar(regularPermissableFar);
	                            pl.getFarDetails().setPurchasableFar(purchasablePermissableFar);
	                            pl.getFarDetails().setProvidedPurchasableFar(purchasableFar);
	                            pl.getFarDetails().setProvidedFar(providedFar);

	                            // Step 6: Logging
	                            LOG.info("Matched FAR -> OccupancyType: " + occType + ", PlotArea: " + plotArea);
	                            LOG.info("Regular Permissible FAR: " + regularPermissableFar
	                                    + ", Purchasable FAR Allowed: " + purchasablePermissableFar
	                                    + ", Provided FAR: " + providedFar
	                                    + ", Total Permissible FAR: " + totalPermissableFar
	                                    + ", Accepted: " + isAccepted);

	                            // Step 7: Build result
	                            buildResult1(pl, occupancyType.getType().getName(), providedFar, purchasablePermissableFar,
	                                    typeOfArea, regularPermissableFar, isAccepted);

	                        } else {
	                            // If purchasable FAR is not enabled
	                            boolean isAccepted = (providedFar <= regularPermissableFar);
	                            pl.getFarDetails().setPermissableFar(regularPermissableFar);
	                            pl.getFarDetails().setProvidedFar(providedFar);
	                            pl.getFarDetails().setPurchasableFar(0.0);
	                            pl.getFarDetails().setProvidedPurchasableFar(0.0);
	                            

	                            buildResult1(pl, occupancyType.getType().getName(), providedFar, purchasableFar,
	                                    typeOfArea, regularPermissableFar, isAccepted);
	                        }

	                        
	                        
	                    } else {
	                        LOG.info("No matching MasterPlan record found for OccupancyType=" 
	                                + occType + ", area=" + plotArea);
	                    }
	                } else {
	                    LOG.info("No MasterPlan data found in MDMS response");
	                }
	            }
	        } catch (Exception e) {
	            LOG.error("Error while fetching FAR details from MDMS", e);
	        }
	    //}
	}

	
//	private void getFarDetailsFromMDMS(Plan pl, String occType, String typeOfArea, OccupancyTypeHelper occupancyType) {
//    Boolean mdmsEnabled = mdmsConfiguration.getMdmsEnabled();
//    if (Boolean.TRUE.equals(mdmsEnabled)) {
//        try {        	
//        	BigDecimal plotArea = pl.getPlot().getArea() != null ? pl.getPlot().getArea() : BigDecimal.ZERO;
//            Object mdmsData = bpaMdmsUtil.mDMSCall(new RequestInfo(), pl.getEdcrRequest(), occType, plotArea);
//
//            if (mdmsData != null) {
//                
//                //plotArea=BigDecimal.valueOf(200);
//                //String occType = pl.getEdcrRequest().getOccupancyType(); // Assuming this is available in Plan
//
//                // JSONPath to directly filter MasterPlan entries
////                String filterPath = "$.MdmsRes.EDCR.MasterPlan[?(@.OccupancyType=='A && @.minPlotArea<=" + plotArea 
////                        + " && @.maxPlotArea>=" + plotArea + ")]";
//                String filterPath = "$.MdmsRes.EDCR.MasterPlan";
//
//                Map<String, List<Map<String, Object>>> masterPlanData = BpaMdmsUtil.mdmsResponseMapper(mdmsData, filterPath);
//
//                if (masterPlanData != null && !masterPlanData.isEmpty()) {
//                    // Extract filtered list
//                    String key = masterPlanData.keySet().iterator().next();
//                    List<Map<String, Object>> masterPlanList = masterPlanData.get(key);
//
//                    if (masterPlanList != null && !masterPlanList.isEmpty()) {
//                        Map<String, Object> planEntry = masterPlanList.get(0);
//
//                        Double regularPermissableFar = mdmsDataParser.toDouble(planEntry.get("NormalFAR"));
//                        Double PurchasablePermissableFar = mdmsDataParser.toDouble(planEntry.get("PurchasableFAR"));
//                        
//                        Double providedFar=pl.getFarDetails().getProvidedFar();
//        				Double purchasableFar = 0.0;
//        		        if (providedFar != null && regularPermissableFar != null && providedFar > regularPermissableFar) {
//        		            purchasableFar = providedFar - regularPermissableFar;
//        		        }
//
//                        if (pl.getFarDetails() == null) {
//                            pl.setFarDetails(new FarDetails());
//                        }
//
//                        pl.getFarDetails().setPermissableFar(regularPermissableFar != null ? regularPermissableFar : 0.0);
//                        pl.getFarDetails().setPurchasableFar(purchasableFar != null ? purchasableFar : 0.0);
//                        pl.getFarDetails().setProvidedPurchasableFar(1.72); // example
//
//                        LOG.info("Matched FAR -> OccupancyType: " + "A" + ", PlotArea: " + plotArea);
//                        LOG.info("NormalFAR: " + regularPermissableFar + ", PurchasableFAR: " + purchasableFar);
//                        //buildResult1(Plan pl, String occupancyName, BigDecimal far, String typeOfArea,
//            			//Double expectedResult, boolean isAccepted) {
//                        Double totalFar = providedFar + ; 
//                        buildResult1(pl, occupancyType.getType().getName(), Double.valueOf(regularPermissableFar), purchasableFar, 
//                        		typeOfArea, regularPermissableFar, true);
//                    } else {
//                    	LOG.info("⚠️ No matching MasterPlan record found for OccupancyType=" 
//                                + "A" + ", area=" + plotArea);
//                    }
//                } else {
//                	LOG.info("⚠️ No MasterPlan data found in MDMS response");
//                }
//            }
//        } catch (Exception e) {
//            LOG.error("Error while fetching FAR details from MDMS", e);
//        }
//    }
//}




//	private void getFarDetailsFromMDMS(Plan pl){
//
//		Boolean mdmsEnabled = mdmsConfiguration.getMdmsEnabled();
//		if(mdmsEnabled) {
//			Object mdmsData = bpaMdmsUtil.mDMSCall(new RequestInfo(), pl.getEdcrRequest().getTenantId());  
//			if(mdmsData!=null) {
//				Map<String, List<Map<String, Object>>> farData = BpaMdmsUtil.mdmsResponseMapper(mdmsData, MdmsFilter.FAR_PATH);
//				Double permissibleFar=pl.getFarDetails().getPermissableFar(); 
//				Double providedFar=pl.getFarDetails().getProvidedFar();
//				double purchasableFar = 0.0;
//		        if (providedFar != null && permissibleFar != null && providedFar > permissibleFar) {
//		            purchasableFar = providedFar - permissibleFar;
//		        }
//		        
//				
//		        List<Map<String, Object>> farList = farData.get("FAR");
//				if (farList != null) {
//				    for (Map<String, Object> farEntry : farList) {
//				        Object normalFar = farEntry.get("NormalFAR");
//				        Object purchFar = (Double) farEntry.get("PurchesebleFAR");
//				        pl.getFarDetails().setPurchasableFar(mdmsDataParser.toDouble(purchFar));
//				        pl.getFarDetails().setProvidedPurchasableFar(1.72); // direct double
//				        System.out.println("NormalFAR: " + normalFar + ", PurchesebleFAR: " + purchFar);
////				     // Safe parsing
////				        Double normalFar = mdmsDataParser.getDouble(farEntry, "NormalFAR");
////				        Double purchFar  = mdmsDataParser.getDouble(farEntry, "PurchesebleFAR");
////
////				        // Assign safely
////				        //pl.getFarDetails().setNormalFar(normalFar);
////				        pl.getFarDetails().setPurchasableFar(purchFar);
////				        pl.getFarDetails().setProvidedPurchasableFar(1.72);
//				    }
//				}				
//		        //Map<String, List<Map<String, Object>>> categories = BpaMdmsUtil.mdmsResponseMapper(mdmsData, MdmsFilter.CATEGORY_PATH);
//
//		        //Map<String, List<Map<String, Object>>> normalFAR = BpaMdmsUtil.mdmsResponseMapper(mdmsData, MdmsFilter.NORMAL_FAR_PATH);
//			
////		        if (farList != null && !farList.isEmpty()) {
////		            // Make sure FarDetails object exists
////		            if (pl.getFarDetails() == null) {
////		                pl.setFarDetails(new FarDetails());
////		            }
////
////		            for (Map<String, Object> farEntry : farList) {
////		                // Safe extraction
////		                Double normalFar = mdmsDataParser.getDouble(farEntry, "NormalFAR");
////		                Double purchFar  = mdmsDataParser.getDouble(farEntry, "PurchesebleFAR");
////
////		                // Set values safely
////		                pl.getFarDetails().setPermissableFar(normalFar != null ? normalFar : 0.0);
////		                pl.getFarDetails().setPurchasableFar(purchFar != null ? purchFar : 0.0);
////		                pl.getFarDetails().setProvidedPurchasableFar(1.72);
////
////		                System.out.println("NormalFAR: " + normalFar + ", PurchesebleFAR: " + purchFar);
////		            }
////		        } else {
////		            System.out.println("No FAR data found in mdms");
////		        }
//		        
//			}
//	        
//	        
//		}
//     }
	
	private void getFarValues(){
//		List<Map<String, Object>> farList = farData.get("FAR");
//		if (farList != null) {
//		    for (Map<String, Object> farEntry : farList) {
//		        Object normalFar = farEntry.get("NormalFAR");
//		        Object purchFar = farEntry.get("PurchesebleFAR");
//
//		        System.out.println("NormalFAR: " + normalFar + ", PurchesebleFAR: " + purchFar);
//		    }
//		}

	}
	
}
