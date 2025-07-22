import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTOwnerTransfershipStepOne = ({ config, onGoNext, onBackClick, t }) => {
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
      dispatch(UPDATE_PtNewApplication(config.key, data));
      setLocalStepData(data);
      console.log("Dispatching UPDATE_PtNewApplication with key:", config.key, "and data:", data);
    }
  };

  // const onFormValueChange = (setValue = true, data) => {
  //   console.log("onFormValueChange data in Property details step one: +", data, "\n Bool: ", !_.isEqual(data, localStepData));

  //   // Check if data is not empty or only partial fields have changed
  //   const isDataValid = data?.owners?.length && data.owners[0].name !== "" && data.owners[0].mobileNumber !== "";

  //   // Only dispatch if the data is valid and changed
  //   if (isDataValid && !_.isEqual(data, localStepData)) {
  //     dispatch(UPDATE_PtNewApplication(config.key, data));
  //     setLocalStepData(data);
  //     console.log("Dispatching UPDATE_PtNewApplication with key: +", config.key, "and data:", data);
  //   } else {
  //     console.log("Skipping dispatch as data is either unchanged or invalid.+");
  //   }
  // };

  const currentStepData = useSelector(function (state) {
    console.log("state in step one ", state);
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData.TransferorDetails
      ? state.pt.PTNewApplicationForm.formData.TransferorDetails
      : {};
  });
  const reduxStepData = useSelector((state) => state.pt.PTNewApplicationForm.formData.TransferorDetails);
  const formData = useSelector((state) => state.pt.PTNewApplicationForm.formData);
  console.log("Step one formdata +", formData);
  const [localStepData, setLocalStepData] = useState(reduxStepData);
  console.log("reduxStepData in step one: +", localStepData);
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

export default PTOwnerTransfershipStepOne;
