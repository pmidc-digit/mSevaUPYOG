import { Loader } from "@mseva/digit-ui-react-components";
import React from "react";
import { useRouteMatch } from "react-router-dom";
import EmployeeApp from "./pages/employee";
import ApplicationOverview from "./pages/employee/ApplicationOverview";
import NOCCard from "./pages/employee/EmployeeCard";
import Inbox from "./pages/employee/Inbox";
import NOCSearchApplication from "./pages/employee/SearchApplication/Search";
import PropertyDetailsForm from "./pages/employee/createNDCApplication/propertyDetailsForm";
import PropertyDetailsStep1 from "./pages/employee/createNDCApplication/PropertyDetailsStep1";
import PropertyDetailsStep2 from "./pages/employee/createNDCApplication/propertyDetailsStep2";
import PropertyDetailsFormUser from "./pages/employee/createNDCApplication/propertyDetailsFormUser";
import ndcDetailsSummary from "./pages/employee/createNDCApplication/ndcDetailsSummary";
import getRootReducer from "./redux/reducers";

export const NDCReducers = getRootReducer;

const NDCModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "common-noc";
  const { path, url } = useRouteMatch();
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });

  Digit.SessionStorage.set("NOC_TENANTS", tenants);

  if (isLoading) {
    return <Loader />;
  }

  if (userType === "citizen") {
    return <div></div>;
  }

  return <EmployeeApp path={path} stateCode={stateCode} />;
};

const componentsToRegister = {
  NDCModule,
  NOCCard,
  NOCApplicationOverview: ApplicationOverview,
  NDCInbox: Inbox,
  NOCSearchApplication,
  PropertyDetailsForm,
  PropertyDetailsStep1,
  PropertyDetailsStep2,
  ndcDetailsSummary,
  PropertyDetailsFormUser,
};

export const initNDCComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
