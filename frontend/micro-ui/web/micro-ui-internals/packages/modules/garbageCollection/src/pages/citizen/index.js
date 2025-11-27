import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Redirect, Switch, useRouteMatch } from "react-router-dom";

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const TestComp = Digit?.ComponentRegistryService?.getComponent("TestComp");
  const CHBCreate = Digit?.ComponentRegistryService?.getComponent("CHBStepperForm");

  return (
    <span className={"mcollect-citizen"}>
      <Switch>
        <AppContainer>
          <BackButton style={{ top: "55px" }}>Back</BackButton>
          <PrivateRoute path={`${path}/my-applications`} component={TestComp} />
          <PrivateRoute path={`${path}/create-application`} component={CHBCreate} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
