import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer } from "../../../../../../react-components/src/hoc/FormComposer";
import { updateNDCForm } from "../../../redux/actions/NDCFormActions";

const PropertyDetailsStep2 = ({ config, onGoNext, t }) => {
  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateNDCForm(config.key, data));
    }
  };

  const currentStepData = useSelector(function (state) {
    return state.ndc.NDCForm.formData && state.ndc.NDCForm.formData[config.key] ? state.ndc.NDCForm.formData[config.key] : {};
  });

  const dispatch = useDispatch();

  // console.log("currentStepData in  Administrative details: ", currentStepData);

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
      />
    </React.Fragment>
  );
};

export default PropertyDetailsStep2;
