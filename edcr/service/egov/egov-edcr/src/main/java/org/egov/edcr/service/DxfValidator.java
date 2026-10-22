package org.egov.edcr.service;

import java.io.File;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.edcr.Plan;
import java.util.function.UnaryOperator;
public class DxfValidator {

    private static final Logger LOG = LogManager.getLogger(DxfValidator.class);

    // Unique key per check — do NOT reuse a single shared key across checks.
    private static final String KEY_PARSE_FAILED       = "dxf_validation_parse_failed";
    private static final String KEY_NO_ENTITIES        = "dxf_validation_no_entities";
    private static final String KEY_UNITS               = "dxf_validation_units";
    private static final String KEY_BBOX_MISSING       = "dxf_validation_bbox_missing";
    private static final String KEY_BBOX_INVALID       = "dxf_validation_bbox_invalid";
    private static final String KEY_SIZE_TOO_SMALL     = "dxf_validation_size_too_small";
    private static final String KEY_SIZE_TOO_LARGE     = "dxf_validation_size_too_large";
    private static final String KEY_ASPECT_RATIO       = "dxf_validation_aspect_ratio";
    private static final String KEY_HEADER_MISMATCH    = "dxf_validation_header_mismatch";
    private static final String KEY_MISSING_BLOCKS     = "dxf_validation_missing_blocks";
    private static final String KEY_MISSING_DIM_BLOCKS = "dxf_validation_missing_dim_blocks";
    private static final String KEY_LAYERS_INVISIBLE   = "dxf_validation_layers_invisible";
    private static final String KEY_OUTLIER_GEOMETRY   = "dxf_validation_outlier_geometry";
    
    private static final String KEY_BORDER_MISSING = "dxf_validation_work_sheet_missing";
    private static final String KEY_OUTSIDE_BORDER = "dxf_validation_outside_work_sheet";
    private static final double BORDER_TOLERANCE_RATIO = 0.002; // 0.2% of border size
    
    private static final double TEXT_TOLERANCE_RATIO = 0.004; // text widths are estimates, so allow 0.4%


    // General size sanity
    private static final double MIN_DRAWING_SIZE = 10.0;
    private static final double MAX_DRAWING_SIZE = 1_000_000.0;

    // Aspect ratio / outlier detection
    private static final double MAX_ASPECT_RATIO = 29.0;
    private static final double OUTLIER_FENCE_MULTIPLIER = 3.0;
    private static final double MIN_OUTLIER_GAP = 50.0;

    private static final int REQUIRED_INSUNITS = 6;

    public static void validate(File dxfFile, Plan plan) {
        DxfToPdfConverterv2.DxfDocument doc;
        try {
            doc = DxfToPdfConverterv2.parseDxf(dxfFile);
        } catch (Exception e) {
            plan.addError(KEY_PARSE_FAILED, "Failed to parse DXF file: " + e.getMessage());
            LOG.error("DXF parse error for {}: {}", dxfFile.getAbsolutePath(), e.getMessage(), e);
            return;
        }

        checkHasEntities(doc, plan);
        //checkDrawingUnits(doc, plan);
        checkBoundingBoxAndSize(doc, plan);
        checkEntitiesInsideWorkSheet(doc, plan, EdcrApplicationService.getAllowedOutsideLayers());   // NEW
        checkMissingBlockReferences(doc, plan);
        checkMissingDimensionBlocks(doc, plan);
        checkAllUsedLayersInvisible(doc, plan);
        // Isolated micro-geometry may be excluded only to improve PDF page-fit.
        // It is not a building-rule violation, so do not add it to plan errors.
    }

    private static void checkHasEntities(DxfToPdfConverterv2.DxfDocument doc, Plan plan) {
        if (doc.entities == null || doc.entities.isEmpty()) {
            plan.addError(KEY_NO_ENTITIES, "The DXF file contains no drawing entities. The generated PDF will be blank.");
        }
    }

    private static void checkDrawingUnits(DxfToPdfConverterv2.DxfDocument doc, Plan plan) {
        double[] insUnitsVar = doc.headerVars.get("$INSUNITS");
        if (insUnitsVar == null) return;
        int insUnits = (int) insUnitsVar[0];
        if (insUnits != REQUIRED_INSUNITS) {
            plan.addError(KEY_UNITS, "Drawing units are not set to meters (current INSUNITS code: " + insUnits + ").");
        }
    }

    private static void checkBoundingBoxAndSize(DxfToPdfConverterv2.DxfDocument doc, Plan plan) {
        if (!doc.extentsSet) {
            plan.addError(KEY_BBOX_MISSING, "Could not determine bounding box – no entities with bounds found "
                    + "and header extents missing.");
            return;
        }

        double width = doc.maxX - doc.minX;
        double height = doc.maxY - doc.minY;

        LOG.info("DXF bbox check: minX={}, maxX={}, minY={}, maxY={}, width={}, height={}, extentsSet={}",
                doc.minX, doc.maxX, doc.minY, doc.maxY, width, height, doc.extentsSet);

        if (width <= 0 || height <= 0) {
            plan.addError(KEY_BBOX_INVALID, "Invalid bounding box: width = " + width + ", height = " + height);
            return;
        }

        double size = Math.max(width, height);
        if (size < MIN_DRAWING_SIZE) {
            plan.addError(KEY_SIZE_TOO_SMALL, "Drawing is too small (max extent = " + size + "). Minimum allowed is "
                    + MIN_DRAWING_SIZE);
        } else if (size > MAX_DRAWING_SIZE) {
            plan.addError(KEY_SIZE_TOO_LARGE, "Drawing is too large (max extent = " + size + "). Maximum allowed is "
                    + MAX_DRAWING_SIZE);
        }

        if (width / height > MAX_ASPECT_RATIO || height / width > MAX_ASPECT_RATIO) {
            plan.addError(KEY_ASPECT_RATIO, String.format(Locale.US,
                    "Drawing aspect ratio is extreme: %.2f x %.2f. This usually means a stray or "
                            + "misplaced entity is inflating the bounding box, causing the real drawing "
                            + "to render as a tiny speck on the page. Check scale, units, or stray geometry.",
                    width, height));
        }

        DxfToPdfConverterv2.EntityExtentVisitor visitor = new DxfToPdfConverterv2.EntityExtentVisitor();
        for (DxfToPdfConverterv2.Entity e : doc.entities) visitor.visit(e);
        for (DxfToPdfConverterv2.Block b : doc.blocks.values())
            for (DxfToPdfConverterv2.Entity e : b.entities) visitor.visit(e);

        if (visitor.valid) {
            double entityWidth = visitor.maxX - visitor.minX;
            double entityHeight = visitor.maxY - visitor.minY;
            boolean widthBlown = entityWidth > 0 && width > entityWidth * 3 && (width - entityWidth) > MIN_OUTLIER_GAP;
            boolean heightBlown = entityHeight > 0 && height > entityHeight * 3 && (height - entityHeight) > MIN_OUTLIER_GAP;
            if (widthBlown || heightBlown) {
                plan.addError(KEY_HEADER_MISMATCH, String.format(Locale.US,
                        "Header $EXTMIN/$EXTMAX (%.2f x %.2f) diverges sharply from the geometry-derived "
                                + "bounding box (%.2f x %.2f). The header extents are likely stale or "
                                + "corrupted by an off-drawing entity, which will make the PDF scale incorrectly.",
                        width, height, entityWidth, entityHeight));
            }
        }
    }

    private static void checkMissingBlockReferences(DxfToPdfConverterv2.DxfDocument doc, Plan plan) {
        Set<String> missing = new LinkedHashSet<>();
        for (DxfToPdfConverterv2.Entity e : doc.entities) {
            if (e instanceof DxfToPdfConverterv2.InsertEntity) {
                DxfToPdfConverterv2.InsertEntity ins = (DxfToPdfConverterv2.InsertEntity) e;
                if (ins.blockName != null && !ins.blockName.startsWith("*")
                        && !doc.blocks.containsKey(ins.blockName.toUpperCase())) {
                    missing.add(ins.blockName);
                }
            }
        }
        if (!missing.isEmpty()) {
            plan.addError(KEY_MISSING_BLOCKS, "INSERT entities reference block(s) with no definition in the BLOCKS "
                    + "section: " + missing + ". These symbols will be silently missing from the converted PDF.");
        }
    }

    private static void checkMissingDimensionBlocks(DxfToPdfConverterv2.DxfDocument doc, Plan plan) {
        Set<String> missing = new LinkedHashSet<>();
        for (DxfToPdfConverterv2.Entity e : doc.entities) {
            if (e instanceof DxfToPdfConverterv2.DimensionEntity) {
                DxfToPdfConverterv2.DimensionEntity dim = (DxfToPdfConverterv2.DimensionEntity) e;
                if (dim.dimensionBlockName != null && !dim.dimensionBlockName.isEmpty()
                        && !doc.blocks.containsKey(dim.dimensionBlockName.toUpperCase())) {
                    missing.add(dim.dimensionBlockName);
                }
            }
        }
        if (!missing.isEmpty()) {
            plan.addError(KEY_MISSING_DIM_BLOCKS, "DIMENSION entities reference anonymous dimension block(s) not found: "
                    + missing + ". Dimension lines/arrows will be skipped (only text may render).");
        }
    }

    private static void checkAllUsedLayersInvisible(DxfToPdfConverterv2.DxfDocument doc, Plan plan) {
        Set<String> usedLayers = new LinkedHashSet<>();
        for (DxfToPdfConverterv2.Entity e : doc.entities) usedLayers.add(e.layer);
        if (usedLayers.isEmpty()) return;

        boolean anyVisible = false;
        for (String layerName : usedLayers) {
            DxfToPdfConverterv2.Layer layer = doc.layers.get(layerName.toUpperCase());
            if (layer == null || layer.visible) {
                anyVisible = true;
                break;
            }
        }
        if (!anyVisible) {
            plan.addError(KEY_LAYERS_INVISIBLE, "All layers used by the drawing entities (" + usedLayers
                    + ") are switched off/invisible. The converted PDF will render as blank.");
        }
    }

   private static void checkExcludedRegions(DxfToPdfConverterv2.DxfDocument doc, Plan plan) {
    if (doc.excludedRegions == null || doc.excludedRegions.isEmpty()) return;

    for (double[] region : doc.excludedRegions) {
        plan.addError(KEY_OUTLIER_GEOMETRY, String.format(java.util.Locale.US,
                "Found geometry (%d entities) spatially isolated from the main drawing, spanning "
                        + "(%.2f, %.2f) to (%.2f, %.2f). This region was excluded from the page-fit "
                        + "calculation as likely stray/misplaced content — verify it is not needed.",
                (int) region[4], region[0], region[1], region[2], region[3]));
    }
}

    private static double[] iqrFence(double[] sorted) {
        double q1 = percentile(sorted, 25);
        double q3 = percentile(sorted, 75);
        double iqr = q3 - q1;
        return new double[]{q1 - OUTLIER_FENCE_MULTIPLIER * iqr, q3 + OUTLIER_FENCE_MULTIPLIER * iqr};
    }

    private static double percentile(double[] sorted, double p) {
        if (sorted.length == 0) return 0;
        double idx = (p / 100.0) * (sorted.length - 1);
        int lo = (int) Math.floor(idx);
        int hi = (int) Math.ceil(idx);
        if (lo == hi) return sorted[lo];
        double frac = idx - lo;
        return sorted[lo] + frac * (sorted[hi] - sorted[lo]);
    }

    private static void addPoint(double x, double y, String label, List<double[]> points, List<String> labels) {
        if (Double.isFinite(x) && Double.isFinite(y) && Math.abs(x) < 1e12 && Math.abs(y) < 1e12) {
            points.add(new double[]{x, y});
            labels.add(label);
        }
    }

    private static void collectPoints(DxfToPdfConverterv2.Entity e, List<double[]> points, List<String> labels) {
        String label = e.layer + "/" + e.getClass().getSimpleName();
        if (e instanceof DxfToPdfConverterv2.LineEntity) {
            DxfToPdfConverterv2.LineEntity l = (DxfToPdfConverterv2.LineEntity) e;
            addPoint(l.x1, l.y1, label, points, labels);
            addPoint(l.x2, l.y2, label, points, labels);
        } else if (e instanceof DxfToPdfConverterv2.CircleEntity) {
            DxfToPdfConverterv2.CircleEntity c = (DxfToPdfConverterv2.CircleEntity) e;
            addPoint(c.cx, c.cy, label, points, labels);
        } else if (e instanceof DxfToPdfConverterv2.ArcEntity) {
            DxfToPdfConverterv2.ArcEntity a = (DxfToPdfConverterv2.ArcEntity) e;
            double[] box = a.getBoundingBox();
            addPoint(box[0], box[1], label, points, labels);
            addPoint(box[2], box[3], label, points, labels);
        } else if (e instanceof DxfToPdfConverterv2.EllipseEntity) {
            DxfToPdfConverterv2.EllipseEntity el = (DxfToPdfConverterv2.EllipseEntity) e;
            double[] box = el.getBoundingBox();
            addPoint(box[0], box[1], label, points, labels);
            addPoint(box[2], box[3], label, points, labels);
        } else if (e instanceof DxfToPdfConverterv2.PolylineEntity) {
            for (double[] v : ((DxfToPdfConverterv2.PolylineEntity) e).vertices) {
                addPoint(v[0], v[1], label, points, labels);
            }
        } else if (e instanceof DxfToPdfConverterv2.TextEntity) {
            DxfToPdfConverterv2.TextEntity t = (DxfToPdfConverterv2.TextEntity) e;
            addPoint(t.x, t.y, label, points, labels);
        } else if (e instanceof DxfToPdfConverterv2.MTextEntity) {
            DxfToPdfConverterv2.MTextEntity m = (DxfToPdfConverterv2.MTextEntity) e;
            addPoint(m.x, m.y, label, points, labels);
        } else if (e instanceof DxfToPdfConverterv2.InsertEntity) {
            DxfToPdfConverterv2.InsertEntity i = (DxfToPdfConverterv2.InsertEntity) e;
            addPoint(i.x, i.y, label, points, labels);
        } else if (e instanceof DxfToPdfConverterv2.LeaderEntity) {
            for (double[] v : ((DxfToPdfConverterv2.LeaderEntity) e).vertices) {
                addPoint(v[0], v[1], label, points, labels);
            }
        } else if (e instanceof DxfToPdfConverterv2.DimensionEntity) {
            DxfToPdfConverterv2.DimensionEntity d = (DxfToPdfConverterv2.DimensionEntity) e;
            addPoint(d.defX, d.defY, label, points, labels);
        } else if (e instanceof DxfToPdfConverterv2.SolidEntity) {
            double[] c = ((DxfToPdfConverterv2.SolidEntity) e).corners;
            addPoint(c[0], c[1], label, points, labels);
        }
    }
    
    private static void checkEntitiesInsideWorkSheet(DxfToPdfConverterv2.DxfDocument doc, Plan plan,
			Collection<String> allowedOutsideLayers) {
		List<double[]> poly = doc.workSheetPolygon;
		if (poly == null) {
			plan.addError(KEY_BORDER_MISSING, "Layer '" + DxfToPdfConverterv2.WORK_SHEET_LAYER
					+ "' is missing or has no border. The complete drawing must be inside this layer.");
			return;
		}

		double minX = Double.MAX_VALUE, minY = Double.MAX_VALUE, maxX = -Double.MAX_VALUE, maxY = -Double.MAX_VALUE;
		for (double[] p : poly) {
			minX = Math.min(minX, p[0]);
			maxX = Math.max(maxX, p[0]);
			minY = Math.min(minY, p[1]);
			maxY = Math.max(maxY, p[1]);
		}
		double size = Math.max(maxX - minX, maxY - minY);
		double tol = size * BORDER_TOLERANCE_RATIO;
		
		// Increased text tolerance slightly to prevent false-positives on title blocks & metadata text
		double textTol = size * 0.01; 

		Set<String> allowed = new HashSet<>();
		if (allowedOutsideLayers != null)
			for (String l : allowedOutsideLayers)
				if (l != null)
					allowed.add(l.trim().toUpperCase(Locale.ROOT));

		Map<String, Integer> outsideByLayer = new LinkedHashMap<>();
		List<String> samples = new ArrayList<>();
		Map<String, Integer> detailCounts = new LinkedHashMap<>();
		
		for (DxfToPdfConverterv2.Entity e : doc.entities) {
			String layerKey = e.layer == null ? "0" : e.layer.toUpperCase(Locale.ROOT);
			if (!e.visible || DxfToPdfConverterv2.WORK_SHEET_LAYER.equalsIgnoreCase(e.layer)
					|| allowed.contains(layerKey))
				continue;
			DxfToPdfConverterv2.Layer lay = doc.layers.get(layerKey);
			if (lay != null && !lay.visible)
				continue;

			List<double[]> pts = new ArrayList<>();
			collectWorldPoints(doc, e, p -> p, 0, pts);
			boolean isText = e instanceof DxfToPdfConverterv2.TextEntity
					|| e instanceof DxfToPdfConverterv2.MTextEntity;
			double t = isText ? textTol : tol;

			// For text/MText, check if the majority or anchor points are within relaxed tolerance
			boolean failed = false;
			for (double[] p : pts) {
				if (!DxfToPdfConverterv2.insideOrNearPolygon(p[0], p[1], poly, t)) {
					failed = true;
					break;
				}
			}

			double[] bad = null;
			for (double[] p : pts) {
			    if (!DxfToPdfConverterv2.insideOrNearPolygon(p[0], p[1], poly, t)) { bad = p; break; }
			}
			if (bad != null) {
			    outsideByLayer.merge(e.layer, 1, Integer::sum);
			    String d = describe(e, bad);
			    //LOG.warn("Outside WORK_SHEET: {} near ({}, {}) | worksheet bbox=[{}, {}, {}, {}]",
			      //      d, bad[0], bad[1], minX, minY, maxX, maxY);
			    detailCounts.merge(d, 1, Integer::sum);
			}
		}
		

		if (!outsideByLayer.isEmpty()) {
		    int total = outsideByLayer.values().stream().mapToInt(Integer::intValue).sum();

		    StringBuilder msg = new StringBuilder();
		    msg.append(String.format(Locale.US, "Found %d object%s outside the %s boundary: ",
		            total, total == 1 ? "" : "s", DxfToPdfConverterv2.WORK_SHEET_LAYER));

		    int n = 0;
		    for (Map.Entry<String, Integer> en : outsideByLayer.entrySet()) {
		        if (n++ > 0) msg.append(", ");
		        msg.append(String.format(Locale.US, "layer '%s' (%d)", en.getKey(), en.getValue()));
		    }

		    msg.append(". Details: ");
//		    int d = 0;
//		    for (Map.Entry<String, Integer> en : detailCounts.entrySet()) {
//		        if (d++ > 0) msg.append("  ");
//		        msg.append(en.getKey());
//		        if (en.getValue() > 1) msg.append(" x").append(en.getValue());
//		    }
		    msg.append(". If these objects belong to the drawing, move them onto the ")
		       .append(DxfToPdfConverterv2.WORK_SHEET_LAYER)
		       .append(" boundary area; otherwise delete them from the file.");

		    plan.addError(KEY_OUTSIDE_BORDER, msg.toString());
		}
}

    private static String describe(DxfToPdfConverterv2.Entity e, double[] p) {
        String type = e.getClass().getSimpleName().replace("Entity", "");
        if (e instanceof DxfToPdfConverterv2.InsertEntity)
            type = "Block '" + ((DxfToPdfConverterv2.InsertEntity) e).blockName + "'";
        String txt = "";
        if (e instanceof DxfToPdfConverterv2.TextEntity) txt = ((DxfToPdfConverterv2.TextEntity) e).text;
        else if (e instanceof DxfToPdfConverterv2.MTextEntity) txt = ((DxfToPdfConverterv2.MTextEntity) e).getPlainText();
        if (txt != null && !txt.isEmpty()) {
            txt = txt.replaceAll("\\s+", " ").trim();
            txt = " \"" + (txt.length() > 40 ? txt.substring(0, 40) + "..." : txt) + "\"";
        } else txt = "";
        return String.format(Locale.US, "%s%s on layer '%s'", type, txt, e.layer);
    }
	
	private static String cleanMText(String text) {
	    if (text == null) {
	        return "";
	    }

	    return text
	            // Paragraphs
	            .replace("\\P", " ")

	            // Remove formatting groups like {\fArial|b0|i0;TEXT}
	            .replaceAll("\\\\[Hh][^;]*;", "")
	            .replaceAll("\\\\[Ff][^;]*;", "")
	            .replaceAll("\\\\[Cc][^;]*;", "")
	            .replaceAll("\\\\[Qq][^;]*;", "")
	            .replaceAll("\\\\[Tt][^;]*;", "")
	            .replaceAll("\\\\[Ww][^;]*;", "")

	            // Remove braces
	            .replace("{", "")
	            .replace("}", "")

	            // Normalize spaces
	            .replaceAll("\\s+", " ")
	            .trim();
	}

	private static void addPt(List<double[]> out, UnaryOperator<double[]> tf, double x, double y) {
	    if (Double.isFinite(x) && Double.isFinite(y) && Math.abs(x) < 1e12 && Math.abs(y) < 1e12)
	        out.add(tf.apply(new double[]{x, y}));
	}

	private static void addCorners(List<double[]> out, UnaryOperator<double[]> tf, double[] c) {
	    for (int i = 0; i < 8; i += 2) addPt(out, tf, c[i], c[i + 1]);
	}

	/** Collects real geometry points in world coordinates; blocks are expanded with their insert transform. */
	private static void collectWorldPoints(DxfToPdfConverterv2.DxfDocument doc, DxfToPdfConverterv2.Entity e,
	        UnaryOperator<double[]> tf, int depth, List<double[]> out) {
	    if (e == null || depth > 6) return;

	    if (e instanceof DxfToPdfConverterv2.LineEntity) {
	        DxfToPdfConverterv2.LineEntity l = (DxfToPdfConverterv2.LineEntity) e;
	        addPt(out, tf, l.x1, l.y1); addPt(out, tf, l.x2, l.y2);

	    } else if (e instanceof DxfToPdfConverterv2.PolylineEntity) {
	        List<double[]> v = ((DxfToPdfConverterv2.PolylineEntity) e).vertices;
	        for (int i = 0; i < v.size(); i++) {
	            addPt(out, tf, v.get(i)[0], v.get(i)[1]);
	            if (i > 0) {
	                double[] a = v.get(i - 1), b = v.get(i);
	                double bulge = a.length > 2 ? a[2] : 0;
	                if (Math.abs(bulge) > 1e-4) {
	                    addPt(out, tf, (a[0] + b[0]) / 2 - (b[1] - a[1]) * bulge / 2,
	                                   (a[1] + b[1]) / 2 + (b[0] - a[0]) * bulge / 2);
	                }
	            }
	        }

	    } else if (e instanceof DxfToPdfConverterv2.LeaderEntity) {
	        for (double[] v : ((DxfToPdfConverterv2.LeaderEntity) e).vertices) addPt(out, tf, v[0], v[1]);

	    } else if (e instanceof DxfToPdfConverterv2.SplineEntity) {
	        DxfToPdfConverterv2.SplineEntity s = (DxfToPdfConverterv2.SplineEntity) e;
	        for (double[] v : (s.controlPoints.isEmpty() ? s.fitPoints : s.controlPoints)) addPt(out, tf, v[0], v[1]);

	    } else if (e instanceof DxfToPdfConverterv2.CircleEntity) {
	        DxfToPdfConverterv2.CircleEntity c = (DxfToPdfConverterv2.CircleEntity) e;
	        addPt(out, tf, c.cx + c.radius, c.cy); addPt(out, tf, c.cx - c.radius, c.cy);
	        addPt(out, tf, c.cx, c.cy + c.radius); addPt(out, tf, c.cx, c.cy - c.radius);

	    } else if (e instanceof DxfToPdfConverterv2.ArcEntity) {
	        DxfToPdfConverterv2.ArcEntity a = (DxfToPdfConverterv2.ArcEntity) e;
	        double sweep = a.endAngle - a.startAngle;
	        if (sweep <= 0) sweep += 360;
	        List<Double> angs = new ArrayList<>();
	        angs.add(a.startAngle); angs.add(a.startAngle + sweep / 2); angs.add(a.startAngle + sweep);
	        for (double q : new double[]{0, 90, 180, 270}) {
	            double d = ((q - a.startAngle) % 360 + 360) % 360;
	            if (d > 0 && d < sweep) angs.add(q);
	        }
	        for (double ang : angs)
	            addPt(out, tf, a.cx + a.radius * Math.cos(Math.toRadians(ang)), a.cy + a.radius * Math.sin(Math.toRadians(ang)));

	    } else if (e instanceof DxfToPdfConverterv2.EllipseEntity) {
	        double[] b = ((DxfToPdfConverterv2.EllipseEntity) e).getBoundingBox();
	        addPt(out, tf, b[0], b[1]); addPt(out, tf, b[2], b[1]); addPt(out, tf, b[2], b[3]); addPt(out, tf, b[0], b[3]);

	    } else if (e instanceof DxfToPdfConverterv2.SolidEntity) {
	        double[] c = ((DxfToPdfConverterv2.SolidEntity) e).corners;
	        for (int i = 0; i < 8; i += 2) addPt(out, tf, c[i], c[i + 1]);

	    } else if (e instanceof DxfToPdfConverterv2.TextEntity) {
	        addCorners(out, tf, DxfToPdfConverterv2.textCorners((DxfToPdfConverterv2.TextEntity) e));

	    } else if (e instanceof DxfToPdfConverterv2.MTextEntity) {
	        addCorners(out, tf, DxfToPdfConverterv2.mtextCorners(doc, (DxfToPdfConverterv2.MTextEntity) e));

	    } else if (e instanceof DxfToPdfConverterv2.DimensionEntity) {
	        DxfToPdfConverterv2.DimensionEntity d = (DxfToPdfConverterv2.DimensionEntity) e;
	        DxfToPdfConverterv2.Block blk = (d.dimensionBlockName == null || d.dimensionBlockName.isEmpty())
	                ? null : doc.blocks.get(d.dimensionBlockName.toUpperCase());
	        if (blk != null && !blk.entities.isEmpty()) {           // dimension blocks are already in world coords
	            for (DxfToPdfConverterv2.Entity be : blk.entities)
	                if (be.visible) collectWorldPoints(doc, be, tf, depth + 1, out);
	        } else {
	            addPt(out, tf, d.defX, d.defY); addPt(out, tf, d.midX, d.midY);
	        }

	    } else if (e instanceof DxfToPdfConverterv2.InsertEntity) {
	        final DxfToPdfConverterv2.InsertEntity ins = (DxfToPdfConverterv2.InsertEntity) e;
	        final DxfToPdfConverterv2.Block blk = (ins.blockName == null || ins.blockName.startsWith("*"))
	                ? null : doc.blocks.get(ins.blockName.toUpperCase());
	        if (blk == null || blk.entities.isEmpty()) { addPt(out, tf, ins.x, ins.y); return; }
	        final double cos = Math.cos(Math.toRadians(ins.rotation)), sin = Math.sin(Math.toRadians(ins.rotation));
	        for (int r = 0; r < Math.max(1, ins.rows); r++) {
	            for (int c = 0; c < Math.max(1, ins.cols); c++) {
	                final double ox = ins.x + c * ins.colSpacing, oy = ins.y + r * ins.rowSpacing;
	                UnaryOperator<double[]> itf = p -> {
	                    double lx = (p[0] - blk.baseX) * ins.scaleX, ly = (p[1] - blk.baseY) * ins.scaleY;
	                    return tf.apply(new double[]{ox + lx * cos - ly * sin, oy + lx * sin + ly * cos});
	                };
	                for (DxfToPdfConverterv2.Entity be : blk.entities)
	                    if (be.visible) collectWorldPoints(doc, be, itf, depth + 1, out);
	            }
	        }
	    }
	}
	private static List<double[]> keyPoints(DxfToPdfConverterv2.DxfDocument doc, DxfToPdfConverterv2.Entity e) {
		List<double[]> pts = new ArrayList<>();
		if (e instanceof DxfToPdfConverterv2.LineEntity) {
			DxfToPdfConverterv2.LineEntity l = (DxfToPdfConverterv2.LineEntity) e;
			pts.add(new double[] { l.x1, l.y1 });
			pts.add(new double[] { l.x2, l.y2 });
		} else if (e instanceof DxfToPdfConverterv2.PolylineEntity) {
			for (double[] v : ((DxfToPdfConverterv2.PolylineEntity) e).vertices)
				pts.add(new double[] { v[0], v[1] });
		} else if (e instanceof DxfToPdfConverterv2.LeaderEntity) {
			for (double[] v : ((DxfToPdfConverterv2.LeaderEntity) e).vertices)
				pts.add(new double[] { v[0], v[1] });
		} else if (e instanceof DxfToPdfConverterv2.SplineEntity) {
			DxfToPdfConverterv2.SplineEntity s = (DxfToPdfConverterv2.SplineEntity) e;
			for (double[] v : (s.controlPoints.isEmpty() ? s.fitPoints : s.controlPoints))
				pts.add(new double[] { v[0], v[1] });
		} else {
			// Circle, Arc, Ellipse, Text, MText, Insert, Dimension, Solid -> bbox corners
			List<double[]> boxes = new ArrayList<>();
			DxfToPdfConverterv2.addEntityBox(doc, e, boxes, new ArrayList<>(), 0);
			for (double[] b : boxes) {
				pts.add(new double[] { b[0], b[1] });
				pts.add(new double[] { b[2], b[1] });
				pts.add(new double[] { b[2], b[3] });
				pts.add(new double[] { b[0], b[3] });
			}
		}
		return pts;
	}

	private Set<String> getAllowedOutsideLayers() {
	    return Collections.emptySet(); // or read from config / request later
	}
	
}
