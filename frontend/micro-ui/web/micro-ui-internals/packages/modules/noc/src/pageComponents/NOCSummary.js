import React from "react";
import { Card, CardLabel, LabelFieldPair, CardSubHeader, StatusTable,Row } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SET_NOCNewApplication_STEP } from "../redux/action/NOCNewApplicationActions";
import NOCDocument from "./NOCDocument";
import NOCImageView from "./NOCImageView";
import NOCDocumentTableView from "./NOCDocumentTableView";
import NOCFeeEstimationDetails from "./NOCFeeEstimationDetails";

function NOCSummary({ currentStepData: formData, t }) {
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
  const currentUser = userInfo?.info?.type;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  let docs = formData?.documents?.documents?.documents;
  console.log("documents here in summary", docs);

  return (
    <div className="employee-main-application-details">

       <Card>
         <CardSubHeader>{t("OWNER_OWNERPHOTO")}</CardSubHeader>
        <StatusTable>
           <NOCImageView ownerFileStoreId={ownerPhotos?.ownerPhotoList?.[0]?.filestoreId} ownerName={formData?.applicationDetails?.owners?.[0]?.ownerOrFirmName} />
        </StatusTable>
        </Card>
      
      {(formData?.applicationDetails?.owners ?? [])?.map((owner, index)=>{
        return (
        <Card>
         <CardSubHeader>
           {index === 0 ? t("NOC_PRIMARY_OWNER") : `Owner ${index + 1}`}
         </CardSubHeader>
         <StatusTable>
         <Row label={t("NOC_FIRM_OWNER_NAME_LABEL")} text={owner?.ownerOrFirmName || "N/A"}/>
         <Row label={t("NOC_APPLICANT_EMAIL_LABEL")} text={owner?.emailId || "N/A"}/>
         <Row label={t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} text={owner?.fatherOrHusbandName || "N/A"}/>
         <Row label={t("NOC_APPLICANT_MOBILE_NO_LABEL")} text={owner?.mobileNumber || "N/A"}/>
         <Row label={t("NOC_APPLICANT_PROPERTY_ID_LABEL")} text={owner?.propertyId || "N/A"}/>
         <Row label={t("NOC_APPLICANT_DOB_LABEL")} text={formatDate(owner?.dateOfBirth) || "N/A"}/>   
         <Row label={t("NOC_APPLICANT_GENDER_LABEL")} text={owner?.gender?.code || "N/A"}/>
         <Row label={t("NOC_APPLICANT_ADDRESS_LABEL")} text={owner?.address || "N/A"}/>    
         </StatusTable>
        </Card>
        )
      })}

      {formData?.applicationDetails?.professionalName && (
        <React.Fragment>
        <Card>
        <CardSubHeader>{t("NOC_PROFESSIONAL_DETAILS")}</CardSubHeader>
        <StatusTable>
         <Row label={t("NOC_PROFESSIONAL_NAME_LABEL")} text={formData?.applicationDetails?.professionalName || "N/A"}/>
         <Row label={t("NOC_PROFESSIONAL_EMAIL_LABEL")} text={formData?.applicationDetails?.professionalEmailId || "N/A"}/>
         <Row label={t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL")} text={formData?.applicationDetails?.professionalRegId || "N/A"}/>
         <Row label={t("NOC_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL")} text={formData?.applicationDetails?.professionalRegIdValidity || "N/A"}/>
         <Row label={t("NOC_PROFESSIONAL_MOBILE_NO_LABEL")} text={formData?.applicationDetails?.professionalMobileNumber || "N/A"}/>
         <Row label={t("NOC_PROFESSIONAL_ADDRESS_LABEL")} text={formData?.applicationDetails?.professionalAddress|| "N/A"}/>   
        </StatusTable>
        </Card>
         </React.Fragment>
        )}
        
      <Card>
      <CardSubHeader>{t("NOC_SITE_DETAILS")}</CardSubHeader>
      <StatusTable>
        <Row label={t("NOC_PLOT_NO_LABEL")} text={formData?.siteDetails?.plotNo || "N/A"}/>
        <Row label={t("NOC_PROPOSED_SITE_ADDRESS")} text={formData?.siteDetails?.proposedSiteAddress || "N/A"}/>
        <Row label={t("NOC_ULB_NAME_LABEL")} text={formData?.siteDetails?.ulbName?.name || "N/A"}/>
        <Row label={t("NOC_ULB_TYPE_LABEL")} text={ formData?.siteDetails?.ulbType || "N/A"}/>
        <Row label={t("NOC_KHASRA_NO_LABEL")} text={formData?.siteDetails?.khasraNo || "N/A"}/>
        <Row label={t("NOC_HADBAST_NO_LABEL")} text={formData?.siteDetails?.hadbastNo || "N/A"}/>   
         <Row label={t("NOC_ROAD_TYPE_LABEL")} text={formData?.siteDetails?.roadType?.name || "N/A"}/>
         <Row label={t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")} text={formData?.siteDetails?.areaLeftForRoadWidening || "N/A"}/>
         <Row label={t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL")} text={formData?.siteDetails?.netPlotAreaAfterWidening || "N/A"}/>
         <Row label={t("NOC_NET_TOTAL_AREA_LABEL")} text={ formData?.siteDetails?.netTotalArea || "N/A"}/>
         <Row label={t("NOC_ROAD_WIDTH_AT_SITE_LABEL")} text={formData?.siteDetails?.roadWidthAtSite || "N/A"}/>
         <Row label={t("NOC_BUILDING_STATUS_LABEL")} text={formData?.siteDetails?.buildingStatus?.name || "N/A"}/>   

        {formData?.siteDetails?.isBasementAreaAvailable &&  <Row label={t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL")} text={formData?.siteDetails?.isBasementAreaAvailable?.code || "N/A"}/>}

        {formData?.siteDetails?.basementArea && <Row label={t("NOC_BASEMENT_AREA_LABEL")} text={formData?.siteDetails?.basementArea || "N/A"}/>}

        {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" && formData?.siteDetails?.floorArea?.map((floor, index) =>
           <Row label={getFloorLabel(index)} text={floor?.value || "N/A"}/>
        )}

        {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" && <Row label={t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL")} text={formData?.siteDetails?.totalFloorArea || "N/A"}/>}

        <Row label={t("NOC_DISTRICT_LABEL")} text={formData?.siteDetails?.district?.name || "N/A"}/>
        <Row label={t("NOC_ZONE_LABEL")} text={formData?.siteDetails?.zone?.name || "N/A"}/>
        <Row label={t("NOC_SITE_WARD_NO_LABEL")} text={formData?.siteDetails?.wardNo || "N/A"}/>
        <Row label={t("NOC_SITE_VILLAGE_NAME_LABEL")} text={ formData?.siteDetails?.villageName || "N/A"}/>
        <Row label={t("NOC_SITE_COLONY_NAME_LABEL")} text={formData?.siteDetails?.colonyName || "N/A"}/>
        <Row label={t("NOC_SITE_VASIKA_NO_LABEL")} text={formData?.siteDetails?.vasikaNumber || "N/A"}/>   
        <Row label={t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL")} text={formData?.siteDetails?.khewatAndKhatuniNo || "N/A"}/>

      </StatusTable>
      </Card>
     
      <Card>
      <CardSubHeader>{t("NOC_SPECIFICATION_DETAILS")}</CardSubHeader>
      <StatusTable>
        <Row label={t("NOC_PLOT_AREA_JAMA_BANDI_LABEL")} text={formData?.siteDetails?.specificationPlotArea || "N/A"}/>
        <Row label={t("NOC_BUILDING_CATEGORY_LABEL")} text={formData?.siteDetails?.specificationBuildingCategory?.name || "N/A"}/>
        <Row label={t("NOC_NOC_TYPE_LABEL")} text={formData?.siteDetails?.specificationNocType?.name || "N/A"}/>
        <Row label={t("NOC_RESTRICTED_AREA_LABEL")} text={formData?.siteDetails?.specificationRestrictedArea?.code || "N/A"}/>
        <Row label={t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL")} text={formData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code || "N/A"}/>
      </StatusTable>
      </Card>
      
      <Card>
        <CardSubHeader>{t("NOC_SITE_COORDINATES_LABEL")}</CardSubHeader>
        <StatusTable>
          <Row label={t("COMMON_LATITUDE1_LABEL")} text={coordinates?.Latitude1 || "N/A"} />
          <Row label={t("COMMON_LONGITUDE1_LABEL")} text={coordinates?.Longitude1 || "N/A"} />
          <Row label={t("COMMON_LATITUDE2_LABEL")} text={coordinates?.Latitude2 || "N/A"} />
          <Row label={t("COMMON_LONGITUDE2_LABEL")} text={coordinates?.Longitude2 || "N/A"} />
        </StatusTable>

        {/* Render site photographs dynamically in same style */}
        {formData?.documents?.documents?.documents
          ?.filter((doc) => doc.documentType?.startsWith("OWNER.SITEPHOTOGRAPH"))
          .map((photo, idx) => (
            <div key={photo.uuid} style={{ marginTop: "16px" }}>
              <NOCImageView
                ownerFileStoreId={photo.documentAttachment}
                ownerName={photo.documentType || `Site Photo ${idx + 1}`}
              />
            </div>
          ))}
      </Card>


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

      <Card>
      <CardSubHeader>{t("NOC_UPLOADED_OWNER_ID")}</CardSubHeader>
      <StatusTable>
        {ownerIds?.ownerIdList?.length > 0 && <NOCDocumentTableView documents={ownerIds?.ownerIdList} />}
      </StatusTable>
      </Card>

      <Card>
      <CardSubHeader>{t("NOC_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
      <StatusTable>
        {formData?.documents?.documents?.documents?.length > 0 && <NOCDocumentTableView documents={formData?.documents?.documents?.documents}/>}
      </StatusTable>
      </Card>

    </div>
  );
}

export default NOCSummary;
