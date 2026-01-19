import { AppContainer, BackButton, PrivateRoute, BreadCrumb } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch, useLocation } from "react-router-dom";
import { shouldHideBackButton } from "../../utils";
import Search from "../employee/Search";
import { useTranslation } from "react-i18next";
import { PTMyPayments } from "./MyPayments";
import PaymentDetails from "../../utils/PaymentDetails";

const PropertyBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/pt-home",
      content: `${t("Property")} Home`,
      show: location.pathname.includes("pt/property/") ? true : false,
    },

    {
      path: "/digit-ui/citizen/pt-home",
      content: t("PET_SERVICE"),
      show: location.pathname.includes("pt/property/test") ? true : false,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const { t } = useTranslation();
  const location = useLocation();

  // const CreateProperty = Digit?.ComponentRegistryService?.getComponent("PTCreateProperty");
  const CreatePropertyForm = Digit?.ComponentRegistryService?.getComponent("NewPTStepperForm");
  const EditProperty = Digit?.ComponentRegistryService?.getComponent("PTEditProperty");
  const SearchPropertyComponent = Digit?.ComponentRegistryService?.getComponent("PTSearchPropertyComponent");
  const SearchResultsComponent = Digit?.ComponentRegistryService?.getComponent("PTSearchResultsComponent");
  const PTApplicationDetails = Digit?.ComponentRegistryService?.getComponent("PTApplicationDetails");
  const PTMyApplications = Digit?.ComponentRegistryService?.getComponent("PTMyApplications");
  const MyProperties = Digit?.ComponentRegistryService?.getComponent("PTMyProperties");
  const MutateProperty = Digit?.ComponentRegistryService?.getComponent("PTMutateProperty");
  const PropertyInformation = Digit?.ComponentRegistryService?.getComponent("PropertyInformation");
  const PropertyOwnerHistory = Digit?.ComponentRegistryService?.getComponent("PropertyOwnerHistory");
  const AssessmentDetails = Digit?.ComponentRegistryService?.getComponent("AssessmentDetailsCitizen");
  const NewApplicationCitizen = Digit?.ComponentRegistryService?.getComponent("NewApplicationCitizen");
  const CreateEmployeeStepForm = Digit?.ComponentRegistryService?.getComponent("CreateEmployeeStepForm");
  const PropertyDetailsCitizen = Digit?.ComponentRegistryService?.getComponent("PropertyDetailsCitizen");
  const PropertyApplicationDetails = Digit?.ComponentRegistryService?.getComponent("PropertyApplicationDetails");
  const PTResponseCitizen = Digit?.ComponentRegistryService?.getComponent("PTResponseCitizen");
  const SubmitResponse = Digit?.ComponentRegistryService?.getComponent("SubmitResponse");
  const GISIntegration = Digit?.ComponentRegistryService?.getComponent("GISIntegration");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <span className={"pt-citizen"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
          {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <PropertyBreadCrumbs location={location} />
            </div>
          ) : null}
          <PrivateRoute path={`${path}/property/create-application`} component={CreatePropertyForm} />
          {/* <PrivateRoute path={`${path}/property/new-application`} component={CreatePropertyForm} /> */}
          <PrivateRoute path={`${path}/property/edit-application/:id`} component={EditProperty} />
          <Route path={`${path}/property/citizen-search`} component={SearchPropertyComponent} />
          <Route path={`${path}/property/search-results`} component={SearchResultsComponent} />
          <PrivateRoute path={`${path}/property/application/:acknowledgementIds/:tenantId`} component={PTApplicationDetails}></PrivateRoute>
          {/* my applications real page in citizen side */}

          <PrivateRoute path={`${path}/property/my-applications`} component={PTMyApplications}></PrivateRoute>
          <PrivateRoute path={`${path}/property/my-properties`} component={MyProperties}></PrivateRoute>
          <PrivateRoute path={`${path}/property/my-payments`} component={PTMyPayments}></PrivateRoute>
          <PrivateRoute path={`${path}/property/property-mutation`} component={MutateProperty}></PrivateRoute>
          <PrivateRoute path={`${path}/property/properties/:propertyIds`} component={PropertyInformation}></PrivateRoute>
          <PrivateRoute path={`${path}/property/my-property/:id`} component={PropertyDetailsCitizen}></PrivateRoute>
          <PrivateRoute path={`${path}/payment-details/:id`} component={() => <PaymentDetails parentRoute={path} />} />
          {/* <PrivateRoute path={`${path}/property/transfer-ownership`} component={MutateProperty}></PrivateRoute> */}
          <PrivateRoute path={`${path}/property/owner-history/:tenantId/:propertyIds`} component={PropertyOwnerHistory}></PrivateRoute>
          {/* <Redirect to={`/`}></Redirect> */}
          <PrivateRoute path={`${path}/property/assessment-details/:id`} component={() => <AssessmentDetails parentRoute={path} />} />
          <PrivateRoute path={`${path}/property/search`} component={(props) => <Search {...props} t={t} parentRoute={path} />} />
          <PrivateRoute
            path={`${path}/property/application-preview/:id`}
            component={(props) => <PropertyApplicationDetails {...props} t={t} parentRoute={path} />}
          />
          <PrivateRoute path={`${path}/property/response/:id`} component={(props) => <PTResponseCitizen {...props} t={t} parentRoute={path} />} />
          <PrivateRoute path={`${path}/property/pt-acknowledgement`} component={SubmitResponse}></PrivateRoute>
          <PrivateRoute path={`${path}/property/gis-values`} component={GISIntegration} />
          {/* <PrivateRoute path={`${path}/property/create-application`} component={CreateEmployeeStepForm} /> */}
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
