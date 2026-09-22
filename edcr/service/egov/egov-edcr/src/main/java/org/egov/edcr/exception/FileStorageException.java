package org.egov.edcr.exception;

import org.springframework.http.HttpStatus;

public class FileStorageException extends CustomException {

    private static final long serialVersionUID = 1L;

    public FileStorageException(String message) {
        super(HttpStatus.BAD_REQUEST, "FILE_STORE_ERROR", message);
    }

    public FileStorageException(String errorCode, String message) {
        super(HttpStatus.BAD_REQUEST, errorCode, message);
    }

    public FileStorageException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}