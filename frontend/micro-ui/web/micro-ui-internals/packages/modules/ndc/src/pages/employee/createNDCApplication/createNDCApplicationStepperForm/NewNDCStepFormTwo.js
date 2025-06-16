import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "@mseva/digit-ui-react-components";
import { updateNDCForm } from "../../../../redux/actions/NDCFormActions";

const NewNDCStepFormTwo = ({ config, onGoNext, onBackClick, t }) => {
  const currentStepData = useSelector((state) => state.ndc.NDCForm.formData && state.ndc.NDCForm.formData[config.key] 
        ? state.ndc.NDCForm.formData[config.key] : {});
  const dispatch = useDispatch();
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
    // console.log("onFormValueChange data in document detilas in step 4  ", data,"\n Bool: ",!_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateNDCForm(config.key, data));
    }
  };

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

export {NewNDCStepFormTwo};