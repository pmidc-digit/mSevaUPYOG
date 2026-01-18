import { AppContainer, BackButton, BreadCrumb, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { shouldHideBackButton } from "../../utils";
import { useTranslation } from "react-i18next";

const hideBackButtonConfig = [];

const NOCBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/noc-home",
      content: `NOC Home`,
      show: location.pathname.includes("/noc/new-application") ? true : false,
    },
    {
      path: "/digit-ui/citizen/noc-home",
      content: `NOC Home`,
      show: location.pathname.includes("noc/my-application") ? true : false,
    },
    {
      path: "/digit-ui/citizen/noc-home",
      content: `NOC Home`,
      show: location.pathname.includes("noc/search/application-overview/") ? true : false,
    },
    {
      path: "/digit-ui/citizen/noc-home",
      content: `NOC Home`,
      show: location.pathname.includes("noc/search-application") ? true : false,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const { t } = useTranslation();
  const NewNOCApplication = Digit?.ComponentRegistryService?.getComponent("NewNOCStepperForm");
  const NOCResponseCitizen = Digit.ComponentRegistryService.getComponent("NOCResponseCitizen");
  const NOCCitizenMyApplications = Digit.ComponentRegistryService.getComponent("NOCCitizenMyApplications");
  const NOCCitizenApplicationOverview = Digit?.ComponentRegistryService?.getComponent("NOCCitizenApplicationOverview");
  const NewNOCEditApplication = Digit?.ComponentRegistryService?.getComponent("NewNOCEditApplication");
  const NOCCitizenSearchApplication = Digit?.ComponentRegistryService?.getComponent("NOCCitizenSearchApplication");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();

  return (
    <span className={"pgr-citizen-wrapper"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
           {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <NOCBreadCrumbs location={location} />
            </div>
          ) : null}
          {/* {!shouldHideBackButton(hideBackButtonConfig) ? <BackButton>Back</BackButton> : ""} */}
          <PrivateRoute path={`${path}/new-application`} component={NewNOCApplication} />
          <PrivateRoute path={`${path}/response/:id`} component={NOCResponseCitizen} />
          <PrivateRoute path={`${path}/my-application`} component={NOCCitizenMyApplications} />
          <PrivateRoute path={`${path}/edit-application/:id`} component={NewNOCEditApplication} />
          <PrivateRoute path={`${path}/search/application-overview/:id`} component={NOCCitizenApplicationOverview} />
          <PrivateRoute path={`${path}/search-application`} component={NOCCitizenSearchApplication}  />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
