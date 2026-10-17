import React from "react";
import { Link } from "react-router-dom";

const actionButtonBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 20px",
  borderRadius: "999px",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
};

const primaryActionButton = {
  ...actionButtonBase,
  border: "none",
  color: "#ffffff",
  background: "linear-gradient(135deg, #2563eb, #1e40af)",
  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
};

const secondaryActionButton = {
  ...actionButtonBase,
  border: "1px solid #2563eb",
  color: "#1e40af",
  background: "#ffffff",
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
};

/**
 * Pill-shaped action button that navigates to `to`.
 * `primary` gives the filled style; `showPlusIcon` adds a "+" badge before the label.
 */
const ActionButton = ({ to, label, primary = false, showPlusIcon = false }) => {
  const baseStyle = primary ? primaryActionButton : secondaryActionButton;
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <button
        type="button"
        style={baseStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = primary ? "0 6px 16px rgba(37, 99, 235, 0.4)" : "0 4px 10px rgba(37, 99, 235, 0.18)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = baseStyle.boxShadow;
        }}
      >
        {showPlusIcon && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            +
          </span>
        )}
        {label}
      </button>
    </Link>
  );
};

export default ActionButton;
