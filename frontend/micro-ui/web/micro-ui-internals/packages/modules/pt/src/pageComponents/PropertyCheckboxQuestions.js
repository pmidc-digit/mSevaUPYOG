import { CheckBox } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";

const PropertyCheckboxQuestions = ({ t, config, onSelect, value, userType, formData }) => {
  const [hasInflammableMaterial, setHasInflammableMaterial] = useState(formData?.propertyCheckboxQuestions?.hasInflammableMaterial || false);
  const [isPropertyHeightMoreThan36Feet, setIsPropertyHeightMoreThan36Feet] = useState(
    formData?.propertyCheckboxQuestions?.isPropertyHeightMoreThan36Feet || false
  );

  useEffect(() => {
    onSelect(config.key, { ...formData?.propertyCheckboxQuestions, hasInflammableMaterial });
  }, [hasInflammableMaterial]);

  useEffect(() => {
    onSelect(config.key, { ...formData?.propertyCheckboxQuestions, isPropertyHeightMoreThan36Feet });
  }, [isPropertyHeightMoreThan36Feet]);

  console.log("formData in PropertyCheckboxQuestions: ", formData);

  return (
    <div>
      <CheckBox
        onChange={(e) => setHasInflammableMaterial(e.target.checked)}
        checked={hasInflammableMaterial}
        label={t("Do you have any inflammable material stored in your property?")}
        pageType={userType}
        style={{ marginTop: "-5px" }}
      />
      <CheckBox
        onChange={(e) => setIsPropertyHeightMoreThan36Feet(e.target.checked)}
        checked={isPropertyHeightMoreThan36Feet}
        label={t("Height of property more than 36 feet?")}
        pageType={userType}
        style={{ marginTop: "-5px" }}
      />
    </div>
  );
};

export default PropertyCheckboxQuestions;
