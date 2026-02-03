// import React from "react";
import React, { useEffect, useState } from "react";
import OBPSSearchApplication from "../../components/SearchApplication";
import Search from "../employee/Search";
import { useTranslation } from "react-i18next";
import { Switch, useLocation, Route } from "react-router-dom";
import { PrivateRoute, BackButton, AppContainer, BreadCrumb } from "@mseva/digit-ui-react-components";
// import NewBuildingPermit from "./NewBuildingPermit";
// import CreateEDCR from "./EDCR";
// import CreateOCEDCR from "./OCEDCR";
// import BPACitizenHomeScreen from "./home";
// import StakeholderRegistration from "./StakeholderRegistration";
import MyApplication from "./MyApplication";
import ApplicationDetails from "./ApplicationDetail";
// import OCBuildingPermit from "./OCBuildingPermit";
// import BpaApplicationDetail from "./BpaApplicationDetail";
// import BPASendToArchitect from "./BPASendToArchitect";
// import OCSendToArchitect from "./OCSendToArchitect";
// import BPASendBackToCitizen from "./BPASendBackToCitizen";
// import OCSendBackToCitizen from "./OCSendBackToCitizen";
// import Inbox from "./ArchitectInbox";
//import EdcrInbox from "./EdcrInbox";
import OBPSResponse from "../employee/OBPSResponse";
import Inbox from "../employee/Inbox";
import LayoutResponseCitizen from "./Applications/LayoutResponseCitizen";
import LayoutApplicantDetails from "../../pageComponents/LayoutApplicantDetails";
import LayoutApplicationDetails from "./Applications/LayoutApplicationSummary";
import { OCStepperForm } from "./OcupationalCertificateStepper/OCStepperForm";




const OBPSBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/obps/home",
      content: "OBPS Home",
      show: location.pathname.includes("obps/bpa") ? true : false,
    },
    {
      path: "/digit-ui/citizen/obps/home",
      content: "OBPS Home",
      show: location.pathname.includes("obps/my-applications") ? true : false,
    },
    {
      path: "/digit-ui/citizen/obps/home",
      content: "OBPS Home", 
      show: location.pathname.includes("obps/stakeholder") ? true : false,
    },
    {
      path: "/digit-ui/citizen/obps/home",
      content: "OBPS Home", 
      show: location.pathname.includes("obps/edcrscrutiny") ? true : false,
    },
    {
      path: "/digit-ui/citizen/obps/home",
      content: "OBPS Home", 
      show: location.pathname.includes("obps/layout") ? true : false,
    },
    {
      path: "/digit-ui/citizen/obps/home",
      content: "OBPS Home", 
      show: location.pathname.includes("obps/clu") ? true : false,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const App = ({ path }) => {
  const location = useLocation();
  const { t } = useTranslation();
  let isCommonPTPropertyScreen = window.location.href.includes("/ws/create-application/property-details");
  let isAcknowledgement =
    window.location.href.includes("/acknowledgement") ||
    window.location.href.includes("/disconnect-acknowledge") ||
    window.location.href.includes("/building_plan_scrutiny/new_construction/stepper");
  const BPACitizenHomeScreen = Digit?.ComponentRegistryService?.getComponent("BPACitizenHomeScreen");
  const CreateEDCR = Digit?.ComponentRegistryService?.getComponent("ObpsCreateEDCR");
  const CreateOCEDCR = Digit?.ComponentRegistryService?.getComponent("ObpsCreateOCEDCR");
  const NewBuildingPermit = Digit?.ComponentRegistryService?.getComponent("ObpsNewBuildingPermit");
  const OCBuildingPermit = Digit?.ComponentRegistryService?.getComponent("ObpsOCBuildingPermit");
  const StakeholderRegistration = Digit?.ComponentRegistryService?.getComponent("ObpsStakeholderRegistration");
  const EdcrInbox = Digit?.ComponentRegistryService?.getComponent("ObpsEdcrInbox");
  const BpaApplicationDetail = Digit?.ComponentRegistryService?.getComponent("ObpsCitizenBpaApplicationDetail");
  const BPASendToArchitect = Digit?.ComponentRegistryService?.getComponent("ObpsBPASendToArchitect");
  const OCSendToArchitect = Digit?.ComponentRegistryService?.getComponent("ObpsOCSendToArchitect");
  const BPASendBackToCitizen = Digit?.ComponentRegistryService?.getComponent("ObpsBPASendBackToCitizen");
  const OCSendBackToCitizen = Digit?.ComponentRegistryService?.getComponent("ObpsOCSendBackToCitizen");
  const SelfCertificationStepper = Digit?.ComponentRegistryService?.getComponent("NewSelfCertificationStepForm");
  const isDocScreenAfterEdcr = sessionStorage.getItem("clickOnBPAApplyAfterEDCR") === "true" ? true : false;

  const LayoutStepperForm = Digit?.ComponentRegistryService?.getComponent("LayoutStepperForm");
  const LayoutResponseCitizen = Digit.ComponentRegistryService.getComponent("LayoutResponseCitizen");
  const LayoutResponseEmployee = Digit.ComponentRegistryService.getComponent("LayoutResponseEmployee");
  const LayoutApplicationSummary = Digit.ComponentRegistryService.getComponent("LayoutApplicationSummary");
  const NewLayoutEditLayoutApplication = Digit.ComponentRegistryService.getComponent("NewLayoutEditLayoutApplication");
  const LayoutSearchApplication = Digit?.ComponentRegistryService?.getComponent("LayoutSearchApplication");
  const LayoutMyApplications = Digit?.ComponentRegistryService?.getComponent("LayoutMyApplications"); 
  const SelfCertificationResponse = Digit?.ComponentRegistryService?.getComponent("SelfCertificationResponse")
  const OCStepperForm = Digit?.ComponentRegistryService?.getComponent("OCStepperForm")

  const getBackPageNumber = () => {
    let goBacktoFromProperty = -1;
    if (sessionStorage.getItem("VisitedCommonPTSearch") === "true" && isCommonPTPropertyScreen) {
      goBacktoFromProperty = -4;
      return goBacktoFromProperty;
    }
    return goBacktoFromProperty;
  };
  const CLUStepperForm = Digit?.ComponentRegistryService?.getComponent("CLUStepperForm");
  const CLUResponse = Digit?.ComponentRegistryService?.getComponent("CLUResponse");
  const CLUApplicationDetails = Digit?.ComponentRegistryService?.getComponent("CLUApplicationDetails");
  const CLUEditApplication = Digit?.ComponentRegistryService?.getComponent("CLUEditApplication");
  const CLUMyApplications = Digit?.ComponentRegistryService?.getComponent("CLUMyApplications");
  const CLUSearchApplication = Digit?.ComponentRegistryService?.getComponent("CLUSearchApplication");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <span className={"ws-citizen-wrapper"} style={{ width: "100%", paddingRight: "25px", paddingLeft: "25px" }}>
      {!isResponse && !window.location.href.includes("/stepper") ? (
        <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px", marginTop:"20px" } : {}}>
          <OBPSBreadCrumbs location={location} />
        </div>
      ) : null}
      <Switch>

        <PrivateRoute path={`${path}/layout/search-application`} component={(props) => <AppContainer><LayoutSearchApplication {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/layout/application-overview/:id`} component={(props) => <AppContainer><LayoutApplicationSummary {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/layout/my-applications`} component={(props) => <AppContainer><LayoutMyApplications {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/layout/edit-application/:id`} component={(props) => <AppContainer><NewLayoutEditLayoutApplication {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/layout/apply`} component={LayoutStepperForm} />
        <PrivateRoute path={`${path}/layout/response/:id`} component={(props) => <AppContainer><LayoutResponseCitizen {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/layout/response/:id`} component={(props) => <AppContainer><LayoutResponseEmployee {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/layout/:id`} component={(props) => <AppContainer><LayoutApplicationSummary {...props} /></AppContainer>} />

        <PrivateRoute path={`${path}/clu/apply`} component={CLUStepperForm} />
        <PrivateRoute path={`${path}/clu/response/:id`} component={(props) => <AppContainer><CLUResponse {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/clu/my-applications`} component={(props) => <AppContainer><CLUMyApplications {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/clu/application-overview/:id`} component={(props) => <AppContainer><CLUApplicationDetails {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/search/clu-application`} component={(props) => <AppContainer><CLUSearchApplication {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/clu/edit-application/:id`} component={(props) => <AppContainer><CLUEditApplication {...props} /></AppContainer>} />

        <PrivateRoute path={`${path}/home`} component={(props) => <AppContainer><BPACitizenHomeScreen {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/search/application`} component={(props) => <AppContainer><Search {...props} parentRoute={path} /></AppContainer>} />
        <PrivateRoute path={`${path}/search/obps-application`} component={(props) => <AppContainer><Search {...props} parentRoute={path} /></AppContainer>} />
        <PrivateRoute path={`${path}/edcrscrutiny/apply`} component={(props) => <AppContainer><CreateEDCR {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/edcrscrutiny/oc-apply`} component={(props) => <AppContainer><CreateOCEDCR {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/bpa/:applicationType/:serviceType`} component={NewBuildingPermit} />
        <PrivateRoute path={`${path}/bpa/:applicationType/:serviceType/stepper`} component={SelfCertificationStepper} />
        <PrivateRoute path={`${path}/ocbpa/:applicationType/:serviceType`} component={OCBuildingPermit} />
        <PrivateRoute path={`${path}/stakeholder/apply`} component={(props) => <AppContainer><StakeholderRegistration {...props} /></AppContainer>} />
        <Route path={`${path}/openlink/stakeholder/apply`} component={(props) => <AppContainer><StakeholderRegistration {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/my-applications`} component={(props) => <AppContainer><MyApplication {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/bpa/inbox`} component={(props) => <AppContainer><Inbox {...props} parentRoute={path} /></AppContainer>} />
        <PrivateRoute path={`${path}/edcr/inbox`} component={(props) => <AppContainer><EdcrInbox {...props} parentRoute={path} /></AppContainer>} />
        <PrivateRoute path={`${path}/stakeholder/:id`} component={(props) => <AppContainer><ApplicationDetails {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/bpa/:id`} component={(props) => <AppContainer><BpaApplicationDetail {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/editApplication/bpa/:tenantId/:applicationNo`} component={(props) => <AppContainer><BPASendToArchitect {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/editApplication/ocbpa/:tenantId/:applicationNo`} component={(props) => <AppContainer><OCSendToArchitect {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/sendbacktocitizen/bpa/:tenantId/:applicationNo`} component={(props) => <AppContainer><BPASendBackToCitizen {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/sendbacktocitizen/ocbpa/:tenantId/:applicationNo`} component={(props) => <AppContainer><OCSendBackToCitizen {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/response`} component={(props) => <AppContainer><OBPSResponse {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/self-certification/response/:id`} component={(props) => <AppContainer><SelfCertificationResponse {...props} /></AppContainer>} />
        <PrivateRoute path={`${path}/ocbpa/:applicationType/:serviceType/stepper`} component={(props) => <AppContainer><OCStepperForm {...props} /></AppContainer>} />
      </Switch>
    </span>
  );
};

export default App;
