import React from "react";
import { useTranslation } from "react-i18next";
import { TickMark } from "@mseva/digit-ui-react-components";

let actions = [];

const getAction = (flow) => {
  switch (flow) {
    case "STAKEHOLDER":
      actions = [];
      break;
    default:
      actions = ["TL_COMMON_TR_DETAILS", "Owner Details", "TL_COMMON_DOCS", "TL_COMMON_SUMMARY"]; //Replace from localisation
  }
};
const Timeline = ({ currentStep = 1, flow = "" }) => {
  const { t } = useTranslation();
  const isMobile = window.Digit.Utils.browser.isMobile();
  getAction(flow);

  const stepStyle = (isActive, isLast) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: "0 0 auto",
    color: isActive ? "#0D43A7" : "#9CA3AF",
    padding: "14px 12px",
    width: "260px",
    marginBottom: isLast ? "6px" : "18px",
  });

  const circleStyle = (stepNumber) => {
    const completed = stepNumber <= currentStep;
    return {
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      background: completed ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "#ffffff",
      color: completed ? "#ffffff" : "#0f172a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "8px",
      fontWeight: 600,
      fontSize: "18px",
      border: completed ? "none" : "1px solid rgba(15,23,42,0.08)",
      boxShadow: completed ? "0 6px 18px rgba(37,99,235,0.18)" : "0 2px 6px rgba(2,6,23,0.04)",
      position: "relative",
    };
  };

  const totalSteps = actions.length;

  return (
      <div
        className="stepper-navigation-bar"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "18px",
          background: "linear-gradient(180deg, #ffffff, #f8fafc)",
          border: "1px solid rgba(15,23,42,0.04)",
          boxShadow: "0 8px 20px rgba(2,6,23,0.06)",
          borderRadius: "12px",
          minWidth: "120px",
          maxWidth: "320px",
        }}
      >
        {actions.map((action, index, arr) => (
          <div className="step-content" key={index} style={stepStyle(index + 1 <= currentStep, index === totalSteps - 1)}>
            <div className="step-sub-content" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", margin: "10px" }}>
              {index + 1 === totalSteps ? null : (
                <div className="step-form-step-number">
                  Step {index + 1}
                </div>
              )}
              <div className="step-form-step-label">
                {t(action)}
              </div>
            </div>

            <div className="step-circle" style={circleStyle(index + 1)}>
              {index + 1}
              {index < totalSteps - 1 && <div className="line-bw-step-circles"></div>}
            </div>
          </div>
        ))}
      </div>
  );
};

export default Timeline;
