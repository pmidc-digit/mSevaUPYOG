import React from "react";
import { Card, CardHeader } from "@mseva/digit-ui-react-components";

const getMohallaLocale = (value = "", tenantId = "") => {
    let convertedValue = convertDotValues(tenantId);
    if (convertedValue == "-" || !checkForNotNull(value)) {
      return "PGR_NA";
    }
    convertedValue = convertedValue.toUpperCase();
    return convertToLocale(value, `${convertedValue}_REVENUE`);
  };
   const convertDotValues = (value = "") => {
    return (
      (checkForNotNull(value) && ((value.replaceAll && value.replaceAll(".", "_")) || (value.replace && stringReplaceAll(value, ".", "_")))) || "-"
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
    if (convertedValue == "-" || !checkForNotNull(value)) {
      return "PGR_NA";
    }
    convertedValue = convertedValue.toUpperCase();
    return convertToLocale(convertedValue, `TENANT_TENANTS`);
  };
   const convertToLocale = (value = "", key = "") => {
    let convertedValue = convertDotValues(value);
    if (convertedValue == "-") {
      return "PGR_NA";
    }
    return `${key}_${convertedValue}`;
  };
  const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
  const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

  function ConvertEpochToValidityDate(dateEpoch) {
    if (dateEpoch == null || dateEpoch == undefined || dateEpoch == "") {
      return "NA";
    }
    const dateFromApi = new Date(dateEpoch);
    let month = dateFromApi.getMonth() + 1;
    let day = dateFromApi.getDate();
    let year = dateFromApi.getFullYear() - 3;
    month = (month > 9 ? "" : "0") + month;
    day = (day > 9 ? "" : "0") + day;
    return `${day}/${month}/${year}`;
  }

  const getApplicationNumberDetails = (BPA, t) => {
    let applicationDetailsInfo = {
      title: " ",
      isCommon: true,
      values: [{ title: t("BPA_APPLICATION_NUMBER_LABEL"), value: BPA?.applicationNo || "-" }],
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
            ? `${ConvertEpochToValidityDate(bpaResponse?.BPA?.[0]?.additionalDetails?.validityDate)} - ${formatDate(
              bpaResponse?.BPA?.[0]?.additionalDetails?.validityDate
            )}`
            : "-",
        },
      ];
    }

    if (BPA?.approvalNo) {
      // applicationDetailsInfo?.values?.push({
      //   title: BPA?.businessService !== "BPA_OC" ? "BPA_PERMIT_NUMBER_LABEL" : "BPA_OC_PERMIT_NUMBER_LABEL",
      //   value: BPA?.approvalNo || "-",
      // });
      applicationDetailsInfo?.values?.push({
        title: BPA?.businessService !== "BPA_OC" ? t("BPA_PERMIT_VALIDITY") : t("BPA_OC_PERMIT_VALIDITY"),
        value: BPA?.additionalDetails?.validityDate
          ? `${ConvertEpochToValidityDate(BPA?.additionalDetails?.validityDate)} - ${formatDate(
            BPA?.additionalDetails?.validityDate
          )}`
          : "-",
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
        { title: t("BPA_PLOT_NUMBER_LABEL"), value: edcr?.planDetail?.planInformation?.plotNo || "-", isNotTranslated: true },
        { title: t("BPA_KHATHA_NUMBER_LABEL"), value: edcr?.planDetail?.planInformation?.khatuniNo || "-", isNotTranslated: true },
        // { title: t("BPA_HOLDING_NUMBER_LABEL"), value: BPA?.additionalDetails?.holdingNo || "-", isNotTranslated: true },
        { title: t("BPA_IS_PROPERTY_AVAILABLE_LABEL"), value: BPA?.additionalDetails?.isPropertyAvailable ? "YES" : "NO", isNotTranslated: true },
        ...(BPA?.additionalDetails?.propertyuid ? [{ title: t("PROPERTY_ID"), value: BPA?.additionalDetails?.propertyuid || "-", isNotTranslated: true }] : []),
        { title: t("BPA_IS_CLUBBED_PLOT_LABEL"), value: BPA?.additionalDetails?.isClubbedPlot ? "YES" : "NO", isNotTranslated: true },
        ...(BPA?.additionalDetails?.isSelfCertification != null ? [{ title: t("BPA_IS_SELF_CERTIFICATION_REQUIRED"), value: BPA?.additionalDetails?.isSelfCertification? "YES" : "NO" , isNotTranslated: true }] : []),
        { title: t("BPA_BOUNDARY_LAND_REG_DETAIL_LABEL"), value: BPA?.additionalDetails?.registrationDetails || "-", isNotTranslated: true },
        { title: t("BPA_BOUNDARY_WALL_LENGTH_LABEL"), value: BPA?.additionalDetails?.boundaryWallLength || "-", isNotTranslated: true },
        { title: t("BPA_DETAILS_PIN_LABEL"), value: BPA?.landInfo?.address?.pincode },
        { title: t("BPA_CITY_LABEL"), value: BPA?.landInfo?.address?.city },
        { title: t("BPA_LOC_MOHALLA_LABEL"), value: BPA?.landInfo?.address?.locality?.name },
        { title: t("BPA_LAT"), value: BPA?.landInfo?.address?.geoLocation?.latitude ? BPA?.landInfo?.address?.geoLocation?.latitude?.toFixed(6)?.toString() : "-" },
        { title: t("BPA_LONG"), value: BPA?.landInfo?.address?.geoLocation?.longitude ? BPA?.landInfo?.address?.geoLocation?.longitude?.toFixed(6)?.toString() : "-" },
        { title: t("BPA_WARD_NUMBER_LABEL"), value: BPA?.additionalDetails?.wardnumber || "-", isNotTranslated: true },
        { title: t("BPA_ZONE_NUMBER_LABEL"), value: BPA?.additionalDetails?.zonenumber?.name || BPA?.additionalDetails?.zonenumber || "-", isNotTranslated: true },
        { title: t("BPA_KHASRA_NUMBER_LABEL"), value: BPA?.additionalDetails?.khasraNumber || "-", isNotTranslated: true },
        { title: t("BPA_ARCHITECT_ID"), value: BPA?.additionalDetails?.architectid || "-", isNotTranslated: true },
        { title: t("BPA_NUMBER_OF_BATHS"), value: BPA?.additionalDetails?.bathnumber || "-", isNotTranslated: true },
        { title: t("BPA_NUMBER_OF_KITCHENS"), value: BPA?.additionalDetails?.kitchenNumber || "-", isNotTranslated: true },
        { title: t("BPA_APPROX_INHABITANTS_FOR_ACCOMODATION"), value: BPA?.additionalDetails?.approxinhabitants || "-", isNotTranslated: true },
        { title: t("BPA_DISTANCE_FROM_SEWER"), value: BPA?.additionalDetails?.distancefromsewer || "-", isNotTranslated: true },
        { title: t("BPA_SOURCE_OF_WATER"), value: BPA?.additionalDetails?.sourceofwater || "-", isNotTranslated: true },
        { title: t("BPA_NUMBER_OF_WATER_CLOSETS"), value: BPA?.additionalDetails?.watercloset || "-", isNotTranslated: true },
        { title: t("BPA_MATERIAL_TO-BE_USED_IN_WALLS"), value: BPA?.additionalDetails?.materialused || "-", isNotTranslated: true },
        { title: t("BPA_MATERIAL_TO-BE_USED_IN_FLOOR"), value: BPA?.additionalDetails?.materialusedinfloor || "-", isNotTranslated: true },
        { title: t("BPA_MATERIAL_TO-BE_USED_IN_ROOFS"), value: BPA?.additionalDetails?.materialusedinroofs || "-", isNotTranslated: true },
        { title: t("BPA_ESTIMATED_COST_LABEL"), value: BPA?.additionalDetails?.estimatedCost || "-", isNotTranslated: true },
      ]

    return {
      title: t("BPA_PLOT_AND_SITE_DETAILS_TITLE"),
      values: values,
    };
  };
  
  const getAdditionalDetails = (BPA, edcr, t) => {
    const values = [
        { title: t("BPA_ULB_NAME"), value: BPA?.additionalDetails?.UlbName || "-", isNotTranslated: true },
        { title: t("BPA_ULB_TYPE"), value: BPA?.additionalDetails?.Ulblisttype || "-", isNotTranslated: true },
        { title: t("BPA_DISTRICT"), value: BPA?.additionalDetails?.District || "-", isNotTranslated: true },
        { title: t("BPA_APPROVED_COLONY"), value: BPA?.additionalDetails?.approvedColony || "-", isNotTranslated: true },
        ...(BPA?.additionalDetails?.approvedColony === "YES"
          ? [{ title: t("BPA_APPROVED_COLONY_NAME"), value: BPA?.additionalDetails?.nameofApprovedcolony || "-", isNotTranslated: true }]
          : []),
        ...(BPA?.additionalDetails?.approvedColony === "NO"
          ? [
            { title: t("BPA_NOC_NUMBER"), value: BPA?.additionalDetails?.NocNumber || "-", isNotTranslated: true },
            { title: t("BPA_NOC_APPLICANT_NAME"), value: BPA?.additionalDetails?.nocObject?.applicantOwnerOrFirmName || "-", isNotTranslated: true },
            { title: t("BPA_NOC_ULB_NAME"), value: BPA?.additionalDetails?.nocObject?.ulbName || "-", isNotTranslated: true },
            { title: t("BPA_NOC_ULB_TYPE"), value: BPA?.additionalDetails?.nocObject?.ulbType || "-", isNotTranslated: true },
            { title: t("BPA_NOC_APPROVED_ON"), value: nocApprovedDate || "-", isNotTranslated: true },
          ]
          : []),
        // { title: t("BPA_NOC_NUMBER"), value: BPA?.additionalDetails?.NocNumber || "-", isNotTranslated: true },
        { title: t("BPA_MASTER_PLAN"), value: BPA?.additionalDetails?.masterPlan || "-", isNotTranslated: true },
        ...(BPA?.additionalDetails?.masterPlan === "YES"
          ? [{ title: t("BPA_USE"), value: BPA?.additionalDetails?.use || "-", isNotTranslated: true }]
          : []),
        { title: t("BPA_PURCHASED_FAR"), value: BPA?.additionalDetails?.purchasedFAR ? "YES" : "NO", isNotTranslated: true },
        ...(BPA?.additionalDetails?.purchasedFAR
          ? [
            { title: t("BPA_PROVIDED_FAR"), value: BPA?.additionalDetails?.providedFAR || "-", isNotTranslated: true },
            { title: t("BPA_ALLOWED_PROVIDED_FAR"), value: BPA?.additionalDetails?.purchasableFAR || "-", isNotTranslated: true },
          ]
          : []),
        { title: t("BPA_PERMISSIBLE_FAR"), value: BPA?.additionalDetails?.permissableFar || "-", isNotTranslated: true },
        { title: t("BPA_FAR_ACHIEVED"), value: BPA?.additionalDetails?.achievedFar || "-", isNotTranslated: true },
        { title: t("BPA_ECS_REQUIRED"), value: BPA?.additionalDetails?.ecsRequired || "-", isNotTranslated: true },
        { title: t("BPA_ECS_PROVIDED"), value: BPA?.additionalDetails?.ecsProvided || "-", isNotTranslated: true },
        { title: t("BPA_GREEN_BUIDINGS"), value: BPA?.additionalDetails?.greenbuilding || "-", isNotTranslated: true },
        ...(BPA?.additionalDetails?.greenbuilding === "YES"
          ? [{ title: t("BPA_SELECTED_RATINGS"), value: BPA?.additionalDetails?.rating || "-", isNotTranslated: true }]
          : []),
        { title: t("BPA_RESTRICTED_AREA"), value: BPA?.additionalDetails?.restrictedArea || "-", isNotTranslated: true },
        { title: t("BPA_PROPOSED_SITE_TYPE"), value: BPA?.additionalDetails?.proposedSite || "-", isNotTranslated: true },
        { title: t("ECBC - Proposed Connected Electrical Load is above 100 Kw"), value: BPA?.additionalDetails?.ecbcElectricalLoad || "-", isNotTranslated: true },
        { title: t("ECBC - Proposed Demand of Electrical Load is above 120 Kw"), value: BPA?.additionalDetails?.ecbcDemandLoad || "-", isNotTranslated: true },
        { title: t("ECBC - Proposed Air Conditioned Area above 500 sq.mt"), value: BPA?.additionalDetails?.ecbcAirConditioned || "-", isNotTranslated: true },

      ]

    return {
      title: t("BPA_ADDITIONAL_BUILDING_DETAILS"),
      values: values,
    };
  };
  
  const getScrutinyDetails = (BPA, edcr, t) => {
    const values = [
        //   { title: t("BPA_EDCR_DETAILS"), value: " ", isHeader: true },
          { title: BPA?.businessService !== "BPA_OC" ? t("BPA_EDCR_NO_LABEL") : t("BPA_OC_EDCR_NO_LABEL"), value: BPA?.edcrNumber || "-" },
        ]

    return {
      title: t("BPA_STEPPER_SCRUTINY_DETAILS_HEADER"),
      values: values,
    };
  };
  
  const getBuildingExtractionDetails = (BPA, edcr, t) => {
    const values = [
        //   {
        //     title: BPA?.businessService !== "BPA_OC" ? t("BPA_BUILDING_EXTRACT_HEADER") : t("BPA_ACTUAL_BUILDING_EXTRACT_HEADER"),
        //     value: " ",
        //     isHeader: true,
        //   },
          { title: t("BPA_TOTAL_BUILT_UP_AREA_HEADER"), value: Number(edcr?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea).toFixed(2), isUnit: "BPA_SQ_MTRS_LABEL" },
          { title: t("BPA_SCRUTINY_DETAILS_NUMBER_OF_FLOORS_LABEL"), value: edcr?.planDetail?.blocks?.[0]?.building?.totalFloors || "-" },
          { title: t("BPA_HEIGHT_FROM_GROUND_LEVEL"), value: Number(edcr?.planDetail?.blocks?.[0]?.building?.buildingHeight).toFixed(2), isUnit: "BPA_MTRS_LABEL" },
        ]

    return {
      title: t("Building Extraction Details"),
      values: values,
    };
  };
  
  const getDemolitionAreaDetails = (BPA, edcr, t) => {
    const values = [
        //   { title: t("BPA_APP_DETAILS_DEMOLITION_DETAILS_LABEL"), value: " ", isHeader: true },
          { title: t("BPA_APPLICATION_DEMOLITION_AREA_LABEL"), value: edcr?.planDetail?.planInformation?.demolitionArea || "-", isUnit: "BPA_SQ_MTRS_LABEL" },
        ]

    return {
      title: t("Demolition Area Details"),
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
      applicationNumber: application?.applicationNo || "-",
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
              value: user?.info?.name || "-",
            },
            {
              title: t("BPA_ARCHITECT_MOBILE_NUMBER"),
              value: user?.info?.mobileNumber || "-",
            },
            {
              title: t("BPA_ARCHITECT_ID"),
              value: application?.additionalDetails?.architectid || "-",
            },
            {
              title: t("BPA_ARCHITECT_EMAIL"),
              value: user?.info?.emailId || "-",
            },
          ],
        },
        getAdditionalDetails(application, edcr, t),
        getScrutinyDetails(application, edcr, t),
        getBuildingExtractionDetails(application, edcr, t),
        getDemolitionAreaDetails(application, edcr, t),
        // {
        //   title: t("BPA_NEW_TRADE_DETAILS_HEADER_DETAILS"),
        //   values: [
        //     {
        //       title: t("BPA_DETAILS_PIN_LABEL"),
        //       value: application?.landInfo?.address?.pincode || "-",
        //     },
        //     {
        //       title: t("BPA_CITY_LABEL"),
        //       value: application?.landInfo?.address?.city || "-",
        //     },
        //     {
        //       title: t("BPA_LOC_MOHALLA_LABEL"),
        //       value: application?.landInfo?.address?.locality?.name || "-",
        //     },
        //     // {
        //     //     title: t("BPA_DETAILS_SRT_NAME_LABEL"),
        //     //     value: application?.landInfo?.address?.street || "-"
        //     // },
        //     // {
        //     //     title: t("ES_NEW_APPLICATION_LOCATION_LANDMARK"),
        //     //     value: application?.landInfo?.address?.landmark || "-"
        //     // }
        //   ],
        // },
        // {
        //   title: t("BPA_COLONY_DETAILS"),
        //   values: [
        //     {
        //       title: t("BPA_APPROVED_COLONY"),
        //       value: application?.additionalDetails?.approvedColony || "-",
        //     },
        //     {
        //       title: t("BPA_MASTER_PLAN"),
        //       value: application?.additionalDetails?.masterPlan || "-",
        //     },
        //     {
        //       title: t("BPA_DISTRICT"),
        //       value: application?.additionalDetails?.District || "-",
        //     },
        //     {
        //       title: t("BPA_ULB_NAME"),
        //       value: application?.additionalDetails?.UlbName || "-",
        //     },
        //     {
        //       title: t("BPA_BUILDING_STATUS"),
        //       value: application?.additionalDetails?.buildingStatus || "-",
        //     },
        //     {
        //       title: t("BPA_SCHEMES"),
        //       value: application?.additionalDetails?.schemes || "-",
        //     },
        //     {
        //       title: t("BPA_SCHEMES_TYPE"),
        //       value: application?.additionalDetails?.schemesselection || "-",
        //     },
        //     {
        //       title: t("BPA_PURCHASED_FAR"),
        //       value: application?.additionalDetails?.purchasedFAR || "-",
        //     },
        //     {
        //       title: t("BPA_GREEN_BUIDINGS"),
        //       value: application?.additionalDetails?.greenbuilding || "-",
        //     },
        //     {
        //       title: t("BPA_RESTRICTED_AREA"),
        //       value: application?.additionalDetails?.restrictedArea || "-",
        //     },
        //     {
        //       title: t("BPA_PROPOSED_SITE_TYPE"),
        //       value: application?.additionalDetails?.proposedSite || "-",
        //     },
        //     {
        //       title: t("BPA_CORE_AREA"),
        //       value: application?.data?.edcrDetails?.planDetail?.coreArea || "-",
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