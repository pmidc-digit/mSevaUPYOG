import React from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CLUImageView from "./CLUImgeView";
import CLUDocumentTableView from "./CLUDocumentTableView";
import CLUFeeEstimationDetails from "./CLUFeeEstimationDetails";

function CLUSummary({ currentStepData: formData, t }) {
  console.log("formData in Summary Page", formData);

  const pageStyle = {
    padding: "16px",
    background: "#fff",
  };
 
  const headingStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0b4b66",
    marginBottom: "12px",
    marginTop: "20px",
    borderBottom: "2px solid #0b4b66",
    paddingBottom: "8px",
  };
 
  const sectionStyle = {
    background: "#fafafa",
    padding: "16px",
    borderRadius: "4px",
    marginBottom: "16px",
    border: "1px solid #e0e0e0",
  };
 
  const labelFieldPairStyle = {
    display: "flex",
    flexDirection: "row",
    marginBottom: "8px",
    alignItems: "flex-start",
  };
 
  const boldLabelStyle = {
    fontWeight: "600",
 
    minWidth: "200px",
    marginRight: "16px",
  };

  const coordinates = useSelector(function (state) {
    return state?.obps?.OBPSFormReducer?.coordinates || {};
  });
    
  const ownerPhotos = useSelector(function (state) {
        return state.obps.OBPSFormReducer.ownerPhotos;
  });

  const ownerIds = useSelector(function (state) {
      return state.obps.OBPSFormReducer.ownerIds;
  });

  //console.log("coordinates in summary page", coordinates);
  console.log("ownerPhotos(redux)", ownerPhotos);
  console.log("ownerFileStoreId", ownerPhotos?.ownerPhotoList?.[0]?.fileStoreId);
  

  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
      <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      <div>{value || "NA"}</div>
    </div>
  );

  
 const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
 };


  let docs = formData?.documents?.documents?.documents;
  console.log("documents here in summary", docs);

  return (
    <div style={pageStyle}>
      <h2 style={headingStyle}>{t("OWNER_OWNERPHOTO")}</h2>
      <div style={sectionStyle}>
        <CLUImageView ownerFileStoreId={ownerPhotos?.ownerPhotoList?.[0]?.filestoreId} ownerName={formData?.applicationDetails?.owners?.[0]?.ownerOrFirmName} />
      </div>

      {(formData?.applicationDetails?.owners ?? [])?.map((owner, index)=>{
        return (
        <div key={index} style={sectionStyle}>
         <h2 style={headingStyle}>
           {index === 0 ? t("BPA_PRIMARY_OWNER") : `Owner ${index + 1}`}
         </h2>

         {renderLabel(t("BPA_FIRM_OWNER_NAME_LABEL"), owner?.ownerOrFirmName)}
         {renderLabel(t("BPA_APPLICANT_EMAIL_LABEL"), owner?.emailId)}
         {renderLabel(t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), owner?.fatherOrHusbandName)}
         {renderLabel(t("BPA_APPLICANT_MOBILE_NO_LABEL"), owner?.mobileNumber)}
         {renderLabel(t("BPA_APPLICANT_DOB_LABEL"), formatDate(owner?.dateOfBirth))}
         {renderLabel(t("BPA_APPLICANT_GENDER_LABEL"), owner?.gender?.code)}
         {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), owner?.address)}
        </div>
        )
      })}

      {formData?.applicationDetails?.professionalName && (
        <React.Fragment>
          <h2 style={headingStyle}>{t("BPA_PROFESSIONAL_DETAILS")}</h2>
          <div style={sectionStyle}>
            {renderLabel(t("BPA_PROFESSIONAL_NAME_LABEL"), formData?.applicationDetails?.professionalName)}
            {renderLabel(t("BPA_PROFESSIONAL_EMAIL_LABEL"), formData?.applicationDetails?.professionalEmailId)}
            {renderLabel(t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL"), formData?.applicationDetails?.professionalRegId)}
            {renderLabel(t("BPA_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL"), formData?.applicationDetails?.professionalRegIdValidity)}
            {renderLabel(t("BPA_PROFESSIONAL_MOBILE_NO_LABEL"), formData?.applicationDetails?.professionalMobileNumber)}
            {renderLabel(t("BPA_PROFESSIONAL_ADDRESS_LABEL"), formData?.applicationDetails?.professionalAddress)}
          </div>
        </React.Fragment>
      )}

      <h2 style={headingStyle}>{t("BPA_LOCALITY_INFO_LABEL")}</h2>
      <div style={sectionStyle}>
        {renderLabel(t("BPA_AREA_TYPE_LABEL"), formData?.siteDetails?.localityAreaType?.name)}

        {formData?.siteDetails?.localityAreaType?.code === "SCHEME_AREA" &&
          renderLabel(t("BPA_SCHEME_NAME_LABEL"), formData?.siteDetails?.localitySchemeName)}

        {formData?.siteDetails?.localityAreaType?.code === "APPROVED_COLONY" &&
          renderLabel(t("BPA_APPROVED_COLONY_NAME_LABEL"), formData?.siteDetails?.localityApprovedColonyName)}

        {formData?.siteDetails?.localityAreaType?.code === "NON_SCHEME" &&
          renderLabel(t("BPA_NON_SCHEME_TYPE_LABEL"), formData?.siteDetails?.localityNonSchemeType?.name)}

        {renderLabel(t("BPA_NOTICE_ISSUED_LABEL"), formData?.siteDetails?.localityNoticeIssued?.code)}
        {formData?.siteDetails?.localityNoticeIssued?.code === "YES" &&
          renderLabel(t("BPA_NOTICE_NUMBER_LABEL"), formData?.siteDetails?.localityNoticeNumber)}

        {renderLabel(t("BPA_SCHEME_COLONY_TYPE_LABEL"), formData?.siteDetails?.localityColonyType?.name)}
        {renderLabel(t("BPA_TRANSFERRED_SCHEME_TYPE_LABEL"), formData?.siteDetails?.localityTransferredSchemeType?.name)}

      </div>

      <h2 style={headingStyle}>{t("BPA_SITE_DETAILS")}</h2>
      <div style={sectionStyle}>
        {renderLabel(t("BPA_PLOT_NO_LABEL"), formData?.siteDetails?.plotNo)}

        {renderLabel(t("BPA_PLOT_AREA_LABEL"), formData?.siteDetails?.plotArea)}
        {renderLabel(t("BPA_KHEWAT_KHATUNI_NO_LABEL"), formData?.siteDetails?.khewatOrKhatuniNo)}
        {renderLabel(t("BPA_CORE_AREA_LABEL"), formData?.siteDetails?.coreArea?.code)}

        {renderLabel(t("BPA_PROPOSED_SITE_ADDRESS"), formData?.siteDetails?.proposedSiteAddress)}
        {renderLabel(t("BPA_ULB_NAME_LABEL"), formData?.siteDetails?.ulbName?.name)}
        {renderLabel(t("BPA_ULB_TYPE_LABEL"), formData?.siteDetails?.ulbType)}
        {renderLabel(t("BPA_KHASRA_NO_LABEL"), formData?.siteDetails?.khasraNo)}
        {renderLabel(t("BPA_HADBAST_NO_LABEL"), formData?.siteDetails?.hadbastNo)}
        {renderLabel(t("BPA_ROAD_TYPE_LABEL"), formData?.siteDetails?.roadType?.name)}
        {renderLabel(t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), formData?.siteDetails?.areaLeftForRoadWidening)}
        {renderLabel(t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL"), formData?.siteDetails?.netPlotAreaAfterWidening)}
        {renderLabel(t("BPA_NET_TOTAL_AREA_LABEL"), formData?.siteDetails?.netTotalArea)}

        {renderLabel(t("BPA_ROAD_WIDTH_AT_SITE_LABEL"), formData?.siteDetails?.roadWidthAtSite)}

        {renderLabel(t("BPA_SITE_WARD_NO_LABEL"), formData?.siteDetails?.wardNo)}
        {renderLabel(t("BPA_DISTRICT_LABEL"), formData?.siteDetails?.district?.name)}
        {renderLabel(t("BPA_ZONE_LABEL"), formData?.siteDetails?.zone?.name)}

        {renderLabel(t("BPA_SITE_VASIKA_NO_LABEL"), formData?.siteDetails?.vasikaNumber)}
        {renderLabel(t("BPA_SITE_VILLAGE_NAME_LABEL"), formData?.siteDetails?.villageName)}

        {renderLabel(t("BPA_OWNERSHIP_IN_PCT_LABEL"), formData?.siteDetails?.ownershipInPct)}

        {renderLabel(t("BPA_PROPOSED_ROAD_WIDTH_AFTER_WIDENING_LABEL"), formData?.siteDetails?.proposedRoadWidthAfterWidening)}

        {renderLabel(t("BPA_CATEGORY_APPLIED_FOR_CLU_LABEL"), formData?.siteDetails?.appliedCluCategory?.name)}
        {renderLabel(t("BPA_PROPERTY_UID_LABEL"), formData?.siteDetails?.propertyUid)}
        {renderLabel(t("BPA_BUILDING_STATUS_LABEL"), formData?.siteDetails?.buildingStatus?.name)}
        {renderLabel(t("BPA_IS_ORIGINAL_CATEGORY_AGRICULTURE_LABEL"), formData?.siteDetails?.isOriginalCategoryAgriculture?.code)}
        {renderLabel(t("BPA_RESTRICTED_AREA_LABEL"), formData?.siteDetails?.restrictedArea?.code)}
        {renderLabel(t("BPA_IS_SITE_UNDER_MASTER_PLAN_LABEL"), formData?.siteDetails?.isSiteUnderMasterPlan?.code)}

        {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL"), formData?.siteDetails?.buildingCategory?.name)}
      </div>

      <h2 style={headingStyle}>{t("BPA_SPECIFICATION_DETAILS")}</h2>
      <div style={sectionStyle}>{renderLabel(t("BPA_PLOT_AREA_JAMA_BANDI_LABEL"), formData?.siteDetails?.specificationPlotArea)}</div>

      <h2 style={headingStyle}>{t("BPA_SITE_COORDINATES_LABEL")}</h2>
      <div style={sectionStyle}>
        {renderLabel(t("COMMON_LATITUDE1_LABEL"), coordinates?.Latitude1)}
        {renderLabel(t("COMMON_LONGITUDE1_LABEL"), coordinates?.Longitude1)}

        {renderLabel(t("COMMON_LATITUDE2_LABEL"), coordinates?.Latitude2)}
        {renderLabel(t("COMMON_LONGITUDE2_LABEL"), coordinates?.Longitude2)}
      </div>

      <h2 style={headingStyle}>{t("BPA_UPLOADED_OWNER_ID")}</h2>
      <div style={sectionStyle}>
        {ownerIds?.ownerIdList?.length > 0 && <CLUDocumentTableView documents={ownerIds?.ownerIdList} />}
      </div>

      <h2 style={headingStyle}>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</h2>
      <div style={sectionStyle}>
        {formData?.documents?.documents?.documents?.length > 0 && <CLUDocumentTableView documents={formData?.documents?.documents?.documents} />}
      </div>

      <h2 style={headingStyle}>{t("BPA_FEE_DETAILS_LABEL")}</h2>
      <div style={sectionStyle}>
        {formData && <CLUFeeEstimationDetails formData={formData}/>}
      </div>

    </div>
  );
}

export default CLUSummary;
