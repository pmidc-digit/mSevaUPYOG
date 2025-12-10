import React from "react"

  const cardColors = [
    { bg: "#EBF3FE", iconBg: "#2B6FED", icon: "#FFFFFF", textColor: "#1a202c" },
    { bg: "#E8F8F5", iconBg: "#0FA76F", icon: "#FFFFFF", textColor: "#1a202c" },
    { bg: "#F3EBFF", iconBg: "#8B5CF6", icon: "#FFFFFF", textColor: "#1a202c" },
    { bg: "#FEF3E8", iconBg: "#F97316", icon: "#FFFFFF", textColor: "#1a202c" },
    { bg: "#FCE8F3", iconBg: "#EC4899", icon: "#FFFFFF", textColor: "#1a202c" },
    { bg: "#E0F2FE", iconBg: "#0EA5E9", icon: "#FFFFFF", textColor: "#1a202c" },
  ]

const Option = ({ name, Icon, onClick, className, colorIndex = 0 }) => {
  const [isCardHovered, setIsCardHovered] = React.useState(false)
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
        <button
          type="button"
           className="new-card-view-button"
          onClick={sideOption.onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sideOption.name}
          <span>→</span>
        </button>
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