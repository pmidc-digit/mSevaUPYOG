
import React, { useState, useEffect } from "react";
import { Card, CardLabel, LabelFieldPair, Table, LinkButton, ImageViewer, CardSubHeader, StatusTable } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SET_OBPS_STEP } from "../redux/actions/OBPSActions";
import LayoutDocumentsView from "./LayoutDocumentsView";
import LayoutImageView from "./LayoutImageView";
import LayoutFeeEstimationDetailsTable from "./LayoutFeeEstimationDetailsTable";
import LayoutDocumentTableView from "./LayoutDocumentsView";
import NocSitePhotographs from "../components/NocSitePhotographs";
import CustomOwnerImage from "../components/CustomOwnerImage";
import LayoutFeeEstimationDetails from "./LayoutFeeEstimationDetails";

// Component to render document link
const DocumentLink = ({ fileStoreId, stateCode, t, label }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (fileStoreId) {
        try {
          const result = await Digit.UploadServices.Filefetch([fileStoreId], stateCode);
          if (result?.data?.fileStoreIds?.[0]?.url) {
            setUrl(result.data.fileStoreIds[0].url);
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
    };
    fetchUrl();
  }, [fileStoreId, stateCode]);

  if (!url) return <span>{t("CS_NA") || "NA"}</span>;

  return (
    <LinkButton
     
      label={t("View") || "View"}
      onClick={() => window.open(url, "_blank")}
    />
  );
};


function LayoutSummary({ currentStepData: formData, t }) {

  const stateCode = Digit.ULBService.getStateId();
  
  // Check if we're in EDIT mode or NEW mode (same logic as LayoutStepFormFour)
  // In NEW mode: data is at formData.apiData.Layout[0]
  // In EDIT mode: data is at formData.apiData directly
  const isEditMode = !formData?.apiData?.Layout;
  const layoutData = isEditMode 
    ? formData?.apiData 
    : formData?.apiData?.Layout?.[0];
  
  // Get owners from API response (existing owners)
  const ownersFromApi = layoutData?.owners || [];
  
  // Get newly added applicants from Redux state (starts from index 1, index 0 is placeholder)
  const applicantsFromRedux = formData?.applicants || [];
  const newlyAddedApplicants = applicantsFromRedux.filter(app => app?.name); // Filter out empty entries
  
  // For fresh applications (non-edit mode), construct primary owner from applicationDetails
  let primaryOwner = null;
  if (!isEditMode && formData?.applicationDetails) {
    primaryOwner = {
      name: formData.applicationDetails.applicantOwnerOrFirmName,
      mobileNumber: formData.applicationDetails.applicantMobileNumber,
      emailId: formData.applicationDetails.applicantEmailId,
      gender: formData.applicationDetails.applicantGender,
      dob: formData.applicationDetails.applicantDateOfBirth,
      fatherOrHusbandName: formData.applicationDetails.applicantFatherHusbandName,
      permanentAddress: formData.applicationDetails.applicantAddress,
      pan: formData.applicationDetails.panNumber,
      aplicantType: formData.applicationDetails.aplicantType,
      authorisedPerson: formData.applicationDetails.authorisedPerson,
    };
  }
  
  // Merge: API owners + newly added applicants from Redux (if any)
  // For edit mode: combine existing owners with newly added ones
  // For fresh mode: combine primary owner (from applicationDetails) with newly added applicants
  let owners = [];
  
  // if (isEditMode && ownersFromApi.length > 0) {
  //   // Edit mode: existing owners from API + new applicants
  //   owners = [...ownersFromApi, ...newlyAddedApplicants.filter(newApp => 
  //     !ownersFromApi.some(existingOwner => existingOwner.mobileNumber === newApp.mobileNumber)
  //   )];
  // } else 
  if (!isEditMode && primaryOwner) {
    // Fresh mode: primary owner + new applicants
    owners = [primaryOwner, ...newlyAddedApplicants];
  } else {
    // Fallback
    owners = ownersFromApi.length > 0 ? ownersFromApi : newlyAddedApplicants;
  }

  const activeApplicants = owners?.slice(1)?.filter(a => a?.status);
  
  const layoutDocuments = layoutData?.documents || [];

  // Documents from fresh application flow (Redux state)
  const photoUploadedFiles = formData?.photoUploadedFiles || {};
  const documentUploadedFiles = formData?.documentUploadedFiles || {};
  const panDocumentUploadedFiles = formData?.panDocumentUploadedFiles || {};

  

  // Helper function to find document by type and owner index
  // Searches in both API documents (edit mode) and Redux state (fresh application)
  const findOwnerDocument = (ownerIndex, docType) => {
    // First try to find from Redux state (fresh application flow)
    // For primary owner (index 0), the key is 0, for additional owners the key matches their index in applicants array
    if (docType === "OWNERPHOTO" && photoUploadedFiles) {
      const photoFile = photoUploadedFiles[ownerIndex];
      if (photoFile?.fileStoreId || photoFile?.uuid) {
        return photoFile?.fileStoreId || photoFile?.uuid;
      }
    }
    
    if (docType === "OWNERVALIDID" && documentUploadedFiles) {
      const docFile = documentUploadedFiles[ownerIndex];
      if (docFile?.fileStoreId || docFile?.uuid) {
        return docFile?.fileStoreId || docFile?.uuid;
      }
    }

    if (docType === "PANDOCUMENT" && panDocumentUploadedFiles) {
      const panFile = panDocumentUploadedFiles[ownerIndex];
      if (panFile?.fileStoreId || panFile?.uuid) {
        return panFile?.fileStoreId || panFile?.uuid;
      }
    }

    // Then try to find from API documents (edit mode)
    // For primary owner (index 0), look for OWNER.OWNERPHOTO or OWNER.OWNERVALIDID
    // For additional owners, look for OWNER.OWNERPHOTO_{index} or OWNER.OWNERVALIDID_{index}
    if (layoutDocuments && layoutDocuments.length > 0) {
      let documentTypeKey = "";
      if (ownerIndex === 0) {
        documentTypeKey = `OWNER.${docType}`;
      } else {
        documentTypeKey = `OWNER.${docType}_${ownerIndex}`;
      }
      
      const doc = layoutDocuments.find((d) => d.documentType === documentTypeKey);
      if (doc?.uuid || doc?.fileStoreId) {
        return doc?.uuid || doc?.fileStoreId;
      }
    }

    // Also check owner's additionalDetails (if stored there)
    if (owners && owners[ownerIndex]?.additionalDetails) {
      if (docType === "OWNERPHOTO" && owners[ownerIndex]?.additionalDetails?.ownerPhoto) {
        return owners[ownerIndex]?.additionalDetails?.ownerPhoto;
      }
      if (docType === "OWNERVALIDID" && owners[ownerIndex]?.additionalDetails?.documentFile) {
        return owners[ownerIndex]?.additionalDetails?.documentFile;
      }
      if (docType === "PANDOCUMENT" && owners[ownerIndex]?.additionalDetails?.panDocument) {
        return owners[ownerIndex]?.additionalDetails?.panDocument;
      }
    }

    return null;
  };


  const coordinates = useSelector(function (state) {
    return state?.obps?.LayoutNewApplicationFormReducer?.coordinates || {};
  });

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
    fontSize: "22px"
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
    // flex: "0 0 55%",
    wordBreak: "break-word",
    color: "#555",
  };

  const renderLabel = (label, value) => {
    if (!value || value === "NA" || value === "" || value === null || value === undefined || value === "0.00") {
      return null;
    }
    
    return (
      <div style={labelFieldPairStyle}>
        <CardLabel style={boldLabelStyle}>{label}</CardLabel>
        <div style={valueStyle}>{t(value)}</div>
      </div>
    );
  }

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

  const userInfo = Digit.UserService.getUser()
  const currentUser = userInfo?.info?.type

  const convertDateToISO = (dateStr) => {
  if (!dateStr) return "";

  const parts = dateStr.split("-");

  // yyyy-mm-dd (already ISO)
  if (parts[2].length === 4) {
    return dateStr;
  }

  // dd-mm-yyyy → yyyy-mm-dd
  const [yyyy, mm, dd,] = parts;
  return `${dd}/${mm}/${yyyy}`;
};

  const docs = formData?.documents?.documents?.documents

  const sitePhotos = docs?.filter(
            (doc) => doc.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc.documentType === "OWNER.SITEPHOTOGRAPHTWO"
          )?.sort((a,b) => a?.order-b?.order);


  return (
    <div style={pageStyle}>
      <CustomOwnerImage 
        ownerFileStoreId={findOwnerDocument(0, "OWNERPHOTO")}
        ownerName={owners[0]?.name}
      />
      {/* OWNERS DETAILS AND DOCUMENTS */}
      {owners && owners.length > 0 && (
        <React.Fragment>
          {/* PRIMARY OWNER */}
          <Card style={{ marginBottom: "1.5rem" }}>
            <div style={sectionStyle}>
              <div style={headerRow}>
                <CardSubHeader>{t("Primary Owner") || "Primary Owner"}</CardSubHeader>
              </div>
              {renderLabel(owners[0]?.aplicantType?.code === "FIRM" ? t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL") : t("APPLICANT_NAME"), owners[0]?.name)}
              {renderLabel(t("CLU_OWNER_TYPE_LABEL"), owners[0]?.aplicantType?.name || "")}
              {owners[0]?.aplicantType?.code === "FIRM" && renderLabel(t("NEW_LAYOUT_FIRM_NAME_LABEL"), owners[0]?.authorisedPerson || "N/A")}
              {renderLabel(t("BPA_APPLICANT_MOBILE_NO_LABEL"), owners[0]?.mobileNumber)}
              {renderLabel(t("BPA_APPLICANT_EMAIL_LABEL"), owners[0]?.emailId)}
              {renderLabel(t("BPA_APPLICANT_GENDER_LABEL"), owners[0]?.gender?.code || owners[0]?.gender?.value || owners[0]?.gender)}
              {renderLabel(t("BPA_APPLICANT_DOB_LABEL"), owners[0]?.dob ? new Date(owners[0]?.dob).toLocaleDateString() : null)}
              {renderLabel(t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), owners[0]?.fatherOrHusbandName)}
              {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), owners[0]?.permanentAddress)}
              
              {/* Documents Section */}
              <div style={labelFieldPairStyle}>
                <CardLabel style={boldLabelStyle}>{t("BPA_APPLICANT_PASSPORT_PHOTO") || "Photo"}</CardLabel>
                <div style={valueStyle}><DocumentLink fileStoreId={findOwnerDocument(0, "OWNERPHOTO")} stateCode={stateCode} t={t} /></div>
              </div>
              <div style={labelFieldPairStyle}>
                <CardLabel style={boldLabelStyle}>{t("BPA_APPLICANT_ID_PROOF") || "ID Proof"}</CardLabel>
                <div style={valueStyle}><DocumentLink fileStoreId={findOwnerDocument(0, "OWNERVALIDID")} stateCode={stateCode} t={t} /></div>
              </div>
              <div style={labelFieldPairStyle}>
                <CardLabel style={boldLabelStyle}>{t("BPA_PAN_DOCUMENT") || "PAN Document"}</CardLabel>
                <div style={valueStyle}><DocumentLink fileStoreId={findOwnerDocument(0, "PANDOCUMENT")} stateCode={stateCode} t={t} /></div>
              </div>
              {renderLabel(t("BPA_PAN_NUMBER_LABEL"), formData?.applicationDetails?.panNumber)}
            </div>
          </Card>

          {/* ADDITIONAL OWNERS */}
          {owners.length > 1 && owners.slice(1).map((owner, index) => {
            if (!owner?.status) return null;
            const visibleIndex = activeApplicants.findIndex(a => a === owner);

            return (
            <Card key={index + 1} style={{ marginBottom: "1.5rem" }}>
              <div style={sectionStyle}>
                <div style={headerRow}>
                  <CardSubHeader>{t("Additional Owner") || "Additional Owner"} {visibleIndex + 1}</CardSubHeader>
                </div>
                {renderLabel(t("BPA_FIRM_OWNER_NAME_LABEL"), owner?.name)}
                {renderLabel(t("BPA_APPLICANT_MOBILE_NO_LABEL"), owner?.mobileNumber)}
                {renderLabel(t("BPA_APPLICANT_EMAIL_LABEL"), owner?.emailId)}
                {renderLabel(t("BPA_APPLICANT_GENDER_LABEL"), owner?.gender?.code || owner?.gender?.value || owner?.gender)}
                {renderLabel(t("BPA_APPLICANT_DOB_LABEL"), owner?.dob ? convertDateToISO(owner?.dob) : null)}
                {renderLabel(t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), owner?.fatherOrHusbandName)}
                {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), owner?.permanentAddress || owner?.address)}
                
                {/* Documents Section */}
                <div style={labelFieldPairStyle}>
                  <CardLabel style={boldLabelStyle}>{t("BPA_APPLICANT_PASSPORT_PHOTO") || "Photo"}</CardLabel>
                  <div style={valueStyle}><DocumentLink fileStoreId={owner?.photoUploadedFiles} stateCode={stateCode} t={t} /></div>
                </div>
                <div style={labelFieldPairStyle}>
                  <CardLabel style={boldLabelStyle}>{t("BPA_APPLICANT_ID_PROOF") || "ID Proof"}</CardLabel>
                  <div style={valueStyle}><DocumentLink fileStoreId={owner?.documentUploadedFiles} stateCode={stateCode} t={t} /></div>
                </div>
                <div style={labelFieldPairStyle}>
                  <CardLabel style={boldLabelStyle}>{t("BPA_PAN_DOCUMENT") || "PAN Document"}</CardLabel>
                  <div style={valueStyle}><DocumentLink fileStoreId={owner?.panDocumentUploadedFiles} stateCode={stateCode} t={t} /></div>
                </div>
                {renderLabel(t("BPA_PAN_NUMBER_LABEL"), owner?.panNumber)}
              </div>
            </Card>
          )})}
        </React.Fragment>
      )}

      

      {/* PROFESSIONAL DETAILS */}
      {formData?.applicationDetails?.professionalName && (
        <Card style={{ marginBottom: "1.5rem" }}>
          <div style={sectionStyle}>
            <div style={headerRow}>
              <CardSubHeader>{t("BPA_PROFESSIONAL_DETAILS")}</CardSubHeader>
            </div>
            {renderLabel(t("BPA_PROFESSIONAL_NAME_LABEL"), formData?.applicationDetails?.professionalName)}
            {renderLabel(t("BPA_PROFESSIONAL_EMAIL_LABEL"), formData?.applicationDetails?.professionalEmailId)}
            {renderLabel(t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL"), formData?.applicationDetails?.professionalRegId)}
            {renderLabel(t("BPA_PROFESSIONAL_MOBILE_NO_LABEL"), formData?.applicationDetails?.professionalMobileNumber)}
            {renderLabel(t("BPA_PROFESSIONAL_ADDRESS_LABEL"), formData?.applicationDetails?.professionalAddress)}
            {renderLabel(t("BPA_CERTIFICATE_EXPIRY_DATE"), convertDateToISO(formData?.applicationDetails?.professionalRegistrationValidity))}
            
            {/* Professional Photo */}
            {formData?.applicationDetails?.primaryOwnerPhoto && (
              <div style={labelFieldPairStyle}>
                <CardLabel style={boldLabelStyle}>{t("Photo") || "Photo"}</CardLabel>
                <div style={valueStyle}>
                  <DocumentLink fileStoreId={formData?.applicationDetails?.primaryOwnerPhoto} stateCode={stateCode} t={t} />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}


      {/* SITE DETAILS */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <CardSubHeader>{t("BPA_SITE_DETAILS")}</CardSubHeader>
          </div>
          {/* <CardLabel style={{...boldLabelStyle, paddingLeft: "18px", fontSize: "20px"}}>{t("BPA_CLU_DETAILS")}</CardLabel> */}
          {renderLabel(t("BPA_IS_CLU_REQUIRED_LABEL"), formData?.siteDetails?.isCluRequired?.code || formData?.siteDetails?.isCluRequired)}
          {(formData?.siteDetails?.isCluRequired?.code === "NO" || formData?.siteDetails?.isCluRequired === "NO") && (
            <React.Fragment>
              {renderLabel(t("BPA_CLU_TYPE_LABEL"), formData?.siteDetails?.cluType?.code || formData?.siteDetails?.cluType)}
              {(formData?.siteDetails?.cluType?.code === "ONLINE" || formData?.siteDetails?.cluType === "ONLINE") &&
                renderLabel(t("BPA_CLU_NUMBER_LABEL"), formData?.siteDetails?.cluNumber)}
              {(formData?.siteDetails?.cluType?.code === "OFFLINE" || formData?.siteDetails?.cluType === "OFFLINE") &&
                renderLabel(t("BPA_CLU_NUMBER_OFFLINE_LABEL"), formData?.siteDetails?.cluNumberOffline)}
              {renderLabel(t("BPA_CLU_APPROVAL_DATE_LABEL"), convertDateToISO(formData?.siteDetails?.cluApprovalDate))}
            </React.Fragment>
          )}
          {(formData?.siteDetails?.isCluRequired?.code === "YES" || formData?.siteDetails?.isCluRequired === "YES") && (
            <React.Fragment>
              {renderLabel(t("Application Applied Under"), formData?.siteDetails?.applicationAppliedUnder?.code || formData?.siteDetails?.applicationAppliedUnder)}              
            </React.Fragment>
          )}
          {renderLabel(t("Type Of Application"), formData?.siteDetails?.typeOfApplication?.name)}

          {/* <CardLabel style={{...boldLabelStyle, paddingLeft: "18px", fontSize: "20px"}}>{t("BPA_LOCATION_LABEL")}</CardLabel> */}
          {renderLabel(t("BPA_PROPOSED_SITE_ADDRESS"), formData?.siteDetails?.proposedSiteAddress)}
          {renderLabel(t("BPA_SITE_WARD_NO_LABEL"), formData?.siteDetails?.wardNo)}
          {renderLabel(t("BPA_KHASRA_NO_LABEL"), formData?.siteDetails?.khasraNo)}
          {renderLabel(t("Khatuni No."), formData?.siteDetails?.khanutiNo)}
          {renderLabel(t("BPA_HADBAST_NO_LABEL"), formData?.siteDetails?.hadbastNo)}
          {renderLabel(t("BPA_SITE_VILLAGE_NAME_LABEL"), formData?.siteDetails?.villageName)}
          {renderLabel(t("BPA_VASIKA_NUMBER_LABEL"), formData?.siteDetails?.vasikaNumber)}
          {renderLabel(t("BPA_VASIKA_DATE_LABEL"), convertDateToISO(formData?.siteDetails?.vasikaDate))}
          {renderLabel(t("BPA_ROAD_TYPE_LABEL"), formData?.siteDetails?.roadType?.name)}
          {renderLabel(t("BPA_NET_TOTAL_AREA_LABEL"), formData?.siteDetails?.areaLeftForRoadWidening)}
          {renderLabel(t("BPA_IS_AREA_UNDER_MASTER_PLAN_LABEL"), formData?.siteDetails?.isAreaUnderMasterPlan?.i18nKey)}
          {renderLabel(t("BPA_ZONE_LABEL"), formData?.siteDetails?.zone?.name)}  
          {renderLabel(t("BPA_ULB_NAME_LABEL"), formData?.siteDetails?.ulbName?.name)}
          {renderLabel(t("BPA_DISTRICT_LABEL"), formData?.siteDetails?.district?.name)}
          {/* {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL"), formData?.siteDetails?.buildingCategory?.name)} */}
          {renderLabel(t("BPA_ULB_TYPE_LABEL"), formData?.siteDetails?.ulbType)}
          {renderLabel(t("BPA_PLOT_NO_LABEL"), formData?.siteDetails?.plotNo)}                            
          

          {/* <CardLabel style={{...boldLabelStyle, paddingLeft: "18px", fontSize: "20px"}}>{t("BPA_AREA_DISTRIBUTION_LABEL")}</CardLabel> */}
          {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL"), formData?.siteDetails?.buildingCategory?.name)}
          {renderLabel(t("BPA_BUILDING_CATEGORY_LABEL_TYPE"), formData?.siteDetails?.residentialType?.name || formData?.siteDetails?.buildingCategory?.name)}
          {renderLabel(t("BPA_NET_TOTAL_AREA_LABEL"), formData?.siteDetails?.areaLeftForRoadWidening)}          
          {renderLabel(t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), formData?.siteDetails?.netPlotAreaAfterWidening)}
          {renderLabel(t("BPA_BALANCE_AREA_IN_SQ_M_LABEL"), parseFloat(formData?.siteDetails?.areaLeftForRoadWidening-formData?.siteDetails?.netPlotAreaAfterWidening))}
          {renderLabel(t("BPA_AREA_UNDER_EWS_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderEWS)}
          {renderLabel(t("BPA_AREA_UNDER_EWS_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderEWSInPct)}
          {renderLabel(t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL"), formData?.siteDetails?.netTotalArea)}
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
          
          {renderLabel(t("BPA_ROAD_WIDTH_AT_SITE_LABEL"), formData?.siteDetails?.roadWidthAtSite)}
          {renderLabel(t("BPA_BUILDING_STATUS_LABEL"), formData?.siteDetails?.buildingStatus?.name || formData?.siteDetails?.buildingStatus?.code)}
          {/* {renderLabel(t("BPA_IS_BASEMENT_AREA_PRESENT_LABEL"), formData?.siteDetails?.isBasementAreaAvailable?.code || formData?.siteDetails?.isBasementAreaAvailable)}

          {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" &&
            renderLabel(t("BPA_BASEMENT_AREA_LABEL"), formData?.siteDetails?.basementArea)}

          {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" &&
            formData?.siteDetails?.floorArea?.map((floor, index) => renderLabel(getFloorLabel(index), floor?.value))}

          {formData?.siteDetails?.buildingStatus?.code === "BUILTUP" &&
            renderLabel(t("BPA_TOTAL_FLOOR_AREA_LABEL"), formData?.siteDetails?.totalFloorArea)}

          {renderLabel(t("BPA_SCHEME_TYPE"), formData?.siteDetails?.schemeType?.name)}
          {renderLabel(t("Application Applied Under"), formData?.siteDetails?.applicationAppliedUnder?.code || formData?.siteDetails?.applicationAppliedUnder)}
          {renderLabel(t("BPA_TOTAL_AREA_UNDER_LAYOUT_IN_SQ_M_LABEL"), formData?.siteDetails?.totalAreaUnderLayout)}
          {renderLabel(t("BPA_AREA_UNDER_ROAD_WIDENING_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderRoadWidening)}
          {renderLabel(t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL"), formData?.siteDetails?.netSiteArea)} */}
          
          
          
          
                        
        </div>
      </Card>

      {/* SPECIFICATION DETAILS */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <CardSubHeader>{t("BPA_SPECIFICATION_DETAILS")}</CardSubHeader>
          </div>
          {renderLabel(t("BPA_PLOT_AREA_JAMA_BANDI_LABEL"), formData?.siteDetails?.specificationPlotArea)}
        </div>
      </Card>


      <Card>
        <CardSubHeader>{t("BPA_UPLOADED _SITE_PHOTOGRAPHS_LABEL")}</CardSubHeader>
        <StatusTable
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {sitePhotos?.length > 0 &&
            [...sitePhotos]
              .map((doc) => (
                <NocSitePhotographs
                  key={doc?.filestoreId || doc?.uuid}
                  filestoreId={doc?.filestoreId || doc?.uuid}
                  documentType={doc?.documentType}
                  coordinates={coordinates}
                />
              ))}
        </StatusTable>
      </Card>

      {/* DOCUMENTS UPLOADED */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <CardSubHeader>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
          </div>
          <div style={{ padding: "0 1.5rem" }}>
            {formData?.documents?.documents?.documents?.length > 0 && <LayoutDocumentTableView documents={formData?.documents?.documents?.documents?.filter((doc) => doc.documentType != "OWNER.SITEPHOTOGRAPHONE" && doc.documentType != "OWNER.SITEPHOTOGRAPHTWO")} />}
          </div>
        </div>
      </Card>

      {/* FEE DETAILS */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={sectionStyle}>
          <div style={headerRow}>
            <CardSubHeader>{t("BPA_FEE_DETAILS_LABEL")}</CardSubHeader>
          </div>
          <div style={{ padding: "0 1.5rem" }}>
            {formData && <LayoutFeeEstimationDetails formData={formData} feeType="PAY1" feeAdjustments={[]} setFeeAdjustments={() => {}} disable={true} />}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default LayoutSummary
