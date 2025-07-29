import { Header, CitizenHomeCard } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";

import CitizenApp from "./pages/citizen";
import ADSCreate from "./pages/citizen/Create";
import ADSSearch from "./pageComponents/ADSearch";
import { CHBIcon } from "./components/CHBIcon";
import ADSCitizenDetails from "./pageComponents/ADSCitizenDetails";
import ADSAddress from "./pageComponents/ADSAddress";
import ADSDocumentDetails from "./pageComponents/ADSDocumentDetails";
import ADSCheckPage from "./pages/citizen/Create/CheckPage";
import ADSAcknowledgement from "./pages/citizen/Create/ADSAcknowledgement";
import ADSCard from "./components/ADSCard";
import EmployeeApp from "./pages/employee";
import { ADSMyApplications } from "./pages/citizen/ADSMyBookings/index";
import ADSApplicationDetails from "./pages/citizen/ADSApplicationDetails";
import ApplicationDetails from "./pages/employee/ApplicationDetails";
import ADSSearchApplication from "./components/SearchApplication";
import ADSRequiredDoc from "./pageComponents/ADSRequiredDoc";
import NewADSStepperForm from "./pageComponents/NewADSStepper/NewADSStepperForm";
import NewADSStepFormOne from "./pageComponents/NewADSStepper/NewADSStepFormOne";
import NewADSStepFormTwo from "./pageComponents/NewADSStepper/NewADSStepFormTwo";
import NewADSStepFormThree from "./pageComponents/NewADSStepper/NewADSStepFormThree";
import NewADSStepFormFour from "./pageComponents/NewADSStepper/NewADSStepFormFour";
import ADSCitizenDetailsNew from "./pageComponents/ADSCitizenDetailsNew";
import ADSCitizenSecond from "./pageComponents/ADSCitizenSecond";
import ADSSelectProofIdentity from "./pageComponents/ADSSelectProofIdentity";
import ADSSummary from "./pageComponents/ADSSummary";
import getRootReducer from "./redux/reducer";

// import PTRSummary from "./pageComponents/PTRSummary";

export const ADSReducers = getRootReducer;

// Component registry for the ADS module, mapping component names to their implementations.
// Enables dynamic registration and access of components in the application.
const componentsToRegister = {
  ADSCreate: ADSCreate,
  ADSSearch,
  ADSCitizenDetails,
  ADSAddress,
  ADSDocumentDetails,
  ADSCheckPage,
  ADSAcknowledgement,
  ADSCard,
  ADSMyApplications,
  ApplicationDetails: ApplicationDetails,
  ADSApplicationDetails: ADSApplicationDetails,
  ADSSearchApplication,
  ADSRequiredDoc,
  NewADSStepperForm,
  NewADSStepFormOne,
  NewADSStepFormTwo,
  NewADSStepFormThree,
  NewADSStepFormFour,
  ADSCitizenDetailsNew,
  ADSCitizenSecond,
  ADSSelectProofIdentity,
  ADSSummary,
};

// Function to add components to the registry
const addComponentsToRegistry = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};

// Main ADSModule component
export const ADSModule = ({ stateCode, userType, tenants }) => {
  const { path, url } = useRouteMatch();

  const moduleCode = "ADS";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });

  addComponentsToRegistry();

  Digit.SessionStorage.set("ADS_TENANTS", tenants);

  // Fetch localization data if the user is an employee
  useEffect(
    () =>
      userType === "employee" &&
      Digit.LocalizationService.getLocale({
        modules: [`rainmaker-${Digit.ULBService.getCurrentTenantId()}`],
        locale: Digit.StoreData.getCurrentLanguage(),
        tenantId: Digit.ULBService.getCurrentTenantId(),
      }),
    []
  );

  // Render different apps based on user type
  if (userType === "employee") {
    return <EmployeeApp path={path} url={url} userType={userType} />;
  } else return <CitizenApp />;
};

// ADSLinks component for rendering links in the UI
export const ADSLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("ADS", {});

  useEffect(() => {
    clearParams();
  }, []);

  const links = [];

  return <CitizenHomeCard header={t("ADVERTISEMENT_MODULE")} links={links} Icon={() => <CHBIcon className="fill-path-primary-main" />} />;
};

export const ADSComponents = {
  ADSModule,
  ADSLinks,
  ADSCard,
};
