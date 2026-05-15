import React from "react"
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const govtColors = [
  { iconBg: "#003C71", cardBg: "#EEF4FF", borderHover: "#003C7128" },
  { iconBg: "#00703C", cardBg: "#E8F5EE", borderHover: "#00703C28" },
  { iconBg: "#B5451B", cardBg: "#FFF0EC", borderHover: "#B5451B28" },
  { iconBg: "#1A5CA8", cardBg: "#EBF3FE", borderHover: "#1A5CA828" },
  { iconBg: "#4B3A7C", cardBg: "#F0EBF8", borderHover: "#4B3A7C28" },
  { iconBg: "#006E7F", cardBg: "#E0F2F5", borderHover: "#006E7F28" },
]

const ArrowIcon = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const getServiceIcon = (linkText) => {
  const lowerText = (linkText || "").toLowerCase()

  if (lowerText.includes("apply") || lowerText.includes("new")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.47 2 4.96 2.21 4.59 2.59C4.21 2.96 4 3.47 4 4V20C4 20.53 4.21 21.04 4.59 21.41C4.96 21.79 5.47 22 6 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V8L14 2Z" fill="white" opacity="0.9" />
        <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 18V12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M9 15H15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  } else if (lowerText.includes("renew") || lowerText.includes("renewal")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.5 2V8H15.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C15.34 3 18.27 4.73 19.93 7.35" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  } else if (lowerText.includes("application") || lowerText.includes("track") || lowerText.includes("status")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white" opacity="0.9" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" fill="white" opacity="0.9" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" fill="white" opacity="0.9" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" fill="white" opacity="0.5" />
      </svg>
    )
  } else if (lowerText.includes("pay") || lowerText.includes("payment") || lowerText.includes("bill")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="20" height="14" rx="2" fill="white" opacity="0.9" />
        <path d="M2 10H22" stroke="#00703C" strokeWidth="2" />
        <path d="M6 15H10" stroke="#00703C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  } else if (lowerText.includes("faq") || lowerText.includes("help") || lowerText.includes("question")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" fill="white" opacity="0.9" />
        <path d="M9.09 9C9.33 8.33 9.79 7.77 10.4 7.41C11.01 7.05 11.73 6.92 12.43 7.04C13.13 7.16 13.76 7.52 14.22 8.06C14.67 8.61 14.92 9.29 14.92 10C14.92 12 11.92 13 11.92 13" stroke="#4B3A7C" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.8" fill="#4B3A7C" />
      </svg>
    )
  } else if (lowerText.includes("search") || lowerText.includes("find")) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2.5" />
        <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  } else {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2H6C5.47 2 4.96 2.21 4.59 2.59C4.21 2.96 4 3.47 4 4V20C4 20.53 4.21 21.04 4.59 21.41C4.96 21.79 5.47 22 6 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V9L13 2Z" fill="white" opacity="0.9" />
        <path d="M13 2V9H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
}

const ServiceCard = ({ link, index, t }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const colors = govtColors[index % govtColors.length]

  const linkPathname =
    typeof link?.link === "string" && link.link.startsWith("/mseva-ui")
      ? link.link.replace("/mseva-ui", "/digit-ui")
      : link?.link

  const isExternalLink =
    link?.parentModule?.toUpperCase() === "BIRTH" ||
    link?.parentModule?.toUpperCase() === "DEATH" ||
    link?.parentModule?.toUpperCase() === "FIRENOC"

  const cardStyle = {
    display: "block",
    background: isHovered ? colors.cardBg : "#ffffff",
    border: `1.5px solid ${isHovered ? colors.iconBg + "44" : "#DEE0E2"}`,
    boxShadow: isHovered
      ? `0 8px 24px ${colors.iconBg}18, 0 2px 8px rgba(0,0,0,0.06)`
      : "0 1px 4px rgba(0,0,0,0.05)",
    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
    transition: "all 0.22s ease",
    borderRadius: "14px",
    padding: "20px",
    cursor: "pointer",
    textDecoration: "none",
  }

  const content = (
    <React.Fragment>
      {/* Icon box */}
      <div
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
        {getServiceIcon(link.i18nKey)}
      </div>

      {/* Service name */}
      <div
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: isHovered ? colors.iconBg : "#1F1F1F",
          marginBottom: "10px",
          lineHeight: "1.4",
          transition: "color 0.18s ease",
        }}
      >
        {t(link.i18nKey)}
      </div>

      {/* Access row */}
      <div
        style={{
          fontSize: "12px",
          color: isHovered ? colors.iconBg : "#626A6E",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "color 0.18s ease",
        }}
      >
        <span>Access service</span>
        <ArrowIcon color={colors.iconBg} />
      </div>
    </React.Fragment>
  )

  if (isExternalLink) {
    return (
      <a
        href={link.link}
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      to={{ pathname: linkPathname, state: link.state }}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content}
    </Link>
  )
}

const CitizenHomeCardSecond = ({ header, links = [], state, Icon, Info, isInfo = false, styles }) => {
  const { t } = useTranslation()

  return (
    <div style={{ width: "100%", ...styles }}>
      {header && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            paddingBottom: "12px",
            borderBottom: "2px solid #003C71",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "4px", height: "22px", background: "#003C71", borderRadius: "2px" }} />
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#003C71", margin: 0 }}>
              {t(header)}
            </h2>
          </div>
        </div>
      )}

      <div className="new-card-cards-grid">
        {links.map((link, index) => (
          <ServiceCard key={index} link={link} index={index} t={t} />
        ))}
      </div>

      {isInfo && Info && (
        <div
          style={{
            marginTop: "24px",
            padding: "20px 24px",
            background: "#EEF4FF",
            borderRadius: "12px",
            border: "1.5px solid #003C7128",
          }}
        >
          <Info />
        </div>
      )}
    </div>
  )
}

export default CitizenHomeCardSecond
