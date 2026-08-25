package org.egov.infra.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

/**
 * Jakarta Validation replacement for Hibernate Validator's removed SafeHtml constraint.
 */
@Documented
@Constraint(validatedBy = SafeHtmlValidator.class)
@Target({ METHOD, FIELD, PARAMETER, ANNOTATION_TYPE })
@Retention(RUNTIME)
public @interface SafeHtml {

    String message() default "{org.egov.infra.validation.SafeHtml.message}";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
