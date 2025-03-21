import React from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@mseva/digit-ui-react-components"
import { Redirect, Route, Switch, useLocation, useRouteMatch, useHistory } from "react-router-dom";
const Header = () => {
  const { data: storeData, isLoading } = Digit.Hooks.useStore.getInitData();
  const { path } = useRouteMatch();
  const { stateInfo } = storeData || {};
  const { t } = useTranslation()
 console.log("header path",path)
  if (isLoading) return <Loader/>;

  return (
    <div className="bannerHeader">
      <div className="appbar">
        <div className="appbar-container">
          <div className="appbar-box-left">Government of India</div>
          <div className="appbar-box-right">
            <span>Skip to Main Content</span>
          </div>
        </div>
      </div>
      <div className="topHeader">
        <div className="topHeader-container">
          <div className="topHeader-box-left">
            <img
              src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/pmidc%20logo.png"
              alt="pmidcLogo"
            />
            <img
              src="https://filesuploadbucket1aws.s3.amazonaws.com/tcp-haryana/Upyog-logo.png"
              alt="upyogLogo"
            />
          </div>
          <div className="topHeader-box-center">
            <ul>
              <li>
                <a href="https://mseva-uat.lgpunjab.gov.in/digit-ui/landing-page">
                  HOME
                </a>
              </li>
              <li>
                <a href="https://mseva-uat.lgpunjab.gov.in/digit-ui/landing-page">
                  QUICK PAY
                </a>
              </li>

              <li>
                <a href="https://mseva-uat.lgpunjab.gov.in/digit-ui/landing-page">
                  FAQ
                </a>
              </li>
              <li>
                <a href="https://mseva-uat.lgpunjab.gov.in/digit-ui/landing-page">
                  CONTACT
                </a>
              </li>
            </ul>
          </div>
          <div className="topHeader-box-right">
            <button>Login</button>
            <button>Register</button>
          </div>
        </div>
      </div>
      <div className="heroSection">
        <img
          src="https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/1cace0150346b2e2f5989aaaf63b8e26.jpeg"
          alt="banner Image"
        />
      </div>
    </div>
  );
}

export default Header;