package org.egov.rl.services.models.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * status of the Property
 */
public enum Status {

	ACTIVE("ACTIVE"), APPROVED("APPROVED"),
	
	REQUEST_FOR_DISCONNECTION("REQUEST_FOR_DISCONNECTION"), 
	
	CLOSED("CLOSED"),

	FORWARD_FOR_DISCONNECTION_FIELD_INSPECTION("FORWARD_FOR_DISCONNECTION_FIELD_INSPECTION"),

	FORWARD_FOT_SETLEMENT("FORWARD_FOT_SETLEMENT"),

	CLOSE("CLOSE");

	private String value;

	Status(String value) {
		this.value = value;
	}

	@Override
	@JsonValue
	public String toString() {
		return String.valueOf(value);
	}

	@JsonCreator
	public static Status fromValue(String text) {
		for (Status b : Status.values()) {
			if (String.valueOf(b.value).equalsIgnoreCase(text)) {
				return b;
			}
		}
		return null;
	}
}
