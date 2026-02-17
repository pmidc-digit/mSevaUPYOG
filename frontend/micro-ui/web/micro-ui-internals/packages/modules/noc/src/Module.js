import { Loader, CitizenHomeCard, CaseIcon } from "@mseva/digit-ui-react-components";
import React from "react";
import { useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EmployeeApp from "./pages/employee";
import ApplicationOverview from "./pages/employee/ApplicationOverview";
import NOCEmployeeApplicationOverview from "./pages/employee/ApplicationOverview/ApplicationOverview";
import NOCCard from "./pages/employee/EmployeeCard";
import Inbox from "./pages/employee/Inbox";
import NOCSearchApplication from "./pages/employee/SearchApplication/Search";
import getRootReducer from "./redux/reducer";
import { NOCFeeTable } from "./pageComponents/NOCFeeTable";
import CitizenApp from "./pages/citizen";
import NOCResponseCitizen from "./pages/citizen/NOCResponseCitizen";

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
import EditApplication from "./pageComponents/EditApplication/EditApplication";

import MyApplications from "./pages/citizen/Applications/MyApplications";
import CitizenApplicationOverview from "./pages/citizen/Applications/ApplicationsOverview";
import CitizenSearchApplication from "./pageComponents/SearchApplication/index"
import InspectionReport from "./pageComponents/InsectionReport"

export const NOCLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("NOC_MODULE", {});

  useEffect(() => {
    clearParams();
  }, []);

  const links = [
    {
      link: `${matchPath}/noc/new-application`,
      i18nKey: t("NOC_NEW_APPLICATION"),
    },
    {
      link: `${matchPath}/noc/my-application`,
      i18nKey: t("NOC_MY_APPLICATION"),
    },
    {
      link: `${matchPath}/noc/search-application`,
      i18nKey: t("NOC_SEARCH_APPLICATION"),
    },
    
  ];

  return <CitizenHomeCard header={t("ACTION_TEST_NOC")} links={links} Icon={() => <CaseIcon className="fill-path-primary-main" />} />;
};


export const NOCModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "NOC";
  const { path, url } = useRouteMatch();
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });
  
  Digit.SessionStorage.set("NOC_TENANTS", tenants);

  if (isLoading) {
    return <Loader />;
  }

  if (userType === "citizen") {
    return <CitizenApp/>;
  }
   
  return <EmployeeApp path={path} stateCode={stateCode} />;
};

export const NOCReducers = getRootReducer;

const componentsToRegister = {
  NOCModule,
  NOCCard,
  NOCLinks,
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
  NOCFeeTable,
  NOCSpecificationDetails,
  NOCDocumentsRequired,
  NOCSummary,
  NOCDocumentWithLatLong,
  NOCResponseCitizen,
  NOCCitizenMyApplications: MyApplications,
  NOCCitizenApplicationOverview: CitizenApplicationOverview,
  NOCEmployeeApplicationOverview,
  NewNOCEditApplication: EditApplication,
  NOCCitizenSearchApplication: CitizenSearchApplication,
  InspectionReport
};

export const initNOCComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
