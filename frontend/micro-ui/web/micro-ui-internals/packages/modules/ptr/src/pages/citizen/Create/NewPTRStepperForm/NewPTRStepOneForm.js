import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTRNewApplication_FORM } from "../../../../redux/action/PTRNewApplicationActions";
import { useState } from "react";
import _ from "lodash"; 

const NewPTRStepOneForm = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector((state) => {
    return state.ptr.PTRNewApplicationFormReducer.formData && state.ptr.PTRNewApplicationFormReducer.formData[config.key]
      ? state.ptr.PTRNewApplicationFormReducer.formData[config.key]
      : {};
  });

  function validateStepData(data) {
    // Implement validation logic here
    return true; // Return true if valid, false otherwise
  }

  function handleNext() {
    if (validateStepData(currentStepData)) {
      dispatch(UPDATE_PTRNewApplication_FORM(config.key, currentStepData));
      onGoNext();
    } else {
      setError("Please fill all required fields.");
      setShowToast(true);
    }
  }

  return (
    <div>
      <FormComposer
        config={config}
        formData={currentStepData}
        onChange={(data) => dispatch(UPDATE_PTRNewApplication_FORM(config.key, data))}
        t={t}
      />
      {showToast && <Toast label={error} isDismisable={true} onClose={() => setShowToast(false)} />}
      <button onClick={onBackClick}>{t("COMMON_BACK")}</button>
      <button onClick={handleNext}>{t("COMMON_NEXT")}</button>
    </div>
  );
}