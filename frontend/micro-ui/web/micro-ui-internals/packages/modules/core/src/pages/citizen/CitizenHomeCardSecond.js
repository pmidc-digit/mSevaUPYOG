

import React from "react"
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next";

const CitizenHomeCardSecond = ({ header, links = [], state, Icon, Info, isInfo = false, styles }) => {
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false
  const location = useLocation()
  const shouldRemoveGrid = location.pathname.endsWith("all-services")
  const { t } = useTranslation()

  const cardColors = [
    { bg: "linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(208 189 227) 100%)", iconBg: "#667eea", textColor: "#1a202c" }, // Purple gradient
    { bg: "linear-gradient(135deg, rgb(240, 147, 251) 0%, rgb(217 184 188) 100%)", iconBg: "#f5576c", textColor: "#1a202c" }, // Pink gradient
    { bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", iconBg: "#4facfe", textColor: "#1a202c" }, // Blue gradient
    { bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", iconBg: "#43e97b", textColor: "#1a202c" }, // Green gradient
    { bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", iconBg: "#fa709a", textColor: "#1a202c" }, // Orange gradient
    { bg: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)", iconBg: "#30cfd0", textColor: "#1a202c" }, // Cyan gradient
  ]

  const getServiceIcon = (linkText, index) => {
    const lowerText = linkText.toLowerCase()

    if (lowerText.includes("apply") || lowerText.includes("new")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
          />
          <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 18V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 15H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    } else if (lowerText.includes("renew") || lowerText.includes("renewal")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.5 2V8H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M3 12C3 13.78 3.58 15.42 4.57 16.75C5.55 18.08 6.89 19.05 8.44 19.54C9.98 20.03 11.64 20.01 13.18 19.48C14.71 18.96 16.03 17.96 16.96 16.61"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12C21 10.22 20.42 8.58 19.43 7.25C18.45 5.92 17.11 4.95 15.56 4.46C14.02 3.97 12.36 3.99 10.82 4.52C9.29 5.04 7.97 6.04 7.04 7.39"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      )
    } else if (lowerText.includes("application") || lowerText.includes("track")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H9C9.53043 5 10.0391 5.21071 10.4142 5.58579C10.7893 5.96086 11 6.46957 11 7V11C11 11.5304 10.7893 12.0391 10.4142 12.4142C10.0391 12.7893 9.53043 13 9 13H5C4.46957 13 3.96086 12.7893 3.58579 12.4142C3.21071 12.0391 3 11.5304 3 11V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
          />
          <path
            d="M13 7C13 6.46957 13.2107 5.96086 13.5858 5.58579C13.9609 5.21071 14.4696 5 15 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7V11C21 11.5304 20.7893 12.0391 20.4142 12.4142C20.0391 12.7893 19.5304 13 19 13H15C14.4696 13 13.9609 12.7893 13.5858 12.4142C13.2107 12.0391 13 11.5304 13 11V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
          />
          <path
            d="M3 17C3 16.4696 3.21071 15.9609 3.58579 15.5858C3.96086 15.2107 4.46957 15 5 15H9C9.53043 15 10.0391 15.2107 10.4142 15.5858C10.7893 15.9609 11 16.4696 11 17V21C11 21.5304 10.7893 22.0391 10.4142 22.4142C10.0391 22.7893 9.53043 23 9 23H5C4.46957 23 3.96086 22.7893 3.58579 22.4142C3.21071 22.0391 3 21.5304 3 21V17Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
          />
        </svg>
      )
    } else if (lowerText.includes("faq") || lowerText.includes("help") || lowerText.includes("question")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="currentColor" />
          <path
            d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="17" r="0.5" fill="white" stroke="white" strokeWidth="1.5" />
        </svg>
      )
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
          />
          <path d="M13 2V9H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  }

  const ArrowIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 15L12.5 10L7.5 5" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const rootStyle = {
    width: "100%",
    padding: "0",
    ...styles,
  }

  const headerStyle = {
    fontSize: "20px",
    fontWeight: "800",
    color: "#1a202c",
    marginBottom: "24px",
    letterSpacing: "-0.8px",
    position: "relative",
    paddingBottom: "16px",
    display: "inline-block",
  }

  const headerUnderlineStyle = {
    position: "absolute",
    bottom: "0",
    left: "0",
    height: "4px",
    width: "60px",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "2px",
  }

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: shouldRemoveGrid ? "1fr" : isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    width: "100%",
    marginBottom: isInfo ? "32px" : "20px",
  }

  const getCardStyle = (index, isHovered) => ({
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "28px",
    background: "#ffffff",
    borderRadius: "20px",
    border: isHovered ? "2px solid transparent" : "2px solid #e2e8f0",
    backgroundImage: isHovered ? `linear-gradient(#ffffff, #ffffff), ${cardColors[index % 6].bg}` : "none",
    backgroundOrigin: "border-box",
    backgroundClip: isHovered ? "padding-box, border-box" : "padding-box",
    textDecoration: "none",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    boxShadow: isHovered
      ? "0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.04)"
      : "0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.04)",
    transform: isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
  })

  const getIconStyle = (index) => ({
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: cardColors[index % 6].bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#ffffff",
    boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.3s ease",
  })

  const contentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  }

  const titleStyle = {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1a202c",
    lineHeight: "1.4",
    letterSpacing: "-0.3px",
  }

  const descriptionStyle = {
    fontSize: "14px",
    color: "#718096",
    lineHeight: "1.5",
  }

  const getArrowContainerStyle = (isHovered, index) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: isHovered ? cardColors[index % 6].bg : "#f7fafc",
    flexShrink: 0,
    transition: "all 0.3s ease",
  })

  const getArrowStyle = (isHovered) => ({
    color: isHovered ? "#ffffff" : "#4a5568",
    transition: "color 0.3s ease",
  })

  const infoStyle = {
    marginTop: "32px",
    padding: "32px",
    background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
    borderRadius: "20px",
    border: "2px solid #e2e8f0",
    boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)",
  }

  const renderCardContent = (link, index, isHovered) => (
    <React.Fragment>
      <div
        style={{
          ...getIconStyle(index),
          transform: isHovered ? "rotate(5deg) scale(1.1)" : "rotate(0deg) scale(1)",
        }}
      >
        {getServiceIcon(link.i18nKey, index)}
      </div>
      <div style={contentStyle}>
        <div style={titleStyle}>{t(link.i18nKey)}</div>
        {link.description && <div style={descriptionStyle}>{link.description}</div>}
      </div>
      <div style={getArrowContainerStyle(isHovered, index)}>
        <ArrowIcon style={getArrowStyle(isHovered)} />
      </div>
    </React.Fragment>
  )

  const [hoveredIndices, setHoveredIndices] = React.useState(links.map(() => false))

  return (
    <div style={rootStyle}>
      {header && (
        <div >
          <h2 style={headerStyle}>
            {t(header)}
            <div style={headerUnderlineStyle}></div>
          </h2>
        </div>
      )}

      <div style={containerStyle}>
        {links.map((link, index) => {
          const isHovered = hoveredIndices[index]
          const isExternalLink =
            link?.parentModule?.toUpperCase() === "BIRTH" ||
            link?.parentModule?.toUpperCase() === "DEATH" ||
            link?.parentModule?.toUpperCase() === "FIRENOC"

          const handleMouseEnter = () => {
            setHoveredIndices((prev) => prev.map((item, i) => (i === index ? true : item)))
          }

          const handleMouseLeave = () => {
            setHoveredIndices((prev) => prev.map((item, i) => (i === index ? false : item)))
          }

          if (isExternalLink) {
            return (
              <a
                key={index}
                href={link.link}
                style={getCardStyle(index, isHovered)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {renderCardContent(link, index, isHovered)}
              </a>
            )
          } else {
            return (
              <Link
                key={index}
                to={{ pathname: link.link, state: link.state }}
                style={getCardStyle(index, isHovered)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {renderCardContent(link, index, isHovered)}
              </Link>
            )
          }
        })}
      </div>

      {isInfo && Info && (
        <div style={infoStyle}>
          <Info />
        </div>
      )}
    </div>
  )
}

export default CitizenHomeCardSecond
