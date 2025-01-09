import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Loader, Toast } from "@upyog/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { citizenServiceMappings } from "../../../config/ssoConfig";

const DEFAULT_REDIRECT_URL = "/digit-ui/citizen";

const setCitizenDetail = (userObject, token) => {
  let locale = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.selectedLanguage;
  localStorage.setItem("Citizen.tenant-id", userObject?.tenantId);
  localStorage.setItem("tenant-id", userObject?.tenantId);
  localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
  localStorage.setItem("locale", locale);
  localStorage.setItem("Citizen.locale", locale);
  localStorage.setItem("token", token);
  localStorage.setItem("Citizen.token", token);
  localStorage.setItem("user-info", JSON.stringify(userObject));
  localStorage.setItem("Citizen.user-info", JSON.stringify(userObject));
};

const NavigationApp = () => {  
  const history = useHistory();
  const { t } = useTranslation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [navigateToUrl, setNavigateToUrl] = useState("");
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const expectedParams = ["userName", "token", "serviceName"];
    const actualParams = Array.from(queryParams.keys());
    const areParamsCorrect = expectedParams.every((param) => actualParams.includes(param)) && expectedParams.length === actualParams.length;
    if (!areParamsCorrect) {
      // Display a toast message
      setIsLoading(false);
      setShowToast("Incorrect query parameters");
      setTimeout(closeToast, 5000);
      return;
    }
    const userName = queryParams.get("userName");
    const token = queryParams.get("token");
    const serviceName = queryParams.get("serviceName");
    if (userName && token && serviceName) {
      setUserName(userName);
      setTokenName(token);
      setServiceName(serviceName);
    } else {
      setIsLoading(false);
      setShowToast("Missing query parameters");
      setTimeout(closeToast, 5000);
    }
  }, []);

  useEffect(() => {
    if (userName && tokenName) {
      callSsoAuthenticateUserApi();
    }
  }, [userName, tokenName]);

  const callSsoAuthenticateUserApi = () => {
    const payload = {
      userName: userName,
      tokenName: tokenName,
    };
    Digit.HRMSService.ssoAuthenticateUser(payload)
      .then((response) => {
        if (response.status === true) {
          if (typeof response?.result?.url == "string") {
            setNavigateToUrl(response.result.url);
            callOauthTokenApi(response);
            setShowSuccessToast(response.message);
            setTimeout(closeSuccessToast, 2000);
          } else {
            setIsLoading(false);
            setShowToast("Something went wrong");
            setTimeout(closeToast, 5000);
          }
        } else {
          setIsLoading(false);
          setShowToast(response.message);
          setTimeout(closeToast, 5000);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("Error in Digit.HRMSService.ssoAuthenticateUser: ", err.response);
        setShowToast(err?.response?.data?.Errors?.[0]?.message || "Something went wrong");
        setTimeout(closeToast, 5000);
      });
  };

  const callOauthTokenApi = async (data) => {
    const payload = {
      username: userName,
      password: tokenName,
      tenantId: data.result.tenantId,
      userType: data.result.employeeType,
      thirdPartyName: "eSewa",
    };

    try {
      const { UserRequest: info, ...tokens } = await Digit.UserService.authenticate(payload);
      if (location.state?.role) {
        const roleInfo = info.roles.find((userRole) => userRole.code === location.state.role);
        if (!roleInfo || !roleInfo.code) {
          setShowToast(t("ES_ERROR_USER_NOT_PERMITTED"));
          setTimeout(() => history.replace(DEFAULT_REDIRECT_URL), 5000);
          return;
        }
      }
      if (window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")) {
        info.tenantId = Digit.ULBService.getStateId();
      }
      setUser({ info, ...tokens });
    } catch (err) {
      setIsLoading(false);
      console.log("Error in Digit.UserService.authenticate: ", err.response);
      setShowToast(err?.response?.data?.error_description || "Invalid login credentials");
      setTimeout(closeToast, 5000);
    }
  };

  useEffect(() => {
    if (user) {
      Digit.SessionStorage.set("citizen.userRequestObject", user);
      Digit.UserService.setUser(user);
      setCitizenDetail(user?.info, user?.access_token);
      const redirectPath = location.state?.from || DEFAULT_REDIRECT_URL;
      if (!Digit.ULBService.getCitizenCurrentTenant(true)) {
        history.replace("/digit-ui/citizen/select-location", {
          redirectBackTo: redirectPath,
        });
      } else {
         handleServiceRedirection();
      }
  }}, [user]);

  const handleServiceRedirection = () => {
    const servicePath = fetchServicePath(serviceName);
    setIsLoading(false);
    if (servicePath) {
      window.location.href = navigateToUrl + servicePath;
    } else {
      setShowToast("Service not found");
      setTimeout(closeToast, 5000);
    }
  };

  const fetchServicePath = (serviceName) => {
    const servicePath = citizenServiceMappings.find((item) => item.serviceName === serviceName)?.path;
    return servicePath || "";
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const closeSuccessToast = () => {
    setShowSuccessToast(null);
  };

  return (
    <div>
      {isLoading && <Loader />}
      {showToast && <Toast error={true} label={t(showToast)} onClose={closeToast} isDleteBtn={"true"} />}
      {showSuccessToast && <Toast label={t(showSuccessToast)} onClose={closeSuccessToast} isDleteBtn={"true"} />}
    </div>
  );
};

export default NavigationApp;
