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
import NOCEsignResponse from "./pages/employee/NOCEsignResponse";

import NewNOCStepperForm from "./pageComponents/NewNOCStepper/NewNOCStepperForm";
import NewNOCStepFormOne from "./pageComponents/NewNOCStepper/NewNOCStepFormOne";
import NewNOCStepFormTwo from "./pageComponents/NewNOCStepper/NewNOCStepFormTwo";
import NewNOCStepFormThree from "./pageComponents/NewNOCStepper/NewNOCStepFormThree";
import NewNOCStepFormFour from "./pageComponents/NewNOCStepper/NewNOCStepFormFour";
import NewNOCStepFormNocDetails from "./pageComponents/NewNOCStepper/NewNOCStepFormNocDetails";

import EmployeeNOCStepperForm from "./pageComponents/EmployeeNOCStepper/EmployeeNOCStepperForm";
import EmployeeNOCStepFormOne from "./pageComponents/EmployeeNOCStepper/EmployeeNOCStepFormOne";
import EmployeeNOCStepFormTwo from "./pageComponents/EmployeeNOCStepper/EmployeeNOCStepFormTwo";
import EmployeeNOCStepFormThree from "./pageComponents/EmployeeNOCStepper/EmployeeNOCStepFormThree";
import EmployeeNOCStepFormFour from "./pageComponents/EmployeeNOCStepper/EmployeeNOCStepFormFour";
import EmployeeNOCStepFormNocDetails from "./pageComponents/EmployeeNOCStepper/EmployeeNOCStepFormNocDetails";

import NOCApplicantDetails from "./pageComponents/NOCApplicantDetails";
import NOCProfessionalDetails from "./pageComponents/NOCProfessionalDetails";
import NOCSiteDetails from "./pageComponents/NOCSiteDetails";
import NOCSpecificationDetails from "./pageComponents/NOCSpecificationDetails";
import FireNOCPropertyLocationDetails from "./pageComponents/FireNOCPropertyLocationDetails";
import FireNOCPropertyDetails from "./pageComponents/FireNOCPropertyDetails";
import FireNOCApplicantDetails from "./pageComponents/FireNOCApplicantDetails";
import NOCDocumentsRequired from "./pageComponents/NOCDocumentsRequired";
import FireNOCDocuments from "./pageComponents/FireNOCDocuments";
import NOCSummary from "./pageComponents/NOCSummary";
import NOCDocumentWithLatLong from "./pageComponents/NOCDocumentWithLatLong";
import EditApplication from "./pageComponents/EditApplication/EditApplication";
import FireNOCApplicationDetails from "./pages/employee/Inbox/FireNOCApplicationDetails";

import MyApplications from "./pages/citizen/Applications/MyApplications";
import CitizenApplicationOverview from "./pages/citizen/Applications/ApplicationsOverview";
import FireNOCMyApplications from "./pages/citizen/Applications/FireNOCMyApplications";
import FireNOCApplicationOverview from "./pages/citizen/Applications/FireNOCApplicationOverview";
import CitizenSearchApplication from "./pageComponents/SearchApplication/index"
import InspectionReport from "./pageComponents/InsectionReport"

export const FireNOCLinks = ({ matchPath, userType }) => {
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


export const FireNOCModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "FIRENOC";
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

export const FIRENOCReducers = getRootReducer;

const componentsToRegister = {
  FireNOCModule,
  FireNocModule: FireNOCModule,
  FIRENOCModule: FireNOCModule,
  FIRENOCCard: NOCCard,
  FireNOCLinks,
  FireNocLinks: FireNOCLinks,
  FIRENOCLinks: FireNOCLinks,
  FIRENOCApplicationOverview: ApplicationOverview,
  FIRENOCInbox: Inbox,
  FIRENOCSearchApplication: NOCSearchApplication,
  FIRENOCStepperForm: NewNOCStepperForm,
  FIRENOCStepFormOne: NewNOCStepFormOne,
  FIRENOCStepFormTwo: NewNOCStepFormTwo,
  FIRENOCStepFormThree: NewNOCStepFormThree,
  FIRENOCStepFormFour: NewNOCStepFormFour,
  FIRENOCStepFormNocDetails: NewNOCStepFormNocDetails,
  FIRENOCApplicantDetails: NOCApplicantDetails,
  FIRENOCProfessionalDetails: NOCProfessionalDetails,
  FIRENOCSiteDetails: NOCSiteDetails,
  FIRENOCFeeTable: NOCFeeTable,
  FIRENOCSpecificationDetails: NOCSpecificationDetails,
  FireNOCPropertyLocationDetails,
  FireNOCPropertyDetails,
  FireNOCApplicantDetails,
  FIRENOCDocumentsRequired: NOCDocumentsRequired,
  FireNOCDocuments,
  FIRENOCSummary: NOCSummary,
  FIRENOCDocumentWithLatLong: NOCDocumentWithLatLong,
  FIRENOCResponseCitizen: NOCResponseCitizen,
  FIRENOCEsignResponse: NOCEsignResponse,
  NOCCitizenMyApplications: MyApplications,
  NOCCitizenApplicationOverview: CitizenApplicationOverview,
  FIRENOCCitizenMyApplications: FireNOCMyApplications,
  FIRENOCCitizenApplicationOverview: FireNOCApplicationOverview,
  FIRENOCEmployeeApplicationOverview: NOCEmployeeApplicationOverview,
  FIRENOCEmployeeInboxDetails: FireNOCApplicationDetails,
  FIRENOCEditApplication: EditApplication,
  FIRENOCCitizenSearchApplication: CitizenSearchApplication,
  FIRENOCInspectionReport: InspectionReport,
  FIRENOCEmployeeStepperForm: EmployeeNOCStepperForm,
  FIRENOCEmployeeStepFormOne: EmployeeNOCStepFormOne,
  FIRENOCEmployeeStepFormTwo: EmployeeNOCStepFormTwo,
  FIRENOCEmployeeStepFormThree: EmployeeNOCStepFormThree,
  FIRENOCEmployeeStepFormFour: EmployeeNOCStepFormFour,
  FIRENOCEmployeeStepFormNocDetails: EmployeeNOCStepFormNocDetails
};

export const initFIRENOCComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
