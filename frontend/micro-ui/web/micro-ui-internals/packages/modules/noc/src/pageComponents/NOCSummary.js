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
      return state?.noc?.NOCNewApplicationFormReducer?.coordinates || {};
  });

  const ownerPhotos = useSelector(function (state) {
      return state?.noc?.NOCNewApplicationFormReducer?.ownerPhotos || [];
  });

  const ownerIds = useSelector(function (state) {
      return state?.noc?.NOCNewApplicationFormReducer?.ownerIds || [];
  });

  console.log("coordinates in summary page", coordinates);

  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
      <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      <div>{value || "NA"}</div>
    </div>
  );

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
           <NOCImageView ownerFileStoreId={ownerPhotos?.ownerPhotoList?.[0]?.filestoreId} ownerName={formData?.applicationDetails?.owners?.[0]?.ownerOrFirmName} />
          </div>
      
      {(formData?.applicationDetails?.owners ?? [])?.map((owner, index)=>{
        return (
        <div key={index} style={sectionStyle}>
         <h2 style={headingStyle}>
           {index === 0 ? t("NOC_PRIMARY_OWNER") : `Owner ${index + 1}`}
         </h2>

         {renderLabel(t("NOC_FIRM_OWNER_NAME_LABEL"), owner?.ownerOrFirmName)}
         {renderLabel(t("NOC_APPLICANT_EMAIL_LABEL"), owner?.emailId)}
         {renderLabel(t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), owner?.fatherOrHusbandName)}
         {renderLabel(t("NOC_APPLICANT_MOBILE_NO_LABEL"), owner?.mobileNumber)}
         {renderLabel(t("NOC_APPLICANT_PROPERTY_ID_LABEL"), owner?.propertyId)}
         {renderLabel(t("NOC_APPLICANT_DOB_LABEL"), formatDate(owner?.dateOfBirth))}
         {renderLabel(t("NOC_APPLICANT_GENDER_LABEL"), owner?.gender?.code)}
         {renderLabel(t("NOC_APPLICANT_ADDRESS_LABEL"), owner?.address)}
        </div>
        )
      })}
        
      
      {formData?.applicationDetails?.professionalName && 
        (
        <React.Fragment>
        <h2 style={headingStyle}>{t("NOC_PROFESSIONAL_DETAILS")}</h2>
          <div style={sectionStyle}>
            {renderLabel(t("NOC_PROFESSIONAL_NAME_LABEL"), formData?.applicationDetails?.professionalName)}
            {renderLabel(t("NOC_PROFESSIONAL_EMAIL_LABEL"), formData?.applicationDetails?.professionalEmailId)}
            {renderLabel(t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL"), formData?.applicationDetails?.professionalRegId)}
            {renderLabel(t("NOC_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL"), formData?.applicationDetails?.professionalRegIdValidity)}
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

      {/* <h2 style={headingStyle}>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</h2>
      <div style={sectionStyle}>
        {Array.isArray(formData?.documents?.documents?.documents) && formData.documents.documents.documents.length > 0 ? (
          <div className="documentsContainerStyle">
          <NOCDocument value={{ workflowDocs: formData.documents.documents.documents }}></NOCDocument>
          </div>
        ) : (
          <div>{t("NOC_NO_DOCUMENTS_MSG")}</div>
        )}
      </div> */}
      <h2 style={headingStyle}>{t("NOC_UPLOADED_OWNER_ID")}</h2>
      <div style={sectionStyle}>
        {ownerIds?.ownerIdList?.length > 0 && <NOCDocumentTableView documents={ownerIds?.ownerIdList} />}
      </div>

      <h2 style={headingStyle}>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</h2>
      <div style={sectionStyle}>
        {formData?.documents?.documents?.documents?.length > 0 && <NOCDocumentTableView documents={formData?.documents?.documents?.documents}/>}
      </div>

      <h2 style={headingStyle}>{t("NOC_FEE_DETAILS_LABEL")}</h2>
      <div style={sectionStyle}>
        {formData && <NOCFeeEstimationDetails formData={formData}/>}
      </div>


    </div>
  );
}

export default NOCSummary;
