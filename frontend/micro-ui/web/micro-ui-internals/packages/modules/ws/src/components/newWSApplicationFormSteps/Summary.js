import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../react-components/src/hoc/FormComposer";
import { updateWSNewApplicationForm } from "../../redux/actions/newWSApplicationFormActions";
import { newConfig as fullConfig } from "../../config/wsCreateConfig";

const Summary = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in Summary: ", data,"\n Bool: ",!_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateWSNewApplicationForm(config.key, data));
    }
  };

  const currentStepData = useSelector((state) => state.ws.newWSApplicationForm.formData?.[config.key] ?? {});
  const dispatch = useDispatch();

  console.log("currentStepData in Summary: ", currentStepData);

  const updatedFullConfig=fullConfig.find((conf) => conf.hideInCitizen && conf.isCreate)?.body;

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        //heading={t("")}
        config={updatedFullConfig}
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

export default Summary;
