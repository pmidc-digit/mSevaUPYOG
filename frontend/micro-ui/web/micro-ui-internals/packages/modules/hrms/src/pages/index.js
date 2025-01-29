import { PrivateRoute } from "@upyog/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, Switch, useLocation } from "react-router-dom";

const EmployeeApp = ({ path, url, userType }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const mobileView = innerWidth <= 640;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const inboxInitialState = {
    searchParams: {
      tenantId: tenantId,
    },
  };

  const HRMSResponse = Digit?.ComponentRegistryService?.getComponent("HRMSResponse");
  const HRMSDetails = Digit?.ComponentRegistryService?.getComponent("HRMSDetails");
  const Inbox = Digit?.ComponentRegistryService?.getComponent("HRInbox");
  const CreateEmployee = Digit?.ComponentRegistryService?.getComponent("HRCreateEmployee");
  const CreateEmployeeStepForm= Digit?.ComponentRegistryService?.getComponent("HRCreateEmployeeStepForm");
  const EditEmpolyee = Digit?.ComponentRegistryService?.getComponent("HREditEmpolyee");
  const HRMSEmployeewiseReport = Digit?.ComponentRegistryService?.getComponent("HRMSEmployeewiseReport");

  console.log("Path in hrms: ", path);
  return (
    <Switch>
      <React.Fragment>
        <div className="ground-container">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p className="breadcrumb">
              <Link to="/digit-ui/employee" style={{ cursor: "pointer", color: "#666" }}>
                {"<"} {t("CS_COMMON_BACK")}
              </Link>{" "}
            </p>
            <p className="breadcrumb" style={{ marginLeft: mobileView ? "1vw" : "15px" }}>
              <Link to="/digit-ui/employee" style={{ cursor: "pointer", color: "#666" }}>
                {t("ES_COMMON_HOME")}
              </Link>{" "}
              / <span>{location.pathname === "/digit-ui/employee/hrms/inbox" ? t("HR_COMMON_HEADER") : t("HR_COMMON_HEADER")}</span>
            </p>
          </div>
          <PrivateRoute
            path={`${path}/inbox`}
            component={() => (
              <Inbox parentRoute={path} businessService="hrms" filterComponent="HRMS_INBOX_FILTER" initialStates={inboxInitialState} isInbox={true} />
            )}
          />
          <PrivateRoute path={`${path}/create1`} component={() => <CreateEmployee />} />
          <PrivateRoute path={`${path}/create`} component={() => <CreateEmployeeStepForm />} />
          <PrivateRoute path={`${path}/response`} component={(props) => <HRMSResponse {...props} parentRoute={path} />} />
          <PrivateRoute path={`${path}/details/:tenantId/:id`} component={() => <HRMSDetails />} />
          <PrivateRoute path={`${path}/edit/:tenantId/:id`} component={() => <EditEmpolyee />} />
          <PrivateRoute path={`${path}/report/rainmaker-hrms/HRMSEmployeewiseReport`} component={() => <HRMSEmployeewiseReport />} />
        </div>
      </React.Fragment>
    </Switch>
  );
};

export default EmployeeApp;
