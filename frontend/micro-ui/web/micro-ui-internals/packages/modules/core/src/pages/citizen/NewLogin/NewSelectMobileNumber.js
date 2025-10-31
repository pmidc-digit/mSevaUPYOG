import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormStep, MobileNumber } from "@mseva/digit-ui-react-components";

const MobileInput = ({ mobileNumber, onMobileChange, onSendOtp, canSubmit, step }) => {
  const { t } = useTranslation();
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState({ display: "", operation: "" });
  const [captchaError, setCaptchaError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [captchaStartTime, setCaptchaStartTime] = useState(null);
  
  const maxAttempts = 3;
  const blockDuration = 30;

  // Generate captcha with random operation
  const generateCaptcha = () => {
    const operations = [
      { type: 'addition', symbol: '+', gen: () => ({ n1: rand(1, 15), n2: rand(1, 15) }) },
      { type: 'subtraction', symbol: '-', gen: () => ({ n1: rand(11, 30), n2: rand(1, 10) }) },
      { type: 'multiplication', symbol: '×', gen: () => ({ n1: rand(2, 10), n2: rand(2, 10) }) }
    ];
    
    const op = operations[rand(0, 2)];
    const { n1, n2 } = op.gen();
    const answer = op.type === 'addition' ? n1 + n2 : op.type === 'subtraction' ? n1 - n2 : n1 * n2;
    
    setCaptchaQuestion({ display: `${n1} ${op.symbol} ${n2} = ?`, operation: op.type });
    setCaptchaAnswer("");
    setCaptchaVerified(false);
    setCaptchaError(false);
    setCaptchaStartTime(Date.now());
    
    window.__verify_captcha__ = (input) => parseInt(input) === answer;
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  useEffect(() => {
    generateCaptcha();
    return () => delete window.__verify_captcha__;
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isBlocked || timeLeft === 0) {
      if (isBlocked) {
        setIsBlocked(false);
        setAttempts(0);
        generateCaptcha();
      }
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [isBlocked, timeLeft]);

  // Verify captcha
  const verifyCaptcha = (userAnswer) => {
    if (Date.now() - captchaStartTime < 1000) return false;
    return window.__verify_captcha__?.(userAnswer);
  };

  // Handle answer input
  const handleCaptchaAnswerChange = (e) => {
    if (isBlocked || !/^-?\d*$/.test(e.target.value)) return;
    setCaptchaAnswer(e.target.value);
    setCaptchaError(false);
    setCaptchaVerified(false);
  };

  // Verify on blur
  const handleCaptchaBlur = () => {
    if (!captchaAnswer || isBlocked) return;

    if (verifyCaptcha(captchaAnswer)) {
      setCaptchaVerified(true);
      setCaptchaError(false);
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setCaptchaError(true);
      setCaptchaVerified(false);
      
      if (newAttempts >= maxAttempts) {
        setIsBlocked(true);
        setTimeLeft(blockDuration);
        setCaptchaAnswer("");
      } else {
        setTimeout(generateCaptcha, 500);
      }
    }
  };

  const handleRefreshCaptcha = () => !isBlocked && generateCaptcha();
  
  return (
    <div className="input-wrapper" style={{width:"100%"}}> 
      <div className="label">
        {t("CS_LOGIN_PROVIDE_MOBILE_NUMBER")}
        <span> *</span>
      </div>
      <FormStep
        isDisabled={!(mobileNumber?.length === 10 && canSubmit && captchaVerified && !isBlocked)}
        onSelect={onSendOtp}
        config={{ texts: { submitBarLabel: t("CS_COMMONS_NEXT") }, submit: false }}
        t={t}
        onChange={onMobileChange}
        value={mobileNumber}
        cardStyle={{
          backgroundColor: "transparent", // use transparent instead of none
          boxShadow: "none",
          WebkitBoxShadow: "none",
          padding: "0",
        }}
      >
        <div className={`input-wrapper ${step === "OTP" && !canSubmit ? "hide-submit-buttons" : ""}`}>
          <MobileNumber value={mobileNumber} onChange={onMobileChange} placeholder={t("CORE_COMMON_MOBILE_NUMBER")} disabled={isBlocked} />
        </div>
      </FormStep>
      
      {/* Math CAPTCHA */}
      <div id="math-captcha-container" style={{ 
        marginTop: "20px", 
        padding: "15px",
        border: `2px solid ${isBlocked ? '#d32f2f' : '#1976d2'}`,
        backgroundColor: isBlocked ? "#ffebee" : "#f5f5f5",
        borderRadius: "8px",
        opacity: isBlocked ? 0.6 : 1
      }}>
        <label style={{ fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
          🔢 Security Check *
        </label>
        
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <div style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: isBlocked ? "#999" : "#1976d2",
            backgroundColor: "white",
            padding: "10px 15px",
            borderRadius: "6px",
            border: `2px solid ${isBlocked ? '#999' : '#1976d2'}`,
            minWidth: "150px",
            textAlign: "center"
          }}>
            {captchaQuestion.display}
          </div>
          
          <button type="button" onClick={handleRefreshCaptcha} disabled={isBlocked} style={{
            padding: "8px 12px",
            backgroundColor: isBlocked ? "#ccc" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isBlocked ? "not-allowed" : "pointer",
            fontSize: "16px"
          }}>
            ↻
          </button>
        </div>
        
        <input
          type="text"
          value={captchaAnswer}
          onChange={handleCaptchaAnswerChange}
          onBlur={handleCaptchaBlur}
          disabled={isBlocked}
          placeholder={isBlocked ? "Blocked" : "Enter answer"}
          maxLength="4"
          autoComplete="off"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: `2px solid ${captchaError ? '#d32f2f' : '#ccc'}`,
            borderRadius: "6px",
            backgroundColor: isBlocked ? "#f0f0f0" : "white"
          }}
        />
        
        {isBlocked && (
          <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#ffcdd2", borderRadius: "6px" }}>
            <p style={{ color: "#d32f2f", fontSize: "14px", fontWeight: "600", margin: 0 }}>
              🚫 Too many failed attempts! Wait {timeLeft}s
            </p>
          </div>
        )}
        
        {captchaVerified && !isBlocked && (
          <p style={{ marginTop: "10px", color: "#2e7d32", fontSize: "14px", fontWeight: "600", margin: "10px 0 0 0" }}>
            ✓ Correct!
          </p>
        )}
        
        {captchaError && !isBlocked && (
          <p style={{ marginTop: "10px", color: "#d32f2f", fontSize: "14px", margin: "10px 0 0 0" }}>
            ✗ Wrong answer. {maxAttempts - attempts} {maxAttempts - attempts === 1 ? 'attempt' : 'attempts'} left.
          </p>
        )}
      </div>
    </div>
  );
};

export default MobileInput;
