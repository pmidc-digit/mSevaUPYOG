import React from 'react'
import { DatePicker, Dropdown, CheckBox, TextArea, TextInput, CardLabelError } from "@mseva/digit-ui-react-components";
const QuestionsSection = ({t,QuestionOptions,setSurveyQuestionConfig,disableInputs,dropdownOptions,surveyQuestionConfig}) => {
  return (
     <div>
       <Dropdown
         t={t}
           option={QuestionOptions}
           select={(ev) => {
             setSurveyQuestionConfig((prevState) => ({ ...prevState, type: {title:ev.title,i18Key:ev.i18Key,value:ev.value} }));
           }}
           placeholder={"Select Question"}
           //selected={surveyQuestionConfig.type || {title: "Short Answer",value: "SHORT_ANSWER_TYPE"}}
           optionKey="title"
           disable={disableInputs}
           selected={""}
         />
          <Dropdown
           t={t}
             option={dropdownOptions}
             select={(ev) => {
               setSurveyQuestionConfig((prevState) => ({ ...prevState, Answertype: {title:ev.title,i18Key:ev.i18Key,value:ev.value} }));
             }}
             //placeholder={"Short Answer"}
             //selected={surveyQuestionConfig.type || {title: "Short Answer",value: "SHORT_ANSWER_TYPE"}}
             optionKey="i18Key"
             disable={disableInputs}
             selected={surveyQuestionConfig?.type}
           />
 
         {/* <div style={{width: "75%"}}>
           <TextInput
             placeholder={t("CS_COMMON_TYPE_QUESTION")}
             //value={t(Digit.Utils.locale.getTransformedLocale(surveyQuestionConfig.questionStatement))}
             value={surveyQuestionConfig.questionStatement}
             onChange={(ev) => {
               setSurveyQuestionConfig((prevState) => ({ ...prevState, questionStatement: ev.target.value }));
             }}
             textInputStyle={{width: "100%"}}
             name={`QUESTION_SURVEY_${index}`}
             disable={disableInputs}
             inputRef={register({
               required: t("ES_ERROR_REQUIRED"),
               maxLength: {
                 value: 100,
                 message: t("EXCEEDS_100_CHAR_LIMIT"),
               },
               pattern:{
                 value: /^[A-Za-z_-][A-Za-z0-9_\ -?]*$/,
                 message: t("ES_SURVEY_DONT_START_WITH_NUMBER")
               }
             })}
           />
           {formState?.errors && <CardLabelError>{formState?.errors?.[`QUESTION_SURVEY_${index}`]?.message}</CardLabelError>}
         </div> */}
         {/* <Dropdown
         t={t}
           option={dropdownOptions}
           select={(ev) => {
             setSurveyQuestionConfig((prevState) => ({ ...prevState, type: {title:ev.title,i18Key:ev.i18Key,value:ev.value} }));
           }}
           //placeholder={"Short Answer"}
           //selected={surveyQuestionConfig.type || {title: "Short Answer",value: "SHORT_ANSWER_TYPE"}}
           optionKey="i18Key"
           disable={disableInputs}
           selected={surveyQuestionConfig?.type}
         /> */}
       </div>
  )
}

export default QuestionsSection