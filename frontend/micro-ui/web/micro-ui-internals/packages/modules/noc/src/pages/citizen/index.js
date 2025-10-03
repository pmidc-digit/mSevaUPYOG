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
  const NOCCitizenMyApplications = Digit.ComponentRegistryService.getComponent("NOCCitizenMyApplications");
  const NOCCitizenApplicationOverview = Digit?.ComponentRegistryService?.getComponent("NOCCitizenApplicationOverview");
  const NewNOCEditApplication = Digit?.ComponentRegistryService?.getComponent("NewNOCEditApplication");

  return (
    <span className={"pgr-citizen-wrapper"} style={{ width: "100%" }}>
      <Switch>
        <AppContainer>
          {!shouldHideBackButton(hideBackButtonConfig) ? <BackButton>Back</BackButton> : ""}
          <PrivateRoute path={`${path}/new-application`} component={NewNOCApplication} />
          <PrivateRoute path={`${path}/response/:id`} component={NOCResponseCitizen} />
          <PrivateRoute path={`${path}/my-application`} component={NOCCitizenMyApplications} />
           <PrivateRoute path={`${path}/edit-application/:id`} component={NewNOCEditApplication} />
          <PrivateRoute path={`${path}/search/application-overview/:id`} component={NOCCitizenApplicationOverview} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
