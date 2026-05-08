package org.egov.edcr.service;

import org.kabeja.dxf.*;
import org.kabeja.parser.*;
import org.kabeja.dxf.helpers.StyledTextParagraph;
import org.kabeja.xml.SAXGenerator;
import org.kabeja.svg.SVGGenerator;
import org.kabeja.batik.tools.SAXPDFSerializer;
import org.kabeja.dxf.helpers.Point;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Service
public class DxfToPdfConverterService {

    /**
     * Reads DXF, prints full analysis, and writes PDF to the provided outputStream.
     */
    public void processAndConvert(InputStream inputStream, OutputStream pdfOutputStream) {
        try {
            // 1. Parse the DXF
            Parser parser = ParserBuilder.createDefaultParser();
            parser.parse(inputStream, "UTF-8");
            DXFDocument doc = parser.getDocument();

            // Normalize lineweights so CAD-specific bold strokes don't dominate the PDF.
            normalizeLineWeights(doc);

            // Keep PLAN_INFO text anchored exactly where it is drawn; only repair Kabeja text parsing quirks.
            normalizePlanInfoText(doc);

            // 2. Run the Analysis (Your existing logic)
            runFullAnalysis(doc);

            // 3. Convert to PDF
            convertToPdf(doc, pdfOutputStream);

        } catch (Exception e) {
            System.err.println("CRITICAL ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void runFullAnalysis(DXFDocument doc) {
        System.out.println("==========================================");
        System.out.println("FULL DXF ANALYSIS REPORT");
        System.out.println("==========================================");

        Iterator layerIterator = doc.getDXFLayerIterator();
        while (layerIterator.hasNext()) {
            DXFLayer layer = (DXFLayer) layerIterator.next();
            System.out.println("\nLAYER: " + layer.getName());
            System.out.println("------------------------------------------");

            Iterator typeIterator = layer.getDXFEntityTypeIterator();
            if (!typeIterator.hasNext()) {
                System.out.println("  (Empty Layer)");
                continue;
            }

            while (typeIterator.hasNext()) {
                String type = (String) typeIterator.next();
                List entities = layer.getDXFEntities(type);
                for (Object obj : entities) {
                    processEntity(obj, type, layer.getName());
                }
            }
        }
    }

    private void convertToPdf(DXFDocument doc, OutputStream out) throws Exception {
        SAXGenerator generator = new SVGGenerator();
        Bounds bounds = doc.getBounds();

        // --- MARGIN CALCULATION ---
        // Add 5% padding so text on the far right (PLAN INFO) isn't cut off
        double margin = Math.max(bounds.getWidth(), bounds.getHeight()) * 0.05;
        double x = bounds.getMinimumX() - margin;
        double y = bounds.getMinimumY() - margin;
        double w = bounds.getWidth() + (margin * 2);
        double h = bounds.getHeight() + (margin * 2);

        // --- PROPERTY MAP (Use Object to prevent ClassCastException) ---
        Map<String, Object> props = new HashMap<>();

        // High Resolution Paper Size (Approx A3 at 600 DPI)
        props.put("width", "3508px");
        props.put("height", "4961px");
        props.put("dpi", Double.valueOf(600.0));

        // ViewBox with PADDING
        String viewBox = String.format(java.util.Locale.US, "%f %f %f %f", x, y, w, h);
        props.put("viewBox", viewBox);

        // TEXT CLARITY: Use geometricPrecision to keep text inside boxes
        props.put("text-rendering", "geometricPrecision");
        props.put("text-stroke-width", Double.valueOf(0.0)); // Prevent bold/blurry text

        // LINE WEIGHT: Thin lines for architectural clarity
        props.put("stroke-width", Double.valueOf(0.001));

        props.put("background", "white");
        props.put("preserveAspectRatio", "xMidYMid meet");

        generator.setProperties(props);

        // --- SERIALIZER SETUP ---
        SAXPDFSerializer serializer = new SAXPDFSerializer();
        serializer.setOutput(out);

        // Sync Header Variables to the new Padded View
        updateHeaderExtents(doc, x, y, x + w, y + h);

        generator.generate(doc, serializer, props);
    }

    private void updateHeaderExtents(DXFDocument doc, double minX, double minY, double maxX, double maxY) {
        DXFHeader header = doc.getDXFHeader();
        if (header != null) {
            // Note: Use String.valueOf to satisfy the compiler
            DXFVariable maxVar = new DXFVariable("$EXTMAX");
            maxVar.setValue("10", String.valueOf(maxX));
            maxVar.setValue("20", String.valueOf(maxY));
            maxVar.setValue("30", "0.0");
            header.setVariable(maxVar);

            DXFVariable minVar = new DXFVariable("$EXTMIN");
            minVar.setValue("10", String.valueOf(minX));
            minVar.setValue("20", String.valueOf(minY));
            minVar.setValue("30", "0.0");
            header.setVariable(minVar);
        }
    }

    private void normalizeLineWeights(DXFDocument doc) {
        Iterator layerIterator = doc.getDXFLayerIterator();
        while (layerIterator.hasNext()) {
            DXFLayer layer = (DXFLayer) layerIterator.next();
            if ("PLAN_INFO".equalsIgnoreCase(layer.getName())) {
                layer.setColor(0);
            }
            Iterator typeIterator = layer.getDXFEntityTypeIterator();
            while (typeIterator.hasNext()) {
                String type = (String) typeIterator.next();
                List entities = layer.getDXFEntities(type);
                for (Object obj : entities) {
                    if (obj instanceof DXFEntity) {
                        DXFEntity entity = (DXFEntity) obj;
                        entity.setLineWeight(-1);
                        if ("PLAN_INFO".equalsIgnoreCase(layer.getName())) {
                            entity.setColor(0);
                        }
                    }
                }
            }
        }
    }

    private void normalizePlanInfoText(DXFDocument doc) {
        Iterator layerIterator = doc.getDXFLayerIterator();
        while (layerIterator.hasNext()) {
            DXFLayer layer = (DXFLayer) layerIterator.next();
            if (!"PLAN_INFO".equalsIgnoreCase(layer.getName())) {
                continue;
            }

            normalizePlanInfoEntities(layer, DXFConstants.ENTITY_TYPE_TEXT);
            normalizePlanInfoEntities(layer, DXFConstants.ENTITY_TYPE_MTEXT);
        }
    }

    private void normalizePlanInfoEntities(DXFLayer layer, String entityType) {
        List entities = layer.getDXFEntities(entityType);
        if (entities == null || entities.isEmpty()) {
            return;
        }

        for (Object obj : entities) {
            if (obj instanceof DXFText) {
                DXFText original = (DXFText) obj;
                String raw = original.getText();
                if (raw == null) continue;

                // Normalize line endings
                String[] lines = raw
                        .replace("\r\n", "\n")
                        .replace('\r', '\n')
                        .split("\n");

                if (lines.length <= 1) {
                    // Single line — no change needed
                    normalizePlanInfoText(original);
                    continue;
                }

                // ── MULTI-LINE SPLIT ──
                // Each line gets its own Y offset based on text height
                double startX = original.getInsertPoint().getX();
                double startY = original.getInsertPoint().getY();
                double lineHeight = original.getHeight() * 1.5; // 1.5x for spacing

                // Set first line on original entity
                original.setText(lines[0]);

                // Create new DXFText entities for remaining lines
                for (int i = 1; i < lines.length; i++) {
                    DXFText newLine = new DXFText();
                    newLine.setText(lines[i]);
                    newLine.setHeight(original.getHeight());
                    newLine.setColor(original.getColor());
                    newLine.setLineWeight(-1);

                    // setInsertPoint nahi hai — directly getInsertPoint() pe set karo
                    newLine.getInsertPoint().setX(startX);
                    newLine.getInsertPoint().setY(startY - (i * lineHeight));
                    newLine.getInsertPoint().setZ(0.0);

                    layer.addDXFEntity(newLine);
                }
            }
        }
    }

    private void normalizePlanInfoText(DXFText text) {
        if (text.getText() != null) {
            String normalized = text.getText()
                    .replace("\r\n", "\n")
                    .replace('\r', '\n')
                    .replace('\t', ' ');

            if (!normalized.equals(text.getText())) {
                text.setText(normalized);
            }
        }

        if (text.getTextDocument() == null || text.getInsertPoint() == null) {
            return;
        }

        Iterator styledParagraphIterator = text.getTextDocument().getStyledParagraphIterator();
        while (styledParagraphIterator.hasNext()) {
            StyledTextParagraph paragraph = (StyledTextParagraph) styledParagraphIterator.next();
            if (paragraph.getInsertPoint() == null) {
                continue;
            }

            if (isZero(paragraph.getInsertPoint().getX())) {
                paragraph.getInsertPoint().setX(text.getInsertPoint().getX());
            }
            if (isZero(paragraph.getInsertPoint().getY())) {
                paragraph.getInsertPoint().setY(text.getInsertPoint().getY());
            }
        }
    }

    private boolean isZero(double value) {
        return Math.abs(value) < 0.000001d;
    }

    private void processEntity(Object obj, String type, String layerName) {
        if (obj instanceof DXFLine) {
            DXFLine line = (DXFLine) obj;
            double length = Math.sqrt(
                    Math.pow(line.getEndPoint().getX() - line.getStartPoint().getX(), 2) +
                            Math.pow(line.getEndPoint().getY() - line.getStartPoint().getY(), 2)
            );
            System.out.printf("  [LINE] Length: %.4f | Layer: %s%n", length, layerName);
        }
        else if (obj instanceof DXFPolyline) {
            DXFPolyline poly = (DXFPolyline) obj;
            System.out.printf("  [POLYLINE] Length: %.4f | Vertices: %d | Layer: %s%n",
                    poly.getLength(), poly.getVertexCount(), layerName);
        }
        else if (obj instanceof DXFText) {
            DXFText txt = (DXFText) obj;
            System.out.printf("  [TEXT] Content: \"%s\" | Layer: %s | Pos: (%.2f,%.2f)%n",
                    txt.getText(), layerName, txt.getInsertPoint().getX(), txt.getInsertPoint().getY());
        }
        else if (obj instanceof DXFCircle) {
            DXFCircle circle = (DXFCircle) obj;
            System.out.printf("  [CIRCLE] Radius: %.4f | Layer: %s%n", circle.getRadius(), layerName);
        }
    }

    public void analyzeDxf(InputStream inputStream) {
        try {
            Parser parser = ParserBuilder.createDefaultParser();
            parser.parse(inputStream, "UTF-8");
            DXFDocument doc = parser.getDocument();

            System.out.println("==========================================");
            System.out.println("FULL DXF ANALYSIS REPORT");
            System.out.println("==========================================");

            // 1. Iterate through all Layers
            Iterator layerIterator = doc.getDXFLayerIterator();
            while (layerIterator.hasNext()) {
                DXFLayer layer = (DXFLayer) layerIterator.next();
                System.out.println("\nLAYER: " + layer.getName());
                System.out.println("------------------------------------------");

                // 2. Get all Entity Types available on this specific layer
                Iterator typeIterator = layer.getDXFEntityTypeIterator();

                if (!typeIterator.hasNext()) {
                    System.out.println("  (Empty Layer)");
                    continue;
                }

                while (typeIterator.hasNext()) {
                    String type = (String) typeIterator.next();
                    List entities = layer.getDXFEntities(type);

                    for (Object obj : entities) {
                        processEntity(obj, type);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void processEntity(Object obj, String type) {
        // --- LINE MEASUREMENTS ---
        if (obj instanceof DXFLine) {
            DXFLine line = (DXFLine) obj;
            double length = Math.sqrt(
                    Math.pow(line.getEndPoint().getX() - line.getStartPoint().getX(), 2) +
                            Math.pow(line.getEndPoint().getY() - line.getStartPoint().getY(), 2)
            );
            System.out.printf("  [LINE] Length: %.4f | Start: (%.2f,%.2f) End: (%.2f,%.2f)%n",
                    length, line.getStartPoint().getX(), line.getStartPoint().getY(),
                    line.getEndPoint().getX(), line.getEndPoint().getY());
        }

        // --- POLYLINE / LWPOLYLINE (Plans, Walls, Boundaries) ---
        else if (obj instanceof DXFPolyline) {
            DXFPolyline poly = (DXFPolyline) obj;
            System.out.printf("  [POLYLINE] Total Perimeter: %.4f | Vertices: %d | Closed: %b%n",
                    poly.getLength(), poly.getVertexCount(), poly.isClosed());
        }

        // --- TEXT & MTEXT (PlanInfo, Labels, Dimensions) ---
        else if (obj instanceof DXFText) {
            DXFText txt = (DXFText) obj;
            // This covers both DXFText and DXFMText in most Kabeja versions
            String content = txt.getText();
            System.out.printf("  [TEXT/INFO] Content: \"%s\" | At: (%.2f, %.2f) | Height: %.2f%n",
                    content, txt.getInsertPoint().getX(), txt.getInsertPoint().getY(), txt.getHeight());
        }

        // --- CIRCLES & ARCS ---
        else if (obj instanceof DXFCircle) {
            DXFCircle circle = (DXFCircle) obj;
            double circumference = 2 * Math.PI * circle.getRadius();
            System.out.printf("  [CIRCLE] Radius: %.4f | Circumference: %.4f | Center: (%.2f,%.2f)%n",
                    circle.getRadius(), circumference, circle.getCenterPoint().getX(), circle.getCenterPoint().getY());
        }

        // --- CATCH ALL FOR OTHER TYPES ---
        else {
            System.out.println("  [ENTITY: " + type + "] Basic data found, but specialized measurement not implemented.");
        }
    }

}