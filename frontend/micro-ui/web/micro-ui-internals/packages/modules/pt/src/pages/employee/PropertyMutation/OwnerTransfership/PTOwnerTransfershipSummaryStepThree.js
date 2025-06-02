import React, { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTOwnerTransfershipSummaryStepThree = ({ config, onGoNext, onBackClick, t }) => {
  const formData = useSelector((state) => state.pt.PTNewApplicationForm.formData || {});
  console.log("form data in summary", formData);
  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  // const onFormValueChange = (setValue = true, data) => {
  //   console.log("onFormValueChange data in Property details step three: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
  //   if (!_.isEqual(data, currentStepData)) {
  //     dispatch(UPDATE_PtNewApplication(config.key, data));
  //     console.log("Dispatching UPDATE_PtNewApplication with key:", config.key, "and data:", data);
  //   }
  // };

  // const currentStepData = useSelector(function (state) {
  //   console.log("state in step three ", state);
  //   return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key]
  //     ? state.pt.PTNewApplicationForm.formData[config.key]
  //     : {};
  // });

  const dispatch = useDispatch();

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={formData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        // onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
    </React.Fragment>
  );
};

export default PTOwnerTransfershipSummaryStepThree;
