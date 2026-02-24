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

  const totalSteps = actions.length;

  return (
      <div className="stepper-navigation-bar TL-stepper-nav">
        {actions.map((action, index, arr) => (
          <div className={`step-content TL-step-item${index === totalSteps - 1 ? " TL-step-item-last" : ""}${index + 1 <= currentStep ? " TL-step-active" : " TL-step-inactive"}`} key={index}>
            <div className="step-sub-content TL-step-sub-content">
              {index + 1 === totalSteps ? null : (
                <div className="step-form-step-number">
                  Step {index + 1}
                </div>
              )}
              <div className="step-form-step-label">
                {t(action)}
              </div>
            </div>

            <div className={`step-circle TL-step-circle${index + 1 <= currentStep ? " TL-step-circle-completed" : " TL-step-circle-pending"}`}>
              {index + 1}
              {index < totalSteps - 1 && <div className="line-bw-step-circles"></div>}
            </div>
          </div>
        ))}
      </div>
  );
};

export default Timeline;
