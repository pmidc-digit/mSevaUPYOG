import { BackButton, Dropdown, Loader, Toast } from "@upyog/digit-ui-react-components";
import { FormComposer } from "../../../../../../react-components/src/hoc/FormComposer";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Background from "../../../components/Background";
import Header from "../../../components/Header";

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

  const history = useHistory();
  // const getUserType = () => "EMPLOYEE" || Digit.UserService.getType();
  let   sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
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

    /* logic to redirect back to same screen where we left off  */
    if (window?.location?.href?.includes("from=")) {
      redirectPath = decodeURIComponent(window?.location?.href?.split("from=")?.[1]) || "/digit-ui/employee";
    }

    /*  RAIN-6489 Logic to navigate to National DSS home incase user has only one role [NATADMIN]*/
    if (user?.info?.roles && user?.info?.roles?.length > 0 &&  user?.info?.roles?.every((e) => e.code === "NATADMIN")) {
      redirectPath = "/digit-ui/employee/dss/landing/NURT_DASHBOARD";
    }
    /*  RAIN-6489 Logic to navigate to National DSS home incase user has only one role [NATADMIN]*/
    if (user?.info?.roles && user?.info?.roles?.length > 0 && user?.info?.roles?.every((e) => e.code === "STADMIN")) {
      redirectPath = "/digit-ui/employee/dss/landing/home";
    }

    history.replace(redirectPath);
  }, [user]);

  const onLogin = async (data) => {
    if (!data.city) {
      alert("Please Select City!");
      return;
    }
    setDisable(true);

    const requestData = {
      ...data,
      userType: "EMPLOYEE",
    };
    requestData.tenantId = data.city.code;
    delete requestData.city;
    try {
      const { UserRequest: info, ...tokens } = await Digit.UserService.authenticate(requestData);
      Digit.SessionStorage.set("Employee.tenantId", info?.tenantId);
      setUser({ info, ...tokens });
    } catch (err) {
      setShowToast(err?.response?.data?.error_description || "Invalid login credentials!");
      setTimeout(closeToast, 5000);
    }
    setDisable(false);
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const onForgotPassword = () => {
    sessionStorage.getItem("User") && sessionStorage.removeItem("User")
    history.push("/digit-ui/employee/user/forgot-password");
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
        {
          label: t(city.label),
          type: city.type,
          populators: {
            name: city.name,
            customProps: {},
            component: (props, customProps) => (
              <Dropdown
                option={cities}
               // className="login-city-dd"
               className="cityCss"
                optionKey="i18nKey"
                select={(d) => {
                  props.onChange(d);
                }}
                t={t}
                {...customProps}
              />
            ),
          },
          isMandatory: true,
        },
      ],
    },
  ];

  return isLoading || isStoreLoading ? (
    <Loader />
  ) : (
    <Background>
      {/* <div className="employeeBackbuttonAlign">
        <BackButton variant="white" style={{ borderBottom: "none" }} />
      </div> */}

      <FormComposer
        onSubmit={onLogin}
        isDisabled={isDisabled || disable}
        noBoxShadow
        inline
        submitInForm
        config={config}
        label={propsConfig.texts.submitButtonLabel}
        secondaryActionLabel={propsConfig.texts.secondaryButtonLabel}
        onSecondayActionClick={onForgotPassword}
        heading={propsConfig.texts.header}
        description={"Login to access your account"}
        headingStyle={{ textAlign: "center" }}
        //cardStyle={{ margin: "auto", minWidth: "408px" }}
        //cardStyle={{ margin: "auto", minWidth: "738px" ,paddingTop:'56px',paddingBottom:'56px'}}
        className="loginFormStyleEmployeeNew"
       // className='box-border h-32 w-300 p-4 border-4 z-index-4 justify-center'
        buttonStyle={{ maxWidth: "100%", width: "100%" ,backgroundColor:"#2947A3"}}
      >
        {/* <Header /> */}
      </FormComposer>
      {showToast && <Toast error={true} label={t(showToast)} onClose={closeToast} />}
    
    
      <div style={{ width: '100%', position: 'fixed', bottom: 0,backgroundColor:"#152265",textAlign:"center" }}>
      <div style={{backgroundColor:'#F5FBFF', width:'100%',minHeight:'100px'}}></div>
      <div style={{backgroundColor:'#294A97', width:'100%',minHeight:'200px'}}>
   </div>
        <div style={{ display: 'flex', justifyContent: 'center', color:"white" }}>
          <span style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px", fontWeight: "400"}} onClick={() => { window.open('https://www.digit.org/', '_blank').focus();}} >Powered by DIGIT</span>
          <span style={{ margin: "0 10px" ,fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px"}}>|</span>
          <a style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a>

          <span  className="upyog-copyright-footer" style={{ margin: "0 10px",fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px" }} >|</span>
          <span  className="upyog-copyright-footer" style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"14px", fontWeight: "400"}} onClick={() => { window.open('https://niua.in/', '_blank').focus();}} >Copyright © 2022 National Institute of Urban Affairs</span>
          
          {/* <a style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a> */}
        </div>
        <div className="upyog-copyright-footer-web">
          <span className="" style={{ cursor: "pointer", fontSize:  window.Digit.Utils.browser.isMobile()?"12px":"14px", fontWeight: "400"}} onClick={() => { window.open('https://niua.in/', '_blank').focus();}} >Copyright © 2022 National Institute of Urban Affairs</span>
          </div>
       
      </div>
 
    {/* .  <div className="footerCont">
      <div className="footer">
        <div className="footerText">
          <span style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px", fontWeight: "400"}} onClick={() => { window.open('https://www.digit.org/', '_blank').focus();}} >Powered by DIGIT</span>
          <span style={{ margin: "0 10px" ,fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px"}}>|</span>
          <a style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a>

          <span  className="upyog-copyright-footer" style={{ margin: "0 10px",fontSize:"12px" }} >|</span>
          <span  className="upyog-copyright-footer" style={{ cursor: "pointer", border:'2px solid yellow',fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px", fontWeight: "400"}} onClick={() => { window.open('https://niua.in/', '_blank').focus();}} >Copyright © 2022 National Institute of Urban Affairs</span>
          
           <a style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a>

        </div>
        <div className="upyog-copyright-footer-web">
          <span className="" style={{ cursor: "pointer", fontSize:  window.Digit.Utils.browser.isMobile()?"14px":"16px", fontWeight: "400"}} onClick={() => { window.open('https://niua.in/', '_blank').focus();}} >Copyright © 2022 National Institute of Urban Affairs</span>
          </div>
      </div>
      </div> */}


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