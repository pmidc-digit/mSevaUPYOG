import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { Dropdown, Toast } from "@mseva/digit-ui-react-components";
import LanguageSelect from "./NewLanguageSelect";
import LocationSelect from "./NewLocationSelect";
import MobileInput from "./NewSelectMobileNumber";
import OtpInput from "./NewSelectOtp";
import NewRegistration from "../NewRegistration";
const DEFAULT_REDIRECT_URL = "/digit-ui/citizen";
const DEFAULT_BPA_REDIRECT_URL = "/digit-ui/citizen/obps/home";

const NewLogin = ({ stateCode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const isLanguageEntryPage = location.pathname.endsWith("/select-language");
  const [mobileNumber, setMobileNumber] = useState(() => location.state?.mobileNumber || "");
  const [lastSubmittedMobile, setLastSubmittedMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("MOBILE"); // MOBILE | OTP
  const [error, setError] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [isOtpValid, setIsOtpValid] = useState(true);
  const [isError, setIsError] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(() => location.state?.selectedLanguage || Digit.StoreData.getCurrentLanguage());
  // const [selectedCity, setSelectedCity] = useState(() => ({ code: Digit.ULBService.getCitizenCurrentTenant(true) }));
  const [selectedCity, setSelectedCity] = useState(() => location.state?.selectedCity || null);
  const [portal, setPortal] = useState("citizen");
  const [isRegistering, setIsRegistering] = useState(false);
  const [employeeCredentials, setEmployeeCredentials] = useState({ username: "", password: "", city: null });
  const [isEmployeeLoginLoading, setIsEmployeeLoginLoading] = useState(false);
  const [employeeView, setEmployeeView] = useState("login");
  const [resetMobileNumber, setResetMobileNumber] = useState("");
  const [resetCity, setResetCity] = useState(null);
  const [employeeUser, setEmployeeUser] = useState(null);
  const { data: employeeCities, isLoading: isEmployeeCitiesLoading } = Digit.Hooks.useTenants();

  useEffect(() => {
    const englishLocale = "en_IN";
    setSelectedLanguage(englishLocale);
    Digit.LocalizationService.changeLanguage(englishLocale, stateCode);
  }, [stateCode]);

  useEffect(() => {
    if (!isLanguageEntryPage) return undefined;

    document.body.classList.add("mseva-entry-active");
    return () => document.body.classList.remove("mseva-entry-active");
  }, [isLanguageEntryPage]);

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
      // Use full page reload to ensure all components get fresh user data
      window.location.href = "/digit-ui/citizen/select-location";
    } else {
      // Use full page reload to ensure all components get fresh user data
      window.location.href = redirectPath;
    }
  }, [user, stateCode, location.state, history]);

  const handleMobileChange = (val) => {
    setMobileNumber(val || "");
  };

  const getUserType = () => Digit.UserService.getType();

  const getFromLocation = (state) => {
    const userRoles = user?.info?.roles?.map((roleData) => roleData?.code);
    // const isUserBPA = userRoles?.some((role) => role?.includes("BPA"));
    const isUserBPA =
      user?.info?.roles?.some((role) => role?.code === "BPA_ARCHITECT") ||
      user?.info?.roles?.some((role) => role?.code?.includes("BPA") && role?.tenantId === selectedCity?.code);
    return isUserBPA ? state?.from || DEFAULT_BPA_REDIRECT_URL : state?.from || DEFAULT_REDIRECT_URL;
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
    const maskedMobile = `+91 ${mobileNumber.substring(0, 2)}******${mobileNumber.substring(mobileNumber.length - 2)}`;

    try {
      setCanSubmit(false);
      const data = {
        mobileNumber,
        tenantId: stateCode,
        userType: "citizen",
        type: "login",
      };
      const [res, err] = await sendOtp({ otp: data });
      if (!err) {
        setStep("OTP");
        setError(`OTP has been successfully sent to Mob No: ${maskedMobile}`);
        setIsError(false);
        setLastSubmittedMobile(mobileNumber);
      } else {
        // Check if user is not registered using new API response format
        if (
          err?.response?.data?.error?.fields?.[0]?.code === "OTP.UNKNOWN_CREDENTIAL" &&
          err?.response?.data?.error?.fields?.[0]?.message?.includes("No such username")
        ) {
          // User not registered, redirect to registration page
          setIsRegistering(true);
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
        userType: "citizen",
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
      userType: "citizen",
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
    setIsRegistering(true);
  };

  const employeeCityOptions = employeeCities?.filter((city) => city.code !== "pb.punjab") || [];

  const onEmployeeLogin = async () => {
    const { username, password, city } = employeeCredentials;
    if (isEmployeeLoginLoading || !username || !password || !city?.code) {
      if (isEmployeeLoginLoading) return;
      setError("Please enter your user name, password, and city.");
      return;
    }
    try {
      setIsEmployeeLoginLoading(true);
      setCanSubmit(false);
      const { user: users, ...tokens } = await Digit.UserService.authenticateV1({ username, password, tenantId: city.code, userType: "EMPLOYEE" });
      const info = users[0];
      await Digit.UserService.sendOtp(
        { otp: { mobileNumber: info.mobileNumber, tenantId: info.tenantId, userType: "EMPLOYEE", type: "login" } },
        info.tenantId
      );
      Digit.SessionStorage.set("Employee.tenantId", info.tenantId);
      setEmployeeUser({ info, ...tokens });
      setStep("EMPLOYEE_OTP");
      setIsError(false);
      setError("OTP has been sent to your registered mobile number.");
    } catch (err) {
      setIsError(true);
      setError(err?.response?.data?.error_description || "Invalid login credentials.");
    } finally {
      setCanSubmit(true);
      setIsEmployeeLoginLoading(false);
    }
  };

  const onVerifyEmployeeOtp = async () => {
    try {
      setIsOtpValid(true);
      setCanSubmit(false);
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate({
        username: employeeUser?.info?.userName,
        password: otp,
        tenantId: employeeUser?.info?.tenantId,
        userType: "EMPLOYEE",
      });
      setEmployeeDetail(info, tokens.access_token);
      Digit.UserService.setUser({ info, ...tokens });
      window.location.href = "/digit-ui/employee";
    } catch (err) {
      setCanSubmit(true);
      setIsOtpValid(false);
    }
  };

  const onEmployeeForgotPassword = async () => {
    if (!resetMobileNumber || !resetCity?.code) {
      setError("Please enter your mobile number and city.");
      return;
    }
    try {
      await Digit.UserService.sendOtp(
        { otp: { mobileNumber: resetMobileNumber, userType: "EMPLOYEE", type: "passwordreset", tenantId: resetCity.code } },
        resetCity.code
      );
      history.push(`/digit-ui/employee/user/change-password?mobile_number=${resetMobileNumber}&tenantId=${resetCity.code}`);
    } catch (err) {
      setError(err?.response?.data?.error?.fields?.[0]?.message || "Unable to send password reset OTP.");
    }
  };

  useEffect(() => {
    // Clear everything
    localStorage.clear();
    // sessionStorage.clear();

    // Optional: Clear specific Digit caches if needed
    if (window?.caches) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  }, []);

  // setError(`testing`);
  // setShowToast(true);

  return (
    <div className={`login-page-cover ${isLanguageEntryPage ? "login-page-cover--select-language mseva-entry-page" : ""}`}>
      {isLanguageEntryPage && (
        <header className="mseva-entry-header">
          <button type="button" className="mseva-entry-brand" onClick={() => history.push("/digit-ui/citizen")}>
            <img src="/digit-ui/mseva-punjab-logo.jpeg" alt="mSeva Punjab Local Government" />
          </button>
          <div className="mseva-entry-civic-title" aria-label="mSeva">mSeva</div>
          <nav className="mseva-entry-nav mseva-entry-nav--home" aria-label="Portal navigation">
            <button type="button" className="is-active" onClick={() => history.push("/digit-ui/citizen")}>Home</button>
          </nav>
        </header>
      )}
      <div className="login-container">
        {/* Left Panel - Hero Section */}
        <div className="login-hero-panel">
          <div className="hero-content">
            <p className="mseva-entry-eyebrow">Punjab Local Government</p>
            <h1 className="hero-title">Welcome to <span>mSeva</span></h1>
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
                <span className="feature-text">Secure<br />Infrastructure</span>
                <p>End-to-end encrypted services for your safety.</p>
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
                <span className="feature-text">Real-time<br />Updates</span>
                <p>Track each application as it progresses.</p>
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
                <span className="feature-text">Mobile<br />First</span>
                <p>Access services easily from any device.</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" fill="currentColor" />
                  </svg>
                </div>
                <span className="feature-text">Citizen<br />Centric</span>
                <p>Designed around simple, accessible services.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form-panel">
          <div className="login-wrapper">
            {!isRegistering && <div className="login-form-header">
              {isLanguageEntryPage && (
                <div className="mseva-portal-switch" role="tablist" aria-label="Choose portal">
                  <button type="button" className={portal === "citizen" ? "is-selected" : ""} role="tab" aria-selected={portal === "citizen"} onClick={() => { setPortal("citizen"); setStep("MOBILE"); setOtp(""); }}>Citizen Portal</button>
                  <button type="button" className={portal === "employee" ? "is-selected" : ""} role="tab" aria-selected={portal === "employee"} onClick={() => { setPortal("employee"); setStep("EMPLOYEE"); setOtp(""); }}>Employee</button>
                </div>
              )}
              <h2 className="login-title">{portal === "employee" ? (employeeView === "forgot" ? "RESET PASSWORD" : "EMPLOYEE LOGIN") : t("CORE_COMMON_LOGIN")}</h2>
              <p className="login-subtitle">{employeeView === "forgot" ? "Enter your registered details to receive a password reset OTP." : "Enter your details to access your account"}</p>
            </div>}

            {isRegistering ? <NewRegistration stateCode={stateCode} embedded initialCity={selectedCity} initialMobileNumber={mobileNumber} onBackToLogin={() => setIsRegistering(false)} /> : portal === "employee" ? (
              <div className="mseva-employee-login-fields">
                {employeeView === "forgot" ? <>
                  <label className="label">Mobile Number <span>*</span><input type="tel" maxLength="10" value={resetMobileNumber} onChange={(event) => setResetMobileNumber(event.target.value.replace(/\D/g, ""))} /></label>
                  <div className="location-wrapper"><div className="label">City <span>*</span></div>{!isEmployeeCitiesLoading && <Dropdown option={employeeCityOptions} optionKey="i18nKey" selected={resetCity} select={setResetCity} t={t} />}</div>
                  <button type="button" className="submit-bar" onClick={onEmployeeForgotPassword}>Send reset OTP</button>
                  <button type="button" className="mseva-employee-back-link" onClick={() => setEmployeeView("login")}>Back to employee login</button>
                </> : step !== "EMPLOYEE_OTP" && <>
                  <label className="label">User Name <span>*</span><input value={employeeCredentials.username} onChange={(event) => setEmployeeCredentials({ ...employeeCredentials, username: event.target.value })} /></label>
                  <label className="label">Password <span>*</span><input type="password" value={employeeCredentials.password} onChange={(event) => setEmployeeCredentials({ ...employeeCredentials, password: event.target.value })} /></label>
                  <div className="location-wrapper"><div className="label">City <span>*</span></div>{!isEmployeeCitiesLoading && <Dropdown option={employeeCityOptions} optionKey="i18nKey" selected={employeeCredentials.city} select={(city) => setEmployeeCredentials({ ...employeeCredentials, city })} t={t} />}</div>
                  <button
                    type="button"
                    className="submit-bar"
                    onClick={onEmployeeLogin}
                    disabled={isEmployeeLoginLoading || !employeeCredentials.username || !employeeCredentials.password || !employeeCredentials.city?.code}
                  >
                    {isEmployeeLoginLoading ? "Signing in..." : "Continue"}
                  </button>
                  <button type="button" className="mseva-employee-back-link" onClick={() => setEmployeeView("forgot")}>Forgot Password?</button>
                </>}
                {step === "EMPLOYEE_OTP" && <OtpInput otp={otp} onOtpChange={setOtp} onVerifyOtp={onVerifyEmployeeOtp} onResendOtp={onEmployeeLogin} canSubmit={canSubmit} isOtpValid={isOtpValid} />}
              </div>
            ) : <>
            <LocationSelect onLocationChange={setSelectedCity} selectedCity={selectedCity} />
            <MobileInput mobileNumber={mobileNumber} onMobileChange={handleMobileChange} onSendOtp={onSendOtp} canSubmit={canSubmit && (lastSubmittedMobile ? mobileNumber !== lastSubmittedMobile : true)} step={step} />
            </>}

            {portal === "citizen" && step === "OTP" && (
              <OtpInput
                otp={otp}
                onOtpChange={setOtp}
                onVerifyOtp={onVerifyOtp}
                onResendOtp={resendOtp}
                canSubmit={canSubmit}
                isOtpValid={isOtpValid}
              />
            )}

            {!isRegistering && portal === "citizen" && step !== "OTP" && (
              <div className="account-link">
                <span>{t("CS_COMMON_DONT_HAVE_ACCOUNT")} </span>
                <span className="link" onClick={handleRegisterClick}>
                  {t("CS_COMMON_REGISTER")}
                </span>
              </div>
            )}

            {error && <Toast error={isError} label={error} onClose={() => setError(null)} isDleteBtn={true} />}
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

const setEmployeeDetail = (userObject, token) => {
  const locale = JSON.parse(sessionStorage.getItem("Digit.locale"))?.value || "en_IN";
  localStorage.setItem("Employee.tenant-id", userObject?.tenantId);
  localStorage.setItem("tenant-id", userObject?.tenantId);
  localStorage.setItem("Employee.locale", locale);
  localStorage.setItem("Employee.token", token);
  localStorage.setItem("token", token);
  localStorage.setItem("Employee.user-info", JSON.stringify(userObject));
  localStorage.setItem("user-info", JSON.stringify(userObject));
};

export default NewLogin;
