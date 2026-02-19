import React from "react";
import { Card, CardLabel, LabelFieldPair, CardSubHeader, StatusTable, Row } from "@mseva/digit-ui-react-components";
import { useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CLUImageView from "./CLUImgeView";
import CLUDocumentTableView from "./CLUDocumentTableView";
import CLUFeeEstimationDetails from "./CLUFeeEstimationDetails";
import CLUSitePhotographs from "./CLUSitePhotographs";

function CLUSummary({ currentStepData: formData, t }) {
  console.log("formData in Summary Page", formData);

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  let docs = formData?.documents?.documents?.documents;
  console.log("documents here in summary", docs);
  const sitePhotographs = formData?.documents?.documents?.documents?.filter(
    (doc) => doc?.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc?.documentType === "OWNER.SITEPHOTOGRAPHTWO"
  );
  const remainingDocs = formData?.documents?.documents?.documents?.filter(
    (doc) => !(doc?.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc?.documentType === "OWNER.SITEPHOTOGRAPHTWO")
  );

  return (
    <div className="employee-main-application-details">
      <CardSubHeader>{t("OWNER_OWNERPHOTO")}</CardSubHeader>
      <StatusTable>
        <CLUImageView
          ownerFileStoreId={ownerPhotos?.ownerPhotoList?.[0]?.filestoreId}
          ownerName={formData?.applicationDetails?.owners?.[0]?.ownerOrFirmName}
        />
      </StatusTable>

      {(formData?.applicationDetails?.owners ?? [])?.map((owner, index) => {
        return (
          <div>
            <CardSubHeader>{index === 0 ? t("BPA_PRIMARY_OWNER") : `Owner ${index + 1}`}</CardSubHeader>

            <StatusTable>
              {index === 0 && <Row label={t("NOC_OWNER_TYPE_LABEL")} text={owner?.ownerType?.code || owner?.ownerType || "N/A"} />}
              <Row label={t("BPA_FIRM_OWNER_NAME_LABEL")} text={owner?.ownerOrFirmName || "N/A"} />
              <Row label={t("BPA_APPLICANT_EMAIL_LABEL")} text={owner?.emailId || "N/A"} />
              <Row label={t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")} text={owner?.fatherOrHusbandName || "N/A"} />
              <Row label={t("BPA_APPLICANT_MOBILE_NO_LABEL")} text={owner?.mobileNumber || "N/A"} />
              <Row label={t("BPA_APPLICANT_DOB_LABEL")} text={formatDate(owner?.dateOfBirth) || "N/A"} />
              <Row label={t("BPA_APPLICANT_GENDER_LABEL")} text={owner?.gender?.code || "N/A"} />
              <Row label={t("BPA_APPLICANT_ADDRESS_LABEL")} text={owner?.address || "N/A"} />
              <Row label={t("BPA_OWNERSHIP_IN_PCT_LABEL")} text={owner?.ownershipInPct || "N/A"} />
            </StatusTable>
          </div>
        );
      })}

      {formData?.applicationDetails?.professionalName && (
        <React.Fragment>
          <CardSubHeader>{t("BPA_PROFESSIONAL_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row label={t("BPA_PROFESSIONAL_NAME_LABEL")} text={formData?.applicationDetails?.professionalName || "N/A"} />
            <Row label={t("BPA_PROFESSIONAL_EMAIL_LABEL")} text={formData?.applicationDetails?.professionalEmailId || "N/A"} />
            <Row label={t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL")} text={formData?.applicationDetails?.professionalRegId || "N/A"} />
            <Row
              label={t("BPA_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL")}
              text={formData?.applicationDetails?.professionalRegIdValidity || "N/A"}
            />
            <Row label={t("BPA_PROFESSIONAL_MOBILE_NO_LABEL")} text={formData?.applicationDetails?.professionalMobileNumber || "N/A"} />
            <Row label={t("BPA_PROFESSIONAL_ADDRESS_LABEL")} text={formData?.applicationDetails?.professionalAddress || "N/A"} />
          </StatusTable>
        </React.Fragment>
      )}

      <CardSubHeader>{t("BPA_LOCALITY_INFO_LABEL")}</CardSubHeader>
      <StatusTable>
        <Row label={t("BPA_AREA_TYPE_LABEL")} text={formData?.siteDetails?.localityAreaType?.name || "N/A"} />

        {formData?.siteDetails?.localityAreaType?.code === "SCHEME_AREA" && (
          <Row label={t("BPA_SCHEME_COLONY_TYPE_LABEL")} text={formData?.siteDetails?.localityColonyType?.name || "N/A"} />
        )}

        {formData?.siteDetails?.localityAreaType?.code === "SCHEME_AREA" && (
          <Row label={t("BPA_SCHEME_NAME_LABEL")} text={formData?.siteDetails?.localitySchemeName || "N/A"} />
        )}
      </StatusTable>

      <CardSubHeader>{t("BPA_SITE_DETAILS")}</CardSubHeader>
      <StatusTable>
        <Row label={t("BPA_PLOT_NO_LABEL")} text={formData?.siteDetails?.plotNo || "N/A"} />
        <Row label={t("BPA_KHEWAT_KHATUNI_NO_LABEL")} text={formData?.siteDetails?.khewatOrKhatuniNo || "N/A"} />
        <Row label={t("BPA_CORE_AREA_LABEL")} text={formData?.siteDetails?.coreArea?.code || "N/A"} />

        <Row label={t("BPA_PROPOSED_SITE_ADDRESS")} text={formData?.siteDetails?.proposedSiteAddress || "N/A"} />
        <Row label={t("BPA_ULB_NAME_LABEL")} text={formData?.siteDetails?.ulbName?.name || "N/A"} />
        <Row label={t("BPA_ULB_TYPE_LABEL")} text={formData?.siteDetails?.ulbType || "N/A"} />
        <Row label={t("BPA_DISTRICT_LABEL")} text={formData?.siteDetails?.district?.name || formData?.siteDetails?.district || "N/A"} />
        <Row label={t("BPA_ZONE_LABEL")} text={formData?.siteDetails?.zone?.name || "N/A"} />
        <Row label={t("BPA_KHASRA_NO_LABEL")} text={formData?.siteDetails?.khasraNo || "N/A"} />
        <Row label={t("BPA_HADBAST_NO_LABEL")} text={formData?.siteDetails?.hadbastNo || "N/A"} />
        <Row label={t("BPA_ROAD_TYPE_LABEL")} text={formData?.siteDetails?.roadType?.name || "N/A"} />
        <Row label={t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")} text={formData?.siteDetails?.areaLeftForRoadWidening || "N/A"} />
        <Row label={t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL")} text={formData?.siteDetails?.netPlotAreaAfterWidening || "N/A"} />
        <Row label={t("BPA_NET_TOTAL_AREA_LABEL")} text={formData?.siteDetails?.netTotalArea || "N/A"} />

        <Row label={t("BPA_ROAD_WIDTH_AT_SITE_LABEL")} text={formData?.siteDetails?.roadWidthAtSite || "N/A"} />

        <Row label={t("BPA_SITE_WARD_NO_LABEL")} text={formData?.siteDetails?.wardNo || "N/A"} />

        <Row label={t("BPA_SITE_VASIKA_NO_LABEL")} text={formData?.siteDetails?.vasikaNumber || "N/A"} />
        <Row label={t("BPA_SITE_VASIKA_DATE_LABEL")} text={formatDate(formData?.siteDetails?.vasikaDate) || "N/A"} />
        <Row label={t("BPA_SITE_VILLAGE_NAME_LABEL")} text={formData?.siteDetails?.villageName || "N/A"} />
        {/* <Row label={t("BPA_OWNERSHIP_IN_PCT_LABEL")} text={formData?.siteDetails?.ownershipInPct || "N/A"}/>  */}
        <Row label={t("BPA_PROPOSED_ROAD_WIDTH_AFTER_WIDENING_LABEL")} text={formData?.siteDetails?.proposedRoadWidthAfterWidening || "N/A"} />

        <Row label={t("BPA_CATEGORY_APPLIED_FOR_CLU_LABEL")} text={formData?.siteDetails?.appliedCluCategory?.name || "N/A"} />
        <Row label={t("BPA_PROPERTY_UID_LABEL")} text={formData?.siteDetails?.propertyUid || "N/A"} />
        <Row label={t("BPA_BUILDING_STATUS_LABEL")} text={formData?.siteDetails?.buildingStatus?.name || "N/A"} />
        <Row label={t("BPA_IS_ORIGINAL_CATEGORY_AGRICULTURE_LABEL")} text={formData?.siteDetails?.isOriginalCategoryAgriculture?.code || "N/A"} />
        <Row label={t("BPA_RESTRICTED_AREA_LABEL")} text={formData?.siteDetails?.restrictedArea?.code || "N/A"} />
        <Row label={t("BPA_IS_SITE_UNDER_MASTER_PLAN_LABEL")} text={formData?.siteDetails?.isSiteUnderMasterPlan?.code || "N/A"} />

        {/* <Row label={t("BPA_BUILDING_CATEGORY_LABEL")} text={formData?.siteDetails?.buildingCategory?.name || "N/A"}/> */}
      </StatusTable>

      <CardSubHeader>{t("BPA_SPECIFICATION_DETAILS")}</CardSubHeader>
      <StatusTable>
        <Row label={t("BPA_PLOT_AREA_JAMA_BANDI_LABEL")} text={formData?.siteDetails?.specificationPlotArea || "N/A"} />
      </StatusTable>

      {/* <Card>
      <CardSubHeader>{t("BPA_SITE_COORDINATES_LABEL")}</CardSubHeader>
      <StatusTable>
        <Row label={t("COMMON_LATITUDE1_LABEL")} text={coordinates?.Latitude1 || "N/A"}/>
        <Row label={t("COMMON_LONGITUDE1_LABEL")} text={coordinates?.Longitude1 || "N/A"}/>
        <Row label={t("COMMON_LATITUDE2_LABEL")} text={coordinates?.Latitude2 || "N/A"}/>
        <Row label={t("COMMON_LONGITUDE2_LABEL")} text={coordinates?.Longitude2 || "N/A"}/>
      </StatusTable>
      </Card> */}

      <CardSubHeader>{t("BPA_UPLOADED _SITE_PHOTOGRAPHS_LABEL")}</CardSubHeader>
      <StatusTable>{sitePhotographs?.length > 0 && <CLUSitePhotographs documents={sitePhotographs} coordinates={coordinates} />}</StatusTable>

      <CardSubHeader>{t("BPA_UPLOADED_OWNER_ID")}</CardSubHeader>
      <StatusTable>{ownerIds?.ownerIdList?.length > 0 && <CLUDocumentTableView documents={ownerIds?.ownerIdList} />}</StatusTable>

      <CardSubHeader>{t("BPA_TITILE_DOCUMENT_UPLOADED")}</CardSubHeader>
      <StatusTable>{remainingDocs?.length > 0 && <CLUDocumentTableView documents={remainingDocs} />}</StatusTable>

      <CardSubHeader>{t("BPA_FEE_DETAILS_LABEL")}</CardSubHeader>
      <StatusTable>{formData && <CLUFeeEstimationDetails formData={formData} feeType="PAY1" />}</StatusTable>
    </div>
  );
}

export default CLUSummary;
