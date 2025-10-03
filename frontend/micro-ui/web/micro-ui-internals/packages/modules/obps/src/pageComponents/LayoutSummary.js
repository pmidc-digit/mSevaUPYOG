import React from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SET_OBPS_STEP } from "../redux/actions/OBPSActions";
import LayoutDocumentsView from "./LayoutDocumentsView";

function LayoutSummary({ formData, t }) {
  const { pathname: url } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  console.log("formData in Summary Page", formData);

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
  if (index === 0) return t("BPA_GROUND_FLOOR_AREA_LABEL");
  const suffixes = ["st", "nd", "rd"];
  const suffix = suffixes[(index - 1) % 10 - 1] || "th";
  return `${index}${suffix} ${t("BPA_FLOOR_AREA_LABEL")}`; // e.g., "1st Floor"
  };


  const userInfo = Digit.UserService.getUser();
  const currentUser=userInfo?.info?.type;

  let docs = formData?.documents?.documents?.documents;
  console.log("documents here in summary", docs);

  return (
    <div style={pageStyle}>

      
        
          <h2 style={headingStyle}>{t("BPA_APPLICANT_DETAILS")}</h2>
          <div style={sectionStyle}>
            {renderLabel(t("BPA_FIRM_OWNER_NAME_LABEL"), formData?.applicationDetails?.applicantOwnerOrFirmName)}
            {renderLabel(t("BPA_APPLICANT_EMAIL_LABEL"), formData?.applicationDetails?.applicantEmailId)}
            {renderLabel(t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), formData?.applicationDetails?.applicantFatherHusbandName)}
            {renderLabel(t("BPA_APPLICANT_MOBILE_NO_LABEL"), formData?.applicationDetails?.applicantMobileNumber)}
            {renderLabel(t("BPA_APPLICANT_DOB_LABEL"), formData?.applicationDetails?.applicantDateOfBirth)}
            {renderLabel(t("BPA_APPLICANT_GENDER_LABEL"), formData?.applicationDetails?.applicantGender?.code)}
            {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), formData?.applicationDetails?.applicantAddress)}
          </div>
        
      
      {formData?.applicationDetails?.professionalName && 
        (
        <React.Fragment>
        <h2 style={headingStyle}>{t("BPA_PROFESSIONAL_DETAILS")}</h2>
          <div style={sectionStyle}>
            {renderLabel(t("BPA_PROFESSIONAL_NAME_LABEL"), formData?.applicationDetails?.professionalName)}
            {renderLabel(t("BPA_PROFESSIONAL_EMAIL_LABEL"), formData?.applicationDetails?.professionalEmailId)}
            {renderLabel(t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL"), formData?.applicationDetails?.professionalRegId)}
            {renderLabel(t("BPA_PROFESSIONAL_MOBILE_NO_LABEL"), formData?.applicationDetails?.professionalMobileNumber)}
            {renderLabel(t("BPA_PROFESSIONAL_ADDRESS_LABEL"), formData?.applicationDetails?.professionalAddress)}
          </div>
         </React.Fragment>
        )}

      <h2 style={headingStyle}>{t("BPA_LOCALITY_INFO_LABEL")}</h2>
      <div style={sectionStyle}>
         {renderLabel(t("BPA_AREA_TYPE_LABEL"), formData?.siteDetails?.layoutAreaType?.name)}
         {formData?.siteDetails?.layoutAreaType?.code === "SCHEME_AREA" && renderLabel(t("BPA_SCHEME_NAME_LABEL"), formData?.siteDetails?.layoutSchemeName)}
         {formData?.siteDetails?.layoutAreaType?.code === "APPROVED_COLONY" && renderLabel(t("BPA_APPROVED_COLONY_NAME_LABEL"), formData?.siteDetails?.layoutApprovedColonyName)}
         {formData?.siteDetails?.layoutAreaType?.code === "NON_SCHEME" && renderLabel(t("BPA_NON_SCHEME_TYPE_LABEL"), formData?.siteDetails?.layoutNonSchemeType?.name)}
      </div>
        
      <h2 style={headingStyle}>{t("BPA_SITE_DETAILS")}</h2>
      <div style={sectionStyle}>
        {renderLabel(t("BPA_PLOT_NO_LABEL"), formData?.siteDetails?.plotNo)}
        {renderLabel(t("BPA_PROPOSED_SITE_ADDRESS"), formData?.siteDetails?.proposedSiteAddress)}
        {renderLabel(t("BPA_ULB_NAME_LABEL"), formData?.siteDetails?.ulbName?.name)}
        {renderLabel(t("BPA_ULB_TYPE_LABEL"), formData?.siteDetails?.ulbType)}
        {renderLabel(t("BPA_KHASRA_NO_LABEL"), formData?.siteDetails?.khasraNo)}
        {renderLabel(t("BPA_HADBAST_NO_LABEL"), formData?.siteDetails?.hadbastNo)}
        {renderLabel(t("BPA_ROAD_TYPE_LABEL"), formData?.siteDetails?.roadType?.name)}
        {renderLabel(t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), formData?.siteDetails?.areaLeftForRoadWidening)}
        {renderLabel(t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL"), formData?.siteDetails?.netPlotAreaAfterWidening)}
        {renderLabel(t("BPA_ROAD_WIDTH_AT_SITE_LABEL"), formData?.siteDetails?.roadWidthAtSite)}
        {renderLabel(t("BPA_BUILDING_STATUS_LABEL"), formData?.siteDetails?.buildingStatus?.name)}
        {renderLabel(t("BPA_IS_BASEMENT_AREA_PRESENT_LABEL"), formData?.siteDetails?.isBasementAreaAvailable?.code)}

        {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" && renderLabel(t("BPA_BASEMENT_AREA_LABEL"), formData?.siteDetails?.basementArea)}
        
        {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" && formData?.siteDetails?.floorArea?.map((floor, index) =>
           renderLabel(getFloorLabel(index), floor?.value)
        )}

        {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" && renderLabel(t("BPA_TOTAL_FLOOR_AREA_LABEL"), formData?.siteDetails?.totalFloorArea)}

        {renderLabel(t("BPA_SCHEME_TYPE"), formData?.siteDetails?.schemeType?.name)}
        {renderLabel(t("BPA_TOTAL_AREA_UNDER_LAYOUT_IN_SQ_M_LABEL"), formData?.siteDetails?.totalAreaUnderLayout)}
        {renderLabel(t("BPA_AREA_UNDER_ROAD_WIDENING_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderRoadWidening)}
        {renderLabel(t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL"), formData?.siteDetails?.netSiteArea)}
        {renderLabel(t("BPA_AREA_UNDER_EWS_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderEWSInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_EWS_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderEWSInPct)}
        {renderLabel(t("BPA_BALANCE_AREA_IN_SQ_M_LABEL"), formData?.siteDetails?.balanceAreaInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderResidentialUseInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderResidentialUseInPct)}
        {renderLabel(t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderCommercialUseInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderCommercialUseInPct)}
        {renderLabel(t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderInstutionalUseInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderInstutionalUseInPct)}
        {renderLabel(t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderCommunityCenterInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderCommunityCenterInPct)}
        {renderLabel(t("BPA_AREA_UNDER_PARK_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderParkInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_PARK_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderParkInPct)}
        {renderLabel(t("BPA_AREA_UNDER_ROAD_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderRoadInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_ROAD_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderRoadInPct)}
        {renderLabel(t("BPA_AREA_UNDER_PARKING_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderParkingInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_PARKING_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderParkingInPct)}
        {renderLabel(t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderOtherAmenitiesInSqM)}
        {renderLabel(t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderOtherAmenitiesInPct)}

        {renderLabel(t("BPA_DISTRICT_LABEL"), formData?.siteDetails?.district?.name)}
        {renderLabel(t("BPA_ZONE_LABEL"), formData?.siteDetails?.zone?.name)}
        {renderLabel(t("BPA_SITE_WARD_NO_LABEL"), formData?.siteDetails?.wardNo)}
        {renderLabel(t("BPA_SITE_VILLAGE_NAME_LABEL"), formData?.siteDetails?.villageName)}
      </div>

      <h2 style={headingStyle}>{t("BPA_SPECIFICATION_DETAILS")}</h2>
      <div style={sectionStyle}>
        {renderLabel(t("BPA_PLOT_AREA_JAMA_BANDI_LABEL"), formData?.siteDetails?.specificationPlotArea)}
      </div>

      <h2 style={headingStyle}>{t("BPA_CLU_DETAILS")}</h2>
      <div style={sectionStyle}>
        {renderLabel(t("BPA_IS_CLU_APPROVED_LABEL"), formData?.siteDetails?.cluIsApproved?.code)}
        {formData?.siteDetails?.cluIsApproved?.code === "YES" && renderLabel(t("BPA_CLU_APPROVED_NUMBER_LABEL"), formData?.siteDetails?.cluNumber)}
      </div>

      <h2 style={headingStyle}>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</h2>
      <div style={sectionStyle}>
        {Array.isArray(formData?.documents?.documents?.documents) && formData.documents.documents.documents.length > 0 ? (
          <LayoutDocumentsView value={{ workflowDocs: formData.documents.documents.documents }}></LayoutDocumentsView>
        ) : (
          <div>{t("BPA_NO_DOCUMENTS_MSG")}</div>
        )}
      </div>
    </div>
  );
}

export default LayoutSummary;
