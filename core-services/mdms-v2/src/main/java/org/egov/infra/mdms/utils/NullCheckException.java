package org.egov.infra.mdms.utils;

public class NullCheckException extends RuntimeException {

    public NullCheckException(String message){
        super(message);
    }

    private static final long serialVersionUID = 1L;

}