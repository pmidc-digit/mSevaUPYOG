import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../react-components/src/hoc/FormComposer";
import { updateWSNewApplicationForm } from "../../redux/actions/newWSApplicationFormActions";

const Documents = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {

    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {

    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateWSNewApplicationForm(config.key, data));
    }
  };

  var currentStepData = useSelector(function (state) {
    return state.ws &&
      state.ws.newWSApplicationForm &&
      state.ws.newWSApplicationForm.formData &&
      state.ws.newWSApplicationForm.formData[config.key]
      ? state.ws.newWSApplicationForm.formData[config.key]
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
    </React.Fragment>
  );
};

export default Documents;
