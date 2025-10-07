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
  const appData = application?.Applications?.[0] || {};
  const owner = appData?.owners?.[0] || {};
  const ndc = appData?.NdcDetails?.[0] || {};
  const add = ndc?.additionalDetails || {};

  const applicationNumber = appData?.applicationNo || "NA";
  // const propertyId = ndc?.consumerCode || "NA";
  const propertyId = appData?.NdcDetails?.[3]?.consumerCode;
  const propertyType = add?.propertyType ? t(add.propertyType) : "NA";
  const applicantName = owner?.name || "NA";
  // const address = owner?.permanentAddress || owner?.correspondenceAddress || "NA";
  const address = appData?.NdcDetails?.[0]?.additionalDetails?.propertyAddress || owner?.permanentAddress || owner?.correspondenceAddress || "NA";
  const ulbName = tenantInfo?.name || appData?.tenantId || "NA";
  const duesAmount = add?.duesAmount || appData?.additionalDetails?.duesAmount || "0";

  // Build single certificate body by concatenating translated fragments and dynamic values
  const certificateBody = `${t("NDC_MSG_INTRO")}

${t("NDC_MSG_APPLICATION_LABEL")}: ${applicationNumber}

${t("NDC_MSG_PROPERTY_LABEL")}: ${propertyId}  ${t("NDC_MSG_PROPERTY_TYPE_LABEL")} ${propertyType}

${t("NDC_MSG_APPLICANT_LABEL")}: ${applicantName} ${t("NDC_MSG_FOR_LAND")} ${address} ${t("NDC_MSG_FALLING_CLAUSE_PART1")} ${t(
    "NDC_MSG_FALLING_CLAUSE_PART2"
  )} Municipal Council/ Corporation ${t("NDC_MSG_AFTER_RECOVERY")} ${duesAmount} ${t("NDC_MSG_DUES_LIST")}

${t("NDC_MSG_DECLARATION_TITLE")}
${t("NDC_MSG_DECL_A")}
${t("NDC_MSG_DECL_B")}
${t("NDC_MSG_DECL_C")}
${t("NDC_MSG_DECL_D")}
${t("NDC_MSG_DECL_E")}

${t("NDC_MSG_DISCLAIMER_TITLE")}
${t("NDC_MSG_DISCLAIMER_BODY")}

${t("NDC_MSG_NOTE")} ${t("NDC_MSG_VERIFICATION_LINK_LABEL")}`;

  return {
    t,
    tenantId: tenantInfo?.code,
    name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("NDC_CERTIFICATE"),
    applicationNumber,
    details: [
      {
        // title: t("NDC_CERTIFICATE_BODY_TITLE"),
        value: certificateBody,
      },
    ],
  };
};

export default getAcknowledgementData;
