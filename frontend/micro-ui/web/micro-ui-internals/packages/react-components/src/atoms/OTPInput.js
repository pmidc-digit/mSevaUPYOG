import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const BACKSPACE = 8;

const SingleInput = ({ isFocus, onChange, onFocus, value, ...rest }) => {
  const inputRef = useRef();
  useEffect(() => {
    if (isFocus) {
      inputRef.current.focus();
    }
  }, [isFocus]);

  return (
    <input
      className="input-otp"
      maxLength={1}
      onChange={onChange}
      onFocus={onFocus}
      ref={inputRef}
      type="password"
      value={value ? value : ""}
      {...rest}
    />
  );
};

const OTPInput = (props) => {
  const [activeInput, setActiveInput] = useState(0);
  const [showOtp, setShowOtp] = useState(false);

  const isInputValueValid = (value) => {
    return typeof value === "string" && value.trim().length === 1;
  };

  const changeCodeAtFocus = (value) => {
    const { onChange } = props;
    const otp = getOtpValue();
    otp[activeInput] = value[0];
    const otpValue = otp.join("");
    onChange(otpValue);
  };

  const focusNextInput = () => {
    setActiveInput((activeInput) => Math.min(activeInput + 1, props.length - 1));
  };

  const focusPrevInput = () => {
    setActiveInput((activeInput) => Math.max(activeInput - 1, 0));
  };

  const getOtpValue = () => (props.value ? props.value.toString().split("") : []);

  const handleKeyDown = (event) => {
    if (event.keyCode === BACKSPACE || event.key === "Backspace") {
      event.preventDefault();
      changeCodeAtFocus("");
      focusPrevInput();
    }
  };

  function inputChange(event) {
    const { value } = event.target;
    changeCodeAtFocus(value);
    if (isInputValueValid(value)) {
      focusNextInput();
    }
  }

  const OTPStack = [];
  const otp = getOtpValue();
  for (let i = 0; i < props.length; i++) {
    OTPStack.push(
      <SingleInput
        key={i}
        isFocus={activeInput === i}
        onChange={inputChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          setActiveInput(i);
          e.target.select();
        }}
        value={otp[i]}
        type={showOtp ? "text" : "password"}
      />
    );
  }

  if (!props.showToggle) {
    return <div className="input-otp-wrap">{OTPStack}</div>;
  }

  return (
    <div>
      <div className="input-otp-wrap">{OTPStack}</div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
        <button
          type="button"
          className="otp-toggle-button"
          onClick={() => setShowOtp((prev) => !prev)}
          aria-label={showOtp ? "Hide OTP" : "Show OTP"}
          aria-pressed={showOtp}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "999px",
            border: "1px solid #5243E9",
            background: showOtp ? "#5243E9" : "#F3F1FE",
            color: showOtp ? "#FFFFFF" : "#5243E9",
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "0.3px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(82, 67, 233, 0.18)",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
            {!showOtp && <line x1="3" y1="3" x2="21" y2="21" />}
          </svg>
          {showOtp ? "Hide OTP" : "Show OTP"}
        </button>
      </div>
    </div>
  );
};

OTPInput.propTypes = {
  length: PropTypes.number,
  showToggle: PropTypes.bool,
};

OTPInput.defaultProps = {
  length: 0,
  showToggle: false,
};

export default OTPInput;
