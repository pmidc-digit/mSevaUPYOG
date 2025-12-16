package org.egov.rl.models.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * SchedullerType of demand like tax, fee, rebate, penalty etc.
 */

public enum SchedullerType {

	ANNUAL("12"), BIANNUAL("6"), QUARTERLY("3"), MONTHLY("1");

	private String value;

	SchedullerType(String value) {
		this.value = value;
	}

	@JsonCreator
	public static String fromValue(String text) {
		for (SchedullerType b : SchedullerType.values()) {
			if (b.name().equals(text)) {
				return String.valueOf(b.value);
			}

		}
		return null;
	}

}
//
//public enum SchedullerType {
//
//	ANNUAL("ANNUAL"), BIANNUAL("BIANNUAL"), QUARTERLY("QUARTERLY"), MONTHLY("MONTHLY");
//
//	private String value;
//
//	SchedullerType(String value) {
//		this.value = value;
//	}
//
//	@Override
//	@JsonValue
//	public String toString() {
//		return String.valueOf(value);
//	}
//
//	@JsonCreator
//	public static SchedullerType fromValue(String text) {
//		for (SchedullerType b : SchedullerType.values()) {
//			if (String.valueOf(b.value).equals(text)) {
//				return b;
//			}
//		}
//		return null;
//	}
//
//	@JsonCreator
//	public static SchedullerType getMonthFromValue(String text) {
//		for (SchedullerType b : SchedullerType.values()) {
//			if (String.valueOf(b.value).equals(text)) {
//
//				return b;
//			}
//		}
//		return null;
//	}
//}
