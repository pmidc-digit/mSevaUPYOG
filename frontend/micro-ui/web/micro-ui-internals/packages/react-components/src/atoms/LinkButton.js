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
    color: "#FFFFFF",
    backgroundColor: "#2947A3",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    padding: "8px 24px",
    display: "inline-block",
    height: "45px",
    fontSize: "18px",
  },

};

export default LinkButton;
