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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Floor;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.Plan;
import org.egov.common.entity.edcr.Result;
import org.egov.common.entity.edcr.ScrutinyDetail;
import org.egov.common.entity.edcr.Toilet;
import org.egov.edcr.utility.DcrConstants;
import org.springframework.stereotype.Service;

@Service
public class TerraceToilet extends FeatureProcess {

    private static final Logger LOG = LogManager.getLogger(TerraceToilet.class);
    private static final String RULE_NO = "Residential Scrutiny Point 2";
    private static final BigDecimal MAX_AREA = BigDecimal.valueOf(6);      // 6 sq.m
    private static final BigDecimal MAX_HEIGHT = BigDecimal.valueOf(2.75); // 2.75 m

    @Override
    public Map<String, Date> getAmendments() {
        return null;
    }

    @Override
    public Plan validate(Plan pl) {
        return pl;
    }

    @Override
    public Plan process(Plan pl) {
        LOG.info("****Start - Process Terrace Toilet***");

        if (pl.getBlocks() != null) {
            for (Block block : pl.getBlocks()) {
//                if (block.getTerraceToilets() != null && !block.getTerraceToilets().isEmpty()) {
//                    
//                    ScrutinyDetail scrutinyDetail = new ScrutinyDetail();
//                    scrutinyDetail.setKey("Block_" + block.getNumber() + "_" + "Terrace Toilet");
//                    scrutinyDetail.addColumnHeading(1, RULE_NO);
//                    scrutinyDetail.addColumnHeading(2, DESCRIPTION);
//                    scrutinyDetail.addColumnHeading(3, "Area Permitted");
//                    scrutinyDetail.addColumnHeading(4, "Area Provided");
//                    scrutinyDetail.addColumnHeading(5, "Height Permitted");
//                    scrutinyDetail.addColumnHeading(6, "Height Provided");
//                    scrutinyDetail.addColumnHeading(7, STATUS);
//
//                    for (TerraceToilet toilet : block.getTerraceToilet()) {
//                        Map<String, String> details = new HashMap<>();
//                        details.put(RULE_NO, RULE_NO);
//                        details.put(DESCRIPTION, toilet.getName());
//                        details.put("Area Permitted", MAX_AREA + DcrConstants.SQMTRS);
//                        details.put("Area Provided", toilet.getArea() + DcrConstants.SQMTRS);
//                        details.put("Height Permitted", MAX_HEIGHT + DcrConstants.IN_METER);
//                        details.put("Height Provided", toilet.getHeight() + DcrConstants.IN_METER);
//
//                        // Check compliance
//                        boolean areaCompliant = toilet.getArea().compareTo(MAX_AREA) <= 0;
//                        boolean heightCompliant = toilet.getHeight().compareTo(MAX_HEIGHT) <= 0;
//
//                        if (areaCompliant && heightCompliant) {
//                            details.put(STATUS, Result.Accepted.getResultVal());
//                            LOG.info(toilet.getName() + " is compliant - Area: " + toilet.getArea() + 
//                                     " sq.m, Height: " + toilet.getHeight() + " m");
//                        } else {
//                            String reason = "";
//                            if (!areaCompliant) {
//                                reason = "Area exceeds " + MAX_AREA + " sq.m";
//                            }
//                            if (!heightCompliant) {
//                                if (!reason.isEmpty()) reason += ", ";
//                                reason += "Height exceeds " + MAX_HEIGHT + " m";
//                            }
//                            details.put(STATUS, Result.Not_Accepted.getResultVal());
//                            LOG.info(toilet.getName() + " is NOT compliant - " + reason);
//                        }
//
//                        scrutinyDetail.getDetail().add(details);
//                    }
//
//                    pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
//                }
            }
        }
        
        LOG.info("****End - Process Terrace Toilet***");
        return pl;
    }
}
