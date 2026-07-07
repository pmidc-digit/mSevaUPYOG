import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import OTPInput from "./OTPInput";
import CardLabelError from "./CardLabelError";
import SubmitBar from "./SubmitBar";
import { Loader } from "./Loader";

const OTPVerifier = ({
  mobileNumber,
  onSuccess,
  onError,
  onVerify,
  tenantId,
  userType = "CITIZEN",
  otpType = "login",
  otpLength = 6,
  maxTime = 30,
  t: customT,
}) => {
  const { t: fallbackT } = useTranslation();
  const t = customT || fallbackT;

  const [otp, setOtp] = useState("");
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [error, setError] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const activeTenantId = tenantId || Digit.ULBService.getStateId() || Digit.ULBService.getCurrentTenantId();

  // Send OTP Function
  const handleSendOtp = async (isResend = false) => {
    if (!mobileNumber) {
      const errMessage = t("CS_OTP_MOBILE_NUMBER_REQUIRED");
      setError(errMessage);
      if (onError) onError(new Error(errMessage));
      return;
    }

    try {
      setIsOtpSending(true);
      setError(null);
      
      const payload = {
        otp: {
          mobileNumber,
          tenantId: activeTenantId,
          userType,
          type: otpType,
        },
      };

      const res = await Digit.UserService.sendOtp(payload, activeTenantId);
      
      if (res && (res.isSuccessful || res.ResponseInfo?.status === "successful" || !res.error)) {
        setIsOtpSent(true);
        setTimeLeft(maxTime);
        setOtp("");
      } else {
        const errMsg = res?.error?.message || t("CS_OTP_SEND_FAILED");
        setError(errMsg);
        if (onError) onError(res?.error || new Error(errMsg));
      }
    } catch (err) {
      console.error("Error in OTPVerifier.sendOtp:", err);
      const errMsg = err?.response?.data?.error?.message || err?.message || t("CS_OTP_SEND_FAILED");
      setError(errMsg);
      if (onError) onError(err);
    } finally {
      setIsOtpSending(false);
    }
  };

  // Trigger Send OTP on mount / mobileNumber change
  useEffect(() => {
    if (mobileNumber) {
      handleSendOtp();
    }
  }, [mobileNumber, activeTenantId]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOtpSent || timeLeft <= 0) return;

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
  }, [isOtpSent, timeLeft]);

  // Handle Verify OTP Function
  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (otp.length !== otpLength) {
      setError(t("CS_INVALID_OTP_LENGTH"));
      return;
    }

    try {
      setIsOtpVerifying(true);
      setError(null);

      let response;
      if (onVerify) {
        // Use custom verify logic if provided
        response = await onVerify(otp, mobileNumber);
      } else {
        // Default verification flow using authentication
        const requestData = {
          username: mobileNumber,
          password: otp,
          tenantId: activeTenantId,
          userType,
        };
        response = await Digit.UserService.authenticate(requestData);
      }

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      console.error("Error in OTPVerifier.verifyOtp:", err);
      const errMsg = err?.response?.data?.error?.message || err?.message || t("CS_INVALID_OTP");
      setError(errMsg);
      if (onError) {
        onError(err);
      }
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handleResend = () => {
    handleSendOtp(true);
  };

  const maskedMobile = mobileNumber
    ? `+91 ${mobileNumber.substring(0, 2)}******${mobileNumber.substring(mobileNumber.length - 2)}`
    : "";

  if (isOtpSending && !isOtpSent) {
    return (
      <div className="otp-verifier-loading" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
        <Loader page={false} />
        <div style={{ marginTop: "10px", fontSize: "16px" }}>{t("CS_OTP_SENDING")}</div>
      </div>
    );
  }

  return (
    <div className="input-wrapper otp-verifier-container" style={{ width: "100%", padding: "16px 0" }}>
      <div className="label otp-verifier-label" style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>
        {t("CS_LOGIN_OTP")}
      </div>
      
      {maskedMobile && (
        <div className="otp-verifier-info" style={{ fontSize: "14px", color: "#505A5F", marginBottom: "16px" }}>
          {t("CS_OTP_SENT_TO_MOB")} <span style={{ fontWeight: "bold" }}>{maskedMobile}</span>
        </div>
      )}

      <OTPInput length={otpLength} onChange={setOtp} value={otp} />

      <div className="otp-verifier-timer-container" style={{ margin: "16px 0 24px 0" }}>
        {timeLeft > 0 ? (
          <div className="resendIn" style={{ fontSize: "14px", color: "#505A5F" }}>
            {t("CS_RESEND_ANOTHER_OTP")} <span style={{ fontWeight: "bold", color: "#F47738" }}>{timeLeft}</span> {t("CS_RESEND_SECONDS")}
          </div>
        ) : (
          <div
            className="card-text-button resend"
            onClick={handleResend}
            style={{
              fontSize: "14px",
              color: "#F47738",
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            {t("CS_RESEND_OTP")}
          </div>
        )}
      </div>

      {error && <CardLabelError style={{ marginBottom: "16px" }}>{error}</CardLabelError>}

      <SubmitBar
        label={isOtpVerifying ? t("CS_OTP_VERIFYING") : t("CS_COMMON_SUBMIT")}
        onSubmit={handleVerifyOtp}
        disabled={otp.length !== otpLength || isOtpVerifying}
        style={{ width: "100%" }}
      />
    </div>
  );
};

OTPVerifier.propTypes = {
  mobileNumber: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onVerify: PropTypes.func,
  tenantId: PropTypes.string,
  userType: PropTypes.string,
  otpType: PropTypes.string,
  otpLength: PropTypes.number,
  maxTime: PropTypes.number,
  t: PropTypes.func,
};

export default OTPVerifier;
