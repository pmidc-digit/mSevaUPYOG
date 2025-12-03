import React from "react";
// const CardBasedOptionsMainChildOption = {
//     display: 'flex',
//     flexDirection: 'column',
//     margin: '3rem',
//     background: '#8773e4ff',
//     borderRadius: '8px',
//     justifyContent: 'center',
//     alignItems: 'center',
//     textAlign : "center"
// }
// const cardHeader = {
//   textAlign: "center",
//   textTransform: "uppercase",
//   paddingBottom: "5px"
// }
// const Option = ({ name, Icon, onClick, className }) => {
//   return (
//     // <div className={className || `CardBasedOptionsMainChildOption`} onClick={onClick}>
//     // <div style={CardBasedOptionsMainChildOption} onClick={onClick}>
//     //   <div className="ChildOptionImageWrapper">{Icon}</div>
//     //   <p className="ChildOptionName">{name}</p>
//     // </div>

//     <div class="cardService wallet" onClick={onClick}>
//        <div class="overlayService"></div>
//         <div class="circleService">
//            {Icon}
//         </div>
//       <p>{name}</p>
//     </div>
//   );
// };

// const CardBasedOptions = ({ header, sideOption, options, styles = {}, style={} }) => {
//   return (
//     <div className="" style={{width:"100%"}}>
//           <div className="card-header">
//               <h1>{header}</h1>
//               <p onClick={sideOption.onClick}></p>
//                <button type="button" class="inboxButton" onClick={sideOption.onClick}>
//             {sideOption.name}
//                       </button>
//           </div>
//           <div className="mainContent citizenAllServiceGrid" style={{display:"flex", flexWrap : "wrap", borderRadius : '8px', marginTop: "1rem", justifyContent : "center"}}>
//             {options.map( (props, index) => 
//                 <Option key={index} {...props} />
//             )}
//         </div>
         
//     </div>
//   );
// };

// export default CardBasedOptions;



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
  const [isHovered, setIsHovered] = React.useState(false)
  const colors = cardColors[colorIndex % cardColors.length]

  return (
    <div
      style={{
        ...cardStyles,
        ...(isHovered ? cardHoverStyles : {}),
        backgroundColor: colors.bg,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={iconWrapperStyles(colors.iconBg)}>{Icon}</div>
      <div style={serviceNameStyles}>{name}</div>
      <div style={accessServiceStyles}>
        <span>Access service</span>
        <span style={arrowStyles}>→</span>
      </div>
    </div>
  )
}

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
  background: "transparent",
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

const viewAllButtonHoverStyles = {
  background: "#EFF6FF",
}

const cardsGridStyles = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0",
  justifyContent: "flex-start",
  margin: "-8px",
  width: "100%",
}

const CardBasedOptions = ({ header, sideOption, options, styles = {}, style = {} }) => {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div style={{ width: "100%", ...style }}>
      <div style={headerSectionStyles}>
        <h2 style={headerTitleStyles}>{header}</h2>
        <button
          type="button"
          style={{
            ...viewAllButtonStyles,
            ...(isHovered ? viewAllButtonHoverStyles : {}),
          }}
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