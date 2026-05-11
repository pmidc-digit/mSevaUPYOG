import React, { useEffect, useState } from "react";
import { Toast } from "@mseva/digit-ui-react-components";
import { Link, useHistory } from "react-router-dom";

/* Same 6-color govt palette as citizen dashboard CardBasedOptions */
const govtColors = [
  { iconBg: "#003C71", cardBg: "#EEF4FF", borderHover: "#003C7128" },
  { iconBg: "#00703C", cardBg: "#E8F5EE", borderHover: "#00703C28" },
  { iconBg: "#B5451B", cardBg: "#FFF0EC", borderHover: "#B5451B28" },
  { iconBg: "#1A5CA8", cardBg: "#EBF3FE", borderHover: "#1A5CA828" },
  { iconBg: "#4B3A7C", cardBg: "#F0EBF8", borderHover: "#4B3A7C28" },
  { iconBg: "#006E7F", cardBg: "#E0F2F5", borderHover: "#006E7F28" },
];

const ArrowIcon = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ServiceIcon = ({ type }) => {
  const p = { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "#ffffff", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "login":
      return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
    case "dashboard":
      return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>;
    case "register":
      return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><line x1="19" y1="8" x2="23" y2="12" /><line x1="23" y1="8" x2="19" y2="12" /></svg>;
    case "manual":
      return <svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
    case "assistance":
      return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.87-.87a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg>;
    case "feedback":
      return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case "applications":
      return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    case "faq":
      return <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
  }
};

const ServiceCard = ({ link, colorIndex, onCardClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = govtColors[colorIndex % govtColors.length];

  const inner = (
    <div
      className="new-card-option"
      style={{
        background: isHovered ? colors.cardBg : "#ffffff",
        border: `1.5px solid ${isHovered ? colors.borderHover : "#DEE0E2"}`,
        boxShadow: isHovered
          ? `0 8px 24px ${colors.iconBg}18, 0 2px 8px rgba(0,0,0,0.06)`
          : "0 1px 4px rgba(0,0,0,0.05)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.22s ease",
        borderRadius: "14px",
        padding: "20px",
        cursor: "pointer",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon box */}
      <div
        className="new-card-icon"
        style={{
          background: colors.iconBg,
          borderRadius: "12px",
          width: "48px",
          height: "48px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ServiceIcon type={link.iconType} />
      </div>

      {/* Title */}
      <div
        className="new-card-service-name"
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: isHovered ? colors.iconBg : "#1F1F1F",
          marginBottom: "6px",
          lineHeight: "1.4",
          transition: "color 0.18s ease",
          flexGrow: 1,
        }}
      >
        {link.title}
      </div>

      {/* Subtitle */}
      {link.subtitle && (
        <div style={{ fontSize: "11px", color: "#626A6E", marginBottom: "10px", lineHeight: "1.4" }}>
          {link.subtitle}
        </div>
      )}

      {/* Access row */}
      <div
        className="new-card-access"
        style={{
          fontSize: "12px",
          color: isHovered ? colors.iconBg : "#626A6E",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "color 0.18s ease",
          marginTop: "10px",
        }}
      >
        <span>{link.actionLabel || "Access service"}</span>
        <ArrowIcon color={colors.iconBg} />
      </div>
    </div>
  );

  if (onCardClick) {
    return <div onClick={onCardClick} style={{ textDecoration: "none" }}>{inner}</div>;
  }
  if (link.external && link.url) {
    return <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{inner}</a>;
  }
  if (link.external && !link.url) {
    return <div style={{ cursor: "default" }}>{inner}</div>;
  }
  return <Link to={link.url} style={{ textDecoration: "none" }}>{inner}</Link>;
};

const CustomLandingPage = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(null);
  const [isArchitect, setIsArchitect] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector(".SideBarStatic");
    const mainContainer = document.querySelector(".main.center-container");
    const citizenContainer = document.querySelector(".citizen-home-container");

    if (sidebar) sidebar.style.display = "none";
    if (mainContainer) { mainContainer.style.padding = "0"; mainContainer.style.width = "100%"; }
    if (citizenContainer) { citizenContainer.style.padding = "0"; citizenContainer.style.width = "100%"; }

    setIsArchitect(validateArchitectRole());

    return () => {
      if (sidebar) sidebar.style.display = "";
      if (mainContainer) { mainContainer.style.padding = ""; mainContainer.style.width = ""; }
      if (citizenContainer) { citizenContainer.style.padding = ""; citizenContainer.style.width = ""; }
    };
  }, []);

  const closeToast = () => setShowToast(null);

  const validateArchitectRole = () => {
    try {
      const userInfoString = localStorage.getItem("user-info");
      if (!userInfoString) return false;
      const userInfo = JSON.parse(userInfoString);
      if (!userInfo.roles || !Array.isArray(userInfo.roles)) return false;
      return userInfo.roles.some((role) => role.code === "BPA_ARCHITECT");
    } catch {
      return false;
    }
  };

  const handleProfessionalLoginClick = (e, link) => {
    e.preventDefault();
    if (validateArchitectRole()) {
      history.push("/digit-ui/citizen/obps/home");
    } else {
      setShowToast({ error: true, message: "Access Denied." });
    }
  };

  const links = [
    { title: "Professional Login",          url: "/digit-ui/citizen/obps/home",                                                                              external: false,  iconType: "login",        actionLabel: "Login now"          },
    { title: "Professional Dashboard",       url: "/digit-ui/citizen/obps/home",                                                                              external: true,   iconType: "dashboard",    actionLabel: "View dashboard",    requiresArchitect: true },
    { title: "Register as Professional",     url: "/digit-ui/citizen/obps/stakeholder/apply/stakeholder-docs-required",                                       external: false,  iconType: "register",     actionLabel: "Register now",      showForNonArchitect: true },
    { title: "User Manual",                  url: "https://sdc-uat.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2Fproperty-upload%2FOctober%2F8%2F1759931687672rlOgUaoaId.pdf", external: true, iconType: "manual", actionLabel: "Download PDF" },
    { title: "Assistance",                   url: null,                                                                                                        external: true,   iconType: "assistance",   actionLabel: "+91 98155 98785",   subtitle: "Helpdesk support" },
    { title: "Feedback",                     url: "https://docs.google.com/forms/d/e/1FAIpQLScfZlGldfyIs_3KZAX9lRpx43OjCrKnw33SbzvN6I3Gi2Uj_A/viewform?usp=header", external: true, iconType: "feedback", actionLabel: "Share feedback" },
    { title: "View My Applications",         url: "/digit-ui/citizen/obps/my-applications",                                                                   external: false,  iconType: "applications", actionLabel: "View applications"  },
    { title: "FAQs",                         url: "/digit-ui/citizen/obps-faq",                                                                               external: false,  iconType: "faq",          actionLabel: "Browse FAQs"        },
  ];

  const visibleLinks = links.filter((link) => !(link.showForNonArchitect && isArchitect));

  return (
    <div className="HomePageWrapper" style={{ marginTop: "-25px" }}>

      {/* ── Hero Banner ── reuses same classes as citizen Home dashboard */}
      <div className="hero-banner-styles" style={{ position: "relative", textAlign: "center" }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "rgba(255,255,255,0.05)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-30px", width: "250px", height: "250px", background: "rgba(255,255,255,0.04)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Govt badge pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "4px 14px", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.2)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFBF00"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", fontWeight: "500", letterSpacing: "0.5px" }}>Government of Punjab — OBPS</span>
        </div>

        <h1 className="hero-title-styles">Building Plan Approval</h1>
        <p className="heroSubtitleStyles">Online Building Plan Approval System for Urban Local Bodies of Punjab</p>

        {/* Quick-info chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
          {["Fast-track approvals", "Paperless process", "Real-time tracking"].map((tag) => (
            <span key={tag} style={{ fontSize: "11px", background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.18)" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Services Section ── */}
      <div style={{ padding: "28px 0 40px" }}>

        {/* Section header — reuses new-card-header-section / new-card-header-title */}
        <div
          className="new-card-header-section"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "14px", borderBottom: "2px solid #003C71" }}
        >
          <h2 className="new-card-header-title" style={{ fontSize: "20px", fontWeight: "700", color: "#003C71", margin: 0 }}>
            Services &amp; Resources
          </h2>
          <span style={{ fontSize: "12px", color: "#626A6E", background: "#F3F2F1", padding: "4px 12px", borderRadius: "20px" }}>
            {visibleLinks.length} services
          </span>
        </div>

        {/* Card grid — reuses new-card-cards-grid (4-col desktop, responsive) */}
        <div className="new-card-cards-grid">
          {visibleLinks.map((link, index) => (
            <ServiceCard
              key={index}
              link={link}
              colorIndex={index}
              onCardClick={link.requiresArchitect ? (e) => handleProfessionalLoginClick(e, link) : null}
            />
          ))}
        </div>
      </div>

      {/* ── Test / Demo Credentials (collapsible) ── */}
      <div style={{ background: "#FFF8E1", border: "1px solid #FFE082", borderRadius: "12px", padding: "16px 20px", marginBottom: "40px" }}>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
          onClick={() => setShowCredentials(!showCredentials)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B5451B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#B5451B" }}>Test / Demo Credentials</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B5451B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {showCredentials ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
          </svg>
        </div>

        {showCredentials && (
          <div style={{ marginTop: "14px", borderTop: "1px solid #FFE082", paddingTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#626A6E", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile Numbers</div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#1F1F1F", background: "rgba(255,255,255,0.7)", padding: "8px 12px", borderRadius: "6px", lineHeight: "1.9" }}>
                9988112233 &nbsp;9988112234<br />
                9988112235 &nbsp;9988112236<br />
                8888888889 &nbsp;9988112237<br />
                9988112238 &nbsp;8196991952
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#626A6E", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Access Details</div>
              <div style={{ fontSize: "13px", color: "#1F1F1F", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  OTP&nbsp;
                  <span style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.8)", padding: "2px 10px", borderRadius: "4px", fontWeight: "700", border: "1px solid #FFE082" }}>
                    123456
                  </span>
                </div>
                <div>Location&nbsp;<span style={{ fontWeight: "600" }}>Amritsar</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <Toast
          error={showToast?.error}
          warning={showToast?.warning}
          label={showToast?.message}
          isDleteBtn={true}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default CustomLandingPage;
