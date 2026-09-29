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
} from "@mseva/digit-ui-react-components";
import { Link, useLocation, useHistory } from "react-router-dom";
import SideBarMenu from "../../../config/sidebar-menu";
import { useTranslation } from "react-i18next";
import LogoutDialog from "../../Dialog/LogoutDialog";
import ChangeCity from "../../ChangeCity";
import SidebarProfile from "./SidebarProfile";

const IconsObject = {
  home: <HomeIcon />,
  HomeIcon: <HomeIcon />,
  announcement: <ComplaintIcon />,
  ComplaintIcon: <ComplaintIcon />,
  business: <BPAHomeIcon />,
  BPAHomeIcon: <BPAHomeIcon />,
  store: <PropertyHouse />,
  PropertyHouse: <PropertyHouse />,
  assignment: <CaseIcon />,
  CaseIcon: <CaseIcon />,
  receipt: <ReceiptIcon />,
  ReceiptIcon: <ReceiptIcon />,
  "business-center": <PersonIcon />,
  PersonIcon: <PersonIcon />,
  description: <DocumentIconSolid />,
  DocumentIconSolid: <DocumentIconSolid />,
  "water-tap": <DropIcon />,
  DropIcon: <DropIcon />,
  "collections-bookmark": <CollectionsBookmarIcons />,
  CollectionsBookmarIcons: <CollectionsBookmarIcons />,
  "insert-chart": <FinanceChartIcon />,
  FinanceChartIcon: <FinanceChartIcon />,
  edcr: <CollectionIcon />,
  collections: <CollectionIcon />,
  CollectionIcon: <CollectionIcon />,
  EditPencilIcon: <EditPencilIcon />,
  LogoutIcon: <LogoutIcon />,
  LoginIcon: <LoginIcon />,
  Phone: <Phone />,
  PGRIcon: <ComplaintIcon />,
  OBPSIcon: <BPAHomeIcon />,
  WSIcon: <DropIcon />,
  FirenocIcon: <PersonIcon />,
  propertyIcon: <PropertyHouse />,
  CommonPTIcon: <PropertyHouse />,
  TLIcon: <CaseIcon />,
  BillsIcon: <ReceiptIcon />,
};

const resolveIcon = (iconName, labelText = "") => {
  if (React.isValidElement(iconName)) return iconName;

  let rawKey = typeof iconName === "string" ? iconName : iconName?.type?.name;
  if (rawKey) {
    if (rawKey.includes(":")) rawKey = rawKey.split(":")[1];
    if (rawKey.includes(".")) rawKey = rawKey.split(".")[0];
    if (IconsObject[rawKey]) return IconsObject[rawKey];
  }

  const textLower = (labelText || "").toLowerCase();
  if (textLower.includes("home")) return IconsObject.home;
  if (textLower.includes("property")) return IconsObject.store;
  if (textLower.includes("trade") || textLower.includes("license")) return IconsObject.assignment;
  if (textLower.includes("fire")) return IconsObject.description;
  if (textLower.includes("complaint") || textLower.includes("pgr")) return IconsObject.description;
  if (textLower.includes("water") || textLower.includes("sewerage")) return IconsObject["water-tap"];
  if (textLower.includes("building") || textLower.includes("bpa") || textLower.includes("obps")) return IconsObject["business-center"];
  if (textLower.includes("pet")) return IconsObject["business-center"];
  if (textLower.includes("venue") || textLower.includes("swach") || textLower.includes("chb")) return IconsObject["business-center"];
  if (textLower.includes("due") || textLower.includes("ndc")) return IconsObject.description;
  if (textLower.includes("survey")) return IconsObject.announcement;
  if (textLower.includes("receipt") || textLower.includes("bill") || textLower.includes("collection")) return IconsObject.receipt;
  if (textLower.includes("profile") || textLower.includes("edit")) return IconsObject.EditPencilIcon;
  if (textLower.includes("logout")) return IconsObject.LogoutIcon;

  return IconsObject.description;
};

const StaticCitizenSideBar = ({
  isOpen = false,
  toggleSidebar,
  closeSidebar,
  logout,
  linkData,
  islinkDataLoading,
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
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (islinkDataLoading || !isFetched) {
    return <Loader />;
  }

  const redirectToLoginPage = () => {
    handleClose();
    history.push("/digit-ui/citizen/login");
  };

  const redirectToScrutinyPage = () => {
    handleClose();
    history.push("/digit-ui/citizen/core/edcr/scrutiny");
  };

  const showProfilePage = () => {
    handleClose();
    history.push("/digit-ui/citizen/user/profile");
  };

  const tenantId = Digit.ULBService.getCitizenCurrentTenant();
  const filteredTenantContact =
    storeData?.tenants.filter((e) => e.code === tenantId)[0]?.contactNumber || storeData?.tenants[0]?.contactNumber;

  let menuItems = [
    ...SideBarMenu(t, showProfilePage, redirectToLoginPage, redirectToScrutinyPage, false, storeData, tenantId),
  ];
  menuItems = menuItems.filter((item) => item.element !== "LANGUAGE");

  let profileItem;
  if (isFetched && user && user.access_token) {
    profileItem = <SidebarProfile info={user?.info} stateName={stateInfo?.name} t={t} />;
    menuItems = menuItems.filter((item) => item?.id !== "login-btn" && item?.id !== "help-line");
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
    ];
  }

  const existingLabels = new Set();
  const normalizePath = (url = "") => {
    return url.replace(/^\/?(digit-ui\/)?(citizen\/)?/, "").replace(/\/$/, "").toLowerCase();
  };

  if (linkData) {
    const dynamicItems = [];
    Object.keys(linkData)?.forEach((key) => {
      linkData[key]?.forEach((item) => {
        if (item?.enabled) {
          const rawUrl = item.navigationURL || item.sidebarURL || "";
          const path = normalizePath(rawUrl);
          const name = item.name || "";
          const nameLower = name.toLowerCase();

          // Exclude employee-only modules and reports
          if (path.includes("hrms") || nameLower.includes("hrms") || path.includes("report")) {
            return;
          }

          const displayNameKey = item.displayName
            ? `ACTION_TEST_${item.displayName.toUpperCase().replace(/[ -]/g, "_")}`
            : `ACTION_TEST_${name.toUpperCase().replace(/[ -]/g, "_")}`;

          const translated = t(displayNameKey);
          const label =
            translated !== displayNameKey
              ? translated
              : t(item.displayName) || t(name) || item.displayName || name;

          const labelLower = (label || "").toLowerCase();
          if (existingLabels.has(labelLower)) return;

          existingLabels.add(labelLower);

          const navUrl =
            rawUrl.startsWith("/") || rawUrl.startsWith("http")
              ? rawUrl
              : `/citizen/${rawUrl}`;

          const iconName = item.leftIcon?.includes(":")
            ? item.leftIcon.split(":")[1]
            : item.leftIcon || "ComplaintIcon";

          // Format child sub-links if present
          const childLinks = Array.isArray(item.links)
            ? item.links
                .filter((sub) => sub?.enabled !== false && sub?.navigationURL)
                .map((sub) => {
                  const subRawUrl = sub.navigationURL || sub.sidebarURL || "";
                  const subDisplayNameKey = sub.displayName
                    ? `ACTION_TEST_${sub.displayName.toUpperCase().replace(/[ -]/g, "_")}`
                    : `ACTION_TEST_${(sub.name || "").toUpperCase().replace(/[ -]/g, "_")}`;
                  const subTrans = t(subDisplayNameKey);
                  const subLabel =
                    subTrans !== subDisplayNameKey
                      ? subTrans
                      : t(sub.displayName) || t(sub.name) || sub.displayName || sub.name;
                  return {
                    ...sub,
                    displayName: subLabel,
                    link:
                      subRawUrl.startsWith("/") || subRawUrl.startsWith("http")
                        ? subRawUrl
                        : `/citizen/${subRawUrl}`,
                  };
                })
            : [];

          dynamicItems.push({
            type: childLinks.length > 0 ? "parent" : navUrl.includes("digit-ui") ? "link" : "external-link",
            text: label,
            links: childLinks.length > 0 ? childLinks : linkData[key],
            hasSubmenu: childLinks.length > 0,
            icon: iconName,
            link: navUrl,
          });
        }
      });
    });

    menuItems.splice(1, 0, ...dynamicItems);
  }

  // Filter items by search query
  const filteredMenuItems = menuItems.filter((item) => {
    if (!search || !search.trim()) return true;
    const query = search.trim().toLowerCase();
    const itemText = typeof item.text === "string" ? item.text.toLowerCase() : "";
    if (itemText.includes(query)) return true;
    if (item.links && Array.isArray(item.links)) {
      return item.links.some((sub) => {
        const subName = (sub.displayName || sub.name || "").toLowerCase();
        return subName.includes(query);
      });
    }
    return false;
  });

  const renderMenuItem = (item, index) => {
    const label = typeof item.text === "string" ? item.text : item.action || item.text;
    const leftIcon = resolveIcon(item?.icon, typeof item.text === "string" ? item.text : "");
    const isActive = pathname === item?.link || pathname === item?.sidebarURL;
    const hasSubmenu = item.hasSubmenu && Array.isArray(item.links) && item.links.length > 0;
    const isSubOpen = openSubmenus[index] || (search.trim().length > 0 && hasSubmenu);

    const RowContent = () => (
      <div
        style={{
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
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = "#f9fafb";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
        }}
        onClick={() => {
          if (hasSubmenu) {
            toggleSubmenu(index);
          } else {
            if (item.populators?.onClick) item.populators.onClick();
            handleClose();
          }
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "22px",
              color: isActive ? "#4f46e5" : "#4b5563",
            }}
          >
            {leftIcon}
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
    );

    let mainElement;
    if (hasSubmenu) {
      mainElement = <RowContent />;
    } else if (item.type === "external-link") {
      mainElement = (
        <a href={item.link} style={{ textDecoration: "none", display: "block" }}>
          <RowContent />
        </a>
      );
    } else if (item.type === "link") {
      mainElement = (
        <Link to={item?.link} style={{ textDecoration: "none", display: "block" }}>
          <RowContent />
        </Link>
      );
    } else {
      mainElement = <RowContent />;
    }

    return (
      <React.Fragment key={index}>
        {item?.element === "PROFILE" && (
          <div
            style={{
              height: "1px",
              backgroundColor: "#f0f0f0",
              margin: "8px 12px",
            }}
          />
        )}
        {mainElement}
        {hasSubmenu && isSubOpen && (
          <div style={{ paddingLeft: "42px", paddingRight: "10px" }}>
            {item.links.map((subItem, sIdx) => {
              const isSubActive = pathname === subItem.link || pathname === subItem.navigationURL;
              return (
                <Link
                  key={sIdx}
                  to={subItem.link || subItem.navigationURL}
                  onClick={handleClose}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    margin: "2px 0",
                    borderRadius: "4px",
                    fontSize: "13px",
                    textDecoration: "none",
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
                  {subItem.displayName}
                </Link>
              );
            })}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <style>
        {`
          .citizen-custom-sidebar svg {
            width: 20px !important;
            height: 20px !important;
            min-width: 20px !important;
            fill: currentColor !important;
            display: inline-block !important;
          }
        `}
      </style>
      <div>
        {/* Backdrop overlay */}
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9998,
            display: isOpen ? "block" : "none",
            transition: "opacity 0.2s ease",
          }}
        ></div>

        {/* Sliding Sidebar Drawer */}
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
            transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            boxShadow: isOpen ? "4px 0 16px rgba(0, 0, 0, 0.15)" : "none",
          }}
        >
          {profileItem}

          {/* Search bar matching Screenshot 2 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              margin: "10px 12px 6px 12px",
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

          <div
            className="drawer-desktop"
            style={{
              backgroundColor: "#ffffff",
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, padding: "6px 0" }}>
              {filteredMenuItems.map((item, index) => renderMenuItem(item, index))}
            </div>
            <div
              className="sidebar-footer"
              style={{
                borderTop: "1px solid #f0f0f0",
                backgroundColor: "#ffffff",
                padding: "12px 16px",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#767676", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.25rem 0", fontWeight: "500" }}>© 2025 mSeva Punjab</p>
                <p style={{ margin: "0", fontSize: "0.7rem", color: "#9e9e9e" }}>Powered by UPMCGCL</p>
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
  );
};

export default StaticCitizenSideBar;
