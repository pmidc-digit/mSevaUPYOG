import React from "react";
import { ReopenComplaint } from "./ReopenComplaint/index";
import SelectRating from "./Rating/SelectRating";
import { SwachRoutes, getRoute } from "../../constants/Routes";
import { useRouteMatch, Switch, useLocation, Route } from "react-router-dom";
import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";

import { CreateComplaint } from "./Create";
import { ComplaintsList } from "./ComplaintsList";
import ComplaintDetailsPage from "./ComplaintDetails";
import Response from "./Response";
import { useTranslation } from "react-i18next";

const App = () => {
  const { t } = useTranslation();
  const { path, url, ...match } = useRouteMatch();
  const location = useLocation();
  console.log("path", path);
  const CreateComplaint = Digit?.ComponentRegistryService?.getComponent("SWACHCitizenCreateComplaint");
  const ComplaintsList = Digit?.ComponentRegistryService?.getComponent("SWACHComplaintsList");
  const ComplaintDetailsPage = Digit?.ComponentRegistryService?.getComponent("SWACHComplaintDetailsPage");
  // const SelectRating = Digit?.ComponentRegistryService?.getComponent("PGRSelectRating");
  const Response = Digit?.ComponentRegistryService?.getComponent("SWACHResponseCitzen");
  const AttendencePage = Digit?.ComponentRegistryService?.getComponent("Attendence");
  const ViewAttendence = Digit?.ComponentRegistryService?.getComponent("ViewAttendence");
 const ReopenComplaint = Digit?.ComponentRegistryService?.getComponent("SWACHReopenComplaint");
  return (
    <React.Fragment>
      <div className="pgr-citizen-wrapper">
        {!location.pathname.includes("/response") && <BackButton>{t("CS_COMMON_BACK")}</BackButton>}
        <Switch>
          {/* <AppContainer> */}
          <PrivateRoute path={`${path}/create-complaint`} component={CreateComplaint} />
          <PrivateRoute path={`${path}/complaints`} exact component={ComplaintsList} />
          <PrivateRoute path={`${path}/complaints/:id*`} component={ComplaintDetailsPage} />
          <PrivateRoute path={`${path}/Attendence`} component={AttendencePage} />
          <PrivateRoute path={`${path}/ViewAttendence`} component={ViewAttendence} />
          <PrivateRoute path={`${path}/reopen/:id*`} component={() => <ReopenComplaint match={{ ...match, url, path: `${path}/reopen` }} parentRoute={path} />} />
          {/* <PrivateRoute
            path={`${path}/reopen`}
            component={() => <ReopenComplaint match={{ ...match, url, path: `${path}/reopen` }} parentRoute={path} />}
          /> */}
          <PrivateRoute path={`${path}/rate/:id*`} component={() => <SelectRating parentRoute={path} />} />
          <PrivateRoute path={`${path}/response`} component={() => <Response match={{ ...match, url, path }} />} />
          {/* <Route path={`${path}/response`}>
          <Response/>
          </Route> */}
          {/* </AppContainer> */}
        </Switch>
      </div>
    </React.Fragment>
  );
};

export default App;
