// import React, { useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import Hamburger from "./Hamburger";
// import { NotificationBell } from "./svgindex";
// import { useLocation } from "react-router-dom";
// import BackButton from "./BackButton";

// const TopBar = ({
//   img,
//   isMobile,
//   logoUrl,
//   onLogout,
//   toggleSidebar,
//   ulb,
//   userDetails,
//   notificationCount,
//   notificationCountLoaded,
//   cityOfCitizenShownBesideLogo,
//   onNotificationIconClick,
//   hideNotificationIconOnSomeUrlsWhenNotLoggedIn,
//   changeLanguage,
// }) => {
//   const { pathname } = useLocation();
//   const ulbDetails = sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY") ? JSON.parse(sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY")) : "";
//   //console.log("ulbDetails",ulbDetails)
//   const ulbName = ulbDetails ? ulbDetails?.value?.displayName+" "+ulbDetails?.value?.city?.ulbType : "";
//   const ulbLogo = ulbDetails ? ulbDetails?.value?.logoId : "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/download.png";
//   const userToken = JSON.parse(sessionStorage.getItem("Digit.User"))
//     console.log("userToken",userToken?.value?.token)
//   // const showHaburgerorBackButton = () => {
//   //   if (pathname === "/digit-ui/citizen" || pathname === "/digit-ui/citizen/" || pathname === "/digit-ui/citizen/select-language") {
//   //     return <Hamburger handleClick={toggleSidebar} />;
//   //   } else {
//   //     return <BackButton className="top-back-btn" />;
//   //   }
//   // };
//   //const [isMobile, setIsMobile] = useState(window.innerWidth <= 660);
 
//   return (
//      <div className="navbar" style={{padding : "1rem 0rem"}}>
//       <div className="center-container_navbar" style={{}}>
//         <div className="left-wrapper_navbar" style={{}}>
//           {(userToken?.value?.token) === null ? "" : <Hamburger handleClick={toggleSidebar} />   }
//           <div className="ulb-info" style={{marginLeft : "1rem"}}>
//             <img src={ulbLogo} alt="ULB Logo" className="ulb-logo" style={{minWidth : "25px", height : "25px"}} />
//             <span className="ulb-name">{ulbName}</span>
//           </div>
//         </div>

//         <div className="right-wrapper_navbar" style={{}}>
//           {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn && changeLanguage}
//           {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn && (
//             <div className="notification-wrapper" onClick={onNotificationIconClick}>
//               {notificationCountLoaded && notificationCount ? (
//                 <span className="notification-count">{notificationCount}</span>
//               ) : null}
//               <NotificationBell />
//             </div>
//           )}
//           <img
//             src={
//               'https://in-egov-assets.s3.ap-south-1.amazonaws.com/images/Upyog-logo.png' ||
//               'https://cdn.jsdelivr.net/npm/@egovernments/digit-ui-css@1.0.7/img/m_seva_white_logo.png'
//             }
//             alt="mSeva"
//             className="upyog-logo"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// TopBar.propTypes = {
//   img: PropTypes.string,
// };

// TopBar.defaultProps = {
//   img: undefined,
// };

// export default TopBar;





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
  const { pathname } = useLocation()
  const ulbDetails = sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY")
    ? JSON.parse(sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY"))
    : ""
  const ulbName = ulbDetails ? ulbDetails?.value?.displayName + " " + ulbDetails?.value?.city?.ulbType : ""
  const ulbLogo = ulbDetails
    ? ulbDetails?.value?.logoId
    : "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/download.png"
  const userToken = JSON.parse(sessionStorage.getItem("Digit.User"))

  return (
    <div
      className="navbar"
      style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        className="center-container_navbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          className="left-wrapper_navbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {userToken?.value?.token && (
            <div style={{ marginRight: "0.5rem" }}>
              <Hamburger handleClick={toggleSidebar} />
            </div>
          )}
          <div
            className="ulb-info"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <img
              src={ulbLogo || "/placeholder.svg"}
              alt="ULB Logo"
              className="ulb-logo"
              style={{
                minWidth: "32px",
                width: "32px",
                height: "32px",
                borderRadius: "4px",
                objectFit: "contain",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                className="ulb-name"
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  lineHeight: "1.2",
                }}
              >
                {ulbName}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  lineHeight: "1",
                }}
              >
                mSeva Punjab Portal
              </span>
            </div>
          </div>
        </div>
        <div
          className="right-wrapper_navbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {!hideNotificationIconOnSomeUrlsWhenNotLoggedIn && (
            <React.Fragment>
              <div style={{ position: "relative" }}>{changeLanguage}</div>
              {/* <div
                className="notification-wrapper"
                onClick={onNotificationIconClick}
                style={{
                  position: "relative",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                {notificationCountLoaded && notificationCount ? (
                  <span
                    className="notification-count"
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      backgroundColor: "#ef4444",
                      color: "#ffffff",
                      borderRadius: "50%",
                      padding: "0.125rem 0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      minWidth: "1.25rem",
                      height: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {notificationCount}
                  </span>
                ) : null}
                <NotificationBell />
              </div> */}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  )
}

TopBar.propTypes = {
  img: PropTypes.string,
};

TopBar.defaultProps = {
  img: undefined,
};

export default TopBar;