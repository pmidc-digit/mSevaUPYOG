package com.mseva.gisintegration.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Column;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Id;
import java.util.UUID;

import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;

@Entity
@Table(name = "property")
public class Property {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
        name = "UUID",
        strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "uuid", updatable = false, nullable = false)
    private UUID uuid;

    private String tenantid;

    private String propertyid;

    private String surveyid;

    private String oldpropertyid;

    private String firmbusinessname;

    private String address;

    private String localitycode;

    private String localityname;

    private String blockname;

    private String zonename;

    private String plotsize;

    private String propertyusagetype;

    private String propertytype;

    private String ownershipcategory;

    private String paymentdate;

    private String receiptnumber;

    private String amountpaid;

    private String assessmentyear;

    private String billamount;

    private String service;

    @Column(name = "createdtime", updatable = false)
    private Long createdtime;

    @Column(name = "lastmodifiedtime")
    private Long lastmodifiedtime;

    public Property() {
    }

    public Long getCreatedtime() {
        return createdtime;
    }

    public void setCreatedtime(Long createdtime) {
        this.createdtime = createdtime;
    }

    public Long getLastmodifiedtime() {
        return lastmodifiedtime;
    }

    public void setLastmodifiedtime(Long lastmodifiedtime) {
        this.lastmodifiedtime = lastmodifiedtime;
    }

    public String getBillamount() {
        return billamount;
    }

    public void setBillamount(String billamount) {
        this.billamount = billamount;
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public String getTenantid() {
        return tenantid;
    }

    public void setTenantid(String tenantid) {
        this.tenantid = tenantid;
    }

    public String getPropertyid() {
        return propertyid;
    }

    public void setPropertyid(String propertyid) {
        this.propertyid = propertyid;
    }

    public String getSurveyid() {
        return surveyid;
    }

    public void setSurveyid(String surveyid) {
        this.surveyid = surveyid;
    }

    public String getOldpropertyid() {
        return oldpropertyid;
    }

    public void setOldpropertyid(String oldpropertyid) {
        this.oldpropertyid = oldpropertyid;
    }

    public String getFirmbusinessname() {
        return firmbusinessname;
    }

    public void setFirmbusinessname(String firmbusinessname) {
        this.firmbusinessname = firmbusinessname;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLocalitycode() {
        return localitycode;
    }

    public void setLocalitycode(String localitycode) {
        this.localitycode = localitycode;
    }

    public String getLocalityname() {
        return localityname;
    }

    public void setLocalityname(String localityname) {
        this.localityname = localityname;
    }

    public String getBlockname() {
        return blockname;
    }

    public void setBlockname(String blockname) {
        this.blockname = blockname;
    }

    public String getZonename() {
        return zonename;
    }

    public void setZonename(String zonename) {
        this.zonename = zonename;
    }

    public String getPlotsize() {
        return plotsize;
    }

    public void setPlotsize(String plotsize) {
        this.plotsize = plotsize;
    }

    public String getPropertyusagetype() {
        return propertyusagetype;
    }

    public void setPropertyusagetype(String propertyusagetype) {
        this.propertyusagetype = propertyusagetype;
    }

    public String getPropertytype() {
        return propertytype;
    }

    public void setPropertytype(String propertytype) {
        this.propertytype = propertytype;
    }

    public String getOwnershipcategory() {
        return ownershipcategory;
    }

    public void setOwnershipcategory(String ownershipcategory) {
        this.ownershipcategory = ownershipcategory;
    }

    public String getPaymentdate() {
        return paymentdate;
    }

    public void setPaymentdate(String paymentdate) {
        this.paymentdate = paymentdate;
    }

    public String getReceiptnumber() {
        return receiptnumber;
    }

    public void setReceiptnumber(String receiptnumber) {
        this.receiptnumber = receiptnumber;
    }

    public String getAmountpaid() {
        return amountpaid;
    }

    public void setAmountpaid(String amountpaid) {
        this.amountpaid = amountpaid;
    }

    public String getAssessmentyear() {
        return assessmentyear;
    }

    public void setAssessmentyear(String assessmentyear) {
        this.assessmentyear = assessmentyear;
    }

    @PrePersist
    protected void onCreate() {
        long now = System.currentTimeMillis();
        this.createdtime = now;
        this.lastmodifiedtime = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastmodifiedtime = System.currentTimeMillis();
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }
}
