import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
//
import { FormComposer } from "../../../../../react-components/src/hoc/FormComposer";
import { updateSurveyForm } from "../../redux/actions/surveyFormActions";
import { CardHeader } from "@mseva/digit-ui-react-components";

const SurveyFormPage = ({ config, onGoNext, t }) => {
  const [canSubmit, setSubmitValve] = useState(false);
  function goNext(data) {
    //console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("Form Data: ", data);
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateSurveyForm(config.key, data));
     
    }
  };

  var currentStepData = useSelector(function (state) {
    return state.engagement &&
           state.engagement.surveyForm &&
           state.engagement.surveyForm.formData &&
           state.engagement.surveyForm.formData[config.key] !== undefined
        ? state.engagement.surveyForm.formData[config.key] 
        : {};
});

  const dispatch = useDispatch();
  console.log("currentStepData in EmployeeDetails: ", currentStepData);


  const [showToast, setShowToast] = useState(null);


  return (
    <React.Fragment>
      <CardHeader divider={true}>{t("Manasa")}</CardHeader>
      <FormComposer
        defaultValues={currentStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
      />
      {showToast && (
        <Toast
          error={showToast.key} 
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDleteBtn={"true"}
        />
      )} 
    </React.Fragment>
  );
};

export default SurveyFormPage;
