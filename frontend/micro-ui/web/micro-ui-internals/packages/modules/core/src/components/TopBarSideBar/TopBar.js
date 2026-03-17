import { Dropdown, Hamburger, NotificationBell, TopBar as TopBarComponent } from "@mseva/digit-ui-react-components";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import ChangeCity from "../ChangeCity";
import ChangeLanguage from "../ChangeLanguage";

const TextToImg = (props) => (
  <span className="user-img-txt" onClick={props.toggleMenu} title={props.name}>
    {props?.name?.[0]?.toUpperCase()}
  </span>
);


const TopBar = ({
  t,
  stateInfo,
  toggleSidebar,
  isSidebarOpen,
  handleLogout,
  userDetails,
  CITIZEN,
  cityDetails,
  mobileView,
  userOptions,
  handleUserDropdownSelection,
  logoUrl,
  showLanguageChange = true,
  setSideBarScrollTop,
}) => {
  const [profilePic, setProfilePic] = React.useState(null)

  React.useEffect(async () => {
    const tenant = Digit.ULBService.getCurrentTenantId()
    const uuid = userDetails?.info?.uuid
    if (uuid) {
      const usersResponse = await Digit.UserService.userSearch(tenant, { uuid: [uuid] }, {})
      if (usersResponse && usersResponse.user && usersResponse.user.length) {
        const userDetails = usersResponse.user[0]
         sessionStorage.setItem("userInfoData", JSON.stringify(userDetails));
        const thumbs = userDetails?.photo?.split(",")
        setProfilePic(thumbs?.at(0))
      }
    }
  }, [profilePic !== null, userDetails?.info?.uuid])

  const CitizenHomePageTenantId = Digit.ULBService.getCitizenCurrentTenant(true)

  const history = useHistory()
  const { pathname } = useLocation()

  const topbarStyle = mobileView
    ? {
        display: "flex",
        alignItems: "center",
        padding: "10px 12px",
        gap: "12px",
        background: "linear-gradient(90deg, rgba(255,255,255,0.98), rgba(250,255,250,0.98))",
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
        backdropFilter: "blur(6px)",
      }
    : {
        display: "flex",
        alignItems: "center",
        padding: "12px 24px",
        gap: "16px",
        background: "linear-gradient(90deg, rgba(255,255,255,0.98), rgba(250,255,250,0.98))",
        boxShadow: "0 8px 26px rgba(15, 23, 42, 0.06)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
        backdropFilter: "blur(6px)",

      }

  const conditionsToDisableNotificationCountTrigger = () => {
    if (Digit.UserService?.getUser()?.info?.type === "EMPLOYEE") return false
    if (Digit.UserService?.getUser()?.info?.type === "CITIZEN") {
      if (!CitizenHomePageTenantId) return false
      else return true
    }
    return false
  }

  const {
    data: { unreadCount: unreadNotificationCount } = {},
    isSuccess: notificationCountLoaded,
  } = Digit.Hooks.useNotificationCount({
    tenantId: CitizenHomePageTenantId,
    config: {
      enabled: conditionsToDisableNotificationCountTrigger(),
    },
  })

  const updateSidebar = () => {
    if (!Digit.clikOusideFired) {
      toggleSidebar(true)
      setSideBarScrollTop(true)
    } else {
      Digit.clikOusideFired = false
    }
  }

  function onNotificationIconClick() {
    history.push("/digit-ui/citizen/engagement/notifications")
  }

  const urlsToDisableNotificationIcon = (pathname) =>
    !!Digit.UserService?.getUser()?.access_token
      ? false
      : ["/digit-ui/citizen/select-language", "/digit-ui/citizen/select-location"].includes(pathname)

  // Get ULB details for citizen navbar
  const ulbDetails = typeof window !== 'undefined' && sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY") 
    ? JSON.parse(sessionStorage.getItem("Digit.CITIZEN.COMMON.HOME.CITY")) 
    : "";
  const ulbName = ulbDetails ? ulbDetails?.value?.displayName + " " + ulbDetails?.value?.city?.ulbType : "";
  const ulbLogo = ulbDetails 
    ? ulbDetails?.value?.logoId 
    : "https://raw.githubusercontent.com/anujkit/msevaImages/refs/heads/main/download.png";
  
  // Check if user is logged in using userDetails prop (more reliable than sessionStorage)
  const isLoggedIn = !!userDetails?.access_token;

  if (CITIZEN) {
    return (
      <div className="navbar" style={{padding : "1rem 1.5rem"}}>
        <div className="center-container_navbar" style={{}}>
          <div className="left-wrapper_navbar" style={{}}>
            {isLoggedIn && <Hamburger handleClick={updateSidebar} />}
            <div className="ulb-info" style={{display:"flex", gap:"10px",marginLeft : "1rem"}}>
              <img src={ulbLogo} alt="ULB Logo" className="ulb-logo" style={{minWidth : "25px", height : "25px"}} />
              <span className="ulb-name" style={mobileView ? {display:"flex", justifyContent:"center", alignItems:"center", fontSize: "12px", whiteSpace: "nowrap", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis"} : {}}>{ulbName}</span>
            </div>
          </div>

          <div className="right-wrapper_navbar" style={{}}>
            {!urlsToDisableNotificationIcon(pathname) && !mobileView && <div style={{marginTop: "20px"}}>
              {/* <ChangeLanguage dropdown={true} /> */}
            </div>}
            {!urlsToDisableNotificationIcon(pathname) && (
              <div className="notification-wrapper" onClick={onNotificationIconClick}>
                {notificationCountLoaded && unreadNotificationCount ? (
                  <span className="notification-count">{unreadNotificationCount < 99 ? unreadNotificationCount : 99}</span>
                ) : null}
                <NotificationBell />
              </div>
            )}
            {/* <img
              src={'https://in-egov-assets.s3.ap-south-1.amazonaws.com/images/Upyog-logo.png'}
              alt="mSeva"
              className="upyog-logo"
            /> */}
          </div>
        </div>
      </div>
    )
  }
  const loggedin = userDetails?.access_token ? true : false
  return (
    <div className="topbar" style={topbarStyle}>
      {mobileView ? <Hamburger handleClick={toggleSidebar} color="#9E9E9E" /> : null}
      <img className="city" src="https://in-egov-assets.s3.ap-south-1.amazonaws.com/images/Upyog-logo.png" />
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        {loggedin &&
          (cityDetails?.city?.ulbGrade ? (
            <p className="ulb" style={mobileView ? { fontSize: "14px", display: "inline-block" } : {}}>
              {t(cityDetails?.i18nKey).toUpperCase()}{" "}
              {t(
                `ULBGRADE_${cityDetails?.city?.ulbGrade.toUpperCase().replace(" ", "_").replace(".", "_")}`,
              ).toUpperCase()}
            </p>
          ) : (
            <img className="state" src={logoUrl || "/placeholder.svg"} />
          ))}
        {!loggedin && (
          <p className="ulb" style={mobileView ? { fontSize: "14px", display: "inline-block" } : {}}>
            {t(`MYCITY_${stateInfo?.code?.toUpperCase()}_LABEL`)} {t(`MYCITY_STATECODE_LABEL`)}
          </p>
        )}
        {!mobileView && (
          <div
            className={mobileView ? "right" : "flex-right right w-80 column-gap-15 margin-right-50"}
            style={!loggedin ? { width: "80%" } : {}}
          >
            <div className="left">
              {!window.location.href.includes("employee/user/login") &&
                !window.location.href.includes("employee/user/language-selection") && (
                  <ChangeCity dropdown={true} t={t} />
                )}
            </div>
            {/* <div className="left">{showLanguageChange && <ChangeLanguage dropdown={true} />}</div> */}
           
            {userDetails?.access_token && (
              <div className="left">
                <Dropdown
                  option={userOptions}
                  optionKey={"name"}
                  select={handleUserDropdownSelection}
                  showArrow={true}
                  freeze={true}
                  style={mobileView ? { right: 0} : {}}
                  optionCardStyles={{ overflow: "revert", left:"-56px"   }}
                  customSelector={
                    profilePic == null ? (
                      <TextToImg name={userDetails?.info?.name || userDetails?.info?.userInfo?.name || "Employee"} />
                    ) : (
                      <img
                        src={profilePic || "/placeholder.svg"}
                        style={{ height: "48px", width: "48px", borderRadius: "50%" }}
                      />
                    )
                  }
                />
              </div>
            )}
            <div className="left"></div>
          </div>
        )}
      </span>
    </div>
  )
}

export default TopBar;
