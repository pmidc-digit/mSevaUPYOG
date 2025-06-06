package org.egov.ndc.web.model.bill;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Purpose {

	ARREAR("ARREAR"),

	CURRENT("CURRENT"),

	ADVANCE("ADVANCE"),

    EXEMPTION("EXEMPTION"),

	ARREAR_LATEPAYMENT_CHARGES("ARREAR_LATEPAYMENT_CHARGES"),

	CURRENT_LATEPAYMENT_CHARGES("CURRENT_LATEPAYMENT_CHARGES"),

	CHEQUE_BOUNCE_PENALTY("CHEQUE_BOUNCE_PENALTY"),

	REBATE("REBATE"),

	OTHERS("OTHERS");

	private String value;

	Purpose(String value) {
		this.value = value;
	}

	
	@Override
	@JsonValue
	public String toString() {
		return String.valueOf(value);
	}

	@JsonCreator
	public static Purpose fromValue(String text) {
		for (Purpose b : Purpose.values()) {
			if (String.valueOf(b.value).equals(text)) {
				return b;
			}
		}
		return null;
	}
}