import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTNewFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();

  function goNext(data) {
    console.log(`Data== in step ${config.currStepNumber} is=======`, data);
    let f = 0;
    config.currStepConfig[0].body.map((item) => {
      // if(item.isMandatory && (data[item.key]===''||data[item.key]===undefined)){
      //   f=1;
      //   return
      // }
    });
    if (f === 0) {
      onGoNext();
    }
  }

  console.log("Config in step 1", config);

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const currentStepData = useSelector(function (state) {
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key]
      ? state.pt.PTNewApplicationForm.formData[config.key]
      : {};
  });

  const onFormValueChange = (setValue = true, data) => {
    console.log("data step 1 ==========", data);
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PtNewApplication(config.key, data));
    }
  };

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

export { PTNewFormStepOne };
