import React, { useEffect, useReducer ,Fragment} from "react";
import NewSurveyForm from "./NewSurveyForm";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import SurveyForm from "./SurveyForm";
const CreateSurveyForm = ({ disableInputs, isPartiallyEnabled, formDisabled}) => {
    const addOption=true;
    const { t } = useTranslation();
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
        defaultValues: {
            fromDate: "",
            fromTime: "",
            toDate: "",
            toTime: "",
            questions: {},
            // tenantIds:[]
           
          }
      });

//     const defaultFormsConfig = {
//   question: "",
//   answerType: "Short Answer",
//   required: false,
//   options: [],
//   uuid : "",
//   qorder : null,
// };

const defaultFormsConfig = {
    question: "",
    answerType: "Short Answer",
    required: false,
    options: [],
    uuid : "",
    qorder : null,
    Questype:{value:'',index:0}
  };

const initialSurveyFormState = [defaultFormsConfig];
const stylesForForm = {
    marginLeft:'-20px',
  }
const surveyFormReducer = (state, { type, payload }) => {
  switch (type) {
   
    case "addNewForm":
      const newSurveyQues = [...state, defaultFormsConfig];
      payload.setSurveyFormValue("questions", newSurveyQues);
      return newSurveyQues;
    case "updateForm":
      const updatedSurveyQues = [...state];
      updatedSurveyQues.splice(payload.index, 1, payload);
      payload.setSurveyFormValue("questions", updatedSurveyQues);
      return updatedSurveyQues;
    case "removeForm":
      if (state.length === 1) return state;
      const copyOfSate = [...state];
      copyOfSate.splice(payload.index, 1);
      payload.setSurveyFormValue("questions", copyOfSate);
      return copyOfSate;
  }
};

  const [surveyState, dispatch] = useReducer(surveyFormReducer, initialSurveyFormState);
 console.log("survey state",surveyState)
 console.log("dispatch",dispatch)
  const passingSurveyConfigInDispatch = ({ type, payload }) => {
    dispatch({ type, 
      payload: { ...payload, setSurveyFormValue } });
  };

  const renderPreviewForms = () => {
    return surveyState.length
      ? surveyState.map((config, index) => {
        return(
        <SurveyForm key={index}
        {...(config.formConfig ? config?.formConfig : config)}
        //  type={config?.formConfig?.type} 
         addOption={addOption} t={t} index={index} disableInputs={disableInputs} dispatch={passingSurveyConfigInDispatch} isPartiallyEnabled={isPartiallyEnabled} formDisabled={formDisabled} controlSurveyForm={controlSurveyForm} />
        )})
      : null;
  };

  return (
    <Fragment>
        <div style={stylesForForm}>
        <div style={{margin:"8px"}}>
      <FormProvider {...{
        register: registerRef,
        control: controlSurveyForm,
      //  handleSubmit: handleSurveyFormSubmit,
        setValue: setSurveyFormValue,
        getValues: getSurveyFormValues,
        reset: resetSurveyForm,
        formState: surveyFormState,
        clearErrors: clearSurveyFormsErrors,
        ...methods
      }}>
    <div className="surveyformslist_wrapper">
      <div className="heading">{t("CS_SURVEYS_QUESTIONS")}</div>
      {renderPreviewForms()}
      <div className="pointer">
        {surveyState.length < 30  && <button 
          // disabled={surveyState.length >= 30 ? "true":""}
          className={`unstyled-button link ${disableInputs ? "disabled-btn" : ""} ${surveyState.length >= 30 ? "disabled-btn":""} `}
          type="button"
          onClick={() => passingSurveyConfigInDispatch({ type: "addNewForm" })}
          disabled={surveyState.length >= 30?true:false}
        >
          {t("Add Category")}
        </button>}
      </div>
    </div>
    </FormProvider>
    </div>
    </div>
    </Fragment>
  );
};

export default CreateSurveyForm;
