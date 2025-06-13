import React, { useMemo } from "react";

import { Route, Switch, useRouteMatch,useParams } from "react-router-dom";
// import UserOnboarding from "../UserOnboarding/index";
import { SwachRoutes, getRoute } from "../../../constants/Routes";
import ReasonPage from "./Reason";
import UploadPhoto from "./UploadPhoto";
import AddtionalDetails from "./AddtionalDetails";
import Response from "../Response";
// import {SwachRoutes} from "../../../constants/Routes";

const ReopenComplaint = ({ match, history, parentRoute }) => {
  console.log("ReopenComplaint match", match);
  console.log("ReopenComplaint history", history);
  console.log("ReopenComplaint parentRoute", parentRoute);
  // const allParams = window.location.pathname.split("/")
  // const id = allParams[allParams.length - 1];
  const { id } = useParams()
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId();

  const complaintDetails = Digit.Hooks.swach.useComplaintDetails({ tenantId: tenantId, id: id }).complaintDetails;
  console.log("complaintDetails in index", complaintDetails);
  return (
    // <Switch>
    //   hello
    //   <Route exact path={getRoute(match, SwachRoutes.ReasonPage)} component={() => <ReasonPage match={match} {...{complaintDetails}} />} />
    //   <Route path={getRoute(match, SwachRoutes.UploadPhoto)} component={() => <UploadPhoto match={match} skip={true} {...{complaintDetails}} />} />
    //   <Route path={getRoute(match, SwachRoutes.AddtionalDetails)} component={() => <AddtionalDetails match={match} parentRoute={parentRoute} {...{complaintDetails}} />} />
    //   <Route path={getRoute(match, SwachRoutes.Response)} component={() => <Response match={match} />} />
    // </Switch>
  //    <Switch>
  //   <Route exact path={`${match.path}/:id*`} component={() => <ReasonPage match={match} {...{complaintDetails}} />} />
  //   <Route path={`${match.path}/upload-photo/:id*`} component={() => <UploadPhoto match={match} skip={true} {...{complaintDetails}} />} />
  //   <Route path={`${match.path}/addional-details/:id*`} component={() => <AddtionalDetails match={match} parentRoute={parentRoute} {...{complaintDetails}} />} />
  //   <Route path={`${match.path}/response`} component={() => <Response match={match} />} />
  // </Switch>
  <Switch>
      <Route path={`${parentRoute}/reopen/upload-photo/:id*`} component={() => <UploadPhoto match={match} skip={true}  {...{complaintDetails}} />} />
      {/* <Route path={`${parentRoute}/reopen/upload-photo/:id*`} render={() => (
        <div>
    <h1>UploadPhoto Test Rendering</h1>
    <p>If you see this, the route is matched but there might be an error in the UploadPhoto component</p>
  </div>
)} /> */}
      <Route path={`${parentRoute}/reopen/addional-details/:id*`} component={() => <AddtionalDetails match={match} parentRoute={parentRoute} {...{complaintDetails}} />} />
      <Route path={`${match.path}/response`} component={() => <Response match={match} />} />
<Route path={`${parentRoute}/reopen/:id*`} component={() => <ReasonPage match={match} {...{complaintDetails}} />} />
    </Switch>
  );
};

export { ReopenComplaint };
