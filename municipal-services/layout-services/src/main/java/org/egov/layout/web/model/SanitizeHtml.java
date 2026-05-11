package org.egov.layout.web.model;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = SanitizeHtmlValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface SanitizeHtml {
	String message() default "Potential XSS detected or unsafe HTML found";
	Class<?>[] groups() default {};
	Class<? extends Payload>[] payload() default {};
}
