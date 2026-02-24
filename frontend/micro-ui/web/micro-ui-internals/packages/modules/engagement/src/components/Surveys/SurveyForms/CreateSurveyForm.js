import React, { useEffect, useReducer,Fragment } from "react";
import SurveyForm from "./SurveyForm";
import Section from "./Section";
import { FormProvider, useForm } from "react-hook-form";

const CreateSurveyForm = ({ disableInputs, isPartiallyEnabled, formDisabled}) => {

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
      sections:[]
       
      }
  });
  const stylesForForm = {
    marginLeft:'-20px',
  }
  const defaultFormsConfig = {
  sections: [
    {
      id: 1,
      weightage: 20,
      categories: [
        {
          id: 1,
          weightage: '',
          questions: [
            {
              id: 1,
              type: '',
              answer: ''
            }

          ]
        }
  ]
}
]
};
console.log("setSurveyConfig",setSurveyFormValue)
console.log("disable Inputs",disableInputs)
console.log("partially enabled",isPartiallyEnabled)
console.log("forms disable",formDisabled)
const initialSurveyFormState = [defaultFormsConfig];

// const surveyFormReducer = (state, { type, payload }) => {
//   switch (type) {
//     case "addNewForm":
//       const newSurveyQues = [...state, defaultFormsConfig];
//       payload.setSurveyConfig("questions", newSurveyQues);
//       return newSurveyQues;
//     case "updateForm":
//       const updatedSurveyQues = [...state];
//       updatedSurveyQues.splice(payload.index, 1, payload);
//       payload.setSurveyConfig("questions", updatedSurveyQues);
//       return updatedSurveyQues;
//     case "removeForm":
//       if (state.length === 1) return state;
//       const copyOfSate = [...state];
//       copyOfSate.splice(payload.index, 1);
//       payload.setSurveyConfig("questions", copyOfSate);
//       return copyOfSate;
//   }
// };
  const surveyFormReducer = (state, { type, payload }) => {
    console.log("type im reducer",type)
    switch (type) {
      case "ADD_SECTION":
       const temp={...state,sections:[ state.sections,  
             { id: 2, 
              categories: [{
              id: 1,
              weightage: '',
              questions: [
                {
                  id: 1,
                  type: '',
                  answer: ''
                }
    
              ]
            }], weightage: 0 
          }]}
      //   payload.setSurveyFormValue("sections",temp)
    //    return { ...state, sections:[ state.sections,  
    //      { id: 2, 
    //       categories: [{
    //       id: 1,
    //       weightage: '',
    //       questions: [
    //         {
    //           id: 1,
    //           type: '',
    //           answer: ''
    //         }

    //       ]
    //     }], weightage: 0 
    //   }]
    // };

     return temp;
      
        //  ...state,
        //   sections: [...state.sections, { id: 2, categories: [{
        //     id: 1,
        //     weightage: '',
        //     questions: [
        //       {
        //         id: 1,
        //         type: '',
        //         answer: ''
        //       }

        //     ]
        //   }], weightage: 0 }]
       
        
      case "ADD_CATEGORY":
        return {
          ...state,
          sections: state.sections.map(section =>
            section.id === action.sectionId
              ? { ...section, categories: [...section.categories, {
                id: 1,
                weightage: '',
                questions: [
                  {
                    id: 1,
                    type: '',
                    answer: ''
                  }
      
                ]
              }] }
              : section
          )
        };
      case "ADD_QUESTION":
        return {
          ...state,
          sections: state.sections.map(section =>
            section.id === action.sectionId
              ? {
                  ...section,
                  categories: section.categories.map(category =>
                    category.id === action.categoryId
                      ? { ...category, questions: [...category.questions, { id: Date.now(), type: '', answer: '' }] }
                      : category
                  )
                }
              : section
          )
        };
      case "UPDATE_SECTION_WEIGHTAGE":
        return {
          ...state,
          sections: state.sections.map(section =>
            section.id === action.sectionId ? { ...section, weightage: action.weightage } : section
          )
        };
      case "UPDATE_CATEGORY_WEIGHTAGE":
        return {
          ...state,
          sections: state.sections.map(section =>
            section.id === action.sectionId
              ? {
                  ...section,
                  categories: section.categories.map(category =>
                    category.id === action.categoryId ? { ...category, weightage: action.weightage } : category
                  )
                }
              : section
          )
        };
      default:
        return state;
    }
  }
  const [surveyState, dispatch] = useReducer(surveyFormReducer, defaultFormsConfig);

  const passingSurveyConfigInDispatch = ({ type, payload }) => {
   console.log("type",type)
    dispatch({ type, payload: { ...payload, setSurveyFormValue } });
  };

  const renderPreviewForms = () => {
    console.log("render",surveyState)
    return surveyState.sections.length
      ? surveyState.sections.map((section,index) => {
        console.log("section",section)
        console.log("index",index)
        return(
        // <NewSurveyForm key={index}
        // {...(config.formConfig ? config?.formConfig : config)}
        // //  type={config?.formConfig?.type} 
        //  addOption={addOption} t={t} index={index} disableInputs={disableInputs} dispatch={passingSurveyConfigInDispatch} isPartiallyEnabled={isPartiallyEnabled} formDisabled={formDisabled} controlSurveyForm={controlSurveyForm} />
        // )})
        <Section key={index} section={section}/>
        )})
      : null;
  };
  const handleAddSection = () => {
    passingSurveyConfigInDispatch(({type:'ADD_SECTION'}));
  };
  return (
    // <div className="surveyformslist_wrapper">
    //   <div className="heading">{t("CS_SURVEYS_QUESTIONS")}</div>
    //   {renderPreviewForms()}
    //   <div className="pointer">
    //     {surveyState.length < 30  && <button 
    //       // disabled={surveyState.length >= 30 ? "true":""}
    //       className={`unstyled-button link ${disableInputs ? "disabled-btn" : ""} ${surveyState.length >= 30 ? "disabled-btn":""} `}
    //       type="button"
    //       onClick={() => passingSurveyConfigInDispatch({ type: "addNewForm" })}
    //       disabled={surveyState.length >= 30?true:false}
    //     >
    //       {t("CS_COMMON_ADD_QUESTION")}
    //     </button>}
    //   </div>
    // </div>
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
    <div>
      <h1>Survey Creation</h1>
      <button onClick={handleAddSection}>Add Section</button>
      {/* {sections.sections.map(section => (
        <Section key={section.id} section={section} />
      ))} */}
      {renderPreviewForms()}
    </div>
    </FormProvider>
    </div>
    </div>
    </Fragment>
  );
};

export default CreateSurveyForm;
