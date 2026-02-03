import { BreadCrumb, PrivateRoute } from "@mseva/digit-ui-react-components";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import SearchApplication from "./SearchApplication";
import { Switch, useLocation } from "react-router-dom";
import Response from "./Response";

const NOCBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/employee/noc/inbox",
      content: t("ES_COMMON_INBOX"),
      show: (location.pathname.includes("noc/inbox") || location.pathname.includes("noc/new-application")) ? true : false,
    },
   
    {
      path: "/digit-ui/employee/noc/search/application",
      content: t("ES_COMMON_SEARCH_APPLICATION"),
      show: location.pathname.includes("noc/search/application") ? true : false,

    },
    {
      path: "/digit-ui/employee/noc/inbox/application-overview/:id",
      content: t("NOC_APPLICATION_OVERVIEW_HEADER"),
      show: location.pathname.includes("noc/inbox/application-overview") ? true : false,
    },
    {
      path: "/digit-ui/employee/noc/search",
      content: t("ES_COMMON_APPLICATION_SEARCH"),
      show: location.pathname.includes("/digit-ui/employee/noc/search") ? true : false,
    },
    {
      path: "/digit-ui/employee/noc/search/application-overview/:id",
      content: t("NOC_APP_OVER_VIEW_HEADER"),
      show: location.pathname.includes("/digit-ui/employee/noc/search/application-overview") ? true : false,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const EmployeeApp = ({ path }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const ApplicationOverview = Digit?.ComponentRegistryService?.getComponent("NOCApplicationOverview");
  const Inbox = Digit?.ComponentRegistryService?.getComponent("NOCInbox");
  const NewNOCApplication = Digit?.ComponentRegistryService?.getComponent("NewNOCStepperForm");
  const NOCEmployeeApplicationOverview = Digit?.ComponentRegistryService?.getComponent("NOCEmployeeApplicationOverview");
  const NewNOCEditApplication = Digit?.ComponentRegistryService?.getComponent("NewNOCEditApplication");
  const NOCCitizenApplicationOverview = Digit?.ComponentRegistryService?.getComponent("NOCCitizenApplicationOverview");

  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();

  return (
    <Fragment>
      {!isResponse ? <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px", marginTop:"20px" } : {}}>
        <NOCBreadCrumbs location={location} />
      </div> : null} 
      <Switch>
        {/* <PrivateRoute path={`${path}/inbox/application-overview/:id`} component={ApplicationOverview} /> */}
        <PrivateRoute path={`${path}/inbox/application-overview/:id`} component={NOCEmployeeApplicationOverview} />
        <PrivateRoute path={`${path}/search/application-overview/:id`} component={ApplicationOverview} />
        <PrivateRoute path={`${path}/inbox`} component={(props) => <Inbox {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/search`} component={(props) => <SearchApplication {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/response/:id`} component={Response} />
        <PrivateRoute path={`${path}/search/application`} component={NOCCitizenApplicationOverview} />
        
      </Switch>
    </Fragment>
  );
};

export default EmployeeApp;
