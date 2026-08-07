import React from "react";

const Background = ({ banner, children }) => {
  return (
    <div
      className="employee-login-page"
      style={{
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {banner && (
        <div
          style={{
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          {banner}
        </div>
      )}

      {children}
    </div>
  );
};

export default Background;
