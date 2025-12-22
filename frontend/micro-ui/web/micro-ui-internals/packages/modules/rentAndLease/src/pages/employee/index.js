import React from "react";
import { RentAndLeaseModule } from "../../Module";
import Inbox from "./Inbox";
import { Switch, useLocation, Link } from "react-router-dom";
import { PrivateRoute, BackButton } from "@mseva/digit-ui-react-components";
import RALApplicationDetails from "./RALApplicationDetails";

const EmployeeApp = ({ path, url, userType }) => {
  const location = useLocation();

  const inboxInitialState = {
    searchParams: {
      uuid: { code: "ASSIGNED_TO_ALL", name: "ES_INBOX_ASSIGNED_TO_ALL" },
      services: ["RENT_N_LEASE_NEW"],
      applicationStatus: [],
      locality: [],
    },
  };

  const NewRentAndLeaseStepperForm = Digit?.ComponentRegistryService?.getComponent("NewRentAndLeaseStepperForm");
  const RALResponse = Digit?.ComponentRegistryService?.getComponent("RALResponse");

  return (
    <Switch>
      <React.Fragment>
        <div className="ground-container">
          <div style={{ marginLeft: "-4px", display: "flex", alignItems: "center" }}>
            <BackButton location={location} />
          </div>
          <PrivateRoute exact path={`${path}/`} component={() => <RentAndLeaseModule matchPath={path} userType={userType} />} />
          <PrivateRoute
            path={`${path}/inbox`}
            component={() => (
              <Inbox
                useNewInboxAPI={true}
                parentRoute={path}
                businessService="RENT_N_LEASE_NEW"
                moduleCode="RAL"
                filterComponent="RAL_INBOX_FILTER"
                initialStates={inboxInitialState}
                isInbox={true}
              />
            )}
          />{" "}
          <PrivateRoute path={`${path}/allot-property/:id?`} component={NewRentAndLeaseStepperForm} />
          <PrivateRoute path={`${path}/property/:acknowledgementIds/:tenantId`} component={RALApplicationDetails} />
          <PrivateRoute path={`${path}/response/:applicationNumber`} component={RALResponse} />
        </div>
      </React.Fragment>
    </Switch>
  );
};

export default EmployeeApp;
