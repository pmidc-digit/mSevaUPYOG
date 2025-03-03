import React, { useState } from "react";
import { Card, Header, ActionBar, SubmitBar, Toast, Loader } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
//
import SurveyFormsMaker from "../../../components/Surveys/SurveyForms/SurveyFormsMaker";

//Keep below values from localisation:
const SURVEY_QUESIONS = "Create Questions";
const QUESTIONS_CREATED = "Questions created successfully";
const CREATE_QUESTIONS_BTN_LABEL = "Create Questions";
const ERR_MESSAGE = "Something went wrong";

const CreateSurveyQuestions = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);
  const { register: registerRef, control: controlSurveyForm, handleSubmit, setValue, getValues, reset, formState, clearErrors, ...methods } = useForm(
    {
      defaultValues: { questions: {} },
    }
  );

  function parsePayloadData(data) {
    const payload = [];
    let index = 0;

    while (data[`QUESTION_SURVEY_${index}`] !== undefined) {
      payload.push({
        tenantId: tenantId,
        questionStatement: data[`QUESTION_SURVEY_${index}`],
        categoryId: data[`CATEGORY_SURVEY_${index}`].value,
        type: data[`ANSWER_TYPE_SURVEY_${index}`].value,
        required: data[`REQUIRED_QUESTION_${index}`],
        options: data[`OPTIONS_${index}`],
      });
      index++;
    }

    return payload;
  }

  async function onSubmit(data) {
    setIsLoading(true);
    const payload = { Questions: parsePayloadData(data) };
    console.log("onSubmit create survey questions: \n", data);
    console.log("Payload: ", payload);
    //return;
    try {
      const response = await Digit.Surveys.createQuestions(payload);
      if (response?.Questions?.length > 0) {
        setIsLoading(false);
        setShowToast({ isError: false, label: QUESTIONS_CREATED });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        //reset();
      } else {
        setIsLoading(false);
        //setShowToast({ isError: true, label: response?.Errors?.[0]?.message || ERR_MESSAGE }); //Error message from the api response is not user friendly as it is containing the error stack trace. Hence commented this line.
        setShowToast({ isError: true, label: ERR_MESSAGE });
      }
    } catch (error) {
      console.log("Error in Digit.Surveys.createQuestions:", error?.response);
      setIsLoading(false);
      //setShowToast({ isError: true, label: error?.response?.data?.Errors?.[0]?.message || ERR_MESSAGE }); //Error message from the api response is not user friendly as it is containing the error stack trace. Hence commented this line.
      setShowToast({ isError: true, label: ERR_MESSAGE });
    }
  }

  const closeToast = () => {
    setShowToast(null);
  };
  return (
    <div className="pageCard">
      <Header>{t(SURVEY_QUESIONS)}</Header>
      <FormProvider
        {...{
          register: registerRef,
          handleSubmit,
          setValue,
          getValues,
          reset,
          formState,
          clearErrors,
          ...methods,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <SurveyFormsMaker t={t} setSurveyConfig={setValue} addOption={true} controlSurveyForm={controlSurveyForm} formState={formState} />
          </Card>
          <ActionBar>
            <SubmitBar label={t(CREATE_QUESTIONS_BTN_LABEL)} submit="submit" />
          </ActionBar>
        </form>
      </FormProvider>
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
      {isLoading && <Loader />}
    </div>
  );
};

export default CreateSurveyQuestions;
