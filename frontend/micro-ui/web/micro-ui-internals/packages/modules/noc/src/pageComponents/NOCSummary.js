import React from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SET_NOCNewApplication_STEP } from "../redux/action/NOCNewApplicationActions";
import NOCDocument from "./NOCDocument";

function NOCSummary({ currentStepData:formData, t }) {
  const { pathname: url } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  console.log("formData in Summary Page", formData);

  const coordinates = useSelector(function (state) {
      return state?.noc?.NOCNewApplicationFormReducer?.coordinates || {};
  });

  console.log("coordinates in summary page", coordinates);

  const sectionStyle = {
    backgroundColor: "#ffffff",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    marginBottom: "2rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  };

  const labelFieldPairStyle = {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px dashed #e0e0e0",
    padding: "0.5rem 0",
    color: "#333",
  };

  const headingStyle = {
    fontSize: "1.5rem",
    borderBottom: "2px solid #ccc",
    paddingBottom: "0.3rem",
    color: "#2e4a66",
    marginTop: "2rem",
    marginBottom: "1rem",
  };

  const pageStyle = {
    padding: "2rem",
    backgroundColor: "#f9f9f9",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  };

  const boldLabelStyle = { fontWeight: "bold", color: "#555" };

  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
      <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      <div>{value || "NA"}</div>
    </div>
  );

  const getFloorLabel = (index) => {
  if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL");
  const suffixes = ["st", "nd", "rd"];
  const suffix = suffixes[(index - 1) % 10 - 1] || "th";
  return `${index}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`; // e.g., "1st Floor"
  };


  const userInfo = Digit.UserService.getUser();
  const currentUser=userInfo?.info?.type;

  let docs = formData?.documents?.documents?.documents;
  console.log("documents here in summary", docs);

  return (
    <div style={pageStyle}>

      
        
          <h2 style={headingStyle}>{t("NOC_APPLICANT_DETAILS")}</h2>
          <div style={sectionStyle}>
            {renderLabel(t("NOC_FIRM_OWNER_NAME_LABEL"), formData?.applicationDetails?.applicantOwnerOrFirmName)}
            {renderLabel(t("NOC_APPLICANT_EMAIL_LABEL"), formData?.applicationDetails?.applicantEmailId)}
            {renderLabel(t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), formData?.applicationDetails?.applicantFatherHusbandName)}
            {renderLabel(t("NOC_APPLICANT_PROPERTY_ID_LABEL"), formData?.applicationDetails?.applicantPropertyId)}
            {renderLabel(t("NOC_APPLICANT_MOBILE_NO_LABEL"), formData?.applicationDetails?.applicantMobileNumber)}
            {renderLabel(t("NOC_APPLICANT_DOB_LABEL"), formData?.applicationDetails?.applicantDateOfBirth)}
            {renderLabel(t("NOC_APPLICANT_GENDER_LABEL"), formData?.applicationDetails?.applicantGender?.code)}
            {renderLabel(t("NOC_APPLICANT_ADDRESS_LABEL"), formData?.applicationDetails?.applicantAddress)}
          </div>
        
      
      {formData?.applicationDetails?.professionalName && 
        (
        <React.Fragment>
        <h2 style={headingStyle}>{t("NOC_PROFESSIONAL_DETAILS")}</h2>
          <div style={sectionStyle}>
            {renderLabel(t("NOC_PROFESSIONAL_NAME_LABEL"), formData?.applicationDetails?.professionalName)}
            {renderLabel(t("NOC_PROFESSIONAL_EMAIL_LABEL"), formData?.applicationDetails?.professionalEmailId)}
            {renderLabel(t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL"), formData?.applicationDetails?.professionalRegId)}
            {renderLabel(t("NOC_PROFESSIONAL_MOBILE_NO_LABEL"), formData?.applicationDetails?.professionalMobileNumber)}
            {renderLabel(t("NOC_PROFESSIONAL_ADDRESS_LABEL"), formData?.applicationDetails?.professionalAddress)}
          </div>
         </React.Fragment>
        )}
        
      <h2 style={headingStyle}>{t("NOC_SITE_DETAILS")}</h2>
      <div style={sectionStyle}>
        {renderLabel(t("NOC_PLOT_NO_LABEL"), formData?.siteDetails?.plotNo)}
        {renderLabel(t("NOC_PROPOSED_SITE_ADDRESS"), formData?.siteDetails?.proposedSiteAddress)}
        {renderLabel(t("NOC_ULB_NAME_LABEL"), formData?.siteDetails?.ulbName?.name)}
        {renderLabel(t("NOC_ULB_TYPE_LABEL"), formData?.siteDetails?.ulbType)}
        {renderLabel(t("NOC_KHASRA_NO_LABEL"), formData?.siteDetails?.khasraNo)}
        {renderLabel(t("NOC_HADBAST_NO_LABEL"), formData?.siteDetails?.hadbastNo)}
        {renderLabel(t("NOC_ROAD_TYPE_LABEL"), formData?.siteDetails?.roadType?.name)}
        {renderLabel(t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), formData?.siteDetails?.areaLeftForRoadWidening)}
        {renderLabel(t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL"), formData?.siteDetails?.netPlotAreaAfterWidening)}
        {renderLabel(t("NOC_NET_TOTAL_AREA_LABEL"), formData?.siteDetails?.netTotalArea)}
        {renderLabel(t("NOC_ROAD_WIDTH_AT_SITE_LABEL"), formData?.siteDetails?.roadWidthAtSite)}
        {renderLabel(t("NOC_BUILDING_STATUS_LABEL"), formData?.siteDetails?.buildingStatus?.name)}
        {renderLabel(t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL"), formData?.siteDetails?.isBasementAreaAvailable?.code)}

        {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" && renderLabel(t("NOC_BASEMENT_AREA_LABEL"), formData?.siteDetails?.basementArea)}
        
        {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" && formData?.siteDetails?.floorArea?.map((floor, index) =>
           renderLabel(getFloorLabel(index), floor?.value)
        )}

        {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" && renderLabel(t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL"), formData?.siteDetails?.totalFloorArea)}

        {renderLabel(t("NOC_DISTRICT_LABEL"), formData?.siteDetails?.district?.name)}
        {renderLabel(t("NOC_ZONE_LABEL"), formData?.siteDetails?.zone?.name)}
        {renderLabel(t("NOC_SITE_WARD_NO_LABEL"), formData?.siteDetails?.wardNo)}
        {renderLabel(t("NOC_SITE_VILLAGE_NAME_LABEL"), formData?.siteDetails?.villageName)}

        {renderLabel(t("NOC_SITE_COLONY_NAME_LABEL"), formData?.siteDetails?.colonyName)}
        {renderLabel(t("NOC_SITE_VASIKA_NO_LABEL"), formData?.siteDetails?.vasikaNumber)}
        {renderLabel(t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL"), formData?.siteDetails?.khewatAndKhatuniNo)}
      </div>

      <h2 style={headingStyle}>{t("NOC_SPECIFICATION_DETAILS")}</h2>
      <div style={sectionStyle}>
        {renderLabel(t("NOC_PLOT_AREA_JAMA_BANDI_LABEL"), formData?.siteDetails?.specificationPlotArea)}
        {renderLabel(t("NOC_BUILDING_CATEGORY_LABEL"), formData?.siteDetails?.specificationBuildingCategory?.name)}
        
        {renderLabel(t("NOC_NOC_TYPE_LABEL"), formData?.siteDetails?.specificationNocType?.name)}
        {renderLabel(t("NOC_RESTRICTED_AREA_LABEL"), formData?.siteDetails?.specificationRestrictedArea?.code)}
        {renderLabel(t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL"), formData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code)}
      </div>

      <h2 style={headingStyle}>{t("NOC_SITE_COORDINATES_LABEL")}</h2>
      <div style={sectionStyle}>
        {renderLabel(t("COMMON_LATITUDE1_LABEL"), coordinates?.Latitude1)}
        {renderLabel(t("COMMON_LONGITUDE1_LABEL"),coordinates?.Longitude1)}
        
        {renderLabel(t("COMMON_LATITUDE2_LABEL"), coordinates?.Latitude2)}
        {renderLabel(t("COMMON_LONGITUDE2_LABEL"), coordinates?.Longitude2)}
      </div>

      <h2 style={headingStyle}>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</h2>
      <div style={sectionStyle}>
        {Array.isArray(formData?.documents?.documents?.documents) && formData.documents.documents.documents.length > 0 ? (
          <div className="documentsContainerStyle">
          <NOCDocument value={{ workflowDocs: formData.documents.documents.documents }}></NOCDocument>
          </div>
        ) : (
          <div>{t("NOC_NO_DOCUMENTS_MSG")}</div>
        )}
      </div>
    </div>
  );
}

export default NOCSummary;
