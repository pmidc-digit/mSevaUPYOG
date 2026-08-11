import React from "react";
import PropTypes from "prop-types";

export const Loader = ({ page = false }) => {
  return (
    <div className={`gc-loader-container${page ? " gc-loader-container--page" : ""}`}>
      <div className="gc-loader-spinner" />
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
