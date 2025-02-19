import React from "react";
import PropTypes from "prop-types";

const LinkButton = (props) => {
  return (
    <button className={`card-link cp ${props.className}`} onClick={props.onClick} style={{ ...props.style, ...LinkButton.defaultProps.style}}>
      {props.label}
    </button>
  );
};

LinkButton.propTypes = {
  /**
   * LinkButton contents
   */
  label: PropTypes.any,
  /**
   * Optional click handler
   */
  onClick: PropTypes.func,

  style: PropTypes.object,

};

LinkButton.defaultProps = {

  style: {
    color: "#FFFFFF !important",
    backgroundColor: "#2947A3 !important",
    border: "none !important",
    borderRadius: "6px !important",
    cursor: "pointer !important",
    padding: "8px 24px !important",
    display: "inline-block !important",
    height: "45px !important",
    fontSize: "18px !important",
  },

};

export default LinkButton;
