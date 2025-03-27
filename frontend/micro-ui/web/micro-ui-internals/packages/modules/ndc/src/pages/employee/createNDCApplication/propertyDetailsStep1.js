import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer } from "../../../../../../react-components/src/hoc/FormComposer";
import { updateNDCForm } from "../../../redux/actions/NDCFormActions";
import PropertyDetailsForm from "./propertyDetailsForm";

const PropertyDetailsStep1 = ({ config, onGoNext, t }) => {
  const dispatch = useDispatch();

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateNDCForm(config.key, data));
    }
  };

  const currentStepData = useSelector(function (state) {
    return state.ndc.NDCForm.formData && state.ndc.NDCForm.formData[config.key] ? state.ndc.NDCForm.formData[config.key] : {};
  });

  return (
    <React.Fragment>
      <PropertyDetailsForm onGoNext={onGoNext} />
      {/* <FormComposer
        defaultValues={currentStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        setFormSubmitRef={setFormSubmitRef}
      /> */}
    </React.Fragment>
  );
};

export default PropertyDetailsStep1;
