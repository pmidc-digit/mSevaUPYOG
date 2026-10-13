package org.egov.edcr.feature;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.PageLayoutInfo;
import org.egov.common.entity.edcr.Plan;
import org.egov.edcr.entity.blackbox.MeasurementDetail;
import org.egov.edcr.entity.blackbox.PlanDetail;
import org.egov.edcr.utility.Util;
import org.kabeja.dxf.Bounds;
import org.kabeja.dxf.DXFLWPolyline;
import org.springframework.stereotype.Service;

@Service
public class PageSizeExtract extends FeatureExtract {
	private static final Logger LOG = LogManager.getLogger(PageSizeExtract.class);

	private static final String WORK_SHEET_LAYER = "WORK_SHEET";

	private static class PaperSize {
		final String name;
		final double width;
		final double height;

		PaperSize(String name, double width, double height) {
			this.name = name;
			this.width = width;
			this.height = height;
		}
	}

	private static final List<PaperSize> ALLOWED_PAPER_SIZES = Arrays.asList(new PaperSize("A3", 0.366, 0.267),
			new PaperSize("A2", 0.540, 0.390), new PaperSize("A1", 0.811, 0.540), new PaperSize("A0", 1.135, 0.811),
			new PaperSize("2A0", 1.689, 1.189), new PaperSize("4A0", 2.385, 1.681));

	private static final double SCALE_TOLERANCE = 0.01;

	@Override
	public PlanDetail validate(PlanDetail planDetail) {

		List<Measurement> pageSizes = planDetail.getPageSize();

		if (pageSizes == null || pageSizes.isEmpty()) {
			return planDetail;
		}

		List<PageLayoutInfo> layouts = new ArrayList<>();

		int pageNo = 1;

		for (Measurement measurement : pageSizes) {

			PageLayoutInfo layout = validatePageLayout(planDetail, measurement);

			if (layout != null) {
				layout.setPageOrder(pageNo);
				layouts.add(layout);
			}

			pageNo++;
		}

		planDetail.setPageLayouts(layouts);
		LOG.info("Total PageLayouts = {}", layouts.size());

		for (PageLayoutInfo layout : layouts) {
			LOG.info("Page={} Paper={} Scale={}", layout.getPageOrder(), layout.getPaperSize(),
					layout.getDrawingScale());
		}

		// Backward compatibility
		if (!layouts.isEmpty()) {
			planDetail.setPaperSize(layouts.get(0).getPaperSize());
			planDetail.setDrawingScale(layouts.get(0).getDrawingScale());
		} else {
			planDetail.setPaperSize(null);
			planDetail.setDrawingScale(null);
		}
		return planDetail;
	}

	@Override
	public PlanDetail extract(PlanDetail planDetail) {

		List<DXFLWPolyline> ps = Util.getPolyLinesByLayer(planDetail.getDoc(), WORK_SHEET_LAYER);

		LOG.info("WORK_SHEET polylines found = {}", ps == null ? 0 : ps.size());

		// WORK_SHEET layer is missing
		if (ps == null || ps.isEmpty()) {
			if (Plan.isWorkSheetValidationEnabled()) {
				planDetail.addError("WORK_SHEET", "WORK_SHEET layer is not provided in the drawing.");
			}
			return planDetail;
		}

		// Use only the largest polyline (the outer border). Nested/inner polylines would
		// otherwise be treated as extra pages and raise false size errors.
		DXFLWPolyline sheet = null;
		double bestArea = -1;
		for (DXFLWPolyline p : ps) {
			Bounds b = p.getBounds();
			if (b == null) {
				continue;
			}
			double area = (b.getMaximumX() - b.getMinimumX()) * (b.getMaximumY() - b.getMinimumY());
			if (area > bestArea) {
				bestArea = area;
				sheet = p;
			}
		}
		if (sheet == null) {
			sheet = ps.get(0);
		}

		Measurement measurement = new MeasurementDetail(sheet, true);
		planDetail.setPageSize(Collections.singletonList(measurement));

		validate(planDetail);

		return planDetail;
	}

	private PageLayoutInfo validatePageLayout(PlanDetail planDetail, Measurement measurement) {

		double length = measurement.getHeight().doubleValue();
		double breadth = measurement.getWidth().doubleValue();

		LOG.info("Length={}, Width={}", measurement.getHeight(), measurement.getWidth());

		double width = Math.max(length, breadth);
		double height = Math.min(length, breadth);

		for (PaperSize paper : ALLOWED_PAPER_SIZES) {

			double paperWidth = Math.max(paper.width, paper.height);
			double paperHeight = Math.min(paper.width, paper.height);

			double scaleWidth = width / paperWidth;
			double scaleHeight = height / paperHeight;

			LOG.info("Checking paper {} -> scaleWidth={}, scaleHeight={}", paper.name, scaleWidth, scaleHeight);

			if (Math.abs(scaleWidth - scaleHeight) <= SCALE_TOLERANCE) {

				int scale = (int) Math.round(scaleWidth);

				if (Math.abs(scaleWidth - scale) <= SCALE_TOLERANCE
						&& Math.abs(scaleHeight - scale) <= SCALE_TOLERANCE) {

					LOG.info("Matched Paper Size={}, Drawing Scale=1:{}", paper.name, scale);

					return new PageLayoutInfo(paper.name, scale);
				}
			}
		}

		if (Plan.isWorkSheetValidationEnabled()) {
			planDetail.addError("WORK_SHEET",
					"Invalid WORK_SHEET size: " + measurement.getHeight() + " x " + measurement.getWidth()
							+ ". It must correspond to one of the supported paper sizes "
							+ "(A3, A2, A1, A0, 2A0 or 4A0) at a valid drawing scale.");
		}

		return null;
	}

}