package org.egov.wscalculation.web.models;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class BillingSlab {
	private String id;
	private String buildingType = null;
	private String connectionType = null;
	private String waterSubUsageType=null;
	private String calculationAttribute = null;
	private double minimumCharge;

	@JsonProperty("isminimumchargenotapplied")
	@JsonAlias({"isMinimumChargeNotApplied", "isminimumchargenotapplied"})
	private Boolean isminimumchargenotapplied;

	@JsonProperty("ismeterstatusapplied")
	@JsonAlias({"isMeterStatusApplied", "ismeterstatusapplied"})
	private List<String> ismeterstatusapplied;

	private List<Slab> slabs = new ArrayList<>();

	public Boolean getIsminimumchargenotapplied() {
		return isminimumchargenotapplied;
	}

	public void setIsminimumchargenotapplied(Boolean isminimumchargenotapplied) {
		this.isminimumchargenotapplied = isminimumchargenotapplied;
	}

	public List<String> getIsmeterstatusapplied() {
		return ismeterstatusapplied;
	}

	public void setIsmeterstatusapplied(Object obj) {
		if (obj instanceof List) {
			List<String> list = new ArrayList<>();
			for (Object item : (List<?>) obj) {
				if (item != null) {
					list.add(item.toString());
				}
			}
			this.ismeterstatusapplied = list;
		} else if (obj instanceof String) {
			this.ismeterstatusapplied = Collections.singletonList((String) obj);
		} else {
			this.ismeterstatusapplied = null;
		}
	}

	@Override
	public String toString() {
		return "BillingSlab [id=" + id + ", buildingType=" + buildingType + ", connectionType=" + connectionType
				+ ", waterSubUsageType=" + waterSubUsageType + ", calculationAttribute=" + calculationAttribute
				+ ", minimumCharge=" + minimumCharge + ", isminimumchargenotapplied=" + isminimumchargenotapplied
				+ ", ismeterstatusapplied=" + ismeterstatusapplied + ", slabs=" + slabs.toString() + "]";
	}
}