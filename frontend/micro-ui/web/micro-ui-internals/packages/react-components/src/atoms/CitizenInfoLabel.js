import React from "react";
// import { InfoBannerIcon } from "./svgindex";

// const CitizenInfoLabel = ({ info, text, style, textStyle, showInfo = true, className }) => {
//   return (
//     <div className={`info-banner-wrap ${className ? className : ""}`} style={style}>
//       {showInfo && <div>
//         <InfoBannerIcon />
//         <h2>{info}</h2>
//       </div>
//       }
//       <p style={textStyle}>{text}</p>
//     </div>
//   );
// };

// export default CitizenInfoLabel;

const InfoBannerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <circle cx="10" cy="10" r="9" fill="#8B5CF6" opacity="0.1" />
    <path
      d="M10 14V10M10 6H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
      stroke="#8B5CF6"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CitizenInfoLabel = ({ info, text, style, textStyle, showInfo = true, className }) => {
  const containerStyle = {
    backgroundColor: "#e0f2fe",
    border: "1px solid #E9D5FF",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "24px",
    marginBottom: "24px",
    ...style,
  }

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "4px",
  }

  const titleStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#6B21A8",
    margin: "0",
    lineHeight: "1.5",
  }

  const descriptionStyle = {
    fontSize: "14px",
    fontWeight: "400",
    color: "#6B7280",
    margin: "0",
    lineHeight: "1.6",
    ...textStyle,
  }

  return (
    <div className={`info-banner-wrap ${className ? className : ""}`} style={containerStyle}>
      {showInfo && (
        <div style={headerStyle}>
          <InfoBannerIcon />
          <h2 style={titleStyle}>{info}</h2>
        </div>
      )}
      <p style={descriptionStyle}>{text}</p>
    </div>
  )
}

export default CitizenInfoLabel
