package org.egov.common.entity.edcr;

import java.io.Serializable;
import java.util.List;

public class PlotFrontage implements Serializable{
	private List<Measurement> frontage;

	public List<Measurement> getFrontage() {
		return frontage;
	}

	public void setFrontage(List<Measurement> frontage) {
		this.frontage = frontage;
	}
	
}
