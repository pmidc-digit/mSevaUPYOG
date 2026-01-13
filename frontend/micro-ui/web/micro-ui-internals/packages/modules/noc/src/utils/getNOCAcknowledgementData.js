import React from "react";
import {pdfDownloadLink, pdfDocumentName} from "./index"
import {Loader} from "@mseva/digit-ui-react-components";

const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

const getFloorLabel = (index, t) => {
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

const getRegistrationDetails = (appData, t) => {
  let values = [
    {
      title: t("CS_APPLICATION_NUMBER"),
      value: appData?.applicationNo || "N/A",
    },
    {
      title: t("REGISTRATION_FILED_DATE"),
      value: Digit.DateUtils.ConvertTimestampToDate(appData?.auditDetails?.createdTime, "dd/MM/yyyy") || "NA"
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
      title: t("NOC_PROFESSIONAL_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalName || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_EMAIL_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalEmailId || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalRegId || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalRegIdValidity || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_MOBILE_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalMobileNumber || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_ADDRESS_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalAddress || "N/A",
    },
  ];

  return {
    title: t("NOC_PROFESSIONAL_DETAILS"),
    values: values,
  };
};

const getApplicantDetails = (appData, t) => {
  const owners = appData?.nocDetails?.additionalDetails?.applicationDetails?.owners ?? [];

  const ownerDetailsArray = owners.map((owner, index) => ({
    title: index === 0 ? "Primary Owner" : `Owner ${index + 1} Details`,
    values: [
      {
        title: t("NOC_FIRM_OWNER_NAME_LABEL"),
        value: owner?.ownerOrFirmName || "NA",
      },
      {
        title: t("NOC_APPLICANT_EMAIL_LABEL"),
        value: owner?.emailId || "NA",
      },
      {
        title: t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL"),
        value: owner?.fatherOrHusbandName || "NA",
      },
      {
        title: t("NOC_APPLICANT_MOBILE_NO_LABEL"),
        value: owner?.mobileNumber || "NA",
      },
      {
        title: t("NOC_APPLICANT_DOB_LABEL"),
        value: owner?.dateOfBirth
          ? new Date(owner.dateOfBirth).toLocaleDateString("en-GB")
          : "NA",
      },
      {
        title: t("NOC_APPLICANT_GENDER_LABEL"),
        value: owner?.gender?.code || "NA",
      },
      {
        title: t("NOC_APPLICANT_ADDRESS_LABEL"),
        value: owner?.address || "NA",
      },
      {
        title: t("NOC_APPLICANT_PROPERTY_ID_LABEL"),
        value: owner?.propertyId || "NA",
      },
    ],
  }));

  return ownerDetailsArray;
};

const getSiteDetails = (appData, t) => {
  let values = [
    {
      title: t("NOC_PLOT_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.plotNo || "N/A",
    },
    {
      title: t("NOC_PROPOSED_SITE_ADDRESS"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.proposedSiteAddress || "N/A",
    },
    {
      title: t("NOC_ULB_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.ulbName?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.ulbName || "N/A",
    },
    {
      title: t("NOC_ULB_TYPE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.ulbType || "N/A",
    },
    {
      title: t("NOC_KHASRA_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.khasraNo || "N/A",
    },
    {
      title: t("NOC_HADBAST_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.hadbastNo || "N/A",
    },
    {
      title: t("NOC_ROAD_TYPE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.roadType?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.roadType || "N/A",
    },
    {
      title: t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.areaLeftForRoadWidening || "N/A",
    },
    {
      title: t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.netPlotAreaAfterWidening || "N/A",
    },
    {
      title: t("NOC_NET_TOTAL_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.netTotalArea || "N/A",
    },
    {
      title: t("NOC_ROAD_WIDTH_AT_SITE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.roadWidthAtSite || "N/A",
    },
    {
      title: t("NOC_DISTRICT_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.district?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.district || "N/A",
    },
    {
      title: t("NOC_ZONE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.zone?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.zone || "N/A",
    },
    {
      title: t("NOC_SITE_WARD_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.wardNo || "N/A",
    },
    {
      title: t("NOC_SITE_VILLAGE_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.villageName || "N/A",
    },
    {
      title: t("NOC_SITE_COLONY_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.colonyName || "N/A",
    },
    {
      title: t("NOC_SITE_VASIKA_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.vasikaNumber || "N/A",
    },
    {
      title: t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.khewatAndKhatuniNo || "N/A",
    },
    {
      title: t("NOC_BUILDING_STATUS_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus || "N/A",
    },
  ];

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.isBasementAreaAvailable) {
    values.push({
      title: t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.isBasementAreaAvailable?.code ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.isBasementAreaAvailable || "N/A",
    });
  }

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.basementArea) {
    values.push({
      title: t("NOC_BASEMENT_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.basementArea || "N/A",
    });
  }

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus == "Built UP") {
    appData?.nocDetails?.additionalDetails?.siteDetails?.floorArea?.map((floor, index) =>
      values.push({
        title: getFloorLabel(index, t),
        value: floor?.value,
      })
    );
  }

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus == "Built Up") {
    values.push({
      title: t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.totalFloorArea || "N/A",
    });
  }

  return {
    title: t("NOC_SITE_DETAILS"),
    values: values,
  };
};

const getSpecificationDetails = (appData, t) => {
  let values = [
    {
      title: t("NOC_PLOT_AREA_JAMA_BANDI_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationPlotArea || "N/A",
    },
    {
      title: t("NOC_BUILDING_CATEGORY_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationBuildingCategory?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.specificationBuildingCategory  || "N/A",
    },
    {
      title: t("NOC_NOC_TYPE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationNocType?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.specificationNocType ||  "N/A",
    },
    {
      title: t("NOC_RESTRICTED_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationRestrictedArea?.code ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.specificationRestrictedArea || "N/A",
    },
    {
      title: t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationIsSiteUnderMasterPlan?.code ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.specificationIsSiteUnderMasterPlan || "N/A",
    },
  ];

  return {
    title: t("NOC_SPECIFICATION_DETAILS"),
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
              title: `${index + 1}. ${t(document?.documentType.replace(/\./g, "_")) || t("CS_NA")}`,              value: " ",
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

  const coords = appData?.nocDetails?.additionalDetails?.coordinates || {};

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


export const getNOCAcknowledgementData = async (applicationDetails, tenantInfo,ulbType, ulbName, t) => {
  const stateCode = Digit.ULBService.getStateId();
  const appData=applicationDetails || {};
  console.log("appData here in DownloadACK", appData);

  let detailsArr=[], imageURL="";
  const ownerFileStoreId= appData?.nocDetails?.additionalDetails?.ownerPhotos?.[0]?.filestoreId || "";

   const result = await Digit.UploadServices.Filefetch([ownerFileStoreId], stateCode);

   const fileData = result?.data?.fileStoreIds?.[0];
   imageURL = fileData?.url || "";
  
  if(appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalName)detailsArr.push(getProfessionalDetails(appData, t),)

  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: t("Noc Application"),
    // name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("LOCAL_GOVERNMENT_PUNJAB"),
    // heading: t("NOC_REGISTRATION_CERTIFICATE"),
    applicationNumber: appData?.applicationNo || "NA",
    details: [
        getRegistrationDetails(appData,t),
        ...detailsArr,
        ...getApplicantDetails(appData, t),
        getSiteDetails(appData, t), 
        getSpecificationDetails(appData, t),
        await getDocuments(appData,t),
        await getSitePhotographs(appData,t)
    ],
    imageURL,
    ulbType,
    ulbName
  };
};
