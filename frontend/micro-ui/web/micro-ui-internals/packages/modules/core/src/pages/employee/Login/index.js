import { clearLoginStorage } from "./clearLoginStorage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppContainer } from "@mseva/digit-ui-react-components";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import { loginConfig } from "./config";
import LoginComponent from "./login";

const EmployeeLogin = () => {
  const { t } = useTranslation();
  // Check authentication before clearing storage; preserve existing employee sessions.
  const [isSignedIn] = useState(() => {
    const user = Digit.UserService.getUser();
    return Boolean(user?.access_token && user?.info?.type === "EMPLOYEE");
  });
  const [storageReady, setStorageReady] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (isSignedIn || initialized.current) return;
    initialized.current = true;
    clearLoginStorage(window.localStorage);
    clearLoginStorage(window.sessionStorage);
    // Restore only the routing context required for a fresh employee login.
    Digit.UserService.setType("employee");
    setStorageReady(true);
  }, [isSignedIn]);
  const { path } = useRouteMatch();

  const loginParams = useMemo(() =>
    loginConfig.map(
      (step) => {
        const texts = {};
        for (const key in step.texts) {
          texts[key] = t(step.texts[key]);
        }
        return { ...step, texts };
      },
      [loginConfig]
    )
  );

  if (isSignedIn) return <Redirect to="/digit-ui/employee" />;
  if (!storageReady) return null;

  return (
    <Switch>
      <Route path={`${path}`} exact>
        <LoginComponent config={loginParams[0]} t={t} />
      </Route>
    </Switch>
  );
};

export default EmployeeLogin;
