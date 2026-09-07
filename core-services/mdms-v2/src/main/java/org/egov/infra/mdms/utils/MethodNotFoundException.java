package org.egov.infra.mdms.utils;

public class MethodNotFoundException extends RuntimeException {

    public MethodNotFoundException(String message){
        super(message);
    }

}