import { BreadCrumb, AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch, useLocation } from "react-router-dom";
import { shouldHideBackButton } from "../../utils";
import { useTranslation } from "react-i18next";
import SearchApp from "../employee/SearchApp";
const hideBackButtonConfig = [];

const ADSBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/ads-home",
      content: `${t("Advertisement")} Home`,
      show: location.pathname.includes("ads/") ? true : false,
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
  const { path, url, ...match } = useRouteMatch();
  const { t } = useTranslation();
  const location = useLocation();
  const ADSCreate = Digit?.ComponentRegistryService?.getComponent("NewADSStepperForm");

  // const ADSCreate = Digit?.ComponentRegistryService?.getComponent("ADSCreate");
  // const ADSCreate = Digit?.ComponentRegistryService?.getComponent("NewPTRStepperForm");

  //  to show back button on top left of the page in order to go back to previous page
  const ADSMyApplications = Digit?.ComponentRegistryService?.getComponent("ADSMyApplications");
  const ADSApplicationDetails = Digit?.ComponentRegistryService?.getComponent("ADSApplicationDetails");
  const ADSResponse = Digit?.ComponentRegistryService?.getComponent("ADSResponseCitizen");
  const ApplicationOverview = Digit?.ComponentRegistryService?.getComponent("CitizenApplicationOverview");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  //this has been added in order show my bookings page
  return (
    <span className={"ads-citizen"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
          {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <ADSBreadCrumbs location={location} />
            </div>
          ) : null}
          <PrivateRoute path={`${path}/bookad`} component={ADSCreate} />
          <PrivateRoute path={`${path}/myBookings`} component={ADSMyApplications}></PrivateRoute>
          <PrivateRoute path={`${path}/application/:acknowledgementIds/:tenantId`} component={ADSApplicationDetails}></PrivateRoute>
          <PrivateRoute path={`${path}/adsservice/:response/:bookingNo`} component={ADSResponse}></PrivateRoute>
          <PrivateRoute path={`${path}/adsservice/:application-overview/:bookingNo`} component={ApplicationOverview}></PrivateRoute>
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
