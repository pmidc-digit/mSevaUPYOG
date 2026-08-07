import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const TextArea = (props) => {
  const user_type = Digit.SessionStorage.get("userType");
  const internalRef = useRef(null);
  const actualRef = props.inputRef || internalRef;

  const adjustHeight = () => {
    if (actualRef.current && (props?.className?.includes("custom-fee-table-textarea") || props?.className?.includes("checklist-table-textarea") || props?.autoGrow)) {
      actualRef.current.style.setProperty("height", "auto", "important");
      actualRef.current.style.setProperty("height", `${Math.max(actualRef.current.scrollHeight, 40)}px`, "important");
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value, props.className]);

  const handleInput = (e) => {
    adjustHeight();
    if (props.onInput) props.onInput(e);
  };

  return (
    <React.Fragment>
    <textarea
      placeholder={props.placeholder}
      name={props.name}
      ref={actualRef}
      style={props.style}
      id={props.id}
      value={props.value}
      onChange={props.onChange}
      onInput={handleInput}
      className={`${user_type !== "citizen" ? "employee-card-textarea" : "card-textarea"} ${props.disable && "disabled"} ${
        props?.className ? props?.className : ""
      }`}
      minLength={props.minLength}
      maxLength={props.maxLength} 
      autoComplete="off"
      disabled={props.disabled}
    ></textarea>
    {  <p className="cell-text">{props.hintText}</p>}
    </React.Fragment>
  );
};

TextArea.propTypes = {
  userType: PropTypes.string,
  name: PropTypes.string.isRequired,
  ref: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  id: PropTypes.string,
};

TextArea.defaultProps = {
  ref: undefined,
  onChange: undefined,
};

export default TextArea;
