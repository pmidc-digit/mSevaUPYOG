import React from "react"

/* Government-appropriate 6-color rotating palette */
const govtColors = [
  { iconBg: "#003C71", cardBg: "#EEF4FF", borderHover: "#003C7128" }, // Navy
  { iconBg: "#00703C", cardBg: "#E8F5EE", borderHover: "#00703C28" }, // Green
  { iconBg: "#B5451B", cardBg: "#FFF0EC", borderHover: "#B5451B28" }, // Saffron
  { iconBg: "#1A5CA8", cardBg: "#EBF3FE", borderHover: "#1A5CA828" }, // Medium Blue
  { iconBg: "#4B3A7C", cardBg: "#F0EBF8", borderHover: "#4B3A7C28" }, // Deep Purple
  { iconBg: "#006E7F", cardBg: "#E0F2F5", borderHover: "#006E7F28" }, // Teal
]

const ArrowIcon = ({ color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const Option = ({ name, Icon, onClick, colorIndex = 0 }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const colors = govtColors[colorIndex % govtColors.length]

  return (
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
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon — rounded square, not circle */}
      <div
        className="new-card-icon"
        style={{
          background: colors.iconBg,
          borderRadius: "12px",
          width: "48px",
          height: "48px",
          marginBottom: "14px",
        }}
      >
        {Icon}
      </div>

      {/* Service name */}
      <div
        className="new-card-service-name"
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: isHovered ? colors.iconBg : "#1F1F1F",
          marginBottom: "10px",
          lineHeight: "1.4",
          transition: "color 0.18s ease",
        }}
      >
        {name}
      </div>

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
        }}
      >
        <span>Access service</span>
        <ArrowIcon color={colors.iconBg} />
      </div>
    </div>
  )
}

const CardBasedOptions = ({ header, sideOption, options, styles = {}, style = {} }) => {
  return (
    <div className="new-card-root" style={{ width: "100%", ...style }}>
      {header ? (
        <div
          className="new-card-header-section"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "14px",
            borderBottom: "2px solid #003C71",
          }}
        >
          <h2
            className="new-card-header-title"
            style={{ fontSize: "20px", fontWeight: "700", color: "#003C71", margin: 0 }}
          >
            {header}
          </h2>
        </div>
      ) : null}

      <div className="new-card-cards-grid">
        {options?.map((props, index) => (
          <Option key={index} {...props} colorIndex={index} />
        ))}
      </div>
    </div>
  )
}

export default CardBasedOptions
