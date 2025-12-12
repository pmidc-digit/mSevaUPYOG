import { CitizenHomeCard, Loader, PTIcon } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import TestComp from "./pageComponents/TestComp";
import CHBStepperForm from "./pageComponents/CHBStepper/CHBStepperForm";
import CHBStepFormOne from "./pageComponents/CHBStepper/CHBStepFormOne";
import CHBStepFormTwo from "./pageComponents/CHBStepper/CHBStepFormTwo";
import CHBStepFormThree from "./pageComponents/CHBStepper/CHBStepFormThree";
import CHBStepFormFour from "./pageComponents/CHBStepper/CHBStepFormFour";
import CHBCitizenDetailsNew from "./pageComponents/CHBCitizenDetailsNew";
import CHBCitizenSecond from "./pageComponents/CHBCitizenSecond";
import CHBSelectProofIdentity from "./pageComponents/CHBSelectProofIdentity";
import CHBSummary from "./pageComponents/CHBSummary";
import getRootReducer from "../redux/reducer";
import EmployeeApp from "./pages/employee";
import CitizenApp from "./pages/citizen";
import GCMyApplications from "./pages/citizen/MyChallan";
import GCApplicationDetails from "./pages/citizen/ChallanApplicationDetails";
import GCResponseCitizen from "./components/GCResponseCitizen";
import ApplicationDetails from "./pages/employee/ApplicationDetails";

export const GarbageCollectionModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "UC";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });
  Digit.SessionStorage.set("ChallanGeneration_TENANTS", tenants);
  if (isLoading) {
    return <Loader />;
  }
  const { path, url } = useRouteMatch();

  if (userType === "employee") {
    return <EmployeeApp path={path} url={url} userType={userType} />;
  } else return <CitizenApp />;
};

export const GarbageCollectionLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("PT_CREATE_PROPERTY112", {});

  useEffect(() => {
    clearParams();
  }, []);

  const links = [
    {
      link: `${matchPath}/my-applications`,
      i18nKey: t("GC_MY_APPLICATION"),
    },
    {
      link: `${matchPath}/create-application`,
      i18nKey: t("GC_CREATE_APPLICATION"),
    },
  ];

  return <CitizenHomeCard header={t("ACTION_TEST_MCOLLECT")} links={links} Icon={() => <PTIcon className="fill-path-primary-main" />} />;
};

export const GarbageReducers = getRootReducer;

const componentsToRegister = {
  TestComp,
  CHBStepperForm,
  CHBStepFormOne,
  CHBStepFormTwo,
  CHBStepFormThree,
  CHBStepFormFour,
  CHBCitizenDetailsNew,
  CHBCitizenSecond,
  CHBSelectProofIdentity,
  CHBSummary,
  GCMyApplications,
  GCApplicationDetails,
  GCResponseCitizen,
  ApplicationDetails,
};

export const initGarbageCollectionComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
