// RenewFormStepThree.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import _ from "lodash";

export const RenewTLFormStepThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData[config.key] || {});
  const reduxStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData.Documents);
  const [localStepData, setLocalStepData] = useState(reduxStepData);

  function validateDocuments(data) {
    const requiredTypes = ["OWNERIDPROOF", "OWNERSHIPPROOF", "OWNERSELF"];
    const uploadedDocs = data?.documents?.documents || [];

    const uploadedTypes = uploadedDocs.map((doc) => doc?.documentType);
    const missingTypes = requiredTypes.filter((type) => !uploadedTypes.includes(type));

    return missingTypes;
  }

  const goNext = () => {
    console.log("localStepData in step 3: formData:", localStepData);

    const missingDocs = validateDocuments(localStepData);

    if (missingDocs.length > 0) {
      setError(t(`Please upload the following documents: ${missingDocs.join(", ")}`));
      setShowToast(true);
      return;
    }
    onGoNext();
  };
  useEffect(() => {
        if (showToast) {
          const timer = setTimeout(() => {
            closeToast();
          }, 3000); 
          return () => clearTimeout(timer);
        }
      }, [showToast]);
  const onGoBack = () => {
    onBackClick(config.key, localStepData);
  };

  const onFormValueChange = (setValue, data) => {
    if (!_.isEqual(data, localStepData)) {
      dispatch(UPDATE_tlNewApplication(config.key, data));
      setLocalStepData(data);
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={localStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(config.texts.submitBarLabel)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast isDleteBtn={true}  error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};
