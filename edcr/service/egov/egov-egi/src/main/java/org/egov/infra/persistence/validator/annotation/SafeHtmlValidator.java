package org.egov.infra.persistence.validator.annotation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class SafeHtmlValidator implements ConstraintValidator<SafeHtml, CharSequence> {
    @Override
    public boolean isValid(final CharSequence value, final ConstraintValidatorContext context) {
        return value == null || Jsoup.isValid(value.toString(), Safelist.none());
    }
}
