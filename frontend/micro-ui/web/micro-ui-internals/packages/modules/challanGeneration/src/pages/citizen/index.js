import { BreadCrumb, AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Redirect, Switch, useRouteMatch, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MyChallanResultsComponent from "./MyChallan";
import ChallanApplicationDetails from "./ChallanApplicationDetails";

const ChallanBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/challangeneration-home",
      content: `${t("Challan Generation")} Home`,
      show: location.pathname.includes("challangeneration/") ? true : false,
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
  const SearchChallanComponent = Digit?.ComponentRegistryService?.getComponent("MCollectSearchChallanComponent");
  const SearchResultsComponent = Digit?.ComponentRegistryService?.getComponent("MCollectSearchResultsComponent");
  const ChallanSearch = Digit?.ComponentRegistryService?.getComponent("ChallanStepperForm");
  const ChallanResponseCitizen = Digit?.ComponentRegistryService?.getComponent("ChallanResponseCitizen");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <span className={"chb-citizen"} style={{ width: "100%", paddingRight: "25px", paddingLeft: "25px" }}>
      <Switch>
        <AppContainer>
          {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <ChallanBreadCrumbs location={location} />
            </div>
          ) : null}{" "}
          <PrivateRoute path={`${path}/search`} component={ChallanSearch} />
          <PrivateRoute path={`${path}/search-results`} component={SearchResultsComponent} />
          <PrivateRoute path={`${path}/My-Challans`} component={MyChallanResultsComponent} />
          <PrivateRoute path={`${path}/response/:id`} component={ChallanResponseCitizen} />
          <PrivateRoute path={`${path}/application/:acknowledgementIds/:tenantId`} component={ChallanApplicationDetails} />
          {/* <Redirect to={`/`}></Redirect> */}
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
