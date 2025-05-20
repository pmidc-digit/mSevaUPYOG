import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTNewFormStepTwo = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in Propety setils in step 2", data,"\n Bool: ",!_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PtNewApplication(config.key, data));
    }
  };

  const currentStepData = useSelector(function (state) {
    console.log("state in step two ", state);
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key] 
        ? state.pt.PTNewApplicationForm.formData[config.key] 
        : {};
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
        onBackClick={onGoBack}
      />
    </React.Fragment>
  );
};

export default PTNewFormStepTwo;
