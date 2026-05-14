import React, { useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { ArrowLeft} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const CustomBackButton = ({ className = "", variant = "black", style = {}, fallbackPath = "/digit-ui/citizen" }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const previousLocationRef = useRef(null);

  // Track location changes and store previous location
  useEffect(() => {
    const currentStored = sessionStorage.getItem("customBackButton_currentLocation");
    
    // Store current as previous before updating
    if (currentStored && currentStored !== location.pathname) {
      previousLocationRef.current = currentStored;
    }
    
    // Update current location in sessionStorage
    sessionStorage.setItem("customBackButton_currentLocation", location.pathname);
  }, [location.pathname]);

  const handleBackClick = () => {
    const prevLocation = previousLocationRef.current;
    
    if (prevLocation && prevLocation !== location.pathname) {
      // Navigate to previous location using push (not goBack - avoids history.block POP action)
      history.push(prevLocation);
    } else {
      // Fallback to default path if no previous location exists
      history.push(fallbackPath);
    }
  };

  return (
    <div 
      className={`back-btn2 ${className}`} 
      style={style} 
      onClick={handleBackClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleBackClick();
        }
      }}
    >
      {(
        <React.Fragment>
          <ArrowLeft />
          <p>{t("CS_COMMON_BACK")}</p>
        </React.Fragment>
      )}
    </div>
  );
};

export default CustomBackButton;
