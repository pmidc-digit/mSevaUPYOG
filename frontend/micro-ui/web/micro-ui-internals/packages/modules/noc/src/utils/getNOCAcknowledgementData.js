import React from "react";
import {pdfDownloadLink, pdfDocumentName} from "./index"
import {Loader} from "@mseva/digit-ui-react-components";
import EXIF from "exif-js";

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
      owner?.ownerType?.code && { 
        title: t("NOC_OWNER_TYPE_LABEL"), 
        value: owner?.ownerType?.code 
      },
      owner?.firmName && { 
        title: t("NOC_FIRM_NAME"), 
        value: owner?.firmName 
      },
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
        value: owner?.dateOfBirth ? new Date(owner.dateOfBirth).toLocaleDateString("en-GB") : "NA",
      },
      {
        title: t("NOC_APPLICANT_GENDER_LABEL"),
        value: owner?.gender?.code || "NA",
      },
      {
        title: t("NOC_APPLICANT_ADDRESS_LABEL"),
        value: owner?.address || "NA",
      },
      owner?.propertyId && { 
        title: t("NOC_APPLICANT_PROPERTY_ID_LABEL"), 
        value: owner.propertyId 
      }
    ].filter(Boolean),
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
      title: t("NOC_VASIKA_DATE"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.vasikaDate || "N/A",
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

const getInspectionDetails = (appData, t) => {
  const inspectionData = appData?.nocDetails?.additionalDetails?.fieldinspection_pending?.[0] || {};
  // Collect all remark fields dynamically
  const remarksKeys = Object.keys(inspectionData).filter(key => key.startsWith("Remarks_"));

  // Map remarks to questions
  const remarksValues = remarksKeys.map((key, index) => {
    const question = inspectionData?.questionList?.[index]?.question || key; // fallback to key if no question
    return {
      title: `${index + 1} ${t(question)}`,                 // Label from questionList (translated)
      value: inspectionData[key] || "N/A" // Value is the remark text
    };
  });

  return {
    title: t("BPA_FI_REPORT"),
    values: remarksValues.length > 0 ? remarksValues : [{ title: t("No Remarks"), value: "NA" }]
  };
};



async function getExifDataFromUrl (fileUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      EXIF.getData(img, function () {
        resolve(EXIF.getAllTags(this));
      });
    };
    img.onerror = (err) => reject(err);
    img.src = fileUrl;
  });
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
              link: documentLink || ""
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


const getSitePhotographs = async (appData, t, stateCode) => {
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

  let values = [{ title: t("CS_NO_DOCUMENTS_UPLOADED"), value: "NA" }];

  if (sitePhotoDocs?.length > 0) {
    values = await Promise.all(
      sitePhotoDocs.map(async (doc) => {
        const documentLink = pdfDownloadLink(res?.data, doc?.uuid);
        const exiflink = `${window.origin}/filestore/v1/files/id?fileStoreId=${doc?.documentAttachment}&tenantId=${stateCode}`;

        // Use your exif function here
        const exifData = await getExifDataFromUrl(exiflink);
        console.log("exifData in sitephotos", exifData);
        if ([3, 6, 8].includes(exifData?.Orientation)) {
           exifData.Orientation = 1;  
        }
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
          title:
            (t(doc.documentType.replace(/\./g, "_")) || t("CS_NA")) +
            ` (Lat: ${lat}, Long: ${long})`,
          value: " ",
          link: documentLink || "",
          exiflink: exiflink || "",
          orientation: exifData?.Orientation || 1
        };
      })
    );
  }

  return {
    title: t("BPA_LOC_SITE_PHOTOGRAPH_PREVIEW"),
    isAttachments: true,
    values
  };
};

const getChecklistDetails = (appData, checklistData, t) => {
  const checkList = checklistData?.checkList || [];
  const documents = appData?.documents || [];

  let values = [];

  if (checkList?.length > 0) {
    values = checkList?.map((item, index) => {
      const matchedDoc = documents?.find(
        (doc) => doc?.uuid === item?.documentuid
      );
      const docName = matchedDoc
        ? t(matchedDoc?.documentType?.replace(/\./g, "_")) || matchedDoc?.documentType
        : item?.documentuid; 

      return {
        title: `${index + 1}. ${docName}`,
        value: item?.remarks || "N/A"
      };
    });
  } else {
    values = [
      {
        title: t("NOC_NO_CHECKLIST_ITEMS"),
        value: "NA"
      }
    ];
  }

  return {
    title: t("Document Checklist"),
    values
  };
};


const getJESiteImages = async (appData, t, stateCode) => {
  const siteImages = appData?.nocDetails?.additionalDetails?.siteImages || [];

  const fileStoreIds = siteImages?.map((img) => img?.filestoreId);

  const res =
    fileStoreIds?.length > 0 &&
    (await Digit.UploadServices.Filefetch(
      fileStoreIds,
      Digit.ULBService.getStateId()
    ));

  let values = [{ title: t("CS_NO_DOCUMENTS_UPLOADED"), value: "NA" }];

  if (siteImages?.length > 0) {
    values = await Promise.all(
      siteImages.map(async (img) => {
        const documentLink = pdfDownloadLink(res?.data, img?.filestoreId);
        const exiflink = `${window.origin}/filestore/v1/files/id?fileStoreId=${img?.filestoreId}&tenantId=${stateCode}`;

        // Use your exif function here
        const exifData = await getExifDataFromUrl(exiflink);
        console.log("exifData in siteImages", exifData);
        if ([3, 6, 8].includes(exifData?.Orientation)) {
          exifData.Orientation = 1;
        }

        // Use lat/long directly from siteImages
        const lat = img?.latitude || "N/A";
        const long = img?.longitude || "N/A";
        const timestamp = img?.timestamp || "N/A";

        return {
          title:
            (t(img?.documentType?.replace(/\./g, "_")) || t("CS_NA")) +
            ` (Lat: ${lat}, Long: ${long}, Time: ${timestamp})`,
          value: " ",
          link: documentLink || "",
          exiflink: exiflink || "",
          orientation: exifData?.Orientation || 1
        };
      })
    );
  }

  return {
    title: t("SITE_INPECTION_IMAGES"),
    isAttachments: true,
    values
  };
};

const getLatestCalculationDetails = (appData, t) => {
  // Find the latest calculation
  const latestCalc = appData?.nocDetails?.additionalDetails?.calculations?.find(
    (calc) => calc.isLatest
  );

  if (!latestCalc) {
    return {
      title: t("NOC_FEE_DETAILS_LABEL"),
      values: [{ title: t("NOC_NO_CALCULATIONS"), value: "NA" }]
    };
  }

  // Map taxHeadEstimates to display taxHeadCode, remarks, and updatedBy
  const values = latestCalc.taxHeadEstimates.map((estimate, index) => ({
    title: `${t(estimate.taxHeadCode) || estimate.taxHeadCode}`, // Label: taxHeadCode
    value: estimate.remarks || "N/A",                           // Value: remarks
    updatedBy: latestCalc.updatedBy || "N/A"                    // Extra field: last updated by
  }));

  return {
    title: t("NOC_FEE_DETAILS_LABEL"),
    values
  };
};




export const getNOCAcknowledgementData = async (applicationDetails, tenantInfo, ulbType, ulbName, t, isView = false, checklistData = null) => {
  const stateCode = Digit.ULBService.getStateId();
  const appData = applicationDetails || {};
  console.log("appData here in DownloadACK", appData);
  console.log('isView', isView)

  let detailsArr = [],
    imageURL = "";
  const ownerFileStoreId = appData?.nocDetails?.additionalDetails?.ownerPhotos?.[0]?.filestoreId || "";

  const result = await Digit.UploadServices.Filefetch([ownerFileStoreId], stateCode);

  const fileData = result?.data?.fileStoreIds?.[0];
  imageURL = fileData?.url || "";
  const isEmployee = window.location.href.includes("/employee");

  if (appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalName) detailsArr.push(getProfessionalDetails(appData, t));

  const data = {
    t,
    tenantId: tenantInfo?.code,
    name: "NOC Application",
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("LOCAL_GOVERNMENT_PUNJAB"),
    applicationNumber: appData?.applicationNo || "NA",
    details: [
      getRegistrationDetails(appData, t),
      ...detailsArr,
      ...getApplicantDetails(appData, t),
      getSiteDetails(appData, t),
      getSpecificationDetails(appData, t),
      // Fee calculation only if employee, data exists, and at least one fee > 0
      isEmployee &&
      appData?.nocDetails?.additionalDetails?.calculations?.length &&
      appData.nocDetails.additionalDetails.calculations.some((calc) => calc.isLatest && calc.taxHeadEstimates?.some((est) => est.estimateAmount > 0))
        ? getLatestCalculationDetails(appData, t)
        : null,

      // Checklist only if employee and checklistData exists
      isEmployee && checklistData?.checkList?.length ? getChecklistDetails(appData, checklistData, t) : null,

      // Inspection report only if employee and inspection data exists
      isEmployee && appData?.nocDetails?.additionalDetails?.fieldinspection_pending?.[0] ? getInspectionDetails(appData, t) : null,
      await getDocuments(appData, t),
      await getSitePhotographs(appData, t, stateCode),
      // JE site images only if employee and jeSiteImages exist
      isEmployee && appData?.nocDetails?.additionalDetails?.siteImages?.length ? await getJESiteImages(appData, t, stateCode) : null,
    ].filter(Boolean),
    imageURL,
    ulbType,
    ulbName,
  };

  if (isView) {
    data.openInNewTab = true;
  }

  return data;
};
