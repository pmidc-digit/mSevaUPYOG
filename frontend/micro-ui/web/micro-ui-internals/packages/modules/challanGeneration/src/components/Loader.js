import React from "react";
import PropTypes from "prop-types";

export const Loader = ({ page = false }) => {
  return (
    <div className={`challan-generation-loader${page ? " challan-generation-loader--page" : ""}`}>
      <div className="challan-generation-loader__spinner" />
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
