import React from "react";
import { ReopenComplaint } from "./ReopenComplaint/index";
import SelectRating from "./Rating/SelectRating";
import { PgrRoutes, getRoute } from "../../constants/Routes";
import { useRouteMatch, Switch, useLocation, Route } from "react-router-dom";
import { BreadCrumb, AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";

import { CreateComplaint } from "./Create";
import { ComplaintsList } from "./ComplaintsList";
import ComplaintDetailsPage from "./ComplaintDetails";
import Response from "./Response";
import { useTranslation } from "react-i18next";

const PGRBreadCrumbs = ({ location }) => {
  const { t } = useTranslation();
  const crumbs = [
    {
      path: "/digit-ui/citizen",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/citizen/pgr-home",
      content: `${t("Grievance")} Home`,
      show: location.pathname.includes("pgr/") ? true : false,
    },
    {
      path: "/digit-ui/citizen/ptr-home",
      content: t("PET_NDCSERVICE"),
      show: location.pathname.includes("ptr/petservice/test") ? true : false,
    },
  ];
  return <BreadCrumb crumbs={crumbs} />;
};

const App = () => {
  const { t } = useTranslation();
  const { path, url, ...match } = useRouteMatch();
  const location = useLocation();
  const CreateComplaint = Digit?.ComponentRegistryService?.getComponent("PGRCitizenCreateComplaint");
  const ComplaintsList = Digit?.ComponentRegistryService?.getComponent("PGRComplaintsList");
  const ComplaintDetailsPage = Digit?.ComponentRegistryService?.getComponent("PGRComplaintDetailsPage");
  const SelectRating = Digit?.ComponentRegistryService?.getComponent("PGRSelectRating");
  const Response = Digit?.ComponentRegistryService?.getComponent("PGRResponseCitzen");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();
  return (
    <React.Fragment>
      <div className="pgr-citizen-wrapper-width-fixed ">
        <Switch>
          <AppContainer>
            {!isResponse ? (
              <div style={window.location.href.includes("application-overview") || isMobile ? { marginLeft: "10px" } : {}}>
                <PGRBreadCrumbs location={location} />
              </div>
            ) : null}{" "}
            <PrivateRoute path={`${path}/create-complaint`} component={CreateComplaint} />
            <PrivateRoute path={`${path}/complaints`} exact component={ComplaintsList} />
            <PrivateRoute path={`${path}/complaints/:fullUrlAndUlb*`} component={ComplaintDetailsPage} />
            <PrivateRoute
              path={`${path}/reopen`}
              component={() => <ReopenComplaint match={{ ...match, url, path: `${path}/reopen` }} parentRoute={path} />}
            />
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
