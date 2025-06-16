import { Loader } from "@mseva/digit-ui-react-components";
import React from "react";
import { useRouteMatch } from "react-router-dom";
import EmployeeApp from "./pages/employee";
import CitizenApp from "./pages/citizen";
import ApplicationOverview from "./pages/employee/ApplicationOverview";
import NOCCard from "./pages/employee/EmployeeCard";
import Inbox from "./pages/employee/Inbox";
import NOCSearchApplication from "./pages/employee/SearchApplication/Search";
import PropertyDetailsForm from "./pages/employee/createNDCApplication/propertyDetailsForm";
import PropertyDetailsStep1 from "./pages/employee/createNDCApplication/PropertyDetailsStep1";
import PropertyDetailsStep2 from "./pages/employee/createNDCApplication/propertyDetailsStep2";
import PropertyDetailsFormUser from "./pages/employee/createNDCApplication/propertyDetailsFormUser";
import {NewNDCStepForm as NewNDCStepFormCitizen} from "./pages/citizen/createNCDApplication/NewNDCStepForm";
import { NewNDCStepFormOne as NewNDCStepFormOneCitizen } from "./pages/citizen/createNCDApplication/NewNDCStepFormOne";
import SelectNDCReason from "./pageComponents/SelectNDCReason";
import {PropertyDetailsForm as PropertyDetailsFormCitizen} from "./pageComponents/PropertyDetailsForm";
import {PropertySearchNSummary as NDCPropertySearch} from "./components/NDCPropertySearch"
import SelectNDCDocuments from "./pageComponents/SelectNDCDocuments"
import { NewNDCStepFormTwo as NewNDCStepFormTwoCitizen } from "./pages/citizen/createNCDApplication/NewNDCStepFormTwo";
import NDCSummary from "./pageComponents/NDCSummary"
import { NDCNewFormSummaryStepThreeCitizen } from "./pages/citizen/createNCDApplication/NDCNewFormSummaryStepThreeCitizen";
import { PayWSBillModal } from "./pageComponents/PayWSBillModal";
import { NewNDCStepForm as NewNDCStepFormEmployee } from "./pages/employee/createNDCApplication/createNDCApplicationStepperForm/NewNDCStepForm";
import { NewNDCStepFormOne as NewNDCStepFormOneEmployee } from "./pages/employee/createNDCApplication/createNDCApplicationStepperForm/NewNDCStepFormOne";
import { NewNDCStepFormTwo as NewNDCStepFormTwoEmployee } from "./pages/employee/createNDCApplication/createNDCApplicationStepperForm/NewNDCStepFormTwo";
import { NDCNewFormSummaryStepThreeEmployee } from "./pages/employee/createNDCApplication/createNDCApplicationStepperForm/NDCNewFormSummaryStepThreeEmployee";

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
    return <CitizenApp />;
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
  PropertyDetailsFormUser,
  NewNDCStepFormCitizen,
  SelectNDCReason,
  NewNDCStepFormOneCitizen,
  PropertyDetailsFormCitizen,
  NDCPropertySearch,
  SelectNDCDocuments,
  NewNDCStepFormTwoCitizen,
  NDCSummary,
  NDCNewFormSummaryStepThreeCitizen,
  PayWSBillModal,
  NewNDCStepFormEmployee,
  NewNDCStepFormOneEmployee,
  NewNDCStepFormTwoEmployee,
  NDCNewFormSummaryStepThreeEmployee
};

export const initNDCComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
