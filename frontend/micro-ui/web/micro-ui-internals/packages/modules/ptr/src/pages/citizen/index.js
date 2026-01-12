import { BreadCrumb, AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch, useLocation } from "react-router-dom";
import { shouldHideBackButton } from "../../utils";
import { useTranslation } from "react-i18next";

const PTRBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/ptr-home",
      content: `${t("PET_SERVICE")} Home`,
      show: location.pathname.includes("ptr/petservice/") ? true : false,
    },

    {
      path: "/digit-ui/citizen/ptr-home",
      content: t("PET_SERVICE"),
      show: location.pathname.includes("ptr/petservice/test") ? true : false,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const { t } = useTranslation();
  const location = useLocation();
  const inboxInitialState = {
    searchParams: {},
  };

  // const PTRCreate = Digit?.ComponentRegistryService?.getComponent("PTRCreatePet");
  const PTRApplicationDetails = Digit?.ComponentRegistryService?.getComponent("PTRApplicationDetails");
  const PTRMyApplications = Digit?.ComponentRegistryService?.getComponent("PTRMyApplications");
  const PTRCreate = Digit?.ComponentRegistryService?.getComponent("NewPTRStepperForm");
  const PTRResponse = Digit?.ComponentRegistryService?.getComponent("PTRResponseCitizen");
  const RenewPTR = Digit?.ComponentRegistryService?.getComponent("RenewPTRStepForm");
  const PTRList = Digit?.ComponentRegistryService?.getComponent("PTRList");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();

  return (
    <span className={"pet-citizen"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
          {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <PTRBreadCrumbs location={location} />
            </div>
          ) : null}
          <PrivateRoute path={`${path}/petservice/new-application/:id?`} component={PTRCreate} />
          <PrivateRoute path={`${path}/petservice/application/:acknowledgementIds/:tenantId`} component={PTRApplicationDetails}></PrivateRoute>
          <PrivateRoute path={`${path}/petservice/my-applications`} component={PTRMyApplications}></PrivateRoute>
          <PrivateRoute path={`${path}/petservice/response/:applicationNumber`} component={PTRResponse} />
          <PrivateRoute path={`${path}/petservice/renewal-list`} component={PTRList} />
          <PrivateRoute path={`${path}/petservice/renew-ptr/:applicationNumber/:tenantId`} component={RenewPTR} />
          {/* <PrivateRoute path={`${path}/petservice/my-payments`} component={PTMyPayments}></PrivateRoute> */}
          <PrivateRoute path={`${path}/petservice/search`} component={(props) => <Search {...props} t={t} parentRoute={path} />} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
