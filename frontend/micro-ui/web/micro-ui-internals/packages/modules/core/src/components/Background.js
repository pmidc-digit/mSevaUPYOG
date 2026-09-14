import React from "react";

<<<<<<< HEAD
const Background = ({children }) => {
=======
const Background = ({ banner, children }) => {
>>>>>>> MicroUI_PROD_Vite
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
<<<<<<< HEAD
=======
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
>>>>>>> MicroUI_PROD_Vite

      {children}
    </div>
  );
};

export default Background;
