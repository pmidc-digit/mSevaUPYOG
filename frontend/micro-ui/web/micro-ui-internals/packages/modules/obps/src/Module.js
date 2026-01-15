import React from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import { Loader, CitizenHomeCard, OBPSIcon, CitizenInfoLabel } from "@mseva/digit-ui-react-components";
import CitizenApp from "./pages/citizen";
import Inbox from "./pages/employee/Inbox";
import stakeholderInbox from "./pages/employee/stakeholderInbox";

import BPACitizenHomeScreen from "./pages/citizen/home";
import EDCRForm from "./pageComponents/EDCRForm";
import BasicDetails from "./pageComponents/BasicDetails";
import DocsRequired from "./pageComponents/DocsRequired";
import PlotDetails from "./pageComponents/PlotDetails";
import ScrutinyDetails from "./pageComponents/ScrutinyDetails";
import BPANewBuildingdetails from "./pageComponents/BPANewBuildingdetails"
import OwnerDetails from "./pageComponents/OwnerDetails";
import DocumentDetails from "./pageComponents/DocumentDetails";
import NOCDetails from "./pageComponents/NOCDetails";
import NOCNumber from "./pageComponents/NOCNumber";
import LocationDetails from "./pageComponents/LocationDetails";
import StakeholderDocsRequired  from "./pageComponents/StakeholderDocsRequired";
import GIS from "./pageComponents/GIS";

import OCEDCRDocsRequired from "./pageComponents/OCEDCRDocsRequired";
import OCeDCRScrutiny from "./pageComponents/OCeDCRScrutiny";
import OCUploadPlanDiagram from "./pageComponents/OCUploadPlanDiagram";
import OCBasicDetails from "./pageComponents/OCBasicDetails";
import CreateEDCR from "./pages/citizen/EDCR";
import CreateOCEDCR from "./pages/citizen/OCEDCR";
import NewBuildingPermit from "./pages/citizen/NewBuildingPermit";
import OCBuildingPermit from "./pages/citizen/OCBuildingPermit";
import StakeholderRegistration from "./pages/citizen/StakeholderRegistration";
import CitizenBpaApplicationDetail from "./pages/citizen/BpaApplicationDetail";
import BPASendToArchitect from "./pages/citizen/BPASendToArchitect";
import OCSendToArchitect from "./pages/citizen/OCSendToArchitect";
import BPASendBackToCitizen from "./pages/citizen/BPASendBackToCitizen";
import OCSendBackToCitizen from "./pages/citizen/OCSendBackToCitizen";
import EdcrInbox from "./pages/citizen/EdcrInbox";

import LicenseType from "./pageComponents/LicenseType";
import LicenseDetails from "./pageComponents/LicenseDetails";
import CorrospondenceAddress from "./pageComponents/CorrospondenceAddress";
import PermanentAddress from "./pageComponents/PermanentAddress";
import StakeholderDocuments from "./pageComponents/StakeholderDocuments";
import EmployeeApp from "./pages/employee";
import OBPSSearchApplication from "./components/SearchApplication";
import InspectionReport from "./pageComponents/InspectionReport";
import OBPSEmployeeHomeCard from "./pages/employee/EmployeeCard";
import EmpApplicationDetail from "./pages/employee/ApplicationDetail";
import EmployeeBpaApplicationDetail from "./pages/employee/BpaApplicationDetails";

import BPACheckPage from "./pages/citizen/NewBuildingPermit/CheckPage";
import OCBPACheckPage from "./pages/citizen/OCBuildingPermit/CheckPage";
import OCBPASendBackCheckPage from "./pages/citizen/OCSendBackToCitizen/CheckPage";
import StakeholderCheckPage from "./pages/citizen/StakeholderRegistration/CheckPage";
import EDCRAcknowledgement from "./pages/citizen/EDCR/EDCRAcknowledgement";
import OCEDCRAcknowledgement from "./pages/citizen/OCEDCR/EDCRAcknowledgement";
import BPAAcknowledgement from "./pages/citizen/NewBuildingPermit/OBPSAcknowledgement";
import OCBPAAcknowledgement from "./pages/citizen/OCBuildingPermit/OBPSAcknowledgement";
import OCSendBackAcknowledgement from "./pages/citizen/OCSendBackToCitizen/Acknowledgement";
import StakeholderAcknowledgement from "./pages/citizen/StakeholderRegistration/StakeholderAcknowledgement";
import Architectconcent from "./pages/citizen/NewBuildingPermit/Architectconcent";
import CitizenConsent from "./pages/citizen/BpaApplicationDetail/CitizenConsent";

import getRootReducer from "./redux/reducers";

import CLUStepperForm from "./pages/citizen/ChangeOfLand/CLUStepperForm";
import CLUStepFormOne from "./pages/citizen/ChangeOfLand/CLUStepFormOne";
import CLUStepFormTwo from "./pages/citizen/ChangeOfLand/CLUStepFormTwo";
import CLUStepFormThree from "./pages/citizen/ChangeOfLand/CLUStepFormThree";
import CLUStepFormFour from "./pages/citizen/ChangeOfLand/CLUStepFormFour";
import CLULocalityInfo from "./pageComponents/CLULocalityInfo";
import CLUSiteDetails from "./pageComponents/CLUSiteDetails";
import CLUSpecificationDetails from "./pageComponents/CLUSpecificationDetails";
import CLUDocumentsRequired from "./pageComponents/CLUDocumentsRequired";
import CLUApplicantDetails from "./pageComponents/CLUApplicantDetails";
import CLUProfessionalDetails from "./pageComponents/CLUProfessionalDetails";
import CLUSummary from "./pageComponents/CLUSummary";
import CLUResponse from "./pageComponents/CLUResponse";
import CLUMyApplications from "./pages/citizen/Applications/CLUMyApplications";
import CLUEditApplication from "./pageComponents/EditApplication/EditCLUApplication";
import CLUApplicationDetails from "./pages/citizen/Applications/CLUApplicationDetails";
import CLUSearchApplication from "./pages/citizen/CLUSearchApplication/index";
import CLUInbox from "./pages/employee/cluInbox/CLUInbox"
import CLUEmployeeApplicationDetails from "./pages/employee/ApplicationOverview/CLUApplicationOverview";
import LayoutEmployeeApplicationDetails from "./pages/employee/ApplicationOverview/LayoutApplicationOverview";

import LayoutStepperForm from "./pages/citizen/LayoutStepper/LayoutStepperForm";
import LayoutStepFormOne from "./pages/citizen/LayoutStepper/LayoutStepFormOne";
import LayoutStepFormTwo from "./pages/citizen/LayoutStepper/LayoutStepFormTwo";
import LayoutStepFormThree from "./pages/citizen/LayoutStepper/LayoutStepFormThree";
import LayoutStepFormFour from "./pages/citizen/LayoutStepper/LayoutStepFormFour";
import LayoutApplicantDetails from "./pageComponents/LayoutApplicantDetails";
import LayoutProfessionalDetails from "./pageComponents/LayoutProfessionalDetails";
import LayoutLocalityInfo from "./pageComponents/LayoutLocalityInfo";
import LayoutSiteDetails from "./pageComponents/LayoutSiteDetails";
import LayoutCLUDetails from "./pageComponents/LayoutCLUDetails";
import LayoutSpecificationDetails from "./pageComponents/LayoutSpecificationDetails";
import LayoutDocumentsRequired from "./pageComponents/LayoutDocumentsRequired";
import LayoutSummary from "./pageComponents/LayoutSummary";
import LayoutSearchApplication from "./pages/citizen/LayoutSearchApplication/index";

import { NewSelfCertificationStepForm } from "./pages/citizen/SelfCertificationStepper/NewSelfCertificationStepForm";
import NewSelfCertificationStepFormOne from "./pages/citizen/SelfCertificationStepper/NewSelfCertificationStepperFormOne"
import NewSelfCertificationStepFormTwo from "./pages/citizen/SelfCertificationStepper/NewSelfCertificationStepperFormTwo"
import NewSelfCertificationStepFormThree from "./pages/citizen/SelfCertificationStepper/NewSelfCertificationStepperFormThree"
import NewSelfCertificationStepFormFour from "./pages/citizen/SelfCertificationStepper/NewSelfCertificationStepperFormFour"
import NewSelfCertificationStepFormFive from "./pages/citizen/SelfCertificationStepper/NewSelfCertificationStepperFormFive"
import NewSelfCertificationStepFormSix from "./pages/citizen/SelfCertificationStepper/NewSelfCertificationStepperFormSix"
import NewSelfCertificationStepFormSeven from "./pages/citizen/SelfCertificationStepper/NewSelfCertificationStepperFormSeven"
import NewSelfCertificationStepFormEight from "./pages/citizen/SelfCertificationStepper/NewSelfCertificationStepperFormEight"
import SelfCertificationResponse from "./pages/citizen/SelfCertificationStepper/SelfCertificationResponse"
import CustomLandingPage from "./pages/citizen/CustomLandingPage";

import LayoutResponseCitizen from "./pages/citizen/Applications/LayoutResponseCitizen";
import LayoutApplicationDetails from "./pages/citizen/Applications/LayoutApplicationSummary";
import LayoutApplicationSummary from "./pages/citizen/Applications/LayoutApplicationSummary";
import LayoutInbox from "./pages/employee/Inbox/LayoutInbox";
import LayoutApplicationOverview from "./pages/employee/ApplicationOverview/LayoutApplicationOverview";
import LayoutResponseEmployee from "./pages/employee/ApplicationOverview/LayoutResponseEmployee";
import EditLayoutApplication from "./pageComponents/EditApplication/EditLayoutApplication";
import LayoutMyApplications from "./pages/citizen/Applications/LayoutMyApplications";
import OCStepFormOne from "./pages/citizen/OcupationalCertificateStepper/OCStepFormOne";
import { OCStepperForm } from "./pages/citizen/OcupationalCertificateStepper/OCStepperForm";
import OCStepFormTwo from "./pages/citizen/OcupationalCertificateStepper/OCStepFormTwo";
import OCStepFormThree from "./pages/citizen/OcupationalCertificateStepper/OCStepFormThree";
import OCStepFormFour from "./pages/citizen/OcupationalCertificateStepper/OCStepFormFour";


const OBPSModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = ["bpa", "bpareg", "common"]; //"bpa";
  const { path, url } = useRouteMatch();
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });

  Digit.SessionStorage.set("OBPS_TENANTS", tenants);

  if (isLoading) {
    return <Loader />;
  }

  if (userType === "citizen") {
    return <CitizenApp path={path} stateCode={stateCode} />;
  }

  return <EmployeeApp path={path} stateCode={stateCode} />
}

const OBPSLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();

  const links = [
    {
      link: `${matchPath}/my-applications`,
      i18nKey: t("BPA_CITIZEN_HOME_VIEW_APP_BY_CITIZEN_LABEL"),
    },
    {
      link: `${matchPath}/stakeholder/apply/stakeholder-docs-required`,
      i18nKey: t("BPA_CITIZEN_HOME_STAKEHOLDER_LOGIN_LABEL"),
    },
    {
      link: `${matchPath}/home`,
      i18nKey: t("BPA_CITIZEN_HOME_ARCHITECT_LOGIN_LABEL"),
    },
    {
      link: `${matchPath}/layout`,
      i18nKey: t("BPA_CITIZEN_HOME_ARCHITECT_LOGIN_LABEL"),
    },

  ];

  return (
    <CitizenHomeCard header={t("ACTION_TEST_BUILDING_PLAN_APPROVAL")} links={links} Icon={() => <OBPSIcon />}
      Info={() => <CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t(`BPA_CITIZEN_HOME_STAKEHOLDER_INCLUDES_INFO_LABEL`)} />} isInfo={true}
    />
  );
} 

const dummy = () => {
  return <div></div>
}

const componentsToRegister = {
  OBPSModule,
  OBPSLinks,
  OBPSCard:OBPSEmployeeHomeCard,
  BPACitizenHomeScreen,
  EDCRForm,
  BasicDetails,
  DocsRequired,
  PlotDetails,
  ScrutinyDetails,
  BPANewBuildingdetails,
  OwnerDetails,
  DocumentDetails,
  NOCDetails,
  NOCNumber,
  LocationDetails,
  GIS,
  OCEDCRDocsRequired,
  OCeDCRScrutiny,
  OCUploadPlanDiagram,
  StakeholderDocsRequired,
  LicenseType,
  LicenseDetails,
  CorrospondenceAddress,
  PermanentAddress,
  StakeholderDocuments,
  OCBasicDetails,
  OBPSSearchApplication,
  InspectionReport,
  BPAInbox: Inbox,
  LayoutInbox,
  StakeholderInbox: stakeholderInbox,
  StakeholderCheckPage,
  BPACheckPage,
  OCBPACheckPage,
  OCBPASendBackCheckPage,
  EDCRAcknowledgement,
  OCEDCRAcknowledgement,
  BPAAcknowledgement,
  OCBPAAcknowledgement,
  OCSendBackAcknowledgement,
  StakeholderAcknowledgement,
  ObpsCreateEDCR : CreateEDCR,
  ObpsCreateOCEDCR : CreateOCEDCR,
  ObpsNewBuildingPermit : NewBuildingPermit,
  ObpsOCBuildingPermit : OCBuildingPermit,
  ObpsStakeholderRegistration : StakeholderRegistration,
  ObpsCitizenBpaApplicationDetail : CitizenBpaApplicationDetail,
  ObpsBPASendToArchitect : BPASendToArchitect,
  ObpsOCSendToArchitect : OCSendToArchitect,
  ObpsBPASendBackToCitizen : BPASendBackToCitizen,
  ObpsOCSendBackToCitizen : OCSendBackToCitizen,
  ObpsEdcrInbox : EdcrInbox,
  ObpsEmpApplicationDetail : EmpApplicationDetail,
  ObpsEmployeeBpaApplicationDetail : EmployeeBpaApplicationDetail,
  Architectconcent,
  CitizenConsent,
  LayoutStepperForm,
  LayoutStepFormOne,
  LayoutStepFormTwo,
  LayoutStepFormThree,
  LayoutStepFormFour,
  LayoutApplicantDetails,
  LayoutProfessionalDetails,
  LayoutSiteDetails,
  LayoutSpecificationDetails,
  LayoutDocumentsRequired,
  LayoutSummary,
  LayoutLocalityInfo,
  LayoutCLUDetails,
  LayoutResponseCitizen,
  LayoutApplicationSummary,
  NewSelfCertificationStepForm,
  NewSelfCertificationStepFormOne,
  NewSelfCertificationStepFormTwo,
  NewSelfCertificationStepFormThree,
  NewSelfCertificationStepFormFour,
  NewSelfCertificationStepFormFive,
  NewSelfCertificationStepFormSix,
  NewSelfCertificationStepFormSeven,
  NewSelfCertificationStepFormEight,
  SelfCertificationResponse,
  CustomLandingPage,
  dummy,
  LayoutApplicationOverview,
  LayoutResponseEmployee,
  NewLayoutEditLayoutApplication: EditLayoutApplication,
  CLUStepperForm,
  CLUStepFormOne,
  CLUStepFormTwo,
  CLUStepFormThree,
  CLUStepFormFour ,
  CLULocalityInfo,
  CLUSiteDetails,
  CLUSpecificationDetails,
  CLUDocumentsRequired,
  CLUApplicantDetails,
  CLUProfessionalDetails,
  CLUSummary,
  CLUResponse,
  CLUMyApplications,
  CLUEditApplication,
  CLUApplicationDetails,
  LayoutApplicationDetails,
  CLUSearchApplication,
  LayoutSearchApplication,
  LayoutMyApplications,
  CLUInbox,
  CLUEmployeeApplicationDetails,
  OCStepFormOne,
  OCStepFormTwo,
  OCStepFormThree,
  OCStepFormFour,
  OCStepperForm
}

export const initOBPSComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};

export const OBPSReducers = getRootReducer;