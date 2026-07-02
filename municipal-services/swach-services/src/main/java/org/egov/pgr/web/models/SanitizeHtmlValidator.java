package org.egov.pgr.web.models;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class SanitizeHtmlValidator implements ConstraintValidator<SanitizeHtml, String> {

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		if (value == null || value.isEmpty()) {
			return true; // Let @NotNull handle empty checks
		}
		
		// Safelist.none() allows NO tags. 
		// Use Safelist.basic() if you want to allow <b>, <i>, etc.
		return Jsoup.isValid(value, Safelist.none());
	}
}
