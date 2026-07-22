package org.egov.edcr.feature;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Cinema;
import org.egov.common.entity.edcr.Floor;
import org.egov.common.entity.edcr.Measurement;
import org.egov.edcr.entity.blackbox.MeasurementDetail;
import org.egov.edcr.entity.blackbox.PlanDetail;
import org.egov.edcr.service.LayerNames;
import org.egov.edcr.utility.Util;
import org.kabeja.dxf.DXFLWPolyline;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CinemaExtract extends FeatureExtract{
	private static final Logger LOG = LogManager.getLogger(CinemaExtract.class);

	@Override
	public PlanDetail extract(PlanDetail planDetail) {
		for (Block block : planDetail.getBlocks()) {
            if (block.getBuilding() != null && block.getBuilding().getFloors() != null) {
                for (Floor f : block.getBuilding().getFloors()) {
                    List<Cinema> cinemas = new ArrayList<>();
                    String layerName = String.format("BLK_%s_FLR_%s_CINEMA_%s", block.getNumber(),
                            f.getNumber(), "+\\d");

                    List<String> names = Util.getLayerNamesLike(planDetail.getDoc(), layerName);

                    for (String cinemaLayer : names) {
                        List<DXFLWPolyline> cinemaMeasurements = Util.getPolyLinesByLayer(planDetail.getDoc(), cinemaLayer);
                        if(!cinemaMeasurements.isEmpty()) {
                        	//Code added for the layername with colorCode match
                    		Util.validateLayerColor(cinemaLayer, Util.getColorByPolyLine(cinemaMeasurements), planDetail);
                        }
                        if (!cinemaMeasurements.isEmpty()) {
                        	Cinema cinemaObj = new Cinema();
                            List<Measurement> cinemaMeasurementList = new ArrayList<>();
                            cinemaMeasurements.forEach(cinema -> {
                                Measurement measurementCinema = new MeasurementDetail(cinema, true);
                                cinemaMeasurementList.add(measurementCinema);
                            });
                            
                            String seats = Util.getMtextByLayerName(planDetail.getDoc(), cinemaLayer);
                            Integer noOfSeats = 0;
                            if (seats != null && seats.contains("=")) {
                                try {
                                    String value = seats.split("=")[1].trim();
                                    noOfSeats = Integer.parseInt(value);
                                } catch (Exception e) {
                                    noOfSeats = 0;
                                    LOG.error("Error in Cinemas {}", e);
                                }
                            }
                            
                            cinemaObj.setSeats(noOfSeats);
                            cinemaObj.setCinemas(cinemaMeasurementList);
                            cinemaObj.setNoOfCinemas(cinemaMeasurementList.size());
                            cinemas.add(cinemaObj);
                        }
                    }                    
                    
                    f.setCinemas(cinemas);
                   
                }
            }
        }
		return planDetail;
	}

	@Override
	public PlanDetail validate(PlanDetail planDetail) {
		return planDetail;
	}

}
