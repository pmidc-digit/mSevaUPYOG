import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../redux/actions/PTNewApplicationActions";

const PTEditFormStepFour = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in document detilas in step 4  ", data);
    if (!_.isEqual(data, localStepData)) {
      dispatch(UPDATE_PtNewApplication(config.key, data));
      setLocalStepData(data);
    }
  };

  const currentStepData = useSelector(function (state) {
    console.log("state in step four ", state);
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key]
      ? state.pt.PTNewApplicationForm.formData[config.key]
      : {};
  });

  const reduxStepData = useSelector((state) => state.pt.PTNewApplicationForm.formData.DocummentDetails);
  const [localStepData, setLocalStepData] = useState(reduxStepData);
  console.log("reduxStepData in step four: ", localStepData);
  const dispatch = useDispatch();

  // console.log("currentStepData in  Administrative details: ", currentStepData);

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={localStepData}
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

export default PTEditFormStepFour;
