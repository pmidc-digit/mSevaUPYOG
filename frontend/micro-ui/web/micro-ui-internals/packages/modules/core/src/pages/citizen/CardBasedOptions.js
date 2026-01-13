import React from "react"

const cardColors = [
  { bg: "#EFF6FF", iconBg: "#3B82F6" }, // Blue
  { bg: "#ECFDF5", iconBg: "#10B981" }, // Green
  { bg: "#F5F3FF", iconBg: "#8B5CF6" }, // Purple
  { bg: "#DBEAFE", iconBg: "#0EA5E9" }, // Cyan
  { bg: "#FCE7F3", iconBg: "#EC4899" }, // Pink
  { bg: "#ECFDF5", iconBg: "#059669" }, // Emerald
  { bg: "#FEF3C7", iconBg: "#F59E0B" }, // Orange
  { bg: "#DBEAFE", iconBg: "#0284C7" }, // Sky
  { bg: "#F3E8FF", iconBg: "#9333EA" }, // Violet
  { bg: "#FEE2E2", iconBg: "#EF4444" }, // Red
  { bg: "#FFF7ED", iconBg: "#EA580C" }, // Orange
  { bg: "#FEFCE8", iconBg: "#CA8A04" }, // Yellow
  { bg: "#F0FDF4", iconBg: "#16A34A" }, // Green
  { bg: "#EFF6FF", iconBg: "#2563EB" }, // Blue
  { bg: "#FAF5FF", iconBg: "#A855F7" }, // Purple
]

const cardStyles = {
  background: "#FFF",
  borderRadius: "12px",
  padding: "24px",
  margin: "8px",
  minWidth: "240px",
  flex: "1 1 calc(25% - 16px)",
  cursor: "pointer",
  transition: "all 0.2s ease",
  border: "1px solid #E5E7EB",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
}

const cardHoverStyles = {
  transform: "translateY(-4px)",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
}

const iconWrapperStyles = (bgColor) => ({
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: bgColor,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
  color: "#FFF",
  fontSize: "24px",
})

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

const Option = ({ name, Icon, onClick, className, colorIndex = 0 }) => {
  const [isCardHovered, setIsCardHovered] = React.useState(false)
  // const colors = cardColors[colorIndex % cardColors.length]
  const colors = cardColors[colorIndex % cardColors.length]

  return (
    <div 
      className="new-card-option"
      style={{
        background: isCardHovered ? colors.bg : "#ffffff",
        border: isCardHovered ? "2px solid transparent" : "2px solid #e2e8f0",
        transition: "all 0.25s ease",
      }}
      onClick={onClick}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <div className="new-card-icon" style={{ background: colors.iconBg, color: colors.icon }}>
        {Icon}
      </div>
      <div className="new-card-service-name" style={{ color: colors.textColor }}>{name}</div>
      <div className="new-card-access" style={{ color: isCardHovered ? colors.textColor : "#4a5568" }}>
        <span>Access service</span>
        <span className="new-card-arrow">→</span>
      </div>
    </div>
  )
}

const CardBasedOptions = ({ header, sideOption, options, styles = {}, style = {} }) => {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div className="new-card-root" style={{ width: "100%", ...style }}>

      <div className="new-card-header-section" >
        <h2 className="new-card-header-title" >{header}</h2>
        {/* <button
          type="button"
           className="new-card-view-button"
          onClick={sideOption.onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sideOption.name}
          <span>→</span>
        </button> */}
      </div>
      <div className="new-card-cards-grid" >
        {options.map((props, index) => (
          <Option key={index} {...props} colorIndex={index} />
        ))}
      </div>
    </div>
  )
}

export default CardBasedOptions