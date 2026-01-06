import React from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SET_NOCNewApplication_STEP } from "../redux/action/NOCNewApplicationActions";
import NOCDocument from "./NOCDocument";
import NOCImageView from "./NOCImageView";
import NOCDocumentTableView from "./NOCDocumentTableView";
import NOCFeeEstimationDetails from "./NOCFeeEstimationDetails";

function NOCSummary({ currentStepData:formData, t }) {
  const { pathname: url } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  console.log("formData in Summary Page", formData);

  const coordinates = useSelector(function (state) {
      return state?.noc?.NOCNewApplicationFormReducer?.coordinates || {};
  });

  const ownerPhotos = useSelector(function (state) {
      return state?.noc?.NOCNewApplicationFormReducer?.ownerPhotos || [];
  });

  const ownerIds = useSelector(function (state) {
      return state?.noc?.NOCNewApplicationFormReducer?.ownerIds || [];
  });

  console.log("coordinates in summary page", coordinates);

  // Inline styles (matching PTR Summary pattern)
  const pageStyle = {
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  };

  const sectionStyle = {
    backgroundColor: "#ffffff",
    padding: "1rem 0",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 6px rgba(18,38,63,0.04)",
  };

  const headerRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
    padding: "0 1.5rem",
  };

  const headingStyle = {
    fontSize: "1.25rem",
    color: "#2e4a66",
    margin: 0,
    fontWeight: "600",
  };

  const labelFieldPairStyle = {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px dashed #e9eef2",
    padding: "0.6rem 1.5rem",
    alignItems: "center",
  };

  const boldLabelStyle = {
    fontWeight: "600",
    color: "#333",
    flex: "0 0 40%",
    wordBreak: "normal",
  };

  const valueStyle = {
    textAlign: "right",
    flex: "0 0 55%",
    wordBreak: "break-word",
    color: "#555",
  };

  const renderLabel = (label, value) => {
    if (!value || value === "NA" || value === "" || value === null || value === undefined) {
      return null;
    }
    
    return (
      <div style={labelFieldPairStyle}>
        <CardLabel style={boldLabelStyle}>{label}</CardLabel>
        <div style={valueStyle}>{value}</div>
      </div>
    );
  };

  const getFloorLabel = (index) => {
    if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL");

    const floorNumber = index;
    const lastDigit = floorNumber % 10;
    const lastTwoDigits = floorNumber % 100;

    let suffix = "th";
    if (lastTwoDigits < 11 || lastTwoDigits > 13) {
      if (lastDigit === 1) suffix = "st";
      else if (lastDigit === 2) suffix = "nd";
      else if (lastDigit === 3) suffix = "rd";
    }

    return `${floorNumber}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`;
  };

  const userInfo = Digit.UserService.getUser();
  const currentUser=userInfo?.info?.type;

  let docs = formData?.documents?.documents?.documents;
  console.log("documents here in summary", docs);

  return (
    <div style={pageStyle}>
      {/* OWNER PHOTO */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("OWNER_OWNERPHOTO")}</h3>
          </div>
          <div style={{ padding: "0 1.5rem" }}>
            <NOCImageView ownerFileStoreId={ownerPhotos?.ownerPhotoList?.[0]?.filestoreId} ownerName={formData?.applicationDetails?.owners?.[0]?.ownerOrFirmName} />
          </div>
        </div>
      </Card>
      
      {/* OWNERS DETAILS */}
      {(formData?.applicationDetails?.owners ?? [])?.map((owner, index)=>{
        return (
          <Card key={index} style={{ marginBottom: "1.5rem" }}>
            <div style={sectionStyle}>
              <div style={headerRow}>
                <h3 style={headingStyle}>
                  {index === 0 ? t("NOC_PRIMARY_OWNER") : `Owner ${index + 1}`}
                </h3>
              </div>
              {renderLabel(t("NOC_FIRM_OWNER_NAME_LABEL"), owner?.ownerOrFirmName)}
              {renderLabel(t("NOC_APPLICANT_EMAIL_LABEL"), owner?.emailId)}
              {renderLabel(t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), owner?.fatherOrHusbandName)}
              {renderLabel(t("NOC_APPLICANT_MOBILE_NO_LABEL"), owner?.mobileNumber)}
              {renderLabel(t("NOC_APPLICANT_PROPERTY_ID_LABEL"), owner?.propertyId)}
              {renderLabel(t("NOC_APPLICANT_DOB_LABEL"), owner?.dateOfBirth)}
              {renderLabel(t("NOC_APPLICANT_GENDER_LABEL"), owner?.gender?.code)}
              {renderLabel(t("NOC_APPLICANT_ADDRESS_LABEL"), owner?.address)}
            </div>
          </Card>
        )
      })}
        
      {/* PROFESSIONAL DETAILS */}
      {formData?.applicationDetails?.professionalName && (
        <Card style={{ marginBottom: "1.5rem" }}>
          <div style={sectionStyle}>
            <div style={headerRow}>
              <h3 style={headingStyle}>{t("NOC_PROFESSIONAL_DETAILS")}</h3>
            </div>
            {renderLabel(t("NOC_PROFESSIONAL_NAME_LABEL"), formData?.applicationDetails?.professionalName)}
            {renderLabel(t("NOC_PROFESSIONAL_EMAIL_LABEL"), formData?.applicationDetails?.professionalEmailId)}
            {renderLabel(t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL"), formData?.applicationDetails?.professionalRegId)}
            {renderLabel(t("NOC_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL"), formData?.applicationDetails?.professionalRegIdValidity)}
            {renderLabel(t("NOC_PROFESSIONAL_MOBILE_NO_LABEL"), formData?.applicationDetails?.professionalMobileNumber)}
            {renderLabel(t("NOC_PROFESSIONAL_ADDRESS_LABEL"), formData?.applicationDetails?.professionalAddress)}
          </div>
        </Card>
      )}
        
      {/* SITE DETAILS */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("NOC_SITE_DETAILS")}</h3>
          </div>
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
          {formData?.siteDetails?.isBasementAreaAvailable && renderLabel(t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL"), formData?.siteDetails?.isBasementAreaAvailable?.code)}
          {formData?.siteDetails?.basementArea && renderLabel(t("NOC_BASEMENT_AREA_LABEL"), formData?.siteDetails?.basementArea)}
          
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
      </Card>

      {/* SPECIFICATION DETAILS */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("NOC_SPECIFICATION_DETAILS")}</h3>
          </div>
          {renderLabel(t("NOC_PLOT_AREA_JAMA_BANDI_LABEL"), formData?.siteDetails?.specificationPlotArea)}
          {renderLabel(t("NOC_BUILDING_CATEGORY_LABEL"), formData?.siteDetails?.specificationBuildingCategory?.name)}
          {renderLabel(t("NOC_NOC_TYPE_LABEL"), formData?.siteDetails?.specificationNocType?.name)}
          {renderLabel(t("NOC_RESTRICTED_AREA_LABEL"), formData?.siteDetails?.specificationRestrictedArea?.code)}
          {renderLabel(t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL"), formData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code)}
        </div>
      </Card>

      {/* SITE COORDINATES */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("NOC_SITE_COORDINATES_LABEL")}</h3>
          </div>
          {renderLabel(t("COMMON_LATITUDE1_LABEL"), coordinates?.Latitude1)}
          {renderLabel(t("COMMON_LONGITUDE1_LABEL"), coordinates?.Longitude1)}
          {renderLabel(t("COMMON_LATITUDE2_LABEL"), coordinates?.Latitude2)}
          {renderLabel(t("COMMON_LONGITUDE2_LABEL"), coordinates?.Longitude2)}
        </div>
      </Card>

      {/* UPLOADED OWNER ID */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("NOC_UPLOADED_OWNER_ID")}</h3>
          </div>
          <div style={{ padding: "0 1.5rem" }}>
            {ownerIds?.ownerIdList?.length > 0 && <NOCDocumentTableView documents={ownerIds?.ownerIdList} />}
          </div>
        </div>
      </Card>

      {/* DOCUMENTS UPLOADED */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</h3>
          </div>
          <div style={{ padding: "0 1.5rem" }}>
            {formData?.documents?.documents?.documents?.length > 0 && <NOCDocumentTableView documents={formData?.documents?.documents?.documents}/>}
          </div>
        </div>
      </Card>

      {/* FEE DETAILS */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <h3 style={headingStyle}>{t("NOC_FEE_DETAILS_LABEL")}</h3>
          </div>
          <div style={{ padding: "0 1.5rem" }}>
            {formData && <NOCFeeEstimationDetails formData={formData}/>}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default NOCSummary;
