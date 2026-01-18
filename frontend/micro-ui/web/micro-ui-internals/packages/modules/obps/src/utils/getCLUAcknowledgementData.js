import React from "react";
import { pdfDownloadLink, pdfDocumentName } from "./index";
import { Loader } from "@mseva/digit-ui-react-components";

const getRegistrationDetails = (appData, t) => {
  let values = [
    {
      title: t("CS_APPLICATION_NUMBER"),
      value: appData?.applicationNo || "N/A",
    },
    {
      title: t("REGISTRATION_FILED_DATE"),
      value: Digit.DateUtils.ConvertTimestampToDate(appData?.auditDetails?.createdTime, "dd/MM/yyyy") || "NA",
    },
  ];

  return {
    title: t("CS_APPLICATION_DETAILS"),
    values: values,
  };
};

const getProfessionalDetails = (appData, t) => {
  let values = [
    {
      title: t("BPA_PROFESSIONAL_NAME_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.applicationDetails?.professionalName || "N/A",
    },
    {
      title: t("BPA_PROFESSIONAL_EMAIL_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.applicationDetails?.professionalEmailId || "N/A",
    },
    {
      title: t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.applicationDetails?.professionalRegId || "N/A",
    },
    {
      title: t("BPA_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.applicationDetails?.professionalRegIdValidity || "N/A",
    },
    {
      title: t("BPA_PROFESSIONAL_MOBILE_NO_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.applicationDetails?.professionalMobileNumber || "N/A",
    },
    {
      title: t("BPA_PROFESSIONAL_ADDRESS_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.applicationDetails?.professionalAddress || "N/A",
    },
  ];

  return {
    title: t("BPA_PROFESSIONAL_DETAILS"),
    values: values,
  };
};

const getApplicantDetails = (appData, t) => {
  const owners = appData?.cluDetails?.additionalDetails?.applicationDetails?.owners ?? [];

  const ownerDetailsArray = owners.map((owner, index) => ({
    title: index === 0 ? t("BPA_PRIMARY_OWNER") : `Owner ${index + 1}`,
    values: [
      {
        title: t("BPA_FIRM_OWNER_NAME_LABEL"),
        value: owner?.ownerOrFirmName || "NA",
      },
      {
        title: t("BPA_APPLICANT_EMAIL_LABEL"),
        value: owner?.emailId || "NA",
      },
      {
        title: t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL"),
        value: owner?.fatherOrHusbandName || "NA",
      },
      {
        title: t("BPA_APPLICANT_MOBILE_NO_LABEL"),
        value: owner?.mobileNumber || "NA",
      },
      {
        title: t("BPA_APPLICANT_DOB_LABEL"),
        value: owner?.dateOfBirth
          ? new Date(owner.dateOfBirth).toLocaleDateString("en-GB")
          : "NA",
      },
      {
        title: t("BPA_APPLICANT_GENDER_LABEL"),
        value: owner?.gender?.code || "NA",
      },
      {
        title: t("BPA_APPLICANT_ADDRESS_LABEL"),
        value: owner?.address || "NA",
      },
    ],
  }));

  return ownerDetailsArray;
};



const getLocationInfo = (appData, t) => {
  let values = [
    {
      title: t("BPA_AREA_TYPE_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.localityAreaType?.name || "N/A",
    },
    {
      title: t("BPA_NOTICE_ISSUED_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.localityNoticeIssued?.code || "N/A",
    },
    {
      title: t("BPA_TRANSFERRED_SCHEME_TYPE_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.localityTransferredSchemeType?.name || "N/A",
    },
  ];

  if (appData?.cluDetails?.additionalDetails?.siteDetails?.localityAreaType?.code == "SCHEME_AREA") {
    values.push({
      title: t("BPA_SCHEME_NAME_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.localitySchemeName || "N/A",
    });
  }

  if (appData?.cluDetails?.additionalDetails?.siteDetails?.localityAreaType?.code == "APPROVED_COLONY") {
    values.push({
      title: t("BPA_APPROVED_COLONY_NAME_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.localityApprovedColonyName || "N/A",
    });
  }

  if (appData?.cluDetails?.additionalDetails?.siteDetails?.localityAreaType?.code == "NON_SCHEME") {
    values.push({
      title: t("BPA_NON_SCHEME_TYPE_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.localityNonSchemeType?.name || "N/A",
    });
  }

  if (appData?.cluDetails?.additionalDetails?.siteDetails?.localityNoticeIssued?.code == "YES") {
    values.push({
      title: t("BPA_NOTICE_NUMBER_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.localityNoticeNumber || "N/A",
    });
  }

  if (appData?.cluDetails?.additionalDetails?.siteDetails?.localityAreaType?.code == "SCHEME_AREA") {
    values.push({
      title: t("BPA_SCHEME_COLONY_TYPE_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.localityColonyType?.name || "N/A",
    });
  }

  return {
    title: t("BPA_LOCALITY_INFO_LABEL"),
    values: values,
  };
};

const getSiteDetails = (appData, t) => {
  let values = [
    {
      title: t("BPA_PLOT_NO_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.plotNo || "N/A",
    },
    {
      title: t("BPA_PLOT_AREA_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.plotArea || "N/A",
    },
    {
      title: t("BPA_KHEWAT_KHATUNI_NO_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.khewatOrKhatuniNo || "N/A",
    },
    {
      title: t("BPA_CORE_AREA_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.coreArea?.code || "N/A",
    },
    {
      title: t("BPA_PROPOSED_SITE_ADDRESS"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.proposedSiteAddress || "N/A",
    },
    {
      title: t("BPA_ULB_NAME_LABEL"),
      value:
        appData?.cluDetails?.additionalDetails?.siteDetails?.ulbName?.name || appData?.cluDetails?.additionalDetails?.siteDetails?.ulbName || "N/A",
    },
    {
      title: t("BPA_ULB_TYPE_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.ulbType || "N/A",
    },
    {
      title: t("BPA_KHASRA_NO_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.khasraNo || "N/A",
    },
    {
      title: t("BPA_HADBAST_NO_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.hadbastNo || "N/A",
    },
    {
      title: t("BPA_ROAD_TYPE_LABEL"),
      value:
        appData?.cluDetails?.additionalDetails?.siteDetails?.roadType?.name || appData?.cluDetails?.additionalDetails?.siteDetails?.roadType || "N/A",
    },
    {
      title: t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.areaLeftForRoadWidening || "N/A",
    },
    {
      title: t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.netPlotAreaAfterWidening || "N/A",
    },
    {
      title: t("BPA_NET_TOTAL_AREA_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.netTotalArea || "N/A",
    },
    {
      title: t("BPA_ROAD_WIDTH_AT_SITE_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.roadWidthAtSite || "N/A",
    },
    {
      title: t("BPA_SITE_WARD_NO_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.wardNo || "N/A",
    },
    {
      title: t("BPA_DISTRICT_LABEL"),
      value:
        appData?.cluDetails?.additionalDetails?.siteDetails?.district?.name || appData?.cluDetails?.additionalDetails?.siteDetails?.district || "N/A",
    },
    {
      title: t("BPA_ZONE_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.zone?.name || appData?.cluDetails?.additionalDetails?.siteDetails?.zone || "N/A",
    },
    {
      title: t("BPA_SITE_VASIKA_NO_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.vasikaNumber || "N/A",
    },
    {
      title: t("NOC_SITE_VILLAGE_NAME_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.villageName || "N/A",
    },
    {
      title: t("BPA_OWNERSHIP_IN_PCT_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.ownershipInPct || "N/A",
    },

    {
      title: t("BPA_CATEGORY_APPLIED_FOR_CLU_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.appliedCluCategory?.name || "N/A",
    },
    {
      title: t("BPA_BUILDING_STATUS_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.buildingStatus?.name || "N/A",
    },
    {
      title: t("BPA_IS_ORIGINAL_CATEGORY_AGRICULTURE_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.isOriginalCategoryAgriculture?.code || "N/A",
    },
    {
      title: t("BPA_RESTRICTED_AREA_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.restrictedArea?.code || "N/A",
    },
    {
      title: t("BPA_IS_SITE_UNDER_MASTER_PLAN_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.isSiteUnderMasterPlan?.code || "N/A",
    },
    // {
    //   title: t("BPA_BUILDING_CATEGORY_LABEL"),
    //   value: appData?.cluDetails?.additionalDetails?.siteDetails?.buildingCategory?.name || "N/A",
    // },
  ];
  return {
    title: t("BPA_SITE_DETAILS"),
    values: values,
  };
};

const getSpecificationDetails = (appData, t) => {
  let values = [
    {
      title: t("BPA_PLOT_AREA_JAMA_BANDI_LABEL"),
      value: appData?.cluDetails?.additionalDetails?.siteDetails?.specificationPlotArea || "N/A",
    },
  ];

  return {
    title: t("BPA_SPECIFICATION_DETAILS"),
    values: values,
  };
};



const getDocuments = async (appData, t) => {
  const filteredDocs = appData?.documents?.filter(
    (doc) => doc?.documentType !== "OWNER.SITEPHOTOGRAPHONE" && doc?.documentType !== "OWNER.SITEPHOTOGRAPHTWO"
  );

  const filesArray = filteredDocs?.map((value) => value?.uuid);

  const res = filesArray?.length > 0 && (await Digit.UploadServices.Filefetch(filesArray, Digit.ULBService.getStateId()));

  console.log("res here==>", res);

  return {
    title: t("BPA_TITILE_DOCUMENT_UPLOADED"),
    values:
      filteredDocs?.length > 0
        ? filteredDocs.map((document, index) => {
            const documentLink = pdfDownloadLink(res?.data, document?.uuid);
            return {
              title: t(document?.documentType.replace(/\./g, "_")) || t("CS_NA"),
              value: " ",
              link: documentLink || "",
            };
          })
        : [
            {
              title: t("PT_NO_DOCUMENTS"),
              value: "NA",
            },
          ],
  };
};

const getSitePhotographs = async (appData, t) => {
  const sitePhotoDocs = appData?.documents?.filter(
    (doc) =>
      doc.documentType === "OWNER.SITEPHOTOGRAPHONE" ||
      doc.documentType === "OWNER.SITEPHOTOGRAPHTWO"
  );

  const fileStoreIds = sitePhotoDocs?.map((doc) => doc?.uuid);

  const res =
    fileStoreIds?.length > 0 &&
    (await Digit.UploadServices.Filefetch(
      fileStoreIds,
      Digit.ULBService.getStateId()
    ));

  const coords = appData?.cluDetails?.additionalDetails?.coordinates || {};

  const values =
    sitePhotoDocs?.length > 0
      ? sitePhotoDocs.map((doc) => {
          const documentLink = pdfDownloadLink(res?.data, doc?.uuid);

          // Decide which lat/long to use based on type
          let lat = "N/A";
          let long = "N/A";
          if (doc.documentType === "OWNER.SITEPHOTOGRAPHONE") {
            lat = coords?.Latitude1 || "N/A";
            long = coords?.Longitude1 || "N/A";
          }
          if (doc.documentType === "OWNER.SITEPHOTOGRAPHTWO") {
            lat = coords?.Latitude2 || "N/A";
            long = coords?.Longitude2 || "N/A";
          }

          return {
            // Title includes photo label + coordinates
            title:
              (t(doc.documentType.replace(/\./g, "_")) || t("CS_NA")) +
              ` (Lat: ${lat}, Long: ${long})`,
            value: " ",
            link: documentLink || ""
          };
        })
      : [{ title: t("CS_NO_DOCUMENTS_UPLOADED"), value: "NA" }];

  return {
    title: t("BPA_LOC_SITE_PHOTOGRAPH_PREVIEW"),
    isAttachments: true,
    values
  };
};


export const getCLUAcknowledgementData = async (applicationDetails, tenantInfo, ulbType, ulbName, t) => {
  const stateCode = Digit.ULBService.getStateId();
  const appData = applicationDetails || {};
  console.log("appData here in DownloadACK", appData);

  let detailsArr = [], imageURL = "";

  const ownerFileStoreId= appData?.cluDetails?.additionalDetails?.ownerPhotos?.[0]?.filestoreId || "";

  const result = await Digit.UploadServices.Filefetch([ownerFileStoreId], stateCode);

  const fileData = result?.data?.fileStoreIds?.[0];
  imageURL = fileData?.url || "";

  if (appData?.cluDetails?.additionalDetails?.applicationDetails?.professionalName) detailsArr.push(getProfessionalDetails(appData, t));

  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: t("CLU_ACKNOWLEDGEMENT_TITLE"),
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("LOCAL_GOVERNMENT_PUNJAB"),
    applicationNumber: appData?.applicationNo || "NA",
    details: [
      getRegistrationDetails(appData, t),
      ...detailsArr,
      ...getApplicantDetails(appData, t),
      getLocationInfo(appData, t),
      getSiteDetails(appData, t),
      getSpecificationDetails(appData, t),
      await getDocuments(appData, t),
      await getSitePhotographs(appData, t),
    ],
    imageURL,
    ulbType,
    ulbName
  };
};
