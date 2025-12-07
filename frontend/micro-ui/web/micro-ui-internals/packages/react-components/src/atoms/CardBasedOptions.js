import React from "react";


const Option = ({ name, Icon, onClick, className, colorIndex = 0 }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const colors = cardColors[colorIndex % cardColors.length]

  return (
    <div className="new-card-option"
     
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="new-card-icon" >{Icon}</div>
      <div className="new-card-service-name" >{name}</div>
      <div className="new-card-access" >
        <span>Access service</span>
        <span className="new-card-arrow" >→</span>
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