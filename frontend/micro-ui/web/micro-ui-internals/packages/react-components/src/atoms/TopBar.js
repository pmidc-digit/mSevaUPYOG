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
  console.log("ulbDetails",ulbDetails)
  const ulbName = ulbDetails ? ulbDetails?.value?.displayName+" "+ulbDetails?.value?.city?.ulbType : "";
  const ulbLogo = ulbDetails ? ulbDetails?.value?.logoId : "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/download.png";
  // const showHaburgerorBackButton = () => {
  //   if (pathname === "/digit-ui/citizen" || pathname === "/digit-ui/citizen/" || pathname === "/digit-ui/citizen/select-language") {
  //     return <Hamburger handleClick={toggleSidebar} />;
  //   } else {
  //     return <BackButton className="top-back-btn" />;
  //   }
  // };
  return (
    <div className="navbar">
      <div className="center-container back-wrapper" style={{display:"flex", justifyContent: "space-between"}}>
        <div className="hambuger-back-wrapper" style={{display:"flex", background:"#FFF", alignItems: "center", justifyContent : "center", width: "350px", maxWidth :"20vw"}}>
          {/* <Hamburger handleClick={toggleSidebar} /> */}
          {/* { {window.innerWidth <= 660  && <Hamburger handleClick={toggleSidebar} />} } */}
          {/* <a href={window.location.href.includes("citizen")?"/digit-ui/citizen":"/digit-ui/employee"}><img
            className="city"
            id="topbar-logo"
            src={"https://in-egov-assets.s3.ap-south-1.amazonaws.com/images/Upyog-logo.png" || "https://cdn.jsdelivr.net/npm/@egovernments/digit-ui-css@1.0.7/img/m_seva_white_logo.png"}
            alt="UPYOG"
          />
          </a> */}
           <div style={{color:"#000", fontSize:"16px", margin: "0% 3%"}}>
            <img src={ulbLogo} alt="Logo" id="ulb-logo" style={{width : "10px", height : "auto", margin : "0px 10px"}} />
            {/* {cityOfCitizenShownBesideLogo} */
              
              ulbName
            }
            </div>
        </div>
        
         <div className="RightMostTopBarOptions" style={{justifyContent :"center", alignItems :"center", padding: "1rem"}}>
          {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn ? changeLanguage : null}
          {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn ? (
            <div className="EventNotificationWrapper" onClick={onNotificationIconClick}>
              {notificationCountLoaded && notificationCount ? (
                <span>
                  <p>{notificationCount}</p>
                </span>
              ) : null}
              <NotificationBell />
            </div>
          ) : null}
          <h3></h3>
          <img
          className="city"
          id="topbar-logo" 
          src={"https://in-egov-assets.s3.ap-south-1.amazonaws.com/images/Upyog-logo.png" || "https://cdn.jsdelivr.net/npm/@egovernments/digit-ui-css@1.0.7/img/m_seva_white_logo.png"}
          alt="mSeva"
          style={{marginLeft:"10px"}}
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
