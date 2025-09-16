import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useRouteMatch, useLocation, useHistory, Switch, Route, Redirect } from "react-router-dom";
import { newConfig as newConfigBPA } from "../../../config/buildingPermitConfig";
import { newConfig1 } from "./NewConfig";
import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
import { Loader } from "@mseva/digit-ui-react-components";
import { update } from "lodash";
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

const handleAPICall = async (data, skipStep) => {
  const currentPath = pathname.split("/").pop();
  const currentStepNumber = stepNumbers[currentPath];
  const applicationNumber = sessionStorage.getItem("BPA_APPLICATION_NUMBER");

  const BPA = buildPayload(data, applicationNumber); // Pass applicationNumber if available
  console.log("Step:", currentStepNumber, "| BPA Payload:", BPA);

  try {
    if (currentStepNumber === 3) {
      if (!applicationNumber) {
        // No application yet -> Create
        const result = await Digit.OBPSService.create({ BPA }, tenantId);
        const newAppNo = result?.BPA?.[0]?.applicationNo;
        sessionStorage.setItem("BPA_APPLICATION_NUMBER", newAppNo);
        console.log("Create API called successfully at step 3", newAppNo);
      } else {
        // Application already exists -> Update
        await Digit.OBPSService.update({ BPA }, tenantId);
        console.log("Update API called successfully at step 3", applicationNumber);
      }
    } else if (currentStepNumber > 3) {
      // For steps after 3 → always update
      await Digit.OBPSService.update({ BPA }, tenantId);
      console.log("Update API called successfully at step", currentStepNumber, "for", applicationNumber);
    }
  } catch (error) {
    console.error("API failed at step", currentStepNumber, ":", error);
  }

  // Always move to next step
  goNext(skipStep);
};



const searchApplication = async () => {
  const applicationNumber = sessionStorage.getItem("BPA_APPLICATION_NUMBER");

  //Application 
  try {
    const response = await Digit.OBPSService.BPASearch(tenantId, {applicationNo: applicationNumber})
    const dataForSessionStorage = transformBPAResponse(response)
    const formData = JSON.parse(sessionStorage.getItem("Digit.BUILDING_PERMIT"));
    sessionStorage.setItem("Digit.BUILDING_PERMIT", JSON.stringify({...formData, value: {...formData.value, ...dataForSessionStorage}}))
  }
    catch(error){
      alert(error.message);
    }
  }

// 🛠️ Transformer function
function transformBPAResponse(apiResponse) {
  if (!apiResponse?.BPA) return null;

  const bpa = apiResponse?.BPA?.[0];

  // --- Extract core details ---
  const { id, applicationNo, approvalNo, accountId, edcrNumber, applicationType,
          riskType, businessService, landId, tenantId, approvalDate, applicationDate,
          status, documents, landInfo, workflow, auditDetails, additionalDetails } = bpa;

  // --- Owner mapping (UI expects owners object + owners array) ---
  const ownersArray = landInfo?.owners || [];
  const ownersObject = {
    approvedColony: { code: additionalDetails?.approvedColony, i18nKey: additionalDetails?.approvedColony },
    use: "",
    UlbName: landInfo?.address?.city?.name,
    Ulblisttype: landInfo?.address?.city?.ulbType,
    District: landInfo?.address?.city?.districtName,
    rating: "",
    masterPlan: { code: additionalDetails?.masterPlan, i18nKey: additionalDetails?.masterPlan },
    buildingStatus: { code: additionalDetails?.buildingStatus, i18nKey: additionalDetails?.buildingStatus },
    purchasedFAR: { code: additionalDetails?.purchasedFAR, i18nKey: additionalDetails?.purchasedFAR },
    greenbuilding: { code: additionalDetails?.greenbuilding, i18nKey: additionalDetails?.greenbuilding },
    restrictedArea: { code: additionalDetails?.restrictedArea, i18nKey: additionalDetails?.restrictedArea },
    proposedSite: { code: additionalDetails?.proposedSite, i18nKey: additionalDetails?.proposedSite },
    nameofApprovedcolony: additionalDetails?.nameofApprovedcolony,
    schemeName: "",
    transferredscheme: additionalDetails?.transferredscheme,
    NocNumber: "",
    ecbcElectricalLoad: { code: additionalDetails?.ecbcElectricalLoad || "NO", i18nKey: additionalDetails?.ecbcElectricalLoad || "NO" },
    ecbcDemandLoad: { code: additionalDetails?.ecbcDemandLoad || "NO", i18nKey: additionalDetails?.ecbcDemandLoad || "NO" },
    ecbcAirConditioned: { code: additionalDetails?.ecbcAirConditioned || "NO", i18nKey: additionalDetails?.ecbcAirConditioned || "NO" },
    owners: ownersArray,
    ownershipCategory: { code: landInfo?.ownershipCategory, i18nKey: landInfo?.ownershipCategory }
  };

  // --- Document mapping ---
  const documentArray = Array.isArray(documents) ? documents : documents?.documents || [];

  // --- Block & SubOccupancy mapping ---
  const BlockIds = {};
  const subOccupancy = {};
  landInfo?.unit?.forEach((unit, idx) => {
    const blockKey = `Block_${idx + 1}`;
    BlockIds[blockKey] = unit.id;
    subOccupancy[blockKey] = [{
      code: unit.usageCategory,
      name: "Residential", // 🔹 you might want to map usageCategory → readable name
      i18nKey: `BPA_SUBOCCUPANCYTYPE_${unit.usageCategory}`
    }];
  });

  // --- Data object for form prefill ---
  const data = {
    scrutinyNumber: { edcrNumber },
    applicantName: additionalDetails?.ownerName,
    occupancyType: additionalDetails?.usage,
    applicationType,
    serviceType: additionalDetails?.serviceType,
    applicationDate,
    riskType,
    registrationDetails: additionalDetails?.registrationDetails,
    boundaryWallLength: additionalDetails?.boundaryWallLength,
    wardnumber: additionalDetails?.wardnumber,
    zonenumber: additionalDetails?.zonenumber,
    khasraNumber: additionalDetails?.khasraNumber,
    architectid: additionalDetails?.architectid,
    propertyuid: additionalDetails?.propertyuid,
    bathnumber: additionalDetails?.bathnumber,
    kitchenNumber: additionalDetails?.kitchenNumber,
    approxinhabitants: additionalDetails?.approxinhabitants,
    distancefromsewer: additionalDetails?.distancefromsewer,
    sourceofwater: additionalDetails?.sourceofwater,
    watercloset: additionalDetails?.watercloset,
    materialused: additionalDetails?.materialused,
    materialusedinfloor: additionalDetails?.materialusedinfloor,
    materialusedinroofs: additionalDetails?.materialusedinroofs
  };

  // --- Final transformed object (dummy data shape) ---
  return {
    id,
    applicationNo,
    approvalNo,
    accountId,
    edcrNumber,
    applicationType,
    riskType,
    businessService,
    landId,
    tenantId,
    approvalDate,
    applicationDate,
    status,
    documents: { documents: documentArray },
    landInfo,
    workflow,
    auditDetails,
    additionalDetails,
    owners: ownersObject,
    address: landInfo?.address,
    placeName: additionalDetails?.GISPlaceName || "",
    data,
    BlockIds,
    subOccupancy,
    uiFlow: {
      flow: "BPA",
      applicationType,
      serviceType: additionalDetails?.serviceType
    }
  };
}



function buildPayload({ data = {}, storedData = {}, createResponse = {}, applicationNo, id, isUpdate = false }) {
  const userInfo = Digit.UserService.getUser()
  const accountId = userInfo?.info?.uuid
  const sessionData = JSON.parse(sessionStorage.getItem("Digit.BUILDING_PERMIT") || "{}")
  const sessionApplicationNo = sessionData?.value?.applicationNo || null
  const sessionBusinessService = sessionData?.value?.businessService || null
  const sessionLandId = sessionData?.value?.landId || null
  const sessionId = sessionData?.value?.id || null


  const finalApplicationNo = applicationNo ?? sessionApplicationNo ?? createResponse?.applicationNo ?? null
  const finalId = id ?? sessionId ?? createResponse?.id ?? null
  const finalBusinessService = sessionBusinessService || createResponse?.businessService || "BPA_LOW"
  const finalLandId = sessionLandId || createResponse?.landId || null
  
  const isUpdateOperation = !!(finalId || finalApplicationNo || createResponse?.id || createResponse?.applicationNo)

  console.log(finalApplicationNo, finalId, finalBusinessService, finalLandId, "this is payload")
  console.log("data at owner detail", data)

  const currentPath = pathname.split("/").pop();
  const currentStepNumber = stepNumbers[currentPath];




  // Build documents
  const documentsArray = []
  if (data?.documents) {
    Object.entries(data.documents).forEach(([key, value]) => {
      if (value) {
        documentsArray.push({
          documentType: key.toUpperCase(),
          fileStoreId: value,
          fileStore: null,
        })
      }
    })
  }

  const workflowAction = isUpdateOperation ? "SAVE_AS_DRAFT" : "INITIATE"

  const basePayload = {
    edcrNumber: data?.scrutinyNumber?.edcrNumber || data?.edcrDetails?.edcrNumber || createResponse?.edcrNumber || "",
    riskType: data?.riskType || createResponse?.riskType || "LOW",
    applicationType: data?.applicationType || "BUILDING_PLAN_SCRUTINY",
    serviceType: data?.serviceType || "NEW_CONSTRUCTION",
    tenantId: tenantId,
    accountId,
    documents: documentsArray,

    additionalDetails: {
      GISPlaceName: data?.placeName || "",
      boundaryWallLength: data?.boundaryWallLength || "",
      area: data?.area || "",
      height: data?.height || "",
      usage: data?.occupancyType || "",
      builtUpArea: data?.builtUpArea || "",
      ownerName: storedData?.landInfo?.owners?.map((o) => o.name).join(",") || "",
      registrationDetails: data?.registrationDetails || "",
      wardnumber: data?.wardnumber || "",
      zonenumber: data?.zonenumber || "",
      khasraNumber: data?.khasraNumber || "",
      architectid: data?.architectid || "",
      propertyuid: data?.propertyuid || "",
      bathnumber: data?.bathnumber || "",
      kitchenNumber: data?.kitchenNumber || "",
      approxinhabitants: data?.approxinhabitants || "",
      materialusedinfloor: data?.materialusedinfloor || "",
      distancefromsewer: data?.distancefromsewer || "",
      sourceofwater: data?.sourceofwater || "",
      watercloset: data?.watercloset || "",
      materialused: data?.materialused || "",
      materialusedinroofs: data?.materialusedinroofs || "",

      applicationType: "BUILDING_PLAN_SCRUTINY",
      serviceType: "NEW_CONSTRUCTION",
      approvedColony: data?.approvedColony || "",
      buildingStatus: data?.buildingStatus || "",
      greenbuilding: data?.greenbuilding || "",
      masterPlan: data?.masterPlan || "",
      proposedSite: data?.proposedSite || "",
      purchasedFAR: data?.purchasedFAR || "",
      restrictedArea: data?.restrictedArea || "",
      nameofApprovedcolony: data?.nameofApprovedcolony || "",
      transferredscheme: data?.transferredscheme || "",
      architectName: data?.architectName || "",
      architectMobileNumber: data?.architectMobileNumber || "",
      typeOfArchitect: "ARCHITECT",
      stakeholderName: data?.stakeholderName || null,
      stakeholderRegistrationNumber: data?.stakeholderRegistrationNumber || null,
      stakeholderAddress: data?.stakeholderAddress || null,
      isSelfCertificationRequired: "false",
    },
    ...(isUpdateOperation && {
      id: finalId,
      applicationNo: finalApplicationNo,
      businessService: finalBusinessService,
      landId: finalLandId,
      status: createResponse?.status || "INITIATED",
    }),

   landInfo:
  isUpdateOperation && currentStepNumber >= 7
    ? {
        ...createResponse?.landInfo,
        owners: data?.landInfo?.owners || createResponse?.landInfo?.owners || [],
        ownershipCategory: data?.landInfo?.ownershipCategory || createResponse?.landInfo?.ownershipCategory || "",
        address: {
          city: tenantId,
          locality: { code: "ALOC1" },
          ...createResponse?.landInfo?.address,
          ...(data?.landInfo?.address || {}),
        },
        tenantId: tenantId,
        unit: data?.landInfo?.unit || createResponse?.landInfo?.unit || [],
      }
    : null,

    workflow: {
      action: workflowAction,
      assignes: [accountId],
    },

    ...(createResponse?.auditDetails && { auditDetails: createResponse.auditDetails }),
  }

  return basePayload
}

  const handleSelect = (key, data, skipStep, isFromCreateApi) => {
    console.log("LocationAPI 2", key, data);
    if (isFromCreateApi) setParams(data);
    else if (key === "") setParams({ ...data });
    else setParams({ ...params, ...{ [key]: { ...params[key], ...data } } });
    // goNext(skipStep);
    // handleAPICall();

    
      const updated = Digit.SessionStorage.get("BUILDING_PERMIT");
      console.log("UpdatedSessionStorage",updated)
      handleAPICall(updated, skipStep);
  };
  


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
                    onLoad={searchApplication}
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

