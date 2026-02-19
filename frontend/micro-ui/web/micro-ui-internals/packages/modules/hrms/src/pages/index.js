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

  // Dynamic breadcrumbs based on current route
  const getBreadcrumbs = () => {
    const baseCrumbs = [
      {
        path: "/digit-ui/employee",
        content: t("ES_COMMON_HOME"),
        show: true,
      },
      {
        path: `${path}/inbox`,
        content: t("HR_INBOX_HEADER") || "Inbox",
        show: true,
      },
    ];

    const pathname = location.pathname;

    // Inbox - no additional breadcrumb needed
    if (pathname.includes("/inbox")) {
      baseCrumbs[baseCrumbs.length - 1].isclickable = false;
    }
    // Create Employee
    else if (pathname.includes("/create")) {
      baseCrumbs.push({
        path: `${path}/create`,
        content: t("HR_CREATE_EMPLOYEE") || "Create Employee",
        show: true,
        isclickable: false,
      });
    }
    // Employee Mapping
    else if (pathname.includes("/empMaping")) {
      baseCrumbs.push({
        path: `${path}/empMaping`,
        content: t("HR_EMPLOYEE_MAPPING") || "Employee Mapping",
        show: true,
        isclickable: false,
      });
    }
    // Mapping Details
    else if (pathname.includes("/Mapdetails/")) {
      const pathParts = pathname.split("/");
      const employeeId = pathParts[pathParts.length - 2];
      baseCrumbs.push({
        path: `${path}/empMaping`,
        content: t("HR_EMPLOYEE_MAPPING") || "Employee Mapping",
        show: true,
      });
      baseCrumbs.push({
        path: pathname,
        content: t("HR_MAPPING_DETAILS") || `Mapping Details - ${employeeId}`,
        show: true,
        isclickable: false,
      });
    }
    // Edit Employee
    else if (pathname.includes("/edit/")) {
      const pathParts = pathname.split("/");
      const employeeId = pathParts[pathParts.length - 1];
      baseCrumbs.push({
        path: pathname,
        content: t("HR_EDIT_EMPLOYEE") || `Edit Employee - ${employeeId}`,
        show: true,
        isclickable: false,
      });
    }
    // Employee Details
    else if (pathname.includes("/details/")) {
      const pathParts = pathname.split("/");
      const employeeId = pathParts[pathParts.length - 1];
      baseCrumbs.push({
        path: pathname,
        content: t("HR_EMPLOYEE_DETAILS") || `Employee Details - ${employeeId}`,
        show: true,
        isclickable: false,
      });
    }
    // Response Page
    else if (pathname.includes("/response")) {
      baseCrumbs.push({
        path: pathname,
        content: t("HR_RESPONSE") || "Response",
        show: true,
        isclickable: false,
      });
    }
    // Reports
    else if (pathname.includes("/report/")) {
      baseCrumbs.push({
        path: pathname,
        content: t("HR_REPORTS") || "Reports",
        show: true,
        isclickable: false,
      });
    }

    return baseCrumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <Switch>
      <React.Fragment>
        <div className="ground-container">
          <div className="hrms-breadcrumb-wrapper">
            <BreadCrumb 
              crumbs={crumbs}
              className="hrms-breadcrumb"
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
