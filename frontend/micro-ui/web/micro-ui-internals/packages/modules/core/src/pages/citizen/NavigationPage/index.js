import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Loader, Toast } from "@upyog/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { citizenServiceMappings } from "../../../config/ssoConfig";

const THIRD_PARTY_NAME = "EODB";
const THIRD_PARTY_ROLE_CODE = "EODB";
const USER_TYPE = "CITIZEN";
const TYPE_REGISTER = "register";
const CITIZEN_ROLE_CODE = "CITIZEN";
//Keep the below values from localisation service (First define these values in localisation service for core module);
const MISSING_QUERY_PARAMS = "The query parameters provided are not as expected or missing. Please check and try again.";
const MISSING_QUERY_PARAMS_VALUES = "It looks like some query parameters are missing values. Please provide all required information.";
const SERVICE_NOT_FOUND = "Service not found";
const REDIRECTING_TO = "Redirecting to";
const ES_ERROR_USER_NOT_PERMITTED = "ES_ERROR_USER_NOT_PERMITTED";
const ERROR_MESSAGE = "Something went wrong";
const ULB_NOT_FOUND = "ULB not found";

const setCitizenDetail = (userObject, token) => {
  const locale = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.selectedLanguage;
  const userDetails = JSON.stringify(userObject);
  localStorage.setItem("Citizen.tenant-id", userObject?.tenantId);
  localStorage.setItem("tenant-id", userObject?.tenantId);
  localStorage.setItem("citizen.userRequestObject", userDetails);
  localStorage.setItem("locale", locale);
  localStorage.setItem("Citizen.locale", locale);
  localStorage.setItem("token", token);
  localStorage.setItem("Citizen.token", token);
  localStorage.setItem("user-info", userDetails);
  localStorage.setItem("Citizen.user-info", userDetails);
};

const NavigationApp = ({ stateCode }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});
  const [user, setUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const { data: cities } = Digit.Hooks.useTenants();
  const getCity = (ULBName) => {
    const city = cities.find((city) => city.name.toLowerCase() === ULBName.toLowerCase());
    return city;
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const expectedParams = ["userName", "token", "serviceName", "data"];
    const actualParams = Array.from(queryParams.keys());
    const areParamsCorrect = expectedParams.every((param) => actualParams.includes(param)) && expectedParams.length === actualParams.length;

    if (!areParamsCorrect) {
      showToast(MISSING_QUERY_PARAMS, true);
      return;
    }

    const userName = queryParams.get("userName");
    const token = queryParams.get("token");
    const serviceName = queryParams.get("serviceName");
    const dataFromURL = JSON.parse(queryParams.get("data"));
    const areParamsValid = userName && token && serviceName && dataFromURL?.MobileNo && dataFromURL?.ULBName && dataFromURL?.iPin;
    if (areParamsValid) {
      setUserDetails({
        userName,
        token,
        serviceName,
        mobileNumber: dataFromURL.MobileNo,
        ULBName: dataFromURL.ULBName.toLowerCase(),
        iPin: dataFromURL.iPin,
      });
    } else {
      showToast(MISSING_QUERY_PARAMS_VALUES, true);
    }
  }, []);

  useEffect(() => {
    const { userName, token, mobileNumber, ULBName, iPin } = userDetails;
    if (userName && token && mobileNumber && ULBName && iPin) {
      userFlowFunc();
    }
  }, [userDetails]);

  const userFlowFunc = async () => {
    const [sendApiRes, sendApiErr] = await callSendApi();
    if (sendApiErr || !sendApiRes?.isSuccessful) {
      const [oauthRes, oauthErr] = await callOauthTokenApi();
      if (oauthErr) {
        handleError(oauthErr, "Error in Digit.UserService.authenticate");
        return;
      }
      processUser(oauthRes);
    } else {
      const [createRes, createErr] = await callCreateApi();
      if (createErr) {
        handleError(createErr, "Error in Digit.UserService.registerUser");
        return;
      }
      processUser(createRes);
    }
  };

  const callSendApi = async () => {
    const { userName, mobileNumber, ULBName, iPin } = userDetails;
    const payload = {
      otp: {
        name: userName,
        permanentCity: `${stateCode}.${ULBName}`,
        tenantId: stateCode,
        mobileNumber: mobileNumber,
        type: TYPE_REGISTER,
        thirdPartyName: THIRD_PARTY_NAME,
        iPin: iPin,
      },
    };

    try {
      const res = await Digit.UserService.sendOtp(payload, stateCode);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  };

  const callCreateApi = async () => {
    const { userName, mobileNumber, ULBName, iPin } = userDetails;
    const payload = {
      name: userName,
      username: mobileNumber,
      otpReference: iPin,
      tenantId: `${stateCode}.${ULBName}`,
      permanentCity: `${stateCode}.${ULBName}`,
      clientId: THIRD_PARTY_NAME,
    };

    try {
      const res = await Digit.UserService.registerUser(payload, stateCode);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  };

  const callOauthTokenApi = async () => {
    const { mobileNumber, iPin } = userDetails;
    const payload = {
      username: mobileNumber,
      password: iPin,
      tenantId: stateCode,
      userType: USER_TYPE,
      thirdPartyName: THIRD_PARTY_NAME,
    };

    try {
      const res = await Digit.UserService.authenticate(payload);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  };

  const processUser = (userResponse) => {
    const { UserRequest: info, ...tokens } = userResponse;
    const isAuthorized =
      info.roles.some((userRole) => userRole.code === CITIZEN_ROLE_CODE) && info.roles.some((userRole) => userRole.code === THIRD_PARTY_ROLE_CODE);
    if (!isAuthorized) {
      showToast(ES_ERROR_USER_NOT_PERMITTED, true);
      return;
    }
    if (window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")) {
      info.tenantId = Digit.ULBService.getStateId();
    }
    setUser({ info, ...tokens });
  };

  useEffect(() => {
    if (user) {
      Digit.SessionStorage.set("citizen.userRequestObject", user);
      Digit.UserService.setUser(user);
      setCitizenDetail(user?.info, user?.access_token);

      const city = getCity(userDetails.ULBName);
      if (city) {
        Digit.SessionStorage.set("CITIZEN.COMMON.HOME.CITY", city);
        handleServiceRedirection();
      } else {
        showToast(ULB_NOT_FOUND, true);
      }
    }
  }, [user]);

  const handleServiceRedirection = () => {
    const servicePath = fetchServicePath(userDetails.serviceName);

    // Check if the service path is found
    if (!servicePath) {
      showToast(SERVICE_NOT_FOUND, true);
      return;
    }

    // Redirect to the service path:
    const newPath = `/citizen/${servicePath}`;
    history.replace(newPath);
    showToast(`${REDIRECTING_TO} ${servicePath}`, false);
  };

  const fetchServicePath = (serviceName) => {
    return citizenServiceMappings.find((item) => item.serviceName === serviceName)?.path;
  };

  const showToast = (message, isError) => {
    setIsLoading(false);
    setToastMessage(message);
    setIsError(isError);
    setTimeout(closeToast, 5000);
  };

  const closeToast = () => {
    setToastMessage(null);
  };

  const handleError = (err, logMessage) => {
    setIsLoading(false);
    //console.log(logMessage, err.response);
    showToast(err?.response?.data?.error?.message || ERROR_MESSAGE, true);
  };

  return (
    <div>
      {isLoading && <Loader />}
      {toastMessage && <Toast error={isError} label={t(toastMessage)} onClose={closeToast} isDleteBtn={"true"} />}
    </div>
  );
};

export default NavigationApp;
