// import React from "react";
import React, { useEffect, useState } from "react";
import OBPSSearchApplication from "../../components/SearchApplication";
import Search from "../employee/Search";
import { useTranslation } from "react-i18next";
import { Switch, useLocation, Route } from "react-router-dom";
import { PrivateRoute, BackButton } from "@mseva/digit-ui-react-components";
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



const App = ({ path }) => {
  const location = useLocation();
  const { t } = useTranslation();
  let isCommonPTPropertyScreen = window.location.href.includes("/ws/create-application/property-details");
  let isAcknowledgement = window.location.href.includes("/acknowledgement") || window.location.href.includes("/disconnect-acknowledge") || window.location.href.includes('/building_plan_scrutiny/new_construction/stepper');
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
  const isDocScreenAfterEdcr = sessionStorage.getItem("clickOnBPAApplyAfterEDCR") === "true" ? true : false

  const LayoutStepperForm = Digit?.ComponentRegistryService?.getComponent("LayoutStepperForm"); 
  const LayoutResponseCitizen = Digit.ComponentRegistryService.getComponent("LayoutResponseCitizen");
  const LayoutResponseEmployee = Digit.ComponentRegistryService.getComponent("LayoutResponseEmployee");
  const LayoutApplicationSummary = Digit.ComponentRegistryService.getComponent("LayoutApplicationSummary");
  const NewLayoutEditLayoutApplication = Digit.ComponentRegistryService.getComponent("NewLayoutEditLayoutApplication");
  const LayoutSearchApplication = Digit?.ComponentRegistryService?.getComponent("LayoutSearchApplication");
  const LayoutMyApplications = Digit?.ComponentRegistryService?.getComponent("LayoutMyApplications"); 
  const SelfCertificationResponse = Digit?.ComponentRegistryService?.getComponent("SelfCertificationResponse")

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

  return (
    <React.Fragment>
      <div className="ws-citizen-wrapper">
         {!isAcknowledgement && <BackButton style={{ border: "none" }} /* isCommonPTPropertyScreen={isCommonPTPropertyScreen} */ getBackPageNumber={getBackPageNumber}>
          {t("CS_COMMON_BACK")}
        </BackButton>}
       {!location.pathname.includes("response") && !location.pathname.includes("openlink/stakeholder") && !location.pathname.includes("/acknowledgement") && !location.pathname.includes("/stepper") && !location.pathname.includes("/obps/home") && !isDocScreenAfterEdcr }
      <Switch>
        <PrivateRoute path={`${path}/layout/search-application`} component={LayoutSearchApplication} />
        <PrivateRoute path={`${path}/layout/application-overview/:id`} component={LayoutApplicationSummary} />
        <PrivateRoute path={`${path}/layout/my-applications`} component={LayoutMyApplications} />
        <PrivateRoute path={`${path}/layout/edit-application/:id`} component={NewLayoutEditLayoutApplication} />
        <PrivateRoute path={`${path}/layout/apply`} component={LayoutStepperForm} />
        <PrivateRoute path={`${path}/layout/response/:id`} component={LayoutResponseCitizen} />
        <PrivateRoute path={`${path}/layout/response/:id`} component={LayoutResponseEmployee} />
        <PrivateRoute path={`${path}/layout/:id`} component={LayoutApplicationSummary} />


        <PrivateRoute path={`${path}/clu/apply`} component={CLUStepperForm} />
        <PrivateRoute path={`${path}/clu/response/:id`} component={CLUResponse} />
        <PrivateRoute path={`${path}/clu/my-applications`} component={CLUMyApplications} />
        <PrivateRoute path={`${path}/clu/application-overview/:id`} component={CLUApplicationDetails} />       
        <PrivateRoute path={`${path}/search/clu-application`} component={CLUSearchApplication} />
        <PrivateRoute path={`${path}/clu/edit-application/:id`} component={CLUEditApplication} />

        
    
        <PrivateRoute path={`${path}/home`} component={BPACitizenHomeScreen} />
        <PrivateRoute path={`${path}/search/application`} component={(props) => <Search {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/search/obps-application`} component={(props) => <Search {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/edcrscrutiny/apply`} component={CreateEDCR} />
        <PrivateRoute path={`${path}/edcrscrutiny/oc-apply`} component={CreateOCEDCR} />
        <PrivateRoute path={`${path}/bpa/:applicationType/:serviceType`} component={NewBuildingPermit} />
        <PrivateRoute path={`${path}/bpa/:applicationType/:serviceType/stepper`} component={SelfCertificationStepper} />
        <PrivateRoute path={`${path}/ocbpa/:applicationType/:serviceType`} component={OCBuildingPermit}/>
        <PrivateRoute path={`${path}/stakeholder/apply`} component={StakeholderRegistration} />
        <Route path={`${path}/openlink/stakeholder/apply`} component={StakeholderRegistration} />
        <PrivateRoute path={`${path}/my-applications`} component={MyApplication} />
        <PrivateRoute path={`${path}/bpa/inbox`} component={(props) => <Inbox {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/edcr/inbox`} component={(props) => <EdcrInbox {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/stakeholder/:id`} component={ApplicationDetails} />
        <PrivateRoute path={`${path}/bpa/:id`} component={BpaApplicationDetail} />
        <PrivateRoute path={`${path}/editApplication/bpa/:tenantId/:applicationNo`} component={BPASendToArchitect} />
        <PrivateRoute path={`${path}/editApplication/ocbpa/:tenantId/:applicationNo`} component={OCSendToArchitect} />
        <PrivateRoute path={`${path}/sendbacktocitizen/bpa/:tenantId/:applicationNo`} component={BPASendBackToCitizen} />
        <PrivateRoute path={`${path}/sendbacktocitizen/ocbpa/:tenantId/:applicationNo`} component={OCSendBackToCitizen} />
        <PrivateRoute path={`${path}/response`} component={OBPSResponse} />
        <PrivateRoute path={`${path}/self-certification/response/:id`} component={SelfCertificationResponse} />
      </Switch>
      </div>
    </React.Fragment>
  );
};

export default App;
