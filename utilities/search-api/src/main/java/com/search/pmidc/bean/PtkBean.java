package com.search.pmidc.bean;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

	@Entity
	@Table(name = "pathankot_pt_legacy_data")
	@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
	public class PtkBean implements Serializable {

		private static final long serialVersionUID = 1L;
		
		@Column(name = "srno")
		private String srno;

		
		@Column(name = "returnid")
		private String returnid;

		@Column(name = "acknowledgementno")
		private String acknowledgementno;

		@Column(name = "entrydate")
		private String entrydate;

		@Column(name = "zone")
		private String zone;

		@Column(name = "sector")
		private String sector;

		@Column(name = "colony")
		private String colony;

		@Column(name = "houseno")
		private String houseno;

		@Column(name = "owner")
		private String owner;

		@Column(name = "floor")
		private String floor;

		
		@Column(name = "residentialrate")
		private String residentialrate;

		@Column(name = "commercialrate")
		private String commercialrate;
		
		@Column(name = "exemptioncategory")
		private String exemptioncategory;

		@Column(name = "landusedtype")
		private String landusedtype;

		@Column(name = "usage")
		private String usage;

		@Column(name = "plotarea")
		private String plotarea;

		@Column(name = "totalcoveredarea")
		private String totalcoveredarea;

		@Column(name = "grosstax")
		private String grosstax;

		@Column(name = "firecharges")
		private String firecharges;

		@Column(name = "interestamt")
		private String interestamt;

		@Column(name = "penalty")
		private String penalty;

		@Column(name = "rebate")
		private String rebate;

		@Column(name = "exemptionamt")
		private String exemptionamt;

		@Column(name = "taxamt")
		private String taxamt;

		@Column(name = "amountpaid")
		private String amountpaid;

		@Column(name = "paymentmode")
		private String paymentmode;

		@Column(name = "transactionid")
		private String transactionid;

		@Column(name = "bank")
		private String bank;

		@Column(name = "g8bookno")
		private String g8bookno;

		@Column(name = "g8receiptno")
		private String g8receiptno;

		@Column(name = "paymentdate")
		private String paymentdate;

		@Column(name = "propertytype")
		private String propertytype;

		@Column(name = "buildingcategory")
		private String buildingcategory;

		@Column(name = "session")
		private String session;

		@Column(name = "remarks")
		private String remarks;

		@Id
		@Column(name = "uuid")
		private String uuid;

		@Column(name = "previous_returnid")
		private String previous_returnid;

		@Column(name = "status")
		private String status;

		@Column(name = "tenantid")
		private String tenantid;

		@Column(name = "batchname")
		private String batchname;

		@Column(name = "new_propertyid")
		private String new_propertyid;

		@Column(name = "upload_status")
		private String upload_status;

		@Column(name = "upload_response")
		private String upload_response;

		@Column(name = "new_assessmentnumber")
		private String new_assessmentnumber;

		@Column(name = "new_tax")
		private String new_tax;

		@Column(name = "new_total")
		private String new_total;

		@Column(name = "req_json")
		private String req_json;

		@Column(name = "time_taken")
		private String time_taken;

		@Column(name = "new_locality_code")
		private String new_locality_code;

		@Column(name = "receipt_status")
		private String receipt_status;

		@Column(name = "receipt_request")
		private String receipt_request;

		@Column(name = "receipt_response")
		private String receipt_response;

		@Column(name = "receipt_number")
		private String receipt_number;

		@Column(name = "time_taken_receipt")
		private String time_taken_receipt;

		@Column(name = "parent_uuid")
		private String parent_uuid;
		
		@Column(name = "colony_processed")
		private String colony_processed;
		
		@Column(name = "floor_temp")
		private String floor_temp;
		
		@Column(name = "owner_temp")
		private String owner_temp;

		public String getSrno() {
			return srno;
		}

		public void setSrno(String srno) {
			this.srno = srno;
		}

		public String getReturnid() {
			return returnid;
		}

		public void setReturnid(String returnid) {
			this.returnid = returnid;
		}

		public String getAcknowledgementno() {
			return acknowledgementno;
		}

		public void setAcknowledgementno(String acknowledgementno) {
			this.acknowledgementno = acknowledgementno;
		}

		public String getEntrydate() {
			return entrydate;
		}

		public void setEntrydate(String entrydate) {
			this.entrydate = entrydate;
		}

		public String getZone() {
			return zone;
		}

		public void setZone(String zone) {
			this.zone = zone;
		}

		public String getSector() {
			return sector;
		}

		public void setSector(String sector) {
			this.sector = sector;
		}

		public String getColony() {
			return colony;
		}

		public void setColony(String colony) {
			this.colony = colony;
		}

		public String getHouseno() {
			return houseno;
		}

		public void setHouseno(String houseno) {
			this.houseno = houseno;
		}

		public String getOwner() {
			return owner;
		}

		public void setOwner(String owner) {
			this.owner = owner;
		}

		public String getFloor() {
			return floor;
		}

		public void setFloor(String floor) {
			this.floor = floor;
		}

		public String getResidentialrate() {
			return residentialrate;
		}

		public void setResidentialrate(String residentialrate) {
			this.residentialrate = residentialrate;
		}

		public String getCommercialrate() {
			return commercialrate;
		}

		public void setCommercialrate(String commercialrate) {
			this.commercialrate = commercialrate;
		}

		public String getExemptioncategory() {
			return exemptioncategory;
		}

		public void setExemptioncategory(String exemptioncategory) {
			this.exemptioncategory = exemptioncategory;
		}

		public String getLandusedtype() {
			return landusedtype;
		}

		public void setLandusedtype(String landusedtype) {
			this.landusedtype = landusedtype;
		}

		public String getUsage() {
			return usage;
		}

		public void setUsage(String usage) {
			this.usage = usage;
		}

		public String getPlotarea() {
			return plotarea;
		}

		public void setPlotarea(String plotarea) {
			this.plotarea = plotarea;
		}

		public String getTotalcoveredarea() {
			return totalcoveredarea;
		}

		public void setTotalcoveredarea(String totalcoveredarea) {
			this.totalcoveredarea = totalcoveredarea;
		}

		public String getGrosstax() {
			return grosstax;
		}

		public void setGrosstax(String grosstax) {
			this.grosstax = grosstax;
		}

		public String getFirecharges() {
			return firecharges;
		}

		public void setFirecharges(String firecharges) {
			this.firecharges = firecharges;
		}

		public String getInterestamt() {
			return interestamt;
		}

		public void setInterestamt(String interestamt) {
			this.interestamt = interestamt;
		}

		public String getPenalty() {
			return penalty;
		}

		public void setPenalty(String penalty) {
			this.penalty = penalty;
		}

		public String getRebate() {
			return rebate;
		}

		public void setRebate(String rebate) {
			this.rebate = rebate;
		}

		public String getExemptionamt() {
			return exemptionamt;
		}

		public void setExemptionamt(String exemptionamt) {
			this.exemptionamt = exemptionamt;
		}

		public String getTaxamt() {
			return taxamt;
		}

		public void setTaxamt(String taxamt) {
			this.taxamt = taxamt;
		}

		public String getAmountpaid() {
			return amountpaid;
		}

		public void setAmountpaid(String amountpaid) {
			this.amountpaid = amountpaid;
		}

		public String getPaymentmode() {
			return paymentmode;
		}

		public void setPaymentmode(String paymentmode) {
			this.paymentmode = paymentmode;
		}

		public String getTransactionid() {
			return transactionid;
		}

		public void setTransactionid(String transactionid) {
			this.transactionid = transactionid;
		}

		public String getBank() {
			return bank;
		}

		public void setBank(String bank) {
			this.bank = bank;
		}

		public String getG8bookno() {
			return g8bookno;
		}

		public void setG8bookno(String g8bookno) {
			this.g8bookno = g8bookno;
		}

		public String getG8receiptno() {
			return g8receiptno;
		}

		public void setG8receiptno(String g8receiptno) {
			this.g8receiptno = g8receiptno;
		}

		public String getPaymentdate() {
			return paymentdate;
		}

		public void setPaymentdate(String paymentdate) {
			this.paymentdate = paymentdate;
		}

		public String getPropertytype() {
			return propertytype;
		}

		public void setPropertytype(String propertytype) {
			this.propertytype = propertytype;
		}

		public String getBuildingcategory() {
			return buildingcategory;
		}

		public void setBuildingcategory(String buildingcategory) {
			this.buildingcategory = buildingcategory;
		}

		public String getSession() {
			return session;
		}

		public void setSession(String session) {
			this.session = session;
		}

		public String getRemarks() {
			return remarks;
		}

		public void setRemarks(String remarks) {
			this.remarks = remarks;
		}

		public String getUuid() {
			return uuid;
		}

		public void setUuid(String uuid) {
			this.uuid = uuid;
		}

		public String getPrevious_returnid() {
			return previous_returnid;
		}

		public void setPrevious_returnid(String previous_returnid) {
			this.previous_returnid = previous_returnid;
		}

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

		public String getTenantid() {
			return tenantid;
		}

		public void setTenantid(String tenantid) {
			this.tenantid = tenantid;
		}

		public String getBatchname() {
			return batchname;
		}

		public void setBatchname(String batchname) {
			this.batchname = batchname;
		}

		public String getNew_propertyid() {
			return new_propertyid;
		}

		public void setNew_propertyid(String new_propertyid) {
			this.new_propertyid = new_propertyid;
		}

		public String getUpload_status() {
			return upload_status;
		}

		public void setUpload_status(String upload_status) {
			this.upload_status = upload_status;
		}

		public String getUpload_response() {
			return upload_response;
		}

		public void setUpload_response(String upload_response) {
			this.upload_response = upload_response;
		}

		public String getNew_assessmentnumber() {
			return new_assessmentnumber;
		}

		public void setNew_assessmentnumber(String new_assessmentnumber) {
			this.new_assessmentnumber = new_assessmentnumber;
		}

		public String getNew_tax() {
			return new_tax;
		}

		public void setNew_tax(String new_tax) {
			this.new_tax = new_tax;
		}

		public String getNew_total() {
			return new_total;
		}

		public void setNew_total(String new_total) {
			this.new_total = new_total;
		}

		public String getReq_json() {
			return req_json;
		}

		public void setReq_json(String req_json) {
			this.req_json = req_json;
		}

		public String getTime_taken() {
			return time_taken;
		}

		public void setTime_taken(String time_taken) {
			this.time_taken = time_taken;
		}

		public String getNew_locality_code() {
			return new_locality_code;
		}

		public void setNew_locality_code(String new_locality_code) {
			this.new_locality_code = new_locality_code;
		}

		public String getReceipt_status() {
			return receipt_status;
		}

		public void setReceipt_status(String receipt_status) {
			this.receipt_status = receipt_status;
		}

		public String getReceipt_request() {
			return receipt_request;
		}

		public void setReceipt_request(String receipt_request) {
			this.receipt_request = receipt_request;
		}

		public String getReceipt_response() {
			return receipt_response;
		}

		public void setReceipt_response(String receipt_response) {
			this.receipt_response = receipt_response;
		}

		public String getReceipt_number() {
			return receipt_number;
		}

		public void setReceipt_number(String receipt_number) {
			this.receipt_number = receipt_number;
		}

		public String getTime_taken_receipt() {
			return time_taken_receipt;
		}

		public void setTime_taken_receipt(String time_taken_receipt) {
			this.time_taken_receipt = time_taken_receipt;
		}

		public String getParent_uuid() {
			return parent_uuid;
		}

		public void setParent_uuid(String parent_uuid) {
			this.parent_uuid = parent_uuid;
		}

		public String getColony_processed() {
			return colony_processed;
		}

		public void setColony_processed(String colony_processed) {
			this.colony_processed = colony_processed;
		}

		public String getFloor_temp() {
			return floor_temp;
		}

		public void setFloor_temp(String floor_temp) {
			this.floor_temp = floor_temp;
		}

		public String getOwner_temp() {
			return owner_temp;
		}

		public void setOwner_temp(String owner_temp) {
			this.owner_temp = owner_temp;
		}

		@Override
		public String toString() {
			return "PtkBean [srno=" + srno + ", returnid=" + returnid + ", acknowledgementno=" + acknowledgementno
					+ ", entrydate=" + entrydate + ", zone=" + zone + ", sector=" + sector + ", colony=" + colony
					+ ", houseno=" + houseno + ", owner=" + owner + ", floor=" + floor + ", residentialrate="
					+ residentialrate + ", commercialrate=" + commercialrate + ", exemptioncategory="
					+ exemptioncategory + ", landusedtype=" + landusedtype + ", usage=" + usage + ", plotarea="
					+ plotarea + ", totalcoveredarea=" + totalcoveredarea + ", grosstax=" + grosstax + ", firecharges="
					+ firecharges + ", interestamt=" + interestamt + ", penalty=" + penalty + ", rebate=" + rebate
					+ ", exemptionamt=" + exemptionamt + ", taxamt=" + taxamt + ", amountpaid=" + amountpaid
					+ ", paymentmode=" + paymentmode + ", transactionid=" + transactionid + ", bank=" + bank
					+ ", g8bookno=" + g8bookno + ", g8receiptno=" + g8receiptno + ", paymentdate=" + paymentdate
					+ ", propertytype=" + propertytype + ", buildingcategory=" + buildingcategory + ", session="
					+ session + ", remarks=" + remarks + ", uuid=" + uuid + ", previous_returnid=" + previous_returnid
					+ ", status=" + status + ", tenantid=" + tenantid + ", batchname=" + batchname + ", new_propertyid="
					+ new_propertyid + ", upload_status=" + upload_status + ", upload_response=" + upload_response
					+ ", new_assessmentnumber=" + new_assessmentnumber + ", new_tax=" + new_tax + ", new_total="
					+ new_total + ", req_json=" + req_json + ", time_taken=" + time_taken + ", new_locality_code="
					+ new_locality_code + ", receipt_status=" + receipt_status + ", receipt_request=" + receipt_request
					+ ", receipt_response=" + receipt_response + ", receipt_number=" + receipt_number
					+ ", time_taken_receipt=" + time_taken_receipt + ", parent_uuid=" + parent_uuid
					+ ", colony_processed=" + colony_processed + ", floor_temp=" + floor_temp + ", owner_temp="
					+ owner_temp + ", getSrno()=" + getSrno() + ", getReturnid()=" + getReturnid()
					+ ", getAcknowledgementno()=" + getAcknowledgementno() + ", getEntrydate()=" + getEntrydate()
					+ ", getZone()=" + getZone() + ", getSector()=" + getSector() + ", getColony()=" + getColony()
					+ ", getHouseno()=" + getHouseno() + ", getOwner()=" + getOwner() + ", getFloor()=" + getFloor()
					+ ", getResidentialrate()=" + getResidentialrate() + ", getCommercialrate()=" + getCommercialrate()
					+ ", getExemptioncategory()=" + getExemptioncategory() + ", getLandusedtype()=" + getLandusedtype()
					+ ", getUsage()=" + getUsage() + ", getPlotarea()=" + getPlotarea() + ", getTotalcoveredarea()="
					+ getTotalcoveredarea() + ", getGrosstax()=" + getGrosstax() + ", getFirecharges()="
					+ getFirecharges() + ", getInterestamt()=" + getInterestamt() + ", getPenalty()=" + getPenalty()
					+ ", getRebate()=" + getRebate() + ", getExemptionamt()=" + getExemptionamt() + ", getTaxamt()="
					+ getTaxamt() + ", getAmountpaid()=" + getAmountpaid() + ", getPaymentmode()=" + getPaymentmode()
					+ ", getTransactionid()=" + getTransactionid() + ", getBank()=" + getBank() + ", getG8bookno()="
					+ getG8bookno() + ", getG8receiptno()=" + getG8receiptno() + ", getPaymentdate()="
					+ getPaymentdate() + ", getPropertytype()=" + getPropertytype() + ", getBuildingcategory()="
					+ getBuildingcategory() + ", getSession()=" + getSession() + ", getRemarks()=" + getRemarks()
					+ ", getUuid()=" + getUuid() + ", getPrevious_returnid()=" + getPrevious_returnid()
					+ ", getStatus()=" + getStatus() + ", getTenantid()=" + getTenantid() + ", getBatchname()="
					+ getBatchname() + ", getNew_propertyid()=" + getNew_propertyid() + ", getUpload_status()="
					+ getUpload_status() + ", getUpload_response()=" + getUpload_response()
					+ ", getNew_assessmentnumber()=" + getNew_assessmentnumber() + ", getNew_tax()=" + getNew_tax()
					+ ", getNew_total()=" + getNew_total() + ", getReq_json()=" + getReq_json() + ", getTime_taken()="
					+ getTime_taken() + ", getNew_locality_code()=" + getNew_locality_code() + ", getReceipt_status()="
					+ getReceipt_status() + ", getReceipt_request()=" + getReceipt_request()
					+ ", getReceipt_response()=" + getReceipt_response() + ", getReceipt_number()="
					+ getReceipt_number() + ", getTime_taken_receipt()=" + getTime_taken_receipt()
					+ ", getParent_uuid()=" + getParent_uuid() + ", getColony_processed()=" + getColony_processed()
					+ ", getFloor_temp()=" + getFloor_temp() + ", getOwner_temp()=" + getOwner_temp() + ", getClass()="
					+ getClass() + ", hashCode()=" + hashCode() + ", toString()=" + super.toString() + "]";
		}

				
}
