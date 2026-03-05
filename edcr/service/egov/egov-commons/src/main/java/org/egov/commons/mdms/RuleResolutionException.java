package org.egov.commons.mdms;

public class RuleResolutionException extends RuntimeException {

    public RuleResolutionException(String message) {
        super(message);
    }

    public RuleResolutionException(String message, Throwable cause) {
        super(message, cause);
    }
}

