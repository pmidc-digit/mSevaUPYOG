import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Redirect, Switch, useRouteMatch } from "react-router-dom";
// import SearchChallanComponent from "./SearchChallan";
// import SearchResultsComponent from "./SearchResults";
// import MyChallanResultsComponent from "./MyChallan";
//import BillInfo from "./SearchResults/BillInfo";
import MyChallanResultsComponent from "./MyChallan";
import ChallanApplicationDetails from "./ChallanApplicationDetails";

const App = () => {
  const { path, url, ...match } = useRouteMatch();

  const SearchChallanComponent = Digit?.ComponentRegistryService?.getComponent("MCollectSearchChallanComponent");
  const SearchResultsComponent = Digit?.ComponentRegistryService?.getComponent("MCollectSearchResultsComponent");
  const ChallanSearch = Digit?.ComponentRegistryService?.getComponent("ChallanStepperForm");
  const ChallanResponseCitizen = Digit?.ComponentRegistryService?.getComponent("ChallanResponseCitizen");

  console.log("here coming");

  return (
    <span className={"chb-citizen"} style={{ width: "100%", paddingRight: "25px", paddingLeft: "25px" }}>
      <Switch>
        <AppContainer>
          <BackButton style={{ top: "55px" }}>Back</BackButton>
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
