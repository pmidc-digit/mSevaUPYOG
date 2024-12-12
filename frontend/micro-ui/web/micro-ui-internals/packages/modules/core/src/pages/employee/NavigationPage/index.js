import React, { useEffect } from "react";
import { useLocation, useHistory, Route, Switch, Redirect } from "react-router-dom";

const NavigationApp = () => {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userName = queryParams.get("userName");
    const tokenName = queryParams.get("token");
    const serviceName = queryParams.get("serviceName");
    console.log("In NavigationApp index.js: ", userName, tokenName, serviceName);
    const payload = {
      userName: userName,
      tokenName: tokenName,
    };
    Digit.HRMSService.ssoAuthenticateUser(payload)
      .then((result) => {
        console.log("Result of ssoAuthenticateUser api: ", result);
        if (result.trim() === "Authentication Failed. Employee not found in Eseva") {
          history.push("/unauthorized");
          return;
        }
        const navigateToUrl = result;
        const servicePath = fetchServicePath(serviceName);
        if (servicePath) {
          console.log("Navigate to: ", navigateToUrl, servicePath, navigateToUrl + servicePath);
          window.location.href = navigateToUrl + servicePath;
        } else {
          history.push("/service-not-found");
          return;
        }
      })
      .catch((err) => {
        console.log("Error in HRMSService.ssoAuthenticateUser: " + JSON.stringify(err));
      });
  }, []);

  const fetchServicePath = (serviceName) => {
    if (serviceName === "ws-search") {
      console.log("In ws-search");
      return "wns/search";
    }
  };

  console.log("In NavigationApp: ", "History: ", history, "\nLocation: ", location);
  return (
    <div>
      {/* <Switch> */}
      {/* <Route path="/unauthorized" component={UnauthorizedPage} />
        <Route path="/service-not-found" component={ServiceNotFoundPage} /> */}
      {/* </Switch> */}
    </div>
  );
};

export default NavigationApp;

// import React from 'react'

// const index = () => {
//   return (
//     <div>navigation app</div>
//   )
// }

// export default index
