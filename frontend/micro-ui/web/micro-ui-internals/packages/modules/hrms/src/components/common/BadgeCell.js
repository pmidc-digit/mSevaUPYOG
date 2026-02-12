import React from "react";

const BadgeCell = ({ value, style }) => (
  <span
    style={{
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: "500",
      ...style,
    }}
  >
    {value || "N/A"}
  </span>
);

export default BadgeCell;
