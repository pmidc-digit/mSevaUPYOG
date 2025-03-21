import React, { useEffect, useState } from "react";
import { Card, Header, ActionBar, SubmitBar, Toast, Loader } from "@mseva/digit-ui-react-components";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
//
import QuestionFormsMaker from "../../../components/Surveys/SurveyForms/QuestionFormsMaker";
import { useHistory } from "react-router-dom";

//Keep below values from localisation:
const SURVEY_QUESIONS = "Create Questions";
const QUESTIONS_CREATED = "Questions created successfully";
const CREATE_QUESTIONS_BTN_LABEL = "Create Questions";
const ERR_MESSAGE = "Something went wrong";

const CreateSurveyQuestions = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);

  const generateUUID = () => {
    return Date.now() + Math.random().toString(36).substring(2, 11);
  };

  const defaultQuestionValues = () => {
    //console.log("defaultQuestionValues called");
    return {
      category: null,
      questionStatement: "",
      type: { title: t("MULTIPLE_ANSWER_TYPE"), i18Key: "MULTIPLE_ANSWER_TYPE", value: "MULTIPLE_ANSWER_TYPE" },
      options: [{ id: Date.now(), title: `${t("CMN_OPTION")} 1` }],
      required: false,
      uuid: generateUUID(),
      qorder: null,
    };
  };

  const {
    register: registerRef,
    control: controlSurveyForm,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState,
    clearErrors,
    watch,
    ...methods
  } = useForm({
    defaultValues: { questions: [defaultQuestionValues()] },
  });

  function parsePayloadData(data) {
    const payload = data.questions.map((item) => {
      return {
        tenantId: tenantId,
        categoryId: item.category.value,
        questionStatement: item.questionStatement.trim(),
        type: item.type.value,
        required: item.required,
        options: item.options.map((option) => {
          return option.title.trim();
        }),
      };
    });
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
          //window.location.reload();
          history.push("/digit-ui/employee/engagement/surveys/search-questions");
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

  //Watch all form values
  // const formValues = watch();

  // useEffect(() => {
  //   console.log("Form values:", formValues);
  // }, [formValues]);

  // useEffect(() => {
  //   // Access the default values
  //   const defaultValues = getValues();
  //   console.log("1) Default Values:", defaultValues);
  // }, [getValues]);

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
            <QuestionFormsMaker
              t={t}
              setSurveyConfig={setValue}
              addOption={true}
              controlSurveyForm={controlSurveyForm}
              formState={formState}
              defaultQuestionValuesFromFile1={defaultQuestionValues}
            />
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
