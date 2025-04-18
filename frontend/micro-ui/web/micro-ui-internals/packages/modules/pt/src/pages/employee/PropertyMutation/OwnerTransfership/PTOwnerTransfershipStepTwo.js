import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTOwnerTransfershipStepTwo = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in Property details step one: ", data, "\n Bool: ", !_.isEqual(data, localStepData));
    if (!_.isEqual(data, localStepData)) {
      // dispatch(UPDATE_PtNewApplication(config.key, data));
      console.log("Dispatching UPDATE_PtNewApplication with key:", config.key, "and data:", data);
    }
  };

  const currentStepData = useSelector(function (state) {
    console.log("state in step two ", state);
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.DocuementDetails
      ? state.pt.PTNewApplicationForm.DocuementDetails
      : {};
  });
  const reduxStepData = useSelector((state) => state.pt.PTNewApplicationForm.formData.DocuementDetails);
  const formData = useSelector((state) => state.pt.PTNewApplicationForm.formData);
  console.log("Step one formdata +", formData);
  const [localStepData, setLocalStepData] = useState(reduxStepData);
  console.log("reduxStepData in step twoo: +", localStepData);
  const dispatch = useDispatch();

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

export default PTOwnerTransfershipStepTwo;
