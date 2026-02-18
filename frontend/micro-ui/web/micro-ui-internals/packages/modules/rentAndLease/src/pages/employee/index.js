import React from "react";
import { RentAndLeaseModule } from "../../Module";
import Inbox from "./Inbox";
import { Switch, useLocation, Link } from "react-router-dom";
import { PrivateRoute, BackButton, BreadCrumb } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import RALApplicationDetails from "./RALApplicationDetails";

const RALBreadCrumbs = ({ location, t }) => {
  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/employee/rentandlease/inbox",
      content: t("CS_COMMON_INBOX"),
      show: location.pathname.includes("/rentandlease/inbox") || location.pathname.includes("/rentAndLease/inbox") ? true : false,
    },
    {
      path: "/digit-ui/employee/rentandlease/allot-property",
      content: "Allot Property",
      show: location.pathname.includes("/rentandlease/allot-property") || location.pathname.includes("/rentAndLease/allot-property") ? true : false,
    },
    {
      path: "/digit-ui/employee/rentandlease/property",
      content: "Application Overview",
      show: location.pathname.includes("/rentandlease/property") || location.pathname.includes("/rentAndLease/property") ? true : false,
    },
  ];

  return <BreadCrumb crumbs={crumbs} />;
};

const EmployeeApp = ({ path, url, userType }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const inboxInitialState = {
    searchParams: {
      uuid: { code: "ASSIGNED_TO_ALL", name: "ES_INBOX_ASSIGNED_TO_ALL" },
      services: ["RENT_N_LEASE_NEW", "RENT_AND_LEASE_LG"],
      applicationStatus: [],
      locality: [],
    },
  };

  const NewRentAndLeaseStepperForm = Digit?.ComponentRegistryService?.getComponent("NewRentAndLeaseStepperForm");
  const RALResponse = Digit?.ComponentRegistryService?.getComponent("RALResponse");

  return (
    <React.Fragment>
      <div className="ground-container">
        <div style={{ marginLeft: "10px" }}>
          <RALBreadCrumbs location={location} t={t} />
        </div>
        <PrivateRoute exact path={`${path}/`} component={() => <RentAndLeaseModule matchPath={path} userType={userType} />} />
        <PrivateRoute
          path={`${path}/inbox`}
          component={() => (
            <Inbox
              useNewInboxAPI={true}
              parentRoute={path}
              businessService="RENT_N_LEASE_NEW,RENT_AND_LEASE_LG"
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
  );
};

export default EmployeeApp;
