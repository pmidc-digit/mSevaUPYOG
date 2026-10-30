package com.ingestpipeline.model;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request model for DSS collection reconciliation.
 * Supports querying collection-services by date range, payment ID, or direct payment payload.
 */
public class ReconciliationRequest implements Serializable {

	private static final long serialVersionUID = 1L;

	@JsonProperty("tenantId")
	private String tenantId;

	@JsonProperty("tenantIds")
	private List<String> tenantIds;

	@JsonProperty("fromDate")
	private Long fromDate;

	@JsonProperty("toDate")
	private Long toDate;

	@JsonProperty("businessService")
	private String businessService;

	@JsonProperty("businessServices")
	private List<String> businessServices;

	@JsonProperty("paymentId")
	private String paymentId;

	@JsonProperty("transactionNumber")
	private String transactionNumber;

	@JsonProperty("consumerCode")
	private String consumerCode;

	@JsonProperty("limit")
	private Integer limit;

	@JsonProperty("offset")
	private Integer offset;

	/**
	 * Optional list of raw payment objects if caller wants to replay records directly.
	 */
	@JsonProperty("payments")
	private List<Map<String, Object>> payments;

	@JsonProperty("RequestInfo")
	private Map<String, Object> requestInfo;

	public ReconciliationRequest() {
		super();
	}

	public Map<String, Object> getRequestInfo() {
		return requestInfo;
	}

	public void setRequestInfo(Map<String, Object> requestInfo) {
		this.requestInfo = requestInfo;
	}

	public String getTenantId() {
		return tenantId;
	}

	public void setTenantId(String tenantId) {
		this.tenantId = tenantId;
	}
	public List<String> getTenantIds() {
		return tenantIds;
	}

	public void setTenantIds(List<String> tenantIds) {
		this.tenantIds = tenantIds;
	}


	public Long getFromDate() {
		return fromDate;
	}

	public void setFromDate(Long fromDate) {
		this.fromDate = fromDate;
	}

	public Long getToDate() {
		return toDate;
	}

	public void setToDate(Long toDate) {
		this.toDate = toDate;
	}

	public String getBusinessService() {
		return businessService;
	}

	public void setBusinessService(String businessService) {
		this.businessService = businessService;
	}

	public List<String> getBusinessServices() {
		return businessServices;
	}

	public void setBusinessServices(List<String> businessServices) {
		this.businessServices = businessServices;
	}

	public String getPaymentId() {
		return paymentId;
	}

	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}

	public String getTransactionNumber() {
		return transactionNumber;
	}

	public void setTransactionNumber(String transactionNumber) {
		this.transactionNumber = transactionNumber;
	}

	public String getConsumerCode() {
		return consumerCode;
	}

	public void setConsumerCode(String consumerCode) {
		this.consumerCode = consumerCode;
	}

	public Integer getLimit() {
		return limit;
	}

	public void setLimit(Integer limit) {
		this.limit = limit;
	}

	public Integer getOffset() {
		return offset;
	}

	public void setOffset(Integer offset) {
		this.offset = offset;
	}

	public List<Map<String, Object>> getPayments() {
		return payments;
	}

	public void setPayments(List<Map<String, Object>> payments) {
		this.payments = payments;
	}

	@Override
	public String toString() {
		return "ReconciliationRequest [tenantId=" + tenantId + ", fromDate=" + fromDate + ", toDate=" + toDate
				+ ", businessService=" + businessService + ", paymentId=" + paymentId + ", transactionNumber="
				+ transactionNumber + ", limit=" + limit + ", offset=" + offset + "]";
	}
}
