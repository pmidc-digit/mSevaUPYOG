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

  const applicationNumber = appData?.applicationNo || "NA";
  // const propertyId = ndc?.consumerCode || "NA";
  const propertyId = appData?.NdcDetails?.[0]?.consumerCode;
  const propertyType = add?.propertyType ? t(add.propertyType) : "NA";
  const applicantName = owner?.name || "NA";
  // const address = owner?.permanentAddress || owner?.correspondenceAddress || "NA";
    const address = appData?.NdcDetails?.[0]?.additionalDetails?.propertyAddress || owner?.permanentAddress || owner?.correspondenceAddress || "NA"
  const ulbName = tenantInfo?.name || appData?.tenantId || "NA";
  const duesAmount = add?.duesAmount || appData?.additionalDetails?.duesAmount || "0";
  const dateOfApplication = add?.dateOfApplication || "NA";
  const dateOfApproval = add?.dateOfApproval || "NA";

  console.log(appData, "APPDATA");

 const readableCity = getReadableCity(appData?.tenantId);
  console.log(tenantInfo, "TENANT INFO IN ACKNOWLEDGEMENT");


  // Build single certificate body by concatenating translated fragments and dynamic values
const certificateBody = `

${t("NDC_NO_ENG")} ${appData?.applicationNo}

${t("NDC_MSG_PROPERTY_LABEL")} ${propertyId}   ${t("NDC_MSG_PROPERTY_TYPE_LABEL")} ${propertyType}

${t("NDC_MSG_APPLICANT_LABEL")} ${applicantName} (s/o, f/o, d/o) for the land/building located at ${address}.

 


 This is to certify that, as per the records and data with ${ulbName} , all applicable municipal dues related to the above mentioned property have been duly recovered/deposited. ${t("NDC_CERTIFY_NOTE_ONE_PB")} ${ulbName} ${t("NDC_CERTIFY_NOTE_TWO_PB")}


${t("NDC_VALIDITY_TEXT_ENG")} ${t("NDC_VALIDITY_NOTE_PB")}

${t("NDC_SCOPE_TEXT_ENG")} ${t("NDC_BUILDING_NOTE_PB")}

${t("NDC_AUTHORITY_TEXT_ENG")} ${t("NDC_AUTHORITY_NOTE_PB")}

${t("NDC_DISCREPANCY_TEXT_ENG")} ${t("NDC_DISCREPANCY_NOTE_PB")}

${t("NDC_OWNERSHIP_TEXT_ENG")} ${t("NDC_OWNERSHIP_NOTE_PB")}

${t("NDC_ISSUED_BY_TEXT_ENG")}  
${t("NDC_COMPETENT_AUTHORITY_TEXT_ENG")}

${t("NDC_OFFICER_NAME_TEXT_ENG")}  
${t("NDC_OFFICER_DESIGNATION_TEXT_ENG")}  


${t("NDC_NOTE_TEXT_ENG")}
`;


   return {
    t,
    tenantId: appData?.tenantId,
    // Use readable city dynamically
    name: ` No Dues Certificate  \n ${t(tenantInfo?.i18nKey)} ${ulbCamel(readableCity)}`,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: `Local Goverment, Punjab`,
    applicationNumber,
    details: [
      {
        value: certificateBody,
      },
    ],
  };
};
export default getAcknowledgementData


