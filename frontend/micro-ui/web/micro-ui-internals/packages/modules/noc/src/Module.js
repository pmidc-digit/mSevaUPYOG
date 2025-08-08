import { Loader } from "@mseva/digit-ui-react-components";
import React from "react";
import { useRouteMatch } from "react-router-dom";
import EmployeeApp from "./pages/employee";
import ApplicationOverview from "./pages/employee/ApplicationOverview";
import NOCCard from "./pages/employee/EmployeeCard";
import Inbox from "./pages/employee/Inbox";
import NOCSearchApplication from "./pages/employee/SearchApplication/Search";
import getRootReducer from "./redux/reducer";

import NewNOCStepperForm from "./pageComponents/NewNOCStepper/NewNOCStepperForm";
import NewNOCStepFormOne from "./pageComponents/NewNOCStepper/NewNOCStepFormOne";
import NewNOCStepFormTwo from "./pageComponents/NewNOCStepper/NewNOCStepFormTwo";
import NewNOCStepFormThree from "./pageComponents/NewNOCStepper/NewNOCStepFormThree";
import NewNOCStepFormFour from "./pageComponents/NewNOCStepper/NewNOCStepFormFour";

import NOCApplicantDetails from "./pageComponents/NOCApplicantDetails";
import NOCProfessionalDetails from "./pageComponents/NOCProfessionalDetails";
import NOCSiteDetails from "./pageComponents/NOCSiteDetails";
import NOCSpecificationDetails from "./pageComponents/NOCSpecificationDetails";
import NOCDocumentsRequired from "./pageComponents/NOCDocumentsRequired";
import NOCSummary from "./pageComponents/NOCSummary";
import NOCDocumentWithLatLong from "./pageComponents/NOCDocumentWithLatLong";


const NOCModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "noc";
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

export const NOCReducers = getRootReducer;

const componentsToRegister = {
  NOCModule,
  NOCCard,
  NOCApplicationOverview: ApplicationOverview,
  NOCInbox: Inbox,
  NOCSearchApplication,
  NewNOCStepperForm,
  NewNOCStepFormOne,
  NewNOCStepFormTwo,
  NewNOCStepFormThree,
  NewNOCStepFormFour,
  NOCApplicantDetails,
  NOCProfessionalDetails,
  NOCSiteDetails,
  NOCSpecificationDetails,
  NOCDocumentsRequired,
  NOCSummary,
  NOCDocumentWithLatLong
};

export const initNOCComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
