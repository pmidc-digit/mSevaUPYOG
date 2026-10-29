package org.egov.edcr.feature;

import static org.egov.edcr.utility.DcrConstants.OBJECTNOTDEFINED;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.SetBack;
import org.egov.edcr.entity.blackbox.MeasurementDetail;
import org.egov.edcr.entity.blackbox.PlanDetail;
import org.egov.edcr.entity.blackbox.PlotDetail;
import org.egov.edcr.service.LayerNames;
import org.egov.edcr.utility.Util;
import org.kabeja.dxf.DXFDocument;
import org.kabeja.dxf.DXFLWPolyline;
import org.kabeja.dxf.helpers.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PlotFrontageExtract extends FeatureExtract{
	private static final Logger LOG = LogManager.getLogger(PlotFrontageExtract.class);
	
	private static final double EPS = 1e-6;
	
	@Autowired
	private LayerNames layerNames;
	
	@Override
	public PlanDetail extract(PlanDetail pl) {	
		validate(pl);
		List<DXFLWPolyline> plotFrontage = Util.getPolyLinesByLayer(pl.getDoc(),
				"PLOT_FRONTAGE");		
		if (!plotFrontage.isEmpty()) {
			List<Measurement> plotFrontMeasurementList = new ArrayList<>();
			plotFrontage.forEach(m -> {
                Measurement m1 = new MeasurementDetail(m, true);
                plotFrontMeasurementList.add(m1);
            });
            
			pl.setPlotFrontageList(plotFrontMeasurementList);
		} else {
			pl.setPlotFrontageList(Collections.emptyList());			
		}
		
		return pl;
	}

	@Override
	public PlanDetail validate(PlanDetail pl) {

	    validatePlotFrontageLocation(pl, pl.getDoc());

	    return pl;
	}
	
	private void validatePlotFrontageLocation(PlanDetail pl, DXFDocument doc) {

	    LOG.info("Validating Plot Frontage...");

	    List<DXFLWPolyline> frontageLines = Util.getPolyLinesByLayer(doc, "PLOT_FRONTAGE");

	    if (frontageLines == null || frontageLines.isEmpty()) {
	        return;
	    }

	    DXFLWPolyline frontage = frontageLines.get(0);

	    // ----------------------------------------------------
	    // Plot Boundary
	    // ----------------------------------------------------

	    List<DXFLWPolyline> plotBoundaries = Util.getPolyLinesByLayer(
	            doc,
	            layerNames.getLayerName("LAYER_NAME_PLOT_BOUNDARY"));

	    boolean touchingPlotBoundary = false;

	    if (plotBoundaries != null && !plotBoundaries.isEmpty()) {
	        touchingPlotBoundary = isTouchingOrOverlapping(frontage, plotBoundaries.get(0));
	    }

	    if (!touchingPlotBoundary) {
	        pl.addError("PLOT_FRONTAGE_PLOT",
	                "PLOT_FRONTAGE must touch the Plot Boundary.");
	    }

	    // ----------------------------------------------------
	    // Road Reserve Front
	    // ----------------------------------------------------

	    List<DXFLWPolyline> roadReserve =
	            Util.getPolyLinesByLayer(doc, "ROAD_RESERVE_FRONT");

	    boolean touchingRoadReserve = roadReserve == null || roadReserve.isEmpty();

	    if (roadReserve != null && !roadReserve.isEmpty()) {
	        touchingRoadReserve =
	                isTouchingOrOverlapping(frontage, roadReserve.get(0));
	    }

	    if (!touchingRoadReserve) {
	        pl.addError("PLOT_FRONTAGE_ROAD",
	                "PLOT_FRONTAGE must touch the Front Road Reserve.");
	    }

	    // ----------------------------------------------------
	    // Validate against every Block & Level
	    // ----------------------------------------------------

	    for (Block block : pl.getBlocks()) {

	        for (SetBack setBack : block.getSetBacks()) {

	            String prefix =
	                    layerNames.getLayerName("LAYER_NAME_BLOCK_NAME_PREFIX")
	                    + block.getName() + "_"
	                    + layerNames.getLayerName("LAYER_NAME_LEVEL_NAME_PREFIX")
	                    + setBack.getLevel() + "_";

	            String frontLayer =
	                    prefix + layerNames.getLayerName("LAYER_NAME_FRONT_YARD");

	            String rearLayer =
	                    prefix + layerNames.getLayerName("LAYER_NAME_REAR_YARD");

	            String side1Layer =
	                    prefix + layerNames.getLayerName("LAYER_NAME_SIDE_YARD_1");

	            String side2Layer =
	                    prefix + layerNames.getLayerName("LAYER_NAME_SIDE_YARD_2");

	            validateFrontageWithLayer(pl, doc, frontage,
	                    frontLayer,
	                    true);

	            validateFrontageWithLayer(pl, doc, frontage,
	                    rearLayer,
	                    false);

	            validateFrontageWithLayer(pl, doc, frontage,
	                    side1Layer,
	                    false);

	            validateFrontageWithLayer(pl, doc, frontage,
	                    side2Layer,
	                    false);
	        }
	    }

	    LOG.info("Plot Frontage validation completed.");
	}
	
	
	private void validateFrontageWithLayer(
	        PlanDetail pl,
	        DXFDocument doc,
	        DXFLWPolyline frontage,
	        String layerName,
	        boolean shouldTouch) {

	    List<DXFLWPolyline> layers =
	            Util.getPolyLinesByLayer(doc, layerName);

	    if (layers == null || layers.isEmpty()) {
	        return;
	    }

	    boolean touching =
	            isTouchingOrOverlapping(frontage, layers.get(0));

	    LOG.info("{} -> {}", layerName, touching);

	    if (shouldTouch && !touching) {

	        pl.addError(layerName + "_FRONTAGE",
	                "PLOT_FRONTAGE must touch or overlap " + layerName + ".");

	    } else if (!shouldTouch && touching) {

	        String yardType = "Setback";

	        if (layerName.contains("REAR"))
	            yardType = "Rear Setback";
	        else if (layerName.contains("SIDE_YARD_1"))
	            yardType = "Side Setback-1";
	        else if (layerName.contains("SIDE_YARD_2"))
	            yardType = "Side Setback-2";

	        pl.addError(layerName + "_FRONTAGE",
	                "PLOT_FRONTAGE is incorrectly touching the "
	                        + layerName
	                        + ". It must touch only the Front Setback.");
	    }
	}
	
	private List<LineSegment> getSegments(DXFLWPolyline polyline) {

		List<Point> pts = Util.pointsOnPolygon(polyline);
		List<LineSegment> segments = new ArrayList<>();

		if (pts == null || pts.size() < 2) {
			return segments;
		}

		for (int i = 0; i < pts.size() - 1; i++) {
			segments.add(new LineSegment(pts.get(i), pts.get(i + 1)));
		}

		if (polyline.isClosed()) {
			segments.add(new LineSegment(pts.get(pts.size() - 1), pts.get(0)));
		}

		return segments;
	}

	private boolean isTouchingOrOverlapping(DXFLWPolyline poly1, DXFLWPolyline poly2) {

		List<LineSegment> seg1 = getSegments(poly1);
		List<LineSegment> seg2 = getSegments(poly2);

		for (LineSegment l1 : seg1) {

			for (LineSegment l2 : seg2) {

				if (sharesEdge(l1, l2)) {
					return true;
				}

				if (intersectsInside(l1, l2)) {
					return true;
				}
			}
		}

		return false;
	}

	private boolean sharesEdge(LineSegment l1, LineSegment l2) {

		final double EPS = 0.001;

		if (!areCollinear(l1, l2)) {
			return false;
		}

		return overlapLength(l1, l2) > EPS;
	}

	private boolean intersectsInside(LineSegment l1, LineSegment l2) {

		Point p = getIntersectionPoint(l1, l2);

		if (p == null)
			return false;

		return !isEndPoint(p, l1) && !isEndPoint(p, l2);
	}

	private static class LineSegment {

		private final Point start;
		private final Point end;

		LineSegment(Point start, Point end) {
			this.start = start;
			this.end = end;
		}

		Point getStart() {
			return start;
		}

		Point getEnd() {
			return end;
		}
	}
	
	private boolean areCollinear(LineSegment l1, LineSegment l2) {

	    Point a = l1.getStart();
	    Point b = l1.getEnd();
	    Point c = l2.getStart();
	    Point d = l2.getEnd();

	    return Math.abs(cross(a, b, c)) < EPS &&
	           Math.abs(cross(a, b, d)) < EPS;
	}

	private double cross(Point a, Point b, Point c) {
	    return (b.getX() - a.getX()) * (c.getY() - a.getY())
	         - (b.getY() - a.getY()) * (c.getX() - a.getX());
	}
	
	private double overlapLength(LineSegment l1, LineSegment l2) {

	    double dx = Math.abs(l1.getEnd().getX() - l1.getStart().getX());
	    double dy = Math.abs(l1.getEnd().getY() - l1.getStart().getY());

	    if (dx >= dy) {

	        double a1 = Math.min(l1.getStart().getX(), l1.getEnd().getX());
	        double a2 = Math.max(l1.getStart().getX(), l1.getEnd().getX());

	        double b1 = Math.min(l2.getStart().getX(), l2.getEnd().getX());
	        double b2 = Math.max(l2.getStart().getX(), l2.getEnd().getX());

	        return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));

	    } else {

	        double a1 = Math.min(l1.getStart().getY(), l1.getEnd().getY());
	        double a2 = Math.max(l1.getStart().getY(), l1.getEnd().getY());

	        double b1 = Math.min(l2.getStart().getY(), l2.getEnd().getY());
	        double b2 = Math.max(l2.getStart().getY(), l2.getEnd().getY());

	        return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
	    }
	}
	
	
	
	private Point getIntersectionPoint(LineSegment l1, LineSegment l2) {

	    Point p1 = l1.getStart();
	    Point p2 = l1.getEnd();
	    Point p3 = l2.getStart();
	    Point p4 = l2.getEnd();

	    double x1 = p1.getX();
	    double y1 = p1.getY();
	    double x2 = p2.getX();
	    double y2 = p2.getY();
	    double x3 = p3.getX();
	    double y3 = p3.getY();
	    double x4 = p4.getX();
	    double y4 = p4.getY();

	    double den = (x1 - x2) * (y3 - y4)
	               - (y1 - y2) * (x3 - x4);

	    if (Math.abs(den) < EPS)
	        return null;

	    double px = ((x1 * y2 - y1 * x2) * (x3 - x4)
	              - (x1 - x2) * (x3 * y4 - y3 * x4)) / den;

	    double py = ((x1 * y2 - y1 * x2) * (y3 - y4)
	              - (y1 - y2) * (x3 * y4 - y3 * x4)) / den;

	    Point p = new Point();
	    p.setX(px);
	    p.setY(py);

	    if (onSegment(p1, p2, p) && onSegment(p3, p4, p))
	        return p;

	    return null;
	}
	
	private boolean isEndPoint(Point p, LineSegment line) {

	    return distance(p, line.getStart()) < EPS
	        || distance(p, line.getEnd()) < EPS;
	}

	private double distance(Point p1, Point p2) {

	    double dx = p1.getX() - p2.getX();
	    double dy = p1.getY() - p2.getY();

	    return Math.sqrt(dx * dx + dy * dy);
	}
	private boolean onSegment(Point a, Point b, Point p) {

	    return p.getX() >= Math.min(a.getX(), b.getX()) - EPS &&
	           p.getX() <= Math.max(a.getX(), b.getX()) + EPS &&
	           p.getY() >= Math.min(a.getY(), b.getY()) - EPS &&
	           p.getY() <= Math.max(a.getY(), b.getY()) + EPS;
	}

}
