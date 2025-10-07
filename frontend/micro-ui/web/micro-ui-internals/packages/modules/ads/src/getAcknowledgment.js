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
//   const getAcknowledgementData=async(application, tenantInfo, t)=>{
//     return {
//         t: t,
//         tenantId: tenantInfo?.code,
//         name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
//         email: tenantInfo?.emailId,
//         phoneNumber: tenantInfo?.contactNumber,
//         heading: t("NEW_STAKEHOLDER_REGISTRATION"),
//         applicationNumber:application?.applicationData?.applicationNumber || "NA",
//         details: [

//             {
//                 title: t("CS_APPLICATION_DETAILS"),
//                 values: [
//                     {
//                         title: t("REGISTRATION_FILED_DATE"),
//                         value: Digit.DateUtils.ConvertTimestampToDate(application?.applicationData?.auditDetails?.createdTime, "dd/MM/yyyy") || "NA",
//                     },
//                 ],
//             },
//             {
//                 title: t("BPA_LICENSE_DETAILS_LABEL"),
//                 values: [
//                     {
//                         title : t("BPA_LICENSE_TYPE"),
//                         value : t(`${application?.applicationDetails?.[1]?.values[0]?.value}`) || "NA",
//                     },
//                     {
//                         title : t("BPA_COUNCIL_NUMBER"),
//                         value : application?.applicationDetails?.[1]?.values[1]?.value || "NA",
//                     },
//                     {
//                         title: t("BPA_LICENSE_TYPE"),
//                         value: application?.applicationData?.tradeLicenseDetail?.tradeUnits?.tradeType|| "NA",

//                     },
//                     {/**Qualification Type missing here in payload */}
//                 ]
//             },

//             {
//                 title: t("BPA_LICENSEE_DETAILS_HEADER_OWNER_INFO"),
//                 values: [
//                     {
//                         title: t("BPA_APPLICANT_NAME_LABEL"),
//                         value: application?.applicationData?.tradeLicenseDetail?.owners?.[0]?.name || "NA",
//                     },
//                     {
//                         title: t("BPA_OWNER_MOBILE_NO_LABEL"),
//                         value: application?.applicationData?.tradeLicenseDetail?.owners?.[0]?.mobileNumber || "NA",
//                     },
//                     {
//                         title : t("BPA_APPLICANT_GENDER_LABEL"),
//                         value : application?.applicationDetails?.[2]?.values[1]?.value || "NA",
//                     },
//                     {
//                         title : t("BPA_APPLICANT_EMAIL_LABEL"),
//                         value : application?.applicationDetails?.[2]?.values[3]?.value || "NA",
//                     },
//                     {/**Date of Birth Missing here */}

//                 ]
//             },
//             {
//                 title: t("BPA_NEW_ADDRESS_HEADER_DETAILS"),
//                 values: [
//                     {
//                         title : t("BPA_PERMANANT_ADDRESS_LABEL"),
//                         value : application?.applicationDetails?.[3]?.values[0]?.value || "NA",
//                     },
//                     {
//                         title : t("BPA_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL"),
//                         value : application?.applicationDetails?.[4]?.values[0]?.value || "NA",
//                     },
//                     {/**Pincode, Selected Ulbs missing */}
//                 ]
//             },

//         ],
//     };
//   };

const getAcknowledgementData = async (application, tenantInfo, t) => {
  const appData = application?.Applications?.[0];
  const owner = appData?.owners?.[0] || {};

  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("NDC_CERTIFICATE"),
    applicationNumber: appData?.uuid || "NA",
    details: [
      {
        title: t("CS_APPLICATION_DETAILS"),
        values: [
          {
            title: t("REGISTRATION_FILED_DATE"),
            value: Digit.DateUtils.ConvertTimestampToDate(appData?.auditDetails?.createdTime, "dd/MM/yyyy") || "NA",
          },
          {
            title: t("NDC_REASON"),
            value: appData?.reason || "NA",
          },
        ],
      },
      {
        title: t("NDC_LICENSE_DETAILS_LABEL"),
        values: [
          {
            title: t("NDC_LICENSE_TYPE"),
            value: t(appData?.NdcDetails?.[0]?.additionalDetails?.propertyType) || "NA",
          },
          {
            title: t("NDC_COUNCIL_NUMBER"),
            value: appData?.NdcDetails?.[0]?.consumerCode || "NA",
          },
          {
            title: t("NDC_TRADE_TYPE_LABEL"),
            value: appData?.NdcDetails?.[0]?.businessService || "NA",
          },
          {
            title: t("NDC_QUALIFICATION_TYPE"),
            value: appData?.additionalDetails?.qualificationType || "NA",
          },
        ],
      },
      {
        title: t("NDC_LICENSEE_DETAILS_HEADER_OWNER_INFO"),
        values: [
          {
            title: t("NDC_APPLICANT_NAME_LABEL"),
            value: owner?.name || "NA",
          },
          {
            title: t("NDC_OWNER_MOBILE_NO_LABEL"),
            value: owner?.mobileNumber || "NA",
          },
          {
            title: t("NDC_APPLICANT_GENDER_LABEL"),
            value: owner?.gender ? t(owner.gender) : "NA",
          },
          {
            title: t("NDC_APPLICANT_EMAIL_LABEL"),
            value: owner?.emailId || "NA",
          },
          {
            title: t("NDC_APPLICANT_DOB_LABEL"),
            value: owner?.dob ? Digit.DateUtils.ConvertTimestampToDate(owner.dob, "dd/MM/yyyy") : "NA",
          },
        ],
      },
      {
        title: t("NDC_NEW_ADDRESS_HEADER_DETAILS"),
        values: [
          {
            title: t("NDC_PERMANANT_ADDRESS_LABEL"),
            value: owner?.permanentAddress || "NA",
          },
          {
            title: t("NDC_APPLICANT_CORRESPONDENCE_ADDRESS_LABEL"),
            value: owner?.correspondenceAddress || "NA",
          },
          {
            title: t("NDC_PINCODE_LABEL"),
            value: owner?.permanentPinCode || owner?.correspondencePinCode || "NA",
          },
          {
            title: t("NDC_SELECT_ULB"),
            value: tenantInfo?.name || appData?.tenantId || "NA",
          },
        ],
      },
    ],
  };
};

export default getAcknowledgementData;
