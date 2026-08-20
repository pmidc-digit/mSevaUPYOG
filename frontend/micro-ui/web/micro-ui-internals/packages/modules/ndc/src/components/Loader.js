import React from "react";
import PropTypes from "prop-types";

export const Loader = ({ page = false }) => {
  return (
    <div className={`ndc-loader ${page ? "ndc-loader--page" : ""}`}>
      <div className="ndc-loader__spinner" />
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
