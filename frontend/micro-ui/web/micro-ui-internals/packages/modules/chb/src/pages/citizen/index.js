import { BreadCrumb, AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch, useLocation } from "react-router-dom";
import { shouldHideBackButton } from "../../utils";
import { useTranslation } from "react-i18next";

const hideBackButtonConfig = [{ screenPath: "bookHall/acknowledgement" }, { screenPath: "editbookHall/acknowledgement" }];

const CHBBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/chb-home",
      content: `${t("MODULE_CHB")} Home`,
      show: location.pathname.includes("chb/bookHall") ? true : false,
    },
    {
      path: "/digit-ui/citizen/chb-home",
      content: `${t("MODULE_CHB")} Home`,
      show: location.pathname.includes("chb/myBookings") ? true : false,
    },
    {
      path: "/digit-ui/citizen/chb-home",
      content: `${t("MODULE_CHB")} Home`,
      show: location.pathname.includes("chb/application") ? true : false,
    },
    {
      path: "/digit-ui/citizen/chb-home",
      content: t("MODULE_CHB"),
      show: location.pathname.includes("chb/test") ? true : false,
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

  const CHBCreate = Digit?.ComponentRegistryService?.getComponent("CHBStepperForm");
  const CHBApplicationDetails = Digit?.ComponentRegistryService?.getComponent("CHBApplicationDetails");
  const CHBMyApplications = Digit?.ComponentRegistryService?.getComponent("CHBMyApplications");
  const CHBResponseCitizen = Digit.ComponentRegistryService.getComponent("CHBResponseCitizen");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <span className={"chb-citizen"} style={{ width: "100%", paddingRight: "25px", paddingLeft: "25px" }}>
      <Switch>
        <AppContainer>
          {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <CHBBreadCrumbs location={location} />
            </div>
          ) : null}
          {/* {!shouldHideBackButton(hideBackButtonConfig) ? <BackButton>Back</BackButton> : ""} */}
          <PrivateRoute path={`${path}/bookHall`} component={CHBCreate} />
          <PrivateRoute path={`${path}/myBookings`} component={CHBMyApplications}></PrivateRoute>
          <PrivateRoute path={`${path}/application/:acknowledgementIds/:tenantId`} component={CHBApplicationDetails}></PrivateRoute>
          {/* <PrivateRoute path={`${path}/petservice/my-payments`} component={PTMyPayments}></PrivateRoute> */}
          <PrivateRoute path={`${path}/response/:id`} component={CHBResponseCitizen} />
          <PrivateRoute path={`${path}/bookHall/search`} component={(props) => <Search {...props} t={t} parentRoute={path} />} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
