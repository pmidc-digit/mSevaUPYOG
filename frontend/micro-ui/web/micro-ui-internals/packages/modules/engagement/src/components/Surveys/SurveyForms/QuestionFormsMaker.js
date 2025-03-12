import React, { useReducer } from "react";
import QuestionForm from "./QuestionForm";

const QuestionFormsMaker = ({ t, formsConfig, setSurveyConfig, disableInputs, isPartiallyEnabled, addOption, formDisabled, controlSurveyForm, formState, defaultQuestionValues }) => {
  const initialSurveyFormState = [defaultQuestionValues];

  const surveyFormReducer = (state, { type, payload }) => {
    console.log("Form state:", state, "\n Type: ", type, "\n Payload: ",payload);
    switch (type) {
      case "addNewForm":
        const newSurveyQues = [...state, defaultQuestionValues];
        payload.setSurveyConfig("questions", newSurveyQues);
        return newSurveyQues;
      case "updateForm":
        const updatedSurveyQues = [...state];
        updatedSurveyQues.splice(payload.index, 1, payload);
        payload.setSurveyConfig("questions", updatedSurveyQues);
        return updatedSurveyQues;
      case "removeForm":
        if (state.length === 1) return state;
        const copyOfState = [...state];
        copyOfState.splice(payload.index, 1);
        payload.setSurveyConfig("questions", copyOfState);
        return copyOfState;
    }
  };

  const [surveyState, dispatch] = useReducer(surveyFormReducer, formsConfig ? formsConfig : initialSurveyFormState);

  const passingSurveyConfigInDispatch = ({ type, payload }) => {
    dispatch({ type, payload: { ...payload, setSurveyConfig } });
  };

  console.log("Form State 2:", formState);
  const renderPreviewForms = () => {
    return surveyState.length
      ? surveyState.map((config, index) => {
          return (
            <QuestionForm
              key={index}
              {...(config.formConfig ? config?.formConfig : config)}
              addOption={addOption}
              t={t}
              index={index}
              disableInputs={disableInputs}
              dispatch={passingSurveyConfigInDispatch}
              isPartiallyEnabled={isPartiallyEnabled}
              formDisabled={formDisabled}
              controlSurveyForm={controlSurveyForm}
              mainFormState={formState}
              noOfQuestions={surveyState?.length} 
              defaultQuestionValues={defaultQuestionValues}
            />
          );
        })
      : null;
  };

  return (
    <div className="surveyformslist_wrapper">
      {/* <div className="heading">{t("CS_SURVEYS_QUESTIONS")}</div> */}
      {renderPreviewForms()}
      <div className="pointer">
        {surveyState.length < 100 && (
          <button
            className={`unstyled-button link ${disableInputs ? "disabled-btn" : ""} ${surveyState.length >= 100 ? "disabled-btn" : ""} `}
            type="button"
            onClick={() => passingSurveyConfigInDispatch({ type: "addNewForm" })}
            disabled={surveyState.length >= 100 ? true : false}
          >
            {t("CS_COMMON_ADD_QUESTION")}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionFormsMaker;
