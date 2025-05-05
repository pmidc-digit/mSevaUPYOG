import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader, Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { citizenServiceMappings } from "../../../config/ssoConfig";

const USER_TYPE = "CITIZEN";
const TYPE_REGISTER = "register";
const CITIZEN_ROLE_CODE = "CITIZEN";
const TOAST_TIMEOUT = 5000;
//Keep the below values from localisation service (First define these values in localisation service for core module);
const INVALID_QUERY_PARAMS_VALUES = "Some query parameters are missing or invalid. Please provide all required information.";
const SERVICE_NOT_FOUND = "Requested service not found";
const REDIRECTING_TO = "Redirecting to";
const ES_ERROR_USER_NOT_PERMITTED = "ES_ERROR_USER_NOT_PERMITTED";
const ERROR_MESSAGE = "Something went wrong";
const ULB_NOT_FOUND = "ULB not found";
const INVALID_MOBILE_NUMBER = "Mobile number should be 10 digits long";
const INVALID_USER_NAME = "Invalid user name";
const ERROR_AUTHENTICATING_USER = "An issue occurred while authenticating. Please try again.";
const ERROR_CREATING_USER = "An issue occurred while creating the user. Please try again.";

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

function validateFullName(name) {
  // Regular expression to check if the name contains only letters and spaces
  const nameRegex = /^(?=.*[a-zA-Z]{3})[a-zA-Z\s]+$/;

  // Check if the name matches the regular expression
  return nameRegex.test(name);
}

function validateMobileNumber(mobileNumber) {
  // Regular expression to check if the mobile number contains exactly 10 digits
  const mobileNumberRegex = /^\d{10}$/;

  // Check if the mobile number matches the regular expression
  return mobileNumberRegex.test(mobileNumber);
}

const NavigationApp = ({ stateCode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});
  const [user, setUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const { data: cities, isLoading: isCitiesLoading } = Digit.Hooks.useTenants();
  const getCity = (ULBName) => {
    const city = cities?.find((city) => city?.name?.toLowerCase() === ULBName?.toLowerCase());
    return city;
  };

  useEffect(() => {
    if (isCitiesLoading) return;
    if (!cities || cities.length === 0) {
      showToast(ERROR_MESSAGE, true);
      return;
    }
    const queryParams = new URLSearchParams(location.search);
    const msg = queryParams.get("msg");
    const params = msg.split("|");
    if (params.length !== 5) {
      showToast(INVALID_QUERY_PARAMS_VALUES, true);
      return;
    }
    const [token, fullName, serviceName, dataString, returnUrl] = params;
    const dataFromURL = { ...JSON.parse(dataString), fullName: fullName, serviceName: serviceName, returnUrl: returnUrl };

    const isMobileNoValid = validateMobileNumber(dataFromURL?.MobileNo?.trim());
    const isFullNameValid = validateFullName(dataFromURL?.fullName?.trim());
    const city = getCity(dataFromURL?.ULBName?.trim());
    const isCityValid = Object.keys(city).length > 0;

    const areParamsValid =
      dataFromURL?.thirdPartyName &&
      dataFromURL?.serviceName &&
      isMobileNoValid &&
      dataFromURL?.iPin &&
      dataFromURL?.AppId &&
      dataFromURL?.ULBName &&
      isCityValid &&
      isFullNameValid;

    if (areParamsValid) {
      setUserDetails({
        thirdPartyCode: dataFromURL.thirdPartyName.trim(),
        serviceName: dataFromURL.serviceName.trim(),
        mobileNumber: dataFromURL.MobileNo,
        iPin: dataFromURL.iPin,
        appId: dataFromURL.AppId, 
        ULBName: dataFromURL.ULBName.toLowerCase().trim(),
        userName: dataFromURL.fullName.trim(),
        returnURL: dataFromURL.returnUrl.trim(),
      });
    } else {
      if (!isMobileNoValid) {
        showToast(INVALID_MOBILE_NUMBER, true);
        return;
      }
      if (!isFullNameValid) {
        showToast(INVALID_USER_NAME, true);
        return;
      }
      if (!isCityValid) {
        showToast(ULB_NOT_FOUND, true);
        return;
      }
      if (!areParamsValid) {
        showToast(INVALID_QUERY_PARAMS_VALUES, true);
      }
    }
  }, [isCitiesLoading]);

  useEffect(() => {
    if (Object.keys(userDetails).length > 0) {
      userFlowFunc();
    }
  }, [userDetails]);

  const userFlowFunc = async () => {
    const [sendApiRes, sendApiErr] = await callSendApi();
    if (sendApiRes?.isSuccessful) {
      const [createRes, createErr] = await callCreateApi();
      if (createErr) {
        handleError(createErr?.response?.data?.error?.message || ERROR_CREATING_USER, "Error in Digit.UserService.registerUser");
        return;
      }
      processUser(createRes);
    } else if (sendApiErr?.response?.data?.error?.code === 400) {
      const [oauthRes, oauthErr] = await callOauthTokenApi();
      if (oauthErr) {
        handleError(oauthErr?.response?.data?.error_description || ERROR_AUTHENTICATING_USER, "Error in Digit.UserService.authenticate");
        return;
      }
      processUser(oauthRes);
    } else {
      handleError(ERROR_MESSAGE, "Error in Digit.UserService.sendOtp");
    }
  };

  const callSendApi = async () => {
    const { thirdPartyCode, mobileNumber, iPin, ULBName, userName } = userDetails;
    const payload = {
      otp: {
        name: userName,
        permanentCity: `${stateCode}.${ULBName}`,
        tenantId: stateCode,
        mobileNumber: mobileNumber,
        type: TYPE_REGISTER,
        thirdPartyName: thirdPartyCode,
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
    const { thirdPartyCode, mobileNumber, iPin, ULBName, userName } = userDetails;
    const payload = {
      name: userName,
      username: mobileNumber,
      otpReference: iPin,
      tenantId: `${stateCode}.${ULBName}`,
      permanentCity: `${stateCode}.${ULBName}`,
      clientId: thirdPartyCode,
    };

    try {
      const res = await Digit.UserService.registerUser(payload, stateCode);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  };

  const callOauthTokenApi = async () => {
    const { thirdPartyCode, mobileNumber, iPin } = userDetails;
    const payload = {
      username: mobileNumber,
      password: iPin,
      tenantId: stateCode,
      userType: USER_TYPE,
      thirdPartyName: thirdPartyCode,
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
    const isAuthorized = info.roles.some((userRole) => userRole.code === CITIZEN_ROLE_CODE);
    // && info.roles.some((userRole) => userRole.code === userDetails.thirdPartyCode);
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
      const servicePath = fetchServicePath(userDetails.serviceName);
      // Check if the service path is found
      if (!servicePath) {
        showToast(SERVICE_NOT_FOUND, true);
        return;
      }

      const city = getCity(userDetails.ULBName);
      const isCityValid = Object.keys(city).length > 0;
      if (!isCityValid) {
        showToast(ULB_NOT_FOUND, true);
        return;
      }

      Digit.SessionStorage.set("CITIZEN.COMMON.HOME.CITY", city);
      Digit.SessionStorage.set("citizen.userRequestObject", user);
      Digit.UserService.setUser(user);
      setCitizenDetail(user?.info, user?.access_token);
      localStorage.setItem("thirdPartyReturnUrl", userDetails?.returnURL);
      localStorage.setItem("thirdPartyCode", userDetails?.thirdPartyCode);
      localStorage.setItem("iPin", userDetails?.iPin);
      localStorage.setItem("appid", userDetails?.appId);
      localStorage.setItem("serviceName", userDetails?.serviceName);
      handleServiceRedirection(servicePath,userDetails?.serviceName);
    }
  }, [user]);

  const handleServiceRedirection = (servicePath,serviceName) => {
    //Redirect to the service path:
    const domain = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
    const newURL = `${domain}/citizen/${servicePath}?&servicename=${serviceName}`;
    window.location.href = newURL;
    showToast(`${REDIRECTING_TO} ${servicePath}`, false);
  };

  const fetchServicePath = (serviceName) => {
    return citizenServiceMappings?.find((item) => item.serviceName === serviceName)?.path;
  };

  const showToast = (message, isError) => {
    setIsLoading(false);
    setToastMessage(message);
    setIsError(isError);
    setTimeout(closeToast, TOAST_TIMEOUT);
  };

  const closeToast = () => {
    setToastMessage(null);
  };

  const handleError = (errMessage, logMessage) => {
    setIsLoading(false);
    showToast(errMessage || ERROR_MESSAGE, true);
  };

  return (
    <div>
      {isLoading && <Loader />}
      {toastMessage && <Toast error={isError} label={t(toastMessage)} onClose={closeToast} isDleteBtn={"true"} />}
    </div>
  );
};

export default NavigationApp;
