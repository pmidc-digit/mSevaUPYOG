import React, { useRef, useEffect, useState } from "react";
import SubMenu from "./SubMenu";
import { Loader, SearchIcon } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import NavItem from "./NavItem";
import _, { findIndex } from "lodash";
import SidebarProfile from "./SidebarProfile";

const EmployeeSideBar = ({ mobileView, isSidebarOpen, toggleSidebar, handleLogout }) => {
  const sidebarRef = useRef(null);
  const { isLoading, data } = Digit.Hooks.useAccessControl();
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  useEffect(() => {
    if (isLoading) {
      return <Loader />;
    }
    if (sidebarRef.current && !mobileView) {
      sidebarRef.current.style.cursor = "pointer";
      collapseNav();
    }
  }, [isLoading, mobileView]);

  const expandNav = () => {
    sidebarRef.current.style.width = "260px";
    sidebarRef.current.style.overflow = "auto";

    sidebarRef.current.querySelectorAll(".dropdown-link").forEach((element) => {
      element.style.display = "flex";
    });
  };
  const collapseNav = () => {
    sidebarRef.current.style.width = "56px";
    sidebarRef.current.style.overflow = "hidden";

    sidebarRef.current.querySelectorAll(".dropdown-link").forEach((element) => {
      element.style.display = "none";
    });
    sidebarRef.current.querySelectorAll(".actions").forEach((element) => {
      element.style.padding = "0";
    });
  };

  const configEmployeeSideBar = {};

  //creating the object structure from mdms value for easy iteration
  let configEmployeeSideBar1 = {};
  data?.actions
    ?.filter((e) => e.url === "url")
    ?.forEach((item) => {
      _.set(configEmployeeSideBar1, item.path, { ...item });
    });

  data?.actions
    .filter((e) => e.url === "url")
    .forEach((item) => {
      let index = item.path.split(".")[0];
      if (search == "" && item.path !== "") {
        index = item.path.split(".")[0];
        if (index === "TradeLicense") index = "Trade License";
        if (!configEmployeeSideBar[index]) {
          configEmployeeSideBar[index] = [item];
        } else {
          configEmployeeSideBar[index].push(item);
        }
      } else if (
        item.path !== "" &&
        t(`ACTION_TEST_${index?.toUpperCase()?.replace(/[ -]/g, "_")}`)
          ?.toLowerCase()
          .includes(search.toLowerCase())
      ) {
        index = item.path.split(".")[0];
        if (index === "TradeLicense") index = "Trade License";
        if (!configEmployeeSideBar[index]) {
          configEmployeeSideBar[index] = [item];
        } else {
          configEmployeeSideBar[index].push(item);
        }
      }
    });
  let res = [];

  //method is used for restructing of configEmployeeSideBar1 nested object into nested array object
  function restructuringOfConfig(tempconfig) {
    const result = [];
    for (const key in tempconfig) {
      const value = tempconfig[key];
      if (typeof value === "object" && !value?.id) {
        const children = restructuringOfConfig(value);
        result.push({ label: key, children, icon: children?.[0]?.icon, to: "" });
      } else {
        result.push({ label: key, value, icon: value?.leftIcon, to: key === "Home" ? "/digit-ui/employee" : value?.navigationURL });
      }
    }

    return result;
  }
  const splitKeyValue = (onLinkClick) => {
    const keys = Object.keys(configEmployeeSideBar);
    keys.sort((a, b) => a.orderNumber - b.orderNumber);
    for (let i = 0; i < keys.length; i++) {
      if (configEmployeeSideBar[keys[i]][0].path.indexOf(".") === -1 || keys[i] === "KibanaDashboard") {
        if (configEmployeeSideBar[keys[i]][0].displayName === "Home") {
          const homeURL = "/digit-ui/employee";
          res.unshift({
            moduleName: keys[i].toUpperCase(),
            icon: configEmployeeSideBar[keys[i]][0],
            navigationURL: homeURL,
            type: "single",
          });
        } else {
          res.push({
            moduleName: configEmployeeSideBar[keys[i]][0]?.displayName.toUpperCase(),
            type: "single",
            icon: configEmployeeSideBar[keys[i]][0],
            navigationURL: configEmployeeSideBar[keys[i]][0].navigationURL,
            isKibana: keys[i] === "KibanaDashboard",
          });
        }
      } else {
        res.push({
          moduleName: keys[i].toUpperCase(),
          links: configEmployeeSideBar[keys[i]],
          icon: configEmployeeSideBar[keys[i]][0],
          orderNumber: configEmployeeSideBar[keys[i]][0].orderNumber,
        });
      }
    }
    if (res.find((a) => a.moduleName === "HOME")) {
      //res.splice(0,1);
      const indx = res.findIndex((a) => a.moduleName === "HOME");
      const home = res?.filter((ob) => ob?.moduleName === "HOME");
      let res1 = res?.filter((ob) => ob?.moduleName !== "HOME");
      res = res1.sort((a, b) => a.moduleName.localeCompare(b.moduleName));
      home?.[0] && res.unshift(home[0]);
    } else {
      res.sort((a, b) => a.moduleName.localeCompare(b.moduleName));
    }
    //reverting the newsidebar change for now, in order to solve ndss login issue
    //let newconfig = restructuringOfConfig(configEmployeeSideBar1);
    //below lines are used for shifting home object to first place
    // newconfig.splice(newconfig.findIndex((ob) => ob?.label === ""),1);
    // newconfig.sort((a,b) => a.label.localeCompare(b.label));
    // const fndindex = newconfig?.findIndex((el) => el?.label === "Home");
    // const homeitem = newconfig.splice(fndindex,1);
    // newconfig.unshift(homeitem?.[0]);
    // return (
    //   newconfig.map((item, index) => {
    //       return <NavItem key={`${item?.label}-${index}`} item={item} />;
    //     })
    // );
    return res?.map((item, index) => {
      return <SubMenu item={item} key={index + 1} onLinkClick={onLinkClick} />;
    });
  };

  if (isLoading) {
    return <Loader />;
  }
  if (!res) {
    return "";
  }

  const renderSearch = () => {
    return (
      <div className="submenu-container">
        <div className="sidebar-link" style={{ margin: "6px 8px", padding: "6px 10px", borderRadius: "8px" }}>
          <div className="actions search-icon-wrapper" style={{ gap: "8px", padding: "0" }}>
            <SearchIcon className="search-icon" style={{ width: "14px", height: "14px" }} />
            <input
              className="employee-search-input"
              type="text"
              placeholder={t(`ACTION_TEST_SEARCH`)}
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: "12px", border: "none", background: "transparent", outline: "none", width: "100%" }}
            />
          </div>
        </div>
      </div>
    );
  };

  const closeSidebar = () => {
    toggleSidebar(false);
  };

  // Mobile sidebar styles
  const mobileOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9998,
    display: isSidebarOpen ? "block" : "none",
  };

  const mobileSidebarStyle = {
    position: "fixed",
    top: 0,
    left: isSidebarOpen ? 0 : "-300px",
    width: "300px",
    height: "100vh",
    backgroundColor: "#fff",
    zIndex: 9999,
    transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    overflowY: "auto",
    boxShadow: isSidebarOpen ? "4px 0 20px rgba(0,60,113,0.15)" : "none",
    display: "flex",
    flexDirection: "column",
  };

  const mobileHeaderStyle = {
    padding: "0",
    flexShrink: 0,
    position: "relative",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "6px",
    fontSize: "18px",
    lineHeight: "1",
    cursor: "pointer",
    color: "#ffffff",
    padding: "4px 8px",
    zIndex: 1,
  };

  // Mobile view render
  if (mobileView) {
    return (
      <React.Fragment>
        <div style={mobileOverlayStyle} onClick={closeSidebar}></div>
        <div style={mobileSidebarStyle} className="employee-mobile-sidebar">
          <style>
            {`
              .employee-mobile-sidebar .submenu-container {
                padding: 0 !important;
                margin: 0 !important;
              }
              .employee-mobile-sidebar .sidebar-link {
                padding: 10px 16px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                border-left: 3px solid transparent !important;
                cursor: pointer !important;
                transition: all 0.18s ease !important;
              }
              .employee-mobile-sidebar .sidebar-link:hover {
                background-color: #F4F7FB !important;
                border-left-color: rgba(0,60,113,0.2) !important;
              }
              .employee-mobile-sidebar .sidebar-link.active {
                background-color: #EEF4FF !important;
                border-left: 3px solid #003C71 !important;
              }
              .employee-mobile-sidebar .sidebar-link.active .nav-icon-box {
                background-color: #003C71 !important;
              }
              .employee-mobile-sidebar .sidebar-link.active .nav-icon-box svg {
                fill: #ffffff !important;
              }
              .employee-mobile-sidebar .sidebar-link.active span,
              .employee-mobile-sidebar .sidebar-link.active a,
              .employee-mobile-sidebar .sidebar-link.active .custom-link span {
                color: #003C71 !important;
                font-weight: 600 !important;
              }
              .employee-mobile-sidebar .actions {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                padding: 0 !important;
              }
              .employee-mobile-sidebar .nav-icon-box {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 32px !important;
                height: 32px !important;
                min-width: 32px !important;
                border-radius: 8px !important;
                background-color: #F0F4F9 !important;
                transition: background-color 0.18s ease !important;
              }
              .employee-mobile-sidebar .nav-icon-box svg {
                width: 17px !important;
                height: 17px !important;
                fill: #626A6E !important;
                margin: 0 !important;
              }
              .employee-mobile-sidebar .actions span,
              .employee-mobile-sidebar .actions a,
              .employee-mobile-sidebar .custom-link {
                font-size: 13px !important;
                color: #374151 !important;
                text-decoration: none !important;
                font-weight: 500 !important;
              }
              .employee-mobile-sidebar .dropdown-link {
                display: flex !important;
                padding: 9px 16px 9px 54px !important;
                font-size: 12px !important;
                color: #505A5F !important;
                text-decoration: none !important;
                border-left: 2px solid transparent !important;
                transition: all 0.18s ease !important;
              }
              .employee-mobile-sidebar .dropdown-link:hover {
                background-color: rgba(0,60,113,0.04) !important;
                color: #003C71 !important;
              }
              .employee-mobile-sidebar .dropdown-link.active {
                background-color: rgba(0,60,113,0.04) !important;
                color: #003C71 !important;
                font-weight: 600 !important;
                border-left-color: #003C71 !important;
              }
              .employee-mobile-sidebar .search-icon-wrapper {
                padding: 8px 12px !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                background-color: #F3F2F1 !important;
                margin: 10px 12px 4px !important;
                border-radius: 8px !important;
                border: 1px solid #DEE0E2 !important;
              }
              .employee-mobile-sidebar .search-icon-wrapper svg {
                fill: #626A6E !important;
                width: 16px !important;
                height: 16px !important;
              }
              .employee-mobile-sidebar .employee-search-input {
                border: none !important;
                background: transparent !important;
                outline: none !important;
                font-size: 13px !important;
                width: 100% !important;
                color: #1F1F1F !important;
              }
            `}
          </style>

          {/* Profile header */}
          <div style={mobileHeaderStyle}>
            <button style={closeButtonStyle} onClick={closeSidebar}>
              ×
            </button>
            {user?.access_token ? (
              <SidebarProfile info={user?.info} stateName={storeData?.stateInfo?.name} t={t} />
            ) : (
              <div
                style={{
                  background: "linear-gradient(140deg, #003C71 0%, #1A5CA8 100%)",
                  padding: "1.25rem 1.25rem 1rem",
                }}
              >
                <div style={{ fontSize: "1rem", fontWeight: "700", color: "#ffffff" }}>Employee Portal</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>mSeva Punjab</div>
              </div>
            )}
          </div>

          {/* Menu items */}
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
            {renderSearch()}
            {splitKeyValue(closeSidebar)}
          </div>

          {/* Footer + Logout */}
          <div
            style={{
              borderTop: "2px solid #DEE0E2",
              backgroundColor: "#F3F2F1",
              flexShrink: 0,
            }}
          >
            {handleLogout && (
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid #DEE0E2",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#D4351C",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {t("CORE_COMMON_LOGOUT")}
              </button>
            )}
            <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1px" }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: "600", color: "#003C71" }}>mSeva Punjab</div>
              <div style={{ fontSize: "0.625rem", color: "#626A6E" }}>© 2025 UPMCGCL</div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  // Desktop view render
  return (
    <div
      className="sidebar"
      ref={sidebarRef}
      onMouseOver={expandNav}
      onMouseLeave={collapseNav}
      style={{ display: window.location.href.includes("main-dashboard-landing") ? "none" : "" }}
    >
      {renderSearch()}
      {splitKeyValue()}
    </div>
  );
};

export default EmployeeSideBar;
