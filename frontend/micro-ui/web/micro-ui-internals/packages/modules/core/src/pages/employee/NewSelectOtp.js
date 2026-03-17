import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormStep, OTPInput, CardLabelError } from "@mseva/digit-ui-react-components";

const OtpInput = ({ otp, onOtpChange, onVerifyOtp, onResendOtp, canSubmit, isOtpValid }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(30);

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
      <div style={{ paddingLeft: "20px" }} className="label">
        {t("CS_LOGIN_OTP")}
      </div>
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
          padding: "20px",
        }}
      >
        <OTPInput length={6} onChange={onOtpChange} value={otp} />
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
