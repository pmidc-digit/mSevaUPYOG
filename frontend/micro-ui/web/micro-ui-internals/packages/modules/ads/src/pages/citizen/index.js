import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { shouldHideBackButton } from "../../utils";
import { useTranslation } from "react-i18next";

const hideBackButtonConfig = [];

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const { t } = useTranslation();
  const ADSCreate = Digit?.ComponentRegistryService?.getComponent("ADSCreate");
//  to show back button on top left of the page in order to go back to previous page
const ADSMyApplications = Digit?.ComponentRegistryService?.getComponent("ADSMyApplications");
const ADSApplicationDetails = Digit?.ComponentRegistryService?.getComponent("ADSApplicationDetails");
//this has been added in order show my bookings page
  return (
    <span className={"ads-citizen"}style={{width:"100%"}}>
      <Switch>
        <AppContainer>
          {!shouldHideBackButton(hideBackButtonConfig) ? <BackButton>Back</BackButton> : ""}
         <PrivateRoute path={`${path}/bookad`} component={ADSCreate}/>
         <PrivateRoute path={`${path}/myBookings`} component={ADSMyApplications}></PrivateRoute>
         <PrivateRoute path={`${path}/application/:acknowledgementIds/:tenantId`} component={ADSApplicationDetails}></PrivateRoute>


        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;