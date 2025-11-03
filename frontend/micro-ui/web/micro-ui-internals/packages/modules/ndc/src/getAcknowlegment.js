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

const getAcknowledgementData = async (application, tenantInfo, t) => {
  const appData = application?.Applications?.[0] || {};
  const owner = appData?.owners?.[0] || {};
  const ndc = appData?.NdcDetails?.[0] || {};
  const add = ndc?.additionalDetails || {};
  const approvalDate = appData?.auditDetails?.lastModifiedTime ? new Date(appData.auditDetails?.lastModifiedTime).toLocaleDateString("en-GB"): "N/A"
                       
  const applicationNumber = appData?.applicationNo || "NA";
  // const propertyId = ndc?.consumerCode || "NA";
  const propertyId = appData?.NdcDetails?.[0]?.consumerCode;
  const propertyType = add?.propertyType ? t(add.propertyType) : "NA";
  const applicantName = owner?.name || "NA";
  // const address = owner?.permanentAddress || owner?.correspondenceAddress || "NA";
  const address = appData?.NdcDetails?.[0]?.additionalDetails?.propertyAddress || owner?.permanentAddress || owner?.correspondenceAddress || "NA";
  const ulbName = tenantInfo?.name || appData?.tenantId || "NA";
  const duesAmount = add?.duesAmount || appData?.additionalDetails?.duesAmount || "0";
  const dateOfApplication = add?.dateOfApplication || "NA";
  const dateOfApproval = add?.dateOfApproval || "NA";

  console.log(appData, "APPDATA");

  const readableCity = getReadableCity(appData?.tenantId);
  console.log(tenantInfo, "TENANT INFO IN ACKNOWLEDGEMENT");

  // Build single certificate body by concatenating translated fragments and dynamic values
  const certificateBody = `
NDC No: : ${appData?.applicationNo} ,  Property ID : ${propertyId} ,  Property Type: ${propertyType}

Applicant Name: ${applicantName} (s/o, d/o) ${appData?.owners?.[0]?.fatherOrHusbandName} for the land/building located at ${address}.
This is to certify that, as per the records and data with ${ulbName} , all applicable municipal dues related to the above mentioned property have been duly recovered/deposited. ${t(
    "NDC_CERTIFY_NOTE_ONE_PB"
  )} ${ulbName} ${t("NDC_CERTIFY_NOTE_TWO_PB")} 
${t("NDC_VALIDITY_TEXT_ENG")} ${t("NDC_VALIDITY_NOTE_PB")}
This is only a No Dues Certificate for municipal dues as on date and it does not regulate the compliance of building regulations, change of land use, any fire safety regulations or any other compliance under any act/rules. ${t(
    "NDC_BUILDING_NOTE_PB"
  )} This No Dues Certificate does not bar any competent authority to take action under their prevailing act/rules. ${t("NDC_AUTHORITY_NOTE_PB")}

  In case any discrepancies in the amount deposited are discovered by the Municipal Corporation/Council at any stage, it   shall be the responsibility of the owner to deposit the differential amount as notified by the Municipal Corporation/Council and Municipal Commissioner will have the full right to recover the same.
 ${t("NDC_DISCREPANCY_NOTE_PB")} This certificate is only for the purpose of municipal dues and this certificate is not a proof of ownership. ${t(
    "NDC_OWNERSHIP_NOTE_PB"
  )} 
`;

  return {
    t,
    approvalDate,
    tenantId: appData?.tenantId,
    // Use readable city dynamically
    name: ` No Dues Certificate  \n ${t(tenantInfo?.i18nKey)}`,
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
