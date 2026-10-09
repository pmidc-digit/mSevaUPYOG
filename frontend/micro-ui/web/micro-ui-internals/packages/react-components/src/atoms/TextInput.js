import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const TextInput = (props) => {
  const user_type = Digit.SessionStorage.get("userType");
  const [date, setDate] = useState();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const canTogglePassword = props.showPasswordToggle && props.type === "password";
  const inputType = canTogglePassword ? (passwordVisible ? "text" : "password") :
    (props?.validation && props.ValidationRequired ? props?.validation?.type : props.type || "text");
  const data = props?.watch
    ? {
        fromDate: props?.watch("fromDate"),
        toDate: props?.watch("toDate"),
      }
    : {};

  const handleDate = (event) => {
    const { value } = event.target;
    setDate(getDDMMYYYY(value));
  };

  return (
    <React.Fragment>
      <div
        className={`text-input ${user_type === "employee" ? "" : "text-input-width"} ${props.className}`}
        style={{ ...props.textInputStyle, ...(canTogglePassword ? { position: "relative", display: "grid", alignItems: "center" } : {}) }}
      >
        {props.isMandatory ? (
          <input
            type={inputType}
            name={props.name}
            id={props.id}
            className={`${user_type ? "employee-card-input-error" : "card-input-error"} ${props.disable && "disabled"}`}
            placeholder={props.placeholder}
            onChange={(event) => {
              if (props?.onChange) {
                props?.onChange(event);
              }
              if (props.type === "date") {
                handleDate(event);
              }
            }}
            ref={props.inputRef}
            value={props.value}
            style={{ ...props.style, ...(canTogglePassword ? { paddingRight: "48px", gridArea: "1 / 1", marginTop: 0, marginBottom: 0 } : {}) }}
            defaultValue={props.defaultValue}
            minLength={props.minlength}
            maxLength={props.maxlength}
            max={props.max}
            pattern={props?.validation && props.ValidationRequired ? props?.validation?.pattern : props.pattern}
            min={props.min}
            readOnly={props.disable}
            title={props?.validation && props.ValidationRequired ? props?.validation?.title : props.title}
            step={props.step}
            autoFocus={props.autoFocus}
            onBlur={props.onBlur}
            autoComplete="off"
            disabled={props.disabled}
          />
        ) : (
          <input
            type={inputType}
            name={props.name}
            id={props.id}
            className={`${user_type ? "employee-card-input" : "citizen-card-input"} ${props.disable && "disabled"} focus-visible ${
              props.errorStyle && "employee-card-input-error"
            }`}
            placeholder={props.placeholder}
            onChange={(event) => {
              if (props?.onChange) {
                props?.onChange(event);
              }
              if (props.type === "date") {
                handleDate(event);
              }
            }}
            ref={props.inputRef}
            value={props.value}
            style={{ ...props.style, ...(canTogglePassword ? { paddingRight: "48px", gridArea: "1 / 1", marginTop: 0, marginBottom: 0 } : {}) }}
            defaultValue={props.defaultValue}
            minLength={props.minlength}
            maxLength={props.maxlength}
            max={props.max}
            required={
              props?.validation && props.ValidationRequired
                ? props?.validation?.isRequired
                : props.isRequired || (props.type === "date" && (props.name === "fromDate" ? data.toDate : data.fromDate))
            }
            pattern={props?.validation && props.ValidationRequired ? props?.validation?.pattern : props.pattern}
            min={props.min}
            readOnly={props.disable}
            title={props?.validation && props.ValidationRequired ? props?.validation?.title : props.title}
            step={props.step}
            autoFocus={props.autoFocus}
            onBlur={props.onBlur}
            onKeyPress={props.onKeyPress}
            autoComplete="off"
            disabled={props.disabled}
          />
        )}
        {/* {props.type === "date" && <DatePicker {...props} date={date} setDate={setDate} data={data} />} */}
        {canTogglePassword && (
          <button
            type="button"
            aria-label={passwordVisible ? props.hidePasswordLabel || "Hide password" : props.showPasswordLabel || "Show password"}
            aria-pressed={passwordVisible}
            disabled={props.disabled || props.disable}
            onClick={() => setPasswordVisible((visible) => !visible)}
            style={{ position: "relative", gridArea: "1 / 1", justifySelf: "end", alignSelf: "center", margin: "0 4px 0 0", padding: 0, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: 0, cursor: "pointer", color: "#154e85" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {passwordVisible && <path d="M3 3l18 18" />}
            </svg>
          </button>
        )}
        {props.signature ? props.signatureImg : null}
      </div>
    </React.Fragment>
  );
};

TextInput.propTypes = {
  userType: PropTypes.string,
  isMandatory: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  ref: PropTypes.func,
  value: PropTypes.any,
};

TextInput.defaultProps = {
  isMandatory: false,
};

function DatePicker(props) {
  useEffect(() => {
    if (props?.shouldUpdate) {
      props?.setDate(getDDMMYYYY(props?.data[props.name], "yyyymmdd"));
    }
  }, [props?.data]);

  useEffect(() => {
    props.setDate(getDDMMYYYY(props?.defaultValue));
  }, []);

  return (
    <input
      type="text"
      className={`${props.disable && "disabled"} card-date-input`}
      name={props.name}
      id={props.id}
      placeholder={props.placeholder}
      defaultValue={props.date}
      readOnly={true}
    />
  );
}

function getDDMMYYYY(date) {
  if (!date) return "";

  // Safari needs full ISO format
  const safeDate = date.includes("T") ? date : date + "T00:00:00";

  const d = new Date(safeDate);
  if (isNaN(d)) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

export default TextInput;
