package com.mseva.gisintegration.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import org.hibernate.annotations.GenericGenerator;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;

import java.math.BigDecimal;

@Entity
@Table(name = "seweragetax")
public class SewerageTax {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
        name = "UUID",
        strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "sno", updatable = false, nullable = false)
    private String sno;

    private String tenantid;

    private String connectionno;

    private String property_id;

    private String propertyid;

    private String surveyid;

    private String oldpropertyid;

    private String propertytype;

    private String ownershipcategory;

    private String propertyusagetype;

    private String nooffloors;

    private String plotsize;

    private String superbuilduparea;

    private String address;

    private String localityname;

    private String blockname;

    private String assessmentyear;

    private BigDecimal billamount;

    private BigDecimal amountpaid;

    @Column(name = "createdtime", updatable = false)
    private Long createdtime;

    @Column(name = "lastmodifiedtime")
    private Long lastmodifiedtime;

    public SewerageTax() {
    }

    public BigDecimal getBillamount() {
        return billamount;
    }

    public void setBillamount(BigDecimal billamount) {
        this.billamount = billamount;
    }

    public BigDecimal getAmountpaid() {
        return amountpaid;
    }

    public void setAmountpaid(BigDecimal amountpaid) {
        this.amountpaid = amountpaid;
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

    public String getSno() {
        return sno;
    }

    public void setSno(String sno) {
        this.sno = sno;
    }

    public String getTenantid() {
        return tenantid;
    }

    public void setTenantid(String tenantid) {
        this.tenantid = tenantid;
    }

    public String getConnectionno() {
        return connectionno;
    }

    public void setConnectionno(String connectionno) {
        this.connectionno = connectionno;
    }

    public String getProperty_id() {
        return property_id;
    }

    public void setProperty_id(String property_id) {
        this.property_id = property_id;
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

    public String getPropertyusagetype() {
        return propertyusagetype;
    }

    public void setPropertyusagetype(String propertyusagetype) {
        this.propertyusagetype = propertyusagetype;
    }

    public String getNooffloors() {
        return nooffloors;
    }

    public void setNooffloors(String nooffloors) {
        this.nooffloors = nooffloors;
    }

    public String getPlotsize() {
        return plotsize;
    }

    public void setPlotsize(String plotsize) {
        this.plotsize = plotsize;
    }

    public String getSuperbuilduparea() {
        return superbuilduparea;
    }

    public void setSuperbuilduparea(String superbuilduparea) {
        this.superbuilduparea = superbuilduparea;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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
}
