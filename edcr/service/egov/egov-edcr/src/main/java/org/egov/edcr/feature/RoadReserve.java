/*
 * eGov SmartCity eGovernance suite aims to improve the internal efficiency,transparency,
 * accountability and the service delivery of the government organizations.
 *
 * Copyright (C) <2019> eGovernments Foundation
 *
 * The updated version of eGov suite of products as by eGovernments Foundation
 * is available at http://www.egovernments.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/ or
 * http://www.gnu.org/licenses/gpl.html .
 *
 * In addition to the terms of the GPL license to be adhered to in using this
 * program, the following additional terms are to be complied with:
 *
 * 1) All versions of this program, verbatim or modified must carry this
 * Legal Notice.
 * Further, all user interfaces, including but not limited to citizen facing interfaces,
 * Urban Local Bodies interfaces, dashboards, mobile applications, of the program and any
 * derived works should carry eGovernments Foundation logo on the top right corner.
 *
 * For the logo, please refer http://egovernments.org/html/logo/egov_logo.png.
 * For any further queries on attribution, including queries on brand guidelines,
 * please contact contact@egovernments.org
 *
 * 2) Any misrepresentation of the origin of the material is prohibited. It
 * is required that all modified versions of this material be marked in
 * reasonable ways as different from the original version.
 *
 * 3) This license does not grant any rights to any user of the program
 * with regards to rights under trademark law for use of the trade names
 * or trademarks of eGovernments Foundation.
 *
 * In case of any queries, you can reach eGovernments Foundation at contact@egovernments.org.
 */

package org.egov.edcr.feature;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.dcr.helper.OccupancyHelperDetail;
import org.egov.common.entity.edcr.Plan;
import org.egov.common.entity.edcr.Result;
import org.egov.common.entity.edcr.Road;
import org.egov.common.entity.edcr.ScrutinyDetail;
import org.egov.commons.edcr.mdms.filter.MdmsFilter;
import org.egov.commons.mdms.BpaMdmsUtil;
import org.egov.edcr.constants.DxfFileConstants;
import org.springframework.stereotype.Service;

@Service
public class RoadReserve extends FeatureProcess {

    private static final Logger LOG = LogManager.getLogger(RoadReserve.class);
    private static final String ROAD_WIDTH_KEY = "Common_Road Width ";
    private static final String ROAD_WIDTH_RULE = "Road Width";

    @Override
    public Plan validate(Plan pl) {
        return pl;
    }

    @Override
    public Plan process(Plan pl) {
        try {
            if (pl == null) {
                return pl;
            }

            List<Road> roadReserves = pl.getRoadReserves();
            if (roadReserves == null || roadReserves.isEmpty()) {
                return pl;
            }
            OccupancyHelperDetail occupancyType = extractOccupancyType(pl);
            boolean isGroupHousing = occupancyType != null 
                    && occupancyType.getCode() != null 
                    && DxfFileConstants.A_AF.equalsIgnoreCase(occupancyType.getCode());

            ScrutinyDetail scrutinyDetail = new ScrutinyDetail();
            scrutinyDetail.setKey(ROAD_WIDTH_KEY);

            if (isGroupHousing) {
            	processGroupHousingRoad(pl, scrutinyDetail);
            } else {
                processGeneralRoads(pl, roadReserves, scrutinyDetail);
            }

            if (scrutinyDetail.getDetail() != null && !scrutinyDetail.getDetail().isEmpty()) {
                pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
            }

        } catch (Exception e) {
            LOG.error("Error occurred while processing Road Reserve feature: ", e);
            addError(pl, "Road Reserve Exception", "An unexpected error occurred during Road Reserve validation: " + e.getMessage());
        }

        return pl;
    }

    private OccupancyHelperDetail extractOccupancyType(Plan pl) {
        return Optional.ofNullable(pl)
                .map(Plan::getVirtualBuilding)
                .map(vb -> vb.getMostRestrictiveFarHelper())
                .map(far -> far.getSubtype() != null ? far.getSubtype() : far.getType())
                .orElse(null);
    }

    private void processGroupHousingRoad(Plan pl, ScrutinyDetail scrutinyDetail) {
        scrutinyDetail.addColumnHeading(1, DESCRIPTION);
        scrutinyDetail.addColumnHeading(2, PERMISSIBLE);
        scrutinyDetail.addColumnHeading(3, PROVIDED);
        scrutinyDetail.addColumnHeading(4, STATUS);
        BigDecimal roadWidth = Optional.ofNullable(pl.getRoadReserveFront())
                .orElse(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal roadWidthRequired = getRoadWidthFromMdms(pl, roadWidth);
        if (roadWidthRequired != null) {
            boolean isAccepted = roadWidth.compareTo(roadWidthRequired) >= 0 && roadWidth.compareTo(BigDecimal.ZERO) > 0;
            String status = isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal();            
            setReportOutputDetailsV2(ROAD_WIDTH_RULE, roadWidthRequired.toPlainString(), 
                    roadWidth.toPlainString(), status, scrutinyDetail);
        }
    }

    private void processGeneralRoads(Plan pl, List<Road> roadReserves, ScrutinyDetail scrutinyDetail) {
        scrutinyDetail.addColumnHeading(1, DESCRIPTION);
        scrutinyDetail.addColumnHeading(2, PROVIDED);
        scrutinyDetail.addColumnHeading(3, STATUS);
        StringBuilder roadWidthBuilder = new StringBuilder();
        for (Road road : roadReserves) {
            if (road == null || road.getWidth() == null) {
                continue;
            }
            BigDecimal roadWidth = road.getWidth().setScale(2, RoundingMode.HALF_UP);
            if (roadWidth.compareTo(BigDecimal.ZERO) > 0) {
                String roadName = formatRoadName(road.getName());
                if (roadWidthBuilder.length() > 0) {
                    roadWidthBuilder.append(" , ");
                }
                roadWidthBuilder.append(roadName)
                        .append("=")
                        .append(roadWidth)
                        .append("m");
            }
        }
        if (roadWidthBuilder.length() > 0) {
            setReportOutputDetails(ROAD_WIDTH_RULE, roadWidthBuilder.toString(), 
                    Result.Accepted.getResultVal(), scrutinyDetail);
        }
    }

    private String formatRoadName(String originalName) {
        if (originalName == null || originalName.trim().isEmpty()) {
            return "Road";
        }

        String layerName = originalName.toUpperCase();
        if (layerName.contains("FRONT")) {
            return "Front";
        } else if (layerName.contains("REAR")) {
            return "Rear";
        } else if (layerName.contains("SIDE")) {
            String[] split = layerName.split("_");
            String sideValue = split[split.length - 1];
            return capitalize(sideValue);
        }

        return capitalize(originalName);
    }

    private String capitalize(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        return text.substring(0, 1).toUpperCase() + text.substring(1).toLowerCase();
    }

    public BigDecimal getRoadWidthFromMdms(Plan pl, BigDecimal roadWidth) {
        BigDecimal requiredRoadWidth = BigDecimal.ZERO;

        try {
            if (pl.getMdmsMasterData() != null && pl.getMdmsMasterData().get("masterMdmsData") != null) {
                Optional<BigDecimal> scOpt = BpaMdmsUtil.extractMdmsValue(
                        pl.getMdmsMasterData().get("masterMdmsData"), 
                        MdmsFilter.MIN_ROAD_WIDTH, 
                        BigDecimal.class);

                if (scOpt.isPresent()) {
                    requiredRoadWidth = scOpt.get();
                    LOG.info("Min Road width Value from MDMS: {}", requiredRoadWidth);
                } else {
                    LOG.warn("Minimum Road Width configuration missing in MDMS");
                    addError(pl, "MDMS Error", "Minimum Road Width is not configured in MDMS");
                }
            } else {
                LOG.warn("MDMS Master Data missing from Plan context.");
                addError(pl, "MDMS Error", "MDMS Master Data missing from Plan context");
            }
        } catch (Exception e) {
            LOG.error("Failed to retrieve road width from MDMS: ", e);
            addError(pl, "MDMS Error", "Error extracting road width from MDMS: " + e.getMessage());
        }

        if (requiredRoadWidth.compareTo(BigDecimal.ZERO) > 0 && roadWidth.compareTo(requiredRoadWidth) < 0) {
            addError(pl, "Road width Error", 
                    "Provided road width is less than minimum required road width of " + requiredRoadWidth + " m");
        }

        return requiredRoadWidth;
    }

    private void addError(Plan pl, String key, String value) {
        if (pl != null) {
            HashMap<String, String> errors = new HashMap<>();
            errors.put(key, value);
            pl.addErrors(errors);
        }
    }

    private void setReportOutputDetails(String ruleDesc, String actual, String status, ScrutinyDetail scrutinyDetail) {
        Map<String, String> details = new HashMap<>();
        details.put(DESCRIPTION, ruleDesc);
        details.put(PROVIDED, actual);
        details.put(STATUS, status);
        scrutinyDetail.getDetail().add(details);
    }

    private void setReportOutputDetailsV2(String ruleDesc, String expected, String actual, String status, ScrutinyDetail scrutinyDetail) {
        Map<String, String> details = new HashMap<>();
        details.put(DESCRIPTION, ruleDesc);
        details.put(PERMISSIBLE, expected);
        details.put(PROVIDED, actual);
        details.put(STATUS, status);
        scrutinyDetail.getDetail().add(details);
    }

    @Override
    public Map<String, Date> getAmendments() {
        return new LinkedHashMap<>();
    }
}