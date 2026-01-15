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
import { PrivateRoute } from "@mseva/digit-ui-react-components";
import NavigationPage from "./NavigationPage";
import Header from "../../components/Header";
import FAQ from "../../FAQ";
import Footer from "../../components/Footer";
import EmployeeServices from "../../components/EmployeeServices";
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
    Digit.UserService.setType("employee");
  }, []);
  sourceUrl = "https://s3.ap-south-1.amazonaws.com/egov-qa-assets";
  const pdfUrl = "https://pg-egov-assets.s3.ap-south-1.amazonaws.com/Upyog+Code+and+Copyright+License_v1.pdf";
  const displayHeader = !window.location.href.includes("/user/language-selection");
  return (
    <div className="employee">
      <Switch>
        <Route path={`${path}/user`}>
          {isUserProfile ? (
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
          ) : (
            displayHeader && <Header />
          )}
          <div
            className={isUserProfile ? "grounded-container" : "loginContainer"}
            style={
              isUserProfile
                ? { padding: 0, paddingTop: "80px", marginLeft: mobileView ? "" : "64px" }
                : { "--banner-url": `url(${stateInfo?.bannerUrl})`, padding: "0px" }
            }
          >
            <div className="loginnn">
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
          </div>

          <div className="footer">
            {" "}
            <Footer />
          </div>
        </Route>
        <Route path={`${path}/sso/login`}>
          <NavigationPage />
        </Route>
        <Route path={`/digit-ui/faqss`}>
          <FAQ />
        </Route>
        <Route path={`${path}/services`}>
          <TopBarSideBar
            t={t}
            stateInfo={stateInfo}
            userDetails={userDetails}
            CITIZEN={CITIZEN}
            cityDetails={cityDetails}
            mobileView={mobileView}
            handleUserDropdownSelection={handleUserDropdownSelection}
            logoUrl={logoUrl}
            modules={modules}
          />
          <EmployeeServices />
        </Route>
        <Route>
          <TopBarSideBar
            t={t}
            stateInfo={stateInfo}
            userDetails={userDetails}
            CITIZEN={CITIZEN}
            cityDetails={cityDetails}
            mobileView={mobileView}
            handleUserDropdownSelection={handleUserDropdownSelection}
            logoUrl={logoUrl}
            modules={modules}
          />
          <div className={`main ${DSO ? "m-auto" : ""}`}>
            <div className="employee-app-wrapper">
              <ErrorBoundary initData={initData}>
                <AppModules stateCode={stateCode} userType="employee" modules={modules} appTenants={appTenants} />
              </ErrorBoundary>
            </div>
            {/* <div className="footerr" style={{ width: '100%', bottom: 0,backgroundColor:"white",color:"black !important"}}>
              <div style={{ display: 'flex', justifyContent: 'center', color:"color","backgroundColor":"#808080b3"  }}>
                <img style={{ cursor: "pointer", display: "inline-flex", height: '1.4em' }} alt={"Powered by DIGIT"} src={`${sourceUrl}/digit-footer.png`} onError={"this.src='./../digit-footer.png'"} onClick={() => {
                  window.open('https://www.digit.org/', '_blank').focus();
                }}></img>
                <span style={{ margin: "0 10px" }}>|</span>
                <span style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} onClick={() => { window.open('', '_blank').focus();}} >Copyright © {new Date().getFullYear()} -</span>
                <span style={{ margin: "0 10px" }}>|</span>
                <a style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} href={pdfUrl} target='_blank'>UPYOG License</a>
              </div>
            </div> */}
            <div style={{ width: "100%", position: "fixed", bottom: 0, backgroundColor: "white", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", color: "black" }}>
                <span
                  style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px", fontWeight: "400" }}
                  onClick={() => {
                    window.open("https://www.digit.org/", "_blank").focus();
                  }}
                >
                  Powered by DIGIT
                </span>
                <span style={{ margin: "0 10px", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px" }}>|</span>
                <a
                  style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px", fontWeight: "400" }}
                  href="#"
                  target="_blank"
                >
                  UPYOG License
                </a>

                <span
                  className="upyog-copyright-footer"
                  style={{ margin: "0 10px", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px" }}
                >
                  |
                </span>
                <span
                  className="upyog-copyright-footer"
                  style={{ cursor: "pointer", fontSize: window.Digit.Utils.browser.isMobile() ? "12px" : "14px", fontWeight: "400" }}
                  onClick={() => {
                    window.open("", "_blank").focus();
                  }}
                >
                  Copyright © {new Date().getFullYear()}
                </span>

                {/* <a style={{ cursor: "pointer", fontSize: "16px", fontWeight: "400"}} href="#" target='_blank'>UPYOG License</a> */}
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
