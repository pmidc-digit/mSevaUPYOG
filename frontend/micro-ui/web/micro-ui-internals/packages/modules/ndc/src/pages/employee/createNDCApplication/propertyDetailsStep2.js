import React from "react";
import PropertyDetailsFormUser from "./propertyDetailsFormUser";

const PropertyDetailsStep2 = ({ onBackClick, onGoNext }) => {
  return (
    <React.Fragment>
      <PropertyDetailsFormUser onBackClick={onBackClick} onGoNext={onGoNext} />
    </React.Fragment>
  );
};

export default PropertyDetailsStep2;
