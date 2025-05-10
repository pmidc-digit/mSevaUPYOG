import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTOwnerTransfershipStepTwo = ({ config, onGoNext, onBackClick, t }) => {
  const isFirstRender = useRef(true);
  function goNext(data) {
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!_.isEqual(data, localStepData)) {
       dispatch(UPDATE_PtNewApplication(config.key, data));
      }
  };

  const currentStepData = useSelector(function (state) {
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.DocuementDetails
      ? state.pt.PTNewApplicationForm.DocuementDetails
      : {};
  });
  const reduxStepData = useSelector((state) => state.pt.PTNewApplicationForm.formData.DocuementDetails);
  const formData = useSelector((state) => state.pt.PTNewApplicationForm.formData);
  const [localStepData, setLocalStepData] = useState(reduxStepData);
  
  useEffect(() => {
    setLocalStepData(reduxStepData);
  }, [reduxStepData]);
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
