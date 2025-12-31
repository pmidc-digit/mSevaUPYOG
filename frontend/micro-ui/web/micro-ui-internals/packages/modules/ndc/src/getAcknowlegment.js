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
// const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

const getReadableCity = (tenantId = "") => {
  if (!tenantId) return "NA";
  const parts = tenantId.split(".");
  if (parts.length < 2) return tenantId;

  const key = parts[1].toLowerCase();

  const cityMap = {
    testing: "Testing",
    amritsar: "Amritsar",
    punjab: "Punjab",
    chandigarh: "Chandigarh",
    ludhiana: "Ludhiana",
  };

  return cityMap[key] || capitalize(key);
};

const capitalize = (text) => text?.charAt(0).toUpperCase() + text?.slice(1);

const getAcknowledgementData = async (application, formattedAddress, tenantInfo, t, approver,ulbType) => {
  const appData = application?.Applications?.[0] || {};
  const owner = appData?.owners?.[0] || {};
  const ndc = appData?.NdcDetails?.[0] || {};
  const add = ndc?.additionalDetails || {};
  const approvalDate = appData?.auditDetails?.lastModifiedTime ? new Date(appData.auditDetails?.lastModifiedTime).toLocaleDateString("en-GB"): "N/A"
                       
  const applicationNumber = appData?.applicationNo || "NA";
  // const propertyId = ndc?.consumerCode || "NA";
  const ptObj = appData?.NdcDetails?.find(item => item.businessService === 'PT');
  const propertyId = ptObj?.consumerCode;
  console.log('ptObj', ptObj)

  const propertyType = add?.propertyType ? t(add.propertyType) : "NA";
  const applicantName = owner?.name || "NA";
  // const address = owner?.permanentAddress || owner?.correspondenceAddress || "NA";
  const address = appData?.NdcDetails?.[0]?.additionalDetails?.propertyAddress || owner?.permanentAddress || owner?.correspondenceAddress || "NA";
  const ulbName = tenantInfo?.name || appData?.tenantId || "NA";
  const duesAmount = add?.duesAmount || appData?.additionalDetails?.duesAmount || "0";
  const dateOfApplication = add?.dateOfApplication || "NA";
  const dateOfApproval = add?.dateOfApproval || "NA";
  const ownerNames = (application?.propertyOwnerNames || []).join(", ") || "NA";
  console.log(appData, "APPDATA");

  const readableCity = getReadableCity(appData?.tenantId);
  console.log(tenantInfo, "TENANT INFO IN ACKNOWLEDGEMENT");

  // Build single certificate body by concatenating translated fragments and dynamic values
  const certificateBody = [
  { text: "NDC No: ", bold: false },
  { text: `${appData?.applicationNo}`, bold: true },
  { text: ", Property ID: ", bold: false },
  { text: `${propertyId}`, bold: true },
  { text: ", Property Type: ", bold: false },
  { text: `${propertyType}\n`, bold: true },

  { text: "Property Address: ", bold: false },
  { text: `${formattedAddress}`, bold: true }, { text: " Owned by: ", bold: false }, { text: `${ownerNames}\n`, bold: true },
  { text: "Applicant Name: ", bold: false },
  { text: `${applicantName}`, bold: true },
  { text: " (s/o, d/o) ", bold: false },
  { text: `${appData?.owners?.[0]?.fatherOrHusbandName || "NA"}`, bold: true },
  { text: " resident of ", bold: false },
  { text: `${address}.\n`, bold: true },
  {
    text: [
      { text: `• This is to certify that, as per the records and data with ${ulbName}, all applicable municipal dues related to the above mentioned property have been duly recovered/deposited. `, bold: true },
      { text: `${t("NDC_CERTIFY_NOTE_ONE_PB")} ${ulbName} ${t("NDC_CERTIFY_NOTE_TWO_PB")}\n`, bold: false }
    ]
  },

  {
    text: [
      { text: `• This No Dues Certificate is valid for one month from the date of issuance.`, bold: true },
      { text: `${t("NDC_VALIDITY_NOTE_PB")}\n`, bold: false }
    ]
  },
  {
    text: [
      { text: `• This is only a No Dues Certificate for municipal dues as on date and it does not regulate the compliance of building regulations, change of land use, any fire safety regulations or any other compliance under any act/rules. `, bold: true },
      { text: `${t("NDC_BUILDING_NOTE_PB")}\n`, bold: false }
    ]
  },
  {
    text: [
      { text: `• This No Dues Certificate does not bar any competent authority to take action under their prevailing act/rules. `, bold: true },
      { text: `${t("NDC_AUTHORITY_NOTE_PB")}\n`, bold: false }
    ]
  },
  {
    text: [
      { text: `• In case any discrepancies in the amount deposited are discovered by the Municipal Corporation/Council at any stage, it shall be the responsibility of the owner to deposit the differential amount as notified by the Municipal Corporation/Council, which will have the full right to recover the same. `, bold: true },
      { text: `${t("NDC_DISCREPANCY_NOTE_PB")}\n`, bold: false }
    ]
  },
  {
    text: [
      { text: `• This certificate is only for the purpose of municipal dues and this certificate is not a proof of ownership. `, bold: true },
      { text: `${t("NDC_OWNERSHIP_NOTE_PB")}\n`, bold: false }
    ]
  }
];




  return {
    t,
    approvalDate,
    approver,
    ulbType,
    tenantId: appData?.tenantId,
    // Use readable city dynamically
    name: ` No Dues Certificate `,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: `Local Government, Punjab`,
    applicationNumber,
    details: [
      {
        value: certificateBody,
      },
    ],
  };
};
export default getAcknowledgementData;
