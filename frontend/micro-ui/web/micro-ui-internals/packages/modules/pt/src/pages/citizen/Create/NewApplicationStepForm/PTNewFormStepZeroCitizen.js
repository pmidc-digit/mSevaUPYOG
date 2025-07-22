import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "@mseva/digit-ui-react-components";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTNewFormStepZeroCitizen = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    // if(data.documents.documents?.length!== data.documents.propertyTaxDocumentsLength){
    //   alert("Upload all the documents");
    // }
    // else{
    onGoNext();
    //}
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in document detilas in step 0  ",formData,"\n Bool: ",!_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PtNewApplication(config.key, data));
    }
  };

  const formData = useSelector(function (state) {
    return state.pt.PTNewApplicationForm.formData 
  });

  const currentStepData = useSelector(function (state) {
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

export {PTNewFormStepZeroCitizen};