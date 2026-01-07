import React from "react";
import {pdfDocumentName, pdfDownloadLink} from "./index"
import {Loader} from "@mseva/digit-ui-react-components";

const capitalize = (text) => text.substr(0, 1).toUpperCase() + text.substr(1)
const ulbCamel = (ulb) => ulb.toLowerCase().split(" ").map(capitalize).join(" ")

const getFloorLabel = (index, t) => {
  if (index === 0) return t("LAYOUT_GROUND_FLOOR_AREA_LABEL")

  const floorNumber = index
  const lastDigit = floorNumber % 10
  const lastTwoDigits = floorNumber % 100

  let suffix = "th"
  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    if (lastDigit === 1) suffix = "st"
    else if (lastDigit === 2) suffix = "nd"
    else if (lastDigit === 3) suffix = "rd"
  }

  return `${floorNumber}${suffix} ${t("LAYOUT_FLOOR_AREA_LABEL")}`
}

const getRegistrationDetails = (appData, t) => {
  const values = [
    {
      title: t("CS_APPLICATION_NUMBER"),
      value: appData?.applicationNo || "N/A",
    },
    {
      title: t("REGISTRATION_FILED_DATE"),
      value: Digit.DateUtils.ConvertTimestampToDate(appData?.auditDetails?.createdTime, "dd/MM/yyyy") || "NA",
    },
  ]

  return {
    title: t("CS_APPLICATION_DETAILS"),
    values: values,
  }
}

const getProfessionalDetails = (appData, t) => {
  const values = [
    {
      title: t("NOC_PROFESSIONAL_NAME_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalName || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_EMAIL_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalEmailId || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_REGISTRATION_ID_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalRegId || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_MOBILE_NO_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalMobileNumber || "N/A",
    },
    {
      title: t("NOC_PROFESSIONAL_ADDRESS_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalAddress || "N/A",
    },
  ]

  return {
    title: t("NOC_PROFESSIONAL_DETAILS"),
    values: values,
  }
}

const getApplicantDetails = (appData, t) => {
  const values = [
    {
      title: t("NOC_FIRM_OWNER_NAME_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.applicantOwnerOrFirmName || "N/A",
    },
    {
      title: t("NOC_APPLICANT_EMAIL_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.applicantEmailId || "N/A",
    },
    {
      title: t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL"),
      value: appData?.owners?.[0]?.fatherOrHusbandName || "Not Provided",
    },
    {
      title: t("NOC_APPLICANT_MOBILE_NO_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.applicantMobileNumber || "N/A",
    },
    {
      title: t("NOC_APPLICANT_DOB_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.applicantDateOfBirth || "N/A",
    },
    {
      title: t("NOC_APPLICANT_GENDER_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.applicationDetails?.applicantGender?.code ||
        appData?.layoutDetails?.additionalDetails?.applicationDetails?.applicantGender ||
        "N/A",
    },
    {
      title: t("NOC_APPLICANT_ADDRESS_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.applicationDetails?.applicantAddress || "N/A",
    }
  ]

  return {
    title: t("NOC_APPLICANT_DETAILS"),
    values: values,
  }
}

const getSiteDetails = (appData, t) => {
  const values = [
    {
      title: t("NOC_PLOT_NO_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.plotNo || "N/A",
    },
    {
      title: t("NOC_PROPOSED_SITE_ADDRESS"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.proposedSiteAddress || "N/A",
    },
    {
      title: t("NOC_ULB_NAME_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.ulbName?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.ulbName ||
        "N/A",
    },
    {
      title: t("NOC_ULB_TYPE_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.ulbType || "N/A",
    },
    {
      title: t("NOC_KHASRA_NO_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.khasraNo || "N/A",
    },
    {
      title: t("NOC_HADBAST_NO_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.hadbastNo || "N/A",
    },
    {
      title: t("NOC_ROAD_TYPE_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.roadType?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.roadType ||
        "N/A",
    },
    {
      title: t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.areaLeftForRoadWidening || "N/A",
    },
    {
      title: t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.netPlotAreaAfterWidening || "N/A",
    },
    {
      title: t("NOC_NET_TOTAL_AREA_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.totalAreaUnderLayout || "N/A",
    },
    {
      title: t("NOC_ROAD_WIDTH_AT_SITE_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.roadWidthAtSite || "N/A",
    },
    {
      title: t("NOC_DISTRICT_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.district?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.district ||
        "N/A",
    },
    {
      title: t("NOC_ZONE_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.zone?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.zone ||
        "N/A",
    },
    {
      title: t("NOC_SITE_WARD_NO_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.wardNo || "N/A",
    },
    {
      title: t("NOC_SITE_VILLAGE_NAME_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.villageName || "N/A",
    },
    {
      title: t("NOC_SITE_COLONY_NAME_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.layoutApprovedColonyName || "N/A",
    },
    
    {
      title: t("NOC_BUILDING_STATUS_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.buildingStatus?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.buildingStatus ||
        "N/A",
    },
    {
      title: t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.isBasementAreaAvailable?.code ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.isBasementAreaAvailable ||
        "No",
    },
  ]

  if (appData?.layoutDetails?.additionalDetails?.siteDetails?.buildingStatus == "Built Up") {
    values.push({
      title: t("NOC_BASEMENT_AREA_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.basementArea || "N/A",
    })
  }

  if (appData?.layoutDetails?.additionalDetails?.siteDetails?.buildingStatus == "Built UP") {
    appData?.layoutDetails?.additionalDetails?.siteDetails?.floorArea?.map((floor, index) =>
      values.push({
        title: getFloorLabel(index, t),
        value: floor?.value,
      }),
    )
  }

  if (appData?.layoutDetails?.additionalDetails?.siteDetails?.buildingStatus == "Built Up") {
    values.push({
      title: t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.totalFloorArea || "N/A",
    })
  }

  return {
    title: t("NOC_SITE_DETAILS"),
    values: values,
  }
}

const getSpecificationDetails = (appData, t) => {
  const values = [
    {
      title: t("NOC_PLOT_AREA_JAMA_BANDI_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationPlotArea || "N/A",
    },
    {
      title: t("NOC_BUILDING_CATEGORY_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.buildingCategory?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationBuildingCategory ||
        "N/A",
    },
    {
      title: t("NOC_NOC_TYPE_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationNocType?.name ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationNocType ||
        "Not Applicable",
    },
    {
      title: t("NOC_RESTRICTED_AREA_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationRestrictedArea?.code ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationRestrictedArea ||
        "Not Applicable",
    },
    {
      title: t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL"),
      value:
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationIsSiteUnderMasterPlan?.code ||
        appData?.layoutDetails?.additionalDetails?.siteDetails?.specificationIsSiteUnderMasterPlan ||
        "No",
    },
  ]

  return {
    title: t("NOC_SPECIFICATION_DETAILS"),
    values: values,
  }
}

const getCoordinateDetails = (appData, t) => {
  const values = [
    {
      title: t("COMMON_LATITUDE1_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.coordinates?.Latitude1 || "N/A",
    },
    {
      title: t("COMMON_LONGITUDE1_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.coordinates?.Longitude1 || "N/A",
    },
    {
      title: t("COMMON_LATITUDE2_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.coordinates?.Latitude2 || "N/A",
    },
    {
      title: t("COMMON_LONGITUDE2_LABEL"),
      value: appData?.layoutDetails?.additionalDetails?.coordinates?.Longitude2 || "N/A",
    },
  ]

  return {
    title: t("NOC_SITE_COORDINATES_LABEL"),
    values: values,
  }
}

const getDocuments = async (appData, t) => {
  const filesArray = appData?.documents?.map((value) => value?.uuid)
  const res =
    filesArray?.length > 0 && (await Digit.UploadServices.Filefetch(filesArray, Digit.ULBService.getStateId()))

  return {
    title: t("NOC_TITILE_DOCUMENT_UPLOADED"),
    values:
      appData?.documents?.length > 0
        ? appData.documents.map((document, index) => {
            const documentLink = pdfDownloadLink(res?.data, document?.uuid)

            return {
              title: t(document?.documentType.replace(/\./g, "_")) || t("CS_NA")
            }
          })
        : {
            title: t("PT_NO_DOCUMENTS"),
            value: " ",
          },
  }
}

export const getLayoutAcknowledgementData = async (applicationDetails, tenantInfo, ulbType, t) => {
  const stateCode = Digit.ULBService.getStateId()
  const appData = applicationDetails || {}
 console.log('appData', appData)
  let detailsArr = [],
  imageURL = ""
  const ownerFileStoreId= appData?.layoutDetails?.additionalDetails?.applicationDetails?.primaryOwnerPhoto || "";
  const result = await Digit.UploadServices.Filefetch([ownerFileStoreId], stateCode)

  const fileData = result?.data?.fileStoreIds?.[0]
  imageURL = fileData?.url || ""

  if (appData?.layoutDetails?.additionalDetails?.applicationDetails?.professionalName)
    detailsArr.push(getProfessionalDetails(appData, t))
  console.log('imageURL', imageURL)

  return {
    t: t,
    tenantId: tenantInfo?.code,
    name: t("LAYOUT_ACKNOWLEDGEMENT_TITLE"),
    email: tenantInfo?.emailId,
    phoneNumber: tenantInfo?.contactNumber,
    heading: t("LOCAL_GOVERNMENT_PUNJAB"),
    applicationNumber: appData?.applicationNo || "NA",
    details: [
      getRegistrationDetails(appData, t),
      ...detailsArr,
      getApplicantDetails(appData, t),
      getSiteDetails(appData, t),
      getSpecificationDetails(appData, t),
      getCoordinateDetails(appData, t),
      await getDocuments(appData, t),
    ],
    imageURL,
    ulbType
  }
}