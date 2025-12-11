import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import {  Toast } from "@mseva/digit-ui-react-components";
import LanguageSelect from "../NewLogin/NewLanguageSelect";
import LocationSelect from "../NewLogin/NewLocationSelect";
import RegistrationForm from "./NewRegistrationForm";
import OtpInput from "../NewLogin/NewSelectOtp";

const DEFAULT_REDIRECT_URL = "/digit-ui/citizen";

const NewRegistration = ({ stateCode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const [otp, setOtp] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const [step, setStep] = useState("FORM"); // FORM | OTP
  const [error, setError] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [isOtpValid, setIsOtpValid] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(() => location.state?.selectedLanguage || Digit.StoreData.getCurrentLanguage());
  const [selectedCity, setSelectedCity] = useState(location.state?.selectedCity || null);
  const [dob, setDob] = useState("");

  useEffect(() => {
    let to;
    if (error) {
      to = setTimeout(() => setError(null), 5000);
    }
    return () => to && clearTimeout(to);
  }, [error]);

  useEffect(() => {
    if (!user) {
      return;
    }
    Digit.SessionStorage.set("citizen.userRequestObject", user);
    Digit.UserService.setUser(user);
    setCitizenDetail(user?.info, user?.access_token, stateCode);
    const redirectPath = getFromLocation(location.state);
    if (!Digit.ULBService.getCitizenCurrentTenant(true)) {
      history.replace("/digit-ui/citizen/select-location", {
        redirectBackTo: redirectPath,
      });
    } else {
      history.replace(redirectPath);
    }
  }, [user, stateCode, location.state, history]);

  const getUserType = () => Digit.UserService.getType();

  const getFromLocation = (state) => {
    return state?.from || DEFAULT_REDIRECT_URL;
  };

  async function onRegisterSubmit(formData) {
    // Validate language and location first
    if (!selectedLanguage) {
      setError(t("CS_COMMON_CHOOSE_LANGUAGE"));
      return;
    }
    if (!selectedCity || !selectedCity.code) {
      setError(t("CS_COMMON_CHOOSE_LOCATION"));
      return;
    }

    try {
      setCanSubmit(false);
      setRegistrationData(formData);
      const [yyyy, mm, dd] = formData?.dob?.split("-");
      setDob(`${dd}/${mm}/${yyyy}`);
      const data = {
        mobileNumber: formData?.mobileNumber,
        name: formData?.name,
        emailId: formData?.emailId,
        dob: formData?.dob,
        tenantId: stateCode,
        userType: getUserType(),
        type: "register",
      };
      const [res, err] = await sendOtp({ otp: data });
      if (!err) {
        setStep("OTP");
      } else {
        // Check if user is already registered using new API response format
        if (
          err?.response?.data?.error?.fields?.[0]?.code === "OTP.MOBILENUMBER" &&
          err?.response?.data?.error?.fields?.[0]?.message?.includes("Already Register")
        ) {
          setError(t("CS_COMMON_MOBILE_ALREADY_REGISTERED"));
        } else {
          setError(t("CS_COMMON_ERROR"));
        }
      }
    } catch (e) {
      setError(t("CS_COMMON_ERROR"));
    } finally {
      setCanSubmit(true);
    }
  }

  function onAgeError(errorMessage) {
    setError(errorMessage);
    setTimeout(() => {
      setError(null);
    }, 3000);
  }

  async function onVerifyOtp() {
    try {
      setIsOtpValid(true);
      setCanSubmit(false);

      // Registration flow
      const requestData = {
        name: registrationData?.name,
        emailId: registrationData?.emailId,
        username: registrationData?.mobileNumber,
        otpReference: otp,
        dob: dob,
        tenantId: stateCode,
      };
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.registerUser(requestData, stateCode);

      if (window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")) {
        info.tenantId = Digit.ULBService.getStateId();
      }

      setUser({ info, ...tokens });
    } catch (e) {
      setCanSubmit(true);
      setIsOtpValid(false);
    }
  }

  const resendOtp = async () => {
    const data = {
      mobileNumber: registrationData?.mobileNumber,
      tenantId: stateCode,
      userType: getUserType(),
      type: "register",
    };
    const [res, err] = await sendOtp({ otp: data });
  };

  const sendOtp = async (data) => {
    try {
      const res = await Digit.UserService.sendOtp(data, stateCode);
      return [res, null];
    } catch (err) {
      return [null, err];
    }
  };

  const handleLoginClick = () => {
    history.push("/digit-ui/citizen/login-page", {
      from: getFromLocation(location.state),
    });
  };
  return (
     <div className="login-page-cover"> 
    <div className="login-container">
      <div className="register-login-wrapper">
        <div className="login-title">{t("CS_COMMON_REGISTER")}</div>
        <div className="lag-loc-wrapper">
          <LanguageSelect onLanguageChange={setSelectedLanguage} />
          <LocationSelect onLocationChange={setSelectedCity} selectedCity={selectedCity} />
        </div>

        {/* Step 1: Registration Form */}
        {step === "FORM" && (
          <RegistrationForm
            onRegisterSubmit={onRegisterSubmit}
            onAgeError={onAgeError}
            selectedLanguage={selectedLanguage}
            selectedCity={selectedCity}
            mobileNumber={location.state?.mobileNumber}
          />
        )}

        {/* Step 2: OTP Input */}
        {step === "OTP" && (
          <OtpInput
            otp={otp}
            onOtpChange={setOtp}
            onVerifyOtp={onVerifyOtp}
            onResendOtp={resendOtp}
            canSubmit={canSubmit}
            isOtpValid={isOtpValid}
            mobileNumber={registrationData?.mobileNumber}
          />
        )}

        {step !== "OTP" && (
          <div className="account-link">
            <span>
              {t("CS_COMMON_ALREADY_HAVE_ACCOUNT")}
            </span>
            <span className="link" onClick={handleLoginClick}>
              {t("CORE_COMMON_LOGIN")}
            </span>
          </div>
        )}

        {error && <Toast error={true} label={error} onClose={() => setError(null)} isDleteBtn={true} />}
      </div>
    </div>
    </div>
  );
};

const setCitizenDetail = (userObject, token, tenantId) => {
  try {
    let locale = JSON.parse(sessionStorage.getItem("Digit.initData"))?.value?.selectedLanguage;
    localStorage.setItem("Citizen.tenant-id", tenantId);
    localStorage.setItem("tenant-id", tenantId);
    localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
    localStorage.setItem("locale", locale);
    localStorage.setItem("Citizen.locale", locale);
    localStorage.setItem("token", token);
    localStorage.setItem("Citizen.token", token);
    localStorage.setItem("user-info", JSON.stringify(userObject));
    localStorage.setItem("Citizen.user-info", JSON.stringify(userObject));
  } catch (e) {}
};

export default NewRegistration;
