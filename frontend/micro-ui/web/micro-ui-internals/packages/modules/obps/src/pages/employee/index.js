import { PrivateRoute, BreadCrumb, BackButton } from "@mseva/digit-ui-react-components";
import React, { Fragment } from "react";
import { Switch, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import ApplicationDetail from "./ApplicationDetail";
// import BpaApplicationDetail from "./BpaApplicationDetails";
import Search from "./Search";
import OBPSResponse from "./OBPSResponse";
import StakeholderResponse from "./StakeholderResponse";



const OBPSBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/employee/obps/inbox",
      content: t("ES_COMMON_OBPS_INBOX_LABEL"),
      show: location.pathname.includes("obps/inbox") ? true : false,
    },
    {
      path: "/digit-ui/employee/layout/inbox",
      content: t("Layout Inbox"),
      show: location.pathname.includes("layout/inbox") ? true : false,
    },
    {
      path: "/digit-ui/employee/obps/clu/inbox",
      content: t("ES_COMMON_INBOX"),
      show: (location.pathname.includes("clu/inbox") ||  location.pathname.includes("clu/application-overview/")) ? true : false,
    },
    {
      path: "/digit-ui/employee/obps/clu/application-overview/:id",
      content: t("Application Overview"),
      show: location.pathname.includes("clu/application-overview/") ? true : false,
    },
    {
      path: "/digit-ui/employee/obps/stakeholder-inbox",
      content: t("ES_COMMON_STAKEHOLDER_INBOX_LABEL"),
      show: location.pathname.includes("obps/stakeholder-inbox") ? true : false,
    },
    {
      path: "/digit-ui/employee/obps/inbox/bpa/:id",
      content: t("ES_OBPS_SEARCH_BPA"),
      show: location.pathname.includes("obps/inbox/bpa") ? true : false,
    },
    {
      path: "/digit-ui/employee/obps/inbox/stakeholder/:id",
      content: t("ES_OBPS_SEARCH_BPA"),
      show: location.pathname.includes("obps/stakeholder-inbox/stakeholder") ? true : false,
    },
    {
      path: "/digit-ui/employee/obps/search/application",
      content: t("ES_OBPS_SEARCH"),
      show: location.pathname.includes("/obps/search/application") ? true : false,
    },
    {
      path: "/digit-ui/employee/obps/search/application/bpa/:id",
      content: t("ES_OBPS_SEARCH_BPA"),
      show: location.pathname.includes("/obps/search/application/bpa") ? true : false,
    },
    {
      path: "/digit-ui/employee/obps/search/application/stakeholder/:id",
      content: t("ES_OBPS_SEARCH_BPA"),
      show: location.pathname.includes("/obps/search/application/stakeholder/") ? true : false,
    },
  ];

  return <BreadCrumb crumbs={crumbs} />;
}

const EmployeeApp = ({ path }) => {
  console.log(path, "PATHHH");
  const location = useLocation()
  const { t } = useTranslation();
  const Inbox = Digit.ComponentRegistryService.getComponent("BPAInbox");
  const LayoutInbox = Digit.ComponentRegistryService.getComponent("LayoutInbox");
  const LayoutApplicationOverview = Digit.ComponentRegistryService.getComponent("LayoutApplicationOverview");
  const StakeholderInbox = Digit.ComponentRegistryService.getComponent("StakeholderInbox");
  const ApplicationDetail = Digit.ComponentRegistryService.getComponent("ObpsEmpApplicationDetail");
  const BpaApplicationDetail = Digit.ComponentRegistryService.getComponent("ObpsEmployeeBpaApplicationDetail");
  const NewLayoutEditLayoutApplication = Digit.ComponentRegistryService.getComponent("NewLayoutEditLayoutApplication");
  const LayoutResponseEmployee = Digit.ComponentRegistryService.getComponent("LayoutResponseEmployee");
  const isLocation = window.location.href.includes("bpa") || window.location.href.includes("stakeholder-inbox/stakeholder") || window.location.href.includes("application");
  const isFromNoc = window.location.href.includes("digit-ui/employee/obps/bpa/");
  const isRes = window.location.href.includes("obps/response") || window.location.href.includes("obps/stakeholder-response");

  const CLUInbox = Digit.ComponentRegistryService.getComponent("CLUInbox");
  const CLUEmployeeApplicationDetails = Digit.ComponentRegistryService.getComponent("CLUEmployeeApplicationDetails");
  const LayoutEmployeeApplicationDetails = Digit.ComponentRegistryService.getComponent("LayoutEmployeeApplicationDetails");
  const CLUResponse = Digit?.ComponentRegistryService?.getComponent("CLUResponse"); 


  return (
    <Fragment>
      {!isFromNoc && !isRes ? <div style={isLocation ? {marginLeft: "10px"} : {}}><OBPSBreadCrumbs location={location} /></div> : null}
      {isFromNoc ? <BackButton style={{ border: "none", margin: "0", padding: "0" }}>{t("CS_COMMON_BACK")}</BackButton>: null}
      <Switch>
         <PrivateRoute path={`${path}/layout/application-overview/:id`} component={(props) => <LayoutEmployeeApplicationDetails {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/layout/response/:id`} component={(props) => <LayoutResponseEmployee {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/layout/inbox/application-overview/:id`} component={(props) => <LayoutApplicationOverview {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/layout/edit-application/:id`} component={(props) => <NewLayoutEditLayoutApplication {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/layout/inbox`} component={(props) => <LayoutInbox {...props} parentRoute={path} />} />        
        <PrivateRoute path={`${path}/stakeholder-inbox/stakeholder/:id`} component={ApplicationDetail} />
        <PrivateRoute path={`${path}/search/application/stakeholder/:id`} component={ApplicationDetail} />
        <PrivateRoute path={`${path}/search/application/editApplication/bpa/:id`} component={BpaApplicationDetail} />
        <PrivateRoute path={`${path}/search/application/bpa/:id`} component={BpaApplicationDetail} />
        <PrivateRoute path={`${path}/search/application`} component={(props) => <Search {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/inbox/editApplication/bpa/:id`} component={BpaApplicationDetail} />
        <PrivateRoute path={`${path}/inbox/bpa/:id`} component={BpaApplicationDetail} />
        <PrivateRoute path={`${path}/inbox`} component={(props) => <Inbox {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/stakeholder-inbox`} component={(props) => <StakeholderInbox {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/bpa/:id`} component={BpaApplicationDetail} />
        <PrivateRoute path={`${path}/response`} component={OBPSResponse} />
        <PrivateRoute path={`${path}/stakeholder-response`} component={StakeholderResponse} />

        <PrivateRoute path={`${path}/clu/inbox`} component={(props) => <CLUInbox {...props} parentRoute={path} />} />  
        <PrivateRoute path={`${path}/clu/application-overview/:id`} component={(props) => <CLUEmployeeApplicationDetails {...props} parentRoute={path} />} />  
        <PrivateRoute path={`${path}/clu/response/:id`} component={(props) => <CLUResponse {...props} parentRoute={path} />} />
      </Switch>
    </Fragment>
  )
}

export default EmployeeApp;