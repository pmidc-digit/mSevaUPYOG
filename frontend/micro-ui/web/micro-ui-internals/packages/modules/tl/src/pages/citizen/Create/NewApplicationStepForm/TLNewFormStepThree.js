import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/tlNewApplicationActions";


const TLNewFormStepThree = ({ config, onGoNext, onBackClick, t }) => {
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);

    if (!validateDocuments(currentStepData)) {
      setError(t("Please upload all mandatory documents."));
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

    const uploadedTypes = uploadedDocs.map(doc => doc?.documentType);

    console.log("Uploaded document types: ", uploadedTypes);

    const allRequiredPresent = requiredTypes.every(type => uploadedTypes.includes(type));

    return allRequiredPresent;
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data,"\n Bool: ",!_.isEqual(data, currentStepData));
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
      {showToast && (
        <Toast
          isDleteBtn={true}
          error={true}
          label={error}
          onClose={closeToast}
        />
      )}
    </React.Fragment>
  );
};

export default TLNewFormStepThree;