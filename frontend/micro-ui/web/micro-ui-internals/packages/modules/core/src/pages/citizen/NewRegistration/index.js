import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { LoginIcon, Toast, Dropdown } from "@mseva/digit-ui-react-components";
import LanguageSelect from "../NewLogin/NewLanguageSelect";
import LocationSelect from "../NewLogin/NewLocationSelect";
import RegistrationForm from "./NewRegistrationForm";
import OtpInput from "../NewLogin/NewSelectOtp";

const DEFAULT_REDIRECT_URL = "/digit-ui/citizen";

const genders = [
  { name: "Male", code: "MALE" },
  { name: "Female", code: "FEMALE" },
  { name: "Transgender", code: "TRANSGENDER" },
];

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
  const [getGender, setGender] = useState();

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
        gender: getGender?.code,
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
        gender: getGender?.code,
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
      mobileNumber: registrationData?.mobileNumber || location.state?.mobileNumber,
      selectedLanguage: selectedLanguage,
      selectedCity: selectedCity,
    });
  };

  useEffect(() => {
    console.log("getGender", getGender);
  }, [getGender]);

  return (
    <div className="login-page-cover">
      <div className="login-container">
        {/* Left Panel - Same Hero Section as Login */}
        <div className="login-hero-panel">
          <div className="hero-content">
            <div className="hero-icon-circle">
              <LoginIcon />
            </div>
            <h1 className="hero-title">Welcome to UPYOG</h1>
            <p className="hero-description">Your digital gateway to urban governance services. Access all municipal services in one place.</p>
            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="feature-text">Multi-lingual</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="feature-text">Location Based</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.1-.03-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="feature-text">Secure Login</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="login-form-panel">
          <div className="register-login-wrapper">
            <div className="login-form-header">
              <h2 className="login-title">{t("CS_COMMON_REGISTER")}</h2>
              <p className="login-subtitle">Create your account to get started</p>
            </div>

            <LanguageSelect onLanguageChange={setSelectedLanguage} />
            <LocationSelect onLocationChange={setSelectedCity} selectedCity={selectedCity} />

            <div className="location-wrapper">
              <div className="label">
                {t("CORE_COMMON_GENDER")}
                <span> *</span>
              </div>

              <Dropdown option={genders} optionKey="name" id="name" selected={getGender} select={setGender} placeholder={t("COMMON_TABLE_SEARCH")} />
            </div>
            {step === "FORM" && (
              <RegistrationForm
                onRegisterSubmit={onRegisterSubmit}
                onAgeError={onAgeError}
                selectedLanguage={selectedLanguage}
                selectedCity={selectedCity}
                mobileNumber={location.state?.mobileNumber}
              />
            )}

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
                <span>{t("CS_COMMON_ALREADY_HAVE_ACCOUNT")} </span>
                <span className="link" onClick={handleLoginClick}>
                  {t("CORE_COMMON_LOGIN")}
                </span>
              </div>
            )}

            {error && <Toast error={true} label={error} onClose={() => setError(null)} isDleteBtn={true} />}
          </div>
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
