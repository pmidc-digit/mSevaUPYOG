import { ActionBar, Card, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import SurveyDetailsForms from "./SurveyDetailsForms";
import QuestionFormsMaker from "./QuestionFormsMaker";
import SurveySettingsForms from "./SurveySettingsForm";

const CreateNewSurvey = ({ t, initialFormValues, onSubmit, isFormDisabled = false ,readOnly}) => {
  const {
    register: registerRef,
    control: controlSurveyForm,
    handleSubmit: handleSurveyFormSubmit,
    setValue: setSurveyFormValue,
    getValues: getSurveyFormValues,
    reset: resetSurveyForm,
    formState: surveyFormState,
    clearErrors: clearSurveyFormsErrors,
    ...methods
  } = useForm({
    defaultValues: initialFormValues,
  });
  console.log("surveyformValue",getSurveyFormValues, controlSurveyForm, surveyFormState)
  useEffect(() => {
    registerRef("questions");
  }, []);
  return (
    <div style={{margin:"8px"}}>
      <FormProvider {...{
        register: registerRef,
        control: controlSurveyForm,
        handleSubmit: handleSurveyFormSubmit,
        setValue: setSurveyFormValue,
        getValues: getSurveyFormValues,
        reset: resetSurveyForm,
        formState: surveyFormState,
        clearErrors: clearSurveyFormsErrors,
        ...methods
      }}>
        <form onSubmit={handleSurveyFormSubmit(onSubmit)} style={{marginRight:'10px'}}>
          {/* <Card> */}
            <SurveyDetailsForms
              t={t}
              registerRef={registerRef}
              controlSurveyForm={controlSurveyForm}
              surveyFormState={surveyFormState}
              surveyFormData={getSurveyFormValues}
              readOnly={readOnly}
            />
            {/* <QuestionFormsMaker t={t} setSurveyConfig={setSurveyFormValue} addOption={true} controlSurveyForm={controlSurveyForm} /> */}
            <SurveySettingsForms t={t} controlSurveyForm={controlSurveyForm} surveyFormState={surveyFormState} readOnly={readOnly}/>
          {/* </Card> */}

          {/* <ActionBar>
            <SubmitBar label={t("CS_CREATE_SURVEY")} submit="submit" />
          </ActionBar> */}
        </form>
      </FormProvider>
     </div>
  );
};

export default CreateNewSurvey;
