import React from "react";
import PropTypes from "prop-types";

export const Loader = ({ page = false }) => {
  // const baseStyle = {
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  // };

  // const pageStyle = {
  //   ...baseStyle,
  //   position: "fixed",
  //   top: 0,
  //   left: 0,
  //   width: "100vw",
  //   height: "100vh",
  //   background: "rgba(255,255,255,0.6)", // semi-transparent white
  //   backdropFilter: "blur(4px)", // blur effect
  //   zIndex: 9999,
  // };

  // const moduleStyle = {
  //   ...baseStyle,
  //   minHeight: "100px",
  //   width: "100%",
  //   position: "relative",
  // };

  // const spinnerStyle = {
  //   width: "64px",
  //   height: "64px",
  //   border: "8px solid #1976d2",
  //   borderTop: "8px solid transparent",
  //   borderRadius: "50%",
  //   animation: "spin 1.2s linear infinite",
  // };

  return (
    <div className={`chb-loader-container ${page ? "chb-page-loader-overlay" : "chb-module-loader-container"}`}>
      <div className="chb-spinner" />
    </div>
  );
};

Loader.propTypes = {
  /** Full page loader or module loader */
  page: PropTypes.bool,
};

Loader.defaultProps = {
  page: false,
};
