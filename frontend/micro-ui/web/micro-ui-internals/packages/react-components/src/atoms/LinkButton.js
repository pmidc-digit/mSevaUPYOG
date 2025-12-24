import React from "react";
import PropTypes from "prop-types";

const LinkButton = (props) => {
  // If className includes 'submit-bar', don't apply default inline styles
  const hasSubmitBarClass = props.className && props.className.includes('submit-bar');
  const appliedStyle = hasSubmitBarClass ? props.style : { ...LinkButton.defaultProps.style, ...props.style };
  
  return (
    <button className={`card-link cp ${props.className || ''}`} onClick={props.onClick} style={appliedStyle}>
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
    // color: "#FFFFFF",
    // backgroundColor: "#2947A3",
    // border: "none",
    // borderRadius: "8px",
    // cursor: "pointer",
    // padding: "8px 16px",
    // display: "inline-block",
    // height: "35px",
    // fontSize: "18px",
  },
};

export default LinkButton;
