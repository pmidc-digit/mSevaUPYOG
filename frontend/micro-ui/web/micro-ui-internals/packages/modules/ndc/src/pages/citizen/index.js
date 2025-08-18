import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";

const App = () => {
    const { path, url, ...match } = useRouteMatch();
    console.log("NDC Citizen App Loaded", path);

    const NewNDCStepForm = Digit.ComponentRegistryService.getComponent("NewNDCStepFormCitizen");
    const MyApplications = Digit.ComponentRegistryService.getComponent("MyApplications");
    const NDCResponseCitizen = Digit.ComponentRegistryService.getComponent("NDCResponseCitizen");

    return (
        <span className={"tl-citizen"}>
            <Switch>
                <AppContainer>
                    <PrivateRoute path={`${path}/new-application`} component={NewNDCStepForm} />
                    <PrivateRoute path={`${path}/my-application`} component={MyApplications} />
                    <PrivateRoute path={`${path}/response/:id`} component={NDCResponseCitizen} />

                </AppContainer>
            </Switch>
        </span>
    );
}

export default App;