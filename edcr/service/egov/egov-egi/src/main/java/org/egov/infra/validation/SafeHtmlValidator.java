package org.egov.infra.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.TextNode;

/** Rejects markup while accepting null values, in line with Jakarta constraint conventions. */
public class SafeHtmlValidator implements ConstraintValidator<SafeHtml, CharSequence> {

    @Override
    public boolean isValid(final CharSequence value, final ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        final String candidate = value.toString();
        if (candidate.isEmpty()) {
            return true;
        }
        final Element body = Jsoup.parseBodyFragment(candidate).body();
        return body.childNodeSize() == 1
                && body.childNode(0) instanceof TextNode
                && ((TextNode) body.childNode(0)).getWholeText().equals(candidate);
    }
}
