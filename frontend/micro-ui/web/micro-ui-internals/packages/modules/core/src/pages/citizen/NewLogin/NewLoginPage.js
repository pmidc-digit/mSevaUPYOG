import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { Toast } from "@mseva/digit-ui-react-components";
import LanguageSelect from "./NewLanguageSelect";
import LocationSelect from "./NewLocationSelect";
import MobileInput from "./NewSelectMobileNumber";
import OtpInput from "./NewSelectOtp";

const DEFAULT_REDIRECT_URL = "/digit-ui/citizen";

const NewLogin = ({ stateCode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const [mobileNumber, setMobileNumber] = useState("");
  const [lastSubmittedMobile, setLastSubmittedMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("MOBILE"); // MOBILE | OTP
  const [error, setError] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [isOtpValid, setIsOtpValid] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(() => Digit.StoreData.getCurrentLanguage());
  // const [selectedCity, setSelectedCity] = useState(() => ({ code: Digit.ULBService.getCitizenCurrentTenant(true) }));
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    let to;
    if (error) {
      to = setTimeout(() => setError(null), 5000);
    }
    return () => to && clearTimeout(to);
  }, [error]);

  useEffect(() => {
    canSubmit && lastSubmittedMobile && mobileNumber !== lastSubmittedMobile && setStep("MOBILE");
  }, [canSubmit, lastSubmittedMobile, mobileNumber]);

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

  const handleMobileChange = (val) => {
    setMobileNumber(val || "");
  };

  const getUserType = () => Digit.UserService.getType();

  const getFromLocation = (state) => {
    return state?.from || DEFAULT_REDIRECT_URL;
  };

  async function onSendOtp() {
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
      const data = {
        mobileNumber,
        tenantId: stateCode,
        userType: getUserType(),
        type: "login",
      };
      const [res, err] = await sendOtp({ otp: data });
      if (!err) {
        setStep("OTP");
        setLastSubmittedMobile(mobileNumber);
      } else {
        // Check if user is not registered using new API response format
        if (
          err?.response?.data?.error?.fields?.[0]?.code === "OTP.UNKNOWN_CREDENTIAL" &&
          err?.response?.data?.error?.fields?.[0]?.message?.includes("No such username")
        ) {
          // User not registered, show error and navigate to registration
          setError(t("CS_COMMON_USER_NOT_REGISTERED"));
          setLastSubmittedMobile(mobileNumber);
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

  async function onVerifyOtp() {
    try {
      setIsOtpValid(true);
      setCanSubmit(false);

      // Login flow only
      const requestData = {
        username: mobileNumber,
        password: otp,
        tenantId: stateCode,
        userType: getUserType(),
      };
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);

      // Role-based access control
      if (location.state?.role) {
        const roleInfo = info.roles.find((userRole) => userRole.code === location.state.role);
        if (!roleInfo || !roleInfo.code) {
          setError(t("ES_ERROR_USER_NOT_PERMITTED"));
          setTimeout(() => history.replace(DEFAULT_REDIRECT_URL), 5000);
          return;
        }
      }

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
      mobileNumber,
      tenantId: stateCode,
      userType: getUserType(),
      type: "login",
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

  const handleRegisterClick = () => {
    history.push("/digit-ui/citizen/new-registration", {
      from: getFromLocation(location.state),
      mobileNumber: mobileNumber,
      selectedLanguage: selectedLanguage,
      selectedCity: selectedCity,
    });
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-title">{t("CORE_COMMON_LOGIN")}</div>
        <div className="lag-loc-wrapper">
          <LanguageSelect onLanguageChange={setSelectedLanguage} />
          <LocationSelect onLocationChange={setSelectedCity} selectedCity={selectedCity} />
        </div>
        {/* Step 1: Mobile Input */}
        <MobileInput
          mobileNumber={mobileNumber}
          onMobileChange={handleMobileChange}
          onSendOtp={onSendOtp}
          canSubmit={canSubmit && (lastSubmittedMobile ? mobileNumber !== lastSubmittedMobile : true)}
          step={step}
        />

        {/* Step 2: OTP Input */}
        {step === "OTP" && (
          <OtpInput otp={otp} onOtpChange={setOtp} onVerifyOtp={onVerifyOtp} onResendOtp={resendOtp} canSubmit={canSubmit} isOtpValid={isOtpValid} />
        )}

        {step !== "OTP" && (
          <div className="account-link">
            <span>
              {t("CS_COMMON_DONT_HAVE_ACCOUNT")}
            </span>
            <span className="link" onClick={handleRegisterClick}>
              {t("CS_COMMON_REGISTER")}
            </span>
          </div>
        )}
        {error && <Toast error={true} label={error} onClose={() => setError(null)} isDleteBtn={true} />}
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

export default NewLogin;
