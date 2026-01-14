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
  const [userToken, setUserToken] = useState(null);
  
  // Use useEffect to read session storage and re-render when it changes
  useEffect(() => {
    const checkUserToken = () => {
      try {
        const token = JSON.parse(sessionStorage.getItem("Digit.User"));
        setUserToken(token);
      } catch (e) {
        setUserToken(null);
      }
    };
    
    // Check immediately
    checkUserToken();
    
    // Also check on storage events and with a small delay for post-login
    const handleStorageChange = () => checkUserToken();
    window.addEventListener('storage', handleStorageChange);
    
    // Re-check after a short delay to catch post-login updates
    const timeoutId = setTimeout(checkUserToken, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(timeoutId);
    };
  }, [pathname]); // Re-check when pathname changes
  
  const ulbDetails = sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY") ? JSON.parse(sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY")) : "";
  const ulbName = ulbDetails ? ulbDetails?.value?.displayName+" "+ulbDetails?.value?.city?.ulbType : "";
  const ulbLogo = ulbDetails ? ulbDetails?.value?.logoId : "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/download.png";
  
  // Show hamburger if user is logged in (has token) OR if userDetails prop indicates logged in
  const isLoggedIn = userToken?.value?.token || userDetails?.access_token;
  console.log("TopBar Debug:", { isLoggedIn, userToken: userToken?.value?.token, userDetailsToken: userDetails?.access_token, pathname });
  
  return (
     <div className="navbar" style={{padding : "1rem 1.5rem"}}>
      <div className="center-container_navbar" style={{}}>
        <div className="left-wrapper_navbar" style={{}}>
          {isLoggedIn && <Hamburger handleClick={toggleSidebar} />}
          <div className="ulb-info" style={{display:"flex", gap:"10px",marginLeft : "1rem"}}>
            <img src={ulbLogo} alt="ULB Logo" className="ulb-logo" style={{minWidth : "25px", height : "25px"}} />
           <span className="ulb-name" style={isMobile ? {display:"flex", justifyContent:"center", alignItems:"center", fontSize: "12px", whiteSpace: "nowrap", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis"} : {}}>{ulbName}</span>
          </div>
        </div>

        <div className="right-wrapper_navbar" style={{ paddingRight: "0.5rem" }}>
          {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn && changeLanguage}
          {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn && (
            <div className="notification-wrapper" onClick={onNotificationIconClick}>
              {notificationCountLoaded && notificationCount ? (
                <span className="notification-count">{notificationCount}</span>
              ) : null}
              <NotificationBell />
            </div>
          )}
          {/* <img
            src={
              'https://in-egov-assets.s3.ap-south-1.amazonaws.com/images/Upyog-logo.png' ||
              'https://cdn.jsdelivr.net/npm/@egovernments/digit-ui-css@1.0.7/img/m_seva_white_logo.png'
            }
            alt="mSeva"
            className="upyog-logo"
          /> */}
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