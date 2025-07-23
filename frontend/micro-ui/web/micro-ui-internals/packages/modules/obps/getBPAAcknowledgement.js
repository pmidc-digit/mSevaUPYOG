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

const getBPAAcknowledgement = async (application, tenantInfo, t) => {
  const user = Digit.UserService.getUser();

  console.log("application", application);
  const owner = application?.landInfo?.owners;
  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("NEW_BUILD_PERMIT_APPLICATION"),
    applicationNumber: application?.applicationNo || "NA",
    details: [
      {
        title: t("BPA_BASIC_DETAILS_TITLE"),
        values: [
          {
            title: application?.businessService !== t("BPA_OC") ? t("BPA_EDCR_NO_LABEL") : t("BPA_OC_EDCR_NO_LABEL"),
            value: application?.edcrNumber || "NA",
          },
          {
            title: t("BPA_BASIC_DETAILS_APP_DATE_LABEL"),
            value: Digit.DateUtils.ConvertTimestampToDate(application?.auditDetails?.createdTime, "dd/MM/yyyy") || "NA",
          },
          {
            title: t("BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL"),
            value: t(`WF_BPA_${application?.data?.edcrDetails?.appliactionType}`) || "NA",
          },
          {
            title: t("BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL"),
            value: t(`${application?.data?.edcrDetails?.applicationSubType}`) || "NA",
          },
          {
            title: t("BPA_BASIC_DETAILS_OCCUPANCY_LABEL"),
            value: application?.data?.edcrDetails?.planDetail?.planInformation?.occupancy,
          },
          {
            title: t("BPA_BASIC_DETAILS_RISK_TYPE_LABEL"),
            value: t(`WF_BPA_${application?.riskType}`) || "NA",
          },
          // {
          //     title: t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL"),
          //     value: application?.data?.edcrDetails?.planDetail?.planInformation?.applicantName || "NA"
          // },
        ],
      },
      {
        title: t("BPA_PLOT_DETAILS_TITLE"),
        values: [
          {
            title: t("BPA_BOUNDARY_PLOT_AREA_LABEL"),
            value: `${application?.data?.edcrDetails?.planDetail?.planInformation?.plotArea} sq mtrs` || "NA",
          },
          {
            title: t("BPA_PLOT_NUMBER_LABEL"),
            value: application?.data?.edcrDetails?.planDetail?.planInformation?.plotNo || "NA",
          },
          {
            title: t("BPA_KHATHA_NUMBER_LABEL"),
            value: application?.data?.edcrDetails?.planDetail?.planInformation?.khataNo || "NA",
          },
          {
            title: t("BPA_HOLDING_NUMBER_LABEL"),
            value: application?.additionalDetails?.holdingNo || "NA",
          },
          {
            title: t("BPA_BOUNDARY_LAND_REG_DETAIL_LABEL"),
            value: application?.additionalDetails?.registrationDetails || "NA",
          },
          {
            title: t("BPA_APPLICATION_DEMOLITION_AREA_LABEL"),
            value: t(`${application?.data?.edcrDetails?.planDetail?.planInformation?.demolitionArea} sq mtrs`) || "NA",
          },
          {
            title: t("BPA_WARD_NUMBER_LABEL"),
            value: application?.additionalDetails?.wardnumber || "NA",
          },
          {
            title: t("BPA_KHASRA_NUMBER_LABEL"),
            value: application?.additionalDetails?.khasraNumber || "NA",
          },
        ],
      },
      //  {
      //     title: t(`BPA_NOC_DETAILS_SUMMARY`) ,
      //     values: [
      //         {
      //           title: t(`BPA_NOC_NUMBER`),
      //           value: application?.additionalDetails?.nocNumber || "NA",
      //         }
      //     ],
      //  },
      {
        title: t("BPA_APPLICANT_DETAILS_HEADER"),
        values: [
          {
            title: t("CORE_COMMON_NAME"),
            value: application?.landInfo?.owners[0]?.name || "NA",
          },
          {
            title: t("BPA_APPLICANT_GENDER_LABEL"),
            value: application?.landInfo?.owners[0]?.gender || "NA",
          },
          {
            title: t("CORE_COMMON_MOBILE_NUMBER"),
            value: application?.landInfo?.owners[0]?.mobileNumber || "NA",
          },
          {
            title: t("CORE_COMMON_EMAIL_ID"),
            value: application?.landInfo?.owners[0]?.emailId || "NA",
          },
          {
            title: t("BPA_IS_PRIMARY_OWNER_LABEL"),
            value: application?.landInfo?.owners[0]?.isPrimaryOwner || "NA",
          },
        ],
      },
      {
        title: t("BPA_ARCHITECT_DETAILS"),
        values: [
          {
            title: t("BPA_ARCHITECT_NAME"),
            value: user?.info?.name || "NA",
          },
          {
            title: t("BPA_ARCHITECT_MOBILE_NUMBER"),
            value: user?.info?.mobileNumber || "NA",
          },
          {
            title: t("BPA_ARCHITECT_ID"),
            value: application?.additionalDetails?.architectid || "NA",
          },
          {
            title: t("BPA_ARCHITECT_EMAIL"),
            value: user?.info?.emailId || "NA",
          },
        ],
      },
      {
        title: t("BPA_NEW_TRADE_DETAILS_HEADER_DETAILS"),
        values: [
          {
            title: t("BPA_DETAILS_PIN_LABEL"),
            value: application?.landInfo?.address?.pincode || "NA",
          },
          {
            title: t("BPA_CITY_LABEL"),
            value: application?.landInfo?.address?.city || "NA",
          },
          {
            title: t("BPA_LOC_MOHALLA_LABEL"),
            value: application?.landInfo?.address?.locality?.name || "NA",
          },
          {
            title: t("BPA_DETAILS_SRT_NAME_LABEL"),
            value: application?.landInfo?.address?.street || "NA",
          },
          {
            title: t("ES_NEW_APPLICATION_LOCATION_LANDMARK"),
            value: application?.landInfo?.address?.landmark || "NA",
          },
        ],
      },
      {
        title: t("BPA_COLONY_DETAILS"),
        values: [
          {
            title: t("BPA_APPROVED_COLONY"),
            value: application?.additionalDetails?.approvedColony || "NA",
          },
          {
            title: t("BPA_MASTER_PLAN"),
            value: application?.additionalDetails?.masterPlan || "NA",
          },
          {
            title: t("BPA_DISTRICT"),
            value: application?.additionalDetails?.District || "NA",
          },
          {
            title: t("BPA_ULB_NAME"),
            value: application?.additionalDetails?.UlbName || "NA",
          },
          {
            title: t("BPA_BUILDING_STATUS"),
            value: application?.additionalDetails?.buildingStatus || "NA",
          },
          {
            title: t("BPA_SCHEMES"),
            value: application?.additionalDetails?.schemes || "NA",
          },
          {
            title: t("BPA_SCHEMES_TYPE"),
            value: application?.additionalDetails?.schemesselection || "NA",
          },
          {
            title: t("BPA_PURCHASED_FAR"),
            value: application?.additionalDetails?.purchasedFAR || "NA",
          },
          {
            title: t("BPA_GREEN_BUIDINGS"),
            value: application?.additionalDetails?.greenbuilding || "NA",
          },
          {
            title: t("BPA_RESTRICTED_AREA"),
            value: application?.additionalDetails?.restrictedArea || "NA",
          },
          {
            title: t("BPA_PROPOSED_SITE_TYPE"),
            value: application?.additionalDetails?.proposedSite || "NA",
          },
          {
            title: t("BPA_CORE_AREA"),
            value: application?.data?.edcrDetails?.planDetail?.coreArea || "NA",
          },
        ],
      },
    ],
  };
};
export default getBPAAcknowledgement;
