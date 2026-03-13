import React from "react";
import PropTypes from "prop-types";

const CustomMenu = (props) => {

  return (
    <div className="menu-wrap-position" style={props.style}>
      {props.options.map((option, index) => {
        return (
          <div key={index} onClick={() => props.onSelect(option)}>
            <p>{props.t ? props.t(`${props.optionKey ? option[props.optionKey] : option}`) : option}</p>
          </div>
        );
      })}
    </div>
  );
};

export default CustomMenu;
