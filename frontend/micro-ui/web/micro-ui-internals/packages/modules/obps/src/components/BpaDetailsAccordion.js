import React from "react";

export const BpaDetailsRow = ({ label, value, className = "", valueClassName = "" }) => (
  <div className={`bpa-details-row ${className}`.trim()}>
    <div className="bpa-details-row__label">{label}</div>
    {/* Use div (not span) so Dropdown / inputs are not hoisted outside the value cell */}
    <div className={`bpa-details-row__value ${valueClassName}`.trim()}>{value}</div>
  </div>
);

export const BpaDetailsGrid = ({ children, className = "" }) => (
  <div className={`bpa-details-grid ${className}`.trim()}>{children}</div>
);

const BpaDetailsAccordion = ({ title, icon = "default", theme = "blue", isOpen, onToggle, className = "", children }) => (
  <div className={`bpa-details-accordion bpa-details-accordion--${theme}${isOpen ? " is-open" : ""} ${className}`.trim()}>
    <button type="button" className="bpa-details-accordion__header" onClick={onToggle} aria-expanded={isOpen}>
      <span className={`bpa-details-accordion__icon bpa-details-accordion__icon--${icon}`} aria-hidden="true" />
      <span className="bpa-details-accordion__title">{title}</span>
      <span className={`bpa-details-accordion__chevron${isOpen ? " is-open" : ""}`} aria-hidden="true" />
    </button>
    {isOpen && <div className="bpa-details-accordion__body">{children}</div>}
  </div>
);

export default BpaDetailsAccordion;
