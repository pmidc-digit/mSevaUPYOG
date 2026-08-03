package org.egov.edcr.feature;

import static org.egov.edcr.constants.DxfFileConstants.OCCUPANCY_A2_PARKING_WITHATTACHBATH_COLOR_CODE;
import static org.egov.edcr.constants.DxfFileConstants.OCCUPANCY_A2_PARKING_WITHDINE_COLOR_CODE;
import static org.egov.edcr.constants.DxfFileConstants.OCCUPANCY_A2_PARKING_WOATTACHBATH_COLOR_CODE;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Door;
import org.egov.common.entity.edcr.Floor;
import org.egov.common.entity.edcr.FloorUnit;
import org.egov.common.entity.edcr.Hall;
import org.egov.common.entity.edcr.Measurement;
import org.egov.edcr.constants.DxfFileConstants;
import org.egov.edcr.entity.blackbox.MeasurementDetail;
import org.egov.edcr.entity.blackbox.OccupancyDetail;
import org.egov.common.entity.edcr.Occupancy;
import org.egov.common.entity.edcr.OccupancyType;
import org.egov.common.entity.edcr.Room;
import org.egov.common.entity.edcr.RoomHeight;
import org.egov.common.entity.edcr.Toilet;
import org.egov.common.entity.edcr.TypicalFloor;
import org.egov.common.entity.edcr.Window;
import org.egov.edcr.entity.blackbox.PlanDetail;
import org.egov.edcr.service.LayerNames;
import org.egov.edcr.utility.Util;
import org.egov.edcr.utility.math.Ray;
import org.kabeja.dxf.DXFDimension;
import org.kabeja.dxf.DXFLWPolyline;
import org.kabeja.dxf.DXFVertex;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.kabeja.dxf.helpers.Point;
import org.egov.edcr.utility.math.Polygon;

@Service
public class UnitFAExtract extends FeatureExtract {

	private static final Logger LOG = LogManager.getLogger(UnitFAExtract.class);

	final Ray rayCasting = new Ray(new Point(-1.123456789, -1.987654321, 0d));

	@Autowired
	private LayerNames layerNames;

	@Override
	public PlanDetail validate(PlanDetail pl) {
		return pl;
	}

	private void specialCaseCheckForOccupancyType(DXFLWPolyline pLine, Occupancy occupancy) {
		if (pLine.getColor() == OCCUPANCY_A2_PARKING_WITHATTACHBATH_COLOR_CODE) {
			occupancy.setWithAttachedBath(true);
			occupancy.setType(OccupancyType.OCCUPANCY_A2);
		} else if (pLine.getColor() == OCCUPANCY_A2_PARKING_WOATTACHBATH_COLOR_CODE) {
			occupancy.setWithOutAttachedBath(true);
			occupancy.setType(OccupancyType.OCCUPANCY_A2);
		} else if (pLine.getColor() == OCCUPANCY_A2_PARKING_WITHDINE_COLOR_CODE) {
			occupancy.setWithDinningSpace(true);
			occupancy.setType(OccupancyType.OCCUPANCY_A2);
		}
	}

	@Override
	public PlanDetail extract(PlanDetail pl) {
		if (pl == null || pl.getBlocks() == null || pl.getBlocks().isEmpty()) {
			return pl;
		}

		if (LOG.isDebugEnabled()) {
			LOG.info("Starting Floor Units and Sub-Features Extract...");
		}

		for (Block block : pl.getBlocks()) {
			if (block.getBuilding() == null || block.getBuilding().getFloors() == null
					|| block.getBuilding().getFloors().isEmpty()) {
				continue;
			}

			outside: for (Floor floor : block.getBuilding().getFloors()) {

				// Typical floor mapping preservation
				if (block.getTypicalFloor() != null && !block.getTypicalFloor().isEmpty()) {
					for (TypicalFloor tp : block.getTypicalFloor()) {
						if (tp.getRepetitiveFloorNos().contains(floor.getNumber())) {
							for (Floor allFloors : block.getBuilding().getFloors()) {
								if (allFloors.getNumber().equals(tp.getModelFloorNo())) {
									if (allFloors.getUnits() != null)
										floor.setUnits(allFloors.getUnits());
									continue outside;
								}
							}
						}
					}
				}

				// Primary Floor Units Extraction (Includes sub-components)
				extractFloorUnits(pl, block, floor);
			}
		}

		if (LOG.isDebugEnabled()) {
			LOG.debug("End of Floor Units and Sub-Features Extract.");
		}

		return pl;
	}
	
	private void extractFloorUnits(PlanDetail pl, Block block, Floor floor) {
		String blockPrefix = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getNumber();
		String floorPrefix = layerNames.getLayerName("LAYER_NAME_FLOOR_NAME_PREFIX") + floor.getNumber();
		String unitFaKey = layerNames.getLayerName("LAYER_NAME_UNITFA");

		// Base prefix: BLK_1_FLR_1_UNITFA_
		String baseUnitPrefix = blockPrefix + "_" + floorPrefix + "_" + unitFaKey + "_";

		// Extract primary UnitFA polylines
		String unitfaLayerRegEx = baseUnitPrefix + "\\d+$";
		List<String> unitFALayers = Util.getLayerNamesLike(pl.getDoc(), unitfaLayerRegEx);
		List<DXFLWPolyline> occupancyUnits = Util.getPolyLinesByLayerV2(pl.getDoc(), unitFALayers);

		List<FloorUnit> floorUnits = new ArrayList<>();
		Map<Integer, FloorUnit> unitMap = new HashMap<>();
		Map<Integer, DXFLWPolyline> unitPolyMap = new HashMap<>();

		String layerRegEx = "BLK_\\d+_FLR_\\d+_UNITFA_\\d+";

		List<String> unitFALayers1 = Util.printLayerNamesLike(pl.getDoc(), layerRegEx);
		String globalUnitFAPattern = "^BLK_\\d+_FLR_\\d+_UNITFA_\\d+_.*$";
		LOG.info("-------------------------------------------------------");
		List<String> allUnitFALayers = Util.getLayerNamesLike(pl.getDoc(), globalUnitFAPattern);
		for (String layer : allUnitFALayers) {
		    LOG.info(layer);
		}
		LOG.info("-------------------------------------------------------");
		// STEP 1: Parent UnitFA Extraction
		for (DXFLWPolyline flrUnitPLine : occupancyUnits) {
			String layerName = flrUnitPLine.getLayerName();

			Integer unitNo;
			try {
				unitNo = Integer.parseInt(layerName.substring(layerName.lastIndexOf("_") + 1));
			} catch (Exception e) {
				LOG.error("Failed to parse unit number from layer: {}", layerName, e);
				continue;
			}

			FloorUnit floorUnit = new FloorUnit();
			floorUnit.setUnitNo(unitNo);
			floorUnit.setName(layerName);
			floorUnit.setColorCode(flrUnitPLine.getColor());

			Occupancy occupancy = new Occupancy();
			occupancy.setType(Util.findOccupancyType(flrUnitPLine));
			occupancy.setTypeHelper(Util.findOccupancyType(flrUnitPLine, pl));
			specialCaseCheckForOccupancyType(flrUnitPLine, occupancy);
			floorUnit.setOccupancy(occupancy);

			BigDecimal grossArea = Util.getPolyLineArea(flrUnitPLine);
			floorUnit.setArea(grossArea);

			unitMap.put(unitNo, floorUnit);
			unitPolyMap.put(unitNo, flrUnitPLine);
			floorUnits.add(floorUnit);
		}

		// STEP 2: Process Deductions
		extractUnitDeductions(pl, blockPrefix, floorPrefix, floorUnits, unitPolyMap);

		// STEP 3: Modularized Sub-component Extractions Directly onto FloorUnit
		for (FloorUnit unit : floorUnits) {
			extractUnitKitchens(pl, block, floor, unit);
			extractUnitRegularRooms(pl, block, floor, unit);
			extractUnitHabitationRooms(pl, block, floor, unit);
			extractUnitHalls(pl, block, floor, unit);
			extractUnitToilets(pl, block, floor, unit);
			extractUnitBathrooms(pl, block, floor, unit);
			extractUnitStoreRooms(pl, block, floor, unit);
			
			Map<String, Integer> roomOccupancyFeature = pl.getSubFeatureColorCodesMaster().get("HeightOfRoom");
	        Set<String> roomOccupancyTypes = new HashSet<>();
	        roomOccupancyTypes.addAll(roomOccupancyFeature.keySet());
			extractUnitAcRooms(pl, block, floor, unit, roomOccupancyTypes, roomOccupancyFeature);
			
			// 1. Regular Doors Extraction (unit-scoped: BLK_x_FLR_x_UNITFA_{unit}_REGULAR_ROOM_x_DOOR_x)
		    extractUnitDoors(pl, block, floor, unit);

		    // 2. Non-Habitational Doors Extraction (unit-scoped)
		    extractUnitNonHabitationalDoors(pl, block, floor, unit);

		    // 3. Regular Room Windows & Doors (unit-scoped, keyed off unit.getRegularRooms())
		    extractUnitRegularRoomWindows(pl, block, floor, unit);
		    extractUnitRegularRoomDoors(pl, block, floor, unit);

		    // 4. Habitation Room Windows & Doors (unit-scoped, keyed off unit.getHabitationRooms())
		    extractUnitHabitationRoomWindows(pl, block, floor, unit);
		    extractUnitHabitationRoomDoors(pl, block, floor, unit);

		    // 5. Unit-level Windows Extraction (unit-scoped: BLK_x_FLR_x_UNITFA_{unit}_WINDOW_x)
		    extractUnitWindows(pl, block, floor, unit);
		    
		    extractUnitLightAndVentilation(pl, block, floor, unit);
			
		}

		// STEP 4: Sort and Attach to Floor
		floorUnits.sort((u1, u2) -> Integer.compare(u1.getUnitNo() != null ? u1.getUnitNo() : 0,
				u2.getUnitNo() != null ? u2.getUnitNo() : 0));

		floor.setUnits(floorUnits);
	}
	
	// =========================================================================
			// DEDUCTIONS & SUB-COMPONENT EXTRACTION METHODS
			// =========================================================================

			private void extractUnitDeductions(PlanDetail pl, String blockPrefix, String floorPrefix,
					List<FloorUnit> floorUnits, Map<Integer, DXFLWPolyline> unitPolyMap) {
				String deductLayerName = blockPrefix + "_" + floorPrefix + "_"
						+ layerNames.getLayerName("LAYER_NAME_UNITFA_DEDUCT");
				List<DXFLWPolyline> deductPolylines = Util.getPolyLinesByLayer(pl.getDoc(), deductLayerName);

				if (!deductPolylines.isEmpty()) {
					Util.validateLayerColor(deductLayerName, Util.getColorByPolyLine(deductPolylines), pl);

					int unitIndex = 0;
					for (FloorUnit floorUnit : floorUnits) {
						unitIndex++;
						DXFLWPolyline flrUnitPLine = unitPolyMap.get(floorUnit.getUnitNo());
						if (flrUnitPLine == null)
							continue;

						Polygon polygon = Util.getPolygon(flrUnitPLine);
						BigDecimal unitDeduction = BigDecimal.ZERO;

						for (DXFLWPolyline occupancyDeduct : deductPolylines) {
							boolean contains = false;
							Iterator<?> buildingIterator = occupancyDeduct.getVertexIterator();

							while (buildingIterator.hasNext()) {
								DXFVertex dxfVertex = (DXFVertex) buildingIterator.next();
								Point point = dxfVertex.getPoint();

								if (rayCasting.contains(point, polygon)) {
									contains = true;
									BigDecimal deductArea = Util.getPolyLineArea(occupancyDeduct);

									MeasurementDetail measurement = new MeasurementDetail();
									measurement.setPolyLine(occupancyDeduct);
									measurement.setArea(deductArea);

									if (floorUnit.getDeductions() == null) {
										floorUnit.setDeductions(new ArrayList<>());
									}
									floorUnit.getDeductions().add(measurement);
									break;
								}
							}

							if (contains) {
								BigDecimal deductArea = Util.getPolyLineArea(occupancyDeduct);
								LOG.info("current deduct {} :add deduct for rest unit {} area added {}", unitDeduction,
										unitIndex, deductArea);
								unitDeduction = unitDeduction.add(deductArea);
							}
						}

						if (floorUnit.getArea() != null) {
							floorUnit.setArea(floorUnit.getArea().subtract(unitDeduction));
						}
						floorUnit.setTotalUnitDeduction(unitDeduction);
					}
				}
			}
			
			/**
			 * Generic reusable extractor for simple room-like unit sub-features.
			 */
			private void extractGenericUnitRooms(PlanDetail pl, String layerPattern,
					java.util.function.Consumer<Room> roomConsumer) {
				List<String> layers = Util.getLayerNamesLike(pl.getDoc(), layerPattern);
				if (layers == null || layers.isEmpty())
					return;

				for (String layerName : layers) {
					List<DXFLWPolyline> polylines = Util.getPolyLinesByLayer(pl.getDoc(), layerName);
					if (polylines == null || polylines.isEmpty())
						continue;

					Util.validateLayerColor(layerName, Util.getColorByPolyLine(polylines), pl);

					Room room = new Room();
					String[] parts = layerName.split("_");
					if (parts.length >= 7) {
						room.setNumber(parts[parts.length - 1]); // Extracts trailing sequence number
					}
					room.setClosed(polylines.stream().allMatch(DXFLWPolyline::isClosed));

					List<Measurement> measurements = new ArrayList<>();
					polylines.forEach(pLine -> measurements.add(new MeasurementDetail(pLine, true)));
					room.setRooms(measurements);

					roomConsumer.accept(room);
				}
			}
			
			/**
			 * Modular method to extract Kitchens for a specific FloorUnit.
			 * Layer Pattern: BLK_{block}_FLR_{floor}_UNITFA_{unit}_KITCHEN_{index}
			 */
			private void extractUnitKitchens(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
			    String kitchenLayerRegex = String.format("BLK_%s_FLR_%s_UNITFA_%s_KITCHEN_+\\d", 
			            block.getNumber(), floor.getNumber(), unit.getUnitNo());

			    List<String> kitchenLayers = Util.getLayerNamesLike(pl.getDoc(), kitchenLayerRegex);

			    if (kitchenLayers == null || kitchenLayers.isEmpty()) {
			        return;
			    }

			    for (String kitchenLayer : kitchenLayers) {
			        List<DXFLWPolyline> kitchenPolyLines = new ArrayList<>();
			        Map<Integer, List<BigDecimal>> kitchenHeightMap = new HashMap<>();

			        // Extract dimension heights mapped by color code
			        Map<Integer, List<BigDecimal>> mappedHeights = Util.extractAndMapDimensionValuesByColorCode(pl, kitchenLayer);
			        if (mappedHeights != null && !mappedHeights.isEmpty()) {
			            kitchenHeightMap.putAll(mappedHeights);
			        }

			        // 1. Residential Kitchen PolyLines
			        List<DXFLWPolyline> resKitchen = Util.getPolyLinesByLayerAndColor(pl.getDoc(), kitchenLayer, DxfFileConstants.RESIDENTIAL_KITCHEN_ROOM_COLOR, pl);
			        if (!resKitchen.isEmpty()) {
			            Util.validateLayerColor(kitchenLayer, Util.getColorByPolyLine(resKitchen), pl);
			            kitchenPolyLines.addAll(resKitchen);
			        }

			        List<DXFLWPolyline> resStore = Util.getPolyLinesByLayerAndColor(pl.getDoc(), kitchenLayer, DxfFileConstants.RESIDENTIAL_KITCHEN_STORE_ROOM_COLOR, pl);
			        if (!resStore.isEmpty()) {
			            Util.validateLayerColor(kitchenLayer, Util.getColorByPolyLine(resStore), pl);
			            kitchenPolyLines.addAll(resStore);
			        }

			        List<DXFLWPolyline> resDining = Util.getPolyLinesByLayerAndColor(pl.getDoc(), kitchenLayer, DxfFileConstants.RESIDENTIAL_KITCHEN_DINING_ROOM_COLOR, pl);
			        if (!resDining.isEmpty()) {
			            Util.validateLayerColor(kitchenLayer, Util.getColorByPolyLine(resDining), pl);
			            kitchenPolyLines.addAll(resDining);
			        }

			        // 2. Commercial Kitchen PolyLines
			        List<DXFLWPolyline> comKitchen = Util.getPolyLinesByLayerAndColor(pl.getDoc(), kitchenLayer, DxfFileConstants.COMMERCIAL_KITCHEN_ROOM_COLOR, pl);
			        if (!comKitchen.isEmpty()) {
			            Util.validateLayerColor(kitchenLayer, Util.getColorByPolyLine(comKitchen), pl);
			            kitchenPolyLines.addAll(comKitchen);
			        }

			        List<DXFLWPolyline> comStore = Util.getPolyLinesByLayerAndColor(pl.getDoc(), kitchenLayer, DxfFileConstants.COMMERCIAL_KITCHEN_STORE_ROOM_COLOR, pl);
			        if (!comStore.isEmpty()) {
			            Util.validateLayerColor(kitchenLayer, Util.getColorByPolyLine(comStore), pl);
			            kitchenPolyLines.addAll(comStore);
			        }

			        List<DXFLWPolyline> comDining = Util.getPolyLinesByLayerAndColor(pl.getDoc(), kitchenLayer, DxfFileConstants.COMMERCIAL_KITCHEN_DINING_ROOM_COLOR, pl);
			        if (!comDining.isEmpty()) {
			            Util.validateLayerColor(kitchenLayer, Util.getColorByPolyLine(comDining), pl);
			            kitchenPolyLines.addAll(comDining);
			        }

			        // 3. Process Polylines and Heights
			        if (!kitchenHeightMap.isEmpty() || !kitchenPolyLines.isEmpty()) {
			            Room kitchen = new Room();
			            
			            // Extract trailing sequence number as Room Number
			            String[] parts = kitchenLayer.split("_");
			            if (parts.length >= 7) {
			                kitchen.setNumber(parts[parts.length - 1]);
			            }
			            
			            kitchen.setClosed(kitchenPolyLines.stream().allMatch(DXFLWPolyline::isClosed));

			            List<Measurement> kitchens = new ArrayList<>();
			            List<RoomHeight> kitchenHeights = new ArrayList<>();

			            if (!kitchenPolyLines.isEmpty()) {
			                for (DXFLWPolyline kp : kitchenPolyLines) {
			                    Measurement m = new MeasurementDetail(kp, true);
			                    kitchens.add(m);

			                    // Map heights specifically to the polyline's color
			                    if (kitchenHeightMap.containsKey(m.getColorCode())) {
			                        for (BigDecimal value : kitchenHeightMap.get(m.getColorCode())) {
			                            RoomHeight roomHeight = new RoomHeight();
			                            roomHeight.setColorCode(m.getColorCode());
			                            roomHeight.setHeight(value);
			                            kitchenHeights.add(roomHeight);
			                        }
			                    }
			                }
			            } else if (!kitchenHeightMap.isEmpty()) {
			                // Fallback: If only heights exist but no polylines
			                for (Map.Entry<Integer, List<BigDecimal>> entry : kitchenHeightMap.entrySet()) {
			                    for (BigDecimal value : entry.getValue()) {
			                        RoomHeight roomHeight = new RoomHeight();
			                        roomHeight.setColorCode(entry.getKey());
			                        roomHeight.setHeight(value);
			                        kitchenHeights.add(roomHeight);
			                    }
			                }
			            }

			            kitchen.setHeights(kitchenHeights);
			            kitchen.setRooms(kitchens);

			            // 4. Attach Kitchen to Unit or Floor
			            if (unit != null) {
			                unit.setKitchen(kitchen);
			            } else {
			                floor.setKitchen(kitchen);
			            }
			        }
			    }
			}
			
			/**
			 * Layer Pattern: BLK_{block}_FLR_{floor}_UNITFA_{unit}_HABITATION_ROOM_{index}
			 */
			private void extractUnitHabitationRooms(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
				String habRoomLayerRegex = String.format("BLK_%s_FLR_%s_UNITFA_%s_HABITATION_ROOM_+\\d", block.getNumber(),
						floor.getNumber(), unit.getUnitNo());
				extractGenericUnitRooms(pl, habRoomLayerRegex, room -> {
					if (unit.getHabitationRooms() == null) {
						unit.setHabitationRooms(new ArrayList<>());
					}
					unit.getHabitationRooms().add(room);
				});
			}


			/**
			 * Layer Pattern: BLK_{block}_FLR_{floor}_UNITFA_{unit}_HALL_{index}
			 */
			private void extractUnitHalls(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
				String hallLayerRegex = String.format("BLK_%s_FLR_%s_UNITFA_%s_HALL_+\\d", block.getNumber(), floor.getNumber(),
						unit.getUnitNo());

				List<String> hallLayers = Util.getLayerNamesLike(pl.getDoc(), hallLayerRegex);

				if (!hallLayers.isEmpty()) {
					for (String layerName : hallLayers) {
						List<DXFLWPolyline> polylines = Util.getPolyLinesByLayer(pl.getDoc(), layerName);
						if (!polylines.isEmpty()) {
							Util.validateLayerColor(layerName, Util.getColorByPolyLine(polylines), pl);

							Hall hall = new Hall();
							hall.setArea(Util.getPolyLineArea(polylines.get(0)));

							if (unit.getHalls() == null) {
								unit.setHalls(new ArrayList<>());
							}
							unit.getHalls().add(hall);
						}
					}
				}
			}
			
			/**
			 * Layer Pattern: BLK_{block}_FLR_{floor}_UNITFA_{unit}_TOILET_{index}
			 */
			private void extractUnitToilets(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
				List<Toilet> toilets = new ArrayList<>();
		 
				String toiletLayerRegex = String.format("BLK_%s_FLR_%s_UNITFA_%s_TOILET_+\\d", block.getNumber(),
						floor.getNumber(), unit.getUnitNo());
				List<String> toiletLayers = Util.getLayerNamesLike(pl.getDoc(), toiletLayerRegex);
		 
				for (String toiletLayer : toiletLayers) {
					List<DXFLWPolyline> toiletPolylines = Util.getPolyLinesByLayer(pl.getDoc(), toiletLayer);
					if (!toiletPolylines.isEmpty()) {
						Util.validateLayerColor(toiletLayer, Util.getColorByPolyLine(toiletPolylines), pl);
		 
						Toilet toiletObj = new Toilet();
						List<Measurement> toiletMeasurementList = new ArrayList<>();
						toiletPolylines.forEach(p -> toiletMeasurementList.add(new MeasurementDetail(p, true)));
						toiletObj.setToilets(toiletMeasurementList);
						toilets.add(toiletObj);
					}
				}
		 
				String toiletVentilationRegex = String.format("BLK_%s_FLR_%s_UNITFA_%s_TOILET_VENTILATION_+\\d",
						block.getNumber(), floor.getNumber(), unit.getUnitNo());
				List<String> ventilationLayers = Util.getLayerNamesLike(pl.getDoc(), toiletVentilationRegex);
		 
				for (String ventilationLayer : ventilationLayers) {
					String heightText = Util.getMtextByLayerName(pl.getDoc(), ventilationLayer);
					Map<String, String> data = Util.getColorByDimensionByLayer(pl, ventilationLayer);
					if (data != null && !data.isEmpty() && data.containsKey("colorCode")) {
						Util.validateLayerColor(ventilationLayer, Integer.parseInt(data.get("colorCode")), pl);
					}
		 
					BigDecimal ventilationHeight = BigDecimal.ZERO;
					if (heightText != null && heightText.contains("=")) {
						String value = heightText.split("=")[1].trim();
						ventilationHeight = new BigDecimal(value);
					}
		 
					for (Toilet toiletObj : toilets) {
						toiletObj.setToiletVentilation(ventilationHeight);
					}
				}
		 
				if (!toilets.isEmpty()) {
					unit.setToilet(toilets);
				}
			}
			
			private void extractUnitLightAndVentilation(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
				// 1. General (unit-level) Light & Ventilation
				String generalLayerName = String.format("BLK_%s_FLR_%s_UNITFA_%s_LIGHT_VENTILATION",
						block.getNumber(), floor.getNumber(), unit.getUnitNo());
				List<DXFLWPolyline> generalPolylines = Util.getPolyLinesByLayer(pl.getDoc(), generalLayerName);
				if (!generalPolylines.isEmpty()) {
					Util.validateLayerColor(generalPolylines.get(0).getLayerName(), Util.getColorByPolyLine(generalPolylines), pl);
		 
					List<Measurement> generalMeasurements = generalPolylines.stream()
							.map(p -> new MeasurementDetail(p, true)).collect(Collectors.toList());
					unit.getLightAndVentilation().setMeasurements(generalMeasurements);
					unit.getLightAndVentilation().setHeightOrDepth(Util.getListOfDimensionValueByLayer(pl, generalLayerName));
				}
		 
				// 2. Regular Room-wise Light & Ventilation
				if (unit.getRegularRooms() != null) {
					for (Room room : unit.getRegularRooms()) {
						String regularRoomLayerName = String.format(
								"BLK_%s_FLR_%s_UNITFA_%s_REGULAR_ROOM_%s_LIGHT_VENTILATION_+\\d",
								block.getNumber(), floor.getNumber(), unit.getUnitNo(), room.getNumber());
						List<String> regularRoomLayers = Util.getLayerNamesLike(pl.getDoc(), regularRoomLayerName);
						for (String regularRoomLayer : regularRoomLayers) {
							List<DXFLWPolyline> polylines = Util.getPolyLinesByLayer(pl.getDoc(), regularRoomLayer);
							if (!polylines.isEmpty()) {
								Util.validateLayerColor(polylines.get(0).getLayerName(), Util.getColorByPolyLine(polylines), pl);
		 
								List<Measurement> measurements = polylines.stream()
										.map(p -> new MeasurementDetail(p, true)).collect(Collectors.toList());
								room.getLightAndVentilation().setMeasurements(measurements);
								room.getLightAndVentilation()
										.setHeightOrDepth(Util.getListOfDimensionValueByLayer(pl, regularRoomLayer));
							}
						}
					}
				}
		 
				// 3. Habitation Room-wise Light & Ventilation
				if (unit.getHabitationRooms() != null) {
					for (Room room : unit.getHabitationRooms()) {
						String habRoomLayerName = String.format(
								"BLK_%s_FLR_%s_UNITFA_%s_HABITATION_ROOM_%s_LIGHT_VENTILATION_+\\d",
								block.getNumber(), floor.getNumber(), unit.getUnitNo(), room.getNumber());
						List<String> habRoomLayers = Util.getLayerNamesLike(pl.getDoc(), habRoomLayerName);
						for (String habRoomLayer : habRoomLayers) {
							List<DXFLWPolyline> polylines = Util.getPolyLinesByLayer(pl.getDoc(), habRoomLayer);
							if (!polylines.isEmpty()) {
								Util.validateLayerColor(polylines.get(0).getLayerName(), Util.getColorByPolyLine(polylines), pl);
		 
								List<Measurement> measurements = polylines.stream()
										.map(p -> new MeasurementDetail(p, true)).collect(Collectors.toList());
								room.getLightAndVentilation().setMeasurements(measurements);
								room.getLightAndVentilation()
										.setHeightOrDepth(Util.getListOfDimensionValueByLayer(pl, habRoomLayer));
							}
						}
					}
				}
		 
				// 4. AC Room-wise Light & Ventilation
				if (unit.getAcRooms() != null) {
					for (Room room : unit.getAcRooms()) {
						String acRoomLayerName = String.format(
								"BLK_%s_FLR_%s_UNITFA_%s_AC_ROOM_%s_LIGHT_VENTILATION_+\\d",
								block.getNumber(), floor.getNumber(), unit.getUnitNo(), room.getNumber());
						List<String> acRoomLayers = Util.getLayerNamesLike(pl.getDoc(), acRoomLayerName);
						for (String acRoomLayer : acRoomLayers) {
							List<DXFLWPolyline> polylines = Util.getPolyLinesByLayer(pl.getDoc(), acRoomLayer);
							if (!polylines.isEmpty()) {
								Util.validateLayerColor(polylines.get(0).getLayerName(), Util.getColorByPolyLine(polylines), pl);
		 
								List<Measurement> measurements = polylines.stream()
										.map(p -> new MeasurementDetail(p, true)).collect(Collectors.toList());
								room.getLightAndVentilation().setMeasurements(measurements);
								room.getLightAndVentilation()
										.setHeightOrDepth(Util.getListOfDimensionValueByLayer(pl, acRoomLayer));
							}
						}
					}
				}
			}

			/**
			 * Layer Pattern: BLK_{block}_FLR_{floor}_UNITFA_{unit}_BATHROOM_{index}
			 */
			private void extractUnitBathrooms(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
				String bathLayerRegex = String.format("BLK_%s_FLR_%s_UNITFA_%s_BATHROOM_+\\d", block.getNumber(),
						floor.getNumber(), unit.getUnitNo());
				extractGenericUnitRooms(pl, bathLayerRegex, unit::setBathRoom);
			}

			/**
			 * Layer Pattern: BLK_{block}_FLR_{floor}_UNITFA_{unit}_STORE_ROOM_{index}
			 */
			private void extractUnitStoreRooms(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
				String storeLayerRegex = String.format("BLK_%s_FLR_%s_UNITFA_%s_STORE_ROOM_+\\d", block.getNumber(),
						floor.getNumber(), unit.getUnitNo());
				extractGenericUnitRooms(pl, storeLayerRegex, room -> {
					if (unit.getStoreRooms() == null) {
						unit.setStoreRooms(new ArrayList<>());
					}
					unit.getStoreRooms().add(room);
				});
			}
			
			/**
			 * Layer Pattern: BLK_{block}_FLR_{floor}_UNITFA_{unit}_REGULAR_ROOM_{index}
			 */
			private void extractUnitRegularRooms(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
				String regRoomLayerRegex = String.format("BLK_%s_FLR_%s_UNITFA_%s_REGULAR_ROOM_+\\d", block.getNumber(),
						floor.getNumber(), unit.getUnitNo());
				List<String> regRoomLayers = Util.getLayerNamesLike(pl.getDoc(), regRoomLayerRegex);
				if (regRoomLayers == null || regRoomLayers.isEmpty()) {
					return;
				}
				for (String layerName : regRoomLayers) {
					List<DXFLWPolyline> polylines = Util.getPolyLinesByLayer(pl.getDoc(), layerName);
					if (polylines == null || polylines.isEmpty()) {
						continue;
					}

					Util.validateLayerColor(layerName, Util.getColorByPolyLine(polylines), pl);
					Map<Integer, List<BigDecimal>> roomHeightMap = Util.extractAndMapDimensionValuesByColorCode(pl, layerName);

					Room room = new Room();
					String[] parts = layerName.split("_");
					if (parts.length >= 9) {
						room.setNumber(parts[8]);
					}

					boolean isClosed = polylines.stream().allMatch(DXFLWPolyline::isClosed);
					room.setClosed(isClosed);

					List<Measurement> measurements = new ArrayList<>();
					List<RoomHeight> roomHeights = new ArrayList<>();
					for (DXFLWPolyline pLine : polylines) {
						Measurement m = new MeasurementDetail(pLine, true);
						measurements.add(m);
						if (roomHeightMap != null && roomHeightMap.containsKey(m.getColorCode())) {
							List<BigDecimal> heights = roomHeightMap.get(m.getColorCode());
							if (heights != null) {
								for (BigDecimal val : heights) {
									RoomHeight rh = new RoomHeight();
									rh.setColorCode(m.getColorCode());
									rh.setHeight(val);
									roomHeights.add(rh);
								}
							}
						}
					}
					room.setRooms(measurements);

					if (!roomHeights.isEmpty()) {
						room.setHeights(roomHeights);
					}

					// --- Extract Mezzanine Areas at Unit Room Level ---
					if (room.getNumber() != null) {
						String mezzanineRegex = String.format("BLK_%s_FLR_%s_UNITFA_%s_REGULAR_ROOM_%s_MEZZANINE_+\\d",
								block.getNumber(), floor.getNumber(), unit.getUnitNo(), room.getNumber());
						List<String> mezzLayers = Util.getLayerNamesLike(pl.getDoc(), mezzanineRegex);
						if (mezzLayers != null && !mezzLayers.isEmpty()) {
							List<Occupancy> roomMezzanines = new ArrayList<>();
							for (String mezzLayer : mezzLayers) {
								List<DXFLWPolyline> mezzPolylines = Util.getPolyLinesByLayer(pl.getDoc(), mezzLayer);
								if (mezzPolylines != null && !mezzPolylines.isEmpty()) {
									Util.validateLayerColor(mezzLayer, Util.getColorByPolyLine(mezzPolylines), pl);
									String[] mezzParts = mezzLayer.split("_");
									String mezzanineNo = (mezzParts.length >= 11) ? mezzParts[10] : "1";
									for (DXFLWPolyline polyline : mezzPolylines) {
										OccupancyDetail occupancy = new OccupancyDetail();
										occupancy.setColorCode(polyline.getColor());
										occupancy.setMezzanineNumber(mezzanineNo);
										occupancy.setIsMezzanine(true);
										occupancy.setBuiltUpArea(Util.getPolyLineArea(polyline));
										occupancy.setTypeHelper(Util.findOccupancyType(polyline, pl));
										List<BigDecimal> heights = Util.getListOfDimensionValueByLayer(pl, mezzLayer);
										if (heights != null && !heights.isEmpty()) {
											occupancy.setHeight(Collections.max(heights));
										}
										roomMezzanines.add(occupancy);
									}
								}
							}
							room.setMezzanineAreas(roomMezzanines);
						}
					}

					if (unit.getRegularRooms() == null) {
						unit.setRegularRooms(new ArrayList<>());
					}
					unit.getRegularRooms().add(room);
				}
			}
			
			/**
			 * Modular method to extract AC Rooms for a specific FloorUnit / Floor level.
			 */
			private void extractUnitAcRooms(PlanDetail pl, Block block, Floor floor, FloorUnit unit, 
			                                Set<String> roomOccupancyTypes, Map<String, Integer> roomOccupancyFeature) {

			    String acRoomLayerName = String.format("BLK_%s_FLR_%s_UNITFA_%s_AC_ROOM_+\\d", block.getNumber(),
						floor.getNumber(), unit.getUnitNo());

			    List<String> acRoomLayers = Util.getLayerNamesLike(pl.getDoc(), acRoomLayerName);

			    if (acRoomLayers.isEmpty()) {
			        return;
			    }

			    // Validate color for first layer if polylines exist
			    List<DXFLWPolyline> firstPolyLines = Util.getPolyLinesByLayer(pl.getDoc(), acRoomLayers.get(0));
			    if (!firstPolyLines.isEmpty()) {
			        Util.validateLayerColor(acRoomLayers.get(0), Util.getColorByPolyLine(firstPolyLines), pl);
			    }

			    for (String acRoomLayer : acRoomLayers) {
			        Map<Integer, List<BigDecimal>> acRoomHeightMap = new HashMap<>();

			        // Extract dimension heights mapped by color code
			        Map<Integer, List<BigDecimal>> mappedHeights = Util.extractAndMapDimensionValuesByColorCode(pl, acRoomLayer);
			        if (mappedHeights != null && !mappedHeights.isEmpty()) {
			            acRoomHeightMap.putAll(mappedHeights);
			        }

			        List<DXFLWPolyline> acRoomPolyLines = Util.getPolyLinesByLayer(pl.getDoc(), acRoomLayer);

			        if (!acRoomHeightMap.isEmpty() || !acRoomPolyLines.isEmpty()) {
			            boolean isClosed = acRoomPolyLines.stream().allMatch(DXFLWPolyline::isClosed);

			            Room acRoom = new Room();
			            String[] roomNo = acRoomLayer.split("_");
			            if (roomNo.length == 7) {
			                acRoom.setNumber(roomNo[6]);
			            }
			            acRoom.setClosed(isClosed);

			            List<RoomHeight> acRoomHeights = new ArrayList<>();
			            if (!acRoomPolyLines.isEmpty()) {
			                List<Measurement> acRooms = new ArrayList<>();
			                
			                for (DXFLWPolyline arp : acRoomPolyLines) {
			                    Measurement m = new MeasurementDetail(arp, true);
			                    
			                    if (!acRoomHeightMap.isEmpty() && acRoomHeightMap.containsKey(m.getColorCode())) {
			                        for (BigDecimal value : acRoomHeightMap.get(m.getColorCode())) {
			                            RoomHeight roomHeight = new RoomHeight();
			                            roomHeight.setColorCode(m.getColorCode());
			                            roomHeight.setHeight(value);
			                            acRoomHeights.add(roomHeight);
			                        }
			                        acRoom.setHeights(acRoomHeights);
			                    }
			                    acRooms.add(m);
			                }

			                // Extract Mezzanine Area at AC Room level
			                String acRoomMezzLayerRegExp = String.format(layerNames.getLayerName("LAYER_NAME_MEZZANINE_AT_ACROOM"),
			                        block.getNumber(), floor.getNumber(), acRoom.getNumber(), "+\\d");
			                        
			                List<String> acRoomMezzLayers = Util.getLayerNamesLike(pl.getDoc(), acRoomMezzLayerRegExp);

			                if (!acRoomMezzLayers.isEmpty()) {
			                    List<DXFLWPolyline> mezPolyLines1 = Util.getPolyLinesByLayer(pl.getDoc(), acRoomMezzLayers.get(0));
			                    if (!mezPolyLines1.isEmpty()) {
			                        Util.validateLayerColor(acRoomMezzLayers.get(0), Util.getColorByPolyLine(mezPolyLines1), pl);
			                    }

			                    List<Occupancy> roomMezzanines = new ArrayList<>();
			                    for (String layerName : acRoomMezzLayers) {
			                        String[] array = layerName.split("_");
			                        String mezzanineNo = array.length > 8 ? array[8] : "";
			                        
			                        List<DXFLWPolyline> mezzaninePolyLines = Util.getPolyLinesByLayer(pl.getDoc(), layerName);
			                        if (!mezzaninePolyLines.isEmpty()) {
			                            for (DXFLWPolyline polyline : mezzaninePolyLines) {
			                                OccupancyDetail occupancy = new OccupancyDetail();
			                                occupancy.setColorCode(polyline.getColor());
			                                occupancy.setMezzanineNumber(mezzanineNo);
			                                occupancy.setIsMezzanine(true);
			                                occupancy.setBuiltUpArea(Util.getPolyLineArea(polyline));
			                                occupancy.setTypeHelper(Util.findOccupancyType(polyline, pl));
			                                
			                                List<BigDecimal> heights = Util.getListOfDimensionValueByLayer(pl, layerName);
			                                if (!heights.isEmpty()) {
			                                    occupancy.setHeight(Collections.max(heights));
			                                }
			                                roomMezzanines.add(occupancy);
			                            }
			                        }
			                    }
			                    acRoom.setMezzanineAreas(roomMezzanines);
			                }

			                acRoom.setRooms(acRooms);
			            }

			            // Bind to Unit if available, otherwise fallback to Floor
			            if (unit != null) {
			                unit.getAcRooms().add(acRoom);
			            } else {
			                floor.addAcRoom(acRoom);
			            }
			        }
			    }
			}
			
			/**
			 * Helper method to parse MText height string format e.g. "DOOR_HT_M=2.1"
			 */
			private BigDecimal parseDimensionHeight(String mTextValue) {
			    if (mTextValue != null && mTextValue.contains("=")) {
			        String value = mTextValue.split("=")[1].trim();
			        return new BigDecimal(value);
			    }
			    return BigDecimal.ZERO;
			}
			
			/**
			 * 1. Extract Unit Doors
			 * CHANGED: layer is unit-scoped (UNITFA_{unit}_REGULAR_ROOM_..._DOOR_..),
			 * so the extracted Door is now attached to the FloorUnit, not the Floor.
			 */
			private void extractUnitDoors(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
			    String doorLayerName = String.format("BLK_%s_FLR_%s_UNITFA_%s_REGULAR_ROOM_+\\d+_DOOR_\\d+", block.getNumber(),
						floor.getNumber(), unit.getUnitNo());
			    
			    List<String> doorLayers = Util.getLayerNamesLike(pl.getDoc(), doorLayerName);

			    if (!doorLayers.isEmpty()) {
			        for (String doorLayer : doorLayers) {
			            String doorHeightStr = Util.getMtextByLayerName(pl.getDoc(), doorLayer);

			            Map<String, String> data = Util.getColorByDimensionByLayer(pl, doorLayer);
			            if (data != null && data.containsKey("layerName") && data.containsKey("colorCode")) {
			                Util.validateLayerColor(data.get("layerName"), Integer.parseInt(data.get("colorCode")), pl);
			            }

			            List<DXFDimension> dimensionList = Util.getDimensionsByLayer(pl.getDoc(), doorLayer);
			            if (dimensionList != null && !dimensionList.isEmpty()) {
			                Door door = new Door();
			                door.setDoorHeight(parseDimensionHeight(doorHeightStr));

			                for (Object dxfEntity : dimensionList) {
			                    DXFDimension dimension = (DXFDimension) dxfEntity;
			                    List<BigDecimal> values = new ArrayList<>();
			                    Util.extractDimensionValue(pl, values, dimension, doorLayer);

			                    if (!values.isEmpty()) {
			                        for (BigDecimal minDis : values) {
			                            door.setDoorWidth(minDis);
			                        }
			                    } else {
			                        door.setDoorWidth(BigDecimal.ZERO);
			                    }
			                }
			                floor.addDoor(door);
			            }
			        }
			    }
			}
			
			/**
			 * 2. Extract Non-Habitational Doors
			 */
			/**
			 * 2. Extract Non-Habitational Doors
			 * CHANGED: layer is unit-scoped (UNITFA_{unit}_NON_HABITATIONAL_DOOR_..),
			 * so the Door is now attached to the FloorUnit, not the Floor.
			 */
			private void extractUnitNonHabitationalDoors(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
			    String nonHabitationaldoorLayer = String.format("BLK_%s_FLR_%s_UNITFA_%s_NON_HABITATIONAL_DOOR_+\\d", 
			    		block.getNumber(), floor.getNumber(), unit.getUnitNo());
			    List<String> nonHabitationaldoorLayers = Util.getLayerNamesLike(pl.getDoc(), nonHabitationaldoorLayer);
			    List<Door> doorList = new ArrayList<>();
			    if (!nonHabitationaldoorLayers.isEmpty()) {
			        for (String doorLayer : nonHabitationaldoorLayers) {
			            String doorHeightStr = Util.getMtextByLayerName(pl.getDoc(), doorLayer);
			            
			            List<DXFDimension> dimensionList = Util.getDimensionsByLayer(pl.getDoc(), doorLayer);
			            if (dimensionList != null && !dimensionList.isEmpty()) {
			                Door door = new Door();

			                Map<String, String> data = Util.getColorByDimensionByLayer(pl, doorLayer);
			                if (data != null && data.containsKey("layerName") && data.containsKey("colorCode")) {
			                    Util.validateLayerColor(data.get("layerName"), Integer.parseInt(data.get("colorCode")), pl);
			                }

			                door.setNonHabitationDoorHeight(parseDimensionHeight(doorHeightStr));

			                for (Object dxfEntity : dimensionList) {
			                    DXFDimension dimension = (DXFDimension) dxfEntity;
			                    List<BigDecimal> values = new ArrayList<>();
			                    Util.extractDimensionValue(pl, values, dimension, doorLayer);

			                    if (!values.isEmpty()) {
			                        for (BigDecimal minDis : values) {
			                            door.setNonHabitationDoorWidth(minDis);
			                        }
			                    } else {
			                        door.setNonHabitationDoorWidth(BigDecimal.ZERO);
			                    }
			                }
			                doorList.add(door);
			            }
			        }
			        unit.setNonHabitationalDoors(doorList);
			    }
			}
			
			/**
			 * 3. Extract Regular Room Windows
			 */
			/**
			 * 3. Extract Regular Room Windows
			 * CHANGED: was reading floor.getRegularRooms() (always empty since Floor
			 * never gets regular rooms set — only FloorUnit does), so this loop never
			 * actually ran. Now correctly iterates unit.getRegularRooms().
			 */
			private void extractUnitRegularRoomWindows(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
			    if (unit.getRegularRooms() == null) return;

			    for (Room room : unit.getRegularRooms()) {
			    	LOG.info("Block={}, Floor={}, Unit={}, Room={}",
			    	        block.getNumber(),
			    	        floor.getNumber(),
			    	        unit.getUnitNo(),
			    	        room.getNumber());
			    	String windowLayerName = String.format("BLK_%s_FLR_%s_UNITFA_%s_REGULAR_ROOM_%s_WINDOW_\\d+",
			    	        block.getNumber(),floor.getNumber(),unit.getUnitNo(),room.getNumber());
			        List<String> windowLayers = Util.getLayerNamesLike(pl.getDoc(), windowLayerName);

			        if (!windowLayers.isEmpty()) {
			            for (String windowLayer : windowLayers) {
			                String windowHeightStr = Util.getMtextByLayerName(pl.getDoc(), windowLayer);

			                List<DXFDimension> dimensionList = Util.getDimensionsByLayer(pl.getDoc(), windowLayer);
			                if (dimensionList != null && !dimensionList.isEmpty()) {
			                    Map<String, String> data = Util.getColorByDimensionByLayer(pl, windowLayer);
			                    if (data != null && data.containsKey("layerName") && data.containsKey("colorCode")) {
			                        Util.validateLayerColor(data.get("layerName"), Integer.parseInt(data.get("colorCode")), pl);
			                    }

			                    Window window = new Window();
			                    window.setWindowHeight(parseDimensionHeight(windowHeightStr));

			                    for (Object dxfEntity : dimensionList) {
			                        DXFDimension dimension = (DXFDimension) dxfEntity;
			                        List<BigDecimal> values = new ArrayList<>();
			                        Util.extractDimensionValue(pl, values, dimension, windowLayer);

			                        if (!values.isEmpty()) {
			                            for (BigDecimal minDis : values) {
			                                window.setWindowWidth(minDis);
			                            }
			                        } else {
			                            window.setWindowWidth(BigDecimal.ZERO);
			                        }
			                    }
			                    room.addWindow(window);
			                }
			            }
			        }
			    }
			}
			
			/**
			 * 4. Extract Regular Room Doors
			 * CHANGED: now correctly iterates unit.getRegularRooms() (see note above).
			 */
			private void extractUnitRegularRoomDoors(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
			    if (unit.getRegularRooms() == null) return;

			    for (Room room : unit.getRegularRooms()) {
			        String roomDoorLayerName = String.format("BLK_%s_FLR_%s_UNITFA_%s_REGULAR_ROOM_%s_DOOR_+\\d", 
			        		block.getNumber(),floor.getNumber(), unit.getUnitNo(),room.getNumber());

			        List<String> roomDoorLayers = Util.getLayerNamesLike(pl.getDoc(), roomDoorLayerName);

			        if (!roomDoorLayers.isEmpty()) {
			            for (String doorLayer : roomDoorLayers) {
			                String doorHeightStr = Util.getMtextByLayerName(pl.getDoc(), doorLayer);

			                List<DXFDimension> dimensionList = Util.getDimensionsByLayer(pl.getDoc(), doorLayer);
			                if (dimensionList != null && !dimensionList.isEmpty()) {
			                    Map<String, String> data = Util.getColorByDimensionByLayer(pl, doorLayer);
			                    if (data != null && data.containsKey("layerName") && data.containsKey("colorCode")) {
			                        Util.validateLayerColor(data.get("layerName"), Integer.parseInt(data.get("colorCode")), pl);
			                    }

			                    Door door = new Door();
			                    door.setDoorHeight(parseDimensionHeight(doorHeightStr));

			                    for (Object dxfEntity : dimensionList) {
			                        DXFDimension dimension = (DXFDimension) dxfEntity;
			                        List<BigDecimal> values = new ArrayList<>();
			                        Util.extractDimensionValue(pl, values, dimension, doorLayer);

			                        if (!values.isEmpty()) {
			                            for (BigDecimal minDis : values) {
			                                door.setDoorWidth(minDis);
			                            }
			                        } else {
			                            door.setDoorWidth(BigDecimal.ZERO);
			                        }
			                    }
			                    room.addDoors(door);
			                }
			            }
			        }
			    }
			}
			
			/**
			 * 5. Extract Habitation Room Windows (Added as requested)
			 */
			/**
			 * 5. Extract Habitation Room Windows
			 * CHANGED: was reading floor.getHabitationRooms() (never populated on
			 * Floor). Now correctly iterates unit.getHabitationRooms().
			 */
			private void extractUnitHabitationRoomWindows(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
			    if (unit.getHabitationRooms() == null) return;

			    for (Room room : unit.getHabitationRooms()) {
			        String windowLayerName = String.format(layerNames.getLayerName("LAYER_NAME_HABITATION_ROOM_WINDOW"),
			                block.getNumber(), floor.getNumber(), room.getNumber(), "+\\d");

			        List<String> windowLayers = Util.getLayerNamesLike(pl.getDoc(), windowLayerName);

			        if (!windowLayers.isEmpty()) {
			            for (String windowLayer : windowLayers) {
			                String windowHeightStr = Util.getMtextByLayerName(pl.getDoc(), windowLayer);

			                List<DXFDimension> dimensionList = Util.getDimensionsByLayer(pl.getDoc(), windowLayer);
			                if (dimensionList != null && !dimensionList.isEmpty()) {
			                    Map<String, String> data = Util.getColorByDimensionByLayer(pl, windowLayer);
			                    if (data != null && data.containsKey("layerName") && data.containsKey("colorCode")) {
			                        Util.validateLayerColor(data.get("layerName"), Integer.parseInt(data.get("colorCode")), pl);
			                    }

			                    Window window = new Window();
			                    window.setWindowHeight(parseDimensionHeight(windowHeightStr));

			                    for (Object dxfEntity : dimensionList) {
			                        DXFDimension dimension = (DXFDimension) dxfEntity;
			                        List<BigDecimal> values = new ArrayList<>();
			                        Util.extractDimensionValue(pl, values, dimension, windowLayer);

			                        if (!values.isEmpty()) {
			                            for (BigDecimal minDis : values) {
			                                window.setWindowWidth(minDis);
			                            }
			                        } else {
			                            window.setWindowWidth(BigDecimal.ZERO);
			                        }
			                    }
			                    room.addWindow(window);
			                }
			            }
			        }
			    }
			}
			
			/**
			 * 6. Extract Habitation Room Doors (Added as requested)
			 */
			/**
			 * 6. Extract Habitation Room Doors
			 * CHANGED: now correctly iterates unit.getHabitationRooms().
			 */
			private void extractUnitHabitationRoomDoors(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
			    if (unit.getHabitationRooms() == null) return;

			    for (Room room : unit.getHabitationRooms()) {
			        String roomDoorLayerName = String.format(layerNames.getLayerName("LAYER_NAME_HABITATION_ROOM_DOOR"),
			                block.getNumber(), floor.getNumber(), room.getNumber(), "+\\d");

			        List<String> roomDoorLayers = Util.getLayerNamesLike(pl.getDoc(), roomDoorLayerName);

			        if (!roomDoorLayers.isEmpty()) {
			            for (String doorLayer : roomDoorLayers) {
			                String doorHeightStr = Util.getMtextByLayerName(pl.getDoc(), doorLayer);

			                List<DXFDimension> dimensionList = Util.getDimensionsByLayer(pl.getDoc(), doorLayer);
			                if (dimensionList != null && !dimensionList.isEmpty()) {
			                    Map<String, String> data = Util.getColorByDimensionByLayer(pl, doorLayer);
			                    if (data != null && data.containsKey("layerName") && data.containsKey("colorCode")) {
			                        Util.validateLayerColor(data.get("layerName"), Integer.parseInt(data.get("colorCode")), pl);
			                    }

			                    Door door = new Door();
			                    door.setDoorHeight(parseDimensionHeight(doorHeightStr));

			                    for (Object dxfEntity : dimensionList) {
			                        DXFDimension dimension = (DXFDimension) dxfEntity;
			                        List<BigDecimal> values = new ArrayList<>();
			                        Util.extractDimensionValue(pl, values, dimension, doorLayer);

			                        if (!values.isEmpty()) {
			                            for (BigDecimal minDis : values) {
			                                door.setDoorWidth(minDis);
			                            }
			                        } else {
			                            door.setDoorWidth(BigDecimal.ZERO);
			                        }
			                    }
			                    room.addDoors(door);
			                }
			            }
			        }
			    }
			}
			
			/**
			 * 7. Extract Unit Windows
			 * CHANGED: layer is unit-scoped (UNITFA_{unit}_WINDOW_..), so the Window
			 * is now attached to the FloorUnit, not the Floor.
			 */
			private void extractUnitWindows(PlanDetail pl, Block block, Floor floor, FloorUnit unit) {
			    String windowLayerName = String.format("BLK_%s_FLR_%s_UNITFA_%s_WINDOW_+\\d", 
		        		block.getNumber(),floor.getNumber(), unit.getUnitNo());

			    List<String> windowLayers = Util.getLayerNamesLike(pl.getDoc(), windowLayerName);
			    List<Window> windowsList = new ArrayList<>();
			    if (!windowLayers.isEmpty()) {
			        for (String windowLayer : windowLayers) {
			            String windowHeightStr = Util.getMtextByLayerName(pl.getDoc(), windowLayer);

			            List<DXFDimension> dimensionList = Util.getDimensionsByLayer(pl.getDoc(), windowLayer);
			            if (dimensionList != null && !dimensionList.isEmpty()) {
			                Map<String, String> data = Util.getColorByDimensionByLayer(pl, windowLayer);
			                if (data != null && data.containsKey("layerName") && data.containsKey("colorCode")) {
			                    Util.validateLayerColor(data.get("layerName"), Integer.parseInt(data.get("colorCode")), pl);
			                }

			                Window window = new Window();
			                window.setWindowHeight(parseDimensionHeight(windowHeightStr));

			                for (Object dxfEntity : dimensionList) {
			                    DXFDimension dimension = (DXFDimension) dxfEntity;
			                    List<BigDecimal> values = new ArrayList<>();
			                    Util.extractDimensionValue(pl, values, dimension, windowLayer);

			                    if (!values.isEmpty()) {
			                        for (BigDecimal minDis : values) {
			                            window.setWindowWidth(minDis);
			                        }
			                    } else {
			                        window.setWindowWidth(BigDecimal.ZERO);
			                    }
			                }
			                windowsList.add(window);
			            }
			        }
			        unit.setWindows(windowsList);
			    }
			}

}