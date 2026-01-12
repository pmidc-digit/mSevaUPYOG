import React, { useEffect } from "react";
import { Redirect, Route, Switch, useHistory, useLocation } from "react-router-dom";
import EmployeeApp from "./pages/employee";
import CitizenApp from "./pages/citizen";
import LandingPage from "./LandingPage";

export const DigitApp = ({ stateCode, modules, appTenants, logoUrl, initData }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const innerWidth = window.innerWidth;
  const cityDetails = Digit.ULBService.getCurrentUlb();
  const userDetails = Digit.UserService.getUser();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const DSO = Digit.UserService.hasAccess(["FSM_DSO"]);
  let CITIZEN = userDetails?.info?.type === "CITIZEN" || !window.location.pathname.split("/").includes("employee") ? true : false;

  if (window.location.pathname.split("/").includes("employee")) CITIZEN = false;

  useEffect(() => {
    if (!pathname?.includes("application-details")) {
      if (!pathname?.includes("inbox")) {
        Digit.SessionStorage.del("fsm/inbox/searchParams");
      }
      if (pathname?.includes("search")) {
        Digit.SessionStorage.del("fsm/search/searchParams");
      }
    }
    if (!pathname?.includes("dss")) {
      Digit.SessionStorage.del("DSS_FILTERS");
    }
    if (pathname?.toString() === "/digit-ui/employee") {
      Digit.SessionStorage.del("SEARCH_APPLICATION_DETAIL");
      Digit.SessionStorage.del("WS_EDIT_APPLICATION_DETAILS");
    }
    if (pathname?.toString() === "/digit-ui/citizen" || pathname?.toString() === "/digit-ui/employee") {
      Digit.SessionStorage.del("WS_DISCONNECTION");
    }
  }, [pathname]);

  history.listen(() => {
    window?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });

  const handleUserDropdownSelection = (option) => {
    option.func();
  };

  const mobileView = innerWidth <= 640;
  let sourceUrl = `${window.location.origin}/citizen`;
  const commonProps = {
    stateInfo,
    userDetails,
    CITIZEN,
    cityDetails,
    mobileView,
    handleUserDropdownSelection,
    logoUrl,
    DSO,
    stateCode,
    modules,
    appTenants,
    sourceUrl,
    pathname,
    initData,
  };

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;

      // If browser moved to legacy Citizen SPA, let it boot
      if (!path.startsWith("/digit-ui")) {
        window.location.reload();
        return;
      }

      // Fix corrupted history entries
      if (path.includes("//digit-ui")) {
        const clean = path.replace("//digit-ui", "/digit-ui");
        window.location.replace(clean);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <Switch>
      <Route path="/digit-ui/employee">
        <EmployeeApp {...commonProps} />
      </Route>
      <Route path="/digit-ui/citizen">
        <CitizenApp {...commonProps} />
      </Route>
      <Route path="/digit-ui/landing-page">
        <LandingPage />
      </Route>
      <Route>
        <Redirect to="/digit-ui/landing-page" />
      </Route>
    </Switch>
  );
};
