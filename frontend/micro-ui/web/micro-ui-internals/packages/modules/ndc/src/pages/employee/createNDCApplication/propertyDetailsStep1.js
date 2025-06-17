import React from "react";
import PropertyDetailsForm from "./propertyDetailsForm";

const PropertyDetailsStep1 = ({ onGoNext }) => {
  return (
    <React.Fragment>
      <PropertyDetailsForm onGoNext={onGoNext} />
    </React.Fragment>
  );
};

export default PropertyDetailsStep1;
