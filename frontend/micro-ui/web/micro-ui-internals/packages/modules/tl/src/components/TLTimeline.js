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

  const stepStyle = (isActive) => ({
    display: "flex",
    //flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    // position: "relative",
    color: isActive ? "#3f51b5" : "#ccc",
    padding: "10px 10px",
    width: "260px",
    // margin:"25px",
  });

  const circleStyle = (stepNumber) => {
    let backgroundColor;
    if (stepNumber <= currentStep) {
      backgroundColor = "#0D43A7"; // Completed steps
    } else {
      backgroundColor = "#FFFFFF"; // Incomplete steps
    }

    return {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor,
      color: stepNumber <= currentStep ? "white" : "black",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "10px", // Add spacing
      fontWeight: "normal",
      fontSize: "18px",
      border: stepNumber > currentStep ? "1px solid black" : "",
      position: "relative", // Allow absolute positioning for the line
    };
  };

  const totalSteps = actions.length;

  return (
      <div
        className="stepper-navigation-bar"
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
