import React, { useRef, useEffect, useState } from "react";
import SubMenu from "./SubMenu";
import {
  Loader,
  SearchIcon,
  ArrowForward,
  HomeIcon,
  ComplaintIcon,
  BPAHomeIcon,
  PropertyHouse,
  CaseIcon,
  ReceiptIcon,
  PersonIcon,
  DocumentIconSolid,
  DropIcon,
  CollectionsBookmarIcons,
  FinanceChartIcon,
  CollectionIcon,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";
const { some, orderBy } = _;

const EmployeeSideBar = ({ mobileView, isSidebarOpen, toggleSidebar, handleLogout }) => {
  const sidebarRef = useRef(null);
  const { isLoading, data } = Digit.Hooks.useAccessControl();
  const [search, setSearch] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const { t } = useTranslation();

  const IconsObject = {
    home: <HomeIcon />,
    announcement: <ComplaintIcon />,
    business: <BPAHomeIcon />,
    store: <PropertyHouse />,
    assignment: <CaseIcon />,
    receipt: <ReceiptIcon />,
    "business-center": <PersonIcon />,
    description: <DocumentIconSolid />,
    "water-tap": <DropIcon />,
    "collections-bookmark": <CollectionsBookmarIcons />,
    "insert-chart": <FinanceChartIcon />,
    edcr: <CollectionIcon />,
    collections: <CollectionIcon />,
  };

  useEffect(() => {
    if (isLoading) return;
    if (sidebarRef.current && !mobileView) {
      sidebarRef.current.style.cursor = "pointer";
      collapseNav();
    }
  }, [isLoading, mobileView]);

  const expandNav = () => {
    sidebarRef.current.style.width = "350px";
    sidebarRef.current.style.overflow = "auto";
    sidebarRef.current.querySelectorAll(".dropdown-link").forEach((el) => {
      el.style.display = "flex";
    });
  };

  const collapseNav = () => {
    sidebarRef.current.style.width = "65px";
    sidebarRef.current.style.overflow = "hidden";
    sidebarRef.current.querySelectorAll(".dropdown-link").forEach((el) => {
      el.style.display = "none";
    });
    sidebarRef.current.querySelectorAll(".actions").forEach((el) => {
      el.style.padding = "0";
    });
  };

  const buildMenuItems = (path) => {
    let menuItems = [];
    const actionList = data?.actions?.filter((e) => e.url === "url") || [];

    actionList.forEach((item) => {
      if (item.path === "") return;

      if (!path) {
        const splitArray = item.path.split(".");
        const topLevel = splitArray[0];

        if (!some(menuItems, { path: topLevel })) {
          const leftIcon = item.leftIcon ? item.leftIcon.split(".")[0] : null;

          menuItems.push({
            path: topLevel,
            name: topLevel,
            url: "",
            queryParams: item.queryParams,
            orderNumber: item.orderNumber,
            navigationURL: item.navigationURL,
            leftIcon,
            displayName: topLevel,
            moduleName: topLevel,
            type: "parent",
            originalItem: item,
          });
        }
      } else if (item.path.startsWith(path + ".")) {
        const remainder = item.path.substring(path.length + 1);
        const splitArray = remainder.split(".");

        if (splitArray.length > 1) {
          const parentName = splitArray[0];
          if (!some(menuItems, { path: path + "." + parentName })) {
            const leftIconArray = item.leftIcon ? item.leftIcon.split(".") : [];
            const pathDepth = path.split(".").length;
            const leftIcon = leftIconArray.length > pathDepth ? leftIconArray[pathDepth] : null;

            menuItems.push({
              path: path + "." + parentName,
              name: parentName,
              url: "",
              queryParams: item.queryParams,
              orderNumber: item.orderNumber,
              navigationURL: "",
              leftIcon,
              displayName: parentName,
              moduleName: parentName,
              type: "parent",
              originalItem: item,
            });
          }
        } else {
          const displayName = item.displayName || splitArray[0];
          const leftIconArray = item.leftIcon ? item.leftIcon.split(".") : [];
          const pathDepth = path.split(".").length;
          const leftIcon = leftIconArray.length > pathDepth ? leftIconArray[pathDepth] : null;

          menuItems.push({
            path: item.path,
            name: displayName,
            url: item.url,
            queryParams: item.queryParams,
            orderNumber: item.orderNumber,
            navigationURL: item.navigationURL,
            leftIcon,
            displayName,
            moduleName: displayName,
            type: "single",
            originalItem: item,
          });
        }
      }
    });

    return orderBy(menuItems, ["orderNumber"], ["asc"]);
  };

  const getSearchResults = () => {
    if (!search || currentPath) return [];

    const actionList = data?.actions?.filter((e) => e.url === "url") || [];
    return actionList.filter((item) => item.url && item.displayName.toLowerCase().includes(search.toLowerCase()));
  };

  const navigateToMenu = (path) => {
    setCurrentPath(path);
    setSearch("");
  };

  const navigateBack = () => {
    if (!currentPath) return;

    const pathArray = currentPath.split(".");
    pathArray.pop();
    setCurrentPath(pathArray.join("."));
    setSearch("");
  };

  const getBreadcrumbTitle = () => {
    if (!currentPath) return "";
    const pathArray = currentPath.split(".");
    return pathArray[pathArray.length - 1];
  };

  const getIconComponent = (iconString) => {
    if (!iconString) return IconsObject.collections;

    const iconArray = iconString.split(":");
    const iconName = iconArray[iconArray.length - 1];
    return IconsObject[iconName] || IconsObject.collections;
  };

  const convertItemsForSubMenu = (items) => {
    return items.map((item, index) => {
      const iconComponent = getIconComponent(item.leftIcon);

      if (!item.url) {
        const moduleName = item.moduleName?.replace(/[ -]/g, "_").toUpperCase();
        const appendTranslate = t(`ACTION_TEST_${moduleName}`);
        const trimModuleName = t(appendTranslate);

        return (
          <div key={index} className="submenu-container">
            <div onClick={() => navigateToMenu(item.path)} className="sidebar-link" style={{ cursor: "pointer" }}>
              <div className="actions">
                {iconComponent}
                <span id="sdbshvdsh">{trimModuleName}</span>
              </div>
              <div>
                <ArrowForward />
              </div>
            </div>
          </div>
        );
      }

      return (
        <SubMenu
          key={index}
          item={{
            type: "single",
            moduleName: item.originalItem?.displayName,
            navigationURL: item.navigationURL,
            leftIcon: item.originalItem?.leftIcon,
            isKibana: false,
          }}
          onLinkClick={() => {}}
        />
      );
    });
  };

  const renderSearch = () => {
    return (
      <div className="submenu-container">
        <div className="sidebar-link">
          <div className="actions search-icon-wrapper">
            <SearchIcon className="search-icon" />
            <input
              className="employee-search-input"
              type="text"
              placeholder={t("ACTION_TEST_SEARCH")}
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={currentPath !== ""}
            />
          </div>
        </div>
      </div>
    );
  };

  const closeSidebar = () => {
    toggleSidebar(false);
  };

  if (isLoading) {
    return <Loader />;
  }

  const displayItems = search ? getSearchResults() : buildMenuItems(currentPath);

  if (mobileView) {
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
              .employee-mobile-sidebar .employee-search-input:disabled {
                opacity: 0.5 !important;
                cursor: not-allowed !important;
              }
            `}
          </style>

          <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: "16px", color: "#1f2937" }}>{currentPath ? getBreadcrumbTitle() : t("CORE_COMMON_MENU")}</span>
            <button
              onClick={closeSidebar}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6b7280",
                padding: "4px 8px",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: "8px 0" }}>
            {renderSearch()}

            {currentPath && (
              <div
                onClick={navigateBack}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  color: "#4f46e5",
                  fontWeight: 500,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                ← Back
              </div>
            )}

            {convertItemsForSubMenu(displayItems)}
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

  return (
    <div
      className="sidebar"
      ref={sidebarRef}
      onMouseOver={expandNav}
      onMouseLeave={collapseNav}
      style={{
        display: window.location.href.includes("main-dashboard-landing") ? "none" : "",
        backgroundColor: "#f8f9fa",
        borderRight: "1px solid #e5e7eb",
      }}
    >
      <style>
        {`
          .sidebar .submenu-container {
            padding: 0 !important;
            margin: 0 !important;
          }

          .sidebar .sidebar-link {
            padding: 12px 16px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            border-bottom: 1px solid #f3f4f6 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            background-color: transparent !important;
          }

          .sidebar .sidebar-link:hover {
            background-color: #f0f2f5 !important;
            border-left: 3px solid #4f46e5 !important;
            padding-left: 13px !important;
          }

          .sidebar .sidebar-link.active {
            background-color: #eef2ff !important;
            border-left: 3px solid #4f46e5 !important;
            padding-left: 13px !important;
          }

          .sidebar .actions {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 0 !important;
            flex: 1;
          }

          .sidebar .actions svg {
            width: 20px !important;
            height: 20px !important;
            flex-shrink: 0;
            color: #6b7280 !important;
          }

          .sidebar .actions span,
          .sidebar .actions a,
          .sidebar .custom-link {
            font-size: 14px !important;
            color: #1f2937 !important;
            text-decoration: none !important;
            font-weight: 500 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .sidebar .dropdown-link {
            display: flex !important;
            padding: 10px 16px 10px 48px !important;
            font-size: 13px !important;
            color: #4b5563 !important;
            text-decoration: none !important;
            border-bottom: 1px solid #f9fafb !important;
            transition: all 0.2s ease !important;
          }

          .sidebar .dropdown-link:hover {
            background-color: #f3f4f6 !important;
            color: #4f46e5 !important;
          }

          .sidebar .dropdown-link.active {
            background-color: #eef2ff !important;
            color: #4f46e5 !important;
            border-left: 3px solid #4f46e5 !important;
            padding-left: 45px !important;
          }

          .sidebar .search-icon-wrapper {
            padding: 8px 12px !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            background-color: #fff !important;
            margin: 12px !important;
            border-radius: 6px !important;
            border: 1px solid #d1d5db !important;
          }

          .sidebar .employee-search-input {
            border: none !important;
            background: transparent !important;
            outline: none !important;
            font-size: 13px !important;
            width: 100% !important;
            color: #1f2937 !important;
          }

          .sidebar .employee-search-input::placeholder {
            color: #9ca3af !important;
          }

          .sidebar .employee-search-input:disabled {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
          }
        `}
      </style>

      {renderSearch()}

      {currentPath && (
        <div
          onClick={navigateBack}
          style={{
            padding: "12px 16px",
            cursor: "pointer",
            color: "#4f46e5",
            fontSize: "13px",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#f0f2f5",
          }}
        >
          ← Back
        </div>
      )}

      {convertItemsForSubMenu(displayItems)}
    </div>
  );
};

export default EmployeeSideBar;