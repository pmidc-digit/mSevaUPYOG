import React from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@mseva/digit-ui-react-components";
import { Redirect, Route, Switch, useLocation, useRouteMatch, useHistory } from "react-router-dom";
const Header = () => {
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { path } = useRouteMatch();
  const { stateInfo } = storeData || {};
  const { t } = useTranslation();
  console.log("header path", path);
  if (isLoading) return <Loader />;

  return (
    <div className="employee-header-bannerHeader">
    
      {/* <div className="employee-header-appbar">
        <div className="employee-header-appbar-container">
          <div className="employee-header-appbar-box-left">Government of India</div>
          <div className="employee-header-appbar-box-right">
            <a href="#main-content">Skip to Main Content</a>
          </div>
        </div>
      </div> */}

     
      {/* <div className="employee-header-topHeader">
        <div className="employee-header-topHeader-container">
         
          <div className="employee-header-topHeader-box-left">
            <img
              src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/pmidc%20logo.png"
              alt="PMIDC Logo"
              className="employee-header-header-logo"
            />
            <img
              src="https://filesuploadbucket1aws.s3.amazonaws.com/tcp-haryana/Upyog-logo.png"
              alt="UPYOG Logo"
              className="employee-header-header-logo"
            />
          </div>

         
          <div className="employee-header-topHeader-box-center">
            <nav className="employee-header-header-nav">
              <ul>
                <li>
                  <a href="/">HOME</a>
                </li>
                <li>
                  <a href="/quick-pay">QUICK PAY</a>
                </li>
                <li>
                  <a href="/faq">FAQ</a>
                </li>
                <li>
                  <a href="/contact">CONTACT</a>
                </li>
              </ul>
            </nav>
          </div>

         
          <div className="employee-header-topHeader-box-right">
            <button className="employee-header-header-btn employee-header-header-btn-login" onClick={() => history.push("/login")}>
              Login
            </button>
            <button className="employee-header-header-btn employee-header-header-btn-register" onClick={() => history.push("/register")}>
              Register
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Header;
