import React from "react";
import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { shouldHideBackButton } from "../../utils";
import { useTranslation } from "react-i18next";
// import TestComp from "../../pageComponents/TestComp";

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const { t } = useTranslation();

  console.log("yes here", path);

  const TestComp = Digit?.ComponentRegistryService?.getComponent("TestComp");

  return (
    <span className={"pet-citizen"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
          <BackButton style={{ top: "55px" }}>Back</BackButton>
          {/* <PrivateRoute path={`${path}/create-application`} component={TestComp} /> */}
          <PrivateRoute path={`${path}/create-application`} component={TestComp} />
          <PrivateRoute path={`${path}/my-application`} component={TestComp} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
