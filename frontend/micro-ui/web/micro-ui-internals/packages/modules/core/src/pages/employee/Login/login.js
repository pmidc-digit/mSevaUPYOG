import { BackButton, Dropdown, Loader, LoginIcon, Toast } from "@mseva/digit-ui-react-components";
import { FormComposer } from "../../../../../../react-components/src/hoc/FormComposer";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Background from "../../../components/Background";
import Header from "../../../components/Header";
import OtpInput from "../../citizen/NewLogin/NewSelectOtp";

/* set employee details to enable backward compatiable */
const setEmployeeDetail = (userObject, token) => {
  let locale = JSON.parse(sessionStorage.getItem("Digit.locale"))?.value || "en_IN";
  localStorage.setItem("Employee.tenant-id", userObject?.tenantId);
  localStorage.setItem("tenant-id", userObject?.tenantId);
  localStorage.setItem("citizen.userRequestObject", JSON.stringify(userObject));
  localStorage.setItem("locale", locale);
  localStorage.setItem("Employee.locale", locale);
  localStorage.setItem("token", token);
  localStorage.setItem("Employee.token", token);
  localStorage.setItem("user-info", JSON.stringify(userObject));
  localStorage.setItem("Employee.user-info", JSON.stringify(userObject));
};

const Login = ({ config: propsConfig, t, isDisabled }) => {
  const { data: cities, isLoading } = Digit.Hooks.useTenants();
  const { data: storeData, isLoading: isStoreLoading } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [disable, setDisable] = useState(false);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpValid, setIsOtpValid] = useState(true);
  const [canSubmit, setCanSubmit] = useState(true);

  const history = useHistory();
  // const getUserType = () => "EMPLOYEE" || Digit.UserService.getType();
  let sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
  const pdfUrl = "https://pg-egov-assets.s3.ap-south-1.amazonaws.com/Upyog+Code+and+Copyright+License_v1.pdf";

  useEffect(() => {
    if (!user) {
      return;
    }
    Digit.SessionStorage.set("citizen.userRequestObject", user);
    const filteredRoles = user?.info?.roles?.filter((role) => role.tenantId === Digit.SessionStorage.get("Employee.tenantId"));
    if (user?.info?.roles?.length > 0) user.info.roles = filteredRoles;
    Digit.UserService.setUser(user);
    setEmployeeDetail(user?.info, user?.access_token);
    let redirectPath = "/digit-ui/employee";
    console.log("loggin user as well", user);

    /* logic to redirect back to same screen where we left off  */
    if (window?.location?.href?.includes("from=")) {
      redirectPath = decodeURIComponent(window?.location?.href?.split("from=")?.[1]) || "/digit-ui/employee";
    }

    // /*  RAIN-6489 Logic to navigate to National DSS home incase user has only one role [NATADMIN]*/
    // if (user?.info?.roles && user?.info?.roles?.length > 0 && user?.info?.roles?.every((e) => e.code === "NATADMIN")) {
    //   redirectPath = "/digit-ui/employee/dss/landing/NURT_DASHBOARD";
    // }
    // /*  RAIN-6489 Logic to navigate to National DSS home incase user has only one role [NATADMIN]*/
    // if (user?.info?.roles && user?.info?.roles?.length > 0 && user?.info?.roles?.every((e) => e.code === "STADMIN")) {
    //   redirectPath = "/digit-ui/employee/dss/landing/home";
    // }

    history.replace(redirectPath);
  }, [user]);

  const onLogin = async (data) => {
    alert("test");
    if (!data.city) {
      alert("Please Select City!");
      return;
    }

    const requestData = {
      ...data,
      userType: "EMPLOYEE",
    };
    requestData.tenantId = data.city.code;
    delete requestData.city;
    try {
      const { UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);
      console.log("info===", info);
      const data = {
        mobileNumber: info?.mobileNumber,
        tenantId: info?.tenantId,
        userType: "EMPLOYEE",
        type: "login",
      };
      // setShowOTP(true);
      // sendOtp({ otp: data });
      Digit.SessionStorage.set("Employee.tenantId", info?.tenantId);
      setUser({ info, ...tokens });
    } catch (err) {
      setDisable(false);
      setShowToast(err?.response?.data?.error_description || "Invalid login credentials!");
      setTimeout(closeToast, 5000);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const onForgotPassword = () => {
    sessionStorage.getItem("User") && sessionStorage.removeItem("User");
    setIsForgotPasswordView(true);
    history.push("/digit-ui/employee/user/forgot-password");
  };

  const onBackToLogin = () => {
    setIsForgotPasswordView(false);
  };

  const [userId, password, city] = propsConfig.inputs;

  const config = [
    {
      body: [
        {
          label: t(userId.label),
          type: userId.type,
          populators: {
            name: userId.name,
          },
          isMandatory: true,
        },
        {
          label: t(password.label),
          type: password.type,
          populators: {
            name: password.name,
          },
          isMandatory: true,
        },
        // {
        //   label: t(city.label),
        //   type: city.type,
        //   populators: {
        //     name: city.name,
        //     customProps: {},
        //     component: (props, customProps) => (
        //       <Dropdown
        //         option={cities}

        //         optionKey="i18nKey"
        //         select={(d) => {
        //           props.onChange(d);
        //         }}
        //         t={t}
        //         {...customProps}
        //       />
        //     ),
        //   },
        //   isMandatory: true,
        // },
        {
          label: t(city.label),
          type: "custom",
          populators: {
            name: city.name,
            customProps: {},
            component: (props, customProps) => (
              <Dropdown option={cities} optionKey="i18nKey" select={(d) => props.onChange(d)} t={t} {...customProps} />
            ),
          },
          isMandatory: true,
        },
      ],
    },
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js ";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const resendOtp = async () => {
    const data = {
      mobileNumber: user?.info?.mobileNumber,
      tenantId: user?.info?.tenantId,
      userType: "employee",
      type: "login",
    };
    const [res, err] = await sendOtp({ otp: data });
  };

  async function onVerifyOtp() {
    console.log("coming here");
    try {
      setIsOtpValid(true);
      setCanSubmit(false);

      // Login flow only
      const requestData = {
        username: user?.info?.userName,
        password: otp,
        tenantId: user?.info?.tenantId,
        userType: "EMPLOYEE",
      };
      console.log("requestData", requestData);
      const { ResponseInfo, UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);
      setUser({ info, ...tokens });
      history.push("/digit-ui/employee");
      console.log("new info", info);
      console.log("tokens", tokens);
      // Role-based access control
      // if (location.state?.role) {
      //   const roleInfo = info.roles.find((userRole) => userRole.code === location.state.role);
      //   if (!roleInfo || !roleInfo.code) {
      //     setError(t("ES_ERROR_USER_NOT_PERMITTED"));
      //     setTimeout(() => history.replace(DEFAULT_REDIRECT_URL), 5000);
      //     return;
      //   }
      // }

      // if (window?.globalConfigs?.getConfig("ENABLE_SINGLEINSTANCE")) {
      //   info.tenantId = Digit.ULBService.getStateId();
      // }
    } catch (e) {
      console.log("e====", e);
      setCanSubmit(true);
      setIsOtpValid(false);
    }
  }

  const sendOtp = async (data) => {
    setDisable(true);
    try {
      const res = await Digit.UserService.sendOtp(data, user?.info?.tenantId);
      return [res, null];
    } catch (err) {
      console.log("err", err);
      return [null, err];
    }
  };

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange", data);
    setDisable(false);
  };

  return isLoading || isStoreLoading ? (
    <Loader />
  ) : (
    // <Background>

    //   <FormComposer
    //     onSubmit={onLogin}
    //     isDisabled={isDisabled || disable}
    //     noBoxShadow
    //     inline
    //     submitInForm
    //     config={config}
    //     label={propsConfig.texts.submitButtonLabel}
    //     secondaryActionLabel={propsConfig.texts.secondaryButtonLabel}
    //     onSecondayActionClick={onForgotPassword}
    //     heading={propsConfig.texts.header}
    //     description={"Login to access your account"}
    //     headingStyle={{ textAlign: "center" }}
    //     className="loginFormStyleEmployeeNew"
    //     buttonStyle={{ maxWidth: "100%", width: "100%" ,backgroundColor:"#2947A3"}}
    //   >

    //   </FormComposer>
    //   {showToast && <Toast error={true} label={t(showToast)} onClose={closeToast} isDleteBtn={true}/>}

    // </Background>
    <Background>
      <div className="language-plugin">
        <div className="bhashini-plugin-container"></div>
      </div>
      <div className="employee-login-container">
        <div className="employee-login-content">
          <div className="employee-login-icon-circle">
            <LoginIcon />
          </div>

          <div className="employee-login-branding">
            <h1 className="employee-upyog-title">UPYOG</h1>
            <p className="employee-upyog-subtitle">Urban Governance Platform</p>
          </div>

          <div className="employee-login-card">
            {isForgotPasswordView && (
              <button onClick={onBackToLogin} className="employee-back-button" type="button">
                ← Back to Login
              </button>
            )}

            {!isForgotPasswordView ? (
              <React.Fragment>
                <FormComposer
                  onSubmit={onLogin}
                  isDisabled={disable}
                  noBoxShadow
                  inline
                  submitInForm
                  config={config}
                  label={propsConfig.texts.submitButtonLabel}
                  secondaryActionLabel={propsConfig.texts.secondaryButtonLabel}
                  onSecondayActionClick={onForgotPassword}
                  heading={propsConfig.texts.header}
                  onFormValueChange={onFormValueChange}
                  description={"Enter your details to access your account"}
                  headingStyle={{ textAlign: "left", fontSize: "32px", fontWeight: "600", marginBottom: "8px" }}
                  className="employee-login-form"
                  buttonStyle={{
                    maxWidth: "100%",
                    width: "100%",
                    backgroundColor: "#5243E9",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                />
                {showOTP && (
                  <OtpInput
                    otp={otp}
                    onOtpChange={setOtp}
                    onVerifyOtp={onVerifyOtp}
                    onResendOtp={resendOtp}
                    canSubmit={canSubmit}
                    isOtpValid={isOtpValid}
                  />
                )}
              </React.Fragment>
            ) : (
              <div className="employee-forgot-password-content">
                <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "16px", color: "#0b0c0c" }}>Forgot Password?</h2>
                <p style={{ fontSize: "16px", color: "#686677", lineHeight: "1.5" }}>
                  Please contact your system administrator to reset your password.
                </p>
              </div>
            )}
          </div>

          <div className="employee-login-footer">
            <span style={{ cursor: "pointer" }} onClick={() => window.open("https://www.digit.org/", "_blank")}>
              Powered by DIGIT
            </span>
            <span style={{ margin: "0 8px" }}>|</span>
            <a href="#" target="_blank" rel="noreferrer">
              UPYOG License
            </a>
            <span style={{ margin: "0 8px" }}>|</span>
            <span>Copyright © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      {showToast && <Toast error={true} label={t(showToast)} onClose={closeToast} isDleteBtn={true} />}
    </Background>
  );
};

Login.propTypes = {
  loginParams: PropTypes.any,
};

Login.defaultProps = {
  loginParams: null,
};

export default Login;
