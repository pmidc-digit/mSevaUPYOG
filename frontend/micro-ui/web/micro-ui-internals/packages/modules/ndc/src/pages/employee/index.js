import { BreadCrumb, PrivateRoute } from "@mseva/digit-ui-react-components";
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import SearchApplication from "./SearchApplication";
import { Switch, useLocation, Route } from "react-router-dom";
import CreateNDCApplicationStep from "./createNDCApplication";
import Response from "./Response";

const NDCBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/employee/ndc/inbox",
      content: t("ES_COMMON_INBOX"),
      show: location.pathname.includes("ndc/inbox") ? true : false,
    },
    {
      path: "/digit-ui/employee/ndc/create",
      content: "NDC Application Create Page",
      show: location.pathname.includes("ndc/create") ? true : false,
    },
    {
      path: "/digit-ui/employee/noc/inbox/application-overview/:id",
      content: t("NOC_APP_OVER_VIEW_HEADER"),
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
  const ApplicationOverview = Digit?.ComponentRegistryService?.getComponent("NDCApplicationOverview");
  const Inbox = Digit?.ComponentRegistryService?.getComponent("NDCInbox");
  const NewNDCStepForm = Digit.ComponentRegistryService.getComponent("NewNDCStepFormEmployee");

  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();

  return (
    <Fragment>
      <div className="ground-container">
        {!isResponse ? <NDCBreadCrumbs location={location} /> : null}
        <Switch>
          <PrivateRoute path={`${path}/inbox/application-overview/:id`} component={ApplicationOverview} />
          <PrivateRoute path={`${path}/search/application-overview/:id`} component={ApplicationOverview} />
          <Route path={`${path}/inbox`} component={(props) => <Inbox {...props} parentRoute={path} />} />
          <PrivateRoute path={`${path}/create`} component={(props) => <NewNDCStepForm {...props} parentRoute={path} />} />
          <PrivateRoute path={`${path}/response/:id`} component={Response} />
        </Switch>
      </div>
    </Fragment>
  );
};

export default EmployeeApp;
