import React from "react"

const cardColors = [
  { bg: "#EFF6FF", iconBg: "#3B82F6" },
  { bg: "#ECFDF5", iconBg: "#10B981" },
  { bg: "#F5F3FF", iconBg: "#8B5CF6" },
  { bg: "#DBEAFE", iconBg: "#0EA5E9" },
  { bg: "#FCE7F3", iconBg: "#EC4899" },
  { bg: "#ECFDF5", iconBg: "#059669" },
  { bg: "#FEF3C7", iconBg: "#F59E0B" },
  { bg: "#DBEAFE", iconBg: "#0284C7" },
  { bg: "#F3E8FF", iconBg: "#9333EA" },
  { bg: "#FEE2E2", iconBg: "#EF4444" },
  { bg: "#FFF7ED", iconBg: "#EA580C" },
  { bg: "#FEFCE8", iconBg: "#CA8A04" },
  { bg: "#F0FDF4", iconBg: "#16A34A" },
  { bg: "#EFF6FF", iconBg: "#2563EB" },
  { bg: "#FAF5FF", iconBg: "#A855F7" },
]

const Option = ({ name, Icon, onClick, className, colorIndex = 0 }) => {
  const [isCardHovered, setIsCardHovered] = React.useState(false)
  const colors = cardColors[colorIndex % cardColors.length]

  const cardStyles = {
    background: colors.bg,
    borderRadius: "12px",
    padding: "24px",
    margin: "8px",
    minWidth: "200px",
    flex: "1 1 calc(25% - 16px)",
    maxWidth: "calc(25% - 16px)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid #E5E7EB",
    boxShadow: isCardHovered ? "0 8px 16px rgba(0, 0, 0, 0.1)" : "0 1px 3px rgba(0, 0, 0, 0.05)",
    transform: isCardHovered ? "translateY(-4px)" : "translateY(0)",
  }

  const iconWrapperStyles = {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: colors.iconBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    color: "#FFF",
    fontSize: "24px",
  }

  const serviceNameStyles = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
  }

  const accessServiceStyles = {
    fontSize: "14px",
    color: "#6B7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }

  const arrowStyles = {
    color: "#3B82F6",
    fontSize: "18px",
  }

  return (
    <div
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <div style={iconWrapperStyles}>{Icon}</div>
      <div style={serviceNameStyles}>{name}</div>
      <div style={accessServiceStyles}>
        <span>Access service</span>
        <span style={arrowStyles}>→</span>
      </div>
    </div>
  )
}

const CardBasedOptions = ({ header, sideOption, options, styles = {}, style = {} }) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const headerSectionStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #3B82F6",
  }

  const headerTitleStyles = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  }

  const viewAllButtonStyles = {
    background: isHovered ? "#EFF6FF" : "transparent",
    border: "none",
    color: "#3B82F6",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "background 0.2s ease",
  }

  const cardsGridStyles = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0",
    justifyContent: "flex-start",
    margin: "-8px",
    width: "100%",
  }

  return (
    <div style={{ width: "100%", ...style }}>
      <div style={headerSectionStyles}>
        <h2 style={headerTitleStyles}>{header}</h2>
        <button
          type="button"
          style={viewAllButtonStyles}
          onClick={sideOption.onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sideOption.name}
          <span>→</span>
        </button>
      </div>
      <div style={cardsGridStyles}>
        {options.map((props, index) => (
          <Option key={index} {...props} colorIndex={index} />
        ))}
      </div>
    </div>
  )
}

export default CardBasedOptions