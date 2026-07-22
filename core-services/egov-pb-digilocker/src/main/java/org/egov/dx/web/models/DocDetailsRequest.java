package org.egov.dx.web.models;

import jakarta.validation.constraints.Size;

import com.thoughtworks.xstream.annotations.XStreamAlias;

@XStreamAlias("DocDetails")
public class DocDetailsRequest {
	
    @XStreamAlias("DocType")
    private String docType;
	
    @XStreamAlias("FullName")
    private String fullName;
	
    @XStreamAlias("DOB")
    private String dob;
	
    @XStreamAlias("GENDER")
    private String gender;
	
    @XStreamAlias("DigiLockerId")
    private String digiLockerId;
	
    @XStreamAlias("Mobile")
    private String mobile;
	
    @XStreamAlias("consumerCode")
    private String consumerCode;
	
    @Size(max=64)
    @XStreamAlias("PropertyID")
    private String propertyId;
    
    @XStreamAlias("connType")
    private String connType;
    
    
    @XStreamAlias("level1")
    private String level1;

    @XStreamAlias("level2")
    private String level2;
    
    @XStreamAlias("City")
    private String city;

    public String getDocType() {
        return docType;
    }

    public void setDocType(String docType) {
        this.docType = docType;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getDigiLockerId() {
        return digiLockerId;
    }

    public void setDigiLockerId(String digiLockerId) {
        this.digiLockerId = digiLockerId;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    // --- NEW GETTER AND SETTER FOR CONSUMER CODE ---
    public String getConsumerCode() {
        return consumerCode;
    }

    public void setConsumerCode(String consumerCode) {
        this.consumerCode = consumerCode;
    }
    // -----------------------------------------------
    public String getConnType() {
        return connType;
    }

    public void setConnType(String connType) {
        this.connType = connType;
    }
    public String getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(String propertyId) {
        this.propertyId = propertyId;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getLevel1() {
        return level1;
    }

    public void setLevel1(String level1) {
        this.level1 = level1;
    }

    public String getLevel2() {
        return level2;
    }

    public void setLevel2(String level2) {
        this.level2 = level2;
    }
}