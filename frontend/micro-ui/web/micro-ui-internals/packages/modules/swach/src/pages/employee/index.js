import React from 'react';
import { Switch, useLocation, Route } from "react-router-dom";


function index({path}) {
  console.log("GETTING INSIDE SWACH");
  return (
    <Switch>
      <React.Fragment>
        <div className="ground-container">
          {/* <div style={locationCheck ? { marginLeft: "12px" } : locationCheckReqDocs ? { marginLeft: "25px" } : { marginLeft: "-4px" }}>
            <BILLSBreadCrumbs location={location} />
          </div> */}

          <Route path={`${path}/inbox`} component={<div>Swach Module</div>} />
          
        </div>
      </React.Fragment>
    </Switch>
  )
}

export default index