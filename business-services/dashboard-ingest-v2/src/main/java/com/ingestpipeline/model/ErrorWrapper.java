package com.ingestpipeline.model;

public class ErrorWrapper {
	
	private String stage;
	private String errorCode; 
	private String errorMessage;
	private Object incomingData;
	private Long timestamp;

	public ErrorWrapper() {
		this.timestamp = System.currentTimeMillis();
	}

	public ErrorWrapper(String stage, String errorCode, String errorMessage, Object incomingData) {
		this.stage = stage;
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
		this.incomingData = incomingData;
		this.timestamp = System.currentTimeMillis();
	}

	public String getStage() {
		return stage;
	}

	public void setStage(String stage) {
		this.stage = stage;
	}

	public Long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Long timestamp) {
		this.timestamp = timestamp;
	}
	
	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public Object getIncomingData() {
		return incomingData;
	}

	public void setIncomingData(Object incomingData) {
		this.incomingData = incomingData;
	} 
}
