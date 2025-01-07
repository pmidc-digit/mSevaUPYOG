import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, Route, Switch, useLocation, useRouteMatch, useHistory } from "react-router-dom";
import { AppModules } from "../../components/AppModules";
import ErrorBoundary from "../../components/ErrorBoundaries";
import TopBarSideBar from "../../components/TopBarSideBar";
import ChangePassword from "./ChangePassword";
import ForgotPassword from "./ForgotPassword";
import LanguageSelection from "./LanguageSelection";
import EmployeeLogin from "./Login";
import UserProfile from "../citizen/Home/UserProfile";
import ErrorComponent from "../../components/ErrorComponent";
import { PrivateRoute } from "@upyog/digit-ui-react-components";
import Header from "../../components/Header";

const userScreensExempted = ["user/profile", "user/error"];

const EmployeeApp = ({
  stateInfo,
  userDetails,
  CITIZEN,
  cityDetails,
  mobileView,
  handleUserDropdownSelection,
  logoUrl,
  DSO,
  stateCode,
  modules,
  appTenants,
  sourceUrl,
  pathname,
  initData,
}) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { path } = useRouteMatch();
  const location = useLocation();
  const showLanguageChange = location?.pathname?.includes("language-selection");
  const isUserProfile = userScreensExempted.some((url) => location?.pathname?.includes(url));
  useEffect(() => {
    console.log("isMobile", window.Digit.Utils.browser.isMobile(),window.innerWidth)
    Digit.UserService.setType("employee");
  }, []);
  sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
  const pdfUrl = "https://pg-egov-assets.s3.ap-south-1.amazonaws.com/Upyog+Code+and+Copyright+License_v1.pdf"

  return (
     <div className="employee">
       <Header />
      <Switch>
        <Route path={`${path}/user`}>
          {isUserProfile && (
            <TopBarSideBar
              t={t}
              stateInfo={stateInfo}
              userDetails={userDetails}
              CITIZEN={CITIZEN}
              cityDetails={cityDetails}
              mobileView={mobileView}
              handleUserDropdownSelection={handleUserDropdownSelection}
              logoUrl={logoUrl}
              showSidebar={isUserProfile ? true : false}
              showLanguageChange={!showLanguageChange}
            />
          )}
         
      
            <div className="loginnew">
              <Switch>
                <Route path={`${path}/user/login`}>
                  <EmployeeLogin />
                </Route>
                <Route path={`${path}/user/forgot-password`}>
                  <ForgotPassword />
                </Route>
                <Route path={`${path}/user/change-password`}>
                  <ChangePassword />
                </Route>
                <PrivateRoute path={`${path}/user/profile`}>
                  <UserProfile stateCode={stateCode} userType={"employee"} cityDetails={cityDetails} />
                </PrivateRoute>
                <Route path={`${path}/user/error`}>
                  <ErrorComponent
                    initData={initData}
                    goToHome={() => {
                      history.push("/digit-ui/employee");
                    }}
                  />
                </Route>
                <Route path={`${path}/user/language-selection`}>
                  <LanguageSelection />
                </Route>
                <Route>
                  <Redirect to={`${path}/user/language-selection`} />
                </Route>
              </Switch>
            
            </div>
            <div className="footerLinks" ></div>
            <div className="footerContainer">
            <div className="footer">
              <div className="footerText">
                <span style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px", fontWeight: "400"}} onClick={() => { window.open('https://www.digit.org/', '_blank').focus();}} >Powered by DIGIT</span>
                <span style={{ margin: "0 10px" ,fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px"}}>|</span>
                <a style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a>

                <span  className="upyog-copyright-footer" style={{ margin: "0 10px",fontSize:"12px" }} >|</span>
                <span  className="upyog-copyright-footer" style={{ cursor: "pointer",fontSize: window.Digit.Utils.browser.isMobile()?"12px":"12px", fontWeight: "400"}} onClick={() => { window.open('https://niua.in/', '_blank').focus();}} >Copyright © 2022 National Institute of Urban Affairs</span>
                
                <a style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a>

              </div>
              <div className="upyog-copyright-footer-web">
                <span className="" style={{ cursor: "pointer", fontSize:  window.Digit.Utils.browser.isMobile()?"14px":"16px", fontWeight: "400"}} onClick={() => { window.open('https://niua.in/', '_blank').focus();}} >Copyright © 2022 National Institute of Urban Affairs</span>
                </div>
            </div>
            </div>
        </Route>
       
        <Route>
          <Redirect to={`${path}/user/language-selection`} />
        </Route>
      </Switch>
    </div>
  );
};

export default EmployeeApp;