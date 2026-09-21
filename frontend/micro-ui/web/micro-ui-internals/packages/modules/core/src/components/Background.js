import React from "react";

const Background = ({ children, className = "" }) => {
  return (
    <div
      className={`employee-login-page ${className}`}
      style={{ zIndex: "2" }}
    >

      {children}
    </div>
  );
};

export default Background;
