
import React,{ useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { useHistory, useParams } from "react-router-dom"

import Stepper from "../../../../../react-components/src/customComponents/Stepper"

import { layoutStepperConfig } from "../../config/layoutStepperConfig";
import {
  SET_LayoutNewApplication_STEP,
  RESET_LAYOUT_NEW_APPLICATION_FORM,
  UPDATE_LayoutNewApplication_FORM,
  UPDATE_LayoutNewApplication_CoOrdinates,
} from "../../redux/actions/LayoutNewApplicationActions"
import { CardHeader, Toast, Loader } from "@mseva/digit-ui-react-components"


//Config for steps
const createEmployeeConfig = [
  {
    head: "APPLICATION DETAILS",
    stepLabel: "BPA_APPLICATION_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "LayoutStepFormOne",
    key: "applicationDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SITE DETAILS",
    stepLabel: "BPA_SITE_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "LayoutStepFormTwo",
    key: "siteDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENT DETAILS",
    stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "LayoutStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SUMMARY DETAILS",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "LayoutStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },
]

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return {
    ...item,
    currStepConfig: layoutStepperConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber),
  }
})

const EditLayoutApplication = () => {
  const { id } = useParams()
  const history = useHistory()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [showToast, setShowToast] = useState(null)

  const formState = useSelector((state) => state.obps.LayoutNewApplicationFormReducer)
  const formData = formState.formData
  console.log(formData, "FORMMMMMMM");
  const step = formState.step

  //Makesure to pass tenantId correctly
  let tenantId
  if (window.location.pathname.includes("employee")) {
    tenantId = window.localStorage.getItem("Employee.tenant-id")
  } else {
    tenantId = window.localStorage.getItem("CITIZEN.CITY")
  }
  console.log("tenantId here", tenantId)

  const { isLoading, data } = Digit.Hooks.obps.useLayoutCitizenSearchApplication({ applicationNo: id }, tenantId)
  const applicationDetails = data?.resData
  console.log("applicationDetails here==>", applicationDetails)

  const layoutObject = applicationDetails?.Layout?.[0] || {}
  const applicantDetails = layoutObject?.layoutDetails?.additionalDetails?.applicationDetails || {}
  const siteDetails = layoutObject?.layoutDetails?.additionalDetails?.siteDetails || {}
  const documents = layoutObject?.documents?.filter((doc) => doc?.documentUid || doc?.documentType) || []
  const coordinates = layoutObject?.layoutDetails?.additionalDetails?.coordinates || {}

  const setStep = (updatedStepNumber) => {
    dispatch(SET_LayoutNewApplication_STEP(updatedStepNumber))
  }

  const stateId = Digit.ULBService.getStateId()
  const { data: buildingType, isLoading: isBuildingTypeLoading } = Digit.Hooks.obps.useLayoutBuildingType(stateId)
  const { data: roadType, isLoading: isRoadTypeLoading } = Digit.Hooks.obps.useLayoutRoadType(stateId)
  const {
    data: buildingCategory,
    isLoading: isBuildingCategoryLoading,
    error: buildingCategoryError,
  } = Digit.Hooks.obps.useLayoutBuildingCategory(stateId)
  const { data: layoutType, isLoading: isLayoutTypeLoading } = Digit.Hooks.obps.useLayoutType(stateId)
  const { data: ulbList, isLoading: isUlbListLoading } = Digit.Hooks.useTenants()
  const [cities, setCitiesOptions] = useState([])

  const { data: tenantsData } = Digit.Hooks.obps.useTenants()

  useEffect(() => {
    if (tenantsData) {
      setCitiesOptions(tenantsData)
    }
  }, [tenantsData])

  const ulbListOptions = ulbList?.map((city) => ({
    ...city,
    displayName: t(city.i18nKey),
  }))

  const { data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"])

  const menu = []
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({
        i18nKey: `COMMON_GENDER_${genderDetails.code}`,
        code: `${genderDetails.code}`,
        value: `${genderDetails.code}`,
      })
    })

  const [selectedDistrict, setSelectedDistrict] = useState(null)

  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedDistrict?.code,
    "revenue",
    { enabled: !!selectedDistrict },
    t,
  )

  const options = [
    { code: "yes", value: "Yes" },
    { code: "no", value: "No" },
  ]

  useEffect(() => {
    if (fetchedLocalities?.length > 0 && siteDetails?.zone) {
      const zoneName = siteDetails?.zone?.name || siteDetails?.zone
      const matchedZone = fetchedLocalities.find((loc) => loc.name === zoneName)

      if (matchedZone && formData.siteDetails?.zone?.code !== matchedZone.code) {
        dispatch(
          UPDATE_LayoutNewApplication_FORM("siteDetails", {
            ...formData.siteDetails,
            zone: matchedZone,
          }),
        )
      }
    }
  }, [fetchedLocalities, siteDetails?.zone])

  useEffect(() => {
    // Only reset and populate form when data is loaded and not already populated
    if (!isLoading && !isBuildingTypeLoading && layoutObject?.layoutDetails && !isUlbListLoading && !formData.apiData) {
      dispatch(RESET_LAYOUT_NEW_APPLICATION_FORM())

      const formattedDocuments = {
        documents: {
          documents: documents?.map((doc) => ({
            documentType: doc?.documentType || "",
            uuid: doc?.uuid || "",
            documentUid: doc?.documentUid || "",
            documentAttachment: doc?.documentAttachment || "",
            filestoreId: doc?.uuid || "",
          })),
        },
      }

      Object.entries(coordinates).forEach(([key, value]) => {
        dispatch(UPDATE_LayoutNewApplication_CoOrdinates(key, value))
      })

      const updatedApplicantDetails = {
        ...applicantDetails,
        applicantGender: menu.find(
          (obj) =>
            obj.code === applicantDetails?.applicantGender?.code || obj.code === applicantDetails?.applicantGender,
        ),
      }

      const districtObj = cities.find(
        (obj) => obj.name === siteDetails?.district?.name || obj.name === siteDetails?.district,
      )
      setSelectedDistrict(districtObj)

      const updatedSiteDetails = {
        ...siteDetails,
        ulbName: ulbListOptions?.find(
          (obj) => obj.name === siteDetails?.ulbName?.name || obj.name === siteDetails?.ulbName,
        ),
        roadType: roadType?.find(
          (obj) => obj.name === siteDetails?.roadType?.name || obj.name === siteDetails?.roadType,
        ),
        buildingStatus: buildingType?.find(
          (obj) => obj.name === siteDetails?.buildingStatus?.name || obj.name === siteDetails?.buildingStatus,
        ),
        isBasementAreaAvailable: options.find(
          (obj) =>
            obj.code === siteDetails?.isBasementAreaAvailable?.code ||
            obj.code === siteDetails?.isBasementAreaAvailable,
        ),

        district: districtObj,

        specificationBuildingCategory: buildingCategory?.find(
          (obj) =>
            obj.name === siteDetails?.specificationBuildingCategory?.name ||
            obj.name === siteDetails?.specificationBuildingCategory,
        ),
        specificationLayoutType: layoutType?.find(
          (obj) =>
            obj.name === siteDetails?.specificationLayoutType?.name ||
            obj.name === siteDetails?.specificationLayoutType,
        ),
        specificationRestrictedArea: options.find(
          (obj) =>
            obj.code === siteDetails?.specificationRestrictedArea?.code ||
            obj.code === siteDetails?.specificationRestrictedArea,
        ),
        specificationIsSiteUnderMasterPlan: options.find(
          (obj) =>
            obj.code === siteDetails?.specificationIsSiteUnderMasterPlan?.code ||
            obj.code === siteDetails?.specificationIsSiteUnderMasterPlan,
        ),
      }

      dispatch(UPDATE_LayoutNewApplication_FORM("applicationDetails", updatedApplicantDetails))
      dispatch(UPDATE_LayoutNewApplication_FORM("siteDetails", updatedSiteDetails))
      dispatch(UPDATE_LayoutNewApplication_FORM("documents", formattedDocuments))
      dispatch(UPDATE_LayoutNewApplication_FORM("apiData", applicationDetails))
    }
  }, [isLoading, isBuildingTypeLoading, isUlbListLoading, layoutObject?.layoutDetails, formData.apiData])

  const handleSubmit = (dataGet) => {}

  if (isLoading || !formData.applicationDetails) {
    return (
      <div>
        <Loader />
      </div>
    )
  }

  return (
    <div className="pageCard">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("BPA_LAYOUT_REGISTRATION_APPLICATION")}
      </CardHeader>
      <Stepper stepsList={updatedCreateEmployeeconfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null)
          }}
          isDleteBtn={"true"}
        />
      )}
    </div>
  )
}

export default EditLayoutApplication
