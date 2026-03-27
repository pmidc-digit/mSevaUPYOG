import { BreadCrumb, PrivateRoute } from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SearchApplication from "./SearchApplication";
import { Switch, useLocation, useHistory } from "react-router-dom";
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
      path: "/digit-ui/employee/firenoc/inbox",
      content: t("ES_COMMON_INBOX"),
      show: (location.pathname.includes("firenoc/inbox") || location.pathname.includes("firenoc/new-application")) ? true : false,
    },
    {
      path: "/digit-ui/employee/firenoc/new-application",
      content: t("NOC_NEW_APPLICATION"),
      show: location.pathname.includes("firenoc/new-application") ? true : false,
    },
   
    {
      path: "/digit-ui/employee/firenoc/search/application",
      content: t("ES_COMMON_SEARCH_APPLICATION"),
      show: location.pathname.includes("firenoc/search/application") ? true : false,

    },
    {
      path: "/digit-ui/employee/firenoc/inbox/application-overview/:id",
      content: t("NOC_APPLICATION_OVERVIEW_HEADER"),
      show: location.pathname.includes("firenoc/inbox/application-overview") ? true : false,
    },
    {
      path: "/digit-ui/employee/firenoc/search",
      content: t("ES_COMMON_APPLICATION_SEARCH"),
      show: location.pathname.includes("/digit-ui/employee/firenoc/search") ? true : false,
    },
    {
      path: "/digit-ui/employee/firenoc/search/application-overview/:id",
      content: t("NOC_APP_OVER_VIEW_HEADER"),
      show: location.pathname.includes("/digit-ui/employee/firenoc/search/application-overview") ? true : false,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const EmployeeApp = ({ path }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const ApplicationOverview = Digit?.ComponentRegistryService?.getComponent("FIRENOCApplicationOverview");
  const Inbox = Digit?.ComponentRegistryService?.getComponent("FIRENOCInbox");
  const NewNOCApplication = Digit?.ComponentRegistryService?.getComponent("FIRENOCStepperForm");
  const EmployeeNOCNewApplication = Digit?.ComponentRegistryService?.getComponent("FIRENOCEmployeeStepperForm");
  const NOCEmployeeApplicationOverview = Digit?.ComponentRegistryService?.getComponent("FIRENOCEmployeeApplicationOverview");
  const FireNOCEmployeeInboxDetails = Digit?.ComponentRegistryService?.getComponent("FIRENOCEmployeeInboxDetails");
  const NewNOCEditApplication = Digit?.ComponentRegistryService?.getComponent("FIRENOCEditApplication");
  const NOCCitizenApplicationOverview = Digit?.ComponentRegistryService?.getComponent("NOCCitizenApplicationOverview");
  const NOCEsignResponse = Digit?.ComponentRegistryService?.getComponent("FIRENOCEsignResponse");

    const history = useHistory();

  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
    useEffect(() => {
      if (window.location.pathname.endsWith("/complete")) {
        history.push(`/digit-ui/employee/noc-home`);
  
      }
  
    }, []);

  return (
    <Fragment>
      {!isResponse ? <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px", marginTop:"34px" } : {}}>
        <NOCBreadCrumbs location={location} />
      </div> : null} 
      <Switch>
        <PrivateRoute path={`${path}/inbox/application-overview/:id`} component={FireNOCEmployeeInboxDetails} />
        <PrivateRoute path={`${path}/search/application-overview/:id`} component={ApplicationOverview} />
        <PrivateRoute path={`${path}/inbox`} component={(props) => <Inbox {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/search`} component={(props) => <SearchApplication {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/new-application`} component={EmployeeNOCNewApplication} />
        <PrivateRoute path={`${path}/response/:id`} component={Response} />
        <PrivateRoute path={`${path}/search/application`} component={NOCCitizenApplicationOverview} />
        <PrivateRoute path={`${path}/esign/complete/:id/:file`} component={NOCEsignResponse} />

      </Switch>
    </Fragment>
  );
};

export default EmployeeApp;
