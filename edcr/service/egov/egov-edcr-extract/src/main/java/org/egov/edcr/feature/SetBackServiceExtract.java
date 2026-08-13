package org.egov.edcr.feature;

import static org.egov.edcr.utility.DcrConstants.MORETHANONEPOLYLINEDEFINED;
import static org.egov.edcr.utility.DcrConstants.OBJECTNOTDEFINED;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.NotifiedRoad;
import org.egov.common.entity.edcr.RainWaterHarvesting;
import org.egov.common.entity.edcr.SetBack;
import org.egov.edcr.constants.DxfFileConstants;
import org.egov.edcr.entity.blackbox.MeasurementDetail;
import org.egov.edcr.entity.blackbox.PlanDetail;
import org.egov.edcr.entity.blackbox.YardDetail;
import org.egov.edcr.service.LayerNames;
import org.egov.edcr.utility.MinDistance;
import org.egov.edcr.utility.Util;
import org.kabeja.dxf.DXFDocument;
import org.kabeja.dxf.DXFLWPolyline;
import org.kabeja.dxf.helpers.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SetBackServiceExtract extends FeatureExtract {

    private static final Logger LOG = LogManager.getLogger(SetBackServiceExtract.class);
    @Autowired
    private LayerNames layerNames;
    @Autowired
    private MinDistance minDistance;

    public static String ERR_MIN_DISTANCE = "Minimum distance is not defined in layer %s";

    private enum YardType {
        FRONT, REAR, SIDE_1, SIDE_2
    }
    
    @Override
    public PlanDetail extract(PlanDetail pl) {
        extractSetBack(pl, pl.getDoc());
        return pl;
    }

    @Override
    public PlanDetail validate(PlanDetail pl) {
        return pl;
    }

    private void extractSetBack(PlanDetail pl, DXFDocument doc) {
        LOG.info("Starting set back Extract......");
        String yardName;
        // VALIDATION : CHECK NUMBER OF BLOCKS and floors. Check block height provided ?
        // Check whether level defined ? if yes, then check level height is correct
        // format ?
        // check whether for each block setback defined ?
        // side/front/front yard.. Not necessary to define level for all the side.. if
        // any one side define also.. we need to
        // consider
        // Each block combine multiple occupancies to decide the most restrictive
        // occupancy.
        // if height is more than building height in the level. if more than one level,
        // then height is mandatory from 1st level.
        // It should be greater than previous level.
        // they may or may not define yards in that case ..?? throw error ? required
        // only other than level cases.
        // if all levels not defined, then how to using building height ?
        // extract NOC Details and opening above 2.1mt etc.

//        for (Block block : pl.getBlocks()) {
//            LOG.info("Block....   " + block.getName());
//
//            // extractBasementFootPrint(doc, block);           
//
//            // based on foot prints provided, set back will be decide in general rule.
//            for (SetBack setBack : block.getSetBacks())
//                if (setBack.getLevel() < 0)
//                    extractBasementSetBacks(pl, doc, block, setBack);
//                else {
//                    yardName = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getName() + "_"
//                            + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX") + setBack.getLevel() + "_"
//                            + layerNames.getLayerName("LAYER_NAME_FRONT_YARD");
//                    setFrontYardDetails(pl, doc, setBack, yardName);
//                    yardName = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getName() + "_"
//                            + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX") + setBack.getLevel() + "_"
//                            + layerNames.getLayerName("LAYER_NAME_REAR_YARD");
//                    setRearYardDetails(pl, doc, setBack, yardName);
//                    yardName = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getName() + "_"
//                            + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX") + setBack.getLevel() + "_"
//                            + layerNames.getLayerName("LAYER_NAME_SIDE_YARD_1");
//                    setSideYard1Details(pl, doc, setBack, yardName);
//                    yardName = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getName() + "_"
//                            + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX") + setBack.getLevel() + "_"
//                            + layerNames.getLayerName("LAYER_NAME_SIDE_YARD_2");
//                    setSideYard2Details(pl, doc, yardName, setBack);
//                }
//            
//            
//        }
        
        for (Block block : pl.getBlocks()) {
          LOG.info("Block....   " + block.getName());
          
          //check for unitFa layers if available then set Flag true
          checkAndSetUnitFaFlag(pl, block);

          if (Boolean.TRUE.equals(block.getIsUnitFa())) {
              validateUnitFaSetbackLayerNames(pl, doc, block);
          }
          
          for (SetBack setBack : block.getSetBacks())
              if (setBack.getLevel() < 0)
                  extractBasementSetBacks(pl, doc, block, setBack);
              else {
            	  setFrontYardDetails(pl, doc, setBack,
			        getSetbackLayerName(block, setBack.getLevel(),
            		                layerNames.getLayerName("LAYER_NAME_FRONT_YARD")));

            		setRearYardDetails(pl, doc, setBack,
			        getSetbackLayerName(block, setBack.getLevel(),
            		                layerNames.getLayerName("LAYER_NAME_REAR_YARD")));

            		setSideYard1Details(pl, doc, setBack,
			        getSetbackLayerName(block, setBack.getLevel(),
            		                layerNames.getLayerName("LAYER_NAME_SIDE_YARD_1")));

            		setSideYard2Details(pl, doc,
			        getSetbackLayerName(block, setBack.getLevel(),
            		                layerNames.getLayerName("LAYER_NAME_SIDE_YARD_2")),
            		        setBack);
              }
          
          
      }        
        pl.sortBlockByName();
        pl.sortSetBacksByLevel();
        LOG.info("End of set back Extract......");

    }
    
    private String getSetbackLayerName(Block block, Integer level, String yardLayerName) {
        // UnitFA setback geometry is deliberately shared at plan level and must
        // therefore use the unqualified naming convention. Never fall back to a
        // BLK_x_LVL_y_* layer for UnitFA, even when such a layer exists.
        if (Boolean.TRUE.equals(block.getIsUnitFa())) {
            return yardLayerName;
        }

        String qualifiedLayerName = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getName() + "_"
                + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX") + level + "_"
                + yardLayerName;
        return qualifiedLayerName;
    }

    private void validateUnitFaSetbackLayerNames(PlanDetail pl, DXFDocument doc, Block block) {
        String[] yardLayerNames = {
                layerNames.getLayerName("LAYER_NAME_FRONT_YARD"),
                layerNames.getLayerName("LAYER_NAME_REAR_YARD"),
                layerNames.getLayerName("LAYER_NAME_SIDE_YARD_1"),
                layerNames.getLayerName("LAYER_NAME_SIDE_YARD_2")
        };

        for (String yardLayerName : yardLayerNames) {
            List<String> invalidLayers = findQualifiedUnitFaSetbackLayers(doc, block, yardLayerName);
            String errorKey = "UNITFA_SETBACK_LAYER_" + block.getName() + "_" + yardLayerName;
            if (!invalidLayers.isEmpty()) {
                pl.addError(errorKey, "Invalid UnitFA setback layer name(s) " + invalidLayers
                        + ". For UnitFA block " + block.getName() + ", use exactly " + yardLayerName + ".");
            } else if (!doc.containsDXFLayer(yardLayerName)) {
                pl.addError(errorKey, "For UnitFA block " + block.getName() + ", setback layer must be named exactly "
                        + yardLayerName + ".");
            }
        }
    }

    private List<String> findQualifiedUnitFaSetbackLayers(DXFDocument doc, Block block, String yardLayerName) {
        String blockPrefix = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getName() + "_";
        String levelPrefix = layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX");
        String qualifiedLayerRegex = "^" + java.util.regex.Pattern.quote(blockPrefix + levelPrefix)
                + "\\d+_" + java.util.regex.Pattern.quote(yardLayerName) + "$";
        List<String> layers = Util.getLayerNamesLike(doc, qualifiedLayerRegex);
        return layers == null ? Collections.<String>emptyList() : layers;
    }
    

    private void setSideYard2Details(PlanDetail pl, DXFDocument doc, String yardName, SetBack setBack) {
        processYard(pl, doc, setBack, yardName, YardType.SIDE_2);
    }

    private void setYardHeight(DXFDocument doc, String yardName, YardDetail yard) {
        String height = Util.getMtextByLayerName(doc, yardName, "");// change this api to get by using layer name and
                                                                    // text.
        if (height != null) {
            if (height.contains("="))
                height = height.split("=")[1] != null ? height.split("=")[1].replaceAll("[^\\d.]", "") : "";
            else
                height = height.replaceAll("[^\\d.]", "");

            if (!height.isEmpty())
                yard.setHeight(BigDecimal.valueOf(Double.parseDouble(height)));
        }
    }

    private YardDetail getYard(PlanDetail pl, DXFDocument doc, String yardName, Integer level) {
        YardDetail yard = new YardDetail();
        List<DXFLWPolyline> frontYardLines = Util.getPolyLinesByLayer(doc, yardName);                
        // VALIDATE WHETHER ONE SINGLE POLYLINE PRESENT.
        if (frontYardLines != null && frontYardLines.size() > 1)
            pl.addError("", edcrMessageSource.getMessage(MORETHANONEPOLYLINEDEFINED, new String[] { yardName }, null));
        else if (frontYardLines != null && !frontYardLines.isEmpty()) {
            yard.setPolyLine(frontYardLines.get(0));
            yard.setArea(Util.getPolyLineArea(yard.getPolyLine()));
            yard.setPresentInDxf(true);
            yard.setLevel(level);

        }
        return yard;

    }

        private void extractBasementSetBacks(PlanDetail pl, DXFDocument doc, Block block, SetBack setBack) {
                String bsmntYardName = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getNumber() + "_"
                                + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX") + setBack.getLevel() + "_"
                                + layerNames.getLayerName("LAYER_NAME_BSMNT_FRONT_YARD");
                setFrontYardDetails(pl, doc, setBack, bsmntYardName);
                bsmntYardName = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getNumber() + "_"
                                + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX") + setBack.getLevel() + "_"
                                + layerNames.getLayerName("LAYER_NAME_BSMNT_REAR_YARD");
                setRearYardDetails(pl, doc, setBack, bsmntYardName);
                bsmntYardName = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getNumber() + "_"
                                + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX") + setBack.getLevel() + "_"
                                + layerNames.getLayerName("LAYER_NAME_BSMNT_SIDE_YARD_1");
                setSideYard1Details(pl, doc, setBack, bsmntYardName);
                bsmntYardName = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getNumber() + "_"
                                + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX") + setBack.getLevel() + "_"
                                + layerNames.getLayerName("LAYER_NAME_BSMNT_SIDE_YARD_2");
                setSideYard2Details(pl, doc, bsmntYardName, setBack);
        }

    private void setSideYard1Details(PlanDetail pl, DXFDocument doc, SetBack setBack, String yardName) {
        processYard(pl, doc, setBack, yardName, YardType.SIDE_1);
    }

    private void yardNotDefined(PlanDetail pl, String yardName) {
        // Suppress the "not defined" error if we already rejected this yard due to bad geometry
        for (String key : pl.getErrors().keySet()) {
            if (key != null && key.contains(yardName)) {
                return; 
            }
        }
        pl.addError("", edcrMessageSource.getMessage(OBJECTNOTDEFINED, new String[] { yardName }, null));
    }
    

    private void setRearYardDetails(PlanDetail pl, DXFDocument doc, SetBack setBack, String yardName) {
        processYard(pl, doc, setBack, yardName, YardType.REAR);
    }

    private void setFrontYardDetails(PlanDetail pl, DXFDocument doc, SetBack setBack, String yardName) {
        processYard(pl, doc, setBack, yardName, YardType.FRONT);
    }

    /**
     * Extracts and validates every yard through the same pipeline. Keeping the
     * direction-specific methods as small delegates preserves all existing call
     * sites (including basement setbacks) while preventing their behaviour from
     * drifting apart.
     */
    private void processYard(PlanDetail pl, DXFDocument doc, SetBack setBack, String yardName, YardType yardType) {
        if (!doc.containsDXFLayer(yardName)) {
            return;
        }

        YardDetail yard = getYardV2(pl, doc, yardName, setBack.getLevel());
        if (yard == null || yard.getPolyLine() == null) {
            // Preserve the established validation behaviour: an existing front
            // setback layer without a valid polyline raises OBJECTNOTDEFINED.
            // Rear and side yards are optional in several rule scenarios, so
            // their absence/invalid geometry must not create this generic error.
            if (yardType == YardType.FRONT) {
                yardNotDefined(pl, yardName);
            }
            return;
        }

        // MinDistance resolves the relevant yard from SetBack, so attach it
        // before requesting the calculated distance.
        attachYard(setBack, yardType, yard);
        setMinimumDistance(pl, doc, setBack, yardName, yard);
        setYardHeight(doc, yardName, yard);
        setYardWidthAndValidateColor(pl, doc, yardName, yard);

        LOG.info("{} minimum distance for layer {} = {}", yardType, yardName, yard.getMinimumDistance());
    }

    private void attachYard(SetBack setBack, YardType yardType, YardDetail yard) {
        switch (yardType) {
        case FRONT:
            setBack.setFrontYard(yard);
            break;
        case REAR:
            setBack.setRearYard(yard);
            break;
        case SIDE_1:
            setBack.setSideYard1(yard);
            break;
        case SIDE_2:
            setBack.setSideYard2(yard);
            break;
        default:
            throw new IllegalArgumentException("Unsupported yard type: " + yardType);
        }
    }

    private void setMinimumDistance(PlanDetail pl, DXFDocument doc, SetBack setBack, String yardName,
            YardDetail yard) {
        if (isImperialDrawing(pl)) {
            List<BigDecimal> yardDistances = Util.getListOfDimensionByColourCode(pl, yardName,
                    DxfFileConstants.YARD_DIMENSION_COLOR);
            if (yardDistances.isEmpty()) {
                pl.addError(yardName + "_MIN_DISTANCE", String.format(ERR_MIN_DISTANCE, yardName));
            } else {
                yard.setMinimumDistance(Collections.min(yardDistances));
            }
            return;
        }

        yard.setMinimumDistance(
                minDistance.getYardMinDistanceV2(pl, yardName, String.valueOf(setBack.getLevel()), doc));
    }

    private boolean isImperialDrawing(PlanDetail pl) {
        if (pl.getDrawingPreference() == null
                || org.egov.infra.utils.StringUtils.isBlank(pl.getDrawingPreference().getUom())) {
            return false;
        }
        String uom = pl.getDrawingPreference().getUom();
        return DxfFileConstants.INCH_UOM.equalsIgnoreCase(uom)
                || DxfFileConstants.FEET_UOM.equalsIgnoreCase(uom);
    }

    private void setYardWidthAndValidateColor(PlanDetail pl, DXFDocument doc, String yardName, YardDetail yard) {
        List<DXFLWPolyline> yardPolylines = Util.getPolyLinesByLayer(doc, yardName);
        Util.validateLayerColor(yardName, Util.getColorByPolyLine(yardPolylines), pl);

        // A valid yard currently contains one polyline; iteration preserves the
        // established behaviour if validation rules are relaxed in the future.
        for (DXFLWPolyline yardPolyline : yardPolylines) {
            MeasurementDetail measurement = new MeasurementDetail(yardPolyline, true);
            if (measurement.getWidth() != null) {
                yard.setWidth(measurement.getWidth().setScale(2, RoundingMode.HALF_UP));
            }
        }
    }
    
    private YardDetail getYardV2(PlanDetail pl, DXFDocument doc, String yardName, Integer level) {
    	YardDetail yard = new YardDetail();
        List<DXFLWPolyline> frontYardLines = Util.getPolyLinesByLayer(doc, yardName);                
        
        // VALIDATE WHETHER ONE SINGLE POLYLINE PRESENT.
        if (frontYardLines != null && frontYardLines.size() > 1) {
            pl.addError(yardName + "_MULTIPLE", edcrMessageSource.getMessage(MORETHANONEPOLYLINEDEFINED, new String[] { yardName }, null));
        } else if (frontYardLines != null && !frontYardLines.isEmpty()) {
            DXFLWPolyline currentPolyline = frontYardLines.get(0);
            
            // =========================================================
            // CONDITION 2: DOES NOT EXCEED PLOT BOUNDARY
            // =========================================================
            if (!isContainedInPlot(pl, currentPolyline)) {
                 pl.addError(yardName + "_EXCEEDS_PLOT", yardName + " exceeds the Plot Boundary limits. It must be strictly inside the plot.");
            }

            // =========================================================
            // CONDITION 3: IS NOT INSIDE BUILDING FOOTPRINT
            // =========================================================
//            if (isInsideBuildingFootprint(pl, doc, currentPolyline, yardName)) {
//                 pl.addError(yardName + "_INSIDE_FOOTPRINT", yardName + " is drawn overlapping or strictly inside the Building Footprint. Setbacks must represent open space outside the building.");
//            }
            
            // =========================================================
            // CONDITION 4: SETBACKS DO NOT OVERLAP EACH OTHER
            // =========================================================
            isOverlappingOtherSetbacks(pl, doc, currentPolyline, yardName);

            // ALWAYS set the polyline. This allows Condition 1 (Edge-to-Edge) to execute downstream in MinDistance.java
            yard.setPolyLine(currentPolyline);
            yard.setArea(Util.getPolyLineArea(yard.getPolyLine()));
            yard.setPresentInDxf(true);
            yard.setLevel(level);
        }
        return yard;
    }

    private boolean doesPolygonOverlap(DXFLWPolyline poly1, DXFLWPolyline poly2) {
        if (poly1 == null || poly2 == null) return false;
        
        List<Point> pts1 = Util.pointsOnPolygon(poly1);
        List<Point> pts2 = Util.pointsOnPolygon(poly2);
        if (pts1 == null || pts2 == null || pts1.isEmpty() || pts2.isEmpty()) return false;

        // 1. VERTEX CHECK: Check if any corner is strictly inside the other polygon
        for (Point p : pts1) if (Util.isPointStrictlyInsidePolygon(poly2, p)) return true;
        for (Point p : pts2) if (Util.isPointStrictlyInsidePolygon(poly1, p)) return true;

        // 2. MIDPOINT CHECK: Catches collinear overlaps (sharing a wall but extending inward)
        for (int i = 0; i < pts1.size() - 1; i++) {
            Point mid = new Point((pts1.get(i).getX() + pts1.get(i+1).getX())/2, (pts1.get(i).getY() + pts1.get(i+1).getY())/2, 0.0);
            if (Util.isPointStrictlyInsidePolygon(poly2, mid)) return true;
        }
        for (int i = 0; i < pts2.size() - 1; i++) {
            Point mid = new Point((pts2.get(i).getX() + pts2.get(i+1).getX())/2, (pts2.get(i).getY() + pts2.get(i+1).getY())/2, 0.0);
            if (Util.isPointStrictlyInsidePolygon(poly1, mid)) return true;
        }

        // 3. CENTROID CHECK: Catches identically drawn overlapping shapes
        Point centroid1 = getCentroid(pts1);
        if (Util.isPointStrictlyInsidePolygon(poly2, centroid1)) return true;
        Point centroid2 = getCentroid(pts2);
        if (Util.isPointStrictlyInsidePolygon(poly1, centroid2)) return true;

        // 4. CROSSING CHECK: Check for proper edge intersection (lines crossing paths)
        for (int i = 0; i < pts1.size() - 1; i++) {
            Point p1 = pts1.get(i);
            Point p2 = pts1.get(i + 1);
            for (int j = 0; j < pts2.size() - 1; j++) {
                Point q1 = pts2.get(j);
                Point q2 = pts2.get(j + 1);
                
                if (linesProperlyIntersect(p1, p2, q1, q2)) return true;
            }
        }
        
        return false;
    }

    private Point getCentroid(List<Point> pts) {
        double x = 0, y = 0;
        int count = pts.size();
        // Don't double count the closing vertex if it's a closed loop
        if (count > 1 && Util.pointsEquals(pts.get(0), pts.get(count - 1))) {
            count--; 
        }
        for (int i = 0; i < count; i++) {
            x += pts.get(i).getX();
            y += pts.get(i).getY();
        }
        return new Point(x / count, y / count, 0.0);
    }

    private boolean linesProperlyIntersect(Point p1, Point p2, Point q1, Point q2) {
        int o1 = orientation(p1, p2, q1);
        int o2 = orientation(p1, p2, q2);
        int o3 = orientation(q1, q2, p1);
        int o4 = orientation(q1, q2, p2);

        // General crossing case: the lines strictly cross paths
        return (o1 != 0 && o2 != 0 && o3 != 0 && o4 != 0 && o1 != o2 && o3 != o4);
    }

    private int orientation(Point p, Point q, Point r) {
        double val = (q.getY() - p.getY()) * (r.getX() - q.getX()) - (q.getX() - p.getX()) * (r.getY() - q.getY());
        if (Math.abs(val) < 1e-6) return 0; // Collinear
        return (val > 0) ? 1 : 2; // 1 = Clockwise, 2 = Counterclock
    }
    
    private boolean hasAreaOverlap(DXFLWPolyline poly1, DXFLWPolyline poly2) {
        if (poly1 == null || poly2 == null) return false;
        
        List<Point> pts1 = Util.pointsOnPolygon(poly1);
        List<Point> pts2 = Util.pointsOnPolygon(poly2);
        if (pts1 == null || pts2 == null) return false;

        // 1. Check if any vertex is strictly inside the other polygon
        for (Point p : pts1) if (Util.isPointStrictlyInsidePolygon(poly2, p)) return true;
        for (Point p : pts2) if (Util.isPointStrictlyInsidePolygon(poly1, p)) return true;

        // 2. Check for proper edge intersection (lines properly crossing each other)
        for (int i = 0; i < pts1.size() - 1; i++) {
            Point p1 = pts1.get(i);
            Point p2 = pts1.get(i + 1);
            for (int j = 0; j < pts2.size() - 1; j++) {
                Point q1 = pts2.get(j);
                Point q2 = pts2.get(j + 1);
                
                if (linesProperlyIntersect(p1, p2, q1, q2)) return true;
            }
        }
        return false;
    }
    
//    private boolean linesProperlyIntersect(Point p1, Point p2, Point q1, Point q2) {
//        int o1 = orientation(p1, p2, q1);
//        int o2 = orientation(p1, p2, q2);
//        int o3 = orientation(q1, q2, p1);
//        int o4 = orientation(q1, q2, p2);
//
//        // General crossing case: the lines strictly cross paths
//        return (o1 != 0 && o2 != 0 && o3 != 0 && o4 != 0 && o1 != o2 && o3 != o4);
//    }
//
//    private int orientation(Point p, Point q, Point r) {
//        double val = (q.getY() - p.getY()) * (r.getX() - q.getX()) - (q.getX() - p.getX()) * (r.getY() - q.getY());
//        if (Math.abs(val) < 1e-6) return 0; // Collinear
//        return (val > 0) ? 1 : 2; // Clock or Counterclock
//    }
    
    /**
     * HELPER: Checks if the setback is safely inside the plot boundary
     */
    private boolean isContainedInPlot(PlanDetail pl, DXFLWPolyline yardPolyline) {
        List<DXFLWPolyline> plotBoundaries = Util.getPolyLinesByLayer(pl.getDoc(), layerNames.getLayerName("LAYER_NAME_PLOT_BOUNDARY"));
        List<DXFLWPolyline> roadWidenings = Util.getPolyLinesByLayer(pl.getDoc(), "ROAD_WIDENING");
        
        if ((plotBoundaries == null || plotBoundaries.isEmpty()) && (roadWidenings == null || roadWidenings.isEmpty())) return true; 

        List<Point> yardPts = Util.pointsOnPolygon(yardPolyline);
        
        for (Point pt : yardPts) {
            boolean isInside = false;
            if (plotBoundaries != null && !plotBoundaries.isEmpty() && (Util.isPointStrictlyInsidePolygon(plotBoundaries.get(0), pt) || Util.isPointOnPolygonBoundary(plotBoundaries.get(0), pt))) isInside = true;
            if (!isInside && roadWidenings != null && !roadWidenings.isEmpty()) {
                for(DXFLWPolyline rw : roadWidenings) {
                    if (Util.isPointStrictlyInsidePolygon(rw, pt) || Util.isPointOnPolygonBoundary(rw, pt)) { isInside = true; break; }
                }
            }
            if (!isInside) return false; // A point breached the boundaries
        }
        return true;
    }

    /**
     * HELPER: Checks if this setback overlaps the drawn areas of other setbacks
     */
//    private boolean isOverlappingOtherSetbacks(PlanDetail pl, DXFDocument doc, DXFLWPolyline currentPolyline, String currentYardName) {
//        String[] allYardLayers = {
//            layerNames.getLayerName("LAYER_NAME_FRONT_YARD"),
//            layerNames.getLayerName("LAYER_NAME_REAR_YARD"),
//            layerNames.getLayerName("LAYER_NAME_SIDE_YARD_1"),
//            layerNames.getLayerName("LAYER_NAME_SIDE_YARD_2")
//        };
//
//        List<Point> currentPts = Util.pointsOnPolygon(currentPolyline);
//
//        for (String otherLayerName : allYardLayers) {
//            // Skip checking the layer against itself
//            if (currentYardName.contains(otherLayerName)) continue;
//
//            List<DXFLWPolyline> otherYardLines = Util.getPolyLinesByLayer(doc, otherLayerName);
//            if (otherYardLines != null && !otherYardLines.isEmpty()) {
//                DXFLWPolyline otherPolyline = otherYardLines.get(0);
//                
//                for (Point pt : currentPts) {
//                    if (Util.isPointStrictlyInsidePolygon(otherPolyline, pt)) {
//                        return true; // Overlap detected!
//                    }
//                }
//            }
//        }
//        return false;
//    }
    
    /**
     * Checks if any vertex of the current setback falls strictly inside another setback's polygon.
     * Generates a highly specific error detailing exactly which two layers are colliding.
     */
    private boolean isOverlappingOtherSetbacks(PlanDetail pl, DXFDocument doc, DXFLWPolyline currentPolyline, String currentYardName) {
        String[] allYardSuffixes = {
            layerNames.getLayerName("LAYER_NAME_FRONT_YARD"), layerNames.getLayerName("LAYER_NAME_REAR_YARD"),
            layerNames.getLayerName("LAYER_NAME_SIDE_YARD_1"), layerNames.getLayerName("LAYER_NAME_SIDE_YARD_2"),
            layerNames.getLayerName("LAYER_NAME_BSMNT_FRONT_YARD"), layerNames.getLayerName("LAYER_NAME_BSMNT_REAR_YARD"),
            layerNames.getLayerName("LAYER_NAME_BSMNT_SIDE_YARD_1"), layerNames.getLayerName("LAYER_NAME_BSMNT_SIDE_YARD_2")
        };

        String prefix = "";
        for (String suffix : allYardSuffixes) {
            if (suffix != null && currentYardName.endsWith(suffix)) {
                prefix = currentYardName.substring(0, currentYardName.length() - suffix.length());
                break;
            }
        }
        if (prefix.isEmpty()) return false;

        boolean hasOverlap = false; 

        for (String otherSuffix : allYardSuffixes) {
            if (otherSuffix == null || otherSuffix.isEmpty()) continue;
            
            String otherLayerName = prefix + otherSuffix;
            if (currentYardName.equals(otherLayerName)) continue;

            String errKey = currentYardName.compareTo(otherLayerName) < 0 ? "OVERLAP_" + currentYardName + "_" + otherLayerName : "OVERLAP_" + otherLayerName + "_" + currentYardName;

            // Prevent duplicate error prints for A->B and B->A
            if (pl.getErrors().containsKey(errKey)) {
                hasOverlap = true; 
                continue; 
            }

            List<DXFLWPolyline> otherYardLines = Util.getPolyLinesByLayer(doc, otherLayerName);
            if (otherYardLines != null && !otherYardLines.isEmpty()) {
//                if (doesPolygonOverlap(currentPolyline, otherYardLines.get(0))) {
//                    pl.addError(errKey, currentYardName + " and " + otherLayerName + " intersect or overlap each other. Setbacks must not overlap.");
//                    hasOverlap = true; 
//                }
            }
        }
        return hasOverlap; 
    }
    
    private boolean isInsideBuildingFootprint(PlanDetail pl, DXFDocument doc, DXFLWPolyline currentPolyline, String currentYardName) {
        String[] allYardSuffixes = {
            layerNames.getLayerName("LAYER_NAME_FRONT_YARD"), layerNames.getLayerName("LAYER_NAME_REAR_YARD"),
            layerNames.getLayerName("LAYER_NAME_SIDE_YARD_1"), layerNames.getLayerName("LAYER_NAME_SIDE_YARD_2"),
            layerNames.getLayerName("LAYER_NAME_BSMNT_FRONT_YARD"), layerNames.getLayerName("LAYER_NAME_BSMNT_REAR_YARD"),
            layerNames.getLayerName("LAYER_NAME_BSMNT_SIDE_YARD_1"), layerNames.getLayerName("LAYER_NAME_BSMNT_SIDE_YARD_2")
        };
        
        String prefix = "";
        for (String suffix : allYardSuffixes) {
            if (suffix != null && currentYardName.endsWith(suffix)) {
                prefix = currentYardName.substring(0, currentYardName.length() - suffix.length());
                break;
            }
        }
        if (prefix.isEmpty()) return false;
        
        String fpSuffix = currentYardName.contains("BSMNT") ? layerNames.getLayerName("LAYER_NAME_BSMNT_FOOT_PRINT") : layerNames.getLayerName("LAYER_NAME_BUILDING_FOOT_PRINT");
        List<DXFLWPolyline> fpLines = Util.getPolyLinesByLayer(doc, prefix + fpSuffix);
        
        if (fpLines == null || fpLines.isEmpty()) return false;
        
        return doesPolygonOverlap(currentPolyline, fpLines.get(0));
    }
    
    private void checkAndSetUnitFaFlag(PlanDetail pl, Block block) {

        String blockPrefix = layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX") + block.getNumber();
        String unitFaKey = layerNames.getLayerName("LAYER_NAME_UNITFA");

        String unitFaRegex = "^" + blockPrefix + ".*_" + unitFaKey + "_\\d+.*$";

        List<String> unitFaLayers = Util.getLayerNamesLike(pl.getDoc(), unitFaRegex);

        block.setIsUnitFa(unitFaLayers != null && !unitFaLayers.isEmpty());
    }
    
//    private boolean isOverlappingOtherSetbacks(PlanDetail pl, DXFDocument doc, DXFLWPolyline currentPolyline, String currentYardName) {
//        String[] allYardSuffixes = {
//            layerNames.getLayerName("LAYER_NAME_FRONT_YARD"), layerNames.getLayerName("LAYER_NAME_REAR_YARD"),
//            layerNames.getLayerName("LAYER_NAME_SIDE_YARD_1"), layerNames.getLayerName("LAYER_NAME_SIDE_YARD_2"),
//            layerNames.getLayerName("LAYER_NAME_BSMNT_FRONT_YARD"), layerNames.getLayerName("LAYER_NAME_BSMNT_REAR_YARD"),
//            layerNames.getLayerName("LAYER_NAME_BSMNT_SIDE_YARD_1"), layerNames.getLayerName("LAYER_NAME_BSMNT_SIDE_YARD_2")
//        };
//
//        String prefix = "";
//        for (String suffix : allYardSuffixes) {
//            if (suffix != null && currentYardName.endsWith(suffix)) {
//                prefix = currentYardName.substring(0, currentYardName.length() - suffix.length());
//                break;
//            }
//        }
//        if (prefix.isEmpty()) return false;
//
//        boolean hasOverlap = false; 
//
//        for (String otherSuffix : allYardSuffixes) {
//            if (otherSuffix == null || otherSuffix.isEmpty()) continue;
//            
//            String otherLayerName = prefix + otherSuffix;
//            if (currentYardName.equals(otherLayerName)) continue;
//
//            // Generate a unique key so Front->Side1 and Side1->Front don't print duplicate errors
//            String errKey = currentYardName.compareTo(otherLayerName) < 0 
//                ? "OVERLAP_" + currentYardName + "_" + otherLayerName 
//                : "OVERLAP_" + otherLayerName + "_" + currentYardName;
//
//            if (pl.getErrors().containsKey(errKey)) {
//                hasOverlap = true; 
//                continue; 
//            }
//
//            List<DXFLWPolyline> otherYardLines = Util.getPolyLinesByLayer(doc, otherLayerName);
//            if (otherYardLines != null && !otherYardLines.isEmpty()) {
//                DXFLWPolyline otherPolyline = otherYardLines.get(0);
//                
//                if (hasAreaOverlap(currentPolyline, otherPolyline)) {
//                    pl.addError(errKey, currentYardName + " and " + otherLayerName + " intersect or overlap each other. Setbacks must not overlap.");
//                    hasOverlap = true; 
//                }
//            }
//        }
//        return hasOverlap; 
//    }
    
}
