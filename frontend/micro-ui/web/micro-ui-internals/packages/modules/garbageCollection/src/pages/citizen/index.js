import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Redirect, Switch, useRouteMatch } from "react-router-dom";

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const CHBCreate = Digit?.ComponentRegistryService?.getComponent("CHBStepperForm");
  const GCMyApplications = Digit?.ComponentRegistryService?.getComponent("GCMyApplications");
  const GCApplicationDetails = Digit?.ComponentRegistryService?.getComponent("GCApplicationDetails");
  const GCResponseCitizen = Digit?.ComponentRegistryService?.getComponent("GCResponseCitizen");

  return (
    <span className={"chb-citizen"} style={{ width: "100%", paddingRight: "25px", paddingLeft: "25px" }}>
      <Switch>
        <AppContainer>
          <BackButton style={{ top: "55px" }}>Back</BackButton>
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
