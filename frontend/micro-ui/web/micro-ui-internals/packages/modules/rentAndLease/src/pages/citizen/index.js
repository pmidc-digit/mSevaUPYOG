import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Redirect, Switch, useRouteMatch } from "react-router-dom";
// import SearchChallanComponent from "./SearchChallan";
// import SearchResultsComponent from "./SearchResults";
// import MyChallanResultsComponent from "./MyChallan";
//import BillInfo from "./SearchResults/BillInfo";
import ApplicationDetails from "./RALApplicationDetails";

const App = () => {
  const { path, url, ...match } = useRouteMatch();

  console.log('path', path)

  const SearchChallanComponent = Digit?.ComponentRegistryService?.getComponent("MCollectSearchChallanComponent");
  const SearchResultsComponent = Digit?.ComponentRegistryService?.getComponent("MCollectSearchResultsComponent");
  // const MyChallanResultsComponent = Digit?.ComponentRegistryService?.getComponent("MCollectMyChallanResultsComponent");
  const NewRentAndLeaseStepperForm = Digit?.ComponentRegistryService?.getComponent("NewRentAndLeaseStepperForm");
  const RALResponse = Digit?.ComponentRegistryService?.getComponent("RALResponse");
  const MyPropertiesComponent = Digit?.ComponentRegistryService?.getComponent("MyProperties");

  return (
    <span className={"mcollect-citizen"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
          <BackButton style={{ top: "55px" }}>Back</BackButton>
          <PrivateRoute path={`${path}/search`} component={SearchChallanComponent} />
          <PrivateRoute path={`${path}/search-results`} component={SearchResultsComponent} />
          <PrivateRoute path={`${path}/allot-property`} component={NewRentAndLeaseStepperForm} />
          <PrivateRoute path={`${path}/my-properties`} component={MyPropertiesComponent} />
          <PrivateRoute path={`${path}/response/:applicationNumber`} component={RALResponse} />
          <PrivateRoute path={`${path}/property/:acknowledgementIds/:tenantId`} component={ApplicationDetails} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
