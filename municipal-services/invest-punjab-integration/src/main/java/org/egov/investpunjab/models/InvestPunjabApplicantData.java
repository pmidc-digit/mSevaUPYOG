package org.egov.investpunjab.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestPunjabApplicantData {

    @JsonProperty("iPin")
    private String iPin;

    @JsonProperty("First_Name")
    private String firstName;

    @JsonProperty("Middle_Name")
    private String middleName;

    @JsonProperty("Last_Name")
    private String lastName;

    @JsonProperty("MobileNo")
    private String mobileNo;

    @JsonProperty("Email")
    private String email;

    @JsonProperty("CompanyPan")
    private String companyPan;

    @JsonProperty("CompanyName")
    private String companyName;

    @JsonProperty("BusiType")
    private String busiType;

    @JsonProperty("SiteAddress")
    private String siteAddress;

    @JsonProperty("SiteVlgName")
    private String siteVlgName;

    @JsonProperty("SiteLGDDistId")
    private Integer siteLGDDistId;

    @JsonProperty("SiteLGDTehId")
    private Integer siteLGDTehId;

    @JsonProperty("SitePin")
    private String sitePin;

    @JsonProperty("ComAddress")
    private String comAddress;

    @JsonProperty("ComVlgName")
    private String comVlgName;

    @JsonProperty("ComPin")
    private String comPin;

    @JsonProperty("ComLGDTehId")
    private Integer comLGDTehId;

    @JsonProperty("ComLGDDistId")
    private Integer comLGDDistId;
}
