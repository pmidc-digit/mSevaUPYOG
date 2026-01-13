import { BreadCrumb, AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Redirect, Switch, useRouteMatch, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GCBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/garbagecollection-home",
      content: `${t("Garbage Collection")} Home`,
      show: location.pathname.includes("garbagecollection/") ? true : false,
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
  const CHBCreate = Digit?.ComponentRegistryService?.getComponent("CHBStepperForm");
  const GCMyApplications = Digit?.ComponentRegistryService?.getComponent("GCMyApplications");
  const GCApplicationDetails = Digit?.ComponentRegistryService?.getComponent("GCApplicationDetails");
  const GCResponseCitizen = Digit?.ComponentRegistryService?.getComponent("GCResponseCitizen");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <span className={"chb-citizen"} style={{ width: "100%", paddingRight: "25px", paddingLeft: "25px" }}>
      <Switch>
        <AppContainer>
          {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <GCBreadCrumbs location={location} />
            </div>
          ) : null}{" "}
          <PrivateRoute path={`${path}/my-applications`} component={GCMyApplications} />
          <PrivateRoute path={`${path}/create-application`} component={CHBCreate} />
          <PrivateRoute path={`${path}/application/:acknowledgementIds/:tenantId`} component={GCApplicationDetails} />
          <PrivateRoute path={`${path}/response/:id`} component={GCResponseCitizen} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
