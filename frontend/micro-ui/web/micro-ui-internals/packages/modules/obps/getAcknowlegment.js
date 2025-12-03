import React from "react";
import { Card, CardHeader } from "@mseva/digit-ui-react-components";

const getMohallaLocale = (value = "", tenantId = "") => {
  let convertedValue = convertDotValues(tenantId);
  if (convertedValue == "NA" || !checkForNotNull(value)) {
    return "PGR_NA";
  }
  convertedValue = convertedValue.toUpperCase();
  return convertToLocale(value, `${convertedValue}_REVENUE`);
};
const convertDotValues = (value = "") => {
  return (
    (checkForNotNull(value) && ((value.replaceAll && value.replaceAll(".", "_")) || (value.replace && stringReplaceAll(value, ".", "_")))) || "NA"
  );
};
const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher == "") return str;
  while (str.includes(searcher)) {
    str = str.replace(searcher, replaceWith);
  }
  return str;
};
const checkForNotNull = (value = "") => {
  return value && value != null && value != undefined && value != "" ? true : false;
};
const getCityLocale = (value = "") => {
  let convertedValue = convertDotValues(value);
  if (convertedValue == "NA" || !checkForNotNull(value)) {
    return "PGR_NA";
  }
  convertedValue = convertedValue.toUpperCase();
  return convertToLocale(convertedValue, `TENANT_TENANTS`);
};
const convertToLocale = (value = "", key = "") => {
  let convertedValue = convertDotValues(value);
  if (convertedValue == "NA") {
    return "PGR_NA";
  }
  return `${key}_${convertedValue}`;
};
const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");
const getAcknowledgementData = async (application, tenantInfo, t) => {
  console.log("application in getAcknowledgement", application);

  const details = [];

  // Application Details
  details.push({
    title: t("CS_APPLICATION_DETAILS"),
    values: [
      {
        title: t("CS_APPLICATION_NUMBER"),
        value: application?.applicationData?.applicationNumber || "NA",
      },
      {
        title: t("REGISTRATION_FILED_DATE"),
        value: Digit.DateUtils.ConvertTimestampToDate(application?.applicationData?.auditDetails?.createdTime, "dd/MM/yyyy") || "NA",
      },
    ],
  });

  // License Details
  if (application?.applicationData?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0] === "ARCHITECT") {
    details.push({
      title: t("BPA_LICENSE_DETAILS_LABEL"),
      values: [
        {
          title: t("BPA_LICENSE_TYPE"),
          value: t(`TRADELICENSE_TRADETYPE_${application?.applicationData?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`) || "NA",
        },
        {
          title: t("BPA_QUALIFICATION_TYPE"),
          value: t(application?.applicationData?.tradeLicenseDetail?.additionalDetail?.qualificationType) || "NA",
        },
        {
          title: t("BPA_COUNCIL_NUMBER"),
          value: application?.applicationData?.licenseNumber || "NA",
        },

        {
          title: t("BPA_COUNCIL_OF_ARCH_NO_LABEL"),
          value: application?.applicationData?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo || "NA",
        }
      ],
    });
  }else{
    details.push({
      title: t("BPA_LICENSE_DETAILS_LABEL"),
      values: [
        {
          title: t("BPA_LICENSE_TYPE"),
          value: t(`TRADELICENSE_TRADETYPE_${application?.applicationData?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType?.split(".")[0]}`) || "NA",
        },
        {
          title: t("BPA_QUALIFICATION_TYPE"),
          value: t(application?.applicationData?.tradeLicenseDetail?.additionalDetail?.qualificationType) || "NA",
        },
        {
          title: t("BPA_COUNCIL_NUMBER"),
          value: application?.applicationData?.licenseNumber || "NA",
        }
      ],
    });
  }
  

  const getFormattedULBName = (ulbCode = "") => {
    if (!ulbCode) return t("BPA_ULB_NOT_AVAILABLE");
    if(typeof ulbCode !== "string") return ""

    const parts = ulbCode?.split(".");
    if (parts.length < 2) return ulbCode?.charAt(0)?.toUpperCase() + ulbCode?.slice(1);

    const namePart = parts[1];
    return namePart?.charAt(0)?.toUpperCase() + namePart?.slice(1);
  };

  const ulbName = getFormattedULBName(application?.applicationData?.tradeLicenseDetail?.additionalDetail?.Ulb);
  // Licensee Details
  details.push({
    title: t("BPA_LICENSEE_DETAILS_HEADER_OWNER_INFO"),
    values: [
      {
        title: t("BPA_APPLICANT_NAME_LABEL"),
        value: application?.applicationData?.tradeLicenseDetail?.owners?.[0]?.name || "NA",
      },
      {
        title: t("BPA_OWNER_MOBILE_NO_LABEL"),
        value: application?.applicationData?.tradeLicenseDetail?.owners?.[0]?.mobileNumber || "NA",
      },
      {
        title: t("BPA_APPLICANT_GENDER_LABEL"),
        value: application?.applicationDetails?.[2]?.values?.[1]?.value || "NA",
      },
      {
        title: t("BPA_APPLICANT_EMAIL_LABEL"),
        value: application?.applicationDetails?.[2]?.values?.[3]?.value || "NA",
      },
      {
        title: t("BPA_APPLICANT_ULB_LIST"),
        value: application?.applicationData?.tradeLicenseDetail?.additionalDetail?.qualificationType === "B-Arch" ? t("ALL_ULBS") : ulbName || "N/A",
      },
    ],
  });

  // Address Details
  details.push({
    title: t("BPA_NEW_ADDRESS_HEADER_DETAILS"),
    values: [
      {
        title: t("BPA_PERMANANT_ADDRESS_LABEL"),
        value: application?.applicationDetails?.[3]?.values?.[0]?.value || "NA",
      },
      {
        title: t("BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL"),
        value: application?.applicationDetails?.[4]?.values?.[0]?.value || "NA",
      },
    ],
  });

  // Documents
  // const documents = application?.Licenses?.[0]?.tradeLicenseDetail?.documents || [];
  const documents = application?.applicationDetails?.find(detail => detail.title === "BPA_DOCUMENT_DETAILS_LABEL")?.additionalDetails?.documentsWithUrl?.[0]?.values
  const docDetails = documents?.map((doc, index) => ({
    title: t(`DOC_${doc.documentType}`) || "NA",
    value: " ",
    link: doc.fileStoreId ? Digit.Utils.getFileUrl(doc.fileStoreId) : "",
  }));

  details.push({
    title: t("BPA_APPLICATION_DOCUMENTS"),
    values: docDetails?.length ? docDetails : [{ title: t("CS_NO_DOCUMENTS_UPLOADED"), value: "NA" }],
  });

  const imageURL = application?.applicationDetails?.find(detail => detail.title === "BPA_DOCUMENT_DETAILS_LABEL")?.additionalDetails?.documentsWithUrl?.[0]?.values?.find(doc => doc?.documentType === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO")?.url || null;
  // console.log("imageURL", imageURL);
  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: t("BPA_ACKNOWLEDGEMENT_TITLE"),
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("LOCAL_GOVERNMENT_PUNJAB"),
    applicationNumber: application?.applicationData?.applicationNumber || "NA",
    details,
    imageURL
  };
};

export default getAcknowledgementData;
