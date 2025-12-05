

import React, { useState } from "react"
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom"

const CitizenHomeCardAccordian = ({ header, links = [], state, Icon, Info, isInfo = false, styles }) => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false
  const location = useLocation()
  const shouldRemoveGrid = location.pathname.endsWith("all-services")

  // Predefined color schemes for cards
  const cardColors = [
    { bg: "#EBF3FE", iconBg: "#2B6FED", icon: "#FFFFFF" },
    { bg: "#E8F8F5", iconBg: "#0FA76F", icon: "#FFFFFF" },
    { bg: "#F3EBFF", iconBg: "#8B5CF6", icon: "#FFFFFF" },
    { bg: "#FEF3E8", iconBg: "#F97316", icon: "#FFFFFF" },
    { bg: "#FCE8F3", iconBg: "#EC4899", icon: "#FFFFFF" },
    { bg: "#E0F2FE", iconBg: "#0EA5E9", icon: "#FFFFFF" },
  ]

  // SVG Icons for different services
  const getServiceIcon = (linkText, index) => {
    const lowerText = linkText.toLowerCase()

    if (lowerText.includes("apply") || lowerText.includes("new")) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

  const ChevronIcon = ({ isOpen }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease",
      }}
    >
      <path d="M6 9L12 15L18 9" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const ArrowIcon = () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 15L12.5 10L7.5 5" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const accordionContainerStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
    marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  }

  const accordionHeaderStyle = {
    padding: "20px 24px",
    backgroundColor: "#F9FAFB",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.2s ease",
  }

  const headerTitleStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1F2937",
    margin: 0,
  }

  const accordionContentStyle = {
    maxHeight: isOpen ? "2000px" : "0",
    overflow: "hidden",
    transition: "max-height 0.4s ease",
  }

  const cardGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "12px",
    padding: "16px",
  }

  const cardStyle = (colorScheme) => ({
    backgroundColor: colorScheme.bg,
    padding: "16px",
    borderRadius: "10px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    border: "none",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  })

  const iconContainerStyle = (colorScheme) => ({
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: colorScheme.iconBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: colorScheme.icon,
  })

  const contentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  }

  const titleStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1F2937",
    margin: 0,
    lineHeight: "1.4",
  }

  const descriptionStyle = {
    fontSize: "13px",
    color: "#6B7280",
    margin: 0,
    lineHeight: "1.4",
  }

  const arrowContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }

  const renderCardContent = (link, colorScheme, index) => (
    <React.Fragment>
      <div style={iconContainerStyle(colorScheme)}>{getServiceIcon(link.i18nKey, index)}</div>
      <div style={contentStyle}>
        <div style={titleStyle}>{link.i18nKey}</div>
        {link.description && <div style={descriptionStyle}>{link.description}</div>}
      </div>
      <div style={arrowContainerStyle}>
        <ArrowIcon />
      </div>
    </React.Fragment>
  )

  return (
    <div style={styles ? styles : {}}>
      <div style={accordionContainerStyle}>
        <div
          style={accordionHeaderStyle}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F3F4F6"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#F9FAFB"
          }}
        >
          <h3 style={headerTitleStyle}>{header || "Services"}</h3>
          <ChevronIcon isOpen={isOpen} />
        </div>

        <div style={accordionContentStyle}>
          <div style={cardGridStyle}>
            {links.map((link, index) => {
              const colorScheme = cardColors[index % cardColors.length]
              const cardStyles = cardStyle(colorScheme)

              const isExternalLink =
                link?.parentModule?.toUpperCase() === "BIRTH" ||
                link?.parentModule?.toUpperCase() === "DEATH" ||
                link?.parentModule?.toUpperCase() === "FIRENOC"

              if (isExternalLink) {
                return (
                  <a
                    key={index}
                    href={link.link}
                    style={cardStyles}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)"
                    }}
                  >
                    {renderCardContent(link, colorScheme, index)}
                  </a>
                )
              } else {
                return (
                  <Link
                    key={index}
                    to={{ pathname: link.link, state: link.state }}
                    style={cardStyles}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)"
                    }}
                  >
                    {renderCardContent(link, colorScheme, index)}
                  </Link>
                )
              }
            })}
          </div>
        </div>
      </div>

      {isInfo && Info && (
        <div style={{ marginTop: "16px" }}>
          <Info />
        </div>
      )}
    </div>
  )
}

export default CitizenHomeCardAccordian
