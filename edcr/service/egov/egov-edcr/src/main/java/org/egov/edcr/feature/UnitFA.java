package org.egov.edcr.feature;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Floor;
import org.egov.common.entity.edcr.FloorUnit;
import org.egov.common.entity.edcr.Occupancy;
import org.egov.common.entity.edcr.Hall;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.OccupancyTypeHelper;
import org.egov.common.entity.edcr.Plan;
import org.egov.common.entity.edcr.Result;
import org.egov.common.entity.edcr.Room;
import org.egov.common.entity.edcr.RoomHeight;
import org.egov.common.entity.edcr.ScrutinyDetail;
import org.egov.common.entity.edcr.Toilet;
import org.egov.common.entity.edcr.TypicalFloor;
import org.egov.common.entity.edcr.Door;
import org.egov.common.entity.edcr.Window;
import org.egov.edcr.utility.DcrConstants;
import org.springframework.stereotype.Service;

import static org.egov.edcr.constants.DxfFileConstants.*;

@Service
public class UnitFA extends FeatureProcess {

    private static final String RULE_NO_VAL = "4.4.4";
    private static final String FLOOR_HEADER = "Floor";
    private static final String UNIT_HEADER = "Unit Name / No";
    private static final String ITEM_HEADER = "Item/Room";
    private static final String OCCUPANCY_SUB_OCCUPANCY_HEADER = "Occupancy/Sub Occupancy";
    private static final String NO_OF_UNITS_HEADER = "No. of Units";
    private static final String UNIT_AREAS_HEADER = "Unit Areas (m\u00B2)";
    private static final String COMMON_AREA_HEADER = "Common Area";
    private static final String BUILT_UP_AREA_HEADER = "Built-up Area";
    private static final String DEDUCTION_HEADER = "Deduction";
    private static final String FLOOR_AREA_HEADER = "Floor Area";

    // Cache to hold created ScrutinyDetail tables per block during execution
    private Map<String, ScrutinyDetail> scrutinyDetailMap = new HashMap<>();

    // ------------------------------------------------------------------
    // NOTE: Configurable minimum thresholds for the newly added sub-feature
    // checks below (Hall / Toilet / Bathroom / Store Room). These are
    // reasonable placeholder values based on typical Model Building
    // Byelaws norms and are NOT sourced from an explicit clause in the
    // files reviewed. Please confirm the exact clause numbers / values
    // applicable to your rule set and adjust here — nothing else in the
    // class needs to change to update them.
    // ------------------------------------------------------------------
    private static final BigDecimal MIN_HALL_AREA = BigDecimal.valueOf(9.50);
    private static final BigDecimal MIN_BATHROOM_AREA = BigDecimal.valueOf(1.80);
    private static final BigDecimal MIN_BATHROOM_WIDTH = BigDecimal.valueOf(1.20);
    private static final BigDecimal MIN_STORE_ROOM_AREA = BigDecimal.valueOf(3.00);
    private static final BigDecimal MIN_STORE_ROOM_WIDTH = BigDecimal.valueOf(1.50);
    private static final BigDecimal MIN_TOILET_AREA = BigDecimal.valueOf(1.8);
    private static final BigDecimal MIN_TOILET_WIDTH = BigDecimal.valueOf(1.2);
    private static final BigDecimal MIN_TOILET_VENTILATION = BigDecimal.valueOf(0.3);
    private static final BigDecimal MIN_BALCONY_WIDTH = BigDecimal.valueOf(1.83);

    // Thresholds mirrored from HeightOfRoom.java's door/window/ventilation
    // logic, now applied at unit level since the layers themselves are
    // unit-scoped (UNITFA_{unit}_...).
    private static final BigDecimal MIN_DOOR_WIDTH = BigDecimal.valueOf(1.0);
    private static final BigDecimal MIN_NON_HABITATIONAL_DOOR_HEIGHT = BigDecimal.valueOf(2.0);
    private static final BigDecimal MIN_NON_HABITATIONAL_DOOR_WIDTH = BigDecimal.valueOf(0.76);
    private static final BigDecimal VENTILATION_PERCENTAGE = BigDecimal.valueOf(10);

    // Light & Ventilation percentage thresholds (mirrors the floor-level
    // Common/Regular-Room ventilation logic), applied against the unit's
    // own area at unit scope.
    private static final BigDecimal GENERAL_VENTILATION_PERCENTAGE = BigDecimal.valueOf(0.20);
    private static final BigDecimal ROOM_VENTILATION_PERCENTAGE = BigDecimal.valueOf(0.10);

    @Override
    public Plan validate(Plan pl) {
        return pl;
    }

    public Plan process(Plan pl) {
        validate(pl);
        processUnitFASummary(pl);
        if (pl != null && pl.getBlocks() != null) {
            OccupancyTypeHelper mostRestrictive = pl.getVirtualBuilding() != null
                    ? pl.getVirtualBuilding().getMostRestrictiveFarHelper()
                    : null;

            if (mostRestrictive != null && mostRestrictive.getType() != null) {
                for (Block block : pl.getBlocks()) {
                    if (block.getBuilding() != null && !block.getBuilding().getFloors().isEmpty()) {
                        
                        // Clear table map for new block processing
                        scrutinyDetailMap.clear();
                        Map<Integer, List<Integer>> typicalFloorsByModelFloor = getTypicalFloorsByModelFloor(block);
                        Set<Integer> repetitiveFloorNos = getRepetitiveFloorNos(typicalFloorsByModelFloor);

                        for (Floor floor : block.getBuilding().getFloors()) {
                            if (repetitiveFloorNos.contains(floor.getNumber())) {
                                continue;
                            }
                            if (floor.getUnits() != null && !floor.getUnits().isEmpty()) {
                                Map<String, Integer> detailCountsBeforeFloor = getDetailCounts();
                                String floorLabel = floor.getNumber().toString();
                                for (FloorUnit unit : floor.getUnits()) {
                                    String unitIdentifier = "Unit " + unit.getUnitNo();
                                    if (unit.getUnitNo() != null) {
                                        unitIdentifier = unit.getUnitNo().toString();
                                    }
                                    
                                    BigDecimal unitFaArea = BigDecimal.ZERO;
                                    if (unit.getArea() != null) {
                                        unitFaArea = unit.getArea().setScale(2, RoundingMode.HALF_UP);
                                    }

                                    // 1. Add Unit Floor Area Report Data
                                    ReportData unitFaData = new ReportData(
                                            "Block_" + block.getNumber() + "_Dwelling Unit-Area",
                                            RULE_NO_VAL,
                                            "Unit Floor Area (Dwelling Unit)",
                                            floorLabel,
                                            unitIdentifier,
                                            "Area = " + unitFaArea + DcrConstants.SQMTRS,
                                            Result.Accepted.getResultVal()
                                    );
                                    addReportDetails(pl, block, unitFaData);

                                    // 2. Extract Individual Rooms inside this Unit
                                    processRoom(unit, pl, block, unitIdentifier, floorLabel, mostRestrictive);
                                    
                                    // 3. Extract Individual Kitchens inside this Unit (Occupancy aware)
                                    processKitchen(unit, pl, block, unitIdentifier, floorLabel, mostRestrictive);

                                    // 4. Habitation Rooms inside this Unit
                                    processHabitationRoom(unit, pl, block, unitIdentifier, floorLabel, mostRestrictive);

                                    // 5. AC Rooms inside this Unit
                                    processAcRoom(unit, pl, block, unitIdentifier, floorLabel, mostRestrictive);

                                    // 6. Halls inside this Unit
                                    processHall(unit, pl, block, unitIdentifier, floorLabel);

                                    // Unit-scoped balconies
                                    processBalcony(unit, pl, block, unitIdentifier, floorLabel);

                                    // 7. Bathroom inside this Unit
                                    processBathroom(unit, pl, block, unitIdentifier, floorLabel, mostRestrictive);

                                    // 8. Store Rooms inside this Unit
                                    processStoreRoom(unit, pl, block, unitIdentifier, floorLabel, mostRestrictive);

                                    // 9. Toilets inside this Unit
                                    processToilet(unit, pl, block, unitIdentifier, floorLabel);

                                    // 10. Doors inside this Unit (moved from Floor - layer is unit-scoped)
                                    processDoors(unit, pl, block, unitIdentifier, floorLabel);

                                    // 11. Non-Habitational Doors inside this Unit (moved from Floor)
                                    processNonHabitationalDoors(unit, pl, block, unitIdentifier, floorLabel);

                                    // 12. Windows inside this Unit (moved from Floor)
                                    processWindows(unit, pl, block, unitIdentifier, floorLabel);

                                    // 13. Room-wise ventilation (Regular + Habitation rooms) inside this Unit
                                    processRoomWiseVentilation(unit, pl, block, unitIdentifier, floorLabel);

                                    // 14. General Light & Ventilation (unit-level)
                                    processGeneralVentilation(unit, pl, block, unitIdentifier, floorLabel);

                                    // 15. Room-wise Light & Ventilation (Regular + Habitation + AC rooms)
                                    processRoomWiseLightVentilation(unit, pl, block, unitIdentifier, floorLabel);
                                    
                                } // End Unit Loop
                                addTypicalFloorReportRows(floor.getNumber(), typicalFloorsByModelFloor,
                                        detailCountsBeforeFloor);
                            }
                        } // End Floor Loop
                    }
                }
            }
        }
        return pl;
    }

    public void processRoom(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo, 
            OccupancyTypeHelper occupancyType) {
        if (unit.getRegularRooms() == null || unit.getRegularRooms().isEmpty()) {
            return;
        }

        // Determine required minimum height based on occupancy type
        BigDecimal minRequiredHeight = (occupancyType != null 
                && occupancyType.getType() != null 
                && "A".equalsIgnoreCase(occupancyType.getType().getCode()))
                ? BigDecimal.valueOf(2.75) 
                : BigDecimal.valueOf(3.00);

        // Pre-calculate minimum height present across the unit as a fallback
        BigDecimal unitFallbackHeight = unit.getRegularRooms().stream()
                .filter(r -> r.getHeights() != null && !r.getHeights().isEmpty())
                .flatMap(r -> r.getHeights().stream())
                .map(RoomHeight::getHeight)
                .filter(Objects::nonNull)
                .reduce(BigDecimal::min)
                .orElse(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        // Check if at least one measurement across the unit meets the primary room area/width thresholds (9.5 m² / 2.4 m)
        boolean primaryAreaFound = false;
        for (Room room : unit.getRegularRooms()) {
            if (room.getRooms() != null) {
                for (Measurement m : room.getRooms()) {
                    if (m.getArea() != null && m.getWidth() != null) {
                        BigDecimal a = m.getArea().setScale(2, RoundingMode.HALF_UP);
                        BigDecimal w = m.getWidth().setScale(2, RoundingMode.HALF_UP);
                        if (a.compareTo(BigDecimal.valueOf(9.50)) >= 0 && w.compareTo(BigDecimal.valueOf(2.40)) >= 0) {
                            primaryAreaFound = true;
                            break;
                        }
                    }
                }
            }
        }

        int roomCount = 1;
        boolean primaryValidated = false;

        for (Room room : unit.getRegularRooms()) {
            if (room.getRooms() == null || room.getRooms().isEmpty()) {
                continue;
            }

            // Determine room height (from room heights or fallback)
            BigDecimal roomHeightVal = unitFallbackHeight;
            if (room.getHeights() != null && !room.getHeights().isEmpty()) {
                roomHeightVal = room.getHeights().stream()
                        .map(RoomHeight::getHeight)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal::min)
                        .orElse(unitFallbackHeight)
                        .setScale(2, RoundingMode.HALF_UP);
            }

            for (Measurement m : room.getRooms()) {
                if (m.getArea() == null || m.getWidth() == null) {
                    continue;
                }

                BigDecimal area = m.getArea().setScale(2, RoundingMode.HALF_UP);
                BigDecimal width = m.getWidth().setScale(2, RoundingMode.HALF_UP);

                BigDecimal minArea;
                BigDecimal minWidth;

                // Apply 9.5 m² / 2.4 m for the primary room; 7.5 m² / 2.1 m for secondary rooms
                if (!primaryValidated && (area.compareTo(BigDecimal.valueOf(9.50)) >= 0 || !primaryAreaFound)) {
                    minArea = BigDecimal.valueOf(9.50);
                    minWidth = BigDecimal.valueOf(2.40);
                    primaryValidated = true;
                } else {
                    minArea = BigDecimal.valueOf(7.50);
                    minWidth = BigDecimal.valueOf(2.10);
                }

                String roomLabel = (m.getName() != null && !m.getName().isEmpty())
                        ? m.getName()
                        : "Room " + roomCount;

                // Validation logic: Area, Width, and Height must all be satisfied
                boolean isAreaValid = area.compareTo(minArea) >= 0 && area.compareTo(BigDecimal.valueOf(46.45)) <= 0;
                boolean isWidthValid = width.compareTo(minWidth) >= 0;
                boolean isHeightValid = roomHeightVal.compareTo(minRequiredHeight) >= 0;

                boolean isAccepted = isAreaValid && isWidthValid && isHeightValid;

                // Combined Required & Provided string formats matching standard eDCR report layout
                String requiredString = String.format("Area >= %s m², Width >= %s m, Height >= %s m",
                        minArea.stripTrailingZeros().toPlainString(),
                        minWidth.stripTrailingZeros().toPlainString(),
                        minRequiredHeight.stripTrailingZeros().toPlainString());

                String providedString = String.format("Area = %s m², Width = %s m, Height = %s m",
                        area.toPlainString(),
                        width.toPlainString(),
                        roomHeightVal.toPlainString());

                ReportData roomData = new ReportData(
                        "Block_" + block.getNumber() + "_Dwelling Unit-Rooms",
                        RULE_NO_VAL,
                        "Minimum Area, Width & Height of Room",
                        floorNo,
                        unitIdentifier,
                        roomLabel,
                        requiredString,
                        providedString,
                        isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
                );

                addReportDetails(pl, block, roomData);
                roomCount++;
            }
        }
    }
    
    public void processKitchen(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo, 
            OccupancyTypeHelper occupancyType) {
        if (unit.getKitchen() == null) {
            return;
        }

        Room kitchenRoom = unit.getKitchen();
        if (kitchenRoom.getRooms() == null || kitchenRoom.getRooms().isEmpty()) {
            return;
        }

        // Determine required minimum height (Residential "A" = 2.75 m, Commercial/Other = 3.00 m)
        BigDecimal minRequiredHeight = (occupancyType != null 
                && occupancyType.getType() != null 
                && "A".equalsIgnoreCase(occupancyType.getType().getCode()))
                ? BigDecimal.valueOf(2.75) 
                : BigDecimal.valueOf(3.00);

        // Pre-calculate minimum kitchen height present
        BigDecimal kitchenHeightVal = BigDecimal.ZERO;
        if (kitchenRoom.getHeights() != null && !kitchenRoom.getHeights().isEmpty()) {
            kitchenHeightVal = kitchenRoom.getHeights().stream()
                    .map(RoomHeight::getHeight)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal::min)
                    .orElse(BigDecimal.ZERO)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        int kitchenCount = 1;
        for (Measurement k : kitchenRoom.getRooms()) {
            if (k.getArea() == null || k.getWidth() == null) {
                continue;
            }

            BigDecimal area = k.getArea().setScale(2, RoundingMode.HALF_UP);
            BigDecimal width = k.getWidth().setScale(2, RoundingMode.HALF_UP);
            
            BigDecimal minArea = BigDecimal.valueOf(5.00);
            BigDecimal minWidth = BigDecimal.valueOf(1.80);

            String kitchenLabel = (k.getName() != null && !k.getName().isEmpty())
                    ? k.getName() 
                    : "Kitchen " + kitchenCount;

            boolean isAreaValid = area.compareTo(minArea) >= 0;
            boolean isWidthValid = width.compareTo(minWidth) >= 0;
            boolean isHeightValid = kitchenHeightVal.compareTo(BigDecimal.ZERO) == 0 || kitchenHeightVal.compareTo(minRequiredHeight) >= 0;

            boolean isAccepted = isAreaValid && isWidthValid && isHeightValid;

            String requiredString = String.format("Area >= %s m², Width >= %s m, Height >= %s m",
                    minArea.stripTrailingZeros().toPlainString(),
                    minWidth.stripTrailingZeros().toPlainString(),
                    minRequiredHeight.stripTrailingZeros().toPlainString());

            String providedString = String.format("Area = %s m², Width = %s m, Height = %s m",
                    area.toPlainString(),
                    width.toPlainString(),
                    kitchenHeightVal.compareTo(BigDecimal.ZERO) > 0 ? kitchenHeightVal.toPlainString() : "N/A");

            ReportData kitchenData = new ReportData(
                    "Block_" + block.getNumber() + "_Dwelling Unit-Kitchens",
                    RULE_NO_VAL,
                    "Minimum Area, Width & Height of Kitchen",
                    floorNo,
                    unitIdentifier,
                    kitchenLabel,
                    requiredString,
                    providedString,
                    isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
            );
            addReportDetails(pl, block, kitchenData);
            kitchenCount++;
        }
    }

    /**
     * NEW: Validates Habitation Rooms captured on FloorUnit.getHabitationRooms().
     * Mirrors processRoom's area/width/height logic since a habitation room is
     * structurally the same "habitable room" requirement, just extracted onto
     * a separate list by UnitFAExtract.
     */
    public void processHabitationRoom(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo,
            OccupancyTypeHelper occupancyType) {
        if (unit.getHabitationRooms() == null || unit.getHabitationRooms().isEmpty()) {
            return;
        }

        BigDecimal minRequiredHeight = (occupancyType != null
                && occupancyType.getType() != null
                && "A".equalsIgnoreCase(occupancyType.getType().getCode()))
                ? BigDecimal.valueOf(2.75)
                : BigDecimal.valueOf(3.00);

        BigDecimal unitFallbackHeight = unit.getHabitationRooms().stream()
                .filter(r -> r.getHeights() != null && !r.getHeights().isEmpty())
                .flatMap(r -> r.getHeights().stream())
                .map(RoomHeight::getHeight)
                .filter(Objects::nonNull)
                .reduce(BigDecimal::min)
                .orElse(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        int roomCount = 1;
        for (Room room : unit.getHabitationRooms()) {
            if (room.getRooms() == null || room.getRooms().isEmpty()) {
                continue;
            }

            BigDecimal roomHeightVal = unitFallbackHeight;
            if (room.getHeights() != null && !room.getHeights().isEmpty()) {
                roomHeightVal = room.getHeights().stream()
                        .map(RoomHeight::getHeight)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal::min)
                        .orElse(unitFallbackHeight)
                        .setScale(2, RoundingMode.HALF_UP);
            }

            for (Measurement m : room.getRooms()) {
                if (m.getArea() == null || m.getWidth() == null) {
                    continue;
                }

                BigDecimal area = m.getArea().setScale(2, RoundingMode.HALF_UP);
                BigDecimal width = m.getWidth().setScale(2, RoundingMode.HALF_UP);

                BigDecimal minArea = BigDecimal.valueOf(9.50);
                BigDecimal minWidth = BigDecimal.valueOf(2.40);

                String roomLabel = (m.getName() != null && !m.getName().isEmpty())
                        ? m.getName()
                        : (room.getNumber() != null ? "Habitation Room " + room.getNumber() : "Habitation Room " + roomCount);

                boolean isAreaValid = area.compareTo(minArea) >= 0;
                boolean isWidthValid = width.compareTo(minWidth) >= 0;
                boolean isHeightValid = roomHeightVal.compareTo(minRequiredHeight) >= 0;
                boolean isAccepted = isAreaValid && isWidthValid && isHeightValid;

                String requiredString = String.format("Area >= %s m², Width >= %s m, Height >= %s m",
                        minArea.stripTrailingZeros().toPlainString(),
                        minWidth.stripTrailingZeros().toPlainString(),
                        minRequiredHeight.stripTrailingZeros().toPlainString());

                String providedString = String.format("Area = %s m², Width = %s m, Height = %s m",
                        area.toPlainString(),
                        width.toPlainString(),
                        roomHeightVal.toPlainString());

                ReportData habRoomData = new ReportData(
                        "Block_" + block.getNumber() + "_Dwelling Unit-HabitationRooms",
                        RULE_NO_VAL,
                        "Minimum Area, Width & Height of Habitation Room",
                        floorNo,
                        unitIdentifier,
                        roomLabel,
                        requiredString,
                        providedString,
                        isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
                );
                addReportDetails(pl, block, habRoomData);
                roomCount++;
            }
        }
    }

    /**
     * NEW: Validates AC Rooms captured on FloorUnit.getAcRooms().
     */
    public void processAcRoom(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo,
            OccupancyTypeHelper occupancyType) {
        if (unit.getAcRooms() == null || unit.getAcRooms().isEmpty()) {
            return;
        }

        BigDecimal minRequiredHeight = (occupancyType != null
                && occupancyType.getType() != null
                && "A".equalsIgnoreCase(occupancyType.getType().getCode()))
                ? BigDecimal.valueOf(2.75)
                : BigDecimal.valueOf(3.00);

        int roomCount = 1;
        for (Room room : unit.getAcRooms()) {
            if (room.getRooms() == null || room.getRooms().isEmpty()) {
                continue;
            }

            BigDecimal roomHeightVal = BigDecimal.ZERO;
            if (room.getHeights() != null && !room.getHeights().isEmpty()) {
                roomHeightVal = room.getHeights().stream()
                        .map(RoomHeight::getHeight)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal::min)
                        .orElse(BigDecimal.ZERO)
                        .setScale(2, RoundingMode.HALF_UP);
            }

            for (Measurement m : room.getRooms()) {
                if (m.getArea() == null || m.getWidth() == null) {
                    continue;
                }

                BigDecimal area = m.getArea().setScale(2, RoundingMode.HALF_UP);
                BigDecimal width = m.getWidth().setScale(2, RoundingMode.HALF_UP);

                BigDecimal minArea = BigDecimal.valueOf(9.50);
                BigDecimal minWidth = BigDecimal.valueOf(2.40);

                String roomLabel = (m.getName() != null && !m.getName().isEmpty())
                        ? m.getName()
                        : (room.getNumber() != null ? "AC Room " + room.getNumber() : "AC Room " + roomCount);

                boolean isAreaValid = area.compareTo(minArea) >= 0;
                boolean isWidthValid = width.compareTo(minWidth) >= 0;
                boolean isHeightValid = roomHeightVal.compareTo(BigDecimal.ZERO) == 0
                        || roomHeightVal.compareTo(minRequiredHeight) >= 0;
                boolean isAccepted = isAreaValid && isWidthValid && isHeightValid;

                String requiredString = String.format("Area >= %s m², Width >= %s m, Height >= %s m",
                        minArea.stripTrailingZeros().toPlainString(),
                        minWidth.stripTrailingZeros().toPlainString(),
                        minRequiredHeight.stripTrailingZeros().toPlainString());

                String providedString = String.format("Area = %s m², Width = %s m, Height = %s m",
                        area.toPlainString(),
                        width.toPlainString(),
                        roomHeightVal.compareTo(BigDecimal.ZERO) > 0 ? roomHeightVal.toPlainString() : "N/A");

                ReportData acRoomData = new ReportData(
                        "Block_" + block.getNumber() + "_Dwelling Unit-AcRooms",
                        RULE_NO_VAL,
                        "Minimum Area, Width & Height of AC Room",
                        floorNo,
                        unitIdentifier,
                        roomLabel,
                        requiredString,
                        providedString,
                        isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
                );
                addReportDetails(pl, block, acRoomData);
                roomCount++;
            }
        }
    }

    /**
     * NEW: Validates Halls captured on FloorUnit.getHalls().
     * Hall entity (as populated by UnitFAExtract#extractUnitHalls) currently
     * only carries area — no width/height — so only the area check applies.
     */
    public void processHall(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo) {
        if (unit.getHalls() == null || unit.getHalls().isEmpty()) {
            return;
        }

        int hallCount = 1;
        for (Hall hall : unit.getHalls()) {
            if (hall.getArea() == null) {
                continue;
            }

            BigDecimal area = hall.getArea().setScale(2, RoundingMode.HALF_UP);
            boolean isAccepted = area.compareTo(MIN_HALL_AREA) >= 0;

            String requiredString = String.format("Area >= %s m²", MIN_HALL_AREA.stripTrailingZeros().toPlainString());
            String providedString = String.format("Area = %s m²", area.toPlainString());

            ReportData hallData = new ReportData(
                    "Block_" + block.getNumber() + "_Dwelling Unit-Halls",
                    RULE_NO_VAL,
                    "Minimum Area of Hall",
                    floorNo,
                    unitIdentifier,
                    "Hall " + hallCount,
                    requiredString,
                    providedString,
                    isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
            );
            addReportDetails(pl, block, hallData);
            hallCount++;
        }
    }

    /**
     * NEW: Validates the Bathroom captured on FloorUnit.getBathRoom().
     */
    public void processBathroom(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo,
            OccupancyTypeHelper occupancyType) {
        if (unit.getBathRoom() == null || unit.getBathRoom().getRooms() == null
                || unit.getBathRoom().getRooms().isEmpty()) {
            return;
        }

        int bathCount = 1;
        for (Measurement m : unit.getBathRoom().getRooms()) {
            if (m.getArea() == null || m.getWidth() == null) {
                continue;
            }

            BigDecimal area = m.getArea().setScale(2, RoundingMode.HALF_UP);
            BigDecimal width = m.getWidth().setScale(2, RoundingMode.HALF_UP);

            boolean isAreaValid = area.compareTo(MIN_BATHROOM_AREA) >= 0;
            boolean isWidthValid = width.compareTo(MIN_BATHROOM_WIDTH) >= 0;
            boolean isAccepted = isAreaValid && isWidthValid;

            String bathLabel = (m.getName() != null && !m.getName().isEmpty()) ? m.getName() : "Bathroom " + bathCount;

            String requiredString = String.format("Area >= %s m², Width >= %s m",
                    MIN_BATHROOM_AREA.stripTrailingZeros().toPlainString(),
                    MIN_BATHROOM_WIDTH.stripTrailingZeros().toPlainString());
            String providedString = String.format("Area = %s m², Width = %s m", area.toPlainString(), width.toPlainString());

            ReportData bathData = new ReportData(
                    "Block_" + block.getNumber() + "_Dwelling Unit-Bathroom",
                    RULE_NO_VAL,
                    "Minimum Area & Width of Bathroom",
                    floorNo,
                    unitIdentifier,
                    bathLabel,
                    requiredString,
                    providedString,
                    isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
            );
            addReportDetails(pl, block, bathData);
            bathCount++;
        }
    }

    /**
     * NEW: Validates Store Rooms captured on FloorUnit.getStoreRooms().
     */
    public void processStoreRoom(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo,
            OccupancyTypeHelper occupancyType) {
        if (unit.getStoreRooms() == null || unit.getStoreRooms().isEmpty()) {
            return;
        }

        int storeCount = 1;
        for (Room room : unit.getStoreRooms()) {
            if (room.getRooms() == null || room.getRooms().isEmpty()) {
                continue;
            }

            for (Measurement m : room.getRooms()) {
                if (m.getArea() == null || m.getWidth() == null) {
                    continue;
                }

                BigDecimal area = m.getArea().setScale(2, RoundingMode.HALF_UP);
                BigDecimal width = m.getWidth().setScale(2, RoundingMode.HALF_UP);

                boolean isAreaValid = area.compareTo(MIN_STORE_ROOM_AREA) >= 0;
                boolean isWidthValid = width.compareTo(MIN_STORE_ROOM_WIDTH) >= 0;
                boolean isAccepted = isAreaValid && isWidthValid;

                String storeLabel = (m.getName() != null && !m.getName().isEmpty())
                        ? m.getName()
                        : (room.getNumber() != null ? "Store Room " + room.getNumber() : "Store Room " + storeCount);

                String requiredString = String.format("Area >= %s m², Width >= %s m",
                        MIN_STORE_ROOM_AREA.stripTrailingZeros().toPlainString(),
                        MIN_STORE_ROOM_WIDTH.stripTrailingZeros().toPlainString());
                String providedString = String.format("Area = %s m², Width = %s m", area.toPlainString(), width.toPlainString());

                ReportData storeData = new ReportData(
                        "Block_" + block.getNumber() + "_Dwelling Unit-StoreRooms",
                        RULE_NO_VAL,
                        "Minimum Area & Width of Store Room",
                        floorNo,
                        unitIdentifier,
                        storeLabel,
                        requiredString,
                        providedString,
                        isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
                );
                addReportDetails(pl, block, storeData);
                storeCount++;
            }
        }
    }

    /**
     * UPDATED: Validates Toilets captured on FloorUnit.getToilet(), now with
     * real area/width/ventilation data (mirrors the floor-level Toilet check
     * pattern), instead of a simple presence count — since
     * UnitFAExtract#extractUnitToilets now populates Toilet.getToilets()
     * (area/width) and Toilet.getToiletVentilation() (height).
     */
    public void processToilet(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo) {
        if (unit.getToilet() == null || unit.getToilet().isEmpty()) {
            return;
        }

        int toiletCount = 1;
        for (Toilet toilet : unit.getToilet()) {
            if (toilet.getToilets() == null || toilet.getToilets().isEmpty()) {
                continue;
            }

            BigDecimal ventilationHeight = toilet.getToiletVentilation() != null
                    ? toilet.getToiletVentilation().setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            for (Measurement m : toilet.getToilets()) {
                if (m.getArea() == null || m.getWidth() == null) {
                    continue;
                }

                BigDecimal area = m.getArea().setScale(2, RoundingMode.HALF_UP);
                BigDecimal width = m.getWidth().setScale(2, RoundingMode.HALF_UP);

                boolean isAreaValid = area.compareTo(MIN_TOILET_AREA) >= 0;
                boolean isWidthValid = width.compareTo(MIN_TOILET_WIDTH) >= 0;
                boolean isVentilationValid = ventilationHeight.compareTo(MIN_TOILET_VENTILATION) >= 0;
                boolean isAccepted = isAreaValid && isWidthValid && isVentilationValid;

                String toiletLabel = (m.getName() != null && !m.getName().isEmpty())
                        ? m.getName()
                        : "Toilet " + toiletCount;

                String requiredString = String.format("Area >= %s m², Width >= %s m, Ventilation >= %s m",
                        MIN_TOILET_AREA.stripTrailingZeros().toPlainString(),
                        MIN_TOILET_WIDTH.stripTrailingZeros().toPlainString(),
                        MIN_TOILET_VENTILATION.stripTrailingZeros().toPlainString());
                String providedString = String.format("Area = %s m², Width = %s m, Ventilation = %s m",
                        area.toPlainString(), width.toPlainString(), ventilationHeight.toPlainString());

                ReportData toiletData = new ReportData(
                        "Block_" + block.getNumber() + "_Dwelling Unit-Toilets",
                        RULE_NO_VAL,
                        "Minimum Area, Width & Ventilation of Toilet",
                        floorNo,
                        unitIdentifier,
                        toiletLabel,
                        requiredString,
                        providedString,
                        isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
                );
                addReportDetails(pl, block, toiletData);
                toiletCount++;
            }
        }
    }

    /**
     * NEW: Validates Doors captured on FloorUnit.getDoors().
     * Moved from Floor-level (HeightOfRoom.java) since the source layer
     * (UNITFA_{unit}_REGULAR_ROOM_{room}_DOOR_{index}) is unit-scoped.
     */
    public void processDoors(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo) {
        if (unit.getDoors() == null || unit.getDoors().isEmpty()) {
            return;
        }

        int doorCount = 1;
        for (Door door : unit.getDoors()) {
            if (door == null || door.getDoorWidth() == null) {
                continue;
            }
            BigDecimal width = door.getDoorWidth().setScale(2, RoundingMode.HALF_UP);
            boolean isAccepted = width.compareTo(MIN_DOOR_WIDTH) >= 0;

            String requiredString = "Width >= " + MIN_DOOR_WIDTH.stripTrailingZeros().toPlainString() + " m";
            String providedString = "Width = " + width.toPlainString() + " m";

            ReportData doorData = new ReportData(
                    "Block_" + block.getNumber() + "_Dwelling Unit-Doors",
                    RULE_NO_VAL,
                    "Minimum Door Width",
                    floorNo,
                    unitIdentifier,
                    "Door " + doorCount,
                    requiredString,
                    providedString,
                    isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
            );
            addReportDetails(pl, block, doorData);
            doorCount++;
        }
    }

    /**
     * NEW: Validates Non-Habitational Doors captured on FloorUnit.getNonHabitationalDoors().
     * Moved from Floor-level (HeightOfRoom.java) since the source layer
     * (UNITFA_{unit}_NON_HABITATIONAL_DOOR_{index}) is unit-scoped.
     */
    public void processNonHabitationalDoors(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo) {
        if (unit.getNonHabitationalDoors() == null || unit.getNonHabitationalDoors().isEmpty()) {
            return;
        }

        int doorCount = 1;
        for (Door door : unit.getNonHabitationalDoors()) {
            if (door == null || door.getNonHabitationDoorHeight() == null || door.getNonHabitationDoorWidth() == null) {
                continue;
            }
            BigDecimal height = door.getNonHabitationDoorHeight().setScale(2, RoundingMode.HALF_UP);
            BigDecimal width = door.getNonHabitationDoorWidth().setScale(2, RoundingMode.HALF_UP);

            boolean isAccepted = height.compareTo(MIN_NON_HABITATIONAL_DOOR_HEIGHT) >= 0
                    && width.compareTo(MIN_NON_HABITATIONAL_DOOR_WIDTH) >= 0;

            String requiredString = String.format("Height >= %s m, Width >= %s m",
                    MIN_NON_HABITATIONAL_DOOR_HEIGHT.stripTrailingZeros().toPlainString(),
                    MIN_NON_HABITATIONAL_DOOR_WIDTH.stripTrailingZeros().toPlainString());
            String providedString = String.format("Height = %s m, Width = %s m", height.toPlainString(), width.toPlainString());

            ReportData doorData = new ReportData(
                    "Block_" + block.getNumber() + "_Dwelling Unit-NonHabitationalDoors",
                    RULE_NO_VAL,
                    "Minimum Non-Habitational Door Height & Width",
                    floorNo,
                    unitIdentifier,
                    "Door " + doorCount,
                    requiredString,
                    providedString,
                    isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
            );
            addReportDetails(pl, block, doorData);
            doorCount++;
        }
    }

    /**
     * NEW: Reports Windows captured on FloorUnit.getWindows().
     * Moved from Floor-level (HeightOfRoom.java) since the source layer
     * (UNITFA_{unit}_WINDOW_{index}) is unit-scoped. HeightOfRoom.java did
     * not enforce a pass/fail threshold on these either (always Accepted) —
     * kept the same behaviour here; tighten if a real minimum is defined.
     */
    public void processWindows(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo) {
        if (unit.getWindows() == null || unit.getWindows().isEmpty()) {
            return;
        }

        int windowCount = 1;
        for (Window window : unit.getWindows()) {
            if (window == null || window.getWindowHeight() == null || window.getWindowWidth() == null) {
                continue;
            }
            BigDecimal height = window.getWindowHeight().setScale(2, RoundingMode.HALF_UP);
            BigDecimal width = window.getWindowWidth().setScale(2, RoundingMode.HALF_UP);

            String providedString = String.format("Height = %s m, Width = %s m", height.toPlainString(), width.toPlainString());

            ReportData windowData = new ReportData(
                    "Block_" + block.getNumber() + "_Dwelling Unit-Windows",
                    RULE_NO_VAL,
                    "Window",
                    floorNo,
                    unitIdentifier,
                    "Window " + windowCount,
                    providedString,
                    Result.Accepted.getResultVal()
            );
            addReportDetails(pl, block, windowData);
            windowCount++;
        }
    }

    /**
     * NEW: Room-wise ventilation check (window + door area vs 20% of room
     * area), covering both Regular Rooms and Habitation Rooms on the unit.
     * Mirrors HeightOfRoom.java's per-room ventilation logic, but now
     * correctly reads unit.getRegularRooms()/unit.getHabitationRooms()
     * (the Floor-level equivalents were never populated — see
     * UnitFAExtract.java notes on extractUnitRegularRoomWindows/Doors).
     */
    public void processRoomWiseVentilation(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo) {
        List<Room> allRooms = new ArrayList<>();
        if (unit.getRegularRooms() != null) {
            allRooms.addAll(unit.getRegularRooms());
        }
        if (unit.getHabitationRooms() != null) {
            allRooms.addAll(unit.getHabitationRooms());
        }
        if (allRooms.isEmpty()) {
            return;
        }

        for (Room room : allRooms) {
            BigDecimal roomArea = BigDecimal.ZERO;
            if (room.getRooms() != null) {
                for (Measurement m : room.getRooms()) {
                    if (m.getArea() != null) {
                        roomArea = roomArea.add(m.getArea());
                    }
                }
            }
            if (roomArea.compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }

            BigDecimal requiredVentilationArea = roomArea.multiply(VENTILATION_PERCENTAGE)
                    .divide(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);

            BigDecimal totalWindowArea = BigDecimal.ZERO;
            if (room.getWindows() != null) {
                for (Window window : room.getWindows()) {
                    if (window.getWindowHeight() != null && window.getWindowWidth() != null) {
                        totalWindowArea = totalWindowArea.add(
                                window.getWindowHeight().multiply(window.getWindowWidth()).setScale(2, RoundingMode.HALF_UP));
                    }
                }
            }

            BigDecimal totalDoorArea = BigDecimal.ZERO;
            if (room.getDoors() != null) {
                for (Door door : room.getDoors()) {
                    if (door.getDoorHeight() != null && door.getDoorWidth() != null) {
                        totalDoorArea = totalDoorArea.add(
                                door.getDoorHeight().multiply(door.getDoorWidth()).setScale(2, RoundingMode.HALF_UP));
                    }
                }
            }

            BigDecimal combinedArea = totalWindowArea.add(totalDoorArea);
            if (combinedArea.compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }

            boolean isAccepted = combinedArea.compareTo(requiredVentilationArea) >= 0;

            String requiredString = "Ventilation Area >= " + requiredVentilationArea.toPlainString() + " m²";
            String providedString = "Ventilation Area = " + combinedArea.toPlainString() + " m²";
            String roomLabel = room.getNumber() != null ? "Room " + room.getNumber() : "Room";

            ReportData ventilationData = new ReportData(
                    "Block_" + block.getNumber() + "_Dwelling Unit-RoomVentilation",
                    RULE_NO_VAL,
                    "Room Wise Ventilation (Doors and Windows)",
                    floorNo,
                    unitIdentifier,
                    roomLabel,
                    requiredString,
                    providedString,
                    isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
            );
            addReportDetails(pl, block, ventilationData);
        }
    }

    /**
     * NEW: General (unit-level) Light & Ventilation, from
     * FloorUnit.getLightAndVentilation(). Mirrors the floor-level "Common
     * Ventilation" check (HeightOfRoom/Ventilation-style class), but
     * compares against 20% of the unit's own area instead of block-wide
     * occupancy floor area, since this now runs per unit.
     */
    public void processGeneralVentilation(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo) {
        if (unit.getLightAndVentilation() == null || unit.getLightAndVentilation().getMeasurements() == null
                || unit.getLightAndVentilation().getMeasurements().isEmpty()) {
            return;
        }

        BigDecimal totalVentilationArea = unit.getLightAndVentilation().getMeasurements().stream()
                .map(Measurement::getArea)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        if (totalVentilationArea.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal unitArea = unit.getArea() != null ? unit.getArea().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal requiredVentilationArea = unitArea.multiply(GENERAL_VENTILATION_PERCENTAGE).setScale(2, RoundingMode.HALF_UP);

        boolean isAccepted = requiredVentilationArea.compareTo(BigDecimal.ZERO) > 0
                && totalVentilationArea.compareTo(requiredVentilationArea) >= 0;

        String requiredString = "Ventilation Area >= 20% of Unit Area (" + requiredVentilationArea.toPlainString() + " m²)";
        String providedString = "Ventilation Area = " + totalVentilationArea.toPlainString() + " m²";

        ReportData ventData = new ReportData(
                "Block_" + block.getNumber() + "_Dwelling Unit-GeneralVentilation",
                RULE_NO_VAL,
                "Light and Ventilation (Unit)",
                floorNo,
                unitIdentifier,
                "General",
                requiredString,
                providedString,
                isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
        );
        addReportDetails(pl, block, ventData);
    }

    /**
     * NEW: Room-wise Light & Ventilation, covering Regular, Habitation, and
     * AC rooms on the unit (extends the floor-level "Regular Room
     * Ventilation" check, which only covered Regular Rooms). Compares each
     * room's light/ventilation polyline area against 10% of the unit's own
     * area, matching the floor-level version's percentage basis.
     */
    public void processRoomWiseLightVentilation(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo) {
        List<Room> allRooms = new ArrayList<>();
        if (unit.getRegularRooms() != null) {
            allRooms.addAll(unit.getRegularRooms());
        }
        if (unit.getHabitationRooms() != null) {
            allRooms.addAll(unit.getHabitationRooms());
        }
        if (unit.getAcRooms() != null) {
            allRooms.addAll(unit.getAcRooms());
        }
        if (allRooms.isEmpty()) {
            return;
        }

        BigDecimal unitArea = unit.getArea() != null ? unit.getArea().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal requiredVentilationArea = unitArea.multiply(ROOM_VENTILATION_PERCENTAGE).setScale(2, RoundingMode.HALF_UP);

        for (Room room : allRooms) {
            if (room.getLightAndVentilation() == null || room.getLightAndVentilation().getMeasurements() == null
                    || room.getLightAndVentilation().getMeasurements().isEmpty()) {
                continue;
            }

            BigDecimal totalRoomVentilationArea = room.getLightAndVentilation().getMeasurements().stream()
                    .map(Measurement::getArea)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);

            if (totalRoomVentilationArea.compareTo(BigDecimal.ZERO) <= 0
                    || requiredVentilationArea.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            boolean isAccepted = totalRoomVentilationArea.compareTo(requiredVentilationArea) >= 0;
            String roomLabel = room.getNumber() != null ? "Room " + room.getNumber() : "Room";

            String requiredString = "Ventilation Area >= 10% of Unit Area (" + requiredVentilationArea.toPlainString() + " m²)";
            String providedString = "Ventilation Area = " + totalRoomVentilationArea.toPlainString() + " m²";

            ReportData ventData = new ReportData(
                    "Block_" + block.getNumber() + "_Dwelling Unit-RoomWiseLightVentilation",
                    RULE_NO_VAL,
                    "Room Wise Light and Ventilation",
                    floorNo,
                    unitIdentifier,
                    roomLabel,
                    requiredString,
                    providedString,
                    isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
            );
            addReportDetails(pl, block, ventData);
        }
    }

    /**
     * Builds a floor-wise UnitFA summary table with its own columns
     * (Floor / Occupancy-SubOccupancy / No. of Units / Unit Areas /
     * Common Area / Built-up Area / Deduction / Floor Area), matching the
     * reference layout. Uses a dedicated ScrutinyDetail instead of
     * ReportData/addReportDetails since the column shape here doesn't fit
     * that method's fixed 6/8-column format.
     */
    public void processUnitFASummary(Plan pl) {
        if (pl == null || pl.getBlocks() == null) {
            return;
        }

        for (Block block : pl.getBlocks()) {
            if (block.getBuilding() == null || block.getBuilding().getFloors() == null
                    || block.getBuilding().getFloors().isEmpty()) {
                continue;
            }

            ScrutinyDetail summaryDetail = new ScrutinyDetail();
            summaryDetail.setKey("Block_" + block.getNumber() + "_Dwelling Unit-Summary");
            summaryDetail.addColumnHeading(1, FLOOR_HEADER);
            summaryDetail.addColumnHeading(2, OCCUPANCY_SUB_OCCUPANCY_HEADER);
            summaryDetail.addColumnHeading(3, NO_OF_UNITS_HEADER);
            summaryDetail.addColumnHeading(4, UNIT_AREAS_HEADER);
            summaryDetail.addColumnHeading(5, COMMON_AREA_HEADER);
            summaryDetail.addColumnHeading(6, BUILT_UP_AREA_HEADER);
            summaryDetail.addColumnHeading(7, DEDUCTION_HEADER);
            summaryDetail.addColumnHeading(8, FLOOR_AREA_HEADER);

            int grandTotalUnits = 0;
            BigDecimal grandTotalCommonArea = BigDecimal.ZERO;
            BigDecimal grandTotalBuiltUpArea = BigDecimal.ZERO;
            BigDecimal grandTotalDeduction = BigDecimal.ZERO;
            BigDecimal grandTotalFloorArea = BigDecimal.ZERO;

            for (Floor floor : block.getBuilding().getFloors()) {
                if (floor.getUnits() == null || floor.getUnits().isEmpty()) {
                    continue;
                }

                BigDecimal totalUnitArea = BigDecimal.ZERO;
                BigDecimal totalDeduction = BigDecimal.ZERO;
                StringBuilder unitAreas = new StringBuilder();
                String occupancySubType = "";

                for (FloorUnit unit : floor.getUnits()) {
                    BigDecimal unitArea = unit.getArea() != null
                            ? unit.getArea().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                    totalUnitArea = totalUnitArea.add(unitArea);
                    totalDeduction = totalDeduction.add(getUnitDeduction(unit));
                    if (unitAreas.length() > 0) {
                        unitAreas.append("\n");
                    }
                    unitAreas.append("U").append(unit.getUnitNo()).append("-").append(unitArea.toPlainString());

                    if (occupancySubType.isEmpty() && unit.getOccupancy() != null
                            && unit.getOccupancy().getTypeHelper() != null
                            && unit.getOccupancy().getTypeHelper().getSubtype() != null) {
                        occupancySubType = unit.getOccupancy().getTypeHelper().getSubtype().getName();
                    }
                }

                BigDecimal builtUpArea = BigDecimal.ZERO;
                if (floor.getOccupancies() != null) {
                    for (Occupancy occ : floor.getOccupancies()) {
                        BigDecimal occBuiltUpArea = occ.getBuiltUpArea() != null ? occ.getBuiltUpArea() : BigDecimal.ZERO;
                        builtUpArea = builtUpArea.add(occBuiltUpArea);
                    }
                }
                if (builtUpArea.compareTo(BigDecimal.ZERO) == 0) {
                    builtUpArea = totalUnitArea;
                }
                builtUpArea = builtUpArea.setScale(2, RoundingMode.HALF_UP);

                BigDecimal commonArea = builtUpArea.subtract(totalUnitArea).setScale(2, RoundingMode.HALF_UP);

                BigDecimal floorArea = BigDecimal.ZERO;
                if (floor.getOccupancies() != null) {
                    for (Occupancy occ : floor.getOccupancies()) {
                        BigDecimal occFloorArea = occ.getFloorArea() != null ? occ.getFloorArea() : BigDecimal.ZERO;
                        BigDecimal occExistingFloorArea = occ.getExistingFloorArea() != null
                                ? occ.getExistingFloorArea() : BigDecimal.ZERO;

                        BigDecimal contribution = occExistingFloorArea.compareTo(BigDecimal.ZERO) > 0
                                ? occFloorArea.subtract(occExistingFloorArea)
                                : occFloorArea;
                        floorArea = floorArea.add(contribution);
                    }
                }
                // UnitFA deductions are reported separately, but the Floor Area
                // column must represent the net area after those deductions.
                // Keep the calculation at full precision and round only the
                // final value so the floor and grand totals remain consistent.
                floorArea = floorArea.subtract(totalDeduction).setScale(2, RoundingMode.HALF_UP);

                Map<String, String> details = new HashMap<>();
                details.put(FLOOR_HEADER, floor.getNumber().toString());
                details.put(OCCUPANCY_SUB_OCCUPANCY_HEADER, occupancySubType.isEmpty() ? "-" : occupancySubType);
                details.put(NO_OF_UNITS_HEADER, String.valueOf(floor.getUnits().size()));
                details.put(UNIT_AREAS_HEADER, unitAreas.toString());
                details.put(COMMON_AREA_HEADER, commonArea.toPlainString());
                details.put(BUILT_UP_AREA_HEADER, builtUpArea.toPlainString());
                details.put(DEDUCTION_HEADER, totalDeduction.setScale(2, RoundingMode.HALF_UP).toPlainString());
                details.put(FLOOR_AREA_HEADER, floorArea.toPlainString());

                summaryDetail.getDetail().add(details);

                grandTotalUnits += floor.getUnits().size();
                grandTotalCommonArea = grandTotalCommonArea.add(commonArea);
                grandTotalBuiltUpArea = grandTotalBuiltUpArea.add(builtUpArea);
                grandTotalDeduction = grandTotalDeduction.add(totalDeduction);
                grandTotalFloorArea = grandTotalFloorArea.add(floorArea);
            }

            if (!summaryDetail.getDetail().isEmpty()) {
                summaryDetail.getDetail().add(buildUnitFASummaryTotalRow(grandTotalUnits, grandTotalCommonArea,
                        grandTotalBuiltUpArea, grandTotalDeduction, grandTotalFloorArea));
                pl.getReportOutput().getScrutinyDetails().add(summaryDetail);
            }
        }
    }

    private Map<String, String> buildUnitFASummaryTotalRow(int grandTotalUnits, BigDecimal grandTotalCommonArea,
            BigDecimal grandTotalBuiltUpArea, BigDecimal grandTotalDeduction, BigDecimal grandTotalFloorArea) {
        Map<String, String> details = new HashMap<>();
        details.put(FLOOR_HEADER, "Total");
        details.put(OCCUPANCY_SUB_OCCUPANCY_HEADER, "-");
        details.put(NO_OF_UNITS_HEADER, String.valueOf(grandTotalUnits));
        details.put(UNIT_AREAS_HEADER, "-");
        details.put(COMMON_AREA_HEADER, grandTotalCommonArea.setScale(2, RoundingMode.HALF_UP).toPlainString());
        details.put(BUILT_UP_AREA_HEADER, grandTotalBuiltUpArea.setScale(2, RoundingMode.HALF_UP).toPlainString());
        details.put(DEDUCTION_HEADER, grandTotalDeduction.setScale(2, RoundingMode.HALF_UP).toPlainString());
        details.put(FLOOR_AREA_HEADER, grandTotalFloorArea.setScale(2, RoundingMode.HALF_UP).toPlainString());
        return details;
    }

    /**
     * Validates balconies extracted from UNITFA_{unit}_BALCONY_{number} layers.
     */
    public void processBalcony(FloorUnit unit, Plan pl, Block block, String unitIdentifier, String floorNo) {
        if (unit.getBalconies() == null || unit.getBalconies().isEmpty()) {
            return;
        }

        for (org.egov.common.entity.edcr.Balcony balcony : unit.getBalconies()) {
            BigDecimal area = BigDecimal.ZERO;
            if (balcony.getMeasurements() != null) {
                for (Measurement measurement : balcony.getMeasurements()) {
                    if (measurement != null && measurement.getArea() != null) {
                        area = area.add(measurement.getArea());
                    }
                }
            }

            BigDecimal minWidth = BigDecimal.ZERO;
            if (balcony.getWidths() != null && !balcony.getWidths().isEmpty()) {
                minWidth = balcony.getWidths().stream().filter(Objects::nonNull)
                        .min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
            }

            area = area.setScale(2, RoundingMode.HALF_UP);
            minWidth = minWidth.setScale(2, RoundingMode.HALF_UP);
            boolean isAccepted = minWidth.compareTo(MIN_BALCONY_WIDTH) >= 0;
            String balconyNumber = balcony.getNumber() != null ? balcony.getNumber() : "-";

            ReportData balconyData = new ReportData(
                    "Block_" + block.getNumber() + "_Dwelling Unit-Balconies",
                    "4.4.4 (iii)",
                    "Minimum Width of Balcony",
                    floorNo,
                    unitIdentifier,
                    "Balcony " + balconyNumber,
                    "Width >= " + MIN_BALCONY_WIDTH.toPlainString() + " m",
                    "Area = " + area.toPlainString() + " m², Width = " + minWidth.toPlainString() + " m",
                    isAccepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal()
            );
            addReportDetails(pl, block, balconyData);
        }
    }

    private BigDecimal getUnitDeduction(FloorUnit unit) {
        if (unit.getTotalUnitDeduction() != null) {
            return unit.getTotalUnitDeduction();
        }

        BigDecimal deduction = BigDecimal.ZERO;
        if (unit.getDeductions() != null) {
            for (Measurement measurement : unit.getDeductions()) {
                if (measurement != null && measurement.getArea() != null) {
                    deduction = deduction.add(measurement.getArea());
                }
            }
        }
        return deduction;
    }

    private Map<Integer, List<Integer>> getTypicalFloorsByModelFloor(Block block) {
        Map<Integer, List<Integer>> typicalFloorsByModelFloor = new LinkedHashMap<>();
        if (block.getTypicalFloor() == null || block.getTypicalFloor().isEmpty()) {
            return typicalFloorsByModelFloor;
        }

        for (TypicalFloor typicalFloor : block.getTypicalFloor()) {
            if (typicalFloor.getModelFloorNo() == null || typicalFloor.getRepetitiveFloorNos() == null
                    || typicalFloor.getRepetitiveFloorNos().isEmpty()) {
                continue;
            }
            typicalFloorsByModelFloor
                    .computeIfAbsent(typicalFloor.getModelFloorNo(), key -> new ArrayList<>())
                    .addAll(typicalFloor.getRepetitiveFloorNos());
        }
        return typicalFloorsByModelFloor;
    }

    private Set<Integer> getRepetitiveFloorNos(Map<Integer, List<Integer>> typicalFloorsByModelFloor) {
        Set<Integer> repetitiveFloorNos = new HashSet<>();
        for (List<Integer> floorNos : typicalFloorsByModelFloor.values()) {
            repetitiveFloorNos.addAll(floorNos);
        }
        return repetitiveFloorNos;
    }

    private Map<String, Integer> getDetailCounts() {
        Map<String, Integer> detailCounts = new HashMap<>();
        for (Map.Entry<String, ScrutinyDetail> entry : scrutinyDetailMap.entrySet()) {
            detailCounts.put(entry.getKey(), entry.getValue().getDetail().size());
        }
        return detailCounts;
    }

    private void addTypicalFloorReportRows(Integer modelFloorNo,
            Map<Integer, List<Integer>> typicalFloorsByModelFloor, Map<String, Integer> detailCountsBeforeFloor) {
        List<Integer> repetitiveFloorNos = typicalFloorsByModelFloor.get(modelFloorNo);
        if (repetitiveFloorNos == null || repetitiveFloorNos.isEmpty()) {
            return;
        }

        String typicalFloorLabel = "Typical Floor " + formatFloorRange(repetitiveFloorNos);
        for (Map.Entry<String, ScrutinyDetail> entry : scrutinyDetailMap.entrySet()) {
            ScrutinyDetail scrutinyDetail = entry.getValue();
            int startIndex = detailCountsBeforeFloor.getOrDefault(entry.getKey(), 0);
            if (scrutinyDetail.getDetail().size() <= startIndex) {
                continue;
            }

            List<Map<String, String>> definedFloorRows = scrutinyDetail.getDetail()
                    .subList(startIndex, scrutinyDetail.getDetail().size());
            Map<String, String> typicalRow = buildTypicalFloorReportRow(typicalFloorLabel, modelFloorNo,
                    definedFloorRows);
            scrutinyDetail.getDetail().add(typicalRow);
        }
    }

    private Map<String, String> buildTypicalFloorReportRow(String typicalFloorLabel, Integer modelFloorNo,
            List<Map<String, String>> definedFloorRows) {
        Map<String, String> firstRow = definedFloorRows.get(0);
        Map<String, String> typicalRow = new HashMap<>();
        typicalRow.put(RULE_NO, firstRow.getOrDefault(RULE_NO, RULE_NO_VAL));
        typicalRow.put(DESCRIPTION, firstRow.getOrDefault(DESCRIPTION, ""));
        typicalRow.put(FLOOR_HEADER, typicalFloorLabel);
        typicalRow.put(FLOOR_NO, typicalFloorLabel);
        typicalRow.put(UNIT_HEADER, "All units as Floor No. " + modelFloorNo);
        if (firstRow.containsKey(ITEM_HEADER)) {
            typicalRow.put(ITEM_HEADER, "Same as Floor No. " + modelFloorNo);
        }
        if (firstRow.containsKey(REQUIRED)) {
            typicalRow.put(REQUIRED, firstRow.getOrDefault(REQUIRED, ""));
        }
        typicalRow.put(PROVIDED, "Same as Floor No. " + modelFloorNo);
        typicalRow.put(STATUS, getTypicalFloorStatus(definedFloorRows));
        return typicalRow;
    }

    private String getTypicalFloorStatus(List<Map<String, String>> definedFloorRows) {
        for (Map<String, String> row : definedFloorRows) {
            if (Result.Not_Accepted.getResultVal().equals(row.get(STATUS))) {
                return Result.Not_Accepted.getResultVal();
            }
        }
        return Result.Accepted.getResultVal();
    }

    private String formatFloorRange(List<Integer> floorNos) {
        if (floorNos.size() == 1) {
            return floorNos.get(0).toString();
        }

        Integer minFloorNo = floorNos.get(0);
        Integer maxFloorNo = floorNos.get(0);
        for (Integer floorNo : floorNos) {
            if (floorNo < minFloorNo) {
                minFloorNo = floorNo;
            }
            if (floorNo > maxFloorNo) {
                maxFloorNo = floorNo;
            }
        }
        return minFloorNo + " to " + maxFloorNo;
    }

    /**
     * Unified method to add row entries to report output.
     * Generates or fetches ScrutinyDetail dynamically based on rule key and constructor fields.
     */
    private void addReportDetails(Plan pl, Block block, ReportData reportData) {
        String key = reportData.getRuleKey();
        ScrutinyDetail scrutinyDetail = scrutinyDetailMap.get(key);

        if (scrutinyDetail == null) {
            scrutinyDetail = new ScrutinyDetail();
            scrutinyDetail.setKey(key);

            // Check whether this report entry includes REQUIRED expectation
            if (reportData.getExpected() != null && !reportData.getExpected().isEmpty()) {
                // 8-column layout
                scrutinyDetail.addColumnHeading(1, RULE_NO);
                scrutinyDetail.addColumnHeading(2, DESCRIPTION);
                scrutinyDetail.addColumnHeading(3, FLOOR_HEADER);
                scrutinyDetail.addColumnHeading(4, UNIT_HEADER);
                scrutinyDetail.addColumnHeading(5, ITEM_HEADER);
                scrutinyDetail.addColumnHeading(6, REQUIRED);
                scrutinyDetail.addColumnHeading(7, PROVIDED);
                scrutinyDetail.addColumnHeading(8, STATUS);
            } else if (reportData.getItem() != null && !reportData.getItem().isEmpty()) {
                // 7-column layout for itemized informational checks like windows
                scrutinyDetail.addColumnHeading(1, RULE_NO);
                scrutinyDetail.addColumnHeading(2, DESCRIPTION);
                scrutinyDetail.addColumnHeading(3, FLOOR_HEADER);
                scrutinyDetail.addColumnHeading(4, UNIT_HEADER);
                scrutinyDetail.addColumnHeading(5, ITEM_HEADER);
                scrutinyDetail.addColumnHeading(6, PROVIDED);
                scrutinyDetail.addColumnHeading(7, STATUS);
            } else {
                // 6-column layout
                scrutinyDetail.addColumnHeading(1, RULE_NO);
                scrutinyDetail.addColumnHeading(2, DESCRIPTION);
                scrutinyDetail.addColumnHeading(3, FLOOR_HEADER);
                scrutinyDetail.addColumnHeading(4, UNIT_HEADER);
                scrutinyDetail.addColumnHeading(5, PROVIDED);
                scrutinyDetail.addColumnHeading(6, STATUS);
            }

            scrutinyDetailMap.put(key, scrutinyDetail);
            pl.getReportOutput().getScrutinyDetails().add(scrutinyDetail);
        }

        Map<String, String> details = new HashMap<>();
        details.put(RULE_NO, reportData.getRuleNo());
        details.put(DESCRIPTION, reportData.getRuleDesc());
        details.put(FLOOR_NO, reportData.getFloor());
        details.put(UNIT_HEADER, reportData.getUnitName());

        if (reportData.getItem() != null) {
            details.put(ITEM_HEADER, reportData.getItem());
        }
        if (reportData.getExpected() != null) {
            details.put(REQUIRED, reportData.getExpected());
        }

        details.put(PROVIDED, reportData.getProvided());
        details.put(STATUS, reportData.getStatus());

        scrutinyDetail.getDetail().add(details);
    }

    public Map<String, Date> getAmendments() {
        return new LinkedHashMap<>();
    }

    // --- Helper Data Carrier Class ---
    public static class ReportData {
        private String ruleKey;
        private String ruleNo;
        private String ruleDesc;
        private String floor;
        private String unitName;
        private String item;
        private String expected;
        private String provided;
        private String status;

        // 9-argument constructor (for detailed item checks with REQUIRED field)
        public ReportData(String ruleKey, String ruleNo, String ruleDesc, String floor, String unitName,
                          String item, String expected, String provided, String status) {
            this.ruleKey = ruleKey;
            this.ruleNo = ruleNo;
            this.ruleDesc = ruleDesc;
            this.floor = floor;
            this.unitName = unitName;
            this.item = item;
            this.expected = expected;
            this.provided = provided;
            this.status = status;
        }

        // 7-argument constructor (for general checks without REQUIRED/ITEM fields)
        public ReportData(String ruleKey, String ruleNo, String ruleDesc, String floor, String unitName,
                          String provided, String status) {
            this.ruleKey = ruleKey;
            this.ruleNo = ruleNo;
            this.ruleDesc = ruleDesc;
            this.floor = floor;
            this.unitName = unitName;
            this.provided = provided;
            this.status = status;
        }

        // 8-argument constructor (for itemized checks without REQUIRED field)
        public ReportData(String ruleKey, String ruleNo, String ruleDesc, String floor, String unitName,
                          String item, String provided, String status) {
            this.ruleKey = ruleKey;
            this.ruleNo = ruleNo;
            this.ruleDesc = ruleDesc;
            this.floor = floor;
            this.unitName = unitName;
            this.item = item;
            this.provided = provided;
            this.status = status;
        }

		public String getRuleKey() { return ruleKey; }
        public String getRuleNo() { return ruleNo; }
        public String getRuleDesc() { return ruleDesc; }
        public String getFloor() { return floor; }
        public String getUnitName() { return unitName; }
        public String getItem() { return item; }
        public String getExpected() { return expected; }
        public String getProvided() { return provided; }
        public String getStatus() { return status; }
    }
}
