import React, { Fragment, useState } from "react";
import { Card, Header, ActionBar, SubmitBar, Toast } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
//
import SurveyFormsMaker from "../../../components/Surveys/SurveyForms/SurveyFormsMaker";

//Keep below values from localisation:
const SURVEY_QUESIONS = "Create Survey Question(s)";
const QUESTIONS_CREATED = "Survey question(s) created successfully";
const CREATE_QUESTIONS_BTN_LABEL = "Create Question(s)";
const ERR_MESSAGE = "Something went wrong";

const CreateSurveyQuestions = () => {
  const { t } = useTranslation();
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
    console.log("onSubmit create survey questions: \n", data);
    // const details = data.map((item) => {
    //   return {
    //     tenantId: tenantId,
    //     questionStatement: "How would you rate the customer service?",
    //     categoryId: "973cf232-9f8f-4cec-b05b-3ae9c2f086b9",
    //     type: "SHORT_ANSWER_TYPE",
    //   };
    // });
    // const details = [
    //   {
    //     tenantId: tenantId,
    //     questionStatement: "How would you rate the customer service?",
    //     categoryId: "973cf232-9f8f-4cec-b05b-3ae9c2f086b9",
    //     type: "SHORT_ANSWER_TYPE",
    //   },
    // ];

    const payload = { Questions: parsePayloadData(data) };
    console.log("Payload: ", payload);

    try {
      const response = await Digit.Surveys.createQuestions(payload);
      if (response?.Questions?.length > 0) {
        setShowToast({ isError: false, label: QUESTIONS_CREATED });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        //reset();
      } else {
        //setShowToast({ isError: true, label: response?.Errors?.[0]?.message || ERR_MESSAGE }); //Error message from the api response is not user friendly as it is containing the error stack trace. Hence commented this line.
        setShowToast({ isError: true, label: ERR_MESSAGE });
      }
    } catch (error) {
      console.log("Error in Digit.Surveys.createQuestions:", error?.response);
      //setShowToast({ isError: true, label: error?.response?.data?.Errors?.[0]?.message || ERR_MESSAGE }); //Error message from the api response is not user friendly as it is containing the error stack trace. Hence commented this line.
      setShowToast({ isError: true, label: ERR_MESSAGE });
    }
  }

  const closeToast = () => {
    setShowToast(null);
  };
  return (
    <Fragment>
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
            <SurveyFormsMaker t={t} setSurveyConfig={setValue} addOption={true} controlSurveyForm={controlSurveyForm} />
          </Card>
          <ActionBar>
            <SubmitBar label={t(CREATE_QUESTIONS_BTN_LABEL)} submit="submit" />
          </ActionBar>
        </form>
      </FormProvider>
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"true"} />}
    </Fragment>
  );
};

export default CreateSurveyQuestions;
