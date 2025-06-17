import React from "react";
import PropTypes from "prop-types";

export const Loader = ({ page = false }) => (
  <div
    style={{
      display: "flex",
      position: "fixed",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999,
      backgroundColor: "rgba(255, 255, 255, 0.6)", // semi-transparent background
      backdropFilter: "blur(5px)", // blur effect
      WebkitBackdropFilter: "blur(5px)", // Safari support
    }}
    className={`${page ? "page" : "module"}-loader`}
  >
    <div className="loadingio-spinner-rolling-faewnb8ux8">
      <div className="ldio-pjg92h09b2o">
        <div></div>
      </div>
    </div>
  </div>
);

Loader.propTypes = {
  /**
   * Is this is page or a module?
   */
  page: PropTypes.bool,
};

Loader.defaultProps = {
  page: false,
};
