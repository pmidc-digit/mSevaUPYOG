import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { shouldHideBackButton } from "../../utils";
import { useTranslation } from "react-i18next";

const hideBackButtonConfig = [];

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const { t } = useTranslation();
  const NewNOCApplication = Digit?.ComponentRegistryService?.getComponent("NewNOCStepperForm");
  const NOCResponseCitizen = Digit.ComponentRegistryService.getComponent("NOCResponseCitizen");

  return (
    <span className={"noc-citizen"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
          {!shouldHideBackButton(hideBackButtonConfig) ? <BackButton>Back</BackButton> : ""}
          <PrivateRoute path={`${path}/new-application`} component={NewNOCApplication} />
          <PrivateRoute path={`${path}/response/:id`} component={NOCResponseCitizen} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
