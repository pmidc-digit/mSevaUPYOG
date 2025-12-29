import React, { useRef, useEffect, useState } from "react";
import SubMenu from "./SubMenu";
import { Loader, SearchIcon } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import NavItem from "./NavItem";
import _, { findIndex } from "lodash";

const EmployeeSideBar = ({ mobileView, isSidebarOpen, toggleSidebar, handleLogout }) => {
  const sidebarRef = useRef(null);
  const { isLoading, data } = Digit.Hooks.useAccessControl();
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
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
    sidebarRef.current.style.width = "350px";
    sidebarRef.current.style.overflow = "auto";

    sidebarRef.current.querySelectorAll(".dropdown-link").forEach((element) => {
      element.style.display = "flex";
    });
  };
  const collapseNav = () => {
    sidebarRef.current.style.width = "65px";
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
  const splitKeyValue = () => {
    const keys = Object.keys(configEmployeeSideBar);
    keys.sort((a, b) => a.orderNumber - b.orderNumber);
    for (let i = 0; i < keys.length; i++) {
      if (configEmployeeSideBar[keys[i]][0].path.indexOf(".") === -1) {
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
      return <SubMenu item={item} key={index + 1} />;
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
        <div className="sidebar-link">
          <div className="actions search-icon-wrapper">
            <SearchIcon className="search-icon" />
            <input
              className="employee-search-input"
              type="text"
              placeholder={t(`ACTION_TEST_SEARCH`)}
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
    left: isSidebarOpen ? 0 : "-280px",
    width: "280px",
    height: "100vh",
    backgroundColor: "#fff",
    zIndex: 9999,
    transition: "left 0.3s ease",
    overflowY: "auto",
    boxShadow: isSidebarOpen ? "2px 0 8px rgba(0,0,0,0.15)" : "none",
  };

  const mobileHeaderStyle = {
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  };

  const closeButtonStyle = {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px 8px",
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
                padding: 12px 16px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                border-bottom: 1px solid #f3f4f6 !important;
                cursor: pointer !important;
              }
              .employee-mobile-sidebar .sidebar-link:hover {
                background-color: #f9fafb !important;
              }
              .employee-mobile-sidebar .sidebar-link.active {
                background-color: #eef2ff !important;
                border-left: 3px solid #4f46e5 !important;
              }
              .employee-mobile-sidebar .actions {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                padding: 0 !important;
              }
              .employee-mobile-sidebar .actions svg {
                width: 20px !important;
                height: 20px !important;
                fill: #6b7280 !important;
              }
              .employee-mobile-sidebar .actions span,
              .employee-mobile-sidebar .actions a,
              .employee-mobile-sidebar .custom-link {
                font-size: 14px !important;
                color: #1f2937 !important;
                text-decoration: none !important;
                font-weight: 500 !important;
              }
              .employee-mobile-sidebar .dropdown-link {
                display: flex !important;
                padding: 10px 16px 10px 48px !important;
                font-size: 13px !important;
                color: #4b5563 !important;
                text-decoration: none !important;
                border-bottom: 1px solid #f9fafb !important;
              }
              .employee-mobile-sidebar .dropdown-link:hover {
                background-color: #f3f4f6 !important;
              }
              .employee-mobile-sidebar .dropdown-link.active {
                background-color: #eef2ff !important;
                color: #4f46e5 !important;
              }
              .employee-mobile-sidebar .search-icon-wrapper {
                padding: 8px 16px !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                background-color: #f9fafb !important;
                margin: 8px 12px !important;
                border-radius: 6px !important;
                border: 1px solid #e5e7eb !important;
              }
              .employee-mobile-sidebar .employee-search-input {
                border: none !important;
                background: transparent !important;
                outline: none !important;
                font-size: 14px !important;
                width: 100% !important;
              }
            `}
          </style>
          <div style={mobileHeaderStyle}>
            <span style={{ fontWeight: 600, fontSize: "16px", color: "#1f2937" }}>{t("")}</span>
            <button style={closeButtonStyle} onClick={closeSidebar}>×</button>
          </div>
          <div style={{ padding: "8px 0" }}>
            {renderSearch()}
            {splitKeyValue()}
          </div>
          {handleLogout && (
            <div style={{ borderTop: "1px solid #e5e7eb", padding: "16px" }}>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "12px",
                  
                  color: "black",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {t("CORE_COMMON_LOGOUT")}
              </button>
            </div>
          )}
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
