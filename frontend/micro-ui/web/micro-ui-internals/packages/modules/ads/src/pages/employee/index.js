import { AppContainer, BackButton, PrivateRoute, BreadCrumb } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, Switch, useLocation } from "react-router-dom";
import SearchApp from "./SearchApp";
import Inbox from "./Inbox";
/* EmployeeApp component serves as the main application container for employee-related routes.
 * It utilizes the AppContainer, PrivateRoute, and other components for structured navigation.
 * The component handles rendering based on user types and different application states,
 * including displaying a back button.
 */
// const Response = Digit?.ComponentRegistryService?.getComponent("ADSResponse"); //TODO

// to do, ApplicationDetail page pending

const ADSBreadCrumbs = ({ location, t }) => {
  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/employee/ads/inbox",
      content: t("CS_COMMON_INBOX"),
      show: location.pathname.includes("/ads/inbox") ? true : false,
    },
    {
      path: "/digit-ui/employee/ads/bookad",
      content: "Book",
      show: location.pathname.includes("/ads/bookad") ? true : false,
    },
    {
      path: "/digit-ui/employee/ads/applicationsearch/application-details",
      content: "Application Overview",
      show: location.pathname.includes("/ads/applicationsearch/application-details") ? true : false,
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
  const ADSCreate = Digit?.ComponentRegistryService?.getComponent("NewADSStepperForm");
  const ADSMasterCreate = Digit?.ComponentRegistryService?.getComponent("NewSiteMasterStepperForm");
  const ADSSiteInspectionCreate = Digit?.ComponentRegistryService?.getComponent("NewSiteInspectionStepperForm");
  const ApplicationOverview = Digit?.ComponentRegistryService?.getComponent("ApplicationOverview");
  const ADSResponse = Digit?.ComponentRegistryService?.getComponent("ADSResponseCitizen");

  const ApplicationDetails = Digit?.ComponentRegistryService?.getComponent("ApplicationDetails");
  const isRes = window.location.href.includes("ads/response");
  const isNewRegistration =
    window.location.href.includes("searchad") ||
    window.location.href.includes("modify-application") ||
    window.location.href.includes("ads/application-details");

  const inboxInitialState = {
    searchParams: {
      uuid: { code: "ASSIGNED_TO_ALL", name: "ES_INBOX_ASSIGNED_TO_ALL" },
      services: ["ADV"], //edited this
      applicationStatus: [],
      locality: [],
    },
  };
  return (
    <React.Fragment>
      <div className="ground-container">
        {!isRes ? <div style={{ marginLeft: "10px" }}><ADSBreadCrumbs location={location} t={t} /></div> : null}

            <PrivateRoute path={`${path}/bookad`} component={(props) => <ADSCreate {...props} userType={userType} />} />
            <PrivateRoute path={`${path}/my-applications`} component={(props) => <SearchApp {...props} userType="employee" parentRoute={path} />} />
            <PrivateRoute path={`${path}/applicationsearch/application-details/:id`} component={() => <ApplicationDetails parentRoute={path} />} />
            <PrivateRoute path={`${path}/adsservice/:response/:bookingNo`} component={ADSResponse}></PrivateRoute>
            {/* <PrivateRoute path={`${path}/site-master-details`} component={(props) => <ADSMasterCreate {...props} userType={userType} />} /> */}
            <PrivateRoute path={`${path}/site-inspection-details`} component={ADSSiteInspectionCreate}></PrivateRoute>

            {/* <PrivateRoute path={`${path}/response`} component={(props) => <Response {...props} parentRoute={path} />} /> */}
            {/* <PrivateRoute path={`${path}/search`} component={(props) => <Search {...props} t={t} parentRoute={path} />} /> */}
            <PrivateRoute
              path={`${path}/inbox`}
              component={() => (
                <Inbox
                  useNewInboxAPI={true}
                  parentRoute={path}
                  businessService="ADV"
                  filterComponent="ADS_INBOX_FILTER"
                  initialStates={inboxInitialState}
                  isInbox={true}
                />
              )}
            />
            <PrivateRoute
              path={`${path}/searchold`}
              component={() => (
                <Inbox
                  parentRoute={path}
                  businessService="ads"
                  middlewareSearch={searchMW}
                  initialStates={inboxInitialState}
                  isInbox={false}
                  EmptyResultInboxComp={"PTEmptyResultInbox"}
                />
              )}
            />

            {/* <PrivateRoute path={`${path}/application-overview/:bookingNo`} component={() => <ApplicationOverview />} /> */}
          </div>
        </React.Fragment>
      );
    };

export default EmployeeApp;
