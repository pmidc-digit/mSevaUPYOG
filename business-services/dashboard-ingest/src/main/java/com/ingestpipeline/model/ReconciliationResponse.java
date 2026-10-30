package com.ingestpipeline.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response model for DSS collection reconciliation.
 */
public class ReconciliationResponse implements Serializable {

	private static final long serialVersionUID = 1L;

	@JsonProperty("status")
	private String status;

	@JsonProperty("message")
	private String message;

	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("totalFetched")
	private Integer totalFetched = 0;

	@JsonProperty("totalIngested")
	private Integer totalIngested = 0;

	@JsonProperty("totalAmount")
	private BigDecimal totalAmount = BigDecimal.ZERO;

	@JsonProperty("reconciledPaymentIds")
	private List<String> reconciledPaymentIds = new ArrayList<>();

	public ReconciliationResponse() {
		super();
	}

	public ReconciliationResponse(String status, String message) {
		this.status = status;
		this.message = message;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getTenantId() {
		return tenantId;
	}

	public void setTenantId(String tenantId) {
		this.tenantId = tenantId;
	}

	public Integer getTotalFetched() {
		return totalFetched;
	}

	public void setTotalFetched(Integer totalFetched) {
		this.totalFetched = totalFetched;
	}

	public Integer getTotalIngested() {
		return totalIngested;
	}

	public void setTotalIngested(Integer totalIngested) {
		this.totalIngested = totalIngested;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public List<String> getReconciledPaymentIds() {
		return reconciledPaymentIds;
	}

	public void setReconciledPaymentIds(List<String> reconciledPaymentIds) {
		this.reconciledPaymentIds = reconciledPaymentIds;
	}

	@Override
	public String toString() {
		return "ReconciliationResponse [status=" + status + ", message=" + message + ", tenantId=" + tenantId
				+ ", totalFetched=" + totalFetched + ", totalIngested=" + totalIngested + ", totalAmount=" + totalAmount
				+ "]";
	}
}
