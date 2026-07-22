
import React, { useState, useEffect } from "react";
import { Card, CardLabel, LabelFieldPair, Table, LinkButton, ImageViewer, CardSubHeader, StatusTable, Row } from "@mseva/digit-ui-react-components";
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
import { formatDate } from "../utils";

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
  let owners = [];

  if (!isEditMode && primaryOwner) {
    owners = [primaryOwner, ...newlyAddedApplicants];
  } else {
    owners = ownersFromApi.length > 0 ? ownersFromApi : newlyAddedApplicants;
  }

  const activeApplicants = owners?.slice(1)?.filter(a => a?.status);

  const layoutDocuments = layoutData?.documents || [];

  // Documents from fresh application flow (Redux state)
  const photoUploadedFiles = formData?.photoUploadedFiles || {};
  const documentUploadedFiles = formData?.documentUploadedFiles || {};
  const panDocumentUploadedFiles = formData?.panDocumentUploadedFiles || {};

  // Helper function to find document by type and owner index
  const findOwnerDocument = (ownerIndex, docType) => {
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

  const renderRow = (label, value) => {
    if (!value || value === "NA" || value === "" || value === null || value === undefined || value === "0.00") {
      return null;
    }

    return <Row label={label} text={typeof value === "string" ? t(value) : value} />;
  };

  const docs = formData?.documents?.documents?.documents;

  const sitePhotos = docs?.filter(
    (doc) => doc.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc.documentType === "OWNER.SITEPHOTOGRAPHTWO"
  )?.sort((a, b) => a?.order - b?.order);

  return (
    <div className="employee-main-application-details">
      <style>{` .data-table .row {border: 2px solid lightgrey;}`}</style>

      <StatusTable style={{ border: "none" }}>
        <Card>
          <CardSubHeader>{t("OWNER_OWNERPHOTO") || "Owner Photo"}</CardSubHeader>
          <CustomOwnerImage
            ownerFileStoreId={findOwnerDocument(0, "OWNERPHOTO")}
            ownerName={owners[0]?.name}
          />
        </Card>
      </StatusTable>

      {/* OWNERS DETAILS AND DOCUMENTS */}
      {owners && owners.length > 0 && (
        <React.Fragment>
          {/* PRIMARY OWNER */}
          <Card>
            <CardSubHeader>{t("Primary Owner") || "Primary Owner"}</CardSubHeader>
            <StatusTable>
              {renderRow(owners[0]?.aplicantType?.code === "FIRM" ? t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL") : t("APPLICANT_NAME"), owners[0]?.name)}
              {renderRow(t("CLU_OWNER_TYPE_LABEL"), owners[0]?.aplicantType?.name || "")}
              {owners[0]?.aplicantType?.code === "FIRM" && renderRow(t("NEW_LAYOUT_FIRM_NAME_LABEL"), owners[0]?.authorisedPerson || "N/A")}
              {renderRow(t("BPA_APPLICANT_MOBILE_NO_LABEL"), owners[0]?.mobileNumber)}
              {renderRow(t("BPA_APPLICANT_EMAIL_LABEL"), owners[0]?.emailId)}
              {renderRow(t("BPA_APPLICANT_GENDER_LABEL"), owners[0]?.gender?.code || owners[0]?.gender?.value || owners[0]?.gender)}
              {renderRow(t("BPA_APPLICANT_DOB_LABEL"), formatDate(owners[0]?.dob))}
              {renderRow(t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), owners[0]?.fatherOrHusbandName)}
              {renderRow(t("BPA_APPLICANT_ADDRESS_LABEL"), owners[0]?.permanentAddress)}

              {/* Documents */}
              <Row label={t("BPA_APPLICANT_PASSPORT_PHOTO") || "Photo"} text={<DocumentLink fileStoreId={findOwnerDocument(0, "OWNERPHOTO")} stateCode={stateCode} t={t} />} />
              <Row label={t("BPA_APPLICANT_ID_PROOF") || "ID Proof"} text={<DocumentLink fileStoreId={findOwnerDocument(0, "OWNERVALIDID")} stateCode={stateCode} t={t} />} />
              <Row label={t("BPA_PAN_DOCUMENT") || "PAN Document"} text={<DocumentLink fileStoreId={findOwnerDocument(0, "PANDOCUMENT")} stateCode={stateCode} t={t} />} />
              {renderRow(t("BPA_PAN_NUMBER_LABEL"), formData?.applicationDetails?.panNumber)}
            </StatusTable>
          </Card>

          {/* ADDITIONAL OWNERS */}
          {owners.length > 1 && owners.slice(1).map((owner, index) => {
            if (!owner?.status) return null;
            const visibleIndex = activeApplicants.findIndex(a => a === owner);

            return (
              <Card key={index + 1}>
                <CardSubHeader>{`${t("Owner") || "Owner"} ${visibleIndex + 2}`}</CardSubHeader>
                <StatusTable>
                  {renderRow(t("BPA_FIRM_OWNER_NAME_LABEL"), owner?.name)}
                  {renderRow(t("BPA_APPLICANT_MOBILE_NO_LABEL"), owner?.mobileNumber)}
                  {renderRow(t("BPA_APPLICANT_EMAIL_LABEL"), owner?.emailId)}
                  {renderRow(t("BPA_APPLICANT_GENDER_LABEL"), owner?.gender?.code || owner?.gender?.value || owner?.gender)}
                  {renderRow(t("BPA_APPLICANT_DOB_LABEL"), formatDate(owner?.dob))}
                  {renderRow(t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL"), owner?.fatherOrHusbandName)}
                  {renderRow(t("BPA_APPLICANT_ADDRESS_LABEL"), owner?.permanentAddress || owner?.address)}

                  {/* Documents */}
                  <Row label={t("BPA_APPLICANT_PASSPORT_PHOTO") || "Photo"} text={<DocumentLink fileStoreId={owner?.photoUploadedFiles} stateCode={stateCode} t={t} />} />
                  <Row label={t("BPA_APPLICANT_ID_PROOF") || "ID Proof"} text={<DocumentLink fileStoreId={owner?.documentUploadedFiles} stateCode={stateCode} t={t} />} />
                  <Row label={t("BPA_PAN_DOCUMENT") || "PAN Document"} text={<DocumentLink fileStoreId={owner?.panDocumentUploadedFiles} stateCode={stateCode} t={t} />} />
                  {renderRow(t("BPA_PAN_NUMBER_LABEL"), owner?.panNumber)}
                </StatusTable>
              </Card>
            );
          })}
        </React.Fragment>
      )}

      {/* PROFESSIONAL DETAILS */}
      {formData?.applicationDetails?.professionalName && (
        <Card>
          <CardSubHeader>{t("BPA_PROFESSIONAL_DETAILS")}</CardSubHeader>
          <StatusTable>
            {renderRow(t("BPA_PROFESSIONAL_NAME_LABEL"), formData?.applicationDetails?.professionalName)}
            {renderRow(t("BPA_PROFESSIONAL_EMAIL_LABEL"), formData?.applicationDetails?.professionalEmailId)}
            {renderRow(t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL"), formData?.applicationDetails?.professionalRegId)}
            {renderRow(t("BPA_PROFESSIONAL_MOBILE_NO_LABEL"), formData?.applicationDetails?.professionalMobileNumber)}
            {renderRow(t("BPA_PROFESSIONAL_ADDRESS_LABEL"), formData?.applicationDetails?.professionalAddress)}
            {renderRow(t("BPA_CERTIFICATE_EXPIRY_DATE"), formatDate(formData?.applicationDetails?.professionalRegistrationValidity))}
          </StatusTable>
        </Card>
      )}

      {/* SITE DETAILS */}
      <Card>
        <CardSubHeader>{t("BPA_SITE_DETAILS")}</CardSubHeader>
        <StatusTable>
          {renderRow(t("BPA_IS_CLU_REQUIRED_LABEL"), formData?.siteDetails?.isCluRequired?.code || formData?.siteDetails?.isCluRequired)}
          {(formData?.siteDetails?.isCluRequired?.code === "NO" || formData?.siteDetails?.isCluRequired === "NO") && (
            <React.Fragment>
              {renderRow(t("BPA_CLU_TYPE_LABEL"), formData?.siteDetails?.cluType?.code || formData?.siteDetails?.cluType)}
              {(formData?.siteDetails?.cluType?.code === "ONLINE" || formData?.siteDetails?.cluType === "ONLINE") &&
                renderRow(t("BPA_CLU_NUMBER_LABEL"), formData?.siteDetails?.cluNumber)}
              {(formData?.siteDetails?.cluType?.code === "OFFLINE" || formData?.siteDetails?.cluType === "OFFLINE") &&
                renderRow(t("BPA_CLU_NUMBER_OFFLINE_LABEL"), formData?.siteDetails?.cluNumberOffline)}
              {renderRow(t("BPA_CLU_APPROVAL_DATE_LABEL"), formatDate(formData?.siteDetails?.cluApprovalDate))}
            </React.Fragment>
          )}
          {(formData?.siteDetails?.isCluRequired?.code === "YES" || formData?.siteDetails?.isCluRequired === "YES") && (
            <React.Fragment>
              {renderRow(t("Application Applied Under"), formData?.siteDetails?.applicationAppliedUnder?.code || formData?.siteDetails?.applicationAppliedUnder)}
            </React.Fragment>
          )}
          {renderRow(t("Type Of Application"), formData?.siteDetails?.typeOfApplication?.name)}

          {renderRow(t("BPA_PROPOSED_SITE_ADDRESS"), formData?.siteDetails?.proposedSiteAddress)}
          {renderRow(t("BPA_SITE_WARD_NO_LABEL"), formData?.siteDetails?.wardNo)}
          {renderRow(t("BPA_KHASRA_NO_LABEL"), formData?.siteDetails?.khasraNo)}
          {renderRow(t("Khatuni No."), formData?.siteDetails?.khanutiNo)}
          {renderRow(t("BPA_HADBAST_NO_LABEL"), formData?.siteDetails?.hadbastNo)}
          {renderRow(t("BPA_SITE_VILLAGE_NAME_LABEL"), formData?.siteDetails?.villageName)}
          {renderRow(t("BPA_VASIKA_NUMBER_LABEL"), formData?.siteDetails?.vasikaNumber)}
          {renderRow(t("BPA_VASIKA_DATE_LABEL"), formatDate(formData?.siteDetails?.vasikaDate))}
          {renderRow(t("BPA_ROAD_TYPE_LABEL"), formData?.siteDetails?.roadType?.name)}
          {renderRow(t("BPA_NET_TOTAL_AREA_LABEL"), formData?.siteDetails?.areaLeftForRoadWidening)}
          {renderRow(t("BPA_IS_AREA_UNDER_MASTER_PLAN_LABEL"), formData?.siteDetails?.isAreaUnderMasterPlan?.i18nKey)}
          {renderRow(t("BPA_ZONE_LABEL"), formData?.siteDetails?.zone?.name)}
          {renderRow(t("BPA_ULB_NAME_LABEL"), formData?.siteDetails?.ulbName?.name)}
          {renderRow(t("BPA_DISTRICT_LABEL"), formData?.siteDetails?.district?.name)}
          {renderRow(t("BPA_ULB_TYPE_LABEL"), formData?.siteDetails?.ulbType)}
          {renderRow(t("BPA_PLOT_NO_LABEL"), formData?.siteDetails?.plotNo)}

          {renderRow(t("BPA_BUILDING_CATEGORY_LABEL"), formData?.siteDetails?.buildingCategory?.name)}
          {renderRow(t("BPA_BUILDING_CATEGORY_LABEL_TYPE"), formData?.siteDetails?.residentialType?.name || formData?.siteDetails?.buildingCategory?.name)}
          {renderRow(t("BPA_NET_TOTAL_AREA_LABEL"), formData?.siteDetails?.areaLeftForRoadWidening)}
          {renderRow(t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), formData?.siteDetails?.netPlotAreaAfterWidening)}
          {renderRow(t("BPA_BALANCE_AREA_IN_SQ_M_LABEL"), parseFloat(formData?.siteDetails?.areaLeftForRoadWidening - formData?.siteDetails?.netPlotAreaAfterWidening))}
          {renderRow(t("BPA_AREA_UNDER_EWS_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderEWS)}
          {renderRow(t("BPA_AREA_UNDER_EWS_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderEWSInPct)}
          {renderRow(t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL"), formData?.siteDetails?.netTotalArea)}
          {renderRow(t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderResidentialUseInSqM)}
          {renderRow(t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderResidentialUseInPct)}
          {renderRow(t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderCommercialUseInSqM)}
          {renderRow(t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderCommercialUseInPct)}
          {formData?.siteDetails?.buildingCategory?.name?.toLowerCase().includes("industrial") ? (
            <React.Fragment>
              {renderRow(t("BPA_AREA_UNDER_INDUSTRIAL_USE_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderIndustrialUseInSqM)}
              {renderRow(t("BPA_AREA_UNDER_INDUSTRIAL_USE_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderIndustrialUseInPct)}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {renderRow(t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderInstutionalUseInSqM)}
              {renderRow(t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderInstutionalUseInPct)}
            </React.Fragment>
          )}
          {renderRow(t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderCommunityCenterInSqM)}
          {renderRow(t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderCommunityCenterInPct)}
          {renderRow(t("BPA_AREA_UNDER_PARK_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderParkInSqM)}
          {renderRow(t("BPA_AREA_UNDER_PARK_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderParkInPct)}
          {renderRow(t("BPA_AREA_UNDER_ROAD_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderRoadInSqM)}
          {renderRow(t("BPA_AREA_UNDER_ROAD_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderRoadInPct)}
          {renderRow(t("BPA_AREA_UNDER_PARKING_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderParkingInSqM)}
          {renderRow(t("BPA_AREA_UNDER_PARKING_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderParkingInPct)}
          {renderRow(t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_SQ_M_LABEL"), formData?.siteDetails?.areaUnderOtherAmenitiesInSqM)}
          {renderRow(t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_PCT_LABEL"), formData?.siteDetails?.areaUnderOtherAmenitiesInPct)}

          {renderRow(t("BPA_ROAD_WIDTH_AT_SITE_LABEL"), formData?.siteDetails?.roadWidthAtSite)}
          {renderRow(t("BPA_BUILDING_STATUS_LABEL"), formData?.siteDetails?.buildingStatus?.name || formData?.siteDetails?.buildingStatus?.code)}
        </StatusTable>
      </Card>

      {/* SPECIFICATION DETAILS */}
      <Card>
        <CardSubHeader>{t("BPA_SPECIFICATION_DETAILS")}</CardSubHeader>
        <StatusTable>
          {renderRow(t("BPA_PLOT_AREA_JAMA_BANDI_LABEL"), formData?.siteDetails?.specificationPlotArea)}
        </StatusTable>
      </Card>

      {/* UPLOADED SITE PHOTOGRAPHS */}
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
            [...sitePhotos].map((doc) => (
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
      <Card>
        <CardSubHeader>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
        <div style={{ padding: "0 0.5rem" }}>
          {formData?.documents?.documents?.documents?.length > 0 && (
            <LayoutDocumentTableView documents={formData?.documents?.documents?.documents?.filter((doc) => doc.documentType != "OWNER.SITEPHOTOGRAPHONE" && doc.documentType != "OWNER.SITEPHOTOGRAPHTWO")} />
          )}
        </div>
      </Card>

      {/* FEE DETAILS */}
      <Card>
        <CardSubHeader>{t("BPA_FEE_DETAILS_LABEL")}</CardSubHeader>
        <div style={{ padding: "0 0.5rem" }}>
          {formData && <LayoutFeeEstimationDetails formData={formData} feeType="PAY1" feeAdjustments={[]} setFeeAdjustments={() => { }} disable={true} />}
        </div>
      </Card>
    </div>
  );
}

export default LayoutSummary;
