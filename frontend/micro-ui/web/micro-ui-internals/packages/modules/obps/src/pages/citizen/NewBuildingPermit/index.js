import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useRouteMatch, useLocation, useHistory, Switch, Route, Redirect } from "react-router-dom";
import { newConfig as newConfigBPA } from "../../../config/buildingPermitConfig";
import { newConfig1 } from "./NewConfig";
import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
// import CheckPage from "./CheckPage";
// import OBPSAcknowledgement from "./OBPSAcknowledgement";

const getPath = (path, params) => {
  params &&
    Object.keys(params).map((key) => {
      path = path.replace(`:${key}`, params[key]);
    });
  return path;
};

// const NewBuildingPermit = () => {
//   const queryClient = useQueryClient();
//   const { t } = useTranslation();
//   const { path, url } = useRouteMatch();
//   const { pathname, state } = useLocation();
//   const match = useRouteMatch();
//   const history = useHistory();
//   const location = useLocation();
//   Digit.SessionStorage.set("OBPS_PT", "true");
//   sessionStorage.removeItem("BPA_SUBMIT_APP");
// const currentRoute = pathname.split("/").pop();

// const [applicationId, setApplicationId] = useState(null)



// // find index of the current step
// // const currentStep = newConfig1.findIndex((r) => r.route === currentRoute);





//   const stepNumbers = {
//   "docs-required": 1,
//   "basic-details": 2,
//   "plots-details": 3,
//   "scrutiny-details" : 4,
//   "location" : 5,
//   "additional-building-details" : 6,
//   "owner-details": 7,
//   "document-details": 8,
//   "check": 9
// };

// const createEmployeeConfig = [
//   {
//     head: "DOCUMENT DETAILS",
//     stepLabel: "Documents",
//     stepNumber: 1,
//     isStepEnabled: true,
//     type: "component",
//     component: "dummy",
//     key: "applicationDetails",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "CS_COMMON_NEXT",
//     },
//   },
//   {
//     head: "SCRUTINY DETAIL",
//     stepLabel: "Application Detail",
//     stepNumber: 2,
//     isStepEnabled: true,
//     type: "component",
//     component: "dummy",
//     key: "siteDetails",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "CS_COMMON_NEXT",
//     },
//   },
//   {
//     head: "PLOT DETAILS",
//     stepLabel: "Plot Detail",
//     stepNumber: 3,
//     isStepEnabled: true,
//     type: "component",
//     component: "dummy",
//     key: "documents",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "CS_COMMON_NEXT",
//     },
//   },
//   {
//     head: "SCRUTINY DETAILS",
//     stepLabel: "Scrutiny",
//     stepNumber: 4,
//     isStepEnabled: true,
//     type: "component",
//     component: "dummy",
//     key: "summary",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "CS_COMMON_SUBMIT",
//     },
//   },
//     {
//     head: "LOCATION DETAILS",
//     stepLabel: "Location Detail",
//     stepNumber: 5,
//     isStepEnabled: true,
//     type: "component",
//     component: "dummy",
//     key: "summary",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "CS_COMMON_SUBMIT",
//     },
//   },
//   {
//     head: "BUILDING DETAILS",
//     stepLabel: "Building Detail",
//     stepNumber: 6,
//     isStepEnabled: true,
//     type: "component",
//     component: "dummy",
//     key: "summary",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "CS_COMMON_SUBMIT",
//     },
//   },
//   {
//     head: "OWNER DETAILS",
//     stepLabel: "Owner Detail",
//     stepNumber: 7,
//     isStepEnabled: true,
//     type: "component",
//     component: "dummy",
//     key: "summary",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "CS_COMMON_SUBMIT",
//     },
//   },
//   {
//     head: " DOCUMENTS DETAILS",
//     stepLabel: "Documents",
//     stepNumber: 8,
//     isStepEnabled: true,
//     type: "component",
//     component: "dummy",
//     key: "summary",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "CS_COMMON_SUBMIT",
//     },
//   },
//   {
//     head: "SUMMARY DETAILS",
//     stepLabel: "Summary ",
//     stepNumber: 9,
//     isStepEnabled: true,
//     type: "component",
//     component: "dummy",
//     key: "summary",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "CS_COMMON_SUBMIT",
//     },
//   },


// ];

//   const currentStep = createEmployeeConfig.findIndex((r) => r.route === currentRoute);
// const safeStep = currentStep >= 0 ? currentStep + 1 : 1;
  
//   const tenantId = window.location.href.includes("citizen") ? localStorage.getItem("CITIZEN.CITY") : Digit.ULBService.getCurrentTenantId();
//   // const { mutate: updateApplication, isLoading } = Digit.Hooks.obps.useObpsAPI(tenantId);
//   const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage(
//     "BUILDING_PERMIT",
//     state?.edcrNumber ? { data: { scrutinyNumber: { edcrNumber: state?.edcrNumber } } } : {}
//   );
//   const stateId = Digit.ULBService.getStateId();
//   let { data: newConfig } = Digit.Hooks.obps.SearchMdmsTypes.getFormConfig(stateId, []);
//   console.log(newConfig, "DATATATATA");
//   const goNext = (skipStep) => {
//     const currentPath = pathname.split("/").pop();
//     const { nextStep } = newConfig1.find((routeObj) => routeObj.route === currentPath);
//     let redirectWithHistory = history.push;
//     if (nextStep === null) {
//       return redirectWithHistory(`${getPath(match.path, match.params)}/check`);
//     }
//     redirectWithHistory(`${getPath(match.path, match.params)}/${nextStep}`);
//   };

//   const onSuccess = () => {
//     //clearParams();
//     queryClient.invalidateQueries("PT_CREATE_PROPERTY");
//   };
//   const createApplication = async (data) => {
//     const response = await Digit.OBPSService.scrutinyDetails(data?.tenantId, {
//       edcrNumber: data?.edcrNumber,
//     });
//     console.log(response, "RESPO");
//     history.push(`${getPath(match.path, match.params)}/acknowledgement`);
//   };


//   const handleSelect = (key, data, skipStep, isFromCreateApi) => {
//     let updatedParams

//     if (isFromCreateApi) {
//       setParams(data)
//       updatedParams = data
//     } else if (key === "") {
//       updatedParams = { ...data }
//       setParams(updatedParams)
//     } else {
//       updatedParams = { ...params, ...{ [key]: { ...params[key], ...data } } }
//       setParams(updatedParams)
//     }

//     console.log("payload on handleSelect", updatedParams)

//     saveDraft(updatedParams)

//     goNext(skipStep)
//   }


//   const handleSkip = () => {};

//   // const state = tenantId.split(".")[0];
//   let config = [];
//   newConfig = newConfig?.BuildingPermitConfig ? newConfig?.BuildingPermitConfig : newConfigBPA;
//   newConfig.forEach((obj) => {
//     config = config.concat(obj.body.filter((a) => !a.hideInCitizen));
//   });
//   config.indexRoute = "docs-required";

//   useEffect(() => {
//     if (sessionStorage.getItem("isPermitApplication") && sessionStorage.getItem("isPermitApplication") == "true") {
//       clearParams();
//       sessionStorage.setItem("isPermitApplication", false);
//     }
//   }, []);

//   const CheckPage = Digit?.ComponentRegistryService?.getComponent("BPACheckPage");
//   const OBPSAcknowledgement = Digit?.ComponentRegistryService?.getComponent("BPAAcknowledgement");


//   const saveDraft = async (formData) => {
//     try {
//       const currentStepNumber = stepNumbers[currentRoute] || 1

//       const payload = {}
//       payload.edcrNumber = formData?.data?.scrutinyNumber?.edcrNumber || ""
//       payload.riskType = formData?.data?.riskType || ""
//       payload.applicationType = formData?.data?.applicationType || ""
//       payload.serviceType = formData?.data?.serviceType || ""

//       const userInfo = JSON.parse(localStorage.getItem("user-info") || "{}")
//       const accountId = userInfo?.uuid

//       payload.tenantId = tenantId
//       payload.accountId = accountId

//       // Documents handling
//       const docsFromForm = formData?.documents?.documents || []
//       payload.documents = docsFromForm.length > 0 ? docsFromForm : []

//       // Additional Details - comprehensive structure matching owner-detail
//       payload.additionalDetails = { GISPlaceName: formData?.address?.placeName || "" }
//       payload.additionalDetails.boundaryWallLength = formData?.data?.boundaryWallLength || ""
//       payload.additionalDetails.area =
//         formData?.data?.edcrDetails?.planDetail?.planInformation?.plotArea?.toString() || ""
//       payload.additionalDetails.height =
//         formData?.data?.edcrDetails?.planDetail?.blocks?.[0]?.building?.buildingHeight?.toString() || ""
//       payload.additionalDetails.usage = formData?.data?.occupancyType || ""
//       payload.additionalDetails.builtUpArea =
//         formData?.data?.edcrDetails?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea?.toString() || ""

//       // Owner name from owners array or fallback
//       const owners = formData?.owners?.owners || []
//       payload.additionalDetails.ownerName = owners.length > 0 ? owners.map((obj) => obj.name || "").join(",") : ""

//       // Conditional fields - only add if data exists, otherwise empty string
//       payload.additionalDetails.registrationDetails = formData?.data?.registrationDetails || ""
//       payload.additionalDetails.applicationType = formData?.data?.applicationType || ""
//       payload.additionalDetails.serviceType = formData?.data?.serviceType || ""
//       payload.additionalDetails.wardnumber = formData?.data?.wardnumber || ""
//       payload.additionalDetails.zonenumber = formData?.data?.zonenumber || ""
//       payload.additionalDetails.khasraNumber = formData?.data?.khasraNumber || ""
//       payload.additionalDetails.architectid = formData?.data?.architectid || ""
//       payload.additionalDetails.propertyuid = formData?.data?.propertyuid || ""
//       payload.additionalDetails.bathnumber = formData?.data?.bathnumber || ""
//       payload.additionalDetails.kitchenNumber = formData?.data?.kitchenNumber || ""
//       payload.additionalDetails.approxinhabitants = formData?.data?.approxinhabitants || ""
//       payload.additionalDetails.materialusedinfloor = formData?.data?.materialusedinfloor || ""
//       payload.additionalDetails.distancefromsewer = formData?.data?.distancefromsewer || ""
//       payload.additionalDetails.sourceofwater = formData?.data?.sourceofwater || ""
//       payload.additionalDetails.watercloset = formData?.data?.watercloset || ""
//       payload.additionalDetails.materialused = formData?.data?.materialused || ""
//       payload.additionalDetails.materialusedinroofs = formData?.data?.materialusedinroofs || ""

//       // Owner-specific additional details
//       payload.additionalDetails.approvedColony = formData?.owners?.approvedColony?.code || ""
//       payload.additionalDetails.buildingStatus = formData?.owners?.buildingStatus?.code || ""
//       payload.additionalDetails.greenbuilding = formData?.owners?.greenbuilding?.code || ""
//       payload.additionalDetails.masterPlan = formData?.owners?.masterPlan?.code || ""
//       payload.additionalDetails.proposedSite = formData?.owners?.proposedSite?.code || ""
//       payload.additionalDetails.purchasedFAR = formData?.owners?.purchasedFAR?.code || ""
//       payload.additionalDetails.restrictedArea = formData?.owners?.restrictedArea?.code || ""
//       payload.additionalDetails.schemes = formData?.owners?.schemes?.i18nKey || ""

//       if (formData?.owners?.UlbName?.code) {
//         payload.additionalDetails.UlbName = formData.owners.UlbName.code
//           .toLowerCase()
//           .replace(/^\w/, (c) => c.toUpperCase())
//       } else {
//         payload.additionalDetails.UlbName = ""
//       }

//       payload.additionalDetails.District = formData?.owners?.District?.code || ""
//       payload.additionalDetails.nameofApprovedcolony = formData?.owners?.nameofApprovedcolony || ""
//       payload.additionalDetails.NocNumber = formData?.owners?.NocNumber || ""
//       payload.additionalDetails.coreArea = formData?.owners?.coreArea?.code || ""
//       payload.additionalDetails.schemesselection = formData?.owners?.schemesselection?.i18nKey || ""
//       payload.additionalDetails.schemeName = formData?.owners?.schemeName || ""
//       payload.additionalDetails.transferredscheme = formData?.owners?.transferredscheme || ""
//       payload.additionalDetails.Ulblisttype = formData?.owners?.Ulblisttype?.value || ""
//       payload.additionalDetails.uploadedFileNoc = formData?.owners?.uploadedFile || ""
//       payload.additionalDetails.rating = formData?.owners?.rating?.code || ""
//       payload.additionalDetails.uploadedFileGreenBuilding = formData?.owners?.greenuploadedFile || ""
//       payload.additionalDetails.use = formData?.owners?.use?.code || ""

//       // Architect info
//       payload.additionalDetails.architectName = userInfo?.name || ""
//       payload.additionalDetails.architectMobileNumber = userInfo?.mobileNumber || ""

//       // Session storage architect info (fallback to empty strings)
//       payload.additionalDetails.typeOfArchitect = "ARCHITECT"
//       payload.additionalDetails.stakeholderName = ""
//       payload.additionalDetails.stakeholderRegistrationNumber = ""
//       payload.additionalDetails.stakeholderAddress = ""
//       payload.additionalDetails.isSelfCertificationRequired = "false"

//       // Land Info structure
//       payload.landInfo = {}
//       payload.landInfo.address = {}

//       payload.landInfo.address.city = formData?.address?.city?.code || tenantId

//       if (formData?.address?.locality?.code) {
//         payload.landInfo.address.locality = { code: formData.address.locality.code }
//       } else {
//         payload.landInfo.address.locality = { code: tenantId }
//       }

//       payload.landInfo.address.pincode = formData?.address?.pincode || ""
//       payload.landInfo.address.landmark = formData?.address?.landmark || ""
//       payload.landInfo.address.street = formData?.address?.street || ""
//       payload.landInfo.address.geoLocation = formData?.address?.geoLocation || {}

//       // Owners conversion
//       const conversionOwners = []
//       if (owners.length > 0) {
//         owners.forEach((owner) => {
//           conversionOwners.push({
//             ...owner,
//             active: true,
//             name: owner.name || "",
//             emailId: owner.emailId || "",
//             aadharNumber: owner.aadharNumber || "",
//             mobileNumber: owner.mobileNumber || "",
//             isPrimaryOwner: owner.isPrimaryOwner || false,
//             gender: owner.gender?.code || owner.gender || "",
//             fatherOrHusbandName: "NAME",
//           })
//         })
//       }

//       payload.landInfo.owners = conversionOwners
//       payload.landInfo.ownershipCategory =
//         formData?.owners?.ownershipCategory?.code || formData?.owners?.ownershipCategory || ""
//       payload.landInfo.tenantId = tenantId

//       // Units - fallback to empty array if not available
//       payload.landInfo.unit = formData?.landInfo?.unit || []

//       const requestPayload = {
//         BPA: payload,
//         RequestInfo: {
//           apiId: "Rainmaker",
//           authToken: localStorage.getItem("token") || "",
//           userInfo: userInfo,
//           msgId: `${Date.now()}|en_IN`,
//           plainAccessRequest: {},
//         },
//       }

//     if (currentStepNumber < 3) {
//       console.log("Skipping API call before step 3. Only saving formData locally.");
//       return;
//     }

//     if (currentStepNumber === 3 && !applicationId) {
//       console.log(">>> CREATE API at step 3");
//       requestPayload.BPA.workflow = {
//         action: "INITIATE",
//         assignes: [userInfo.uuid],
//       };

//       const res = await Digit.OBPSService.create(requestPayload, tenantId);
//       console.log("Create API response:", res);

//       setApplicationId(res.BPA.applicationNo);
//       setParams(res.BPA);
//       return;
//     }

//     console.log(">>> UPDATE API (Save Draft), step:", currentStepNumber);
//     requestPayload.BPA.workflow = { action: "SAVE_AS_DRAFT" };

//     if (applicationId) {
//       requestPayload.BPA.applicationNo = applicationId;
//     }

//     const res = await Digit.OBPSService.update(requestPayload, tenantId);
//     console.log("Updated Draft:", res);
//     setParams(res.BPA);

//   } catch (err) {
//     console.error("Save draft failed:", err);
//   }
// };


//   return (
//     <div className="card" style={{display: "flex", flexDirection: "row", paddingTop:"100px", border:"none", boxShadow:"none"}}>
//       <div style={{width:"fit-content"}}>

//     <Stepper style={{marginRight:"100px",display:"flex", flexDirection:"row", justifyContent:"flex-start", width:"auto", maxWidth: "fit-content" }} stepsList={createEmployeeConfig} step={safeStep}  />
//       </div>
//    <div style={{width:"100%", marginLeft:"100px"}}>
//      <Switch >
//       {newConfig1.map((routeObj, index) => {
//         const { component, texts, inputs, key, currentStep } = routeObj;
//         const Component = typeof component === "string" ? Digit.ComponentRegistryService.getComponent(component) : component;

//         return (

//            <Route path={`${getPath(match.path, match.params)}/${routeObj.route}`} key={index}>
//             <Component style={{width:"100%"}}
//               config={{ texts, inputs, key }}
//               onSelect={handleSelect}
//               onSkip={handleSkip}
//               t={t}
//               formData={params}
//             />
//           </Route>



//         );
//       })}
//       <Route path={`${getPath(match.path, match.params)}/check`}>
//         <CheckPage onSubmit={createApplication} value={params} />
//       </Route>
//       <Route path={`${getPath(match.path, match.params)}/acknowledgement`}>
//         <OBPSAcknowledgement data={params} onSuccess={onSuccess} />
//       </Route>
//       <Route>
//         <Redirect to={`${getPath(match.path, match.params)}/${config.indexRoute}`} />
//       </Route>
//     </Switch>
//    </div>
//     </div>
//   );
// };

// export default NewBuildingPermit;


const NewBuildingPermit = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { path, url } = useRouteMatch()
  const { pathname, state } = useLocation()
  const match = useRouteMatch()
  const history = useHistory()
  const location = useLocation()

  // Set session storage
  if (typeof Digit !== "undefined") {
    Digit.SessionStorage.set("OBPS_PT", "true")
  }
  sessionStorage.removeItem("BPA_SUBMIT_APP")

  const currentRoute = pathname.split("/").pop()
  const [applicationId, setApplicationId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fixed step numbers mapping
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

  // Fixed stepper configuration with proper route mapping
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
    console.log("[v0] Current route:", currentRoute, "Step number:", stepNumber)
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
    if (clearParams) clearParams()
    queryClient.invalidateQueries("PT_CREATE_PROPERTY")
  }

  const createApplication = async (data) => {
    if (typeof Digit !== "undefined") {
      const response = await Digit.OBPSService.scrutinyDetails(data?.tenantId, {
        edcrNumber: data?.edcrNumber,
      })
      console.log(response, "RESPO")
    }
    history.push(`${getPath(match.path, match.params)}/acknowledgement`)
  }

  const handleSelect = async (key, data, skipStep, isFromCreateApi) => {
    setIsLoading(true)

    let updatedParams

    if (isFromCreateApi) {
      setParams(data)
      updatedParams = data
    } else if (key === "") {
      updatedParams = { ...data }
      setParams(updatedParams)
    } else {
      updatedParams = { ...params, ...{ [key]: { ...params[key], ...data } } }
      setParams(updatedParams)
    }

    console.log("[v0] payload on handleSelect", updatedParams)

    try {
      await saveDraft(updatedParams)
      goNext(skipStep)
    } catch (error) {
      console.error("[v0] Error in handleSelect:", error)
      // Don't navigate if API call fails
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {}

  // Configuration setup
  let config = []
  newConfig = newConfig?.BuildingPermitConfig ? newConfig?.BuildingPermitConfig : newConfigBPA
  if (Array.isArray(newConfig)) {
    newConfig.forEach((obj) => {
      if (obj.body && Array.isArray(obj.body)) {
        config = config.concat(obj.body.filter((a) => !a.hideInCitizen))
      }
    })
  }
  config.indexRoute = "docs-required"

  useEffect(() => {
    if (sessionStorage.getItem("isPermitApplication") && sessionStorage.getItem("isPermitApplication") === "true") {
      if (clearParams) clearParams()
      sessionStorage.setItem("isPermitApplication", "false")
    }
  }, [clearParams])

  // Component registry fallbacks
  const CheckPage =
    typeof Digit !== "undefined"
      ? Digit?.ComponentRegistryService?.getComponent("BPACheckPage")
      : ({ onSubmit, value }) => <div>Check Page Component</div>

  const OBPSAcknowledgement =
    typeof Digit !== "undefined"
      ? Digit?.ComponentRegistryService?.getComponent("BPAAcknowledgement")
      : ({ data, onSuccess }) => <div>Acknowledgement Component</div>

  const saveDraft = async (formData) => {
    try {
      const currentStepNumber = stepNumbers[currentRoute] || 1
      console.log("[v0] saveDraft called for step:", currentStepNumber, "route:", currentRoute)

      const payload = {}
      payload.edcrNumber = formData?.data?.scrutinyNumber?.edcrNumber || ""
      payload.riskType = formData?.data?.riskType || ""
      payload.applicationType = formData?.data?.applicationType || ""
      payload.serviceType = formData?.data?.serviceType || ""

      const userInfo = JSON.parse(localStorage.getItem("user-info") || "{}")
      const accountId = userInfo?.uuid

      payload.tenantId = tenantId
      payload.accountId = accountId

      // Documents handling
      const docsFromForm = formData?.documents?.documents || []
      payload.documents = docsFromForm.length > 0 ? docsFromForm : []

      // Additional Details - comprehensive structure matching owner-detail
      payload.additionalDetails = { GISPlaceName: formData?.address?.placeName || "" }
      payload.additionalDetails.boundaryWallLength = formData?.data?.boundaryWallLength || ""
      payload.additionalDetails.area =
        formData?.data?.edcrDetails?.planDetail?.planInformation?.plotArea?.toString() || ""
      payload.additionalDetails.height =
        formData?.data?.edcrDetails?.planDetail?.blocks?.[0]?.building?.buildingHeight?.toString() || ""
      payload.additionalDetails.usage = formData?.data?.occupancyType || ""
      payload.additionalDetails.builtUpArea =
        formData?.data?.edcrDetails?.planDetail?.blocks?.[0]?.building?.totalBuitUpArea?.toString() || ""

      // Owner name from owners array or fallback
      const owners = formData?.owners?.owners || []
      payload.additionalDetails.ownerName = owners.length > 0 ? owners.map((obj) => obj.name || "").join(",") : ""

      // Conditional fields - only add if data exists, otherwise empty string
      payload.additionalDetails.registrationDetails = formData?.data?.registrationDetails || ""
      payload.additionalDetails.applicationType = formData?.data?.applicationType || ""
      payload.additionalDetails.serviceType = formData?.data?.serviceType || ""
      payload.additionalDetails.wardnumber = formData?.data?.wardnumber || ""
      payload.additionalDetails.zonenumber = formData?.data?.zonenumber || ""
      payload.additionalDetails.khasraNumber = formData?.data?.khasraNumber || ""
      payload.additionalDetails.architectid = formData?.data?.architectid || ""
      payload.additionalDetails.propertyuid = formData?.data?.propertyuid || ""
      payload.additionalDetails.bathnumber = formData?.data?.bathnumber || ""
      payload.additionalDetails.kitchenNumber = formData?.data?.kitchenNumber || ""
      payload.additionalDetails.approxinhabitants = formData?.data?.approxinhabitants || ""
      payload.additionalDetails.materialusedinfloor = formData?.data?.materialusedinfloor || ""
      payload.additionalDetails.distancefromsewer = formData?.data?.distancefromsewer || ""
      payload.additionalDetails.sourceofwater = formData?.data?.sourceofwater || ""
      payload.additionalDetails.watercloset = formData?.data?.watercloset || ""
      payload.additionalDetails.materialused = formData?.data?.materialused || ""
      payload.additionalDetails.materialusedinroofs = formData?.data?.materialusedinroofs || ""

      // Owner-specific additional details
      payload.additionalDetails.approvedColony = formData?.owners?.approvedColony?.code || ""
      payload.additionalDetails.buildingStatus = formData?.owners?.buildingStatus?.code || ""
      payload.additionalDetails.greenbuilding = formData?.owners?.greenbuilding?.code || ""
      payload.additionalDetails.masterPlan = formData?.owners?.masterPlan?.code || ""
      payload.additionalDetails.proposedSite = formData?.owners?.proposedSite?.code || ""
      payload.additionalDetails.purchasedFAR = formData?.owners?.purchasedFAR?.code || ""
      payload.additionalDetails.restrictedArea = formData?.owners?.restrictedArea?.code || ""
      payload.additionalDetails.schemes = formData?.owners?.schemes?.i18nKey || ""

      if (formData?.owners?.UlbName?.code) {
        payload.additionalDetails.UlbName = formData.owners.UlbName.code
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase())
      } else {
        payload.additionalDetails.UlbName = ""
      }

      payload.additionalDetails.District = formData?.owners?.District?.code || ""
      payload.additionalDetails.nameofApprovedcolony = formData?.owners?.nameofApprovedcolony || ""
      payload.additionalDetails.NocNumber = formData?.owners?.NocNumber || ""
      payload.additionalDetails.coreArea = formData?.owners?.coreArea?.code || ""
      payload.additionalDetails.schemesselection = formData?.owners?.schemesselection?.i18nKey || ""
      payload.additionalDetails.schemeName = formData?.owners?.schemeName || ""
      payload.additionalDetails.transferredscheme = formData?.owners?.transferredscheme || ""
      payload.additionalDetails.Ulblisttype = formData?.owners?.Ulblisttype?.value || ""
      payload.additionalDetails.uploadedFileNoc = formData?.owners?.uploadedFile || ""
      payload.additionalDetails.rating = formData?.owners?.rating?.code || ""
      payload.additionalDetails.uploadedFileGreenBuilding = formData?.owners?.greenuploadedFile || ""
      payload.additionalDetails.use = formData?.owners?.use?.code || ""

      // Architect info
      payload.additionalDetails.architectName = userInfo?.name || ""
      payload.additionalDetails.architectMobileNumber = userInfo?.mobileNumber || ""

      // Session storage architect info (fallback to empty strings)
      payload.additionalDetails.typeOfArchitect = "ARCHITECT"
      payload.additionalDetails.stakeholderName = ""
      payload.additionalDetails.stakeholderRegistrationNumber = ""
      payload.additionalDetails.stakeholderAddress = ""
      payload.additionalDetails.isSelfCertificationRequired = "false"

      // Land Info structure - send null for validation issues from backend
      if (currentStepNumber < 7) {
        // Before owner-details step, send landInfo as null for validation
        payload.landInfo = null
      } else {
        // From owner-details step onwards, send proper landInfo
        payload.landInfo = {}
        payload.landInfo.address = {}

        payload.landInfo.address.city = formData?.address?.city?.code || tenantId

        if (formData?.address?.locality?.code) {
          payload.landInfo.address.locality = { code: formData.address.locality.code }
        } else {
          payload.landInfo.address.locality = { code: tenantId }
        }

        payload.landInfo.address.pincode = formData?.address?.pincode || ""
        payload.landInfo.address.landmark = formData?.address?.landmark || ""
        payload.landInfo.address.street = formData?.address?.street || ""
        payload.landInfo.address.geoLocation = formData?.address?.geoLocation || {}

        // Owners conversion
        const conversionOwners = []
        if (owners.length > 0) {
          owners.forEach((owner) => {
            conversionOwners.push({
              ...owner,
              active: true,
              name: owner.name || "",
              emailId: owner.emailId || "",
              aadharNumber: owner.aadharNumber || "",
              mobileNumber: owner.mobileNumber || "",
              isPrimaryOwner: owner.isPrimaryOwner || false,
              gender: owner.gender?.code || owner.gender || "",
              fatherOrHusbandName: "NAME",
            })
          })
        }

        payload.landInfo.owners = conversionOwners
        payload.landInfo.ownershipCategory =
          formData?.owners?.ownershipCategory?.code || formData?.owners?.ownershipCategory || ""
        payload.landInfo.tenantId = tenantId

        // Units - fallback to empty array if not available
        payload.landInfo.unit = formData?.landInfo?.unit || []
      }

      const requestPayload = {
        BPA: payload,
        RequestInfo: {
          apiId: "Rainmaker",
          authToken: localStorage.getItem("token") || "",
          userInfo: userInfo,
          msgId: `${Date.now()}|en_IN`,
          plainAccessRequest: {},
        },
      }

      if (currentStepNumber < 3) {
        console.log("[v0] Skipping API call before step 3. Only saving formData locally.")
        return
      }

      if (currentStepNumber === 3 && !applicationId) {
        console.log("[v0] >>> CREATE API at step 3 (plot-details)")
        requestPayload.BPA.workflow = {
          action: "INITIATE",
          assignes: [userInfo.uuid],
        }

        console.log("[v0] Create API payload:", JSON.stringify(requestPayload, null, 2))

        if (typeof Digit !== "undefined") {
          try {
            const res = await Digit.OBPSService.create(requestPayload, tenantId)
            console.log("[v0] Create API response:", res)
            if (res?.BPA?.applicationNo) {
              setApplicationId(res.BPA.applicationNo)
              const updatedFormData = { ...formData, ...res.BPA }
              setParams(updatedFormData)
              console.log("[v0] Application created with ID:", res.BPA.applicationNo)
            }
          } catch (error) {
            console.error("[v0] Create API failed:", error)
            throw error // Re-throw to prevent navigation
          }
        } else {
          console.log("[v0] Digit not available, mocking create API response")
          const mockApplicationId = `BPA-${Date.now()}`
          setApplicationId(mockApplicationId)
          console.log("[v0] Mock application created with ID:", mockApplicationId)
        }
        return
      }

      if (currentStepNumber > 3) {
        console.log("[v0] >>> UPDATE API (Save Draft), step:", currentStepNumber)
        requestPayload.BPA.workflow = { action: "SAVE_AS_DRAFT" }

        if (applicationId) {
          requestPayload.BPA.applicationNo = applicationId
          console.log("[v0] Using existing application ID:", applicationId)
        } else {
          console.warn("[v0] No application ID found for update API")
          return
        }

        console.log("[v0] Update API payload:", JSON.stringify(requestPayload, null, 2))

        if (typeof Digit !== "undefined") {
          try {
            const res = await Digit.OBPSService.update(requestPayload, tenantId)
            console.log("[v0] Updated Draft:", res)
            if (res?.BPA) {
              setParams(res.BPA)
            }
          } catch (error) {
            console.error("[v0] Update API failed:", error)
            throw error // Re-throw to prevent navigation
          }
        } else {
          console.log("[v0] Digit not available, mocking update API response")
          console.log("[v0] Mock update completed for application:", applicationId)
        }
      }
    } catch (err) {
      console.error("[v0] Save draft failed:", err)
      throw err // Re-throw to prevent navigation on error
    }
  }

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
        <div style={{ marginBottom: "10px", fontSize: "12px", color: "#666" }}>
          Current Route: {currentRoute} | Step: {currentStep}
        </div>
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
            <div>Processing...</div>
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