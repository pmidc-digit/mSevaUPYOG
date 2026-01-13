import React, { useEffect, useState } from "react";
import {
  HomeIcon,
  EditPencilIcon,
  LogoutIcon,
  Loader,
  AddressBookIcon,
  PropertyHouse,
  CaseIcon,
  CollectionIcon,
  PTIcon,
  OBPSIcon,
  PGRIcon,
  FSMIcon,
  WSICon,
  MCollectIcon,
  Phone,
  BirthIcon,
  DeathIcon,
  FirenocIcon,
  LoginIcon,
} from "@mseva/digit-ui-react-components";
import { Link, useLocation } from "react-router-dom";
import SideBarMenu from "../../../config/sidebar-menu";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import LogoutDialog from "../../Dialog/LogoutDialog";
import ChangeCity from "../../ChangeCity";
import SidebarProfile from "./SidebarProfile";

const defaultImage =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";
/* 
Feature :: Citizen Webview sidebar
*/
// const Profile = ({ info, stateName, t }) => (
//   <div className="profile-section">
//     <div className="imageloader imageloader-loaded">
//       <img className="img-responsive img-circle img-Profile" src={info?.photo ? info?. photo : defaultImage} />
//     </div>
//     <div id="profile-name" className="label-container name-Profile">
//       <div className="label-text"> {info?.name} </div>
//     </div>
//     <div id="profile-location" className="label-container loc-Profile">
//       <div className="label-text"> {info?.mobileNumber} </div>
//     </div>
//     {info?.emailId && (
//       <div id="profile-emailid" className="label-container loc-Profile">
//         <div className="label-text"> {info.emailId} </div>
//       </div>
//     )}
//     <div className="profile-divider"></div>
//     {window.location.href.includes("/employee") &&
//       !window.location.href.includes("/employee/user/login") &&
//       !window.location.href.includes("employee/user/language-selection") && <ChangeCity t={t} mobileView={true} />}
//   </div>
// );

const Profile = ({ info, stateName, t }) => {
  const [profilePic, setProfilePic] = React.useState(info?.photo || null);
  const [email, setEmail] = React.useState(info?.emailId || null);

  React.useEffect(() => {
    const fetchProfileDetails = async () => {
      const tenant = Digit.ULBService.getCurrentTenantId();
      const uuid = info?.uuid;
      if (uuid) {
        const usersResponse = await Digit.UserService.userSearch(tenant, { uuid: [uuid] }, {});
        if (usersResponse?.user?.length) {
          const userDetails = usersResponse.user[0];
          setProfilePic(userDetails?.photo || null);
          setEmail(userDetails?.emailId || null);
        }
      }
    };

    fetchProfileDetails();
  }, [info?.uuid]);

  return (
    <div className="profile-section">
      <div className="imageloader imageloader-loaded">
        <img
          className="img-responsive img-circle img-Profile"
          src={profilePic || defaultImage}
          alt="Profile"
          style={{ objectFit: "contain", objectPosition: "center" }}
          onError={(e) => (e.currentTarget.src = defaultImage)}
        />
      </div>
      <div id="profile-name" className="label-container name-Profile">
        <div className="label-text">{info?.name}</div>
      </div>
      <div id="profile-location" className="label-container loc-Profile">
        <div className="label-text">{info?.mobileNumber}</div>
      </div>
      {email && (
        <div id="profile-emailid" className="label-container loc-Profile">
          <div className="label-text">{email}</div>
        </div>
      )}
      <div className="profile-divider"></div>
      {window.location.href.includes("/employee") &&
        !window.location.href.includes("/employee/user/login") &&
        !window.location.href.includes("employee/user/language-selection") && <ChangeCity t={t} mobileView={true} />}
    </div>
  );
};

const IconsObject = {
  CommonPTIcon: <PTIcon className="icon" />,
  OBPSIcon: <OBPSIcon className="icon" />,
  propertyIcon: <PropertyHouse className="icon" />,
  TLIcon: <CaseIcon className="icon" />,
  PGRIcon: <PGRIcon className="icon" />,
  FSMIcon: <FSMIcon className="icon" />,
  WSIcon: <WSICon className="icon" />,
  MCollectIcon: <MCollectIcon className="icon" />,
  BillsIcon: <CollectionIcon className="icon" />,
  BirthIcon: <BirthIcon className="icon" />,
  DeathIcon: <DeathIcon className="icon" />,
  FirenocIcon: <FirenocIcon className="icon" />,
  HomeIcon: <HomeIcon className="icon" />,
  EditPencilIcon: <EditPencilIcon className="icon" />,
  LogoutIcon: <LogoutIcon className="icon" />,
  Phone: <Phone className="icon" />,
  LoginIcon: <LoginIcon className="icon" />,
};
const StaticCitizenSideBar = ({ linkData, islinkDataLoading }) => {
  const { t } = useTranslation()
  const history = useHistory()
  const location = useLocation()
  const { pathname } = location
  const { data: storeData, isFetched } = Digit.Hooks.useStore.getInitData()
  const { stateInfo } = storeData || {}
  const user = Digit.UserService.getUser()
  const isMobile = window.Digit.Utils.browser.isMobile()
  const [isEmployee, setisEmployee] = useState(false)
  const [isSidebarOpen, toggleSidebar] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const handleLogout = () => {
    toggleSidebar(false)
    setShowDialog(true)
  }

  const handleOnSubmit = () => {
    Digit.UserService.logout()
    setShowDialog(false)
  }

  const handleOnCancel = () => {
    setShowDialog(false)
  }

  if (islinkDataLoading || !isFetched) {
    return <Loader />
  }

  const redirectToLoginPage = () => {
    history.push("/digit-ui/citizen/login")
  }

  const redirectToScrutinyPage = () => {
    history.push("/digit-ui/citizen/core/edcr/scrutiny")
  }

  const showProfilePage = () => {
    history.push("/digit-ui/citizen/user/profile")
  }

  const tenantId = Digit.ULBService.getCitizenCurrentTenant()
  const filteredTenantContact =
    storeData?.tenants.filter((e) => e.code === tenantId)[0]?.contactNumber || storeData?.tenants[0]?.contactNumber

  let menuItems = [
    ...SideBarMenu(t, showProfilePage, redirectToLoginPage, redirectToScrutinyPage, isEmployee, storeData, tenantId),
  ]
  menuItems = menuItems.filter((item) => item.element !== "LANGUAGE")

  const MenuItem = ({ item }) => {
    const leftIconArray = item?.icon || item.icon?.type?.name
    const leftIcon = leftIconArray ? IconsObject[leftIconArray] : IconsObject.BillsIcon
    const isActive = pathname === item?.link || pathname === item?.sidebarURL

    let itemComponent
    if (item.type === "component") {
      itemComponent = item.action
    } else {
      itemComponent = item.text
    }

    const Item = () => (
      <span
        className="menu-item"
        {...item.populators}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          color: isActive ? "#4f46e5" : "#374151",
          cursor: "pointer",
          textDecoration: "none",
          fontSize: "0.9375rem",
          fontWeight: isActive ? "500" : "400",
          marginLeft: "10px",
          marginRight: "10px",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", minWidth: "20px" }}>{leftIcon}</span>
        <div className="menu-label">{itemComponent}</div>
      </span>
    )

    if (item.type === "external-link") {
      return (
        <a href={item.link} style={{ textDecoration: "none" }}>
          <Item />
        </a>
      )
    }

    if (item.type === "link") {
      return (
        <Link to={item?.link} style={{ textDecoration: "none" }}>
          <Item />
        </Link>
      )
    }

    return <Item />
  }

  let profileItem
  if (isFetched && user && user.access_token) {
    profileItem = <SidebarProfile info={user?.info} stateName={stateInfo?.name} t={t} />
    menuItems = menuItems.filter((item) => item?.id !== "login-btn" && item?.id !== "help-line")
    menuItems = [
      ...menuItems,
      {
        text: t("EDIT_PROFILE"),
        element: "PROFILE",
        icon: "EditPencilIcon",
        populators: {
          onClick: showProfilePage,
        },
      },
      {
        text: t("CORE_COMMON_LOGOUT"),
        element: "LOGOUT",
        icon: "LogoutIcon",
        populators: { onClick: handleLogout },
      },
      // {
      //   text: (
      //     <React.Fragment>
      //       {t("CS_COMMON_HELPLINE")}
      //       <div className="telephone" >
      //         <div className="link">
      //           <a href={`tel:${filteredTenantContact}`}>{filteredTenantContact}</a>
      //         </div>
      //       </div>
      //     </React.Fragment>
      //   ),
      //   element: "Helpline",
      //   icon: "Phone",
      // },
    ]
  }

  Object.keys(linkData)
    ?.sort((x, y) => y.localeCompare(x))
    ?.map((key) => {
      if (linkData[key][0]?.sidebar === "digit-ui-links") {
        menuItems.splice(1, 0, {
          type: linkData[key][0]?.sidebarURL?.includes("digit-ui") ? "link" : "external-link",
          text: t(`ACTION_TEST_${Digit.Utils.locale.getTransformedLocale(key)}`),
          links: linkData[key],
          icon: linkData[key][0]?.leftIcon,
          link: linkData[key][0]?.sidebarURL,
        })
      }
    })

  return (
    <React.Fragment>
      <div>
        <div
          style={{
            height: "100%",
            width: "100%",
            top: "0px",
            backgroundColor: "rgba(0, 0, 0, 0.54)",
            pointerEvents: "auto",
          }}
        ></div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: isMobile ? "100vh" : "auto",
            paddingTop: isMobile ? "0" : "60px",
            zIndex: "99",
            backgroundColor: "#ffffff",
            position: isMobile ? "static" : "fixed",
            top: isMobile ? "auto" : "0",
            left: isMobile ? "auto" : "0",
            width: isMobile ? "100%" : "350px",
            overflowY: isMobile ? "auto" : "hidden",
          }}
        >
          {profileItem}
          <div
            className="drawer-desktop"
            style={{
              backgroundColor: "white",
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1 }}>
              {menuItems?.map((item, index) => (
                <div
                  className={`sidebar-list ${pathname === item?.link || pathname === item?.sidebarURL ? "active" : ""}`}
                  key={index}
                  style={{
                    backgroundColor:
                      pathname === item?.link || pathname === item?.sidebarURL ? "#eef2ff" : "transparent",
                    borderLeft:
                      pathname === item?.link || pathname === item?.sidebarURL
                        ? "3px solid #4f46e5"
                        : "3px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item?.link && pathname !== item?.sidebarURL) {
                      e.currentTarget.style.backgroundColor = "#f9fafb"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item?.link && pathname !== item?.sidebarURL) {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  <MenuItem item={item} />
                </div>
              ))}
            </div>
            <div
              className="sidebar-footer"
              style={{
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#6b7280", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.5rem 0" }}>© 2025 mSeva Punjab</p>
                <p style={{ margin: "0" }}>Powered by UPMCGCL</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          {showDialog && (
            <LogoutDialog onSelect={handleOnSubmit} onCancel={handleOnCancel} onDismiss={handleOnCancel}></LogoutDialog>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export default StaticCitizenSideBar;
