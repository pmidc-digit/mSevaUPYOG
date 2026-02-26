import React from "react";

const ChevronIcon = ({ isOpen }) => (
  <div
    style={{
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: "#cfe6fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.3s ease",
    }}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 9L12 15L18 9" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export { ChevronIcon };
