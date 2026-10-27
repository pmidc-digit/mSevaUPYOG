import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import {
  HomeIcon,
  PropertyHouse,
  PTIcon,
  CaseIcon,
  PGRIcon,
  WSICon,
  CollectionIcon,
  MCollectIcon,
  OBPSIcon,
  FirenocIcon,
  PTRIcon,
  ReceiptIcon,
  DocumentIconSolid,
  ComplaintIcon,
  SearchIcon,
  ArrowForward,
  ArrowVectorDown,
  EditPencilIcon,
  LogoutIcon,
  Loader,
} from "@mseva/digit-ui-react-components";
import LogoutDialog from "../../Dialog/LogoutDialog";
import SidebarProfile from "./SidebarProfile";

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

  const user = Digit.UserService?.getUser?.();
  const isLoggedIn = !!(user && user.access_token);
  const userRoles = user?.info?.roles || [];
  const hasPescoRole = userRoles.some((r) => r.code === "PESCO");
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { stateInfo } = storeData || {};

  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Dynamic access control query from backend (uses CITIZEN role)
  const { isLoading: isAccessLoading, data: accessControlData } = Digit.Hooks.useAccessControl();

  const drawerRef = useRef(null);
  const listRef = useRef(null);

  const handleClose = () => {
    Digit.clikOusideFired = true;
    if (closeSidebar) closeSidebar();
    else if (toggleSidebar) toggleSidebar(false);
  };

  Digit.Hooks.useClickOutside(drawerRef, isOpen ? handleClose : null, isOpen);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [isOpen]);

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

  const resolveCitizenNavUrl = (navUrl) => {
    if (!navUrl) return "/digit-ui/citizen";
    if (navUrl.startsWith("http://") || navUrl.startsWith("https://")) return navUrl;

    // Direct match for home
    if (navUrl === "/" || navUrl === "/digit-ui/citizen" || navUrl === "digit-ui/citizen") {
      return "/digit-ui/citizen";
    }

    // Already a complete digit-ui route
    if (navUrl.startsWith("/digit-ui")) return navUrl;
    if (navUrl.startsWith("digit-ui")) return `/${navUrl}`;

    // Normalize known citizen routes from monolith
    const trimmed = navUrl.replace(/^\/+/, "");
    const lower = trimmed.toLowerCase();

    // Property Tax
    if (lower === "property-tax" || lower === "property-tax/" || lower === "pt-home") {
      return "/digit-ui/citizen/pt-home";
    }
    if (lower === "property-tax/my-properties") {
      return "/digit-ui/citizen/pt/property/my-properties";
    }
    if (lower === "property-tax/my-applications") {
      return "/digit-ui/citizen/pt/property/my-applications";
    }
    if (lower === "property-tax/my-payments" || lower === "property-tax/my-receipts") {
      return "/digit-ui/citizen/pt/property/my-payments";
    }
    if (lower === "property-tax/assess-pay" || lower.startsWith("property-tax/assess-pay")) {
      return "/digit-ui/citizen/pt/property/citizen-search";
    }
    if (lower === "property-tax/assessment-form") {
      return "/digit-ui/citizen/pt/property/create-application";
    }
    if (lower.startsWith("property-tax/")) {
      return `/digit-ui/citizen/pt/${trimmed.replace(/^property-tax\//i, "")}`;
    }

    // Complaints / PGR
    if (lower === "pgr" || lower === "pgr-home" || lower === "complaints") {
      return "/digit-ui/citizen/pgr-home";
    }
    if (lower === "my-complaints" || lower === "pgr/complaints") {
      return "/digit-ui/citizen/pgr/complaints";
    }
    if (lower === "add-complaint" || lower === "pgr/create-complaint") {
      return "/digit-ui/citizen/pgr/create-complaint";
    }
    if (lower.startsWith("pgr/")) {
      return `/digit-ui/citizen/pgr/${trimmed.replace(/^pgr\//i, "")}`;
    }

    // Water & Sewerage (Micro-ui registers ws-home, NOT wns-home)
    if (lower === "wns" || lower === "ws" || lower === "wns-citizen/home") {
      return "/digit-ui/citizen/ws-home";
    }
    if (lower === "wns/search" || lower === "ws/search") {
      return "/digit-ui/citizen/ws/search";
    }
    if (lower === "wns/my-bills" || lower === "ws/my-bills") {
      return "/digit-ui/citizen/ws/my-bills";
    }
    if (lower === "wns/my-applications" || lower === "ws/my-applications") {
      return "/digit-ui/citizen/ws/my-applications";
    }
    if (lower === "wns/create-application" || lower === "ws/create-application" || lower === "wns/apply") {
      return "/digit-ui/citizen/ws/create-application";
    }
    if (lower.startsWith("wns/")) {
      return `/digit-ui/citizen/ws/${trimmed.replace(/^wns\//i, "")}`;
    }
    if (lower.startsWith("ws/")) {
      return `/digit-ui/citizen/ws/${trimmed.replace(/^ws\//i, "")}`;
    }

    // Fire NOC
    if (lower === "fire-noc" || lower === "noc" || lower === "fire-noc/") {
      return "/digit-ui/citizen/noc-home";
    }
    if (lower === "fire-noc/search" || lower === "noc/search" || lower === "noc/search-application") {
      return "/digit-ui/citizen/noc/search-application";
    }
    if (lower === "fire-noc/apply" || lower === "noc/new-application" || lower === "fire-noc/new-application") {
      return "/digit-ui/citizen/noc/new-application";
    }
    if (lower === "fire-noc/my-applications" || lower === "noc/my-application" || lower === "noc/noc-my-application") {
      return "/digit-ui/citizen/noc/my-application";
    }
    if (lower.startsWith("fire-noc/")) {
      return `/digit-ui/citizen/noc/${trimmed.replace(/^fire-noc\//i, "")}`;
    }
    if (lower.startsWith("noc/")) {
      return `/digit-ui/citizen/noc/${trimmed.replace(/^noc\//i, "")}`;
    }

    // Trade License
    if (lower === "tradelicense" || lower === "tradelicence" || lower === "tl" || lower === "tradelicense-citizen/home") {
      return "/digit-ui/citizen/tl-home";
    }
    if (lower === "tradelicense/apply" || lower === "tradelicence/apply" || lower === "tradelicence/new-application") {
      return "/digit-ui/citizen/tl/tradelicence/new-application";
    }
    if (lower === "tradelicense/my-applications" || lower === "tradelicence/my-application" || lower === "tradelicense/my-application") {
      return "/digit-ui/citizen/tl/tradelicence/my-application";
    }
    if (lower === "tradelicense/my-bills" || lower === "tradelicence/my-bills") {
      return "/digit-ui/citizen/tl/tradelicence/my-bills";
    }
    if (lower.startsWith("tradelicense/") || lower.startsWith("tradelicence/")) {
      return `/digit-ui/citizen/tl/${trimmed.replace(/^tradelicen[cs]e\//i, "tradelicence/")}`;
    }

    // Pet Registration
    if (lower === "pet" || lower === "ptr" || lower === "ptr-home") {
      return "/digit-ui/citizen/ptr-home";
    }
    if (lower === "ptr/apply" || lower === "pet/apply") {
      return "/digit-ui/citizen/ptr/petservice/new-application";
    }
    if (lower === "ptr/my-applications" || lower === "pet/my-applications") {
      return "/digit-ui/citizen/ptr/petservice/my-applications";
    }

    // Venue Booking (CHB)
    if (lower === "venue" || lower === "chb" || lower === "chb-home") {
      return "/digit-ui/citizen/chb-home";
    }
    if (lower === "chb/book" || lower === "chb/book-hall") {
      return "/digit-ui/citizen/chb/book-hall";
    }
    if (lower === "chb/my-applications") {
      return "/digit-ui/citizen/chb/my-applications";
    }

    // No Dues Certificate (NDC)
    if (lower === "ndc" || lower === "no-dues" || lower === "ndc-home") {
      return "/digit-ui/citizen/ndc-home";
    }

    // Building Plan Approval (OBPS / BPA)
    if (lower === "bpa" || lower === "obps" || lower === "obps-home") {
      return "/digit-ui/citizen/obps-home";
    }
    if (lower.startsWith("bpa/") || lower.startsWith("obps/")) {
      return `/digit-ui/citizen/${trimmed}`;
    }
    if (lower === "edcr" || lower.startsWith("edcr")) {
      return "/digit-ui/citizen/core/edcr/scrutiny";
    }

    // MCollect / Receipts
    if (lower === "uc-citizen/search" || lower === "uc-citizen" || lower === "mcollect") {
      return "/digit-ui/citizen/payment/my-bills/mcollect";
    }

    // BillGenie / ABG
    if (lower === "abg/billsearch" || lower === "abg") {
      return "/digit-ui/citizen/abg/billSearch";
    }

    // If it's explicitly a legacy monolith route, keep /citizen/ prefix
    if (lower.startsWith("citizen/")) return `/${trimmed}`;

    return `/digit-ui/citizen/${trimmed}`;
  };

  const handleNavigation = (navUrl) => {
    handleClose();
    if (!navUrl) return;
    const target = resolveCitizenNavUrl(navUrl);
    if (target.startsWith("http://") || target.startsWith("https://")) {
      window.open(target, "_blank", "noopener,noreferrer");
    } else if (target.startsWith("/citizen/")) {
      // Legacy monolith route outside micro-ui: trigger page load
      window.location.assign(target);
    } else {
      history.push(target);
    }
  };

  // Standard micro icon mapping by module
  const getModuleIcon = (key = "") => {
    const k = key.toLowerCase();
    if (k.includes("home")) return <HomeIcon className="icon" />;
    if (k.includes("pt") || k.includes("property")) return <PropertyHouse className="icon" />;
    if (k.includes("fire")) return <FirenocIcon className="icon" />;
    if (k.includes("pgr") || k.includes("complaint")) return <PGRIcon className="icon" />;
    if (k.includes("ws") || k.includes("water") || k.includes("sewerage")) return <WSICon className="icon" />;
    if (k.includes("bpa") || k.includes("building")) return <OBPSIcon className="icon" />;
    if (k.includes("tl") || k.includes("trade")) return <CaseIcon className="icon" />;
    if (k.includes("pet") || k.includes("ptr")) return <PTRIcon className="icon" />;
    if (k.includes("chb") || k.includes("venue")) return <PropertyHouse className="icon" />;
    if (k.includes("ndc") || k.includes("due")) return <MCollectIcon className="icon" />;
    if (k.includes("receipt") || k.includes("uc")) return <CollectionIcon className="icon" />;
    if (k.includes("survey") || k.includes("engagement")) return <ComplaintIcon className="icon" />;
    return <CollectionIcon className="icon" />;
  };

  // User-friendly display names for top-level modules
  const getDisplayName = (topKey, defaultName) => {
    const upper = topKey.toUpperCase();
    const tryT = (k, fallback) => {
      const trans = t(k);
      return trans && trans !== k ? trans : fallback;
    };

    if (upper === "HOME") return tryT("CS_HOME_HEADER_HOME", "Home");
    if (upper === "PROPERTY TAX") return tryT("ACTION_TEST_PROPERTY_TAX", "Property Tax");
    if (upper === "PROPERTY TAX UPGRADE") return tryT("ACTION_TEST_PROPERTY_TAX_UPGRADE", "Property Tax Upgrade");
    if (upper === "COMPLAINTS") return tryT("ACTION_TEST_COMPLAINTS", "Complaints");
    if (upper === "PET") return tryT("ACTION_TEST_PET_REGISTRATION", "Pet Registration");
    if (upper === "CHB") return tryT("ACTION_TEST_VENUE_BOOKING", "Venue Booking");
    if (upper === "NDC") return tryT("ACTION_TEST_NO_DUES_CERTIFICATE", "No Dues Certificate");
    if (upper === "BPA") return tryT("ACTION_TEST_BUILDING_PLAN_APPROVAL", "Building Plan Approval");
    if (upper === "FIRE NOC UPGRADE") return tryT("ACTION_TEST_FIRE_NOC_UPGRADE", "Fire NOC Upgrade");
    if (upper === "FIRE-NOC") return tryT("ACTION_TEST_FIRE_NOC", "Fire NOC");
    if (upper === "ENGAGEMENT") return tryT("CS_HOME_SURVEY", "Survey");
    if (upper === "UC") return tryT("ACTION_TEST_RECEIPTS", "Receipts");
    if (upper === "W_S") return tryT("ACTION_TEST_WATER_SEWERAGE", "Water & Sewerage");
    if (upper === "TRADELICENSE") return tryT("ACTION_TEST_TRADE_LICENSE", "Trade License");
    return defaultName || topKey;
  };

  // Dynamic Menu Items parsed 100% from accessControlData.actions (matches Mono ActionMenu logic)
  const menuItems = useMemo(() => {
    const rawActions = accessControlData?.actions || [];
    if (!rawActions || rawActions.length === 0) return [];

    const validActions = rawActions.filter(
      (a) =>
        a &&
        a.enabled !== false &&
        a.path &&
        (a.url === "url" || a.url === "quickAction") &&
        !a.navigationURL?.toLowerCase()?.includes("/employee/")
    );

    // Block internal employee backend actions that are not on the citizen sidebar
    const blockedPaths = new Set([
      "ADMINISTRATION",
      "BILLING SERVICE",
      "BILLINGSERVICE",
      "FIRE NOC UPGRADE",
    ]);

    const groupMap = new Map();

    validActions.forEach((item) => {
      const parts = item.path.split(".");
      const topKey = parts[0].trim();
      const topUpper = topKey.toUpperCase();

      if (blockedPaths.has(topUpper)) return;
      if (topUpper === "SWACH" && !hasPescoRole) return;

      if (!groupMap.has(topKey)) {
        groupMap.set(topKey, {
          key: topKey,
          name: getDisplayName(topKey, item.displayName || topKey),
          orderNumber: item.orderNumber ?? 999,
          navigationURL: item.navigationURL,
          links: [],
          hasSubmenu: false,
        });
      }

      const group = groupMap.get(topKey);

      if (parts.length > 1) {
        // Child item of parent module
        // Skip internal reports or employee-bound links in citizen view
        if (topUpper === "PROPERTY TAX" && item.path.toLowerCase().includes("report")) {
          return;
        }
        if (item.navigationURL?.toLowerCase()?.includes("/employee/")) {
          return;
        }

        group.links.push({
          ...item,
          displayName: item.displayName || parts.slice(1).join("."),
          navigationURL: item.navigationURL?.startsWith("/") ? item.navigationURL : `/${item.navigationURL}`,
        });
        group.hasSubmenu = true;
      } else {
        // Direct top-level item
        group.navigationURL = item.navigationURL?.startsWith("/") ? item.navigationURL : `/${item.navigationURL}`;
        group.orderNumber = Math.min(group.orderNumber, item.orderNumber ?? 999);
      }
    });

    // If Property Tax had only report sub-items that were filtered out, make it a single direct link
    if (groupMap.has("Property Tax")) {
      const ptGroup = groupMap.get("Property Tax");
      if (ptGroup.links.length === 0) {
        ptGroup.hasSubmenu = false;
        ptGroup.navigationURL = "/digit-ui/citizen/pt-home";
      }
    }

    // Filter out any empty groups that have no valid links and no direct navigation URL
    let items = Array.from(groupMap.values()).filter(
      (group) => !group.hasSubmenu || (group.links && group.links.length > 0) || group.navigationURL
    );

    // Ensure Home exists with canonical properties
    const homeIdx = items.findIndex((i) => i.key.toUpperCase() === "HOME");
    if (homeIdx !== -1) {
      items[homeIdx].orderNumber = 0;
      items[homeIdx].navigationURL = "/digit-ui/citizen";
      items[homeIdx].name = "Home";
      items[homeIdx].hasSubmenu = false;
    } else {
      items.unshift({
        key: "Home",
        name: "Home",
        orderNumber: 0,
        navigationURL: "/digit-ui/citizen",
        links: [],
        hasSubmenu: false,
      });
    }

    // Exact Mono PESCO role filtering: PESCO citizens ONLY see SWACH (plus Home); non-PESCO citizens never see SWACH
    if (hasPescoRole) {
      items = items.filter(
        (menu) => menu.key?.toUpperCase() === "SWACH" || menu.key?.toUpperCase() === "HOME"
      );
    } else {
      items = items.filter((menu) => menu.key?.toUpperCase() !== "SWACH");
    }

    // Sort by orderNumber asc (exact monolith ActionMenu logic)
    items.sort((a, b) => (a.orderNumber ?? 999) - (b.orderNumber ?? 999));

    return items;
  }, [accessControlData, hasPescoRole, t]);

  const filteredItems = menuItems;

  return (
    <React.Fragment>
      <div>
        {/* Backdrop overlay */}
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            height: "calc(100vh - 76px)",
            width: "100%",
            top: "76px",
            left: isOpen ? "0px" : "-100%",
            opacity: isOpen ? "1" : "0",
            backgroundColor: "rgba(0, 0, 0, 0.54)",
            willChange: "opacity",
            transform: "translateZ(0px)",
            transition: "opacity 400ms cubic-bezier(0.23, 1, 0.32, 1)",
            zIndex: "1200",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        />

        {/* Sidebar Drawer starting beneath the header bar */}
        <div
          ref={drawerRef}
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "0",
            height: "calc(100vh - 76px)",
            position: "fixed",
            top: "76px",
            left: 0,
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "#ffffff",
            zIndex: "1250",
            maxWidth: "350px",
            minWidth: "330px",
            width: "350px",
            transform: isOpen ? "translateX(0)" : "translateX(-100%)",
            boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
            overflowY: "hidden",
          }}
        >
          <div
            className="drawer-desktop"
            style={{
              backgroundColor: "white",
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* User Profile Card when logged in */}
            {isLoggedIn && user?.info && (
              <SidebarProfile info={user.info} stateName={stateInfo?.name} t={t} />
            )}

            {/* Menu Items List using previous micro classes (.sidebar-list, .menu-item, etc.) */}
            <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
              {isAccessLoading && menuItems.length === 0 ? (
                <Loader />
              ) : (
                filteredItems.map((item, index) => {
                  const leftIcon = getModuleIcon(item.key);
                  const resolvedNav = resolveCitizenNavUrl(item.navigationURL);
                  const isChildActive = item.links?.some((l) => resolveCitizenNavUrl(l.navigationURL) === pathname);
                  const isActive = pathname === resolvedNav || isChildActive;
                  const isSubOpen = !!openSubmenus[item.key];

                  return (
                    <div key={item.key || index}>
                      <div
                        className={`sidebar-list ${isActive ? "active" : ""}`}
                        style={{
                          backgroundColor: isActive ? "#eef2ff" : "transparent",
                          borderLeft: isActive ? "3px solid #4f46e5" : "3px solid transparent",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = "#f9fafb";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <span
                          className="menu-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "0.75rem",
                            color: isActive ? "#4f46e5" : "#374151",
                            cursor: "pointer",
                            textDecoration: "none",
                            fontSize: "0.9375rem",
                            fontWeight: isActive ? "500" : "400",
                            marginLeft: "10px",
                            marginRight: "10px",
                            padding: "6px 0",
                          }}
                          onClick={() => {
                            if (item.hasSubmenu) {
                              toggleSubmenu(item.key);
                            } else {
                              handleNavigation(item.navigationURL);
                            }
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span style={{ display: "flex", alignItems: "center", minWidth: "20px" }}>
                              {leftIcon}
                            </span>
                            <div className="menu-label">{item.name}</div>
                          </div>

                          {item.hasSubmenu && (
                            <span style={{ display: "flex", alignItems: "center", color: "#6b7280" }}>
                              {isSubOpen ? <ArrowVectorDown /> : <ArrowForward />}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Expandable Submenu Items */}
                      {item.hasSubmenu && isSubOpen && item.links && (
                        <div style={{ backgroundColor: "#fbfbfb", borderLeft: "3px solid #e5e7eb" }}>
                          {item.links
                            .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
                            .map((sub, sIdx) => {
                              const resolvedSubNav = resolveCitizenNavUrl(sub.navigationURL);
                              const isSubActive = pathname === resolvedSubNav;
                              return (
                                <div
                                  key={sIdx}
                                  className={`dropdown-link ${isSubActive ? "active" : ""}`}
                                  style={{
                                    padding: "8px 16px 8px 48px",
                                    cursor: "pointer",
                                    fontSize: "0.875rem",
                                    color: isSubActive ? "#4f46e5" : "#4b5563",
                                    fontWeight: isSubActive ? "500" : "400",
                                    backgroundColor: isSubActive ? "#f0f4ff" : "transparent",
                                    transition: "background-color 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSubActive) e.currentTarget.style.backgroundColor = "#f3f4f6";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSubActive) e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                  onClick={() => handleNavigation(sub.navigationURL)}
                                >
                                  <span>{t(sub.displayName) || sub.displayName}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Edit Profile & Logout for logged-in citizen */}
              {isLoggedIn && (
                <React.Fragment>
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#e5e7eb",
                      margin: "8px 12px",
                    }}
                  />
                  <div
                    className="sidebar-list"
                    style={{
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span
                      className="menu-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        color: "#374151",
                        cursor: "pointer",
                        fontSize: "0.9375rem",
                        marginLeft: "10px",
                        marginRight: "10px",
                        padding: "6px 0",
                      }}
                      onClick={showProfilePage}
                    >
                      <span style={{ display: "flex", alignItems: "center", minWidth: "20px" }}>
                        <EditPencilIcon className="icon" />
                      </span>
                      <div className="menu-label">{t("EDIT_PROFILE") || "Edit Profile"}</div>
                    </span>
                  </div>

                  <div
                    className="sidebar-list"
                    style={{
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span
                      className="menu-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        color: "#374151",
                        cursor: "pointer",
                        fontSize: "0.9375rem",
                        marginLeft: "10px",
                        marginRight: "10px",
                        padding: "6px 0",
                      }}
                      onClick={handleLogout}
                    >
                      <span style={{ display: "flex", alignItems: "center", minWidth: "20px" }}>
                        <LogoutIcon className="icon" />
                      </span>
                      <div className="menu-label">{t("CORE_COMMON_LOGOUT") || "Logout"}</div>
                    </span>
                  </div>
                </React.Fragment>
              )}
            </div>

            {/* Previous micro-ui sidebar footer */}
            <div
              className="sidebar-footer"
              style={{
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                padding: "12px 16px",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#6b7280", textAlign: "center" }}>
                <p style={{ margin: "0 0 0.5rem 0" }}>© 2025 mSeva Punjab</p>
                <p style={{ margin: "0" }}>Powered by UPMCGCL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Dialog */}
        {showDialog && (
          <LogoutDialog
            onSelect={handleOnSubmit}
            onCancel={handleOnCancel}
            onDismiss={handleOnCancel}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default StaticCitizenSideBar;
