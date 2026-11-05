import SignedInRedirect from "./SignedInRedirect";
import { getSignedInHome } from "./getSignedInHome";
import React, { useEffect, useRef, useState } from "react";
import NewLoginPage from "./NewLoginPage";
import { clearLoginLocalStorage } from "./clearLoginLocalStorage";

// Mounted only for signed-out visitors by the application's login route guard.
const LoginEntry = (props) => {
  const signedInHome = getSignedInHome(Digit.UserService.getUser(), window.localStorage);
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (signedInHome || initialized.current) return;
    initialized.current = true;
    if (!getSignedInHome(Digit.UserService.getUser(), window.localStorage)) {
      clearLoginLocalStorage(window.localStorage);
    }
    setReady(true);
  }, [signedInHome]);
  if (signedInHome) return <SignedInRedirect to={signedInHome} />;
  return ready ? <NewLoginPage {...props} /> : null;
};

export default LoginEntry;
