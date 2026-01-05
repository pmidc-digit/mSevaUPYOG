import { PrivateRoute, BreadCrumb } from "@mseva/digit-ui-react-components";
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
  const HRMSEMPMAPDetails = Digit?.ComponentRegistryService?.getComponent("HRMSEMPMAPDetails");
  const Inbox = Digit?.ComponentRegistryService?.getComponent("HRInbox");
  const CreateEmployee = Digit?.ComponentRegistryService?.getComponent("HRCreateEmployee");
  const CreateEmployeeStepForm = Digit?.ComponentRegistryService?.getComponent("HRCreateEmployeeStepForm");
  const EditEmpolyee = Digit?.ComponentRegistryService?.getComponent("HREditEmpolyee");
  const HRMSEmployeewiseReport = Digit?.ComponentRegistryService?.getComponent("HRMSEmployeewiseReport");
  const EmpMaping = Digit?.ComponentRegistryService?.getComponent("EmpMaping");

  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/employee/hrms",
      content: t("HR_COMMON_HEADER"),
      show: true,
      isclickable: false,
    },
  ];

  //console.log("Path in hrms: ", path);
  return (
    <Switch>
      <React.Fragment>
        <div className="ground-container">
          <div className="hrms-breadcrumb-wrapper">
            <BreadCrumb 
              crumbs={crumbs}
              style={{ fontSize: "16px" }}
              spanStyle={{ fontWeight: "500" }}
            />
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
          <PrivateRoute path={`${path}/Mapdetails/:tenantId/:id/:uuid`} component={() => <HRMSEMPMAPDetails />} />
          <PrivateRoute path={`${path}/edit/:tenantId/:id`} component={() => <EditEmpolyee />} />
          <PrivateRoute path={`${path}/report/rainmaker-hrms/HRMSEmployeewiseReport`} component={() => <HRMSEmployeewiseReport />} />
          <PrivateRoute path={`${path}/empMaping`} component={() => <EmpMaping />} />
        </div>
      </React.Fragment>
    </Switch>
  );
};

export default EmployeeApp;
