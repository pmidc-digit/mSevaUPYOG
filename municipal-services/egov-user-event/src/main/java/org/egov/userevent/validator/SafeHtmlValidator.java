package org.egov.userevent.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.util.StringUtils;

public class SafeHtmlValidator implements ConstraintValidator<SafeHtml, String> {

    // A basic strict policy that does not allow any HTML elements to mimic old SafeHtml whitelist
    private static final PolicyFactory POLICY = new HtmlPolicyBuilder().toFactory();

    @Override
    public void initialize(SafeHtml constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (!StringUtils.hasText(value)) {
            return true;
        }
        
        // Ensure that the string doesn't contain any unsafe HTML tags.
        // Sanitizing the value and checking if it remains the same
        String sanitized = POLICY.sanitize(value);
        return value.equals(sanitized);
    }
}
