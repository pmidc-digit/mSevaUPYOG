import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const { t } = useTranslation();

  const NewNDCStepForm = Digit.ComponentRegistryService.getComponent("NewNDCStepFormCitizen");
  const MyApplications = Digit.ComponentRegistryService.getComponent("MyApplications");
  const NDCResponseCitizen = Digit.ComponentRegistryService.getComponent("NDCResponseCitizen");
  const ApplicationOverview = Digit?.ComponentRegistryService?.getComponent("CitizenApplicationOverview");

  return (
    <span className={"chb-citizen"} style={{ width: "100%", paddingRight: "25px", paddingLeft: "25px" }}>
     
      <Switch>
        <AppContainer>
           <BackButton>{t("CS_COMMON_BACK")}</BackButton>
          <PrivateRoute path={`${path}/new-application`} component={NewNDCStepForm} />
          <PrivateRoute path={`${path}/my-application`} component={MyApplications} />
          <PrivateRoute path={`${path}/response/:id`} component={NDCResponseCitizen} />
          <PrivateRoute path={`${path}/search/application-overview/:id`} component={ApplicationOverview} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
