import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HomeIcon,
  FileSearchIcon,
  Building2Icon,
  MegaphoneIcon,
  ReceiptIcon,
  CalendarDaysIcon,
  FlameIcon,
  DropletsIcon,
  FileCheck2Icon,
  MessageSquareWarningIcon,
  UsersIcon,
  PhoneCallIcon,
  LogOutIcon,
  PinIcon,
  PinOffIcon,
  ShieldCheckIcon,
  UserIcon,
  CloseIcon,
  ChevronDownIcon,
} from "./FlyoutSidebarIcons";

export const FlyoutMiniSidebar = ({
  isOpen = false,
  toggleSidebar,
  onLogout,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  // Desktop hover, left-edge trigger & pin states
  const [isHovered, setIsHovered] = useState(false);
  const [isEdgeHovered, setIsEdgeHovered] = useState(false);
  const [isExternalOpen, setIsExternalOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem("mseva.sidebar.pinned") === "true";
    } catch (e) {
      return false;
    }
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Store data & language hooks from Digit
  const storeData = window.Digit?.Hooks?.useStore?.getInitData?.()?.data;
  const { stateInfo } = storeData || {};
  const selectedLanguage = window.Digit?.StoreData?.getCurrentLanguage?.() || "en_IN";

  // User details from Digit.UserService
  const user = window.Digit?.UserService?.getUser?.();
  const isLoggedIn = Boolean(user && user.access_token);
  const userInfo = user?.info;
  const userName = userInfo?.name || (isLoggedIn ? "Citizen" : "Guest Citizen");
  const userMobile = userInfo?.mobileNumber || "";
  const userPhoto = userInfo?.photo || null;
  const userInitials =
    userName
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || (isLoggedIn ? "C" : "G");

  // Tenant helpline contact
  const tenantId = window.Digit?.ULBService?.getCitizenCurrentTenant?.();
  const helplineNumber =
    storeData?.tenants?.find((e) => e.code === tenantId)?.contactNumber ||
    storeData?.tenants?.[0]?.contactNumber ||
    "1800 1800 0172";

  // Active expanded state
  const isExpanded = isPinned || isHovered || isEdgeHovered || isExternalOpen || isOpen;

  // Manage body classes for page content layout offset
  useEffect(() => {
    document.body.classList.add("has-mseva-mini-sidebar");
    if (isPinned) {
      document.body.classList.add("sidebar-pinned");
    } else {
      document.body.classList.remove("sidebar-pinned");
    }
    return () => {
      document.body.classList.remove("has-mseva-mini-sidebar");
      document.body.classList.remove("sidebar-pinned");
    };
  }, [isPinned]);

  // Global event listener for topbar hamburger & logo triggers
  useEffect(() => {
    const handleCustomToggle = (e) => {
      if (typeof e?.detail?.open === "boolean") {
        setIsExternalOpen(e.detail.open);
      } else {
        setIsExternalOpen((prev) => !prev);
      }
    };

    window.addEventListener("mseva:toggle-sidebar", handleCustomToggle);
    window.toggleMsevaSidebar = (open) => {
      if (typeof open === "boolean") setIsExternalOpen(open);
      else setIsExternalOpen((prev) => !prev);
    };

    return () => {
      window.removeEventListener("mseva:toggle-sidebar", handleCustomToggle);
      delete window.toggleMsevaSidebar;
    };
  }, []);

  // Left-edge mouse move detection: sliding/scrolling to the left opens the menu
  useEffect(() => {
    const handleMouseMove = (e) => {
      // If cursor reaches within 20px of the left edge of the screen
      if (e.clientX <= 20) {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        setIsEdgeHovered(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
    setIsEdgeHovered(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsEdgeHovered(false);
      setIsExternalOpen(false);
      if (toggleSidebar) toggleSidebar(false);
    }, 280);
  };

  // Toggle pin
  const handleTogglePin = (e) => {
    e.stopPropagation();
    const nextPin = !isPinned;
    setIsPinned(nextPin);
    try {
      localStorage.setItem("mseva.sidebar.pinned", nextPin ? "true" : "false");
    } catch (err) {}
  };

  // Language switcher
  const handleLanguageSelect = (langValue) => {
    if (window.Digit?.LocalizationService?.changeLanguage && stateInfo?.code) {
      window.Digit.LocalizationService.changeLanguage(langValue, stateInfo.code);
    }
  };

  // Close mobile drawer
  const handleClose = () => {
    setIsHovered(false);
    setIsEdgeHovered(false);
    setIsExternalOpen(false);
    if (toggleSidebar) {
      toggleSidebar(false);
    }
  };

  // Navigate link
  const handleNavigate = (href) => {
    if (href) {
      history.push(href);
    }
    handleClose();
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleDocClick = () => setShowProfileMenu(false);
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const menuSections = [
    {
      group: "Core",
      items: [
        { label: t("Home") || "Home", icon: HomeIcon, href: "/digit-ui/citizen", badge: null },
        { label: t("Track Applications") || "Track Applications", icon: FileSearchIcon, href: "/digit-ui/citizen/pt/property/citizen-search", badge: null },
        { label: t("My Properties") || "My Properties", icon: Building2Icon, href: "/digit-ui/citizen/pt/property/my-properties", badge: null },
      ],
    },
    {
      group: "Municipal Services",
      items: [
        { label: t("Property Tax") || "Property Tax", icon: Building2Icon, href: "/digit-ui/citizen/pt-home", badge: "Active" },
        { label: t("Trade License & Hoardings") || "Trade License & Hoardings", icon: MegaphoneIcon, href: "/digit-ui/citizen/tl-home", badge: null },
        { label: t("Challan Generation") || "Challan Generation", icon: ReceiptIcon, href: "/digit-ui/citizen/mcollect-home", badge: null },
        { label: t("Venue Booking") || "Venue Booking", icon: CalendarDaysIcon, href: "/digit-ui/citizen/chb-home", badge: null },
        { label: t("Fire NOC") || "Fire NOC", icon: FlameIcon, href: "/digit-ui/citizen/noc-home", badge: null },
        { label: t("Water & Sewerage") || "Water & Sewerage", icon: DropletsIcon, href: "/digit-ui/citizen/ws-home", badge: null },
        { label: t("Building Plan Approval") || "Building Plan Approval", icon: FileCheck2Icon, href: "/digit-ui/citizen/obps-home", badge: null },
      ],
    },
    {
      group: "Grievance & Redressal",
      items: [
        { label: t("Public Grievances") || "Public Grievances", icon: MessageSquareWarningIcon, href: "/digit-ui/citizen/pgr-home", badge: null },
        { label: t("Social Survey") || "Social Survey", icon: UsersIcon, href: "/digit-ui/citizen/social-survey-home", badge: null },
      ],
    },
  ];

  const isItemActive = (item) => {
    if (item.href === "/digit-ui/citizen") {
      return location.pathname === "/digit-ui/citizen" || location.pathname === "/digit-ui/citizen/";
    }
    if (item.href === "/digit-ui/citizen/pt-home") {
      return location.pathname.startsWith("/digit-ui/citizen/pt-home") || location.pathname.startsWith("/digit-ui/citizen/pt");
    }
    if (item.href === "/digit-ui/citizen/tl-home") {
      return location.pathname.startsWith("/digit-ui/citizen/tl-home") || location.pathname.startsWith("/digit-ui/citizen/tl");
    }
    if (item.href === "/digit-ui/citizen/mcollect-home") {
      return location.pathname.startsWith("/digit-ui/citizen/mcollect");
    }
    if (item.href === "/digit-ui/citizen/chb-home") {
      return location.pathname.startsWith("/digit-ui/citizen/chb");
    }
    if (item.href === "/digit-ui/citizen/noc-home") {
      return location.pathname.startsWith("/digit-ui/citizen/noc");
    }
    if (item.href === "/digit-ui/citizen/ws-home") {
      return location.pathname.startsWith("/digit-ui/citizen/ws");
    }
    if (item.href === "/digit-ui/citizen/obps-home") {
      return location.pathname.startsWith("/digit-ui/citizen/obps") || location.pathname.startsWith("/digit-ui/citizen/edcr");
    }
    if (item.href === "/digit-ui/citizen/pgr-home") {
      return location.pathname.startsWith("/digit-ui/citizen/pgr");
    }
    if (item.href === "/digit-ui/citizen/social-survey-home") {
      return location.pathname.startsWith("/digit-ui/citizen/social-survey") || location.pathname.startsWith("/digit-ui/citizen/surveys");
    }
    return location.pathname.startsWith(item.href);
  };

  return (
    <React.Fragment>
      {/* Left-edge invisible hover sensor strip (20px): Scrolling/moving mouse to the left opens the slider menu */}
      <div
        className="mseva-left-edge-sensor"
        onMouseEnter={handleMouseEnter}
        aria-hidden="true"
      />

      {/* Backdrop overlay when open and not pinned */}
      {isExpanded && !isPinned && (
        <div className="mseva-sidebar-backdrop" onClick={handleClose} />
      )}

      {/* Fly-Out Slider Menu */}
      <aside
        className={`mseva-mini-sidebar ${isExpanded ? "expanded slider-open" : "collapsed"} ${isOpen || isExternalOpen ? "mobile-open" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Citizen Navigation Slider"
      >
        {/* TOP: User Identity Header Block */}
        <div className="mseva-sidebar-header">
          <div className="mseva-user-avatar" title={userName}>
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              userInitials
            )}
            {isLoggedIn && <span className="mseva-online-dot" title="Active Citizen Session" />}
          </div>

          {/* Identity Details */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {isLoggedIn ? (
              <React.Fragment>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userName}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileMenu((prev) => !prev);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "2px",
                      cursor: "pointer",
                      color: "#64748B",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Account Menu"
                  >
                    <ChevronDownIcon />
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  {userMobile && (
                    <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }}>
                      {userMobile}
                    </span>
                  )}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#047857",
                      backgroundColor: "#ECFDF5",
                      padding: "1px 5px",
                      borderRadius: "4px",
                    }}
                    title="Verified Punjab Citizen"
                  >
                    <ShieldCheckIcon /> Verified
                  </span>
                </div>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "12px",
                      right: "12px",
                      backgroundColor: "#ffffff",
                      borderRadius: "10px",
                      boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15)",
                      border: "1px solid #E2E8F0",
                      padding: "6px 0",
                      zIndex: 100060,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        history.push("/digit-ui/citizen/user/profile");
                        setShowProfileMenu(false);
                        handleClose();
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 14px",
                        textAlign: "left",
                        border: "none",
                        background: "transparent",
                        color: "#334155",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <UserIcon /> Profile & Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleClose();
                        if (onLogout) onLogout();
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 14px",
                        textAlign: "left",
                        border: "none",
                        background: "transparent",
                        color: "#DC2626",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        borderTop: "1px solid #F1F5F9",
                      }}
                    >
                      <LogOutIcon /> Log Out
                    </button>
                  </div>
                )}
              </React.Fragment>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#334155" }}>
                  Citizen Portal
                </span>
                <button
                  type="button"
                  onClick={() => {
                    history.push("/digit-ui/citizen/login");
                    handleClose();
                  }}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    border: "none",
                    backgroundColor: "#184474",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748B",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
            title="Close Slider Menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* MIDDLE: Scrollable Navigation Links & Semantic Groups */}
        <div className="mseva-sidebar-menu-scroll">
          {menuSections.map((sec, secIdx) => (
            <div key={secIdx} style={{ marginBottom: "12px" }}>
              <div className="mseva-menu-group-header">{sec.group}</div>

              {sec.items.map((item, itemIdx) => {
                const IconComponent = item.icon;
                const active = isItemActive(item);

                return (
                  <button
                    key={itemIdx}
                    type="button"
                    className={`mseva-nav-item ${active ? "active" : ""}`}
                    onClick={() => handleNavigate(item.href)}
                  >
                    <IconComponent className="mseva-nav-icon" />
                    <span className="mseva-nav-label">{item.label}</span>
                    {item.badge && <span className="mseva-nav-badge">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* BOTTOM: Footer Utility Section (Helpline, Language, Pin) */}
        <div className="mseva-sidebar-footer">
          {/* Toll-Free Helpline Chip */}
          <a
            href={`tel:${helplineNumber.replace(/[^0-9]/g, "") || "1100"}`}
            className="mseva-helpline-chip"
            title={`Citizen Helpline: ${helplineNumber}`}
          >
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhoneCallIcon />
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1E293B", display: "block", lineHeight: 1.2 }}>
                Toll-Free 1100
              </span>
              <span style={{ fontSize: "10px", color: "#64748B", display: "block" }}>
                {helplineNumber}
              </span>
            </div>
          </a>

          {/* Quick Language Switcher & Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
            {/* Language Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                type="button"
                onClick={() => handleLanguageSelect("en_IN")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: selectedLanguage.startsWith("en") ? "#184474" : "#F1F5F9",
                  color: selectedLanguage.startsWith("en") ? "#ffffff" : "#475569",
                  transition: "all 150ms ease",
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageSelect("pn_IN")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: selectedLanguage.startsWith("pn") ? "#184474" : "#F1F5F9",
                  color: selectedLanguage.startsWith("pn") ? "#ffffff" : "#475569",
                  transition: "all 150ms ease",
                }}
              >
                ਪੰ
              </button>
              <button
                type="button"
                onClick={() => handleLanguageSelect("hi_IN")}
                style={{
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: selectedLanguage.startsWith("hi") ? "#184474" : "#F1F5F9",
                  color: selectedLanguage.startsWith("hi") ? "#ffffff" : "#475569",
                  transition: "all 150ms ease",
                }}
              >
                हि
              </button>
            </div>

            {/* Pin / Collapse Toggle */}
            <button
              type="button"
              onClick={handleTogglePin}
              style={{
                background: "none",
                border: "none",
                padding: "4px",
                cursor: "pointer",
                color: isPinned ? "#184474" : "#94A3B8",
                display: "flex",
                alignItems: "center",
                borderRadius: "6px",
              }}
              title={isPinned ? "Unpin Slider (Enable Auto-Slide)" : "Pin Slider (Keep Open)"}
            >
              {isPinned ? <PinIcon /> : <PinOffIcon />}
            </button>
          </div>
        </div>
      </aside>
    </React.Fragment>
  );
};

export default FlyoutMiniSidebar;
