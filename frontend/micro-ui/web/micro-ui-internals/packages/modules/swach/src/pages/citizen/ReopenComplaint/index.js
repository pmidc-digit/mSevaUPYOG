import React, { useMemo } from "react";

import { Route, Switch, useRouteMatch, useParams } from "react-router-dom";
// import UserOnboarding from "../UserOnboarding/index";
import { SwachRoutes, getRoute } from "../../../constants/Routes";
import ReasonPage from "./Reason";
import UploadPhoto from "./UploadPhoto";
import AddtionalDetails from "./AddtionalDetails";
import Response from "../Response";

const ReopenComplaint = ({ match, history, parentRoute }) => {
  const { id } = useParams();
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId();

  const complaintDetails = Digit.Hooks.swach.useComplaintDetails({ tenantId: tenantId, id: id }).complaintDetails;
  console.log("complaintDetails in index", complaintDetails);
  return (
    // <Switch>
    //   <Route path={`${parentRoute}/reopen/upload-photo/:id*`} component={() => <UploadPhoto match={match} skip={true} {...{ complaintDetails }} />} />
    //   <Route path={`${parentRoute}/reopen/addional-details/:id*`} component={() => <AddtionalDetails match={match} parentRoute={parentRoute} {...{ complaintDetails }} />}/>
    //   <Route path={`${match.path}/response`} component={() => <Response match={match} />} />
    //   <Route path={`${parentRoute}/reopen/:id*`} component={() => <ReasonPage match={match} {...{ complaintDetails }} />} />
    // </Switch>
    <Switch>
      <Route
        path={`${parentRoute}/reopen/upload-photo/:id*`}
        render={(routeProps) => <UploadPhoto {...routeProps} match={match} skip={true} complaintDetails={complaintDetails} />}
      />
      <Route
        path={`${parentRoute}/reopen/addional-details/:id*`}
        render={(routeProps) => <AddtionalDetails {...routeProps} match={match} parentRoute={parentRoute} complaintDetails={complaintDetails} />}
      />
      <Route
        path={`${match.path}/response`}
        render={(routeProps) => <Response {...routeProps} match={match} complaintDetails={complaintDetails} />}
      />
      <Route
        path={`${parentRoute}/reopen/:id*`}
        render={(routeProps) => <ReasonPage {...routeProps} match={match} complaintDetails={complaintDetails} />}
      />
    </Switch>
  );
};

export { ReopenComplaint };
