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

  const getApplicationNumberDetails = (BPA, t) => {
    let applicationDetailsInfo = {
      title: " ",
      isCommon: true,
      values: [{ title: t("BPA_APPLICATION_NUMBER_LABEL"), value: BPA?.applicationNo || "NA" }],
    };

    if (BPA?.businessService.includes("BPA_OC")) {
      applicationDetailsInfo["values"] = [
        ...applicationDetailsInfo?.values,
        {
          title: t("BPA_PERMIT_APP_NUMBER"),
          to: `/digit-ui/${envCitizenName}/obps/bpa/${bpaResponse?.BPA?.[0]?.applicationNo}`,
          value: bpaResponse?.BPA?.[0]?.approvalNo,
          isLink: true,
        },
      ];
      applicationDetailsInfo["values"] = [
        ...applicationDetailsInfo?.values,
        {
          title: t("BPA_PERMIT_VALIDITY"),
          value: bpaResponse?.BPA?.[0]?.additionalDetails?.validityDate
            ? `${ConvertEpochToValidityDate(bpaResponse?.BPA?.[0]?.additionalDetails?.validityDate)} - ${format(
              new Date(bpaResponse?.BPA?.[0]?.additionalDetails?.validityDate),
              "dd/MM/yyyy"
            )}`
            : "NA",
        },
      ];
    }

    if (BPA?.approvalNo) {
      // applicationDetailsInfo?.values?.push({
      //   title: BPA?.businessService !== "BPA_OC" ? "BPA_PERMIT_NUMBER_LABEL" : "BPA_OC_PERMIT_NUMBER_LABEL",
      //   value: BPA?.approvalNo || "NA",
      // });
      applicationDetailsInfo?.values?.push({
        title: BPA?.businessService !== "BPA_OC" ? t("BPA_PERMIT_VALIDITY") : t("BPA_OC_PERMIT_VALIDITY"),
        value: BPA?.additionalDetails?.validityDate
          ? `${ConvertEpochToValidityDate(BPA?.additionalDetails?.validityDate)} - ${format(
            new Date(BPA?.additionalDetails?.validityDate),
            "dd/MM/yyyy"
          )}`
          : "NA",
      });
    }

    return applicationDetailsInfo;
  }

  const getOwnerDetails = (application, t) => {
    const owners = application?.landInfo?.owners;
    let values = [];
    if (owners?.length === 1) {
      const owner = owners[0];
      values = [
        {
          title: t("CORE_COMMON_NAME"),
          value: owner?.name || "-",
        },
        {
          title: t("BPA_APPLICANT_GENDER_LABEL"),
          value: owner?.gender || "-",
        },
        {
          title: t("CORE_COMMON_MOBILE_NUMBER"),
          value: owner?.mobileNumber || "-",
        },
        {
          title: t("CORE_COMMON_EMAIL_ID"),
          value: owner?.emailId || "-",
        },
        {
          title: t("BPA_IS_PRIMARY_OWNER_LABEL"),
          value: owner?.isPrimaryOwner === true ? "Yes" : "No",
        },
      ];
    }else if(owners?.length > 1){
      for(let i=0; i<owners.length; i++){
        const owner = owners[i];
        values.push(
          {
            title: t("COMMON_OWNER") + ` ${i+1}`,
            value: "",
          },
          {
            title: t("CORE_COMMON_NAME"),
            value: owner?.name || "-",
          },
          {
            title: t("BPA_APPLICANT_GENDER_LABEL"),
            value: owner?.gender || "-",
          },
          {
            title: t("CORE_COMMON_MOBILE_NUMBER"),
            value: owner?.mobileNumber || "-",
          },
          {
            title: t("CORE_COMMON_EMAIL_ID"),
            value: owner?.emailId || "-",
          },
          {
            title: t("BPA_APPLICANT_ADDRESS_LABEL"),
            value: owner?.permanentAddress || "-",
          },
          {
            title: t("BPA_IS_PRIMARY_OWNER_LABEL"),
            value: owner?.isPrimaryOwner === true ? "Yes" : "No",
          },
        );
      }
    }

    return {
      title: t("BPA_APPLICANT_DETAILS_HEADER"),
      values: values,
    };
  };

  // Lightweight date formatter to avoid dependency on date-fns here.
  // Accepts a timestamp (number or string) or a Date — returns 'dd/MM/yyyy' or empty string.
  const formatDate = (input) => {
    if (input === null || input === undefined || input === "") return "";
    const date = input instanceof Date ? input : new Date(Number(input));
    if (!date || isNaN(date.getTime())) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const getBasicDetails = (BPA, edcr, t) => {
    const values = [
        {
          title: t("BPA_BASIC_DETAILS_APP_DATE_LABEL"),
          value: BPA?.auditDetails?.createdTime ? formatDate(BPA?.auditDetails?.createdTime) : "",
        },
        { title: t("BPA_BASIC_DETAILS_APPLICATION_TYPE_LABEL"), value: t(`WF_BPA_${edcr?.appliactionType}`) },
        { title: t("BPA_BASIC_DETAILS_SERVICE_TYPE_LABEL"), value: t(edcr?.applicationSubType) },
        { title: t("BPA_BASIC_DETAILS_OCCUPANCY_LABEL"), value: t(edcr?.planDetail?.planInformation?.occupancy) },
        { title: t("BPA_BASIC_DETAILS_RISK_TYPE_LABEL"), value: t(`${BPA?.additionalDetails?.riskType}`), isInsert: true },
        { title: t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL"), value: edcr?.planDetail?.planInformation?.applicantName },
      ]

    return {
      title: t("BPA_BASIC_DETAILS_TITLE"),
      values: values,
    };
  };

  const getplotDetails = (BPA, edcr, t) => {
    const values = [
        {
          title: t("BPA_BOUNDARY_PLOT_AREA_LABEL"),
          value: t(`${edcr?.planDetail?.planInformation?.plotArea}`),
          isNotTranslated: true,
          isUnit: "BPA_SQ_MTRS_LABEL",
        },
        { title: t("BPA_PLOT_NUMBER_LABEL"), value: edcr?.planDetail?.planInformation?.plotNo || "NA", isNotTranslated: true },
        { title: t("BPA_KHATHA_NUMBER_LABEL"), value: edcr?.planDetail?.planInformation?.khatuniNo || "NA", isNotTranslated: true },
        // { title: t("BPA_HOLDING_NUMBER_LABEL"), value: BPA?.additionalDetails?.holdingNo || "NA", isNotTranslated: true },
        { title: t("BPA_IS_PROPERTY_AVAILABLE_LABEL"), value: BPA?.additionalDetails?.isPropertyAvailable ? "YES" : "NO", isNotTranslated: true },
        ...(BPA?.additionalDetails?.propertyuid ? [{ title: t("PROPERTY_ID"), value: BPA?.additionalDetails?.propertyuid || "NA", isNotTranslated: true }] : []),
        { title: t("BPA_IS_CLUBBED_PLOT_LABEL"), value: BPA?.additionalDetails?.isClubbedPlot ? "YES" : "NO", isNotTranslated: true },
        ...(BPA?.additionalDetails?.isSelfCertification != null ? [{ title: t("BPA_IS_SELF_CERTIFICATION_REQUIRED"), value: BPA?.additionalDetails?.isSelfCertification? "YES" : "NO" , isNotTranslated: true }] : []),
        { title: t("BPA_BOUNDARY_LAND_REG_DETAIL_LABEL"), value: BPA?.additionalDetails?.registrationDetails || "NA", isNotTranslated: true },
        { title: t("BPA_BOUNDARY_WALL_LENGTH_LABEL"), value: BPA?.additionalDetails?.boundaryWallLength || "NA", isNotTranslated: true },
        { title: t("BPA_DETAILS_PIN_LABEL"), value: BPA?.landInfo?.address?.pincode },
        { title: t("BPA_CITY_LABEL"), value: BPA?.landInfo?.address?.city },
        { title: t("BPA_LOC_MOHALLA_LABEL"), value: BPA?.landInfo?.address?.locality?.name },
        { title: t("BPA_LAT"), value: BPA?.landInfo?.address?.geoLocation?.latitude ? BPA?.landInfo?.address?.geoLocation?.latitude?.toFixed(6)?.toString() : "NA" },
        { title: t("BPA_LONG"), value: BPA?.landInfo?.address?.geoLocation?.longitude ? BPA?.landInfo?.address?.geoLocation?.longitude?.toFixed(6)?.toString() : "NA" },
        { title: t("BPA_WARD_NUMBER_LABEL"), value: BPA?.additionalDetails?.wardnumber || "NA", isNotTranslated: true },
        { title: t("BPA_ZONE_NUMBER_LABEL"), value: BPA?.additionalDetails?.zonenumber?.name || BPA?.additionalDetails?.zonenumber || "NA", isNotTranslated: true },
        { title: t("BPA_KHASRA_NUMBER_LABEL"), value: BPA?.additionalDetails?.khasraNumber || "NA", isNotTranslated: true },
        { title: t("BPA_ARCHITECT_ID"), value: BPA?.additionalDetails?.architectid || "NA", isNotTranslated: true },
        { title: t("BPA_NUMBER_OF_BATHS"), value: BPA?.additionalDetails?.bathnumber || "NA", isNotTranslated: true },
        { title: t("BPA_NUMBER_OF_KITCHENS"), value: BPA?.additionalDetails?.kitchenNumber || "NA", isNotTranslated: true },
        { title: t("BPA_APPROX_INHABITANTS_FOR_ACCOMODATION"), value: BPA?.additionalDetails?.approxinhabitants || "NA", isNotTranslated: true },
        { title: t("BPA_DISTANCE_FROM_SEWER"), value: BPA?.additionalDetails?.distancefromsewer || "NA", isNotTranslated: true },
        { title: t("BPA_SOURCE_OF_WATER"), value: BPA?.additionalDetails?.sourceofwater || "NA", isNotTranslated: true },
        { title: t("BPA_NUMBER_OF_WATER_CLOSETS"), value: BPA?.additionalDetails?.watercloset || "NA", isNotTranslated: true },
        { title: t("BPA_MATERIAL_TO_BE_USED_IN_WALLS"), value: BPA?.additionalDetails?.materialused || "NA", isNotTranslated: true },
        { title: t("BPA_MATERIAL_TO_BE_USED_IN_FLOOR"), value: BPA?.additionalDetails?.materialusedinfloor || "NA", isNotTranslated: true },
        { title: t("BPA_MATERIAL_TO_BE_USED_IN_ROOFS"), value: BPA?.additionalDetails?.materialusedinroofs || "NA", isNotTranslated: true },
        { title: t("BPA_ESTIMATED_COST_LABEL"), value: BPA?.additionalDetails?.estimatedCost || "NA", isNotTranslated: true },
      ]

    return {
      title: t("BPA_PLOT_AND_SITE_DETAILS_TITLE"),
      values: values,
    };
  };
  
  const getAdditionalDetails = (BPA, edcr, t) => {
    const values = [
        { title: t("BPA_ULB_NAME"), value: BPA?.additionalDetails?.UlbName || "NA", isNotTranslated: true },
        { title: t("BPA_ULB_TYPE"), value: BPA?.additionalDetails?.Ulblisttype || "NA", isNotTranslated: true },
        { title: t("BPA_DISTRICT"), value: BPA?.additionalDetails?.District || "NA", isNotTranslated: true },
        { title: t("BPA_APPROVED_COLONY"), value: BPA?.additionalDetails?.approvedColony || "NA", isNotTranslated: true },
        ...(BPA?.additionalDetails?.approvedColony === "YES"
          ? [{ title: t("BPA_APPROVED_COLONY_NAME"), value: BPA?.additionalDetails?.nameofApprovedcolony || "NA", isNotTranslated: true }]
          : []),
        ...(BPA?.additionalDetails?.approvedColony === "NO"
          ? [
            { title: t("BPA_NOC_NUMBER"), value: BPA?.additionalDetails?.NocNumber || "NA", isNotTranslated: true },
            { title: t("BPA_NOC_APPLICANT_NAME"), value: BPA?.additionalDetails?.nocObject?.applicantOwnerOrFirmName || "NA", isNotTranslated: true },
            { title: t("BPA_NOC_ULB_NAME"), value: BPA?.additionalDetails?.nocObject?.ulbName || "NA", isNotTranslated: true },
            { title: t("BPA_NOC_ULB_TYPE"), value: BPA?.additionalDetails?.nocObject?.ulbType || "NA", isNotTranslated: true },
            { title: t("BPA_NOC_APPROVED_ON"), value: nocApprovedDate || "NA", isNotTranslated: true },
          ]
          : []),
        // { title: t("BPA_NOC_NUMBER"), value: BPA?.additionalDetails?.NocNumber || "NA", isNotTranslated: true },
        { title: t("BPA_MASTER_PLAN"), value: BPA?.additionalDetails?.masterPlan || "NA", isNotTranslated: true },
        ...(BPA?.additionalDetails?.masterPlan === "YES"
          ? [{ title: t("BPA_USE"), value: BPA?.additionalDetails?.use || "NA", isNotTranslated: true }]
          : []),
        { title: t("BPA_PURCHASED_FAR"), value: BPA?.additionalDetails?.purchasedFAR ? "YES" : "NO", isNotTranslated: true },
        ...(BPA?.additionalDetails?.purchasedFAR
          ? [
            { title: t("BPA_PROVIDED_FAR"), value: BPA?.additionalDetails?.providedFAR || "NA", isNotTranslated: true },
            { title: t("BPA_ALLOWED_PROVIDED_FAR"), value: BPA?.additionalDetails?.purchasableFAR || "NA", isNotTranslated: true },
          ]
          : []),
        { title: t("BPA_PERMISSIBLE_FAR"), value: BPA?.additionalDetails?.permissableFar || "NA", isNotTranslated: true },
        { title: t("BPA_FAR_ACHIEVED"), value: BPA?.additionalDetails?.achievedFar || "NA", isNotTranslated: true },
        { title: t("BPA_ECS_REQUIRED"), value: BPA?.additionalDetails?.ecsRequired || "NA", isNotTranslated: true },
        { title: t("BPA_ECS_PROVIDED"), value: BPA?.additionalDetails?.ecsProvided || "NA", isNotTranslated: true },
        { title: t("BPA_GREEN_BUIDINGS"), value: BPA?.additionalDetails?.greenbuilding || "NA", isNotTranslated: true },
        ...(BPA?.additionalDetails?.greenbuilding === "YES"
          ? [{ title: t("BPA_SELECTED_RATINGS"), value: BPA?.additionalDetails?.rating || "NA", isNotTranslated: true }]
          : []),
        { title: t("BPA_RESTRICTED_AREA"), value: BPA?.additionalDetails?.restrictedArea || "NA", isNotTranslated: true },
        { title: t("BPA_PROPOSED_SITE_TYPE"), value: BPA?.additionalDetails?.proposedSite || "NA", isNotTranslated: true },
        { title: t("ECBC - Proposed Connected Electrical Load is above 100 Kw"), value: BPA?.additionalDetails?.ecbcElectricalLoad || "NA", isNotTranslated: true },
        { title: t("ECBC - Proposed Demand of Electrical Load is above 120 Kw"), value: BPA?.additionalDetails?.ecbcDemandLoad || "NA", isNotTranslated: true },
        { title: t("ECBC - Proposed Air Conditioned Area above 500 sq.mt"), value: BPA?.additionalDetails?.ecbcAirConditioned || "NA", isNotTranslated: true },

      ]

    return {
      title: t("BPA_ADDITIONAL_BUILDING_DETAILS"),
      values: values,
    };
  };
  

  const getBPAAcknowledgement = async (application, tenantInfo, t, ulbType, ulbName, edcr) => {
    const user = Digit.UserService.getUser();
    const stateCode = Digit.ULBService.getStateId();

    let OwnerPhoto = "";
    let primaryOwner = application?.landInfo?.owners?.find((owner) => owner?.isPrimaryOwner === true);
    const ownerPhotoId = primaryOwner?.additionalDetails?.ownerPhoto || null;
    if (ownerPhotoId) {
      const result = await Digit.UploadServices.Filefetch([ownerPhotoId], stateCode);
      if (result?.data?.fileStoreIds) OwnerPhoto = result?.data?.fileStoreIds[0]?.url;
    } 

    

    return {
      t: t,
      tenantId: tenantInfo?.code,
      name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
      email: tenantInfo?.emailId,
      phoneNumber: tenantInfo?.contactNumber,
      heading: t("NEW_BUILD_PERMIT_APPLICATION"),
      applicationNumber: application?.applicationNo || "NA",
      details: [
        getApplicationNumberDetails(application, t),
        getOwnerDetails(application, t),
        getBasicDetails(application, edcr, t),
        getplotDetails(application, edcr, t),
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
        getAdditionalDetails(application, edcr, t),
        // {
        //   title: t("BPA_NEW_TRADE_DETAILS_HEADER_DETAILS"),
        //   values: [
        //     {
        //       title: t("BPA_DETAILS_PIN_LABEL"),
        //       value: application?.landInfo?.address?.pincode || "NA",
        //     },
        //     {
        //       title: t("BPA_CITY_LABEL"),
        //       value: application?.landInfo?.address?.city || "NA",
        //     },
        //     {
        //       title: t("BPA_LOC_MOHALLA_LABEL"),
        //       value: application?.landInfo?.address?.locality?.name || "NA",
        //     },
        //     // {
        //     //     title: t("BPA_DETAILS_SRT_NAME_LABEL"),
        //     //     value: application?.landInfo?.address?.street || "NA"
        //     // },
        //     // {
        //     //     title: t("ES_NEW_APPLICATION_LOCATION_LANDMARK"),
        //     //     value: application?.landInfo?.address?.landmark || "NA"
        //     // }
        //   ],
        // },
        // {
        //   title: t("BPA_COLONY_DETAILS"),
        //   values: [
        //     {
        //       title: t("BPA_APPROVED_COLONY"),
        //       value: application?.additionalDetails?.approvedColony || "NA",
        //     },
        //     {
        //       title: t("BPA_MASTER_PLAN"),
        //       value: application?.additionalDetails?.masterPlan || "NA",
        //     },
        //     {
        //       title: t("BPA_DISTRICT"),
        //       value: application?.additionalDetails?.District || "NA",
        //     },
        //     {
        //       title: t("BPA_ULB_NAME"),
        //       value: application?.additionalDetails?.UlbName || "NA",
        //     },
        //     {
        //       title: t("BPA_BUILDING_STATUS"),
        //       value: application?.additionalDetails?.buildingStatus || "NA",
        //     },
        //     {
        //       title: t("BPA_SCHEMES"),
        //       value: application?.additionalDetails?.schemes || "NA",
        //     },
        //     {
        //       title: t("BPA_SCHEMES_TYPE"),
        //       value: application?.additionalDetails?.schemesselection || "NA",
        //     },
        //     {
        //       title: t("BPA_PURCHASED_FAR"),
        //       value: application?.additionalDetails?.purchasedFAR || "NA",
        //     },
        //     {
        //       title: t("BPA_GREEN_BUIDINGS"),
        //       value: application?.additionalDetails?.greenbuilding || "NA",
        //     },
        //     {
        //       title: t("BPA_RESTRICTED_AREA"),
        //       value: application?.additionalDetails?.restrictedArea || "NA",
        //     },
        //     {
        //       title: t("BPA_PROPOSED_SITE_TYPE"),
        //       value: application?.additionalDetails?.proposedSite || "NA",
        //     },
        //     {
        //       title: t("BPA_CORE_AREA"),
        //       value: application?.data?.edcrDetails?.planDetail?.coreArea || "NA",
        //     },
        //   ],
        // },
      ],
      imageURL: OwnerPhoto || "",
      ulbType,
      ulbName
    };
  };
  export default getBPAAcknowledgement;