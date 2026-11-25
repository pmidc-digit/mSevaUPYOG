import { PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, Switch } from "react-router-dom";
import Report from "./Report";

// Remount the page when the user moves to another report (old report.js re-initialised on reportName change).
const ReportPage = ({ match }) => <Report key={match.url} />;

/**
 * Routes (under /digit-ui/employee/reports):
 *   /search/:moduleName/:reportName      -> /report/{module}/...      (existing links)
 *   /report/:moduleName/:reportName      -> /report/{module}/...      (old rainmaker "report/..." menu links)
 *   /report-v2/:moduleName/:reportName   -> /report-v2/{module}/...   (old rainmaker "report-v2/..." menu links)
 */
const EmployeeApp = ({ path, url, userType }) => {
  const { t } = useTranslation();
  const mobileView = innerWidth <= 640;
  return (
    <Switch>
      <React.Fragment>
        <div className="ground-container">
          <p className="breadcrumb employee-main-application-details" style={{ marginLeft: mobileView ? "2vw" : "revert" }}>
            <Link to="/digit-ui/employee" style={{ cursor: "pointer", color: "#666" }}>
              {t("ES_COMMON_HOME")}
            </Link>{" "}
            / <span>{t("reports")}</span>
          </p>
          <PrivateRoute path={`${path}/:endpoint(search|report|report-v2)/:moduleName/:reportName`} component={ReportPage} />
        </div>
      </React.Fragment>
    </Switch>
  );
};

export default EmployeeApp;
