import React from "react";
import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import { Redirect, Switch, useRouteMatch } from "react-router-dom";
import ApplicationDetails from "./RALApplicationDetails";

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const RALResponse = Digit?.ComponentRegistryService?.getComponent("RALResponse");
  const MyPropertiesComponent = Digit?.ComponentRegistryService?.getComponent("MyProperties");

  return (
    <span className={"mcollect-citizen"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
          <BackButton style={{ top: "55px" }}>Back</BackButton>
          <PrivateRoute path={`${path}/my-properties`} component={MyPropertiesComponent} />
          <PrivateRoute path={`${path}/response/:applicationNumber`} component={RALResponse} />
          <PrivateRoute path={`${path}/property/:acknowledgementIds/:tenantId`} component={ApplicationDetails} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
