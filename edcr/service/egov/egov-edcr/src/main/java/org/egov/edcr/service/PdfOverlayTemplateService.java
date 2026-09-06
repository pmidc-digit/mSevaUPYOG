package org.egov.edcr.service;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Base64;

import javax.imageio.ImageIO;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.pdfbox.multipdf.LayerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.form.PDFormXObject;
import org.apache.pdfbox.util.Matrix;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.fasterxml.jackson.databind.JsonNode;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;

@Service
public class PdfOverlayTemplateService {

	private static final Logger LOG = LogManager.getLogger(PdfOverlayTemplateService.class);

	/*
	 * Gap from right/bottom edge.
	 */
	private static final float PAGE_EDGE_GAP = 12f;

	/*
	 * IMPORTANT:
	 *
	 * Table width should remain visually same as previous output.
	 *
	 * Do NOT calculate table width according to drawing size.
	 */
	private static final float FIXED_PANEL_WIDTH = 600f;

	/*
	 * Drawing should never become smaller than original PDF page.
	 */
	private static final float MIN_DRAWING_SCALE = 0.10f;

	/*
	 * Safety limit.
	 *
	 * If table becomes extremely long due to many floors/blocks, drawing should not
	 * become absurdly huge.
	 */
	private static final float MAX_DRAWING_SCALE = 4.00f;

	/*
	 * 1.0 means:
	 *
	 * desired drawing height ~= table height
	 *
	 * This gives a balanced visual appearance.
	 */
	private static final float TARGET_DRAWING_TO_TABLE_HEIGHT_RATIO = 1.00f;

	@Autowired
	private TemplateEngine templateEngine;

	public File impose(File inputPdf, String outputFileName, JsonNode additionalDetails, float expandRight,
			float expandBottom, float gapDrawingToTables, float gapTop) throws IOException {

		File outputFile = new File(outputFileName);

		File composedPdf = File.createTempFile("impose_output_", ".pdf");

		File panelPdf = File.createTempFile("impose_panel_", ".pdf");

		try {

			/*
			 * ========================================================== 1. KEEP TABLE
			 * WIDTH FIXED ==========================================================
			 *
			 * Previously panel width was calculated dynamically from drawing width.
			 *
			 * That caused table width to vary.
			 *
			 * Requirement: Table should remain same width as before.
			 */
			float panelWidth = FIXED_PANEL_WIDTH;

			byte[] panelBytes = renderPanelPdf(additionalDetails, panelWidth);

			try (FileOutputStream fos = new FileOutputStream(panelPdf)) {

				fos.write(panelBytes);
			}

			try (PDDocument baseDoc = PDDocument.load(inputPdf);

					PDDocument panelDoc = PDDocument.load(panelPdf);

					PDDocument outputDoc = new PDDocument()) {

				LayerUtility lu = new LayerUtility(outputDoc);

				/*
				 * Panel may contain multiple pages.
				 *
				 * Flatten all table pages into one tall page.
				 */
				try (PDDocument flattenedPanelDoc = flattenPanelPages(panelDoc)) {

					PDFormXObject panelForm = lu.importPageAsForm(flattenedPanelDoc, 0);

					float panelW = flattenedPanelDoc.getPage(0).getMediaBox().getWidth();

					float panelH = flattenedPanelDoc.getPage(0).getMediaBox().getHeight();

					LOG.info("========================================================");

					LOG.info("SMART PDF COMPOSITION START");

					LOG.info("Table original rendered size -> Width: {} pt, Height: {} pt", panelW, panelH);

					LOG.info("Fixed requested table width -> {} pt (wider scrutiny panel)", panelWidth);

					/*
					 * Process every drawing page.
					 */
					for (int i = 0; i < baseDoc.getNumberOfPages(); i++) {

						PDPage srcPage = baseDoc.getPage(i);

						float origW = srcPage.getMediaBox().getWidth();

						float origH = srcPage.getMediaBox().getHeight();

						/*
						 * ================================================== TABLE SIZE
						 * ==================================================
						 *
						 * Table will NOT be scaled.
						 *
						 * This preserves:
						 *
						 * - table width - font size - column proportion - existing table appearance
						 */
						float renderedPanelW = panelW;

						float renderedPanelH = panelH;

						/*
						 * ================================================== SMART DRAWING SCALE
						 * ==================================================
						 *
						 * Drawing grows according to table height.
						 *
						 * Bigger table -> bigger drawing.
						 *
						 * Small table -> original drawing size maintained.
						 */
						float drawingScale = calculateSmartDrawingScale(origH, renderedPanelH);

						float drawingW = origW * drawingScale;

						float drawingH = origH * drawingScale;

						/*
						 * Find tallest side.
						 *
						 * Usually:
						 *
						 * drawingH ~= panelH
						 *
						 * because our smart scale tries to balance them.
						 */
						float contentHeight = Math.max(drawingH, renderedPanelH);

						/*
						 * Table starts immediately after drawing.
						 */
						float targetX = drawingW + gapDrawingToTables;

						/*
						 * ================================================== DYNAMIC PAGE WIDTH
						 * ==================================================
						 *
						 * Increase canvas instead of shrinking table.
						 */
						float calculatedWidth = targetX + renderedPanelW + PAGE_EDGE_GAP;

						/*
						 * IMPORTANT:
						 *
						 * Do NOT force the final page back to the original DXF-PDF
						 * canvas size. The original temporary PDF can contain large
						 * internal blank margins. Reusing origW/origH here was the
						 * reason the final scrutinized PDF still had a huge white
						 * canvas even after drawingScale was calculated.
						 */
						float newW = calculatedWidth;

						/*
						 * ================================================== DYNAMIC PAGE HEIGHT
						 * ==================================================
						 *
						 * Final page height is driven only by the balanced visible
						 * content, not by the temporary DXF PDF page height.
						 */
						float calculatedHeight = gapTop + contentHeight + PAGE_EDGE_GAP;
						float newH = calculatedHeight;

						/*
						 * ================================================== TOP ALIGN BOTH
						 * ==================================================
						 *
						 * Drawing and table both start from same top line.
						 */
						float topY = newH - gapTop;

						float drawingY = topY - drawingH;

						float panelY = topY - renderedPanelH;

						LOG.info("--------------------------------------------------------");

						LOG.info("PDF Page {} Layout Details", i + 1);

						LOG.info("Original drawing PDF -> W={} H={}", origW, origH);

						LOG.info("Table -> W={} H={}", renderedPanelW, renderedPanelH);

						LOG.info("Calculated Drawing Scale -> {}", drawingScale);

						LOG.info("Final Drawing -> W={} H={}", drawingW, drawingH);

						LOG.info("Drawing/Table Gap -> {}", gapDrawingToTables);

						LOG.info("Table X Position -> {}", targetX);

						LOG.info("Drawing Y Position -> {}", drawingY);

						LOG.info("Table Y Position -> {}", panelY);

						LOG.info("Final Page -> W={} H={}", newW, newH);

						/*
						 * Create final page.
						 */
						PDPage outPage = new PDPage(new PDRectangle(newW, newH));

						outputDoc.addPage(outPage);

						/*
						 * Import drawing page.
						 */
						PDFormXObject drawingForm = lu.importPageAsForm(baseDoc, i);

						try (PDPageContentStream cs = new PDPageContentStream(outputDoc, outPage,
								PDPageContentStream.AppendMode.APPEND, true, true)) {

							/*
							 * ============================================= WHITE BACKGROUND
							 * =============================================
							 */
							cs.setNonStrokingColor(1f, 1f, 1f);

							cs.addRect(0, 0, newW, newH);

							cs.fill();

							/*
							 * ============================================= DRAWING
							 * =============================================
							 *
							 * Uniform scaling:
							 *
							 * X scale == Y scale.
							 *
							 * Therefore drawing aspect ratio remains intact.
							 */
							cs.saveGraphicsState();

							cs.transform(Matrix.getTranslateInstance(0, drawingY));

							cs.transform(Matrix.getScaleInstance(drawingScale, drawingScale));

							cs.drawForm(drawingForm);

							cs.restoreGraphicsState();

							/*
							 * ============================================= TABLE
							 * =============================================
							 *
							 * IMPORTANT:
							 *
							 * NO SCALE MATRIX applied.
							 *
							 * Therefore:
							 *
							 * table width remains unchanged font remains unchanged column layout remains
							 * unchanged
							 */
							cs.saveGraphicsState();

							cs.transform(Matrix.getTranslateInstance(targetX, panelY));

							cs.drawForm(panelForm);

							cs.restoreGraphicsState();
						}
					}
				}

				/*
				 * Open PDF in Fit Page mode.
				 */
				if (outputDoc.getNumberOfPages() > 0) {

					org.apache.pdfbox.pdmodel.interactive.documentnavigation.destination.PDPageFitDestination dest = new org.apache.pdfbox.pdmodel.interactive.documentnavigation.destination.PDPageFitDestination();

					dest.setPage(outputDoc.getPage(0));

					outputDoc.getDocumentCatalog().setOpenAction(dest);
				}

				outputDoc.save(composedPdf);
			}

			/*
			 * inputPdf and outputFileName may point to same file.
			 *
			 * Replace only after PDFBox documents are closed.
			 */
			Files.copy(composedPdf.toPath(), outputFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

			if (!outputFile.isFile() || outputFile.length() == 0L) {

				throw new IOException("Composed scrutinized PDF is empty: " + outputFile.getAbsolutePath());
			}

			LOG.info("SMART PDF COMPOSITION COMPLETED -> {}", outputFile.getAbsolutePath());

			LOG.info("========================================================");

		} finally {

			if (panelPdf.exists() && !panelPdf.delete()) {

				panelPdf.deleteOnExit();
			}

			if (composedPdf.exists() && !composedPdf.delete()) {

				composedPdf.deleteOnExit();
			}
		}

		return outputFile;
	}

	/**
	 * Dynamically calculates drawing scale according to table height.
	 *
	 * Rules:
	 *
	 * 1. The temporary DXF PDF page may be scaled down because it can contain
	 *    blank canvas around the real drawing.
	 * 2. Drawing page height is balanced against the table height.
	 * 3. Scale is capped in both directions for safety.
	 *
	 * @param drawingHeight original generated drawing PDF height
	 * @param tableHeight   final rendered table height
	 * @return safe uniform drawing scale
	 */
	private float calculateSmartDrawingScale(float drawingHeight, float tableHeight) {

		if (drawingHeight <= 0f || tableHeight <= 0f) {

			LOG.warn("Invalid drawing/table height. drawingHeight={}, tableHeight={}. Using scale 1.", drawingHeight,
					tableHeight);

			return 1.0f;
		}

		/*
		 * Target drawing visual height.
		 */
		float desiredDrawingHeight = tableHeight * TARGET_DRAWING_TO_TABLE_HEIGHT_RATIO;

		float requiredScale = desiredDrawingHeight / drawingHeight;

		/*
		 * The temporary DXF PDF is only an intermediate vector canvas.
		 * It is safe to scale it down when its page is taller than the
		 * scrutiny table. This removes the giant blank final canvas.
		 */
		if (requiredScale < MIN_DRAWING_SCALE) {
			requiredScale = MIN_DRAWING_SCALE;
		}

		/*
		 * Safety limit for very tall tables.
		 */
		if (requiredScale > MAX_DRAWING_SCALE) {

			LOG.info("Drawing scale {} exceeds maximum {}. Capping scale.", requiredScale, MAX_DRAWING_SCALE);

			requiredScale = MAX_DRAWING_SCALE;
		}

		return requiredScale;
	}

	/**
	 * If HTML table produces multiple pages, combine them vertically into one long
	 * PDF page.
	 */
	private PDDocument flattenPanelPages(PDDocument panelDoc) throws IOException {

		if (panelDoc.getNumberOfPages() <= 1) {

			PDDocument single = new PDDocument();

			single.importPage(panelDoc.getPage(0));

			return single;
		}

		float maxW = 0f;
		float totalH = 0f;

		for (int i = 0; i < panelDoc.getNumberOfPages(); i++) {

			PDRectangle mb = panelDoc.getPage(i).getMediaBox();

			maxW = Math.max(maxW, mb.getWidth());

			totalH += mb.getHeight();
		}

		LOG.info("Flattening {} table pages -> width={} height={}", panelDoc.getNumberOfPages(), maxW, totalH);

		PDDocument flattened = new PDDocument();

		PDPage onePage = new PDPage(new PDRectangle(maxW, totalH));

		flattened.addPage(onePage);

		LayerUtility lu = new LayerUtility(flattened);

		float yTop = totalH;

		try (PDPageContentStream cs = new PDPageContentStream(flattened, onePage, PDPageContentStream.AppendMode.APPEND,
				true, true)) {

			for (int i = 0; i < panelDoc.getNumberOfPages(); i++) {

				PDPage src = panelDoc.getPage(i);

				PDRectangle mb = src.getMediaBox();

				PDFormXObject form = lu.importPageAsForm(panelDoc, i);

				yTop -= mb.getHeight();

				cs.saveGraphicsState();

				cs.transform(Matrix.getTranslateInstance(0, yTop));

				cs.drawForm(form);

				cs.restoreGraphicsState();
			}
		}

		return flattened;
	}

	/**
	 * Generates the table PDF.
	 *
	 * IMPORTANT:
	 *
	 * panelWidthPt is FIXED_PANEL_WIDTH. Therefore table width remains stable.
	 */
	private byte[] renderPanelPdf(JsonNode additionalDetails, float panelWidthPt) throws IOException {
		logXmlFactories();
		
		Context context = new Context();

		context.setVariable("sections", buildSections(additionalDetails));

		String html = templateEngine.process("imposePdfInto", context);

		/*
		 * Defensive cleanup only. This does not change report/business data.
		 * It protects the renderer from accidental literal PowerShell newline
		 * sequences and CSS properties unsupported by the current OpenHTMLToPDF
		 * version.
		 */
		html = sanitizeHtmlForPdf(html);

		/*
		 * OpenHTMLToPDF does not support auto page height.
		 *
		 * Render using standard 297mm pages and combine multiple pages afterwards.
		 */
		String widthCss = "<style>@page { size: " + ptToMm(panelWidthPt) + "mm 297mm; margin: 8pt; }</style>";

		String htmlWithSize = html.replace("</head>", widthCss + "</head>");

		ByteArrayOutputStream os = new ByteArrayOutputStream();

		PdfRendererBuilder builder = new PdfRendererBuilder();

		 builder.useTransformerFactoryImplementationClass(null);
		 builder.useDocumentBuilderFactoryImplementationClass(null);
		  		 
		//builder.withHtmlContent(htmlWithSize, null);
		 Document document =
			        createSecureW3cDocument(htmlWithSize);

			builder.withW3cDocument(
			        document,
			        null
			);
		builder.toStream(os);

		builder.run();

		return os.toByteArray();
	}
	
	public static Document createSecureW3cDocument(String html) throws IOException {

    if (html == null || html.trim().isEmpty()) {
        throw new IOException("HTML content is empty");
    }

    try {

        /*
         * XML parser with disallow-doctype-decl=true will reject:
         *
         * <!DOCTYPE html>
         *
         * OpenHTMLToPDF does not need this declaration when
         * a pre-built W3C Document is supplied.
         *
         * Remove only the DOCTYPE declaration.
         */
        String safeHtml = html.replaceFirst(
                "(?is)<!DOCTYPE\\s+html\\s*>",
                ""
        );

        DocumentBuilderFactory factory =
                DocumentBuilderFactory.newInstance();

        factory.setNamespaceAware(true);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);

        /*
         * Keep DOCTYPE disabled for XXE protection.
         */
        factory.setFeature(
                "http://apache.org/xml/features/disallow-doctype-decl",
                true
        );

        /*
         * Disable external entities.
         */
        factory.setFeature(
                "http://xml.org/sax/features/external-general-entities",
                false
        );

        factory.setFeature(
                "http://xml.org/sax/features/external-parameter-entities",
                false
        );

        factory.setFeature(
                "http://apache.org/xml/features/nonvalidating/load-external-dtd",
                false
        );

        try {
            factory.setFeature(
                    XMLConstants.FEATURE_SECURE_PROCESSING,
                    true
            );
        } catch (Exception e) {
            LOG.debug(
                    "XML secure-processing feature not supported by current parser",
                    e
            );
        }

        DocumentBuilder documentBuilder =
                factory.newDocumentBuilder();

        /*
         * Never resolve external entities.
         */
        documentBuilder.setEntityResolver(
                (publicId, systemId) ->
                        new org.xml.sax.InputSource(
                                new java.io.StringReader("")
                        )
        );

        byte[] htmlBytes =
                safeHtml.getBytes(StandardCharsets.UTF_8);

        try (ByteArrayInputStream inputStream =
                     new ByteArrayInputStream(htmlBytes)) {

            return documentBuilder.parse(inputStream);
        }

    } catch (Exception e) {

        throw new IOException(
                "Unable to securely parse HTML before PDF rendering",
                e
        );
    }
}
	

	private void logXmlFactories() {

	    try {

	        javax.xml.transform.TransformerFactory transformerFactory =
	                javax.xml.transform.TransformerFactory.newInstance();

	        LOG.info(
	                "Runtime TransformerFactory = {}",
	                transformerFactory.getClass().getName()
	        );

	    } catch (Exception e) {

	        LOG.warn(
	                "Unable to detect TransformerFactory",
	                e
	        );
	    }

	    try {

	        javax.xml.parsers.DocumentBuilderFactory documentBuilderFactory =
	                javax.xml.parsers.DocumentBuilderFactory.newInstance();

	        LOG.info(
	                "Runtime DocumentBuilderFactory = {}",
	                documentBuilderFactory.getClass().getName()
	        );

	    } catch (Exception e) {

	        LOG.warn(
	                "Unable to detect DocumentBuilderFactory",
	                e
	        );
	    }

	    try {

	        javax.xml.parsers.SAXParserFactory saxParserFactory =
	                javax.xml.parsers.SAXParserFactory.newInstance();

	        LOG.info(
	                "Runtime SAXParserFactory = {}",
	                saxParserFactory.getClass().getName()
	        );

	    } catch (Exception e) {

	        LOG.warn(
	                "Unable to detect SAXParserFactory",
	                e
	        );
	    }
	}
	
	private List<Map<String, Object>> buildSections(JsonNode root) {

		JsonNode d = root.path("details");

		List<Map<String, Object>> sections = new ArrayList<Map<String, Object>>();

		addLabeledKeyValueSection(sections, "left", "Application Details", d.path("applicationDetails"),
				new String[][] { { "Name of Applicant", "nameOfApplicant" }, { "File Number", "fileNumber" },
						{ "eDCR Number", "edcrNumber" }, { "ULB Name", "ulbName" }, { "ULB Type", "ulbType" },
						{ "Building Category", "buildingCategory" }, { "Proposed Site Address", "proposedSiteAddress" },
						{ "Khasra No.", "khasraNo" }, { "Zone", "zone" } });

		addLabeledKeyValueSection(sections, "left", "Plot Area Details", d.path("plotAreaDetails"),
				new String[][] { { "Plot Area as per Drawing (m²)", "plotAreaAsPerDrawing" },
						{ "Plot Area as per Declaration (m²)", "plotAreaAsPerDeclaration" } });

		addLabeledKeyValueSection(sections, "left", "Built Up Area", d.path("builtUpArea"),
				new String[][] { { "Existing Built-Up Area (m²)", "existingBuiltUpArea" },
						{ "Proposed Built-Up Area (m²)", "proposedBuiltUpArea" },
						{ "Total Built-Up Area (m²)", "totalBuiltUpArea" } });

		addTripleSection(sections, "left", "FAR Details", d.path("farDetails"), Arrays.asList("Description", "FAR"),
				new String[][] { { "Total Permissible FAR", safeText(d.path("farDetails"), "totalPermissibleFAR") },
						{ "Total Proposed FAR", safeText(d.path("farDetails"), "totalProposedFAR") } });

		addTripleSection(sections, "left", "ECS Details", d.path("ecsDetails"),
				Arrays.asList("Description", "Required", "Provided"),
				new String[][] {
						{ "Parking", safeText(d.path("ecsDetails"), "required"),
								safeText(d.path("ecsDetails"), "parking") },
						{ "Two-Wheeler Parking", "", safeText(d.path("ecsDetails"), "twoWheelerParking") },
						{ "Open Parking Area", "", safeText(d.path("ecsDetails"), "openParkingArea") },
						{ "Stilt Parking", "", safeText(d.path("ecsDetails"), "stiltParkingArea") },
						{ "Covered Parking", "", safeText(d.path("ecsDetails"), "coveredParkingArea") },
						{ "Basement Parking Area", "", safeText(d.path("ecsDetails"), "basementParkingArea") } });

		addTripleSection(sections, "left", "Building Height", d.path("buildingHeight"),
				Arrays.asList("Description", "Permissible", "Proposed"),
				new String[][] {
						{ "Building Height (m)", safeText(d.path("buildingHeight"), "permissibleBuildingHeight"),
								safeText(d.path("buildingHeight"), "proposedBuildingHeight") },
						{ "Total Building Height (m)", safeText(d.path("buildingHeight"), "permissibleTotalHeight"),
								safeText(d.path("buildingHeight"), "proposedTotalHeight") } });

		addLabeledKeyValueSection(sections, "left", "Road Description", d.path("roadDescription"),
				new String[][] { { "Approach Road Width (m)", "approachRoadWidth" },
						{ "Rear Side Road Width (m)", "rearSideRoadWidth" },
						{ "Side 1 Road Width (m)", "side1RoadWidth" }, { "Side 2 Road Width (m)", "side2RoadWidth" } });

		addBlockWiseSummary(sections, "right", d.path("blockWiseSummary"));

		addDynamicBlocks(sections, "right", d.path("blocks"));

		addSetbacks(sections, "right", d.path("setbacks"));

		addLabeledKeyValueSection(sections, "left", "Professional's Signature", d.path("professionalSignature"),
				new String[][] { { "Signature", "uploadedSignature" } });

		addLabeledKeyValueSection(sections, "left", "Office Use", d.path("officeUse"),
				new String[][] { { "Approved/Sanctioned By", "approvedSanctionedBy" },
						{ "Approval/Sanction Date", "approvalSanctionDate" }, { "Valid Till", "validTill" } });

		addESignSection(sections, "left", d.path("eSign"));

		return sections;
	}

	private void addESignSection(List<Map<String, Object>> sections, String side, JsonNode eSignNode) {

		Map<String, Object> s = new HashMap<String, Object>();

		s.put("side", side);

		s.put("showHeader", false);

		s.put("title", "E-sign");

		s.put("columns", Arrays.asList("Field", "Value"));

		List<List<String>> rows = new ArrayList<List<String>>();

		if (eSignNode.isArray()) {

			for (JsonNode sign : eSignNode) {

				rows.add(Arrays.asList(safeText(sign, "signatoryName"), safeText(sign, "designation")));
			}

		} else if (!eSignNode.isMissingNode()) {

			rows.add(Arrays.asList(safeText(eSignNode, "signatoryName"), safeText(eSignNode, "designation")));
		}

		if (rows.isEmpty()) {

			rows.add(Arrays.asList("N/A", "N/A"));
		}

		s.put("rows", rows);

		sections.add(s);
	}

	private void addDynamicBlocks(List<Map<String, Object>> sections, String side, JsonNode blocks) {

		if (!blocks.isArray()) {

			return;
		}

		for (JsonNode b : blocks) {

			String blockName = normalizeBlockName(safeText(b, "blockName"));

			String sectionTitle = safeText(b, "proposedTitle");

			if ("N/A".equals(sectionTitle)) {

				sectionTitle = "1. " + blockName + " - Proposed Details";
			}

			if (b.path("proposedDetails").isArray()) {

				addArrayAsTable(sections, side, sectionTitle, b.path("proposedDetails"),
						Arrays.asList("Floor", "Occupancy/Sub Occupancy", "Built Up Area in m²", "Deduction Area in m²",
								"Floor Area in m²"),
						Arrays.asList("floor", "occupancySubOccupancy", "builtUpArea", "deductionArea", "floorArea"));

				addRemarksSection(sections, side, b.path("remarks"));

				continue;
			}

			addArrayAsTable(sections, side, blockName + " - Floor wise Built Up/FAR", b.path("floorWiseBuiltUpFAR"),
					Arrays.asList("Floor", "Eff. Built-Up (m²)", "Exist. Built-Up (m²)", "Proposed FAR (m²)",
							"Existing FAR (m²)"),
					Arrays.asList("floor", "effectiveBuiltUpArea", "existingBuiltUpArea", "proposedFAR",
							"existingFAR"));
		}
	}

	private void addArrayAsTable(List<Map<String, Object>> sections, String side, String title, JsonNode arr,
			List<String> columns, List<String> keys) {

		Map<String, Object> s = new HashMap<String, Object>();

		s.put("side", side);

		s.put("showHeader", true);

		s.put("title", title);

		s.put("columns", columns);

		List<List<String>> rows = new ArrayList<List<String>>();

		if (arr.isArray()) {

			for (JsonNode item : arr) {

				List<String> row = new ArrayList<String>();

				String floorValue = safeText(item, "floor");

				for (int i = 0; i < keys.size(); i++) {

					String value = safeText(item, keys.get(i));

					if (i > 1 && "Total".equalsIgnoreCase(floorValue) && "N/A".equals(value)) {

						value = "0.0";
					}

					row.add(value);
				}

				rows.add(row);
			}
		}

		s.put("rows", rows);

		sections.add(s);
	}

	private String normalizeBlockName(String rawBlockName) {

		if (rawBlockName == null || rawBlockName.trim().isEmpty() || "N/A".equalsIgnoreCase(rawBlockName)) {

			return "Block No 1";
		}

		String normalized = rawBlockName.replace(" - Proposed Details", "").trim();

		java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)").matcher(normalized);

		if (m.find()) {

			return "Block No " + m.group(1);
		}

		return normalized.replace("Block", "Block No").replaceAll("\\s+", " ").trim();
	}

	private void addRemarksSection(List<Map<String, Object>> sections, String side, JsonNode remarksNode) {

		String remarks = remarksNode == null || remarksNode.isMissingNode() || remarksNode.isNull() ? ""
				: remarksNode.asText("");

		if (remarks.trim().isEmpty() || "N/A".equalsIgnoreCase(remarks.trim())) {

			return;
		}

		Map<String, Object> s = new HashMap<String, Object>();

		s.put("side", side);

		s.put("showHeader", false);

		s.put("title", "");

		s.put("hideTitle", true);

		s.put("columns", Arrays.asList("Remarks"));

		List<List<String>> rows = new ArrayList<List<String>>();

		String[] lines = remarks.split("\\r?\\n");

		for (String line : lines) {

			if (line != null && !line.trim().isEmpty()) {

				rows.add(Arrays.asList(line.trim()));
			}
		}

		if (!rows.isEmpty()) {

			s.put("rows", rows);

			sections.add(s);
		}
	}

	private void addSetbacks(List<Map<String, Object>> sections, String side, JsonNode setNode) {

		Map<String, Object> s = new HashMap<String, Object>();

		s.put("side", side);

		s.put("showHeader", true);

		s.put("title", "Setbacks");

		s.put("columns", Arrays.asList("Description", "Permissible", "Provided"));

		List<List<String>> rows = new ArrayList<List<String>>();

		rows.add(Arrays.asList("Front", safeText(setNode, "frontPermissible"), safeText(setNode, "frontProvided")));

		rows.add(Arrays.asList("Rear", safeText(setNode, "rearPermissible"), safeText(setNode, "rearProvided")));

		rows.add(Arrays.asList("Side 1", safeText(setNode, "side1Permissible"), safeText(setNode, "side1Provided")));

		rows.add(Arrays.asList("Side 2", safeText(setNode, "side2Permissible"), safeText(setNode, "side2Provided")));

		s.put("rows", rows);

		sections.add(s);
	}

	private void addBlockWiseSummary(List<Map<String, Object>> sections, String side, JsonNode bws) {

		Map<String, Object> s = new HashMap<String, Object>();

		s.put("side", side);

		s.put("showHeader", true);

		s.put("title", "Block Wise Summary");

		s.put("columns", Arrays.asList("Total Plot Area (m²)", "Ground Coverage (m²)", "Total Built-up Area (m²)",
				"Total FAR Area (m²)"));

		s.put("rows", Arrays.asList(Arrays.asList(safeText(bws, "totalPlotArea"), safeText(bws, "groundCoverage"),
				safeText(bws, "totalBuiltUpArea"), safeText(bws, "totalFARArea"))));

		sections.add(s);
	}

	private void addTripleSection(List<Map<String, Object>> sections, String side, String title, JsonNode node,
			List<String> columns, String[][] rowsData) {

		Map<String, Object> s = new HashMap<String, Object>();

		s.put("side", side);

		s.put("showHeader", true);

		s.put("title", title);

		s.put("columns", columns);

		List<List<String>> rows = new ArrayList<List<String>>();

		for (String[] r : rowsData) {

			rows.add(Arrays.asList(r));
		}

		s.put("rows", rows);

		sections.add(s);
	}

	private void addKeyValueSection(List<Map<String, Object>> sections, String title, JsonNode node,
			List<String> keys) {

		Map<String, Object> s = new HashMap<String, Object>();

		s.put("title", title);

		s.put("columns", Arrays.asList("Field", "Value"));

		List<List<String>> rows = new ArrayList<List<String>>();

		for (String key : keys) {

			rows.add(Arrays.asList(toLabel(key), safeText(node, key)));
		}

		s.put("rows", rows);

		sections.add(s);
	}

	private void addLabeledKeyValueSection(List<Map<String, Object>> sections, String title, JsonNode node,
			String[][] labelsAndKeys) {

		Map<String, Object> s = new HashMap<String, Object>();

		s.put("side", "left");

		s.put("showHeader", false);

		s.put("title", title);

		s.put("columns", Arrays.asList("Field", "Value"));

		s.put("renderSignatureImage", "Professional's Signature".equals(title));

		List<List<String>> rows = new ArrayList<List<String>>();

		for (String[] pair : labelsAndKeys) {

			String value = safeText(node, pair[1]);

			value = prepareCellValue(title, pair[1], value);

			rows.add(Arrays.asList(pair[0], value));
		}

		s.put("rows", rows);

		sections.add(s);
	}

	private void addLabeledKeyValueSection(List<Map<String, Object>> sections, String side, String title, JsonNode node,
			String[][] labelsAndKeys) {

		Map<String, Object> s = new HashMap<String, Object>();

		s.put("side", side);

		s.put("showHeader", false);

		s.put("title", title);

		s.put("columns", Arrays.asList("Field", "Value"));

		s.put("renderSignatureImage", "Professional's Signature".equals(title));

		List<List<String>> rows = new ArrayList<List<String>>();

		for (String[] pair : labelsAndKeys) {

			String value = safeText(node, pair[1]);

			value = prepareCellValue(title, pair[1], value);

			rows.add(Arrays.asList(pair[0], value));
		}

		s.put("rows", rows);

		sections.add(s);
	}

	/**
	 * Prepares only renderer-specific values. No report/business value is changed.
	 */
	private String prepareCellValue(String title, String key, String value) {

		if ("Professional's Signature".equals(title) && "uploadedSignature".equals(key)) {

			return normalizeSignatureImageForPdf(value);
		}

		return value;
	}

	/**
	 * Converts an embedded Base64 signature image to a clean PNG before it reaches
	 * OpenHTMLToPDF/PDFBox. Re-encoding strips problematic JPEG metadata which can
	 * cause warnings such as "Unsupported element precision".
	 *
	 * URL/path based images are intentionally left unchanged so the existing image
	 * resolution/loading flow is preserved.
	 */
	private String normalizeSignatureImageForPdf(String imageSource) {

		if (imageSource == null || imageSource.trim().isEmpty()
				|| "N/A".equalsIgnoreCase(imageSource.trim())) {

			return imageSource;
		}

		String source = imageSource.trim();

		/*
		 * Preserve the existing behavior for URL/path based images. Only embedded
		 * Base64 data URIs are normalized.
		 */
		if (!source.startsWith("data:image/")) {

			return source;
		}

		try {

			int commaIndex = source.indexOf(',');

			if (commaIndex <= 0) {

				LOG.warn("Invalid signature image data URI. Keeping original value.");

				return source;
			}

			String metadata = source.substring(0, commaIndex).toLowerCase();

			if (!metadata.contains(";base64")) {

				LOG.warn("Signature image data URI is not Base64 encoded. Keeping original value.");

				return source;
			}

			String base64Data = source.substring(commaIndex + 1);

			byte[] originalImageBytes = Base64.getDecoder().decode(base64Data);

			if (originalImageBytes.length == 0) {

				return source;
			}

			BufferedImage originalImage;

			try (ByteArrayInputStream inputStream = new ByteArrayInputStream(originalImageBytes)) {

				originalImage = ImageIO.read(inputStream);
			}

			if (originalImage == null) {

				LOG.warn("Unable to decode signature image for PDF normalization. Keeping original value.");

				return source;
			}

			BufferedImage normalizedImage = new BufferedImage(originalImage.getWidth(), originalImage.getHeight(),
					BufferedImage.TYPE_INT_ARGB);

			Graphics2D graphics = normalizedImage.createGraphics();

			try {

				graphics.drawImage(originalImage, 0, 0, null);

			} finally {

				graphics.dispose();
			}

			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

			boolean written = ImageIO.write(normalizedImage, "png", outputStream);

			if (!written) {

				LOG.warn("Unable to encode normalized signature image as PNG. Keeping original value.");

				return source;
			}

			byte[] normalizedBytes = outputStream.toByteArray();

			String normalizedBase64 = Base64.getEncoder().encodeToString(normalizedBytes);

			LOG.debug("Signature image normalized for PDF. Original={} bytes, PNG={} bytes, Width={}, Height={}",
					originalImageBytes.length, normalizedBytes.length, originalImage.getWidth(), originalImage.getHeight());

			return "data:image/png;base64," + normalizedBase64;

		} catch (Exception e) {

			/*
			 * Preserve existing behavior if normalization is not possible. This prevents
			 * the defensive cleanup from changing application/report logic.
			 */
			LOG.warn("Unable to normalize signature image for PDF. Keeping original value. Cause={}", e.getMessage());

			return source;
		}
	}

	/**
	 * Defensive cleanup for generated HTML before it is passed to OpenHTMLToPDF.
	 *
	 * This only fixes malformed/unsupported renderer syntax; report data and layout
	 * calculations are not changed.
	 */
	private String sanitizeHtmlForPdf(String html) {

		if (html == null) {

			return "";
		}

		return html.replace("`r`n", "\r\n")
				.replace("`n", "\n")
				.replace("`r", "\r")
				.replace("object-fit: contain;", "")
				.replace("object-fit:contain;", "");
	}

	private String safeText(JsonNode node, String field) {

		if (node == null || node.isMissingNode()) {

			return "N/A";
		}

		JsonNode child = node.path(field);

		if (child.isMissingNode() || child.isNull()) {

			return "N/A";
		}

		if (child.isBoolean()) {

			return child.asBoolean() ? "Yes" : "No";
		}

		String val = child.asText("").trim();

		return val.isEmpty() || "null".equalsIgnoreCase(val) ? "N/A" : val;
	}

	private String toLabel(String key) {

		if (key == null || key.isEmpty()) {

			return "";
		}

		StringBuilder out = new StringBuilder();

		out.append(Character.toUpperCase(key.charAt(0)));

		for (int i = 1; i < key.length(); i++) {

			char c = key.charAt(i);

			if (Character.isUpperCase(c)) {

				out.append(' ');
			}

			out.append(c);
		}

		return out.toString();
	}

	/*
	 * Existing utility retained to avoid impacting any future/external usage.
	 */
	private File expandPageCanvas(File inputPdf, float expandRight, float expandBottom) throws IOException {

		File output = File.createTempFile("expanded_", ".pdf");

		try (PDDocument inputDoc = PDDocument.load(inputPdf);

				PDDocument outputDoc = new PDDocument()) {

			LayerUtility lu = new LayerUtility(outputDoc);

			for (int i = 0; i < inputDoc.getNumberOfPages(); i++) {

				PDPage srcPage = inputDoc.getPage(i);

				float origW = srcPage.getMediaBox().getWidth();

				float origH = srcPage.getMediaBox().getHeight();

				float newW = origW + expandRight;

				float newH = origH + expandBottom;

				PDPage newPage = new PDPage(new PDRectangle(newW, newH));

				outputDoc.addPage(newPage);

				try (PDPageContentStream cs = new PDPageContentStream(outputDoc, newPage)) {

					cs.setNonStrokingColor(1f, 1f, 1f);

					cs.addRect(0, 0, newW, newH);

					cs.fill();
				}

				PDFormXObject form = lu.importPageAsForm(inputDoc, i);

				try (PDPageContentStream cs = new PDPageContentStream(outputDoc, newPage,
						PDPageContentStream.AppendMode.APPEND, true, true)) {

					cs.transform(Matrix.getTranslateInstance(0, expandBottom));

					cs.drawForm(form);
				}
			}

			outputDoc.save(output);
		}

		return output;
	}

	private float ptToMm(float pt) {

		return (pt * 25.4f) / 72f;
	}
}