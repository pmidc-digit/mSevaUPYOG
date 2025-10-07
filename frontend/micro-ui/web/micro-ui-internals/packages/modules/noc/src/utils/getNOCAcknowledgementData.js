import React from "react";
import {pdfDownloadLink, pdfDocumentName} from "./index"

const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

const getFloorLabel = (index, t) => {
  if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL");

  const floorNumber = index;
  const lastDigit = floorNumber % 10;
  const lastTwoDigits = floorNumber % 100;

  let suffix = "th";
  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    if (lastDigit === 1) suffix = "st";
    else if (lastDigit === 2) suffix = "nd";
    else if (lastDigit === 3) suffix = "rd";
  }

  return `${floorNumber}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`;
};

const getProfessionalDetails = (appData, t) => {
  let values = [
    {
      title: t("NOC_PROFESSIONAL_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalName || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_EMAIL_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalEmailId || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalRegId || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_MOBILE_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalMobileNumber || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_ADDRESS_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalAddress || "N/A",
    },
  ];

  return {
    title: t("NOC_PROFESSIONAL_DETAILS"),
    values: values,
  };
};

const getApplicantDetails = (appData, t) => {
  let values = [
    {
      title: t("NOC_FIRM_OWNER_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantOwnerOrFirmName || "N/A",
    },
    {
      title: t("NOC_APPLICANT_EMAIL_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantEmailId || "N/A", 
    },
    {
      title: t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantFatherHusbandName || "N/A",
    },
    {
      title: t("NOC_APPLICANT_MOBILE_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantMobileNumber || "N/A",
    },
    {
      title: t("NOC_APPLICANT_DOB_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantDateOfBirth || "N/A",
    },
    {
      title: t("NOC_APPLICANT_GENDER_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantGender?.code || 
      appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantGender || "N/A",
    },
    {
      title: t("NOC_APPLICANT_ADDRESS_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantAddress || "N/A",
    },
    {
      title: t("NOC_APPLICANT_PROPERTY_ID_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantPropertyId || "N/A",
    },
  ];

  return {
    title: t("NOC_APPLICANT_DETAILS"),
    values: values,
  };
};

const getSiteDetails = (appData, t) => {
  let values = [
    {
      title: t("NOC_PLOT_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.plotNo || "N/A",
    },
    {
      title: t("NOC_PROPOSED_SITE_ADDRESS"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.proposedSiteAddress || "N/A",
    },
    {
      title: t("NOC_ULB_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.ulbName?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.ulbName || "N/A",
    },
    {
      title: t("NOC_ULB_TYPE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.ulbType || "N/A",
    },
    {
      title: t("NOC_KHASRA_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.khasraNo || "N/A",
    },
    {
      title: t("NOC_HADBAST_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.hadbastNo || "N/A",
    },
    {
      title: t("NOC_ROAD_TYPE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.roadType?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.roadType || "N/A",
    },
    {
      title: t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.areaLeftForRoadWidening || "N/A",
    },
    {
      title: t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.netPlotAreaAfterWidening || "N/A",
    },
    {
      title: t("NOC_NET_TOTAL_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.netTotalArea || "N/A",
    },
    {
      title: t("NOC_ROAD_WIDTH_AT_SITE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.roadWidthAtSite || "N/A",
    },
    {
      title: t("NOC_DISTRICT_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.district?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.district || "N/A",
    },
    {
      title: t("NOC_ZONE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.zone?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.zone || "N/A",
    },
    {
      title: t("NOC_SITE_WARD_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.wardNo || "N/A",
    },
    {
      title: t("NOC_SITE_VILLAGE_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.villageName || "N/A",
    },
    {
      title: t("NOC_SITE_COLONY_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.colonyName || "N/A",
    },
    {
      title: t("NOC_SITE_VASIKA_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.vasikaNumber || "N/A",
    },
    {
      title: t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.khewatAndKhatuniNo || "N/A",
    },
    {
      title: t("NOC_BUILDING_STATUS_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus || "N/A",
    },
    {
      title: t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.isBasementAreaAvailable?.code ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.isBasementAreaAvailable || "N/A",
    },
  ];

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus == "Built Up") {
    values.push({
      title: t("NOC_BASEMENT_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.basementArea || "N/A",
    });
  }

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus == "Built UP") {
    appData?.nocDetails?.additionalDetails?.siteDetails?.floorArea?.map((floor, index) =>
      values.push({
        title: getFloorLabel(index, t),
        value: floor?.value,
      })
    );
  }

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus == "Built Up") {
    values.push({
      title: t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.totalFloorArea || "N/A",
    });
  }

  return {
    title: t("NOC_SITE_DETAILS"),
    values: values,
  };
};

const getSpecificationDetails = (appData, t) => {
  let values = [
    {
      title: t("NOC_PLOT_AREA_JAMA_BANDI_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationPlotArea || "N/A",
    },
    {
      title: t("NOC_BUILDING_CATEGORY_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationBuildingCategory?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.specificationBuildingCategory  || "N/A",
    },
    {
      title: t("NOC_NOC_TYPE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationNocType?.name ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.specificationNocType ||  "N/A",
    },
    {
      title: t("NOC_RESTRICTED_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationRestrictedArea?.code ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.specificationRestrictedArea || "N/A",
    },
    {
      title: t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationIsSiteUnderMasterPlan?.code ||
      appData?.nocDetails?.additionalDetails?.siteDetails?.specificationIsSiteUnderMasterPlan || "N/A",
    },
  ];

  return {
    title: t("NOC_SPECIFICATION_DETAILS"),
    values: values,
  };
};

const getCoordinateDetails = (appData, t) => {
  let values = [
    {
      title: t("COMMON_LATITUDE1_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.coordinates?.Latitude1 || "N/A",
    },
    {
      title: t("COMMON_LONGITUDE1_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.coordinates?.Longitude1  || "N/A",
    },
    {
      title: t("COMMON_LATITUDE2_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.coordinates?.Latitude2 ||  "N/A",
    },
    {
      title: t("COMMON_LONGITUDE2_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.coordinates?.Longitude2 || "N/A",
    },
  ];

  return {
    title: t("NOC_SITE_COORDINATES_LABEL"),
    values: values,
  };
};

const getDocuments = async (appData, t) => {
  const filesArray = appData?.documents?.map((value) => value?.uuid);
  const res = filesArray?.length>0 && await Digit.UploadServices.Filefetch(filesArray, Digit.ULBService.getStateId());
  //console.log("res here==>", res);

  return {
    title: t("NOC_TITILE_DOCUMENT_UPLOADED"),
    values:
      appData?.documents?.length > 0
        ? appData.documents.map((document, index) => {
            let documentLink = pdfDownloadLink(res?.data, document?.uuid);
            //   let documentName= pdfDocumentName(documentLink, index)
            console.log("doc link", documentLink);

            return {
              title: t(document?.documentType || t("CS_NA")),
              value: pdfDocumentName(documentLink, index) || t("CS_NA"),
            };
          })
        : {
            title: t("PT_NO_DOCUMENTS"),
            value: " ",
          },
  };
};

export const getNOCAcknowledgementData = async (applicationDetails, tenantInfo, t) => {

  const appData=applicationDetails || {};
  console.log("appData here in DownloadACK", appData);

  let detailsArr=[];

  if(appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalName)detailsArr.push(getProfessionalDetails(appData, t),)

  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: `${t(tenantInfo?.i18nKey)} ${ulbCamel(t(`ULBGRADE_${tenantInfo?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`))}`,
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("NOC_REGISTRATION_CERTIFICATE"),
    applicationNumber: appData?.applicationNo || "NA",
    details: [
        ...detailsArr,
        getApplicantDetails(appData, t),
        getSiteDetails(appData, t), 
        getSpecificationDetails(appData, t),
        getCoordinateDetails(appData,t),
        getDocuments(appData,t)
    ]

    
  };
};
