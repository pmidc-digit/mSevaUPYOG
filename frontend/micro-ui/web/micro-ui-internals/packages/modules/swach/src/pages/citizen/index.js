import React from "react";
import { ReopenComplaint } from "./ReopenComplaint/index";
import SelectRating from "./Rating/SelectRating";
import { SwachRoutes, getRoute } from "../../constants/Routes";
import { useRouteMatch, Switch, useLocation, Route } from "react-router-dom";
import { AppContainer, BreadCrumb, PrivateRoute } from "@mseva/digit-ui-react-components";

import { CreateComplaint } from "./Create";
import { ComplaintsList } from "./ComplaintsList";
import ComplaintDetailsPage from "./ComplaintDetails";
import Response from "./Response";
import { useTranslation } from "react-i18next";

const SWBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/swach-home",
      content: `Swach Home`,
      show: location.pathname.includes("swach/") ? true : false,
    },
    { path: "/digit-ui/citizen/swach/my-applications",      show: false },  
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

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
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <React.Fragment>
      <div className="pgr-citizen-wrapper">
        <Switch>
          <AppContainer>
            {!isResponse ? (
            <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
              <SWBreadCrumbs location={location} />
            </div>
          ) : null}
          <PrivateRoute path={`${path}/create-complaint`} component={CreateComplaint} />
          <PrivateRoute path={`${path}/complaints`} exact component={ComplaintsList} />
          <PrivateRoute path={`${path}/complaints/:id+`} component={ComplaintDetailsPage} />
          <PrivateRoute path={`${path}/Attendence`} component={AttendencePage} />
          <PrivateRoute path={`${path}/ViewAttendence`} component={ViewAttendence} />
          <PrivateRoute
            path={`${path}/reopen/:id*`}
            component={() => <ReopenComplaint match={{ ...match, url, path: `${path}/reopen` }} parentRoute={path} />}
          />
          {/* <PrivateRoute
            path={`${path}/reopen`}
            component={() => <ReopenComplaint match={{ ...match, url, path: `${path}/reopen` }} parentRoute={path} />}
          /> */}
          <PrivateRoute path={`${path}/rate/:id*`} component={() => <SelectRating parentRoute={path} />} />
          <PrivateRoute path={`${path}/response`} component={() => <Response match={{ ...match, url, path }} />} />
          {/* <Route path={`${path}/response`}>
          <Response/>
          </Route> */}
          </AppContainer>
        </Switch>
      </div>
    </React.Fragment>
  );
};

export default App;
