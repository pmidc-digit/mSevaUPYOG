import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HomeIcon,
  TrackIcon,
  PropertyIcon,
  TaxIcon,
  LicenseIcon,
  ChallanIcon,
  VenueIcon,
  FireIcon,
  WaterIcon,
  BuildingIcon,
  GrievanceIcon,
  SurveyIcon,
  PhoneIcon,
  PinIcon,
  ShieldCheckIcon,
  LogoutIcon,
  UserIcon,
  CloseIcon,
  ChevronDownIcon,
} from "./FlyoutSidebarIcons";

export const FlyoutMiniSidebar = ({
  userDetails,
  onLogout,
  isOpen: controlledIsOpen,
  toggleSidebar,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();

  // Pin state: read initial from localStorage
  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem("mseva-sidebar-pinned") === "true";
    } catch (e) {
      return false;
    }
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= 768 : false));
  const debounceTimerRef = useRef(null);
  const sidebarRef = useRef(null);

  // Expanded state is true if pinned, hovered, or controlled from external trigger
  const isExpanded = isPinned || isHovered || Boolean(controlledIsOpen);

  // Sync body classes for desktop page margin offset
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (!isMobile) {
        document.body.classList.add("has-icon-rail");
      } else {
        document.body.classList.remove("has-icon-rail");
      }

      if (isPinned && !isMobile) {
        document.body.classList.add("sidebar-pinned");
      } else {
        document.body.classList.remove("sidebar-pinned");
      }
    }

    try {
      localStorage.setItem("mseva-sidebar-pinned", isPinned ? "true" : "false");
    } catch (e) {}
  }, [isPinned, isMobile]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        document.body.classList.remove("has-icon-rail");
        document.body.classList.remove("sidebar-pinned");
      } else {
        document.body.classList.add("has-icon-rail");
        if (isPinned) {
          document.body.classList.add("sidebar-pinned");
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isPinned]);

  // Left edge hover & external event listeners (☰ Hamburger, etc.)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isMobile || isPinned) return;
      // When cursor moves into left 60px rail zone
      if (e.clientX <= 60) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        setIsHovered(true);
      }
    };

    const handleOpenEvent = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setIsHovered(true);
    };

    const handleToggleEvent = () => {
      if (isPinned) {
        setIsPinned(false);
        setIsHovered(false);
      } else {
        setIsHovered((prev) => !prev);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("open-mseva-sidebar", handleOpenEvent);
    window.addEventListener("toggle-mseva-sidebar", handleToggleEvent);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("open-mseva-sidebar", handleOpenEvent);
      window.removeEventListener("toggle-mseva-sidebar", handleToggleEvent);
    };
  }, [isMobile, isPinned]);

  // Mouse Enter on sidebar
  const handleMouseEnter = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setIsHovered(true);
  };

  // Mouse Leave with smooth 280ms debounce
  const handleMouseLeave = () => {
    if (isPinned || isMobile) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsUserMenuOpen(false);
    }, 280);
  };

  // Close handler for mobile backdrop
  const handleClose = () => {
    setIsHovered(false);
    setIsUserMenuOpen(false);
    if (toggleSidebar) toggleSidebar(false);
  };

  // Toggle Pin
  const togglePin = () => {
    setIsPinned((prev) => !prev);
  };

  // Navigation helper
  const navigateTo = (path) => {
    history.push(path);
    if (isMobile) {
      handleClose();
    }
  };

  // Language switcher for sidebar footer
  const handleLanguageChange = (localeCode) => {
    const stateId = Digit?.ULBService?.getStateId?.() || "pb";
    if (Digit?.LocalizationService?.changeLanguage) {
      Digit.LocalizationService.changeLanguage(localeCode, stateId);
    }
  };

  // User identity details
  const userInfo = userDetails?.info || Digit?.UserService?.getUser?.()?.info;
  const userName = userInfo?.name || "Binit Rana";
  const mobileNumber = userInfo?.mobileNumber || "9463594144";
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "BR";

  // Label localization helper to avoid raw key rendering
  const getLocalizedLabel = (key, fallback) => {
    const localized = t(key);
    if (!localized || localized === key) {
      return fallback;
    }
    return localized;
  };

  // Core items
  const coreItems = [
    {
      id: "home",
      label: getLocalizedLabel("CORE_COMMON_HOME", "Home"),
      path: "/digit-ui/citizen",
      icon: <HomeIcon size={20} />,
      tooltip: "Home",
    },
    {
      id: "track",
      label: getLocalizedLabel("TRACK_APPLICATIONS", "Track Applications"),
      path: "/digit-ui/citizen/pt/property/citizen-search",
      icon: <TrackIcon size={20} />,
      tooltip: "Track Applications",
    },
    {
      id: "properties",
      label: getLocalizedLabel("MY_PROPERTIES", "My Properties"),
      path: "/digit-ui/citizen/pt/property/my-properties",
      icon: <PropertyIcon size={20} />,
      tooltip: "My Properties",
    },
  ];

  // Municipal services items
  const municipalItems = [
    {
      id: "pt",
      label: getLocalizedLabel("PROPERTY_TAX", "Property Tax Assessment"),
      path: "/digit-ui/citizen/pt-home",
      icon: <TaxIcon size={20} />,
      badge: "Active",
      tooltip: "Property Tax Assessment",
    },
    {
      id: "tl",
      label: getLocalizedLabel("TRADE_LICENSE", "Trade License & Hoardings"),
      path: "/digit-ui/citizen/tl-home",
      icon: <LicenseIcon size={20} />,
      tooltip: "Trade License & Hoardings",
    },
    {
      id: "challan",
      label: getLocalizedLabel("CHALLAN_GENERATION", "Challan Generation"),
      path: "/digit-ui/citizen/challan-home",
      icon: <ChallanIcon size={20} />,
      tooltip: "Challan Generation",
    },
    {
      id: "chb",
      label: getLocalizedLabel("VENUE_BOOKING", "Venue Booking"),
      path: "/digit-ui/citizen/chb-home",
      icon: <VenueIcon size={20} />,
      tooltip: "Venue Booking",
    },
    {
      id: "firenoc",
      label: getLocalizedLabel("FIRE_NOC", "Fire NOC"),
      path: "/digit-ui/citizen/firenoc-home",
      icon: <FireIcon size={20} />,
      tooltip: "Fire NOC",
    },
    {
      id: "ws",
      label: getLocalizedLabel("WATER_AND_SEWERAGE", "Water & Sewerage"),
      path: "/digit-ui/citizen/ws-home",
      icon: <WaterIcon size={20} />,
      tooltip: "Water & Sewerage",
    },
    {
      id: "obps",
      label: getLocalizedLabel("BUILDING_PLAN_APPROVAL", "Building Plan Approval"),
      path: "/digit-ui/citizen/obps-home",
      icon: <BuildingIcon size={20} />,
      tooltip: "Building Plan Approval",
    },
  ];

  // Grievance items
  const grievanceItems = [
    {
      id: "pgr",
      label: getLocalizedLabel("PUBLIC_GRIEVANCES", "Public Grievances"),
      path: "/digit-ui/citizen/pgr-home",
      icon: <GrievanceIcon size={20} />,
      tooltip: "Public Grievances",
    },
    {
      id: "survey",
      label: getLocalizedLabel("SOCIAL_SURVEY", "Social Survey"),
      path: "/digit-ui/citizen/engagement/surveys",
      icon: <SurveyIcon size={20} />,
      tooltip: "Social Survey",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && isExpanded && (
        <div
          className="mseva-sidebar-backdrop fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Main Dual-State Flyout Sidebar (Permanent Rail -> Expands on Hover) */}
      <aside
        ref={sidebarRef}
        className={`mseva-rail-sidebar ${isExpanded ? "expanded" : "collapsed"} ${isPinned && !isMobile ? "pinned" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Citizen Navigation Rail"
        aria-expanded={isExpanded}
      >
        {/* 1. Header Block: Mini Avatar in Collapsed Rail -> Full User Card on Expand */}
        <div className="mseva-rail-header">
          {/* User Card */}
          <div className="mseva-user-card-wrapper">
            <div
              className="mseva-avatar-container"
              onClick={() => {
                if (!isExpanded) setIsHovered(true);
              }}
              title={isExpanded ? "" : `${userName} (Account)`}
            >
              {userInfo?.photo ? (
                <img src={userInfo.photo} alt={userName} className="mseva-avatar-photo" />
              ) : (
                <div className="mseva-avatar-badge">{initials}</div>
              )}
              {/* Online Green Pulsing Indicator */}
              <span className="mseva-online-indicator" title="Online" />
            </div>

            {/* Revealed when expanded */}
            <div className="mseva-user-info-expanded">
              <div className="mseva-user-primary-row">
                <span className="mseva-user-display-name" title={userName}>
                  {userName}
                </span>
                <span className="mseva-verified-chip" title="Verified Citizen Account">
                  <ShieldCheckIcon size={11} />
                  <span>Verified</span>
                </span>
              </div>
              <div className="mseva-user-contact">{mobileNumber}</div>
            </div>

            {/* Mobile Close Button */}
            {isMobile && isExpanded && (
              <button
                type="button"
                className="mseva-mobile-close-btn"
                onClick={handleClose}
                aria-label="Close menu"
              >
                <CloseIcon size={18} />
              </button>
            )}
          </div>

          {/* Account Options Dropdown (Expanded Only) */}
          <div className="mseva-account-dropdown-wrapper">
            <button
              type="button"
              className="mseva-account-dropdown-trigger"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              aria-expanded={isUserMenuOpen}
            >
              <span>Account Options</span>
              <ChevronDownIcon
                className={`transform transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isUserMenuOpen && (
              <div className="mseva-account-dropdown-panel">
                <button
                  type="button"
                  className="mseva-dropdown-action-item"
                  onClick={() => navigateTo("/digit-ui/citizen/user/profile")}
                >
                  <UserIcon size={14} />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  className="mseva-dropdown-action-item text-rose-400 hover:text-rose-300"
                  onClick={() => {
                    if (onLogout) onLogout();
                    else Digit?.UserService?.logout?.();
                  }}
                >
                  <LogoutIcon size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Scrollable Navigation Rail Body */}
        <div className="mseva-rail-body custom-mseva-scrollbar">
          {/* Core Services Section */}
          <div className="mseva-nav-group">
            <div className="mseva-group-header">Core Services</div>
            <ul className="mseva-group-list">
              {coreItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.id} className="mseva-nav-item-li">
                    <button
                      type="button"
                      className={`mseva-nav-item-btn ${isActive ? "active" : ""}`}
                      onClick={() => navigateTo(item.path)}
                      title={!isExpanded ? item.tooltip : ""}
                    >
                      <span className="mseva-item-icon">{item.icon}</span>
                      <span className="mseva-item-label">{item.label}</span>
                      {/* Collapsed Tooltip Bubble */}
                      {!isExpanded && <span className="mseva-rail-tooltip">{item.tooltip}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mseva-nav-divider" />

          {/* Municipal Services Section */}
          <div className="mseva-nav-group">
            <div className="mseva-group-header">Municipal Services</div>
            <ul className="mseva-group-list">
              {municipalItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.id} className="mseva-nav-item-li">
                    <button
                      type="button"
                      className={`mseva-nav-item-btn ${isActive ? "active" : ""}`}
                      onClick={() => navigateTo(item.path)}
                      title={!isExpanded ? item.tooltip : ""}
                    >
                      <span className="mseva-item-icon">{item.icon}</span>
                      <span className="mseva-item-label">{item.label}</span>
                      {item.badge && <span className="mseva-item-badge">{item.badge}</span>}
                      {/* Collapsed Tooltip Bubble */}
                      {!isExpanded && <span className="mseva-rail-tooltip">{item.tooltip}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mseva-nav-divider" />

          {/* Grievance & Redressal Section */}
          <div className="mseva-nav-group">
            <div className="mseva-group-header">Grievance & Redressal</div>
            <ul className="mseva-group-list">
              {grievanceItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.id} className="mseva-nav-item-li">
                    <button
                      type="button"
                      className={`mseva-nav-item-btn ${isActive ? "active" : ""}`}
                      onClick={() => navigateTo(item.path)}
                      title={!isExpanded ? item.tooltip : ""}
                    >
                      <span className="mseva-item-icon">{item.icon}</span>
                      <span className="mseva-item-label">{item.label}</span>
                      {/* Collapsed Tooltip Bubble */}
                      {!isExpanded && <span className="mseva-rail-tooltip">{item.tooltip}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 3. Footer Utility Rail */}
        <div className="mseva-rail-footer">
          {/* Toll-Free Helpline */}
          <a
            href="tel:1100"
            className="mseva-helpline-action"
            title="Call Toll-Free Helpline 1100"
          >
            <span className="mseva-live-pulse-dot" />
            <PhoneIcon size={16} />
            <span className="mseva-helpline-title">Toll-Free 1100</span>
            {!isExpanded && <span className="mseva-rail-tooltip">Helpline 1100</span>}
          </a>

          {/* Language Selector Pills (Visible on expand) */}
          <div className="mseva-footer-lang-switcher" role="group" aria-label="Language Selector">
            <button
              type="button"
              className="mseva-lang-pill-btn"
              onClick={() => handleLanguageChange("en_IN")}
            >
              EN
            </button>
            <span className="mseva-lang-sep-char">/</span>
            <button
              type="button"
              className="mseva-lang-pill-btn"
              onClick={() => handleLanguageChange("pn_IN")}
            >
              ਪੰ
            </button>
            <span className="mseva-lang-sep-char">/</span>
            <button
              type="button"
              className="mseva-lang-pill-btn"
              onClick={() => handleLanguageChange("hi_IN")}
            >
              हि
            </button>
          </div>

          {/* Pin Sidebar Button */}
          {!isMobile && (
            <button
              type="button"
              className={`mseva-pin-action-btn ${isPinned ? "is-pinned" : ""}`}
              onClick={togglePin}
              title={isPinned ? "Unpin sidebar (auto-collapse)" : "Pin sidebar open"}
              aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              <PinIcon size={16} pinned={isPinned} />
              {!isExpanded && <span className="mseva-rail-tooltip">{isPinned ? "Unpin" : "Pin"}</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default FlyoutMiniSidebar;
