import { PrivateRoute, BreadCrumb } from "@mseva/digit-ui-react-components";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const EmployeeApp = ({ path, url, userType }) => {
  const { t } = useTranslation();
  const location = useLocation();
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

  // Route components are created once per dependency change. An inline component type would be
  // remounted on every render of this app, which discards form state on the page.
  const routes = useMemo(
    () => ({
      Inbox: () => (
        <Inbox parentRoute={path} businessService="hrms" filterComponent="HRMS_INBOX_FILTER" initialStates={inboxInitialState} isInbox={true} />
      ),
      CreateEmployee: () => <CreateEmployee />,
      CreateEmployeeStepForm: () => <CreateEmployeeStepForm />,
      Response: (props) => <HRMSResponse {...props} parentRoute={path} />,
      Details: () => <HRMSDetails />,
      MappingDetails: () => <HRMSEMPMAPDetails />,
      Edit: () => <EditEmpolyee />,
      Report: () => <HRMSEmployeewiseReport />,
      EmpMapping: () => <EmpMaping />,
    }),
    [path, tenantId, Inbox, CreateEmployee, CreateEmployeeStepForm, HRMSResponse, HRMSDetails, HRMSEMPMAPDetails, EditEmpolyee, HRMSEmployeewiseReport, EmpMaping]
  );

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
        content: t("HR_INBOX_HEADER"),
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
        content: t("HR_CREATE_EMPLOYEE"),
        show: true,
        isclickable: false,
      });
    }
    // Employee Mapping
    else if (pathname.includes("/empMaping")) {
      baseCrumbs.push({
        path: `${path}/empMaping`,
        content: t("HR_EMPLOYEE_MAPPING"),
        show: true,
        isclickable: false,
      });
    }
    // Mapping Details: /Mapdetails/:tenantId/:id/:uuid/:userTenantId?
    else if (pathname.includes("/Mapdetails/")) {
      const pathParts = pathname.split("/");
      const employeeId = pathParts[pathParts.indexOf("Mapdetails") + 2];
      baseCrumbs.push({
        path: `${path}/empMaping`,
        content: t("HR_EMPLOYEE_MAPPING"),
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
      baseCrumbs.push({
        path: pathname,
        content: t("HR_EDIT_EMPLOYEE"),
        show: true,
        isclickable: false,
      });
    }
    // Employee Details
    else if (pathname.includes("/details/")) {
      baseCrumbs.push({
        path: pathname,
        content: t("HR_EMPLOYEE_DETAILS"),
        show: true,
        isclickable: false,
      });
    }
    // Response Page
    else if (pathname.includes("/response")) {
      baseCrumbs.push({
        path: pathname,
        content: t("HR_RESPONSE"),
        show: true,
        isclickable: false,
      });
    }
    // Reports
    else if (pathname.includes("/report/")) {
      baseCrumbs.push({
        path: pathname,
        content: t("HR_REPORTS"),
        show: true,
        isclickable: false,
      });
    }

    return baseCrumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <div className="ground-container">
      <div className="hrms-breadcrumb-wrapper">
        <BreadCrumb crumbs={crumbs} className="hrms-breadcrumb" />
      </div>
      <PrivateRoute path={`${path}/inbox`} component={routes.Inbox} />
      <PrivateRoute path={`${path}/create1`} component={routes.CreateEmployee} />
      <PrivateRoute path={`${path}/create`} component={routes.CreateEmployeeStepForm} />
      <PrivateRoute path={`${path}/response`} component={routes.Response} />
      <PrivateRoute path={`${path}/details/:tenantId/:id`} component={routes.Details} />
      <PrivateRoute path={`${path}/Mapdetails/:tenantId/:id/:uuid/:userTenantId?`} component={routes.MappingDetails} />
      <PrivateRoute path={`${path}/edit/:tenantId/:id`} component={routes.Edit} />
      <PrivateRoute path={`${path}/report/rainmaker-hrms/HRMSEmployeewiseReport`} component={routes.Report} />
      <PrivateRoute path={`${path}/empMaping`} component={routes.EmpMapping} />
    </div>
  );
};

export default EmployeeApp;
