import React from "react";

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
];

const Option = ({ name, Icon, iconClass, onClick, className, colorIndex = 0 }) => {
  const colorClass = `new-card-icon--${colorIndex % cardColors.length}`;
  const iconClassName = iconClass ? `mseva-icon ${iconClass}` : `new-card-icon ${colorClass}`;

  return (
    <button type="button" className={`new-card-option ${className || ""}`} onClick={onClick}>
      <span className={iconClassName} aria-hidden="true">{iconClass ? null : Icon}</span>
      <span className="new-card-service-name">{name}</span>
      <span className="new-card-access">
        <span>Access service</span>
        <span className="new-card-arrow" aria-hidden="true">→</span>
      </span>
    </button>
  );
};

const CardBasedOptions = ({ header, options = [], variant = "" }) => {
  const variantClass = variant ? `new-card-root--${variant}` : "";

  return (
    <div className={`new-card-root ${variantClass}`}>
      {header && (
        <div className="new-card-header-section">
          <h2 className="new-card-header-title">{header}</h2>
        </div>
      )}
      <div className="new-card-cards-grid">
        {options.map((props, index) => (
          <Option key={index} {...props} colorIndex={index} />
        ))}
      </div>
    </div>
  );
};

export default CardBasedOptions;
