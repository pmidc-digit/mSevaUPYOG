import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormStep, OTPInput, CardLabelError } from "@mseva/digit-ui-react-components";

const OtpInput = ({ otp, onOtpChange, onVerifyOtp, onResendOtp, canSubmit, isOtpValid }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(30);
  const [showOtp, setShowOtp] = useState(false);

  useEffect(() => {
    if (timeLeft === 0) return; // don't start if timer is at 0

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResendOtp = () => {
    onResendOtp && onResendOtp();
    setTimeLeft(30);
  };

  return (
    <div className="input-wrapper">
      <div className="label">{t("CS_LOGIN_OTP")}</div>
      <FormStep
        onSelect={onVerifyOtp}
        config={{
          texts: {
            // header: t("CS_LOGIN_OTP"),
            submitBarLabel: t("CS_COMMON_SUBMIT"),
          },
        }}
        t={t}
        isDisabled={!(otp?.length === 6 && canSubmit)}
        cardStyle={{
          backgroundColor: "transparent", // use transparent instead of none
          boxShadow: "none",
          WebkitBoxShadow: "none",
          padding: "0",
        }}
      >
        <OTPInput masked={!showOtp} length={6} onChange={onOtpChange} value={otp} />
        <div className="otp-toggle-row">
          <button
            type="button"
            className={`otp-visibility-toggle ${showOtp ? "is-visible" : ""}`}
            onClick={() => setShowOtp((prev) => !prev)}
            aria-label={showOtp ? "Hide OTP" : "Show OTP"}
            aria-pressed={showOtp}
          >
            {showOtp ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
            <span>{showOtp ? "Hide" : "Show"}</span>
          </button>
        </div>
        {timeLeft > 0 ? (
          <div className="resendIn">
            {t("CS_RESEND_ANOTHER_OTP")} <span>{timeLeft}</span> {t("CS_RESEND_SECONDS")}
          </div>
        ) : (
          <div className="card-text-button resend" onClick={handleResendOtp}>
            {t("CS_RESEND_OTP")}
          </div>
        )}
         {!isOtpValid && <CardLabelError>{t("CS_INVALID_OTP")}</CardLabelError>} 
      </FormStep>
    </div>
  );
};

export default OtpInput;
