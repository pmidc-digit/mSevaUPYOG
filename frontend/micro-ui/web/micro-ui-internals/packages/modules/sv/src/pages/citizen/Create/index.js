
import React ,{Children, Fragment}from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { Config } from "../../../config/config";

const SVCreate = ({ parentRoute }) => {

  const queryClient = useQueryClient();
  const match = useRouteMatch();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const history = useHistory();
  const stateId = Digit.ULBService.getStateId();
  let config = [];
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("SV_CREATES", {});

  const vendingApplicationNo=sessionStorage.getItem("vendingApplicationID")?sessionStorage.getItem("vendingApplicationID"):null;
  const { data: vendingApplicationData } = Digit.Hooks.sv.useSvSearchApplication(
    {
      tenantId:Digit.ULBService.getCitizenCurrentTenant(true),
      filters: { applicationNumber: vendingApplicationNo,isDraftApplication:false },
        enabled: vendingApplicationNo?true:false
    },
  );
  const vendingData=vendingApplicationData?.SVDetail?.[0]

  const { data: vendingDraftData } = Digit.Hooks.sv.useSvSearchApplication(
    {
      tenantId:Digit.ULBService.getCitizenCurrentTenant(true),
      filters: {isDraftApplication:true} ,
    },
  );

  const vending_draft_data=vendingDraftData?.SVDetail?.[0]
  // function used for traversing through form screens 
  const goNext = (skipStep, index, isAddMultiple, key) => {  
    let currentPath = pathname.split("/").pop(),
      lastchar = currentPath.charAt(currentPath.length - 1),
      isMultiple = false,
      nextPage;
    if (Number(parseInt(currentPath)) || currentPath == "0" || currentPath == "-1") {
      if (currentPath == "-1" || currentPath == "-2") {
        currentPath = pathname.slice(0, -3);
        currentPath = currentPath.split("/").pop();
        isMultiple = true;
      } else {
        currentPath = pathname.slice(0, -2);
        currentPath = currentPath.split("/").pop();
        isMultiple = true;
      }
    } else {
      isMultiple = false;
    }
    if (!isNaN(lastchar)) {
      isMultiple = true;
    }
    let { nextStep = {} } = config.find((routeObj) => routeObj.route === currentPath);


    let redirectWithHistory = history.push;
    if (skipStep) {
      redirectWithHistory = history.replace;
    }
    if (isAddMultiple) {
      nextStep = key;
    }
    if (nextStep === null) {
      return redirectWithHistory(`${match.path}/check`);
    }
    if (!isNaN(nextStep.split("/").pop())) {
      nextPage = `${match.path}/${nextStep}`;
    }
     else {
      nextPage = isMultiple && nextStep !== "map" ? `${match.path}/${nextStep}/${index}` : `${match.path}/${nextStep}`;
    }

    redirectWithHistory(nextPage);
  };

  // to clear formdata if the data is present before coming to first page of form
  if(params && Object.keys(params).length>0 && window.location.href.includes("/info") && sessionStorage.getItem("docReqScreenByBack") !== "true")
    {
      clearParams();
      queryClient.invalidateQueries("SV_CREATES");
    }

  const svcreate = async () => {
    history.replace(`${match.path}/acknowledgement`);
  };

  function handleSelect(key, data, skipStep, index, isAddMultiple = false) {
    if (key === "owners") {
      let owners = params.owners || [];
      owners[index] = data;
      setParams({ ...params, ...{ [key]: [...owners] } });
    } else if (key === "units") {
      let units = params.units || [];
      // if(index){units[index] = data;}else{
      units = data;

      setParams({ ...params, units });
    } else {
      setParams({ ...params, ...{ [key]: { ...params[key], ...data } } });
    }
    goNext(skipStep, index, isAddMultiple, key);
  }

  const handleSkip = () => {};
  const handleMultiple = () => {};


  /**
   * this onSuccess dunction will execute once the application submitted successfully 
   * it will clear all the params from the session storage  and also invalidate the query client
   * as well as remove the beneficiary & disabilityStatus from the session storage
   */
  const onSuccess = () => {
    clearParams();
    queryClient.invalidateQueries("SV_CREATES");
    sessionStorage.removeItem("CategoryDocument");
    sessionStorage.removeItem("vendingApplicationID");
    sessionStorage.removeItem("ApplicationId");
    sessionStorage.removeItem("applicationStatus");
    sessionStorage.removeItem("Response");
    sessionStorage.removeItem("addressIdOne");
    sessionStorage.removeItem("addressIdTwo");
    sessionStorage.removeItem("vendorIds");
    sessionStorage.removeItem("bankIds");
    sessionStorage.removeItem("venId");
  };
  
  let commonFields = Config;
  commonFields.forEach((obj) => {
    config = config.concat(obj.body.filter((a) => !a.hideInCitizen));
  });
  
  config.indexRoute = "info";

  const SVCheckPage = Digit?.ComponentRegistryService?.getComponent("CheckPage");
  const SVAcknowledgement = Digit?.ComponentRegistryService?.getComponent("SVAcknowledgement");

  
  
  return (
    <Switch>
      {config.map((routeObj, index) => {
        const { component, texts, inputs, key } = routeObj;
        const Component = typeof component === "string" ? Digit.ComponentRegistryService.getComponent(component) : component;
        const user = Digit.UserService.getUser().info.type;
        return (
          <Route path={`${match.path}/${routeObj.route}`} key={index}>
            <Component config={{ texts, inputs, key }} onSelect={handleSelect} onSkip={handleSkip} t={t} formData={params} onAdd={handleMultiple} userType={user} editdata={pathname.includes("apply") ? {} : vendingData} previousData={vending_draft_data} />
          </Route>
        );
      })}

      
      <Route path={`${match.path}/check`}>
        <SVCheckPage onSubmit={svcreate} value={params} editdata={pathname.includes("apply") ? {} : vendingData} />
      </Route>
      <Route path={`${match.path}/acknowledgement`}>
        <SVAcknowledgement data={params} onSuccess={onSuccess}/>
      </Route>
      <Route>
        <Redirect to={`${match.path}/${config.indexRoute}`} />
      </Route>
    </Switch>
  );
};

export default SVCreate;