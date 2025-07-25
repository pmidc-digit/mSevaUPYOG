import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch, useLocation, Route } from "react-router-dom";
import { PrivateRoute, BackButton } from "@mseva/digit-ui-react-components";

const App = ({ path }) => {
  return (
    <React.Fragment>
      <div className="ws-citizen-wrapper">
        {/* {!isAcknowledgement && (
          <BackButton style={{ border: "none" }} getBackPageNumber={getBackPageNumber}>
            {t("CS_COMMON_BACK")}
          </BackButton>
        )} */}
        <Switch>
          {/* <PrivateRoute path={`${path}/create-application`} component={WSCreate} /> */}
          {/* <PrivateRoute path={`${path}/disconnect-application`} component={WSDisconnection} /> */}
        </Switch>
      </div>
    </React.Fragment>
  );
};

export default App;
