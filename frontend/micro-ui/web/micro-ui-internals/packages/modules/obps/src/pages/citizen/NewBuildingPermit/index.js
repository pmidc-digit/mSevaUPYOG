import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useRouteMatch, useLocation, useHistory, Switch, Route, Redirect } from "react-router-dom";
import { newConfig as newConfigBPA } from "../../../config/buildingPermitConfig";
import { newConfig1 } from "./NewConfig";
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
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();
  const { pathname, state } = useLocation();
  const match = useRouteMatch();
  const history = useHistory();
  const location = useLocation();
  Digit.SessionStorage.set("OBPS_PT", "true");
  sessionStorage.removeItem("BPA_SUBMIT_APP");
const currentRoute = pathname.split("/").pop();

const [applicationId, setApplicationId] = useState(null)



// find index of the current step
const currentStep = newConfig1.findIndex((r) => r.route === currentRoute);

console.log("Current Step:", currentStep); 

  const stepNumbers = {
  "docs-required": 1,
  "basic-details": 2,
  "plots-details": 3,
  "scrutiny-details" : 4,
  "location" : 5,
  "additional-building-details" : 6,
  "owner-details": 7,
  "document-details": 8,
  "check": 9
};

  
  
  const tenantId = window.location.href.includes("citizen") ? localStorage.getItem("CITIZEN.CITY") : Digit.ULBService.getCurrentTenantId();
  // const { mutate: updateApplication, isLoading } = Digit.Hooks.obps.useObpsAPI(tenantId);
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage(
    "BUILDING_PERMIT",
    state?.edcrNumber ? { data: { scrutinyNumber: { edcrNumber: state?.edcrNumber } } } : {}
  );
  const stateId = Digit.ULBService.getStateId();
  let { data: newConfig } = Digit.Hooks.obps.SearchMdmsTypes.getFormConfig(stateId, []);
  console.log(newConfig, "DATATATATA");
  const goNext = (skipStep) => {
    const currentPath = pathname.split("/").pop();
    const { nextStep } = newConfig1.find((routeObj) => routeObj.route === currentPath);
    let redirectWithHistory = history.push;
    if (nextStep === null) {
      return redirectWithHistory(`${getPath(match.path, match.params)}/check`);
    }
    redirectWithHistory(`${getPath(match.path, match.params)}/${nextStep}`);
  };

  const onSuccess = () => {
    //clearParams();
    queryClient.invalidateQueries("PT_CREATE_PROPERTY");
  };
  const createApplication = async (data) => {
    const response = await Digit.OBPSService.scrutinyDetails(data?.tenantId, {
      edcrNumber: data?.edcrNumber,
    });
    console.log(response, "RESPO");
    history.push(`${getPath(match.path, match.params)}/acknowledgement`);
  };


  const handleSelect = (key, data, skipStep, isFromCreateApi) => {
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

    console.log("payload on handleSelect", updatedParams)

    saveDraft(updatedParams)

    goNext(skipStep)
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


  // const saveDraft = async (formData) => {
  //   try {
  //     const currentStepNumber = stepNumbers[currentRoute] || 1

  //     const draftPayload = {
  //       BPA: {
  //         ...formData,
  //         tenantId,
  //       },
  //     }

  //     if (currentStepNumber === 1 && !applicationId) {
  //       console.log(">>> Going to CREATE, step:", currentStepNumber)
  //       draftPayload.BPA.workflow = { action: "INITIATE" }

  //       const res = await Digit.OBPSService.create(draftPayload, tenantId)
  //       console.log("Create API called, response:", res)

  //       setApplicationId(res.BPA.applicationNo)
  //       setParams(res.BPA)

  //       console.log("Application initiated successfully");
  //     } else {
  //       console.log(">>> Going to UPDATE, step:", currentStepNumber)
  //       draftPayload.BPA.workflow = { action: "SAVE_AS_DRAFT" }

  //       if (applicationId) {
  //         draftPayload.BPA.applicationNo = applicationId
  //       }

  //       const res = await Digit.OBPSService.update(draftPayload, tenantId)
  //       console.log("Updated Draft:", res)
  //       setParams(res.BPA)

  //       console.log("Draft saved successfully");
  //     }
  //   } catch (err) {
  //     console.error("Save draft failed:", err)
    
  //   }
  // }


  const saveDraft = async (formData) => {
    try {
      const currentStepNumber = stepNumbers[currentRoute] || 1

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

      // Land Info structure
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

      if (currentStepNumber === 1 && !applicationId) {
        console.log(">>> Going to CREATE, step:", currentStepNumber)
        requestPayload.BPA.workflow = {
          action: "INITIATE",
          assignes: [userInfo.uuid],
        }

        const res = await Digit.OBPSService.create(requestPayload, tenantId)
        console.log("Create API called, response:", res)

        setApplicationId(res.BPA.applicationNo)
        setParams(res.BPA)

        console.log("Application initiated successfully");
      } else {
        console.log(">>> Going to UPDATE, step:", currentStepNumber)
        requestPayload.BPA.workflow = { action: "SAVE_AS_DRAFT" }

        if (applicationId) {
          requestPayload.BPA.applicationNo = applicationId
        }

        const res = await Digit.OBPSService.update(requestPayload, tenantId)
        console.log("Updated Draft:", res)
        setParams(res.BPA)

        console.log("Draft saved successfully");
      }
    } catch (err) {
      console.error("Save draft failed:", err)
     
    }
  }


  return (
    <Switch>
      {newConfig1.map((routeObj, index) => {
        const { component, texts, inputs, key, currentStep } = routeObj;
        const Component = typeof component === "string" ? Digit.ComponentRegistryService.getComponent(component) : component;

        return (
          // <Route path={`${getPath(match.path, match.params)}/${routeObj.route}`} key={index}>
          //   <Component config={{ texts, inputs, key }} onSelect={handleSelect} onSkip={handleSkip} t={t} formData={params} />
          // </Route>
           <Route path={`${getPath(match.path, match.params)}/${routeObj.route}`} key={index}>
            <Component
              config={{ texts, inputs, key }}
              onSelect={handleSelect}
              onSkip={handleSkip}
              t={t}
              formData={params}
            />
          </Route>



        );
      })}
      <Route path={`${getPath(match.path, match.params)}/check`}>
        <CheckPage onSubmit={createApplication} value={params} />
      </Route>
      <Route path={`${getPath(match.path, match.params)}/acknowledgement`}>
        <OBPSAcknowledgement data={params} onSuccess={onSuccess} />
      </Route>
      <Route>
        <Redirect to={`${getPath(match.path, match.params)}/${config.indexRoute}`} />
      </Route>
    </Switch>
  );
};

export default NewBuildingPermit;
