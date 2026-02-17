import { AppContainer, BackButton, PrivateRoute, BreadCrumb } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, Switch, useLocation } from "react-router-dom";
// import { CHBLinks } from "../../Module";
import Inbox from "./Inbox";
// import PaymentDetails from "./PaymentDetails";
import SearchApp from "./SearchApp";

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
    <Switch>
      <AppContainer>
        <React.Fragment>
          <div className="ground-container">
            {!isRes ? (
              <div
                style={
                  isNewRegistration
                    ? { marginLeft: "12px", display: "flex", alignItems: "center" }
                    : { marginLeft: "-4px", display: "flex", alignItems: "center" }
                }
              >
                <BackButton location={location} />
                {/* <CHBBreadCrumbs location={location} /> */}
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
      </AppContainer>
    </Switch>
  );
};

export default EmployeeApp;
