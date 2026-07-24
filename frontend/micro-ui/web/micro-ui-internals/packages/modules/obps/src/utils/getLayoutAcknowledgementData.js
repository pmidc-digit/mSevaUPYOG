import React from "react";
import { pdfDocumentName, pdfDownloadLink, buildFeeHistoryByTax } from "./index";
import { Loader } from "@mseva/digit-ui-react-components";
import EXIF from "./exif-compat";

const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

const getFloorLabel = (index, t) => {
  if (index === 0) return t("LAYOUT_GROUND_FLOOR_AREA_LABEL");

  const floorNumber = index;
  const lastDigit = floorNumber % 10;
  const lastTwoDigits = floorNumber % 100;

  let suffix = "th";
  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    if (lastDigit === 1) suffix = "st";
    else if (lastDigit === 2) suffix = "nd";
    else if (lastDigit === 3) suffix = "rd";
  }

  return `${floorNumber}${suffix} ${t("LAYOUT_FLOOR_AREA_LABEL")}`;
};

const getRegistrationDetails = (appData, t) => {
  const values = [
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
  const values = [
    {
      title: t("NOC_PROFESSIONAL_NAME_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalName || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_EMAIL_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalEmailId || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalRegId || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_MOBILE_NO_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalMobileNumber || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_ADDRESS_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalAddress || "N/A",
    },
  ];

  return {
    title: t("NOC_PROFESSIONAL_DETAILS"),
    values: values,
  };
};

const getApplicantDetails = (appData, t) => {
  const values = [];

  [...appData?.owners]
  ?.sort((a, b) => (b?.isPrimaryOwner === true ? 1 : 0) - (a?.isPrimaryOwner === true ? 1 : 0))?.map((owner) => {
    const value = [
      {
        title: t("CLU_OWNER_TYPE_LABEL"),
        value: owner?.additionalDetails?.aplicantType?.name || owner?.additionalDetails?.aplicantType || "N/A",
      },
      ...[
        owner?.additionalDetails?.aplicantType?.code === "FIRM"
          ? {
              title: t("NEW_LAYOUT_FIRM_NAME_LABEL"),
              value: owner?.additionalDetails?.authorisedPerson,
            }
          : null,
      ],
      {
        title: t("NOC_FIRM_OWNER_NAME_LABEL"),
        value: owner?.name || "N/A",
      },
      {
        title: t("NOC_APPLICANT_EMAIL_LABEL"),
        value: owner?.emailId || "N/A",
      },
      {
        title: t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL"),
        value: owner?.fatherOrHusbandName || "Not Provided",
      },
      {
        title: t("NOC_APPLICANT_MOBILE_NO_LABEL"),
        value: owner?.mobileNumber || "N/A",
      },
      {
        title: t("NOC_APPLICANT_DOB_LABEL"),
        value: Digit.DateUtils.ConvertTimestampToDate(owner?.dob, "dd/MM/yyyy") || "N/A",
      },
      {
        title: t("NOC_APPLICANT_GENDER_LABEL"),
        value: owner?.gender?.code || owner?.gender || "N/A",
      },
      {
        title: t("NOC_APPLICANT_ADDRESS_LABEL"),
        value: owner?.permanentAddress || "N/A",
      },
    ];
    values.push(...value?.filter((owner) => owner !== null));
  });

  values.push(
    ...(appData?.layoutDetails?.additionalDetails?.applicationDetails?.panNumber
      ? [
          {
            title: "NOC_PAN_NO",
            value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.panNumber,
          },
        ]
      : [])
  );
  return {
    title: t("NOC_APPLICANT_DETAILS"),
    values: values,
  };
};

const getSiteDetails = (appData, t) => {
  const sd = appData?.layoutDetails?.additionalDetails?.siteDetails;

  const values = [
    // CLU fields
    {
      title: t("BPA_IS_CLU_REQUIRED_LABEL"),
      value: sd?.isCluRequired?.code || sd?.isCluRequired,
    },
    ...(sd?.isCluRequired?.code === "NO" || sd?.isCluRequired === "NO"
      ? [
          { title: t("BPA_CLU_TYPE_LABEL"),     value: sd?.cluType?.code || sd?.cluType },
          ...(sd?.cluType?.code === "ONLINE" || sd?.cluType === "ONLINE"
            ? [{ title: t("BPA_CLU_NUMBER_LABEL"),         value: sd?.cluNumber  }]
            : []),
          ...(sd?.cluType?.code === "OFFLINE" || sd?.cluType === "OFFLINE"
            ? [{ title: t("BPA_CLU_NUMBER_OFFLINE_LABEL"), value: sd?.cluNumberOffline  }]
            : []),
          { title: t("BPA_CLU_APPROVAL_DATE_LABEL"), value: sd?.cluApprovalDate  },
        ]
      : []),
    ...(sd?.isCluRequired?.code === "YES" || sd?.isCluRequired === "YES"
      ? [{ title: t("Application Applied Under"), value: sd?.applicationAppliedUnder?.code || sd?.applicationAppliedUnder  }]
      : []),

    { title: t("Type Of Application"),       value: sd?.typeOfApplication?.name },

    // Location fields
    { title: t("BPA_PROPOSED_SITE_ADDRESS"), value: sd?.proposedSiteAddress  },
    { title: t("BPA_SITE_WARD_NO_LABEL"),    value: sd?.wardNo  },
    { title: t("BPA_KHASRA_NO_LABEL"),       value: sd?.khasraNo  },
    { title: t("Khatuni No."),               value: sd?.khanutiNo  },
    { title: t("BPA_HADBAST_NO_LABEL"),      value: sd?.hadbastNo  },
    { title: t("BPA_SITE_VILLAGE_NAME_LABEL"), value: sd?.villageName  },
    { title: t("BPA_VASIKA_NUMBER_LABEL"),   value: sd?.vasikaNumber  },
    { title: t("BPA_VASIKA_DATE_LABEL"),     value: sd?.vasikaDate  },
    { title: t("BPA_ROAD_TYPE_LABEL"),       value: sd?.roadType?.name || sd?.roadType },
    { title: t("BPA_NET_TOTAL_AREA_LABEL"),  value: sd?.areaLeftForRoadWidening },
    { title: t("BPA_IS_AREA_UNDER_MASTER_PLAN_LABEL"), value: sd?.isAreaUnderMasterPlan?.i18nKey || sd?.isAreaUnderMasterPlan },
    { title: t("BPA_ZONE_LABEL"),            value: sd?.zone?.name || sd?.zone },
    { title: t("BPA_ULB_NAME_LABEL"),        value: sd?.ulbName?.name || sd?.ulbName },
    { title: t("BPA_DISTRICT_LABEL"),        value: sd?.district?.name || sd?.district  },
    { title: t("BPA_ULB_TYPE_LABEL"),        value: sd?.ulbType  },
    { title: t("BPA_PLOT_NO_LABEL"),         value: sd?.plotNo  },

    // Area distribution
    { title: t("BPA_BUILDING_CATEGORY_LABEL"),      value: sd?.buildingCategory?.name  },
    { title: t("BPA_BUILDING_CATEGORY_LABEL_TYPE"), value: sd?.residentialType?.name || sd?.buildingCategory?.name },
    { title: t("BPA_NET_TOTAL_AREA_LABEL"),         value: sd?.areaLeftForRoadWidening  },
    { title: t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"), value: sd?.netPlotAreaAfterWidening  },
    {
      title: t("BPA_BALANCE_AREA_IN_SQ_M_LABEL"),
      value: (sd?.areaLeftForRoadWidening && sd?.netPlotAreaAfterWidening)
        ? String(parseFloat(sd?.areaLeftForRoadWidening) - parseFloat(sd?.netPlotAreaAfterWidening))
        : "N/A",
    },
    { title: t("BPA_AREA_UNDER_EWS_IN_SQ_M_LABEL"),  value: sd?.areaUnderEWS  },
    { title: t("BPA_AREA_UNDER_EWS_IN_PCT_LABEL"),   value: sd?.areaUnderEWSInPct  },
    { title: t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL"),   value: sd?.netTotalArea },
    { title: t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_SQ_M_LABEL"), value: sd?.areaUnderResidentialUseInSqM  },
    { title: t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_PCT_LABEL"),  value: sd?.areaUnderResidentialUseInPct  },
    { title: t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_SQ_M_LABEL"),  value: sd?.areaUnderCommercialUseInSqM },
    { title: t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_PCT_LABEL"),   value: sd?.areaUnderCommercialUseInPct  },
    ...(sd?.buildingCategory?.name?.toLowerCase().includes("industrial")
      ? [
          { title: t("BPA_AREA_UNDER_INDUSTRIAL_USE_IN_SQ_M_LABEL"), value: sd?.areaUnderIndustrialUseInSqM  },
          { title: t("BPA_AREA_UNDER_INDUSTRIAL_USE_IN_PCT_LABEL"),  value: sd?.areaUnderIndustrialUseInPct  },
        ]
      : [
          { title: t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_SQ_M_LABEL"), value: sd?.areaUnderInstutionalUseInSqM  },
          { title: t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_PCT_LABEL"),  value: sd?.areaUnderInstutionalUseInPct  },
        ]),
    { title: t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_SQ_M_LABEL"), value: sd?.areaUnderCommunityCenterInSqM },
    { title: t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_PCT_LABEL"),  value: sd?.areaUnderCommunityCenterInPct  },
    { title: t("BPA_AREA_UNDER_PARK_IN_SQ_M_LABEL"),   value: sd?.areaUnderParkInSqM  },
    { title: t("BPA_AREA_UNDER_PARK_IN_PCT_LABEL"),    value: sd?.areaUnderParkInPct  },
    { title: t("BPA_AREA_UNDER_ROAD_IN_SQ_M_LABEL"),   value: sd?.areaUnderRoadInSqM  },
    { title: t("BPA_AREA_UNDER_ROAD_IN_PCT_LABEL"),    value: sd?.areaUnderRoadInPct  },
    { title: t("BPA_AREA_UNDER_PARKING_IN_SQ_M_LABEL"),   value: sd?.areaUnderParkingInSqM  },
    { title: t("BPA_AREA_UNDER_PARKING_IN_PCT_LABEL"),    value: sd?.areaUnderParkingInPct  },
    { title: t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_SQ_M_LABEL"), value: sd?.areaUnderOtherAmenitiesInSqM  },
    { title: t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_PCT_LABEL"),  value: sd?.areaUnderOtherAmenitiesInPct  },

    { title: t("BPA_ROAD_WIDTH_AT_SITE_LABEL"), value: sd?.roadWidthAtSite  },
    { title: t("BPA_BUILDING_STATUS_LABEL"),    value: sd?.buildingStatus?.name || sd?.buildingStatus?.code || sd?.buildingStatus  },
  ];

  if (sd?.buildingStatus == "Built Up") {
    values.push({
      title: t("NOC_BASEMENT_AREA_LABEL"),
      value: sd?.basementArea ,
    });
  }

  if (sd?.buildingStatus == "Built UP") {
    sd?.floorArea?.map((floor, index) =>
      values.push({
        title: getFloorLabel(index, t),
        value: floor?.value,
      })
    );
  }

  if (sd?.buildingStatus == "Built Up") {
    values.push({
      title: t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL"),
      value: sd?.totalFloorArea ,
    });
  }

  return {
    title: t("NOC_SITE_DETAILS"),
    values: values.filter((v) => Boolean(v?.value)),
  };
};

const getSpecificationDetails = (appData, t) => {
  const values = [
    {
      title: t("NOC_PLOT_AREA_JAMA_BANDI_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationPlotArea || "N/A",
    },
    {
      title: t("NOC_BUILDING_CATEGORY_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.buildingCategory?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationBuildingCategory ||
        "N/A",
    },
    {
      title: t("NOC_NOC_TYPE_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationNocType?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationNocType ||
        "Not Applicable",
    },
    {
      title: t("NOC_RESTRICTED_AREA_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationRestrictedArea?.code ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationRestrictedArea ||
        "Not Applicable",
    },
    {
      title: t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.isAreaUnderMasterPlan?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.isAreaUnderMasterPlan ||
        "No",
    },
  ];

  return {
    title: t("NOC_SPECIFICATION_DETAILS"),
    values: values,
  };
};

const getDocuments = async ({appData, t, onlyapplicants = false, primaryOwner = false}) => {
  
  const applicantDocs = onlyapplicants && primaryOwner
  ? [
      primaryOwner?.additionalDetails?.documentFile ? { uuid: primaryOwner.additionalDetails?.documentFile, documentType: "OWNER.DOCUMENTFILE" } : null,
      primaryOwner?.additionalDetails?.panDocument  ? { uuid: primaryOwner.additionalDetails?.panDocument,  documentType: "OWNER.PANDOCUMENT"  } : null,
    ]?.filter(Boolean)
  : null;
  const filteredDocs = !onlyapplicants ? appData?.documents
    ?.filter((doc) => doc?.documentType !== "OWNER.SITEPHOTOGRAPHONE" && doc?.documentType !== "OWNER.SITEPHOTOGRAPHTWO")
    ?.sort((a, b) => a?.order - b?.order) : applicantDocs;

  const filesArray = filteredDocs?.map((value) => value?.uuid || value);
  
  const res = filesArray?.length > 0 && (await Digit.UploadServices.Filefetch(filesArray, Digit.ULBService.getStateId()));
  
  return {
    isAttachments: true,
    title: !onlyapplicants? t("BPA_TITILE_DOCUMENT_UPLOADED") : t("APPLICANT_DOCUMENTS"),
    values:
      filteredDocs?.length > 0
        ? filteredDocs.map((document, index) => {
            const documentLink = pdfDownloadLink(res?.data, document?.uuid);
            return {
              title: t(document?.documentType.replace(/\./g, "_")) ? index + 1 + ". " + t(document?.documentType.replace(/\./g, "_")) : t("CS_NA"),
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
    (doc) => doc.documentType === "OWNER.SITEPHOTOGRAPHONE" || doc.documentType === "OWNER.SITEPHOTOGRAPHTWO"
  );

  const fileStoreIds = sitePhotoDocs?.map((doc) => doc?.uuid);

  const res = fileStoreIds?.length > 0 && (await Digit.UploadServices.Filefetch(fileStoreIds, Digit.ULBService.getStateId()));

  const coords = appData?.layoutDetails?.additionalDetails?.coordinates || {};

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
            title: (t(doc.documentType.replace(/\./g, "_")) || t("CS_NA")) + ` (Lat: ${lat}, Long: ${long})`,
            value: " ",
            link: documentLink || "",
          };
        })
      : [{ title: t("CS_NO_DOCUMENTS_UPLOADED"), value: "NA" }];

  return {
    title: t("BPA_LOC_SITE_PHOTOGRAPH_PREVIEW"),
    isAttachments: true,
    values,
  };
};

async function getExifDataFromUrl(fileUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      EXIF.getData(img, function () {
        resolve(EXIF.getAllTags(this));
      });
    };
    img.onerror = (err) => resolve({});
    img.src = fileUrl;
  });
}

const getJESiteImages = async (appData, t, stateCode) => {
  const siteImages = appData?.layoutDetails?.additionalDetails?.siteImages || appData?.layoutDetails?.additionalDetails?.applicationDetails?.siteImages || appData?.additionalDetails?.siteImages || [];

  const fileStoreIds = siteImages?.map((img) => img?.filestoreId || img?.documentFileStoreId);

  const res = fileStoreIds?.length > 0 && (await Digit.UploadServices.Filefetch(fileStoreIds, stateCode));

  let values = [{ title: t("CS_NO_DOCUMENTS_UPLOADED"), value: "NA" }];

  if (siteImages?.length > 0) {
    values = await Promise.all(
      siteImages.map(async (img) => {
        const fileStoreId = img?.filestoreId || img?.documentFileStoreId;
        const documentLink = pdfDownloadLink(res?.data, fileStoreId);
        const exiflink = `${window.origin}/filestore/v1/files/id?fileStoreId=${fileStoreId}&tenantId=${stateCode}`;

        const exifData = await getExifDataFromUrl(exiflink);
        if ([3, 6, 8].includes(exifData?.Orientation)) {
          exifData.Orientation = 1;
        }

        const lat = img?.latitude || "N/A";
        const long = img?.longitude || "N/A";

        return {
          title: (t(img?.documentType?.replace(/\./g, "_")) || t("CS_NA")) + ` (Lat: ${lat}, Long: ${long})`,
          value: " ",
          link: documentLink || "",
          exiflink: exiflink || "",
          orientation: exifData?.Orientation || 1,
        };
      })
    );
  }

  return {
    title: t("SITE_INPECTION_IMAGES"),
    isAttachments: true,
    values,
  };
};

const getInspectionReport = (appData, t) => {
  const inspectionData = appData?.layoutDetails?.additionalDetails?.fieldinspection_pending?.[0] || appData?.layoutDetails?.additionalDetails?.applicationDetails?.fieldinspection_pending?.[0] || appData?.additionalDetails?.fieldinspection_pending?.[0] || {};
  const remarksKeys = Object.keys(inspectionData).filter((key) => key.startsWith("Remarks_"));

  const remarksValues = remarksKeys.map((key, index) => {
    const question = inspectionData?.questionList?.[index]?.question || key;
    return {
      title: `${t(question)}`,
      value: inspectionData[key] || "N/A",
    };
  });

  return {
    title: t("BPA_FI_REPORT"),
    values: remarksValues.length > 0 ? remarksValues : [{ title: t("No Remarks"), value: "NA" }],
  };
};

const getFeeDetails = (appData, t) => {
  const calculations = appData?.layoutDetails?.additionalDetails?.calculations || [];

  if (calculations?.length === 0) return null;

  const getRank = (taxHeadCode) => {
    const code = taxHeadCode || "";
    if (code === "LAYOUT_LAYOUT_FEE") return 1;
    if (code === "LAYOUT_UDC_FEE") return 2;
    if (code === "LAYOUT_EDC_FEE") return 3;
    if (code === "LAYOUT_PF_FEE") return 4;
    if (code === "LAYOUT_CLU_FEE") return 5;
    if (code === "LAYOUT_OTHERCHARGES1_FEE") return 6;
    if (code === "LAYOUT_OTHERCHARGES2_FEE") return 7;
    return 100;
  };

  const sortedCalcs = [...calculations]?.sort((a, b) => getRank(a?.taxHeadCode) - getRank(b?.taxHeadCode));
  const values = [];
  let totalAmount = 0;

  sortedCalcs?.forEach((calc) => {
    const amount = calc?.adjustedAmount || calc?.estimateAmount;
    if (amount !== undefined && amount !== null) {
      values.push({
        title: t(calc?.taxHeadCode),
        value: `₹ ${amount}`,
      });
      totalAmount += Number(amount);
    }
  });

  if (values?.length > 0) {
    values.push({
      title: t("LAYOUT_TOTAL"),
      value: `₹ ${totalAmount}`,
    });
  }

  return {
    title: t("BPA_FEE_DETAILS_LABEL"),
    values: values.filter((v) => Boolean(v?.value)),
  };
};

const getLayoutApplicationFeeDetails = (collectionData, t) => {
  const pay1 = (collectionData || []).filter((p) => {
    const bs = p?.paymentDetails?.[0]?.businessService || "";
    return bs === "LAYOUT.PAY1" || bs.includes("PAY1");
  });
  if (pay1.length === 0) return null;

  const values = [];
  pay1?.forEach((payment, idx) => {
    if (pay1?.length > 1) values.push({ title: `--- Payment ${idx + 1} ---`, value: "" });
    const billAccountDetails = payment?.paymentDetails?.[0]?.bill?.billDetails?.[0]?.billAccountDetails || [];
    billAccountDetails?.forEach((bad) => {
      values.push({ title: t(bad.taxHeadCode) || t("CS_NA"), value: `₹ ${(bad.amount || 0).toLocaleString("en-IN")}` });
    });
    const total = billAccountDetails.reduce((acc, i) => acc + (i.amount || 0), 0);
    if (billAccountDetails.length > 0) values.push({ title: t("BPA_TOTAL"), value: `₹ ${total.toLocaleString("en-IN")}` });
    values.push({ title: t("Receipt Number"), value: payment?.paymentDetails?.[0]?.receiptNumber || "N/A" });
    values.push({ title: t("Transaction Date"), value: payment?.transactionDate ? new Date(payment.transactionDate).toLocaleDateString("en-IN") : "N/A" });
    values.push({ title: t("Payment Mode"), value: payment?.paymentMode || "N/A" });
  });

  return values.length > 0 ? { title: t("BPA_APPLICATION_FEE"), values } : null;
};

const getLayoutSanctionFeeDetails = (collectionData, t) => {
  const pay2 = (collectionData || []).filter((p) => {
    const bs = p?.paymentDetails?.[0]?.businessService || "";
    return bs === "LAYOUT.PAY2" || bs.includes("PAY2");
  });
  if (pay2.length === 0) return null;

  const values = [];
  pay2?.forEach((payment, idx) => {
    if (pay2?.length > 1) values.push({ title: `--- Payment ${idx + 1} ---`, value: "" });
    const billAccountDetails = payment?.paymentDetails?.[0]?.bill?.billDetails?.[0]?.billAccountDetails || [];
    billAccountDetails?.forEach((bad) => {
      values?.push({ title: t(bad.taxHeadCode) || t("CS_NA"), value: `₹ ${(bad.amount || 0).toLocaleString("en-IN")}` });
    });
    const total = billAccountDetails?.reduce((acc, i) => acc + (i.amount || 0), 0);
    if (billAccountDetails.length > 0) values.push({ title: t("BPA_TOTAL"), value: `₹ ${total.toLocaleString("en-IN")}` });
    values.push({ title: t("Receipt Number"), value: payment?.paymentDetails?.[0]?.receiptNumber || "N/A" });
    values.push({ title: t("Transaction Date"), value: payment?.transactionDate ? new Date(payment.transactionDate).toLocaleDateString("en-IN") : "N/A" });
    values.push({ title: t("Payment Mode"), value: payment?.paymentMode || "N/A" });
  });

  return values.length > 0 ? { title: t("BPA_SANCTION_FEE"), values } : null;
};

const getLayoutFeeHistoryDetails = (appData, t) => {
  const calculations = appData?.layoutDetails?.additionalDetails?.calculations || [];
  const filteredCalcs = calculations?.filter((calc) =>
    (calc?.taxHeadEstimates || []).some((tax) => tax?.estimateAmount > 0)
  );
  if (filteredCalcs.length === 0) return null;

  const feeHistory = buildFeeHistoryByTax(filteredCalcs, { newestFirst: true });
  if (!feeHistory || Object.keys(feeHistory)?.length === 0) return null;

  return {
    title: t("BPA_FEE_HISTORY_LABEL"),
    isPayTwoHistoryTable: true,
    values: feeHistory,
  };
};

export const getLayoutAcknowledgementData = async (applicationDetails, tenantInfo, ulbType, t, collectionData = []) => {
  const stateCode = Digit.ULBService.getStateId();
  const appData = applicationDetails || {};
  let detailsArr = [],
    imageURL = "";
  const ownerFileStoreId = appData?.layoutDetails?.additionalDetails?.applicationDetails?.primaryOwnerPhoto || "";
  const result = await Digit.UploadServices.Filefetch([ownerFileStoreId], stateCode);
  const primaryOwner = appData?.owners?.find((o)=>o?.isPrimaryOwner === true) || appData?.owners?.[0]
  const fileData = result?.data?.fileStoreIds?.[0];
  imageURL = fileData?.url || "";
  const isEmployee = window.location.href.includes("/employee")

  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: t("LAYOUT_ACKNOWLEDGEMENT_TITLE"),
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("LOCAL_GOVERNMENT_PUNJAB"),
    applicationNumber: appData?.applicationNo || "NA",
    details: [
      ...detailsArr,
      getRegistrationDetails(appData, t),
      getApplicantDetails(appData, t),
      ...(appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalName
        ? [getProfessionalDetails(appData, t)]
        : []),
      await getDocuments({appData: appData, t:t, onlyapplicants : true ,primaryOwner: primaryOwner}),
      getSiteDetails(appData, t),
      ...isEmployee && (appData?.layoutDetails?.additionalDetails?.siteImages?.length > 0 || appData?.additionalDetails?.siteImages?.length > 0) ? [await getJESiteImages(appData, t, stateCode)] : [],
      await getSitePhotographs(appData, t),
      await getDocuments({appData: appData, t:t}),
      ...isEmployee && (appData?.layoutDetails?.additionalDetails?.fieldinspection_pending?.[0] || appData?.additionalDetails?.fieldinspection_pending?.[0]) ? [getInspectionReport(appData, t)] : [],
      ...(getLayoutApplicationFeeDetails(collectionData, t) ? [getLayoutApplicationFeeDetails(collectionData, t)] : []),
      ...(isEmployee && getLayoutSanctionFeeDetails(collectionData, t) ? [getLayoutSanctionFeeDetails(collectionData, t)] : []),
      ...(isEmployee && getLayoutFeeHistoryDetails(appData, t) ? [getLayoutFeeHistoryDetails(appData, t)] : []),
    ],
    imageURL,
    ulbType,
    showLogo : true
  };
};
