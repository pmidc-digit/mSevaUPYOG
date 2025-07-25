import React from "react";
import { useTranslation } from "react-i18next";
import { Switch, useLocation } from "react-router-dom";
import { PrivateRoute, BreadCrumb } from "@mseva/digit-ui-react-components";

// import NewGCStepForm from "./NewApplication/NewApplicationStepForm/NewGCStepForm";

const App = ({ path }) => {
  console.log("2)gc employee/index path:", path);
  return (
    <Switch>
      <React.Fragment>
        <div className="ground-container">
          <div style={locationCheck ? { marginLeft: "12px" } : locationCheckReqDocs ? { marginLeft: "25px" } : { marginLeft: "-4px" }}>
            {/* <BILLSBreadCrumbs location={location} /> */}
          </div>

          {/* <PrivateRoute path={`${path}/inbox`} component={(props) => <GCInbox {...props} parentRoute={path} />} /> */}
          {/* <PrivateRoute path={`${path}/new-application`} component={(props) => <NewGCStepForm {...props} parentRoute={path} />} /> */}
        </div>
      </React.Fragment>
    </Switch>
  );
};

export default App;
