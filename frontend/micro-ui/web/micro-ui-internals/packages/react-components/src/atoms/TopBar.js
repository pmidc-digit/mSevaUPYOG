import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Hamburger from "./Hamburger";
import { NotificationBell } from "./svgindex";
import { useLocation } from "react-router-dom";
import BackButton from "./BackButton";

const TopBar = ({
  img,
  isMobile,
  logoUrl,
  onLogout,
  toggleSidebar,
  ulb,
  userDetails,
  notificationCount,
  notificationCountLoaded,
  cityOfCitizenShownBesideLogo,
  onNotificationIconClick,
  hideNotificationIconOnSomeUrlsWhenNotLoggedIn,
  changeLanguage,
}) => {
  const { pathname } = useLocation();
  const ulbDetails = sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY") ? JSON.parse(sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY")) : "";
  //console.log("ulbDetails",ulbDetails)
  const ulbName = ulbDetails ? ulbDetails?.value?.displayName+" "+ulbDetails?.value?.city?.ulbType : "";
  const ulbLogo = ulbDetails ? ulbDetails?.value?.logoId : "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/download.png";
  const userToken = JSON.parse(sessionStorage.getItem("Digit.User"))
    console.log("userToken",userToken?.value?.token)
  // const showHaburgerorBackButton = () => {
  //   if (pathname === "/digit-ui/citizen" || pathname === "/digit-ui/citizen/" || pathname === "/digit-ui/citizen/select-language") {
  //     return <Hamburger handleClick={toggleSidebar} />;
  //   } else {
  //     return <BackButton className="top-back-btn" />;
  //   }
  // };
  //const [isMobile, setIsMobile] = useState(window.innerWidth <= 660);
 
  return (
     <div className="navbar" style={{padding : "1rem 0rem"}}>
      <div className="center-container_navbar" style={{}}>
        <div className="left-wrapper_navbar" style={{}}>
          {(userToken?.value?.token) === null ? "" : <Hamburger handleClick={toggleSidebar} />   }
          <div className="ulb-info" style={{marginLeft : "1rem"}}>
            <img src={ulbLogo} alt="ULB Logo" className="ulb-logo" style={{minWidth : "25px", height : "25px"}} />
            <span className="ulb-name">{ulbName}</span>
          </div>
        </div>

        <div className="right-wrapper_navbar" style={{}}>
          {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn && changeLanguage}
          {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn && (
            <div className="notification-wrapper" onClick={onNotificationIconClick}>
              {notificationCountLoaded && notificationCount ? (
                <span className="notification-count">{notificationCount}</span>
              ) : null}
              <NotificationBell />
            </div>
          )}
          <img
            src={
              'https://in-egov-assets.s3.ap-south-1.amazonaws.com/images/Upyog-logo.png' ||
              'https://cdn.jsdelivr.net/npm/@egovernments/digit-ui-css@1.0.7/img/m_seva_white_logo.png'
            }
            alt="mSeva"
            className="upyog-logo"
          />
        </div>
      </div>
    </div>
  );
};

TopBar.propTypes = {
  img: PropTypes.string,
};

TopBar.defaultProps = {
  img: undefined,
};

export default TopBar;