import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useRouteMatch, useLocation, useHistory, Switch, Route, Redirect } from "react-router-dom";
import { newConfig as newConfigBPAREG } from "../../../config/stakeholderConfig";
import Stepper  from "../../../../../../react-components/src/customComponents/Stepper";
// import CheckPage from "./CheckPage";
// import StakeholderAcknowledgement from "./StakeholderAcknowledgement";

const StakeholderRegistration = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { path, url } = useRouteMatch();
  const { pathname, state } = useLocation();
  const history = useHistory();
  const isMobile = window.Digit.Utils.browser.isMobile();

  const tenantId = window?.localStorage?.getItem("CITIZEN.CITY");
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage(
    "BUILDING_PERMIT",
    state?.edcrNumber ? { data: { scrutinyNumber: { edcrNumber: state?.edcrNumber } } } : {}
  );

  console.log("params in StakeholderRegistration", params, state);

  const stepperConfig = [
  {
    head: "Applicant Details",
    stepLabel: "BPA_LICENSE_DETAILS_LABEL",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "dummy",
  },
  {
    head: "NDC_DOCUMENTS_REQUIRED",
    stepLabel: "BPA_NEW_ADDRESS_HEADER_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "dummy",
  },
  {
    head: "NDC_DOCUMENTS_REQUIRED",
    stepLabel: "BPA_DOC_DETAILS_SUMMARY",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "dummy",
  },
  {
    head: "Summary",
    stepLabel: "BPA_STEPPER_SUMMARY_HEADER",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "dummy",
  },
];

  const stateId = Digit.ULBService.getStateId();
  let { data: newConfig } = Digit.Hooks.obps.SearchMdmsTypes.getFormConfig(stateId, []);

  const goNext = (skipStep) => {
    const currentPath = pathname.split("/").pop();
    const { nextStep } = config.find((routeObj) => routeObj.route === currentPath);
    let redirectWithHistory = history.push;
    if (nextStep === null) {
      return redirectWithHistory(`${path}/check`);
    }
    redirectWithHistory(`${path}/${nextStep}`);
  };

  const onSuccess = (data) => {
    clearParams();
    queryClient.invalidateQueries("PT_CREATE_PROPERTY");
    console.log("Mutationdata 1", data);
    sessionStorage.setItem("isStakeholderRegistered", true);
    sessionStorage.setItem("stakeholder.mutationData", JSON.stringify(data));
  };

  const createApplication = async (selectedAction) => {
    console.log("createApplication called with action:", selectedAction)

    // If no action provided (initial submission), just navigate to acknowledgement
    if (!selectedAction) {
      history.push(`${path}/acknowledgement`)
      return
    }

    // Extract action string from action object or use directly if it's a string
    let actionString = typeof selectedAction === "object" ? selectedAction.action : selectedAction

    console.log("Action string extracted:", actionString)

    // Build the UPDATE payload with the workflow action
    const formData = params?.formData || params
    const result = params?.result

    if (!result?.Licenses?.[0]?.id) {
      console.error("No license ID found for update")
      history.push(`${path}/acknowledgement`)
      return
    }

    const licenseData = result.Licenses[0]

    const currentState = licenseData?.status || selectedAction?.state?.state
    if (currentState === "CITIZEN_ACTION_REQUIRED") {
      console.log("State is CITIZEN_ACTION_REQUIRED, forcing action to RESUBMIT")
      actionString = "RESUBMIT"
    }

    const payload = {
      Licenses: [
        {
          // Place action FIRST before any other properties
          action: actionString,
          assignee: typeof selectedAction === "object" ? selectedAction.assignee : null,
          wfDocuments: typeof selectedAction === "object" ? selectedAction.wfDocuments : null,

          // Then all other properties
          id: licenseData.id,
          tenantId: licenseData.tenantId,
          businessService: licenseData.businessService,
          licenseType: licenseData.licenseType,
          applicationType: licenseData.applicationType,
          workflowCode: licenseData.workflowCode,
          licenseNumber: licenseData.licenseNumber,
          applicationNumber: licenseData.applicationNumber,
          oldLicenseNumber: licenseData.oldLicenseNumber,
          propertyId: licenseData.propertyId,
          oldPropertyId: licenseData.oldPropertyId,
          accountId: licenseData.accountId,
          tradeName: licenseData.tradeName,
          applicationDate: licenseData.applicationDate,
          commencementDate: licenseData.commencementDate,
          issuedDate: licenseData.issuedDate,
          financialYear: licenseData.financialYear,
          validFrom: licenseData.validFrom,
          validTo: licenseData.validTo,
          status: licenseData.status,
          tradeLicenseDetail: licenseData.tradeLicenseDetail,
          calculation: licenseData.calculation,
          fileStoreId: licenseData.fileStoreId,
          sortNumber: licenseData.sortNumber,
          modifiedTime: licenseData.modifiedTime,
          type: licenseData.type,
        },
      ],
    }


    try {
      const response = await Digit.OBPSService.BPAREGupdate(payload, tenantId)
      console.log("UPDATE response:", response)

      sessionStorage.setItem("workflowActionCompleted", "true")
      sessionStorage.setItem("workflowActionType", actionString)

      const updatedParams = {
        ...params,
        result: response,
        workflowActionCompleted: true, // Flag to indicate workflow action was already processed
      }
      setParams(updatedParams)

      history.push({
        pathname: `${path}/acknowledgement`,
        state: {
          skipUpdate: true, // Tell acknowledgement not to make another UPDATE call
          updatedResult: response,
          workflowAction: actionString,
        },
      })
    } catch (error) {
      console.error("UPDATE API Error:", error?.response?.data?.Errors)
      // Still navigate to acknowledgement even on error (or show error toast)
      history.push(`${path}/acknowledgement`)
    }
  }



  const handleSelect = (key, data, skipStep, isFromCreateApi) => {
    if (isFromCreateApi) setParams(data);
    else if (key === "") setParams({ ...data });
    else setParams({ ...params, ...{ [key]: { ...params[key], ...data } } });
    goNext(skipStep);
  };
  const handleSkip = () => {};

  // const state = tenantId.split(".")[0];
  let config = [];
  newConfig = newConfig?.StakeholderConfig ? newConfig?.StakeholderConfig : newConfigBPAREG;
  newConfigBPAREG.forEach((obj) => {
    config = config.concat(obj.body.filter((a) => !a.hideInCitizen));
  });
  config.indexRoute = "stakeholder-docs-required";

  useEffect(() => {
    if (sessionStorage.getItem("isPermitApplication") && sessionStorage.getItem("isPermitApplication") == "true") {
      clearParams();
      sessionStorage.setItem("isPermitApplication", false);
    }
  }, []);

  const currentStepOBJ = config.find((routeObj) => routeObj.route === pathname.split("/").pop());
  const currentStep = currentStepOBJ?.step ? parseInt(currentStepOBJ?.step) : window.location.href.includes("check") ? 4 : 0;
  const CheckPage = Digit?.ComponentRegistryService?.getComponent("StakeholderCheckPage");
  const StakeholderAcknowledgement = Digit?.ComponentRegistryService?.getComponent("StakeholderAcknowledgement");

  console.log("formData in StakeholderRegistration", params);
  console.log("config in StakeholderRegistration", config);
  return (
    <div style={{display: "flex", flexDirection: "row"}}>
    {!(window.location.href.includes("stakeholder-docs-required") || window.location.href.includes("acknowledgement")) && !isMobile &&<div>
    <Stepper stepsList={stepperConfig} step={currentStep} />
    </div>}
    <div style={{flexGrow: 1}}>
    <Switch>
      {config.map((routeObj, index) => {
        const { component, texts, inputs, key } = routeObj;
        const Component = typeof component === "string" ? Digit.ComponentRegistryService.getComponent(component) : component;
        return (
          <Route path={`${path}/${routeObj.route}`} key={index}>
            <Component config={{ texts, inputs, key }} onSelect={handleSelect} onSkip={handleSkip} t={t} formData={params} />
          </Route>
        );
      })}
      <Route path={`${path}/check`}>
        <CheckPage onSubmit={createApplication} value={params} />
      </Route>
      <Route path={`${path}/acknowledgement`}>
        <StakeholderAcknowledgement data={params} onSuccess={onSuccess} />
      </Route>
      <Route>
        <Redirect to={`${path}/${config.indexRoute}`} />
      </Route>
    </Switch>
    </div>
    </div>
  );
};

export default StakeholderRegistration;
