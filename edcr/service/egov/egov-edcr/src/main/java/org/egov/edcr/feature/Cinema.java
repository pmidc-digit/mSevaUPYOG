package org.egov.edcr.feature;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Floor;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.Plan;
import org.egov.common.entity.edcr.Result;
import org.egov.common.entity.edcr.ScrutinyDetail;
import org.springframework.stereotype.Service;

import static org.egov.edcr.constants.DxfFileConstants.F_MIP;
import static org.egov.edcr.constants.DxfFileConstants.F_MTP;

@Service
public class Cinema extends FeatureProcess {

	private static final Logger LOG = LogManager.getLogger(Cinema.class);
	private static final String RULENO = "4.9";

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

		for (Block block : pl.getBlocks()) {

			if (block.getBuilding() == null || block.getBuilding().getFloors() == null
					|| block.getBuilding().getFloors().isEmpty()) {
				continue;
			}

			ScrutinyDetail cinemaCountDetail = new ScrutinyDetail();
			cinemaCountDetail.setKey("Block_" + block.getNumber() + "_" + "Cinemas - Number of Cinemas");

			cinemaCountDetail.addColumnHeading(1, RULE_NO);
			cinemaCountDetail.addColumnHeading(2, DESCRIPTION);
			cinemaCountDetail.addColumnHeading(3, FLOOR_NO);
			cinemaCountDetail.addColumnHeading(4, PERMISSIBLE);
			cinemaCountDetail.addColumnHeading(5, PROVIDED);
			cinemaCountDetail.addColumnHeading(6, STATUS);

			ScrutinyDetail cinemaDetail = new ScrutinyDetail();
			cinemaDetail.setKey("Block_" + block.getNumber() + "_" + "Details of Cinema Hall");

			cinemaDetail.addColumnHeading(1, RULE_NO);
			cinemaDetail.addColumnHeading(2, DESCRIPTION);
			cinemaDetail.addColumnHeading(3, FLOOR_NO);
			cinemaDetail.addColumnHeading(4, REQUIRED);
			cinemaDetail.addColumnHeading(5, PROVIDED);
			cinemaDetail.addColumnHeading(6, STATUS);

			for (Floor floor : block.getBuilding().getFloors()) {

				if (floor.getCinemas() == null || floor.getCinemas().isEmpty()) {
					continue;
				}
				
				int requiredCinemaCount;
				int requiredSeatsPerCinema;
				int maxTotalSeats;
				boolean validateIndividualSeats;

				if(block.getBuilding().getMostRestrictiveFarHelper().getSubtype().getCode()!=null
						&& !block.getBuilding().getMostRestrictiveFarHelper().getSubtype().getCode().isEmpty()) {
					String subType = block.getBuilding().getMostRestrictiveFarHelper().getSubtype().getCode();
					if (F_MTP.equalsIgnoreCase(subType)) {
					    // Multiplex
					    requiredCinemaCount = 2;
					    requiredSeatsPerCinema = 150;
					    maxTotalSeats = 0;              // Not Applicable
					    validateIndividualSeats = true;

					} else if (F_MIP.equalsIgnoreCase(subType)) {
					    // Miniplex
					    requiredCinemaCount = 4;
					    requiredSeatsPerCinema = 0;     // Not Applicable
					    maxTotalSeats = 999;
					    validateIndividualSeats = false;

					} else {
					    continue;
					}
					// ---------------- Number of Cinemas ----------------
					int noOfCinemas = floor.getCinemas().size();
					Map<String, String> countRow = new HashMap<>();

					countRow.put(RULE_NO, RULENO);
					countRow.put(DESCRIPTION, "No. of Cinemas");
					countRow.put(FLOOR_NO, String.valueOf(floor.getNumber()));
					countRow.put(PERMISSIBLE, String.valueOf(requiredCinemaCount));
					countRow.put(PROVIDED, String.valueOf(noOfCinemas));
					countRow.put(STATUS,
					        noOfCinemas >= requiredCinemaCount
					                ? Result.Accepted.getResultVal()
					                : Result.Not_Accepted.getResultVal());

					cinemaCountDetail.getDetail().add(countRow);
					// ---------------- Cinema Details ----------------
					int cinemaIndex = 1;

					for (org.egov.common.entity.edcr.Cinema cinema : floor.getCinemas()) {
						// -------- Seats --------
						int totalSeats = Optional.ofNullable(floor.getCinemas())
							    .orElseGet(Collections::emptyList)
							    .stream()
							    .map(org.egov.common.entity.edcr.Cinema::getSeats)
							    .filter(Objects::nonNull)
							    .mapToInt(Integer::intValue)
							    .sum();
						
						Map<String, String> seatRow = new HashMap<>();

						seatRow.put(RULE_NO, RULENO);
						seatRow.put(DESCRIPTION, "Cinema " + cinemaIndex + " Seats");
						seatRow.put(FLOOR_NO, String.valueOf(floor.getNumber()));
						
						if (validateIndividualSeats) {
						    // Multiplex
						    seatRow.put(REQUIRED, String.valueOf(requiredSeatsPerCinema));
						    seatRow.put(PROVIDED,
						            cinema.getSeats() == null ? "0" : cinema.getSeats().toString());

						    seatRow.put(STATUS,
						            cinema.getSeats() != null
						                    && cinema.getSeats() >= requiredSeatsPerCinema
						                            ? Result.Accepted.getResultVal()
						                            : Result.Not_Accepted.getResultVal());

						} else {
						    // Miniplex
						    seatRow.put(REQUIRED,
						            "> 0 (Total seats in all cinemas ≤ " + maxTotalSeats + ")");
						    seatRow.put(PROVIDED,
						            cinema.getSeats() == null ? "0" : cinema.getSeats().toString());

						    boolean accepted =
						            totalSeats > 0 &&
						            totalSeats <= maxTotalSeats;

						    seatRow.put(STATUS,
						            accepted
						                    ? Result.Accepted.getResultVal()
						                    : Result.Not_Accepted.getResultVal());
						}

						cinemaDetail.getDetail().add(seatRow);

						cinemaIndex++;
					}
					
				}
				
				
				
			}

			if (!cinemaCountDetail.getDetail().isEmpty()) {
				pl.getReportOutput().getScrutinyDetails().add(cinemaCountDetail);
			}

			if (!cinemaDetail.getDetail().isEmpty()) {
				pl.getReportOutput().getScrutinyDetails().add(cinemaDetail);
			}
		}

		return pl;
	}

}

//BigDecimal area = BigDecimal.ZERO;
//
//					if (cinema.getCinemas() != null) {
//						for (Measurement measurement : cinema.getCinemas()) {
//							if (measurement.getArea() != null) {
//								area = area.add(measurement.getArea());
//							}
//						}
//					}

					// -------- Area --------

//					Map<String, String> areaRow = new HashMap<>();
//
//					areaRow.put(RULE_NO, RULENO);
//					areaRow.put(DESCRIPTION, "Cinema " + cinemaIndex + " Area");
//					areaRow.put(FLOOR_NO, String.valueOf(floor.getNumber()));
//					areaRow.put(REQUIRED, "120 sqm");
//					areaRow.put(PROVIDED, area.setScale(2, RoundingMode.HALF_UP).toPlainString() + " sqm");
//					areaRow.put(STATUS, area.compareTo(new BigDecimal("120")) >= 0 ? Result.Accepted.getResultVal()
//							: Result.Not_Accepted.getResultVal());
//
//					cinemaDetail.getDetail().add(areaRow);
