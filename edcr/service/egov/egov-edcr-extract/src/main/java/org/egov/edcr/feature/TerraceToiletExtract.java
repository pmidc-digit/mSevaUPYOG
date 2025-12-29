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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Floor;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.TerraceToilet;
import org.egov.common.entity.edcr.Toilet;
import org.egov.edcr.entity.blackbox.MeasurementDetail;
import org.egov.edcr.entity.blackbox.PlanDetail;
import org.egov.edcr.service.LayerNames;
import org.egov.edcr.utility.Util;
import org.kabeja.dxf.DXFLWPolyline;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TerraceToiletExtract extends FeatureExtract {
	
	    private static final Logger LOG = LogManager.getLogger(TerraceToiletExtract.class);
	    @Autowired
	    private LayerNames layerNames;
	    
	    public static final String LAYER_NAME_TERRACE_TOILET = "LAYER_NAME_TERRACE_TOILET";

	    @Override
	    public PlanDetail validate(PlanDetail planDetail) {
	        return planDetail;
	    }

	    @Override
	    public PlanDetail extract(PlanDetail planDetail) {
//	    	LOG.info("****Start - Extract terrace toilet***");
//	    	if (planDetail.getBlocks() != null && !planDetail.getBlocks().isEmpty()) {
//	            LOG.info("Processing blocks for terrace toilet extraction, count: " + pl.getBlocks().size());
//	            for (Block block : planDetail.getBlocks()) {
//	            	 List<TerraceToilet> terraceToilets = new ArrayList<>();
//	                String layerPattern = layerNames.getLayerName(LAYER_NAME_TERRACE_TOILET);
//	                
//	                String layerName = String.format(layerNames.getLayerName("LAYER_NAME_BLK_FLR_TOILET"), block.getNumber(),"+\\d");
//
//                    List<String> names = Util.getLayerNamesLike(planDetail.getDoc(), layerName);
//                    
//                    for (String toiletLayer : names) {
//                        List<DXFLWPolyline> toiletMeasurements = Util.getPolyLinesByLayer(planDetail.getDoc(), toiletLayer);
//
//                        if (!toiletMeasurements.isEmpty()) {
//                            Toilet toiletObj = new Toilet();
//                            List<Measurement> toiletMeasurementList = new ArrayList<>();
//                            toiletMeasurements.forEach(toilet -> {
//                                Measurement measurementToilet = new MeasurementDetail(toilet, true);
//                                toiletMeasurementList.add(measurementToilet);
//                            });
//
//                            toiletObj.setToilets(toiletMeasurementList);
//                            toilets.add(toiletObj);
//                        }
//                    }
//                    
//                    
//	                LOG.info("Layer pattern for terrace toilet: " + layerPattern);
//	                if (layerPattern != null) {
//	                    String layerName = String.format(layerPattern, block.getNumber());
//	                    LOG.info("Looking for layer: " + layerName);
//	                    List<DXFLWPolyline> polylines = Util.getPolyLinesByLayer(pl.getDoc(), layerName);
//	                    LOG.info("Found " + polylines.size() + " polylines in layer " + layerName);
//	                   
//	                
//	                if (polylines != null && !polylines.isEmpty()) {
//	                    LOG.info("Found " + polylines.size() + " terrace toilet polylines in block " + block.getNumber());
//	                    
//	                    // Group polylines by color code
//	                    Map<Integer, List<DXFLWPolyline>> polylinesByColor = polylines.stream()
//	                            .collect(Collectors.groupingBy(DXFLWPolyline::getColor));
//	                    
//	                    int toiletCounter = 1;
//	                    for (Map.Entry<Integer, List<DXFLWPolyline>> entry : polylinesByColor.entrySet()) {
//	                        for (DXFLWPolyline polyline : entry.getValue()) {
//	                            terraceToilets.add(build(planDetail, polyline, toiletCounter++, layerName));
//	                        }
//	                    }
//	                }
//
//	                //block.setTerraceToilets(terraceToilets);
//	                LOG.info("Extracted " + terraceToilets.size() + " terrace toilets for block " + block.getNumber());
//	                }
//	            }
//	        }
	        return planDetail;
	    }
	    
	    private TerraceToilet build(PlanDetail pl, DXFLWPolyline polyline, int counter, String layerName) {
	        TerraceToilet terraceToilet = new TerraceToilet();
	        
	        // Calculate area from polyline
	        BigDecimal area = Util.getPolyLineArea(polyline);
	        terraceToilet.setArea(area);
	        
	        // Extract height from polyline (Z-coordinate difference)
	        BigDecimal height = extractHeight(polyline);
	        terraceToilet.setHeight(height);
	        
	        LOG.info("****Terrace Toilet " + counter + " - Area: " + area + " sq.m, Height: " + height + " m");
	        
	        return terraceToilet;
	    }
	    
	    /**
	     * Extract height from polyline vertices.
	     * Height is calculated as the difference between maximum and minimum Z coordinates.
	     */
	    private BigDecimal extractHeight(DXFLWPolyline polyline) {
	        try {
	            double minZ = Double.MAX_VALUE;
	            double maxZ = Double.MIN_VALUE;
	            
	            // Iterate through vertices to find min and max Z coordinates
	            for (int i = 0; i < polyline.getVertexCount(); i++) {
	                double z = polyline.getVertex(i).getZ();
	                if (z < minZ) minZ = z;
	                if (z > maxZ) maxZ = z;
	            }
	            
	            // Height is the difference
	            double height = maxZ - minZ;
	            return BigDecimal.valueOf(height);
	        } catch (Exception e) {
	            LOG.error("Error extracting height from polyline", e);
	            return BigDecimal.ZERO;
	        }
	    }
	    
	}