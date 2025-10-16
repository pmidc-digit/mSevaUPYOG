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
  const createApplication = async () => {
    history.push(`${path}/acknowledgement`);
  };

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
