package org.egov.commons.util;

import java.util.regex.Pattern;

import org.egov.tracer.model.CustomException;

/**
 * Sort column and direction cannot be bound as query parameters, so they are
 * restricted to plain identifiers and ASC/DESC before being added to a query.
 */
public final class SortValidator {

	private static final Pattern COLUMN = Pattern.compile("^[A-Za-z_][A-Za-z0-9_]*(\\.[A-Za-z_][A-Za-z0-9_]*)?$");

	private SortValidator() {
	}

	public static String column(String sortBy) {
		if (sortBy == null || !COLUMN.matcher(sortBy.trim()).matches())
			throw new CustomException("INVALID_SORT_BY", "sortBy must be a single column name");
		return sortBy.trim();
	}

	public static String order(String sortOrder) {
		if (sortOrder != null && ("ASC".equalsIgnoreCase(sortOrder.trim()) || "DESC".equalsIgnoreCase(sortOrder.trim())))
			return sortOrder.trim();
		throw new CustomException("INVALID_SORT_ORDER", "sortOrder must be ASC or DESC");
	}
}
