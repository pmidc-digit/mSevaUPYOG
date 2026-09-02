import { AppContainer, BackButton, PrivateRoute } from "@mseva/digit-ui-react-components";
import React from "react";
import { Route, Switch, useRouteMatch, Link, useLocation } from "react-router-dom";
import { shouldHideBackButton } from "../../utils";
import { useTranslation } from "react-i18next";
import NOCCitizenApplicationOverview from "./Applications/ApplicationsOverview";
import NOCInbox from "../employee/Inbox/index";

const hideBackButtonConfig = [];

const NOCBreadCrumbs = ({ location, cameFromOBPS }) => {
  console.log(cameFromOBPS, "cameFromOBPS")
  const { t } = useTranslation();

  const getBreadcrumbs = () => {
    const tenantId = localStorage.getItem("CITIZEN.CITY");
    const user = Digit.UserService?.getUser();
    const isUserRegistered =
      user?.info?.roles?.some((role) => role?.code === "BPA_ARCHITECT") ||
      user?.info?.roles?.some((role) => role?.code?.includes("BPA") && role?.tenantId === tenantId);
    const breadcrumbs = [];
    const hasSecondBreadcrumb =
      location.pathname.includes("/noc/new-application") ||
      location.pathname.includes("noc/my-application") ||
      location.pathname.includes("noc/search/application-overview") ||
      location.pathname.includes("noc/search-application")||
      location.pathname.includes("noc/noc-my-application");

    // Always push Home
    breadcrumbs.push(
      <span key="home">
        <Link to="/digit-ui/citizen" className="noc-pages-citizen-index--style-1">
          {t("ES_COMMON_HOME")}
        </Link>
        {(hasSecondBreadcrumb || cameFromOBPS) && <span className="noc-pages-citizen-index--style-2">/</span>}
      </span>
    );
    if (cameFromOBPS) {
      // User navigated here from OBPS My Applications
      breadcrumbs.push(
        <span key="obps-landing-page">
          <Link to="/digit-ui/citizen/obps-home" className="noc-pages-citizen-index--style-3">
            {t("MODULE_OBPS")}
          </Link>
          <span className="noc-pages-citizen-index--style-2">/</span>
        </span>
      );
      if (isUserRegistered) {
        breadcrumbs.push(
          <span key="obps-home">
            <Link to="/digit-ui/citizen/obps/home" className="noc-pages-citizen-index--style-3">
              {t("OBAPS Home")}
            </Link>
            <span className="noc-pages-citizen-index--style-2">/</span>
          </span>
        );
      }
      breadcrumbs.push(
        <span key="obps-my-applications">
          <Link to="/digit-ui/citizen/obps/my-applications" className="noc-pages-citizen-index--style-3">
            {t("ES_COMMON_OBPS_INBOX_LABEL")}
          </Link>
          <span className="noc-pages-citizen-index--style-2">/</span>
        </span>
      );
      breadcrumbs.push(
        <span key="noc-label" className="noc-pages-citizen-index--style-3">
          {t("MODULE_NOC")}
        </span>
      );
    } else {
      // Default NOC breadcrumb — user arrived directly
      if (hasSecondBreadcrumb) {
        breadcrumbs.push(
          <span key="noc">
            <Link to={isUserRegistered ? "/digit-ui/citizen/obps/home" : "/digit-ui/citizen/noc-home"} className="noc-pages-citizen-index--style-3">
              {t("CORE_COMMON_GO_TO_NOC")}
            </Link>
          </span>
        );
      }
    }

    return breadcrumbs;
  };

  return <div className="noc-pages-citizen-index--style-4">{getBreadcrumbs()}</div>;
};

const App = () => {
  const { path, url, ...match } = useRouteMatch();
  const location = useLocation();
  const cameFromOBPS = location.state?.fromOBPS;
  const { t } = useTranslation();
  const NewNOCApplication = Digit?.ComponentRegistryService?.getComponent("NewNOCStepperForm");
  const NOCResponseCitizen = Digit.ComponentRegistryService.getComponent("NOCResponseCitizen");
  const Inbox = Digit?.ComponentRegistryService?.getComponent("NOCInbox");

  const NOCCitizenMyApplications = Digit.ComponentRegistryService.getComponent("NOCCitizenMyApplications");
  // const NOCCitizenApplicationOverview = Digit?.ComponentRegistryService?.getComponent("NOCCitizenApplicationOverview");
  const NewNOCEditApplication = Digit?.ComponentRegistryService?.getComponent("NewNOCEditApplication");
  const NOCCitizenSearchApplication = Digit?.ComponentRegistryService?.getComponent("NOCCitizenSearchApplication");
  const isResponse = window.location.href.includes("/response");
  const isMobile = window.Digit.Utils.browser.isMobile();

  return (
    <span className={["pgr-citizen-wrapper", "noc-pages-citizen-index--style-5"].filter(Boolean).join(" ")} >
      <Switch>
        <AppContainer>
          {!isResponse ? (
            <div className={window.location.href.includes("application-overview") || isMobile ? "noc-citizen__breadcrumbs--offset" : "noc-citizen__breadcrumbs"}>
              <NOCBreadCrumbs location={location} cameFromOBPS={cameFromOBPS} />
            </div>
          ) : null}
          {/* {!shouldHideBackButton(hideBackButtonConfig) ? <BackButton>Back</BackButton> : ""} */}
          <PrivateRoute path={`${path}/new-application`} component={NewNOCApplication} />
          <PrivateRoute path={`${path}/response/:id`} component={NOCResponseCitizen} />
          {/* <PrivateRoute path={`${path}/my-application`} component={NOCCitizenMyApplications} /> */}
          <PrivateRoute path={`${path}/my-application`} component={(props) => <Inbox {...props} parentRoute={path} />} />
          <PrivateRoute path={`${path}/noc-my-application`} component={(props) => <Inbox {...props} parentRoute={path} />} />
          <PrivateRoute path={`${path}/edit-application/:nocid`} component={NewNOCEditApplication} />
          <PrivateRoute
            path={`${path}/search/application-overview/:nocid?`}
            component={(props) => <NOCCitizenApplicationOverview {...props} parentRoute={path} />}
            // component={NOCCitizenApplicationOverview}
          />
          <PrivateRoute path={`${path}/search-application`} component={NOCCitizenSearchApplication} />
        </AppContainer>
      </Switch>
    </span>
  );
};

export default App;
