import React from "react";
import { BreadCrumb, AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import { Redirect, Switch, useRouteMatch, useLocation } from "react-router-dom";
import ApplicationDetails from "./RALApplicationDetails";
import { useTranslation } from "react-i18next";

const RNDLBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/rentandlease-home",
      content: `${t("Rent and Lease")} Home`,
      show: location.pathname.includes("rentandlease/") ? true : false,
    },
    {
      path: "/digit-ui/citizen/ptr-home",
      content: t("PET_NDCSERVICE"),
      show: location.pathname.includes("ptr/petservice/test") ? true : false,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const App = () => {
  const location = useLocation();
  const { path, url, ...match } = useRouteMatch();
  const RALResponse = Digit?.ComponentRegistryService?.getComponent("RALResponse");
  const MyPropertiesComponent = Digit?.ComponentRegistryService?.getComponent("MyProperties");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <span className={"mcollect-citizen"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
          {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <RNDLBreadCrumbs location={location} />
            </div>
          ) : null}
          <PrivateRoute path={`${path}/my-properties`} component={MyPropertiesComponent} />
          <PrivateRoute path={`${path}/response/:applicationNumber`} component={RALResponse} />
          <PrivateRoute path={`${path}/property/:acknowledgementIds/:tenantId`} component={ApplicationDetails} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
