import { AppContainer, BackButton, PrivateRoute } from "@upyog/digit-ui-react-components";
import React from "react";
import { Switch, useRouteMatch } from "react-router-dom";

import { useTranslation } from "react-i18next";

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const { t } = useTranslation();

  console.log("Path in modulessamplesrcpagescitizenindex.js", path);
  // const Create = Digit?.ComponentRegistryService?.getComponent("BRCreate");
  const SampleTest = Digit?.ComponentRegistryService?.getComponent("SampleTest");

  return (
    <Switch>
      <AppContainer>
        <BackButton>Back</BackButton>
        <PrivateRoute path={`${path}/sampleTest`} component={SampleTest} />
      </AppContainer>
    </Switch>
  );
};

export default App;
