import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";

const TLNewFormStepThree = ({ config, onGoNext, onBackClick, t }) => {
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  function goNext(data) {

    const missingDocs = validateDocuments(currentStepData);

    if (missingDocs.length > 0) {
      setError(t(`Please upload the following documents: ${missingDocs.join(", ")}`));
      setShowToast(true);
      return;
    }

    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  function validateDocuments(data) {
    const requiredTypes = ["OWNERIDPROOF", "OWNERSHIPPROOF", "OWNERSELF"];
    const uploadedDocs = data?.documents?.documents || [];

    const uploadedTypes = uploadedDocs.map((doc) => doc?.documentType);
    const missingTypes = requiredTypes.filter((type) => !uploadedTypes.includes(type));

    return missingTypes;
  }

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_tlNewApplication(config.key, data));
    }
  };

  const currentStepData = useSelector(function (state) {
    return state.tl.tlNewApplicationForm.formData && state.tl.tlNewApplicationForm.formData[config.key]
      ? state.tl.tlNewApplicationForm.formData[config.key]
      : {};
  });
  const dispatch = useDispatch();

  useEffect(() => {
      if (showToast) {
        const timer = setTimeout(() => {
          closeToast();
        }, 3000); 
        return () => clearTimeout(timer);
      }
    }, [showToast]);


  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default TLNewFormStepThree;
