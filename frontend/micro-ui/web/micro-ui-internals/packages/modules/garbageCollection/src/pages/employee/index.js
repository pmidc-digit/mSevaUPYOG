import { AppContainer, BackButton, PrivateRoute, BreadCrumb } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, Switch, useLocation } from "react-router-dom";
// import { CHBLinks } from "../../Module";
import Inbox from "./Inbox";
// import PaymentDetails from "./PaymentDetails";
import SearchApp from "./SearchApp";

const GCBreadCrumbs = ({ location, t }) => {
  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/employee/garbagecollection/inbox",
      content: t("CS_COMMON_INBOX"),
      show: location.pathname.includes("/garbagecollection/inbox") ? true : false,
    },
    {
      path: "/digit-ui/employee/garbagecollection/create-application",
      content: "Create Application",
      show: location.pathname.includes("/garbagecollection/create-application") ? true : false,
    },
    {
      path: "/digit-ui/employee/garbagecollection/applicationsearch/application-details",
      content: "Application Overview",
      show: location.pathname.includes("/garbagecollection/applicationsearch/application-details") ? true : false,
    },
    {
      path: "/digit-ui/employee/garbagecollection/generate-bill",
      content: "Generate Bill",
      show: location.pathname.includes("/garbagecollection/generate-bill") ? true : false,
    },
    {
      path: "/digit-ui/employee/garbagecollection/bill-genie",
      content: "Bill-Genie",
      show: location.pathname.includes("/garbagecollection/bill-genie") ? true : false,
    },
  ];

  return <BreadCrumb crumbs={crumbs} />;
};

const EmployeeApp = ({ path, url, userType }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const mobileView = innerWidth <= 640;
  sessionStorage.removeItem("revalidateddone");
  const isMobile = window.Digit.Utils.browser.isMobile();

  const inboxInitialState = {
    searchParams: {
      uuid: { code: "ASSIGNED_TO_ALL", name: "ES_INBOX_ASSIGNED_TO_ALL" },
      services: ["chb"],
      applicationStatus: [],
      locality: [],
    },
  };

  const ApplicationDetails = Digit?.ComponentRegistryService?.getComponent("ApplicationDetails");
  const CHBResponseCitizen = Digit.ComponentRegistryService.getComponent("CHBResponseCitizen");
  const CHBCreate = Digit?.ComponentRegistryService?.getComponent("CHBStepperForm");
  const GCResponseCitizen = Digit?.ComponentRegistryService?.getComponent("GCResponseCitizen");
  const GenerateBill = Digit?.ComponentRegistryService?.getComponent("GenerateBill");
  const BillGenie = Digit?.ComponentRegistryService?.getComponent("BillGenie");

  const isRes = window.location.href.includes("garbagecollection/response");
  const isNewRegistration =
    window.location.href.includes("searchhall") ||
    window.location.href.includes("modify-application") ||
    window.location.href.includes("garbagecollection/application-details");
  return (
    <React.Fragment>
      <div className="ground-container">
        {!isRes ? (
          <div style={{ marginLeft: "10px" }}>
            <GCBreadCrumbs location={location} t={t} />
          </div>
        ) : null}
        {/* <PrivateRoute exact path={`${path}/`} component={() => <CHBLinks matchPath={path} userType={userType} />} /> */}
        <PrivateRoute
          path={`${path}/inbox`}
          component={() => (
            <Inbox
              useNewInboxAPI={true}
              parentRoute={path}
              businessService="chb"
              filterComponent="CHB_INBOX_FILTER"
              initialStates={inboxInitialState}
              isInbox={true}
            />
          )}
        />
        {/* <PrivateRoute path={`${path}/application/:acknowledgementIds/:tenantId`} component={ChallanApplicationDetails} /> */}

        <PrivateRoute path={`${path}/applicationsearch/application-details/:id`} component={() => <ApplicationDetails parentRoute={path} />} />
        <PrivateRoute path={`${path}/create-application`} component={CHBCreate} />
        <PrivateRoute path={`${path}/generate-bill`} component={GenerateBill} />
        <PrivateRoute path={`${path}/bill-genie`} component={BillGenie} />
        {/* <PrivateRoute path={`${path}/response/:id`} component={CHBResponseCitizen} /> */}
        <PrivateRoute path={`${path}/response/:id`} component={GCResponseCitizen} />
      </div>
    </React.Fragment>
  );
};

export default EmployeeApp;
