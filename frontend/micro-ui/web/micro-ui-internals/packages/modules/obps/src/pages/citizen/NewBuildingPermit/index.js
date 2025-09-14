import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useRouteMatch, useLocation, useHistory, Switch, Route, Redirect } from "react-router-dom";
import { newConfig as newConfigBPA } from "../../../config/buildingPermitConfig";
import { newConfig1 } from "./NewConfig";
import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
import { Loader } from "@mseva/digit-ui-react-components";
// import CheckPage from "./CheckPage";
// import OBPSAcknowledgement from "./OBPSAcknowledgement";

const getPath = (path, params) => {
  params &&
    Object.keys(params).map((key) => {
      path = path.replace(`:${key}`, params[key]);
    });
  return path;
};


const NewBuildingPermit = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { path, url } = useRouteMatch()
  const { pathname, state } = useLocation()
  const match = useRouteMatch()
  const history = useHistory()
  const location = useLocation()


  if (typeof Digit !== "undefined") {
    Digit.SessionStorage.set("OBPS_PT", "true")
  }
  sessionStorage.removeItem("BPA_SUBMIT_APP")

  const currentRoute = pathname.split("/").pop()
  const [applicationId, setApplicationId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [createApiResponse, setCreateApiResponse] = useState(null)


  const stepNumbers = {
    "docs-required": 1,
    "basic-details": 2,
    "plot-details": 3,
    "scrutiny-details": 4,
    "location": 5,
    "additional-building-details": 6,
    "owner-details": 7,
    "document-details": 8,
    "check": 9,
  }

  const createEmployeeConfig = [
    {
      head: "DOCUMENT DETAILS",
      stepLabel: "Documents Required",
      stepNumber: 1,
      isStepEnabled: true,
      route: "docs-required",
      type: "component",
      component: "dummy",
      key: "applicationDetails",
      withoutLabel: true,
      texts: {
        submitBarLabel: "CS_COMMON_NEXT",
      },
    },
    {
      head: "APPLICATION DETAIL",
      stepLabel: "Basic Details",
      stepNumber: 2,
      isStepEnabled: true,
      route: "basic-details",
      type: "component",
      component: "dummy",
      key: "siteDetails",
      withoutLabel: true,
      texts: {
        submitBarLabel: "CS_COMMON_NEXT",
      },
    },
    {
      head: "PLOT DETAILS",
      stepLabel: "Plot Details",
      stepNumber: 3,
      isStepEnabled: true,
      route: "plots-details",
      type: "component",
      component: "dummy",
      key: "documents",
      withoutLabel: true,
      texts: {
        submitBarLabel: "CS_COMMON_NEXT",
      },
    },
    {
      head: "SCRUTINY DETAILS",
      stepLabel: "Scrutiny Details",
      stepNumber: 4,
      isStepEnabled: true,
      route: "scrutiny-details",
      type: "component",
      component: "dummy",
      key: "summary",
      withoutLabel: true,
      texts: {
        submitBarLabel: "CS_COMMON_NEXT",
      },
    },
    {
      head: "LOCATION DETAILS",
      stepLabel: "Location Details",
      stepNumber: 5,
      isStepEnabled: true,
      route: "location",
      type: "component",
      component: "dummy",
      key: "summary",
      withoutLabel: true,
      texts: {
        submitBarLabel: "CS_COMMON_NEXT",
      },
    },
    {
      head: "BUILDING DETAILS",
      stepLabel: "Building Details",
      stepNumber: 6,
      isStepEnabled: true,
      route: "additional-building-details",
      type: "component",
      component: "dummy",
      key: "summary",
      withoutLabel: true,
      texts: {
        submitBarLabel: "CS_COMMON_NEXT",
      },
    },
    {
      head: "OWNER DETAILS",
      stepLabel: "Owner Details",
      stepNumber: 7,
      isStepEnabled: true,
      route: "owner-details",
      type: "component",
      component: "dummy",
      key: "summary",
      withoutLabel: true,
      texts: {
        submitBarLabel: "CS_COMMON_NEXT",
      },
    },
    {
      head: "DOCUMENTS DETAILS",
      stepLabel: "Document Upload",
      stepNumber: 8,
      isStepEnabled: true,
      route: "document-details",
      type: "component",
      component: "dummy",
      key: "summary",
      withoutLabel: true,
      texts: {
        submitBarLabel: "CS_COMMON_NEXT",
      },
    },
    {
      head: "SUMMARY DETAILS",
      stepLabel: "Summary & Review",
      stepNumber: 9,
      isStepEnabled: true,
      route: "check",
      type: "component",
      component: "dummy",
      key: "summary",
      withoutLabel: true,
      texts: {
        submitBarLabel: "CS_COMMON_SUBMIT",
      },
    },
  ]

  const getCurrentStep = () => {
    const stepNumber = stepNumbers[currentRoute]
    console.log("  Current route:", currentRoute, "Step number:", stepNumber)
    return stepNumber || 1
  }

  const currentStep = getCurrentStep()

  const tenantId = window.location.href.includes("citizen")
    ? localStorage.getItem("CITIZEN.CITY")
    : typeof Digit !== "undefined"
      ? Digit.ULBService.getCurrentTenantId()
      : "default"

  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage(
    "BUILDING_PERMIT",
    state?.edcrNumber ? { data: { scrutinyNumber: { edcrNumber: state?.edcrNumber } } } : {},
  )

  const stateId = typeof Digit !== "undefined" ? Digit.ULBService.getStateId() : "default"

  let newConfig = {}
  if (typeof Digit !== "undefined") {
    const { data } = Digit.Hooks.obps.SearchMdmsTypes.getFormConfig(stateId, [])
    newConfig = data
  }

  console.log(newConfig, "DATATATATA")


  const goNext = (skipStep) => {
    const currentPath = pathname.split("/").pop()
    const currentConfigItem = newConfig1.find((routeObj) => routeObj.route === currentPath)

    if (!currentConfigItem) {
      console.error("Current route not found in config:", currentPath)
      return
    }

    const { nextStep } = currentConfigItem
    const redirectWithHistory = history.push

    if (nextStep === null) {
      return redirectWithHistory(`${getPath(match.path, match.params)}/check`)
    }
    redirectWithHistory(`${getPath(match.path, match.params)}/${nextStep}`)
  }

  const onSuccess = () => {
    //clearParams();
    queryClient.invalidateQueries("PT_CREATE_PROPERTY")
  }


  const createApplication = async (data) => {
    setIsLoading(true)

    try {
      const userInfo = Digit.UserService.getUser()
      const accountId = userInfo?.info?.uuid
      const actualTenantId = localStorage.getItem("CITIZEN.CITY") || userInfo?.info?.tenantId || tenantId || "pb"

      const payload = {
        ...data,
        workflow: { action: "SEND_TO_CITIZEN", assignes: [accountId] },
        tenantId: actualTenantId,
      }

      const result = await Digit.OBPSService.update({ BPA: payload }, tenantId)
      setIsLoading(false)
      history.push(`${getPath(match.path, match.params)}/acknowledgement`)
    } catch (error) {
      setIsLoading(false)
      console.error("Final submission failed:", error)
    }
  }

  // const handleSelect = async (key, data, skipStep, isFromCreateApi) => {
  //   const currentPath = pathname.split("/").pop()
  //   const currentStepNumber = stepNumbers[currentPath]

  //   // For steps 3 and onwards, handle API calls for save as draft
  //   if (currentStepNumber >= 3 && currentStepNumber <= 8) {
  //     setIsLoading(true)

  //     try {
  //       const userInfo = Digit.UserService.getUser()
  //       const accountId = userInfo?.info?.uuid
  //       const actualTenantId = localStorage.getItem("CITIZEN.CITY") || userInfo?.info?.tenantId || tenantId || "pb"

  //       // Merge current form data with existing params
  //       const updatedParams = isFromCreateApi
  //         ? data
  //         : key === ""
  //           ? { ...params, ...data }
  //           : { ...params, [key]: { ...params[key], ...data } }

  //       const hasApplicationNo =
  //         updatedParams?.applicationNo ||
  //         updatedParams?.data?.applicationNo ||
  //         params?.applicationNo ||
  //         params?.data?.applicationNo ||
  //         createApiResponse?.BPA?.[0]?.applicationNo

  //       const workflowAction = hasApplicationNo ? "SAVE_AS_DRAFT" : "INITIATE"

  //       console.log(
  //         "[v0] Current step:",
  //         currentStepNumber,
  //         "hasApplicationNo:",
  //         hasApplicationNo,
  //         "workflowAction:",
  //         workflowAction,
  //         "applicationNo value:",
  //         hasApplicationNo,
  //       )

  //       let payload

  //       if (hasApplicationNo) {
  //         const createResponse = createApiResponse?.BPA?.[0]

  //         // For UPDATE API - include fields from create response
  //         payload = {
  //           BPA: {
  //             id: createResponse?.id || updatedParams?.id || "",
  //             applicationNo: hasApplicationNo,
  //             businessService: createResponse?.businessService || "BPA_LOW",
  //             landId: createResponse?.landId || null,
  //             status: createResponse?.status || "INITIATED",
  //             edcrNumber: updatedParams?.data?.edcrDetails?.edcrNumber || createResponse?.edcrNumber || "",
  //             riskType: updatedParams?.data?.riskType || createResponse?.riskType || "LOW",
  //             applicationType: updatedParams?.data?.applicationType || createResponse?.applicationType || "",
  //             serviceType: updatedParams?.data?.serviceType || createResponse?.serviceType || "",
  //             tenantId: actualTenantId,
  //             accountId: accountId,
  //             documents: updatedParams?.documents?.documents || [],
  //             landInfo:
  //               currentStepNumber >= 7 && updatedParams?.landInfo?.owners?.length > 0
  //                 ? {
  //                     ...createResponse?.landInfo,
  //                     owners: updatedParams.landInfo.owners,
  //                     ownershipCategory:
  //                       updatedParams?.landInfo?.ownershipCategory || createResponse?.landInfo?.ownershipCategory,
  //                     address: {
  //                       ...createResponse?.landInfo?.address,
  //                       ...(updatedParams?.data?.address?.doorNo && { doorNo: updatedParams.data.address.doorNo }),
  //                       ...(updatedParams?.data?.address?.buildingName && {
  //                         buildingName: updatedParams.data.address.buildingName,
  //                       }),
  //                       ...(updatedParams?.data?.address?.street && { street: updatedParams.data.address.street }),
  //                       ...(updatedParams?.data?.address?.pincode && { pincode: updatedParams.data.address.pincode }),
  //                       ...(updatedParams?.data?.address?.landmark && {
  //                         landmark: updatedParams.data.address.landmark,
  //                       }),
  //                       ...(updatedParams?.data?.address?.plotNo && { plotNo: updatedParams.data.address.plotNo }),
  //                     },
  //                   }
  //                 : null,
  //             additionalDetails: {
  //               // Only include additionalDetails that have been filled out
  //               ...(updatedParams?.data?.boundaryWallLength && {
  //                 boundaryWallLength: updatedParams.data.boundaryWallLength,
  //               }),
  //               ...(updatedParams?.data?.registrationDetails && {
  //                 registrationDetails: updatedParams.data.registrationDetails,
  //               }),
  //               ...(updatedParams?.data?.wardnumber && { wardnumber: updatedParams.data.wardnumber }),
  //               ...(updatedParams?.data?.zonenumber && { zonenumber: updatedParams.data.zonenumber }),
  //               ...(updatedParams?.data?.khasraNumber && { khasraNumber: updatedParams.data.khasraNumber }),
  //               ...(updatedParams?.data?.architectid && { architectid: updatedParams.data.architectid }),
  //               ...(updatedParams?.data?.propertyuid && { propertyuid: updatedParams.data.propertyuid }),
  //               ...(updatedParams?.data?.bathnumber && { bathnumber: updatedParams.data.bathnumber }),
  //               ...(updatedParams?.data?.kitchenNumber && { kitchenNumber: updatedParams.data.kitchenNumber }),
  //               ...(updatedParams?.data?.approxinhabitants && {
  //                 approxinhabitants: updatedParams.data.approxinhabitants,
  //               }),
  //               ...(updatedParams?.data?.materialusedinfloor && {
  //                 materialusedinfloor: updatedParams.data.materialusedinfloor,
  //               }),
  //               ...(updatedParams?.data?.distancefromsewer && {
  //                 distancefromsewer: updatedParams.data.distancefromsewer,
  //               }),
  //               ...(updatedParams?.data?.sourceofwater && { sourceofwater: updatedParams.data.sourceofwater }),
  //               ...(updatedParams?.data?.watercloset && { watercloset: updatedParams.data.watercloset }),
  //               ...(updatedParams?.data?.materialused && { materialused: updatedParams.data.materialused }),
  //               ...(updatedParams?.data?.materialusedinroofs && {
  //                 materialusedinroofs: updatedParams.data.materialusedinroofs,
  //               }),
  //               // Static required fields
  //               applicationType: "BUILDING_PLAN_SCRUTINY",
  //               serviceType: "NEW_CONSTRUCTION",
  //               architectName: "",
  //               architectMobileNumber: "",
  //               typeOfArchitect: "ARCHITECT",
  //               isSelfCertificationRequired: "false",
  //             },
  //             workflow: {
  //               action: workflowAction,
  //               assignes: [accountId],
  //             },
  //             ...(createResponse?.auditDetails && {
  //               auditDetails: createResponse.auditDetails,
  //             }),
  //           },
  //           RequestInfo: {
  //             apiId: "Rainmaker",
  //             authToken: userInfo?.access_token || "",
  //             msgId: `${Date.now()}|en_IN`,
  //             plainAccessRequest: {},
  //           },
  //         }
  //       } else {
  //         // For CREATE API - use the complete payload structure (keep existing create logic)
  //         payload = {
  //           BPA: {
  //             edcrNumber: updatedParams?.data?.edcrDetails?.edcrNumber || "",
  //             riskType: updatedParams?.data?.riskType || "LOW",
  //             applicationType: updatedParams?.data?.applicationType || "",
  //             serviceType: updatedParams?.data?.serviceType || "",
  //             tenantId: actualTenantId,
  //             accountId: accountId,
  //             documents: updatedParams?.documents?.documents || [],
  //             additionalDetails: {
  //               GISPlaceName: updatedParams?.address?.placeName || "",
  //               boundaryWallLength: updatedParams?.data?.boundaryWallLength || "",
  //               area: updatedParams?.data?.area || "",
  //               height: updatedParams?.data?.height || "",
  //               usage: updatedParams?.data?.occupancyType || "",
  //               builtUpArea: updatedParams?.data?.builtUpArea || "",
  //               ownerName: updatedParams?.landInfo?.owners?.map((owner) => owner.name).join(",") || "",
  //               registrationDetails: updatedParams?.data?.registrationDetails || "",
  //               applicationType: "BUILDING_PLAN_SCRUTINY",
  //               serviceType: "NEW_CONSTRUCTION",
  //               wardnumber: updatedParams?.data?.wardnumber || "",
  //               zonenumber: updatedParams?.data?.zonenumber || "",
  //               khasraNumber: updatedParams?.data?.khasraNumber || "",
  //               architectid: updatedParams?.data?.architectid || "",
  //               propertyuid: updatedParams?.data?.propertyuid || "",
  //               bathnumber: updatedParams?.data?.bathnumber || "",
  //               kitchenNumber: updatedParams?.data?.kitchenNumber || "",
  //               approxinhabitants: updatedParams?.data?.approxinhabitants || "",
  //               materialusedinfloor: updatedParams?.data?.materialusedinfloor || "",
  //               distancefromsewer: updatedParams?.data?.distancefromsewer || "",
  //               sourceofwater: updatedParams?.data?.sourceofwater || "",
  //               watercloset: updatedParams?.data?.watercloset || "",
  //               materialused: updatedParams?.data?.materialused || "",
  //               materialusedinroofs: updatedParams?.data?.materialusedinroofs || "",
  //               approvedColony: "",
  //               buildingStatus: "",
  //               greenbuilding: "",
  //               masterPlan: "",
  //               proposedSite: "",
  //               purchasedFAR: "",
  //               restrictedArea: "",
  //               schemes: "",
  //               UlbName: "",
  //               District: "",
  //               nameofApprovedcolony: "",
  //               NocNumber: "",
  //               coreArea: "",
  //               schemesselection: "",
  //               schemeName: "",
  //               transferredscheme: "",
  //               Ulblisttype: "",
  //               uploadedFileNoc: "",
  //               uploadedFileGreenBuilding: "",
  //               use: "",
  //               architectName: "",
  //               architectMobileNumber: "",
  //               typeOfArchitect: "ARCHITECT",
  //               stakeholderName: "",
  //               stakeholderRegistrationNumber: "",
  //               stakeholderAddress: "",
  //               isSelfCertificationRequired: "false",
  //             },
  //             workflow: {
  //               action: workflowAction,
  //               assignes: [accountId],
  //             },
  //           },
  //           RequestInfo: {
  //             apiId: "Rainmaker",
  //             authToken: userInfo?.access_token || "",
  //             msgId: `${Date.now()}|en_IN`,
  //             plainAccessRequest: {},
  //           },
  //         }
  //       }

  //       const apiCall = hasApplicationNo
  //         ? Digit.OBPSService.update(payload, tenantId)
  //         : Digit.OBPSService.create(payload, tenantId)

  //       const result = await apiCall

  //       if (!hasApplicationNo && result?.BPA?.length > 0) {
  //         setCreateApiResponse(result)
  //       }

  //       if (result?.BPA?.length > 0) {
  //         result.BPA[0].owners = {
  //           owners: result?.BPA?.[0]?.landInfo?.owners || [],
  //           ownershipCategory: "",
  //         }
  //         result.BPA[0].address = result?.BPA?.[0]?.landInfo?.address || {}
  //         result.BPA[0].address.city = { code: actualTenantId }
  //         result.BPA[0].address.locality = { code: "ALOC1" }
  //         result.BPA[0].placeName = ""
  //         result.BPA[0].data = { ...updatedParams.data }
  //         result.BPA[0].BlockIds = []
  //         result.BPA[0].subOccupancy = {}
  //         result.BPA[0].uiFlow = { flow: "STAKEHOLDER" }

  //         if (result.BPA[0].applicationNo) {
  //           result.BPA[0].data.applicationNo = result.BPA[0].applicationNo
  //         }

  //         setParams(result.BPA[0])
  //         setIsLoading(false)
  //         goNext(skipStep)
  //       }
  //     } catch (error) {
  //       setIsLoading(false)
  //       console.error("API call failed:", error)
  //       // Handle error - you might want to show a toast or error message
  //     }
  //   } else {
  //     // For steps 1-2, just update params and go next (no API call needed)
  //     if (isFromCreateApi) setParams(data)
  //     else if (key === "") setParams({ ...params, ...data })
  //     else setParams({ ...params, [key]: { ...params[key], ...data } })
  //     goNext(skipStep)
  //   }
  // }

    const handleSelect = async (key, data, skipStep, isFromCreateApi) => {
    const currentPath = pathname.split("/").pop()
    const currentStepNumber = stepNumbers[currentPath]
    console.log("Databefoire",key, data, params)

    // For steps 3 and onwards, handle API calls for save as draft
    if (currentStepNumber >= 3 && currentStepNumber <= 8) {
      setIsLoading(true)

      try {
        const userInfo = Digit.UserService.getUser()
        const accountId = userInfo?.info?.uuid
        const actualTenantId = localStorage.getItem("CITIZEN.CITY") || userInfo?.info?.tenantId || tenantId || "pb"

        let updatedParams
        if (isFromCreateApi) {
          updatedParams = data
        } else if (key === "") {
          // Merge at root level but preserve existing data object
          updatedParams = {
            // ...params,
            ...data,
            // data: { ...params.data, ...data.data },
            data: { ...data.data },
          }
        } else {
          // Merge specific key but also preserve and merge data object
          updatedParams = {
            // ...params,
            // [key]: { ...params[key], ...data },
            // data: { ...params.data, ...data.data },
            [key]: { ...data },
            data: { ...data.data },
          }
        }

        try {
          const stored = sessionStorage.getItem("BUILDING_PERMIT")
          if (stored) {
            const storedData = JSON.parse(stored)
            updatedParams = {
              ...updatedParams,
              data: { ...updatedParams.data, ...storedData },
            }
          }
        } catch (err) {
          console.error("Failed to parse BUILDING_PERMIT sessionStorage", err)
        }

        console.log("[v0] Updated params with accumulated data:", updatedParams)

        const hasApplicationNo =
          updatedParams?.applicationNo ||
          updatedParams?.data?.applicationNo ||
          params?.applicationNo ||
          params?.data?.applicationNo ||
          createApiResponse?.BPA?.[0]?.applicationNo

        const workflowAction = hasApplicationNo ? "SAVE_AS_DRAFT" : "INITIATE"

        console.log(
          "[v0] Current step:",
          currentStepNumber,
          "hasApplicationNo:",
          hasApplicationNo,
          "workflowAction:",
          workflowAction,
          "applicationNo value:",
          hasApplicationNo,
        )

        // 🔹 Transform session-stored documents object into array for API
          let documentsArray = [];
          if (updatedParams?.documents) {
            Object.entries(updatedParams.documents).forEach(([key, value]) => {
              if (value) {
                documentsArray.push({
                  documentType: key.toUpperCase(), // e.g. "SITEPHOTOGRAPH"
                  fileStoreId: value,
                });
              }
            });
          }


        let payload

        if (hasApplicationNo) {
          const createResponse = createApiResponse?.BPA?.[0]

          // For UPDATE API - include fields from create response
          payload = {
            BPA: {
              id: createResponse?.id || updatedParams?.id || "",
              applicationNo: hasApplicationNo,
              businessService: createResponse?.businessService || "BPA_LOW",
              landId: createResponse?.landId || null,
              status: createResponse?.status || "INITIATED",
              edcrNumber: updatedParams?.data?.edcrDetails?.edcrNumber || createResponse?.edcrNumber || "",
              riskType: updatedParams?.data?.riskType || createResponse?.riskType || "LOW",
              applicationType: updatedParams?.data?.applicationType || createResponse?.applicationType || "",
              serviceType: updatedParams?.data?.serviceType || createResponse?.serviceType || "",
              tenantId: actualTenantId,
              accountId: accountId,
              // documents: updatedParams?.documents?.documents || [],
              documents: documentsArray,

             landInfo:
  currentStepNumber >= 5 && updatedParams?.landInfo?.owners?.length > 0
    ? {
        ...createResponse?.landInfo,
        owners: updatedParams.landInfo.owners,
        ownershipCategory:
          updatedParams?.landInfo?.ownershipCategory || createResponse?.landInfo?.ownershipCategory,
        address: {
          ...createResponse?.landInfo?.address,
          ...(updatedParams?.data?.address?.doorNo && { doorNo: updatedParams.data.address.doorNo }),
          ...(updatedParams?.data?.address?.buildingName && { buildingName: updatedParams.data.address.buildingName }),
          ...(updatedParams?.data?.address?.street && { street: updatedParams.data.address.street }),
          ...(updatedParams?.data?.address?.pincode && { pincode: updatedParams.data.address.pincode }),
          ...(updatedParams?.data?.address?.landmark && { landmark: updatedParams.data.address.landmark }),
          ...(updatedParams?.data?.address?.plotNo && { plotNo: updatedParams.data.address.plotNo }),
          ...(updatedParams?.data?.address?.locality && { locality: updatedParams.data.address.locality }),
        },
      }
    : null,

additionalDetails: {
  ...(createResponse?.additionalDetails || {}),   
  ...(updatedParams?.data || {}),                 
  applicationType: "BUILDING_PLAN_SCRUTINY",
  serviceType: "NEW_CONSTRUCTION",
  architectName: "",
  architectMobileNumber: "",
  typeOfArchitect: "ARCHITECT",
  isSelfCertificationRequired: "false",
},

              workflow: {
                action: workflowAction,
                assignes: [accountId],
              },
              ...(createResponse?.auditDetails && {
                auditDetails: createResponse.auditDetails,
              }),
            },
            RequestInfo: {
              apiId: "Rainmaker",
              authToken: userInfo?.access_token || "",
              msgId: `${Date.now()}|en_IN`,
              plainAccessRequest: {},
            },
          }
        } else {
          // For CREATE API - use the complete payload structure (keep existing create logic)
          payload = {
            BPA: {
              edcrNumber: updatedParams?.data?.edcrDetails?.edcrNumber || "",
              riskType: updatedParams?.data?.riskType || "LOW",
              applicationType: updatedParams?.data?.applicationType || "",
              serviceType: updatedParams?.data?.serviceType || "",
              tenantId: actualTenantId,
              accountId: accountId,
              // documents: updatedParams?.documents?.documents || [],
              documents: documentsArray,

              additionalDetails: {
                GISPlaceName: updatedParams?.address?.placeName || "",
                boundaryWallLength: updatedParams?.data?.boundaryWallLength || "",
                area: updatedParams?.data?.area || "",
                height: updatedParams?.data?.height || "",
                usage: updatedParams?.data?.occupancyType || "",
                builtUpArea: updatedParams?.data?.builtUpArea || "",
                ownerName: updatedParams?.landInfo?.owners?.map((owner) => owner.name).join(",") || "",
                registrationDetails: updatedParams?.data?.registrationDetails || "",
                applicationType: "BUILDING_PLAN_SCRUTINY",
                serviceType: "NEW_CONSTRUCTION",
                wardnumber: updatedParams?.data?.wardnumber || "",
                zonenumber: updatedParams?.data?.zonenumber || "",
                khasraNumber: updatedParams?.data?.khasraNumber || "",
                architectid: updatedParams?.data?.architectid || "",
                propertyuid: updatedParams?.data?.propertyuid || "",
                bathnumber: updatedParams?.data?.bathnumber || "",
                kitchenNumber: updatedParams?.data?.kitchenNumber || "",
                approxinhabitants: updatedParams?.data?.approxinhabitants || "",
                materialusedinfloor: updatedParams?.data?.materialusedinfloor || "",
                distancefromsewer: updatedParams?.data?.distancefromsewer || "",
                sourceofwater: updatedParams?.data?.sourceofwater || "",
                watercloset: updatedParams?.data?.watercloset || "",
                materialused: updatedParams?.data?.materialused || "",
                materialusedinroofs: updatedParams?.data?.materialusedinroofs || "",
                approvedColony: "",
                buildingStatus: "",
                greenbuilding: "",
                masterPlan: "",
                proposedSite: "",
                purchasedFAR: "",
                restrictedArea: "",
                schemes: "",
                UlbName: "",
                District: "",
                nameofApprovedcolony: "",
                NocNumber: "",
                coreArea: "",
                schemesselection: "",
                schemeName: "",
                transferredscheme: "",
                Ulblisttype: "",
                uploadedFileNoc: "",
                uploadedFileGreenBuilding: "",
                use: "",
                architectName: "",
                architectMobileNumber: "",
                typeOfArchitect: "ARCHITECT",
                stakeholderName: "",
                stakeholderRegistrationNumber: "",
                stakeholderAddress: "",
                isSelfCertificationRequired: "false",
              },
              workflow: {
                action: workflowAction,
                assignes: [accountId],
              },
            },
            RequestInfo: {
              apiId: "Rainmaker",
              authToken: userInfo?.access_token || "",
              msgId: `${Date.now()}|en_IN`,
              plainAccessRequest: {},
            },
          }
        }

        console.log("payloadInBPA", payload)

        const apiCall = hasApplicationNo
          ? Digit.OBPSService.update(payload, tenantId)
          : Digit.OBPSService.create(payload, tenantId)

        const result = await apiCall

        if (!hasApplicationNo && result?.BPA?.length > 0) {
          setCreateApiResponse(result)
        }

        if (result?.BPA?.length > 0) {
          result.BPA[0].owners = {
            owners: result?.BPA?.[0]?.landInfo?.owners || [],
            ownershipCategory: "",
          }
          result.BPA[0].address = result?.BPA?.[0]?.landInfo?.address || {}
          result.BPA[0].address.city = { code: actualTenantId }
          result.BPA[0].address.locality = { code: "ALOC1" }
          result.BPA[0].placeName = ""
          result.BPA[0].data = { ...updatedParams.data }
          result.BPA[0].BlockIds = []
          result.BPA[0].subOccupancy = {}
          result.BPA[0].uiFlow = { flow: "STAKEHOLDER" }

          if (result.BPA[0].applicationNo) {
            result.BPA[0].data.applicationNo = result.BPA[0].applicationNo
          }

          setParams(result.BPA[0])
          setIsLoading(false)
          goNext(skipStep)
        }
      } catch (error) {
        setIsLoading(false)
        console.error("API call failed:", error)
        // Handle error - you might want to show a toast or error message
      }
    } else {
      // For steps 1-2, just update params and go next (no API call needed)
      if (isFromCreateApi) setParams(data)
      else if (key === "") setParams({ ...params, ...data })
      else setParams({ ...params, [key]: { ...params[key], ...data } })
      goNext(skipStep)
    }
  }

  const handleSkip = () => {};

  // const state = tenantId.split(".")[0];
  let config = [];
  newConfig = newConfig?.BuildingPermitConfig ? newConfig?.BuildingPermitConfig : newConfigBPA;
  newConfig.forEach((obj) => {
    config = config.concat(obj.body.filter((a) => !a.hideInCitizen));
  });
  config.indexRoute = "docs-required";

  useEffect(() => {
    if (sessionStorage.getItem("isPermitApplication") && sessionStorage.getItem("isPermitApplication") == "true") {
      clearParams();
      sessionStorage.setItem("isPermitApplication", false);
    }
  }, []);

  const CheckPage = Digit?.ComponentRegistryService?.getComponent("BPACheckPage");
  const OBPSAcknowledgement = Digit?.ComponentRegistryService?.getComponent("BPAAcknowledgement");

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "row",
        paddingTop: "100px",
        border: "none",
        boxShadow: "none",
      }}
    >
      <div style={{ width: "fit-content" }}>
      
        <Stepper
          style={{
            marginRight: "100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            width: "auto",
            maxWidth: "fit-content",
          }}
          stepsList={createEmployeeConfig}
          step={currentStep}
        />
      </div>

      <div style={{ width: "100%", marginLeft: "100px" }}>
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div>
              <Loader />
            </div>
          </div>
        )}

        <Switch>
          {newConfig1 &&
            newConfig1.map((routeObj, index) => {
              const { component, texts, inputs, key } = routeObj
              const Component =
                typeof component === "string" && typeof Digit !== "undefined"
                  ? Digit.ComponentRegistryService.getComponent(component)
                  : component || (() => <div>Component not found</div>)

              return (
                <Route path={`${getPath(match.path, match.params)}/${routeObj.route}`} key={index}>
                  <Component
                    style={{ width: "100%" }}
                    config={{ texts, inputs, key }}
                    onSelect={handleSelect}
                    onSkip={handleSkip}
                    t={t}
                    formData={params}
                  />
                </Route>
              )
            })}

          <Route path={`${getPath(match.path, match.params)}/check`}>
            <CheckPage onSubmit={createApplication} value={params} />
          </Route>

          <Route path={`${getPath(match.path, match.params)}/acknowledgement`}>
            <OBPSAcknowledgement data={params} onSuccess={onSuccess} />
          </Route>

          <Route>
            <Redirect to={`${getPath(match.path, match.params)}/${config.indexRoute || "docs-required"}`} />
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default NewBuildingPermit
