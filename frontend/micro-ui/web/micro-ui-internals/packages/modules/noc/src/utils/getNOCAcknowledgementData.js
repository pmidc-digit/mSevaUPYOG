import React from "react";
import {pdfDownloadLink, pdfDocumentName} from "./index"

const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1);
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ");

const getFloorLabel = (index, t) => {
  if (index === 0) return t("NOC_GROUND_FLOOR_AREA_LABEL");
  const suffixes = ["st", "nd", "rd"];
  const suffix = suffixes[((index - 1) % 10) - 1] || "th";
  return `${index}${suffix} ${t("NOC_FLOOR_AREA_LABEL")}`; // e.g., "1st Floor"
};

const getProfessionalDetails = (appData, t) => {
  let values = [
    {
      title: t("NOC_PROFESSIONAL_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalName,
    },
    {
      title: t("NOC_PROFESSIONAL_EMAIL_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalEmailId,
    },
    {
      title: t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalRegId,
    },
    {
      title: t("NOC_PROFESSIONAL_MOBILE_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalMobileNumber,
    },
    {
      title: t("NOC_PROFESSIONAL_ADDRESS_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.professionalAddress,
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
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantOwnerOrFirmName,
    },
    {
      title: t("NOC_APPLICANT_EMAIL_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantEmailId,
    },
    {
      title: t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantFatherHusbandName,
    },
    {
      title: t("NOC_APPLICANT_MOBILE_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantMobileNumber,
    },
    {
      title: t("NOC_APPLICANT_DOB_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantDateOfBirth,
    },
    {
      title: t("NOC_APPLICANT_GENDER_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantGender?.code,
    },
    {
      title: t("NOC_APPLICANT_ADDRESS_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.applicationDetails?.applicantAddress,
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
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.plotNo,
    },
    {
      title: t("NOC_PROPOSED_SITE_ADDRESS"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.proposedSiteAddress,
    },
    {
      title: t("NOC_ULB_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.ulbName?.name,
    },
    {
      title: t("NOC_ULB_TYPE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.ulbType,
    },
    {
      title: t("NOC_KHASRA_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.khasraNo,
    },
    {
      title: t("NOC_HADBAST_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.hadbastNo,
    },
    {
      title: t("NOC_ROAD_TYPE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.roadType?.name,
    },
    {
      title: t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.areaLeftForRoadWidening,
    },
    {
      title: t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.netPlotAreaAfterWidening,
    },
    {
      title: t("NOC_ROAD_WIDTH_AT_SITE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.roadWidthAtSite,
    },
    {
      title: t("NOC_DISTRICT_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.district?.name,
    },
    {
      title: t("NOC_ZONE_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.zone?.name,
    },
    {
      title: t("NOC_SITE_WARD_NO_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.wardNo,
    },
    {
      title: t("NOC_SITE_VILLAGE_NAME_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.villageName,
    },
    {
      title: t("NOC_BUILDING_STATUS_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus?.name,
    },
    {
      title: t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.isBasementAreaAvailable?.code,
    },
  ];

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus?.code === "BUILTUP") {
    values.push({
      title: t("NOC_BASEMENT_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.basementArea,
    });
  }

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus?.code === "BUILTUP") {
    appData?.nocDetails?.additionalDetails?.siteDetails?.floorArea?.map((floor, index) =>
      values.push({
        title: getFloorLabel(index, t),
        value: floor?.value,
      })
    );
  }

  if (appData?.nocDetails?.additionalDetails?.siteDetails?.buildingStatus?.code === "BUILTUP") {
    values.push({
      title: t("NOC_TOTAL_FLOOR_AREA_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.totalFloorArea,
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
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationPlotArea,
    },
    {
      title: t("NOC_BUILDING_CATEGORY_LABEL"),
      value: appData?.nocDetails?.additionalDetails?.siteDetails?.specificationBuildingCategory?.name,
    },
  ];

  return {
    title: t("NOC_SPECIFICATION_DETAILS"),
    values: values,
  };
};

const getDocuments = async (appData, t) => {
  const filesArray = appData?.documents?.map((value) => value?.uuid);
  const res = filesArray?.length>0 && await Digit.UploadServices.Filefetch(filesArray, Digit.ULBService.getStateId());
  console.log("res here==>", res);

  return {
    title: t("NOC_TITILE_DOCUMENT_UPLOADED"),
    values:
      appData?.documents.length > 0
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

export const getNOCAcknowledgementData = async (appData, tenantInfo, t) => {

  //console.log("appData here in ACK==", appData);

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
        getDocuments(appData,t)
    ]

    
  };
};
