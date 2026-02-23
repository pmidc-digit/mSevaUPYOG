package com.search.pmidc.bean;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "mohali_pt_legacy_data")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class MohaliBean implements Serializable {

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
	
	@Column(name = "owner_brushed")
	private String owner_brushed;
	
	@Column(name = "owner_multi_temp")
	private String owner_multi_temp;

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

	public String getOwner_brushed() {
		return owner_brushed;
	}

	public void setOwner_brushed(String owner_brushed) {
		this.owner_brushed = owner_brushed;
	}

	public String getOwner_multi_temp() {
		return owner_multi_temp;
	}

	public void setOwner_multi_temp(String owner_multi_temp) {
		this.owner_multi_temp = owner_multi_temp;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((acknowledgementno == null) ? 0 : acknowledgementno.hashCode());
		result = prime * result + ((amountpaid == null) ? 0 : amountpaid.hashCode());
		result = prime * result + ((bank == null) ? 0 : bank.hashCode());
		result = prime * result + ((batchname == null) ? 0 : batchname.hashCode());
		result = prime * result + ((buildingcategory == null) ? 0 : buildingcategory.hashCode());
		result = prime * result + ((colony == null) ? 0 : colony.hashCode());
		result = prime * result + ((colony_processed == null) ? 0 : colony_processed.hashCode());
		result = prime * result + ((commercialrate == null) ? 0 : commercialrate.hashCode());
		result = prime * result + ((entrydate == null) ? 0 : entrydate.hashCode());
		result = prime * result + ((exemptionamt == null) ? 0 : exemptionamt.hashCode());
		result = prime * result + ((exemptioncategory == null) ? 0 : exemptioncategory.hashCode());
		result = prime * result + ((firecharges == null) ? 0 : firecharges.hashCode());
		result = prime * result + ((floor == null) ? 0 : floor.hashCode());
		result = prime * result + ((g8bookno == null) ? 0 : g8bookno.hashCode());
		result = prime * result + ((g8receiptno == null) ? 0 : g8receiptno.hashCode());
		result = prime * result + ((grosstax == null) ? 0 : grosstax.hashCode());
		result = prime * result + ((houseno == null) ? 0 : houseno.hashCode());
		result = prime * result + ((interestamt == null) ? 0 : interestamt.hashCode());
		result = prime * result + ((landusedtype == null) ? 0 : landusedtype.hashCode());
		result = prime * result + ((new_assessmentnumber == null) ? 0 : new_assessmentnumber.hashCode());
		result = prime * result + ((new_locality_code == null) ? 0 : new_locality_code.hashCode());
		result = prime * result + ((new_propertyid == null) ? 0 : new_propertyid.hashCode());
		result = prime * result + ((new_tax == null) ? 0 : new_tax.hashCode());
		result = prime * result + ((new_total == null) ? 0 : new_total.hashCode());
		result = prime * result + ((owner == null) ? 0 : owner.hashCode());
		result = prime * result + ((owner_brushed == null) ? 0 : owner_brushed.hashCode());
		result = prime * result + ((owner_multi_temp == null) ? 0 : owner_multi_temp.hashCode());
		result = prime * result + ((parent_uuid == null) ? 0 : parent_uuid.hashCode());
		result = prime * result + ((paymentdate == null) ? 0 : paymentdate.hashCode());
		result = prime * result + ((paymentmode == null) ? 0 : paymentmode.hashCode());
		result = prime * result + ((penalty == null) ? 0 : penalty.hashCode());
		result = prime * result + ((plotarea == null) ? 0 : plotarea.hashCode());
		result = prime * result + ((previous_returnid == null) ? 0 : previous_returnid.hashCode());
		result = prime * result + ((propertytype == null) ? 0 : propertytype.hashCode());
		result = prime * result + ((rebate == null) ? 0 : rebate.hashCode());
		result = prime * result + ((receipt_number == null) ? 0 : receipt_number.hashCode());
		result = prime * result + ((receipt_request == null) ? 0 : receipt_request.hashCode());
		result = prime * result + ((receipt_response == null) ? 0 : receipt_response.hashCode());
		result = prime * result + ((receipt_status == null) ? 0 : receipt_status.hashCode());
		result = prime * result + ((remarks == null) ? 0 : remarks.hashCode());
		result = prime * result + ((req_json == null) ? 0 : req_json.hashCode());
		result = prime * result + ((residentialrate == null) ? 0 : residentialrate.hashCode());
		result = prime * result + ((returnid == null) ? 0 : returnid.hashCode());
		result = prime * result + ((sector == null) ? 0 : sector.hashCode());
		result = prime * result + ((session == null) ? 0 : session.hashCode());
		result = prime * result + ((srno == null) ? 0 : srno.hashCode());
		result = prime * result + ((status == null) ? 0 : status.hashCode());
		result = prime * result + ((taxamt == null) ? 0 : taxamt.hashCode());
		result = prime * result + ((tenantid == null) ? 0 : tenantid.hashCode());
		result = prime * result + ((time_taken == null) ? 0 : time_taken.hashCode());
		result = prime * result + ((time_taken_receipt == null) ? 0 : time_taken_receipt.hashCode());
		result = prime * result + ((totalcoveredarea == null) ? 0 : totalcoveredarea.hashCode());
		result = prime * result + ((transactionid == null) ? 0 : transactionid.hashCode());
		result = prime * result + ((upload_response == null) ? 0 : upload_response.hashCode());
		result = prime * result + ((upload_status == null) ? 0 : upload_status.hashCode());
		result = prime * result + ((usage == null) ? 0 : usage.hashCode());
		result = prime * result + ((uuid == null) ? 0 : uuid.hashCode());
		result = prime * result + ((zone == null) ? 0 : zone.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		MohaliBean other = (MohaliBean) obj;
		if (acknowledgementno == null) {
			if (other.acknowledgementno != null)
				return false;
		} else if (!acknowledgementno.equals(other.acknowledgementno))
			return false;
		if (amountpaid == null) {
			if (other.amountpaid != null)
				return false;
		} else if (!amountpaid.equals(other.amountpaid))
			return false;
		if (bank == null) {
			if (other.bank != null)
				return false;
		} else if (!bank.equals(other.bank))
			return false;
		if (batchname == null) {
			if (other.batchname != null)
				return false;
		} else if (!batchname.equals(other.batchname))
			return false;
		if (buildingcategory == null) {
			if (other.buildingcategory != null)
				return false;
		} else if (!buildingcategory.equals(other.buildingcategory))
			return false;
		if (colony == null) {
			if (other.colony != null)
				return false;
		} else if (!colony.equals(other.colony))
			return false;
		if (colony_processed == null) {
			if (other.colony_processed != null)
				return false;
		} else if (!colony_processed.equals(other.colony_processed))
			return false;
		if (commercialrate == null) {
			if (other.commercialrate != null)
				return false;
		} else if (!commercialrate.equals(other.commercialrate))
			return false;
		if (entrydate == null) {
			if (other.entrydate != null)
				return false;
		} else if (!entrydate.equals(other.entrydate))
			return false;
		if (exemptionamt == null) {
			if (other.exemptionamt != null)
				return false;
		} else if (!exemptionamt.equals(other.exemptionamt))
			return false;
		if (exemptioncategory == null) {
			if (other.exemptioncategory != null)
				return false;
		} else if (!exemptioncategory.equals(other.exemptioncategory))
			return false;
		if (firecharges == null) {
			if (other.firecharges != null)
				return false;
		} else if (!firecharges.equals(other.firecharges))
			return false;
		if (floor == null) {
			if (other.floor != null)
				return false;
		} else if (!floor.equals(other.floor))
			return false;
		if (g8bookno == null) {
			if (other.g8bookno != null)
				return false;
		} else if (!g8bookno.equals(other.g8bookno))
			return false;
		if (g8receiptno == null) {
			if (other.g8receiptno != null)
				return false;
		} else if (!g8receiptno.equals(other.g8receiptno))
			return false;
		if (grosstax == null) {
			if (other.grosstax != null)
				return false;
		} else if (!grosstax.equals(other.grosstax))
			return false;
		if (houseno == null) {
			if (other.houseno != null)
				return false;
		} else if (!houseno.equals(other.houseno))
			return false;
		if (interestamt == null) {
			if (other.interestamt != null)
				return false;
		} else if (!interestamt.equals(other.interestamt))
			return false;
		if (landusedtype == null) {
			if (other.landusedtype != null)
				return false;
		} else if (!landusedtype.equals(other.landusedtype))
			return false;
		if (new_assessmentnumber == null) {
			if (other.new_assessmentnumber != null)
				return false;
		} else if (!new_assessmentnumber.equals(other.new_assessmentnumber))
			return false;
		if (new_locality_code == null) {
			if (other.new_locality_code != null)
				return false;
		} else if (!new_locality_code.equals(other.new_locality_code))
			return false;
		if (new_propertyid == null) {
			if (other.new_propertyid != null)
				return false;
		} else if (!new_propertyid.equals(other.new_propertyid))
			return false;
		if (new_tax == null) {
			if (other.new_tax != null)
				return false;
		} else if (!new_tax.equals(other.new_tax))
			return false;
		if (new_total == null) {
			if (other.new_total != null)
				return false;
		} else if (!new_total.equals(other.new_total))
			return false;
		if (owner == null) {
			if (other.owner != null)
				return false;
		} else if (!owner.equals(other.owner))
			return false;
		if (owner_brushed == null) {
			if (other.owner_brushed != null)
				return false;
		} else if (!owner_brushed.equals(other.owner_brushed))
			return false;
		if (owner_multi_temp == null) {
			if (other.owner_multi_temp != null)
				return false;
		} else if (!owner_multi_temp.equals(other.owner_multi_temp))
			return false;
		if (parent_uuid == null) {
			if (other.parent_uuid != null)
				return false;
		} else if (!parent_uuid.equals(other.parent_uuid))
			return false;
		if (paymentdate == null) {
			if (other.paymentdate != null)
				return false;
		} else if (!paymentdate.equals(other.paymentdate))
			return false;
		if (paymentmode == null) {
			if (other.paymentmode != null)
				return false;
		} else if (!paymentmode.equals(other.paymentmode))
			return false;
		if (penalty == null) {
			if (other.penalty != null)
				return false;
		} else if (!penalty.equals(other.penalty))
			return false;
		if (plotarea == null) {
			if (other.plotarea != null)
				return false;
		} else if (!plotarea.equals(other.plotarea))
			return false;
		if (previous_returnid == null) {
			if (other.previous_returnid != null)
				return false;
		} else if (!previous_returnid.equals(other.previous_returnid))
			return false;
		if (propertytype == null) {
			if (other.propertytype != null)
				return false;
		} else if (!propertytype.equals(other.propertytype))
			return false;
		if (rebate == null) {
			if (other.rebate != null)
				return false;
		} else if (!rebate.equals(other.rebate))
			return false;
		if (receipt_number == null) {
			if (other.receipt_number != null)
				return false;
		} else if (!receipt_number.equals(other.receipt_number))
			return false;
		if (receipt_request == null) {
			if (other.receipt_request != null)
				return false;
		} else if (!receipt_request.equals(other.receipt_request))
			return false;
		if (receipt_response == null) {
			if (other.receipt_response != null)
				return false;
		} else if (!receipt_response.equals(other.receipt_response))
			return false;
		if (receipt_status == null) {
			if (other.receipt_status != null)
				return false;
		} else if (!receipt_status.equals(other.receipt_status))
			return false;
		if (remarks == null) {
			if (other.remarks != null)
				return false;
		} else if (!remarks.equals(other.remarks))
			return false;
		if (req_json == null) {
			if (other.req_json != null)
				return false;
		} else if (!req_json.equals(other.req_json))
			return false;
		if (residentialrate == null) {
			if (other.residentialrate != null)
				return false;
		} else if (!residentialrate.equals(other.residentialrate))
			return false;
		if (returnid == null) {
			if (other.returnid != null)
				return false;
		} else if (!returnid.equals(other.returnid))
			return false;
		if (sector == null) {
			if (other.sector != null)
				return false;
		} else if (!sector.equals(other.sector))
			return false;
		if (session == null) {
			if (other.session != null)
				return false;
		} else if (!session.equals(other.session))
			return false;
		if (srno == null) {
			if (other.srno != null)
				return false;
		} else if (!srno.equals(other.srno))
			return false;
		if (status == null) {
			if (other.status != null)
				return false;
		} else if (!status.equals(other.status))
			return false;
		if (taxamt == null) {
			if (other.taxamt != null)
				return false;
		} else if (!taxamt.equals(other.taxamt))
			return false;
		if (tenantid == null) {
			if (other.tenantid != null)
				return false;
		} else if (!tenantid.equals(other.tenantid))
			return false;
		if (time_taken == null) {
			if (other.time_taken != null)
				return false;
		} else if (!time_taken.equals(other.time_taken))
			return false;
		if (time_taken_receipt == null) {
			if (other.time_taken_receipt != null)
				return false;
		} else if (!time_taken_receipt.equals(other.time_taken_receipt))
			return false;
		if (totalcoveredarea == null) {
			if (other.totalcoveredarea != null)
				return false;
		} else if (!totalcoveredarea.equals(other.totalcoveredarea))
			return false;
		if (transactionid == null) {
			if (other.transactionid != null)
				return false;
		} else if (!transactionid.equals(other.transactionid))
			return false;
		if (upload_response == null) {
			if (other.upload_response != null)
				return false;
		} else if (!upload_response.equals(other.upload_response))
			return false;
		if (upload_status == null) {
			if (other.upload_status != null)
				return false;
		} else if (!upload_status.equals(other.upload_status))
			return false;
		if (usage == null) {
			if (other.usage != null)
				return false;
		} else if (!usage.equals(other.usage))
			return false;
		if (uuid == null) {
			if (other.uuid != null)
				return false;
		} else if (!uuid.equals(other.uuid))
			return false;
		if (zone == null) {
			if (other.zone != null)
				return false;
		} else if (!zone.equals(other.zone))
			return false;
		return true;
	}

	@Override
	public String toString() {
		return "MohaliBean [srno=" + srno + ", returnid=" + returnid + ", acknowledgementno=" + acknowledgementno
				+ ", entrydate=" + entrydate + ", zone=" + zone + ", sector=" + sector + ", colony=" + colony
				+ ", houseno=" + houseno + ", owner=" + owner + ", floor=" + floor + ", residentialrate="
				+ residentialrate + ", commercialrate=" + commercialrate + ", exemptioncategory=" + exemptioncategory
				+ ", landusedtype=" + landusedtype + ", usage=" + usage + ", plotarea=" + plotarea
				+ ", totalcoveredarea=" + totalcoveredarea + ", grosstax=" + grosstax + ", firecharges=" + firecharges
				+ ", interestamt=" + interestamt + ", penalty=" + penalty + ", rebate=" + rebate + ", exemptionamt="
				+ exemptionamt + ", taxamt=" + taxamt + ", amountpaid=" + amountpaid + ", paymentmode=" + paymentmode
				+ ", transactionid=" + transactionid + ", bank=" + bank + ", g8bookno=" + g8bookno + ", g8receiptno="
				+ g8receiptno + ", paymentdate=" + paymentdate + ", propertytype=" + propertytype
				+ ", buildingcategory=" + buildingcategory + ", session=" + session + ", remarks=" + remarks + ", uuid="
				+ uuid + ", previous_returnid=" + previous_returnid + ", status=" + status + ", tenantid=" + tenantid
				+ ", batchname=" + batchname + ", new_propertyid=" + new_propertyid + ", upload_status=" + upload_status
				+ ", upload_response=" + upload_response + ", new_assessmentnumber=" + new_assessmentnumber
				+ ", new_tax=" + new_tax + ", new_total=" + new_total + ", req_json=" + req_json + ", time_taken="
				+ time_taken + ", new_locality_code=" + new_locality_code + ", receipt_status=" + receipt_status
				+ ", receipt_request=" + receipt_request + ", receipt_response=" + receipt_response
				+ ", receipt_number=" + receipt_number + ", time_taken_receipt=" + time_taken_receipt + ", parent_uuid="
				+ parent_uuid + ", colony_processed=" + colony_processed + ", owner_brushed=" + owner_brushed
				+ ", owner_multi_temp=" + owner_multi_temp + "]";
	}
	
	

}