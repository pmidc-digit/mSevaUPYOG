import React from "react";
import { useTranslation } from "react-i18next";
import { Switch, useLocation, useRouteMatch } from "react-router-dom";
import { PrivateRoute, BreadCrumb } from "@mseva/digit-ui-react-components";
import JurisdictionManagement from "./JurisdictionManagement";
import JurisdictionDetails from "./JurisdictionDetails";

/**
 * Employee App Router for Transfer & Appointment Module
 * Supports distinct routes for Search & Results vs. Employee Jurisdiction Details
 */
const App = () => {
  const { t } = useTranslation();
  const { path } = useRouteMatch();
  const location = useLocation();

  const isDetailsRoute = location.pathname.includes("/details/");
  const pathParts = location.pathname.split("/");
  const employeeCode = isDetailsRoute ? pathParts[pathParts.length - 1] : "";

  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME") || "Home",
      show: true,
    },
    {
      path: `${path}/jurisdiction`,
      content: t("JUR_BREADCRUMB_TITLE") || "Jurisdiction Management",
      show: true,
      isclickable: isDetailsRoute,
    },
    ...(isDetailsRoute
      ? [
          {
            path: location.pathname,
            content: `${t("JUR_DETAILS_BREADCRUMB") || "Jurisdiction Details"} - ${employeeCode}`,
            show: true,
            isclickable: false,
          },
        ]
      : []),
  ];

  return (
    <div className="ground-container">
      <div style={{ padding: "0 1.5rem" }}>
        <BreadCrumb crumbs={crumbs} />
      </div>
      <Switch>
        <PrivateRoute
          path={[`${path}/jurisdiction/details/:tenantId/:code`, `${path}/details/:tenantId/:code`]}
          component={() => <JurisdictionDetails />}
        />
        <PrivateRoute
          path={`${path}/jurisdiction`}
          component={() => <JurisdictionManagement />}
        />
        {/* Default route redirects to jurisdiction management */}
        <PrivateRoute
          path={`${path}`}
          component={() => <JurisdictionManagement />}
        />
      </Switch>
    </div>
  );
};

export default App;

