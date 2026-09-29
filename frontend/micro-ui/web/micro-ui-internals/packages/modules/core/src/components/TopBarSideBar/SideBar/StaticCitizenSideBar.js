import React, { useState } from "react";
import {
  HomeIcon,
  EditPencilIcon,
  LogoutIcon,
  Loader,
  PropertyHouse,
  CaseIcon,
  CollectionIcon,
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
  ComplaintIcon,
  CollectionsBookmarIcons,
  FinanceChartIcon,
  SearchIcon,
  ArrowForward,
  ArrowVectorDown,
  BPAHomeIcon,
  PersonIcon,
  ReceiptIcon,
  DocumentIconSolid,
  DropIcon,
  PTIcon,
} from "@mseva/digit-ui-react-components";
import { Link, useLocation, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LogoutDialog from "../../Dialog/LogoutDialog";
import SidebarProfile from "./SidebarProfile";

/**
 * Icon map — maps icon strings from MDMS / actions-test leftIcon field.
 */
const IconsObject = {
  home: <HomeIcon className="icon" />,
  HomeIcon: <HomeIcon className="icon" />,
  store: <PropertyHouse className="icon" />,
  propertyIcon: <PropertyHouse className="icon" />,
  PropertyHouse: <PropertyHouse className="icon" />,
  PTIcon: <PTIcon className="icon" />,
  CommonPTIcon: <PTIcon className="icon" />,
  assignment: <CaseIcon className="icon" />,
  TLIcon: <CaseIcon className="icon" />,
  CaseIcon: <CaseIcon className="icon" />,
  announcement: <ComplaintIcon className="icon" />,
  complaint: <ComplaintIcon className="icon" />,
  ComplaintIcon: <ComplaintIcon className="icon" />,
  PGRIcon: <PGRIcon className="icon" />,
  business: <BPAHomeIcon className="icon" />,
  BPAHomeIcon: <BPAHomeIcon className="icon" />,
  OBPSIcon: <OBPSIcon className="icon" />,
  "business-center": <PersonIcon className="icon" />,
  person: <PersonIcon className="icon" />,
  PersonIcon: <PersonIcon className="icon" />,
  description: <DocumentIconSolid className="icon" />,
  DocumentIconSolid: <DocumentIconSolid className="icon" />,
  receipt: <ReceiptIcon className="icon" />,
  ReceiptIcon: <ReceiptIcon className="icon" />,
  "water-tap": <DropIcon className="icon" />,
  DropIcon: <DropIcon className="icon" />,
  WSIcon: <WSICon className="icon" />,
  "collections-bookmark": <CollectionsBookmarIcons className="icon" />,
  CollectionsBookmarIcons: <CollectionsBookmarIcons className="icon" />,
  "insert-chart": <FinanceChartIcon className="icon" />,
  FinanceChartIcon: <FinanceChartIcon className="icon" />,
  edcr: <CollectionIcon className="icon" />,
  collections: <CollectionIcon className="icon" />,
  CollectionIcon: <CollectionIcon className="icon" />,
  BillsIcon: <CollectionIcon className="icon" />,
  firenoc: <FirenocIcon className="icon" />,
  "fire-noc": <FirenocIcon className="icon" />,
  FirenocIcon: <FirenocIcon className="icon" />,
  FSMIcon: <FSMIcon className="icon" />,
  BirthIcon: <BirthIcon className="icon" />,
  DeathIcon: <DeathIcon className="icon" />,
  MCollectIcon: <MCollectIcon className="icon" />,
  EditPencilIcon: <EditPencilIcon className="icon" />,
  LogoutIcon: <LogoutIcon className="icon" />,
  LoginIcon: <LoginIcon className="icon" />,
  Phone: <Phone className="icon" />,
};

/**
 * Resolve icon by leftIcon string or fallback to module name keywords
 */
const resolveIcon = (leftIconStr = "", itemName = "") => {
  if (leftIconStr) {
    const parts = leftIconStr.split(":");
    const key = parts[parts.length - 1];
    if (IconsObject[key]) return IconsObject[key];
    if (IconsObject[leftIconStr]) return IconsObject[leftIconStr];
  }
  const nameLower = (itemName || "").toLowerCase();
  if (nameLower.includes("home")) return IconsObject.home;
  if (nameLower.includes("property") || nameLower.includes("pt")) return IconsObject.store;
  if (nameLower.includes("fire")) return IconsObject.firenoc;
  if (nameLower.includes("complaint") || nameLower.includes("pgr")) return IconsObject.announcement;
  if (nameLower.includes("pet")) return IconsObject.description;
  if (nameLower.includes("venue")) return IconsObject.store;
  if (nameLower.includes("due")) return IconsObject.description;
  if (nameLower.includes("bpa") || nameLower.includes("building")) return IconsObject.business;
  if (nameLower.includes("survey")) return IconsObject.description;
  if (nameLower.includes("receipt")) return IconsObject.receipt;
  if (nameLower.includes("water") || nameLower.includes("sewerage")) return IconsObject["water-tap"];
  if (nameLower.includes("trade") || nameLower.includes("tl")) return IconsObject.assignment;
  return IconsObject.collections;
};

const StaticCitizenSideBar = ({
  isOpen = false,
  toggleSidebar,
  closeSidebar,
  logout,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  const { data: storeData, isFetched } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};
  const user = Digit.UserService.getUser();
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState({});

  // 1. Fetch access control data (same hook & API as monolith ActionMenu)
  const { isLoading: isAccessLoading, data: accessControlData } = Digit.Hooks.useAccessControl();

  // 2. Fallback to MDMS actions-test if needed
  const { isLoading: isMdmsLoading, data: mdmsData } = Digit.Hooks.useCustomMDMS(
    Digit.ULBService.getStateId(),
    "ACCESSCONTROL-ACTIONS-TEST",
    [{ name: "actions-test" }]
  );

  const handleClose = () => {
    if (closeSidebar) closeSidebar();
    else if (toggleSidebar) toggleSidebar(false);
  };

  const handleLogout = () => {
    handleClose();
    setShowDialog(true);
  };

  const handleOnSubmit = () => {
    Digit.UserService.logout();
    setShowDialog(false);
  };

  const handleOnCancel = () => {
    setShowDialog(false);
  };

  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showProfilePage = () => {
    handleClose();
    history.push("/digit-ui/citizen/user/profile");
  };

  const getTranslationLabel = (name) => {
    if (!name) return "";
    if (
      name.toUpperCase() === "HOME" ||
      name.toUpperCase() === "CS_HOME_HOMEHEADER" ||
      name.toUpperCase() === "CS_HOME_HEADER_HOME"
    ) {
      const homeT = t("ACTION_TEST_HOME") || t("CS_HOME_HOMEHEADER");
      return homeT && homeT !== "ACTION_TEST_HOME" && homeT !== "CS_HOME_HOMEHEADER" ? homeT : "Home";
    }
    const key = "ACTION_TEST_" + name.toUpperCase().replace(/[.:-\s\/]/g, "_");
    const trans = t(key);
    return trans !== key ? trans : name;
  };

  const handleItemNavigation = (navUrl) => {
    handleClose();
    if (!navUrl) return;
    if (navUrl.startsWith("http://") || navUrl.startsWith("https://")) {
      window.open(navUrl, "_blank", "noopener,noreferrer");
    } else if (navUrl.startsWith("/digit-ui")) {
      history.push(navUrl);
    } else if (navUrl.startsWith("/")) {
      history.push(navUrl);
    } else {
      history.push(`/${navUrl}`);
    }
  };

  if ((isAccessLoading && isMdmsLoading) || !isFetched) {
    return <Loader />;
  }

  // Combine actions from AccessControl or MDMS
  const actionList =
    (accessControlData?.actions && accessControlData.actions.length > 0
      ? accessControlData.actions
      : mdmsData?.["ACCESSCONTROL-ACTIONS-TEST"]?.["actions-test"]) || [];

  // Employee / internal modules blocklist
  const BLOCKED_NAMES = new Set([
    "HRMS",
    "FINANCE",
    "CITIZEN SCORE CARD",
    "REPORTS",
    "RECEIPT CANCELLATION",
    "UNIVERSAL COLLECTION",
    "BILL AMENDMENT",
    "SURE DASHBOARD",
    "PGRAI",
  ]);

  // ─── Build Dynamic Menu Items (Exact Monolith ActionMenu logic) ─────────────
  const dynamicItems = [];
  for (let i = 0; i < actionList.length; i++) {
    const item = actionList[i];
    if (!item || item.enabled === false || !item.path || !item.navigationURL) continue;

    const splitArray = item.path.split(".");
    const leftIconArray = item.leftIcon ? item.leftIcon.split(".") : [];
    const leftIcon = leftIconArray.length >= 1 ? leftIconArray[0] : null;

    if (splitArray.length > 1) {
      const topLevel = splitArray[0];
      const isHome =
        topLevel.toUpperCase() === "HOME" ||
        topLevel.toUpperCase() === "CS_HOME_HOMEHEADER" ||
        topLevel.toUpperCase() === "CS_HOME_HEADER_HOME";
      const normalizedName = isHome ? "Home" : topLevel;
      const normalizedKey = normalizedName.toUpperCase();

      if (!dynamicItems.some((m) => m.name.toUpperCase() === normalizedKey)) {
        if (!BLOCKED_NAMES.has(normalizedKey)) {
          dynamicItems.push({
            path: topLevel,
            name: normalizedName,
            url: isHome ? "" : "",
            queryParams: item.queryParams,
            orderNumber: isHome ? 0 : item.orderNumber,
            navigationURL: isHome ? "/digit-ui/citizen" : item.navigationURL,
            leftIcon: isHome ? "home" : leftIcon,
            hasSubmenu: isHome ? false : true,
          });
        }
      }
    } else {
      const itemName = item.displayName || splitArray[0];
      const isHome =
        itemName.toUpperCase() === "HOME" ||
        itemName.toUpperCase() === "CS_HOME_HOMEHEADER" ||
        itemName.toUpperCase() === "CS_HOME_HEADER_HOME" ||
        splitArray[0].toUpperCase() === "HOME";
      const normalizedName = isHome ? "Home" : itemName;
      const normalizedKey = normalizedName.toUpperCase();

      if (!dynamicItems.some((m) => m.name.toUpperCase() === normalizedKey)) {
        if (!BLOCKED_NAMES.has(normalizedKey)) {
          dynamicItems.push({
            path: item.path,
            name: normalizedName,
            url: item.url,
            queryParams: item.queryParams,
            orderNumber: isHome ? 0 : item.orderNumber,
            navigationURL: isHome ? "/digit-ui/citizen" : item.navigationURL,
            leftIcon: isHome ? "home" : leftIcon,
            hasSubmenu: false,
          });
        }
      }
    }
  }

  // Ensure Home exists exactly once
  if (!dynamicItems.some((m) => m.name.toUpperCase() === "HOME")) {
    dynamicItems.push({
      path: "Home",
      name: "Home",
      url: "",
      queryParams: "",
      orderNumber: 0,
      navigationURL: "/digit-ui/citizen",
      leftIcon: "home",
      hasSubmenu: false,
    });
  }

  // Sort by orderNumber asc (exact monolith logic)
  dynamicItems.sort((a, b) => (a.orderNumber ?? 999) - (b.orderNumber ?? 999));

  // Filter SWACH for citizen (exact monolith logic)
  const userRoles = Digit.UserService.getUser()?.info?.roles || [];
  const hasPescoRole = userRoles.some((r) => r.code === "PESCO");
  let filteredDynamicItems = hasPescoRole
    ? dynamicItems.filter((m) => m.name.toUpperCase() === "SWACH")
    : dynamicItems.filter((m) => m.name.toUpperCase() !== "SWACH");

  // Get sub-items for a parent menu (exact monolith logic)
  const getSubmenuItems = (parentName) => {
    const subItems = [];
    const seenSubNames = new Set();
    actionList.forEach((item) => {
      if (
        item &&
        item.enabled !== false &&
        item.path &&
        item.path.startsWith(parentName + ".") &&
        item.navigationURL
      ) {
        const remainder = item.path.substring(parentName.length + 1);
        const split = remainder.split(".");
        const subName = item.displayName || split[0];
        if (!seenSubNames.has(subName)) {
          seenSubNames.add(subName);
          subItems.push({
            path: item.path,
            name: subName,
            displayName: subName,
            navigationURL: item.navigationURL,
            url: item.url,
            orderNumber: item.orderNumber,
          });
        }
      }
    });
    return subItems.sort((a, b) => (a.orderNumber ?? 999) - (b.orderNumber ?? 999));
  };

  // ─── Assemble Final Menu List ──────────────────────────────────────────────
  const allMenuItems = filteredDynamicItems.map((item) => ({
    ...item,
    text: getTranslationLabel(item.name),
    links: item.hasSubmenu ? getSubmenuItems(item.name) : [],
  }));

  // ─── Filter by search ────────────────────────────────────────────────────────
  const searchTrimmed = search.trim().toLowerCase();
  const visibleMenuItems = allMenuItems.filter((item) => {
    if (!searchTrimmed) return true;
    const itemLabel = (item.text || item.name || "").toLowerCase();
    if (itemLabel.includes(searchTrimmed)) return true;
    if (item.hasSubmenu && Array.isArray(item.links)) {
      return item.links.some((sub) => {
        const subLabel = (getTranslationLabel(sub.name) || sub.name || "").toLowerCase();
        return subLabel.includes(searchTrimmed);
      });
    }
    return false;
  });

  // ─── Profile / Logout ────────────────────────────────────────────────────────
  const isLoggedIn = isFetched && user && user.access_token;
  const profileSection = isLoggedIn ? (
    <SidebarProfile info={user?.info} stateName={stateInfo?.name} t={t} />
  ) : null;

  // ─── Render Menu Row ─────────────────────────────────────────────────────────
  const renderItem = (item, index) => {
    const label = item.text || item.name;
    const iconComponent = resolveIcon(item.leftIcon, item.name);
    const hasSubmenu = item.hasSubmenu && Array.isArray(item.links) && item.links.length > 0;
    const isSubOpen = openSubmenus[item.name] || (searchTrimmed.length > 0 && hasSubmenu);
    const navUrl = item.link || item.navigationURL || "";
    const isActive =
      navUrl &&
      (pathname === navUrl ||
        (navUrl !== "/digit-ui/citizen" &&
          navUrl !== "/citizen" &&
          pathname.startsWith(navUrl)));

    const rowStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 14px",
      margin: "2px 8px",
      borderRadius: "6px",
      backgroundColor: isActive ? "#eef2ff" : "transparent",
      color: isActive ? "#4f46e5" : "#374151",
      cursor: "pointer",
      transition: "all 0.15s ease",
      fontSize: "14px",
      fontWeight: isActive ? "500" : "400",
    };

    return (
      <React.Fragment key={item.name + "_" + index}>
        <div
          style={rowStyle}
          onMouseEnter={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = "#f9fafb";
          }}
          onMouseLeave={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
          }}
          onClick={() => {
            if (hasSubmenu) {
              toggleSubmenu(item.name);
            } else {
              handleItemNavigation(navUrl);
            }
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "22px",
                color: isActive ? "#4f46e5" : "#4b5563",
              }}
            >
              {iconComponent}
            </span>
            <span
              style={{
                fontSize: "14px",
                color: isActive ? "#4f46e5" : "#374151",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </div>
          {hasSubmenu && (
            <span style={{ color: "#9ca3af", display: "flex", alignItems: "center", flexShrink: 0 }}>
              {isSubOpen ? <ArrowVectorDown /> : <ArrowForward />}
            </span>
          )}
        </div>

        {/* Submenu Accordion */}
        {hasSubmenu && isSubOpen && (
          <div style={{ paddingLeft: "42px", paddingRight: "10px" }}>
            {item.links.map((subItem, sIdx) => {
              const subUrl = subItem.navigationURL || subItem.sidebarURL || subItem.url || "";
              const subLabel = getTranslationLabel(subItem.name);
              const isSubActive = pathname === subUrl;
              return (
                <div
                  key={sIdx}
                  onClick={() => handleItemNavigation(subUrl)}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    margin: "2px 0",
                    borderRadius: "4px",
                    fontSize: "13px",
                    cursor: "pointer",
                    color: isSubActive ? "#4f46e5" : "#4b5563",
                    backgroundColor: isSubActive ? "#eef2ff" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubActive) e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {subLabel}
                </div>
              );
            })}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <style>{`
        .citizen-custom-sidebar svg {
          width: 20px !important;
          height: 20px !important;
          min-width: 20px !important;
          fill: currentColor !important;
          display: inline-block !important;
        }
      `}</style>
      <div>
        {/* Backdrop */}
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9998,
            display: isOpen ? "block" : "none",
            transition: "opacity 0.2s ease",
          }}
        />

        {/* Drawer */}
        <div
          className="citizen-custom-sidebar"
          style={{
            position: "fixed",
            top: 0,
            left: isOpen ? 0 : "-320px",
            width: "300px",
            height: "100vh",
            backgroundColor: "#ffffff",
            zIndex: 9999,
            transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            boxShadow: isOpen ? "4px 0 16px rgba(0,0,0,0.15)" : "none",
          }}
        >
          {profileSection}

          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              margin: "10px 12px 6px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          >
            <SearchIcon style={{ width: "16px", height: "16px", fill: "#9ca3af", flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t("SEARCH") || "SEARCH"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                width: "100%",
                fontSize: "13px",
                color: "#374151",
              }}
            />
          </div>

          {/* Menu Items List */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, padding: "6px 0" }}>
              {visibleMenuItems.map((item, index) => renderItem(item, index))}

              {/* Logged in Actions (Edit Profile & Logout) */}
              {isLoggedIn && (
                <React.Fragment>
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#f0f0f0",
                      margin: "8px 12px",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      margin: "2px 8px",
                      borderRadius: "6px",
                      color: "#374151",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    onClick={showProfilePage}
                  >
                    <span style={{ display: "flex", alignItems: "center", minWidth: "22px", color: "#4b5563" }}>
                      <EditPencilIcon className="icon" />
                    </span>
                    <span>{t("EDIT_PROFILE")}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      margin: "2px 8px",
                      borderRadius: "6px",
                      color: "#374151",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    onClick={handleLogout}
                  >
                    <span style={{ display: "flex", alignItems: "center", minWidth: "22px", color: "#4b5563" }}>
                      <LogoutIcon className="icon" />
                    </span>
                    <span>{t("CORE_COMMON_LOGOUT")}</span>
                  </div>
                </React.Fragment>
              )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: "1px solid #f0f0f0", padding: "12px 16px" }}>
              <div style={{ fontSize: "0.75rem", color: "#767676", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.25rem 0", fontWeight: "500" }}>© 2025 mSeva Punjab</p>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#9e9e9e" }}>Powered by UPMCGCL</p>
              </div>
            </div>
          </div>
        </div>

        {showDialog && (
          <LogoutDialog onSelect={handleOnSubmit} onCancel={handleOnCancel} onDismiss={handleOnCancel} />
        )}
      </div>
    </React.Fragment>
  );
};

export default StaticCitizenSideBar;
