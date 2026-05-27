import { BreadCrumb, PrivateRoute, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SearchApplication from "./SearchApplication";
import { Switch, useLocation, useHistory, Link } from "react-router-dom";
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
      show: (location.pathname.includes("firenoc/inbox") || location.pathname.includes("firenoc/new-application") || location.pathname.includes("firenoc/inbox/application-overview") || location.pathname.includes("firenoc/application-overview")) ? true : false,
    },
    {
      path: "/digit-ui/employee/firenoc/inbox",
      content: `NOC Home`,
      show: location.pathname.includes("firenoc/new-application") ? true : false,
    },

    {
      path: "/digit-ui/employee/firenoc/search/application",
      content: t("ES_COMMON_SEARCH_APPLICATION"),
      show: (location.pathname.includes("noc/search/application") || location.pathname.includes("firenoc/search/application")) ? true : false,

    },
    {
      path: "/digit-ui/employee/firenoc/inbox/application-overview/:id",
      content: t("NOC_APPLICATION_OVERVIEW_HEADER"),
      show: (location.pathname.includes("noc/inbox/application-overview") || location.pathname.includes("firenoc/inbox/application-overview") || location.pathname.includes("firenoc/application-overview")) ? true : false,
    },
    {
      path: "/digit-ui/employee/firenoc/search",
      content: t("ES_COMMON_APPLICATION_SEARCH"),
      show: (location.pathname.includes("/digit-ui/employee/firenoc/search") && !location.pathname.endsWith("/search/application")) ? true : false,
    },
    {
      path: "/digit-ui/employee/firenoc/search/application-overview/:id",
      content: t("NOC_APP_OVER_VIEW_HEADER"),
      show: (location.pathname.includes("/digit-ui/employee/firenoc/search/application-overview") || location.pathname.includes("/digit-ui/employee/firenoc/search/application-overview")) ? true : false,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const EmployeeApp = ({ path }) => {
  const location = useLocation();
  const { t } = useTranslation();
  // const ApplicationOverview = Digit?.ComponentRegistryService?.getComponent("FIRENOCApplicationOverview");
  const Inbox = Digit?.ComponentRegistryService?.getComponent("FIRENOCInbox");
  const NewNOCApplication = Digit?.ComponentRegistryService?.getComponent("FIRENOCStepperForm");
  const NOCEmployeeApplicationOverview = Digit?.ComponentRegistryService?.getComponent("FIRENOCEmployeeApplicationOverview");
  const NewNOCEditApplication = Digit?.ComponentRegistryService?.getComponent("FIRENOCEditApplication");
  const NOCCitizenApplicationOverview = Digit?.ComponentRegistryService?.getComponent("NOCCitizenApplicationOverview");
  const NOCEsignResponse = Digit?.ComponentRegistryService?.getComponent("FIRENOCEsignResponse");
  const FIRENOCCitizenApplicationOverview = Digit?.ComponentRegistryService?.getComponent("FIRENOCCitizenApplicationOverview");

  const history = useHistory();

  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  useEffect(() => {
    if (window.location.pathname.endsWith("/complete")) {
      history.push(`/digit-ui/employee/firenoc-home`);

    }

  }, []);

  const showNewApplicationButton =
    !location.pathname.includes("new-application") &&
    !location.pathname.includes("edit-application") &&
    !location.pathname.includes("firenoc/inbox") &&
    !isResponse;

  return (
    <Fragment>
      {!isResponse ? (
        <div
          style={
            window.location.href.includes("application-overview") || isMobile
              ? { marginLeft: "10px", marginTop: "34px", display: "flex", justifyContent: "space-between", alignItems: "center" }
              : { display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: "10px", marginTop: "34px", }
          }
        >
          <NOCBreadCrumbs location={location} />
          {showNewApplicationButton && (
            <Link style={{ marginRight: "10px" }} to="/digit-ui/employee/firenoc/new-application">
              <SubmitBar label={t("NOC_NEW_APPLICATION")} />
            </Link>
          )}
        </div>
      ) : null}
      <Switch>
        <PrivateRoute path={`${path}/inbox/application-overview/:id`} component={FIRENOCCitizenApplicationOverview} />
        <PrivateRoute path={`${path}/search/application-overview/:id`} component={FIRENOCCitizenApplicationOverview} />
        <PrivateRoute path={`${path}/inbox`} component={(props) => <Inbox {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/new-application`} component={NewNOCApplication} />
        <PrivateRoute path={`${path}/edit-application/:id`} component={NewNOCEditApplication} />
        <PrivateRoute path={`${path}/search`} component={(props) => <SearchApplication {...props} parentRoute={path} />} />
        <PrivateRoute path={`${path}/response/:id`} component={Response} />
        <PrivateRoute path={`${path}/search/application`} component={NOCCitizenApplicationOverview} />
        <PrivateRoute path={`${path}/esign/complete/:id/:file`} component={NOCEsignResponse} />
        <PrivateRoute path={`${path}/application-overview/:appNo`} component={FIRENOCCitizenApplicationOverview} />
      </Switch>
    </Fragment>
  );
};

export default EmployeeApp;
