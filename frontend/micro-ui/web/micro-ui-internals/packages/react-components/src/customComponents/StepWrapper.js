import React from "react";
import { useTranslation } from "react-i18next";
import { TickMark } from "@upyog/digit-ui-react-components";

const StepWrapper = ({ children, currentStep = 1, nextStep, prevStep, stepsList = [] }) => {
  const { t } = useTranslation();
  const stepStyle = (isActive) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    position: "relative",
    color: isActive ? "#3f51b5" : "#ccc",
  });

  // const circleStyle = (isActive) => ({
  //   width: "30px",
  //   height: "30px",
  //   borderRadius: "50%",
  //   backgroundColor: isActive ? "#3f51b5" : "#ccc",
  //   color: isActive ? "white" : "black",
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginBottom: "5px",
  //   fontWeight: "normal",
  // });

  const circleStyle = (stepNumber) => {
    let backgroundColor;
    if (stepNumber < currentStep) {
      backgroundColor = "#2db92d"; // Completed steps
    } else if (stepNumber === currentStep) {
      backgroundColor = "#e69500"; // Current step
    } else {
      backgroundColor = "#ccc"; // Incomplete steps
    }

    return {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor,
      color: stepNumber <= currentStep ? "white" : "black",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "5px",
      fontWeight: "normal",
    };
  };

  const labelStyle = {
    fontSize: "14px",
    color: "black",
    fontWeight: "bold",
  };

  const stepNumberStyle = {
    fontSize: "13px",
    color: "black",
  };

  const buttonStyle = {
    next: {
      backgroundColor: "#3f51b5",
      color: "white",
      border: "none",
      padding: "10px 20px",
      cursor: "pointer",
      marginLeft: "10px",
    },
    back: {
      backgroundColor: "transparent",
      color: "#3f51b5",
      border: "1px solid #3f51b5",
      padding: "10px 20px",
      cursor: "pointer",
    },
  };

  //   const lineStyle = {
  //     content: '""',
  //     position: 'absolute',
  //     top: '50%',
  //     right: '-50%',
  //     width: '100%',
  //     height: '2px',
  //     backgroundColor: 'black',
  //     zIndex: -1,
  //   };
  const isMobile = window.Digit.Utils.browser.isMobile();
  const totalSteps = stepsList.length;
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "1500px",
          minWidth: "650px",
          marginRight: "auto",
          marginBottom: "20px",
        }}
      >
        {[...Array(totalSteps)].map((_, index) => (
          <div key={index} style={stepStyle(index + 1 <= currentStep)}>
            <div style={circleStyle(index + 1)}>{index < currentStep - 1 ? <TickMark /> : index + 1}</div>
            <div style={stepNumberStyle}>Step {index + 1}</div>
            <div style={labelStyle}>{t(stepsList[index].stepLabel)}</div>
            {/* {index < totalSteps - 1 && <div style={lineStyle}></div>} */}
          </div>
        ))}
      </div>
      {/* <div className="timeline-container" style={isMobile ? {} : { maxWidth: "960px", minWidth: "640px", marginRight: "auto" }}>
        {stepLabels.map((action, index, arr) => (
          <div className="timeline-checkpoint" key={index}>
            <div className="timeline-content">
              <span className={`circle ${index <= currentStep - 1 && "active"}`}>{index < currentStep - 1 ? <TickMark /> : index + 1}</span>
              <span className="secondary-color">{t(action)}</span>
            </div>
            {index < arr.length - 1 && <span className={`line ${index < currentStep - 1 && "active"}`}></span>}
          </div>
        ))}
      </div> */}
      <div
        style={{
          width: "100%",
          //maxWidth: "1500px",
          marginBottom: "20px",
        }}
      >
        {children}
      </div>
      {/* <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", position: "fixed", bottom: "50px", right: "20px", padding: "10px" }}> */}
        {/* {currentStep > 1 && (
          <button style={buttonStyle.back} onClick={prevStep}>
            Back
          </button>
        )} */}
        {/* {currentStep < totalSteps && (
          <button style={buttonStyle.next} onClick={nextStep}>
            Next &rarr;
          </button>
        )}
        {currentStep === totalSteps && (
          <button style={buttonStyle.next} type="submit">
            Submit
          </button>
        )} */}
      {/* </div> */}
    </div>
  );
};

export default StepWrapper;
