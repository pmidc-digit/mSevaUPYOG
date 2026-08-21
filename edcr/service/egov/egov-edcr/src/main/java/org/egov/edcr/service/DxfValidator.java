package org.egov.edcr.service;

import java.io.File;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.ArrayList;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.edcr.Plan;

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

    private static void collectPoints(DxfToPdfConverterv2.Entity e, List<double[]> points, List<String> labels) {
        String label = e.layer + "/" + e.getClass().getSimpleName();
        if (e instanceof DxfToPdfConverterv2.LineEntity) {
            DxfToPdfConverterv2.LineEntity l = (DxfToPdfConverterv2.LineEntity) e;
            points.add(new double[]{l.x1, l.y1}); labels.add(label);
            points.add(new double[]{l.x2, l.y2}); labels.add(label);
        } else if (e instanceof DxfToPdfConverterv2.CircleEntity) {
            DxfToPdfConverterv2.CircleEntity c = (DxfToPdfConverterv2.CircleEntity) e;
            points.add(new double[]{c.cx, c.cy}); labels.add(label);
        } else if (e instanceof DxfToPdfConverterv2.ArcEntity) {
            DxfToPdfConverterv2.ArcEntity a = (DxfToPdfConverterv2.ArcEntity) e;
            points.add(new double[]{a.cx, a.cy}); labels.add(label);
        } else if (e instanceof DxfToPdfConverterv2.EllipseEntity) {
            DxfToPdfConverterv2.EllipseEntity el = (DxfToPdfConverterv2.EllipseEntity) e;
            points.add(new double[]{el.cx, el.cy}); labels.add(label);
        } else if (e instanceof DxfToPdfConverterv2.PolylineEntity) {
            for (double[] v : ((DxfToPdfConverterv2.PolylineEntity) e).vertices) {
                points.add(new double[]{v[0], v[1]}); labels.add(label);
            }
        } else if (e instanceof DxfToPdfConverterv2.TextEntity) {
            DxfToPdfConverterv2.TextEntity t = (DxfToPdfConverterv2.TextEntity) e;
            points.add(new double[]{t.x, t.y}); labels.add(label);
        } else if (e instanceof DxfToPdfConverterv2.MTextEntity) {
            DxfToPdfConverterv2.MTextEntity m = (DxfToPdfConverterv2.MTextEntity) e;
            points.add(new double[]{m.x, m.y}); labels.add(label);
        } else if (e instanceof DxfToPdfConverterv2.InsertEntity) {
            DxfToPdfConverterv2.InsertEntity i = (DxfToPdfConverterv2.InsertEntity) e;
            points.add(new double[]{i.x, i.y}); labels.add(label);
        } else if (e instanceof DxfToPdfConverterv2.LeaderEntity) {
            for (double[] v : ((DxfToPdfConverterv2.LeaderEntity) e).vertices) {
                points.add(new double[]{v[0], v[1]}); labels.add(label);
            }
        } else if (e instanceof DxfToPdfConverterv2.DimensionEntity) {
            DxfToPdfConverterv2.DimensionEntity d = (DxfToPdfConverterv2.DimensionEntity) e;
            points.add(new double[]{d.defX, d.defY}); labels.add(label);
        } else if (e instanceof DxfToPdfConverterv2.SolidEntity) {
            double[] c = ((DxfToPdfConverterv2.SolidEntity) e).corners;
            points.add(new double[]{c[0], c[1]}); labels.add(label);
        }
    }
}
