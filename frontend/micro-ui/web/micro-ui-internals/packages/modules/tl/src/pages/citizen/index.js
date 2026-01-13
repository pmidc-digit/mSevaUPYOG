import { BreadCrumb, AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch, useLocation } from "react-router-dom";
// import TradeLicense from "../../pageComponents/TradeLicense";
import MyApplications from "../../pages/citizen/Applications/Application";
import { useTranslation } from "react-i18next";

// import ApplicationDetails from "../../pages/citizen/Applications/ApplicationDetails";
// import CreateTradeLicence from "./Create";
// import EditTrade from "./EditTrade";
// import { TLList } from "./Renewal";
// import RenewTrade from "./Renewal/renewTrade";
// import SearchTradeComponent from "./SearchTrade";

const TLBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/tl-home",
      content: `${t("MODULE_TL")} Home`,
      show: location.pathname.includes("tl/tradelicence/") ? true : false,
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
  let isSuccessScreen = window.location.href.includes("acknowledgement");
  let isCommonPTPropertyScreen = window.location.href.includes("/tl/tradelicence/new-application/property-details");

  const ApplicationDetails = Digit.ComponentRegistryService.getComponent("TLApplicationDetails");
  const CreateTradeLicence = Digit?.ComponentRegistryService?.getComponent("TLCreateTradeLicence");
  const CreateTradeLicenceStepForm = Digit?.ComponentRegistryService?.getComponent("TLCreateTradeLicenceStepForm");
  const EditTrade = Digit?.ComponentRegistryService?.getComponent("TLEditTrade");
  const RenewTrade = Digit?.ComponentRegistryService?.getComponent("RenewTLStepFormCitizen");
  // const RenewTrade = Digit?.ComponentRegistryService?.getComponent('TLRenewTrade');
  const TradeLicense = Digit?.ComponentRegistryService?.getComponent("TradeLicense");
  const TLList = Digit?.ComponentRegistryService?.getComponent("TLList");
  const SearchTradeComponent = Digit?.ComponentRegistryService?.getComponent("TLSearchTradeComponent");
  const TLResponseCitizen = Digit?.ComponentRegistryService?.getComponent("TLResponseCitizen");
  // const MyApplications = Digit?.ComponentRegistryService?.getComponent("MyApplications");

  const getBackPageNumber = () => {
    let goBacktoFromProperty = -1;
    if (
      sessionStorage.getItem("VisitedCommonPTSearch") === "true" &&
      (sessionStorage.getItem("VisitedAccessoriesDetails") === "true" || sessionStorage.getItem("VisitedisAccessories") === "true") &&
      isCommonPTPropertyScreen
    ) {
      goBacktoFromProperty = -4;
      sessionStorage.removeItem("VisitedCommonPTSearch");
      return goBacktoFromProperty;
    }
    return goBacktoFromProperty;
  };

  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();

  return (
    <span className={"chb-citizen"} style={{ width: "100%", paddingRight: "25px", paddingLeft: "25px" }}>
      <Switch>
        <AppContainer>
          {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <TLBreadCrumbs location={location} />
            </div>
          ) : null}{" "}
          {/* <PrivateRoute path={`${path}/tradelicence/new-application`} component={CreateTradeLicence} /> */}
          <PrivateRoute path={`${path}/tradelicence/new-application`} component={CreateTradeLicenceStepForm} />
          <PrivateRoute path={`${path}/tradelicence/edit-application/:id/:tenantId`} component={EditTrade} />
          <PrivateRoute path={`${path}/tradelicence/renew-trade/:id/:tenantId`} component={RenewTrade} />
          <PrivateRoute
            path={`${path}/tradelicence/my-application`}
            component={() => <MyApplications view="" />}
            // component={MyApplications}
          />
          <PrivateRoute path={`${path}/tradelicence/my-bills`} component={() => <MyApplications view="bills" />} />
          <PrivateRoute path={`${path}/tradelicence/tl-info`} component={TradeLicense} />
          <PrivateRoute path={`${path}/tradelicence/application/:id/:tenantId`} component={ApplicationDetails} />
          <PrivateRoute path={`${path}/response/:id`} component={TLResponseCitizen} />
          <PrivateRoute path={`${path}/tradelicence/renewal-list`} component={TLList} />
          <PrivateRoute path={`${path}/tradelicence/trade-search`} component={SearchTradeComponent} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
