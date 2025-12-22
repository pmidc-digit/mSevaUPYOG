import React from "react";

const Background = ({ children }) => {
  return (
    <div
      className="employee-login-page"
      style={{ zIndex: "2" }}
    >
      {children}
    </div>
  );
};

export default Background;
