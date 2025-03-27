import React, { useEffect,useMemo } from "react";
import { CardLabelError, TextInput, RadioButtons, CardSectionHeader } from "@mseva/digit-ui-react-components";
import { Controller, useFormContext } from "react-hook-form";
import { fieldChange} from '../../../redux/actions/surveyFormActions';
import { useSelector, useDispatch } from 'react-redux';

 const ConvertEpochToDate = (dateEpoch) => {
  if (dateEpoch == null || dateEpoch == undefined || dateEpoch == "") {
    return "NA";
  }
  const dateFromApi = new Date(dateEpoch);
  let month = dateFromApi.getMonth() + 1;
  let day = dateFromApi.getDate();
  let year = dateFromApi.getFullYear();
  month = (month > 9 ? "" : "0") + month;
  day = (day > 9 ? "" : "0") + day;
  return `${year}-${month}-${day}`;
};

const SurveySettingsForms = ({ t, controlSurveyForm, surveyFormState, disableInputs, enableEndDateTimeOnly,readOnly }) => {
  
  const formErrors = surveyFormState?.errors;
    const dispatch = useDispatch();
  const { getValues } = useFormContext()
  const currentTs = new Date().getTime()
  const surveyDetails = useSelector(state => state.engagement.surveyForm.surveyDetails[0]);
  const isValidFromDate = (enteredValue) => {
    
    const enteredTs = new Date(enteredValue).getTime()
    const toDate = getValues("toDate") ? new Date(getValues("toDate")).getTime() : new Date().getTime()
    // return ( toDate > enteredTs && enteredTs >= currentTs ) ? true : false 
    //same day check
    if (enteredValue === getValues("toDate") && enteredValue >= ConvertEpochToDate(currentTs)) return true
    return (toDate >= enteredTs && enteredValue >= ConvertEpochToDate(currentTs) ) ? true : false 
    
  };
  const isValidToDate = (enteredValue) => {
    const enteredTs = new Date(enteredValue).getTime()
    const fromDate = getValues("fromDate") ? new Date(getValues("fromDate")).getTime() : new Date().getTime()
    //return ( enteredTs >= fromDate && enteredTs >= currentTs ) ? true : false 
    return (enteredTs >= fromDate ) ? true : false
  };
  const isValidFromTime = () => true;
  const isValidToTime = () => true;
       const handleFieldChange = (e) => {
         const { name, value } = e.target;
         dispatch(fieldChange(surveyDetails.id, { [name]: value }));
       };
  return (
    // <div className="surveydetailsform-wrapper">
    <div
    //className="surveydetailsform-wrapper"
     className="create-survey-card"
    >
      {/* <div 
      style={{fontSize:'22px', lineHeight:'24px',color:'black',fontWeight:'500',fontFamily:'Noto Sans,sans-serif'}}
      //className="heading"
      >
        {"Survey Publish Period"}</div> */}
        <div>
        <CardSectionHeader>
            {t("Survey Publish Period")}
          </CardSectionHeader>
          <div style={{
 border:'1px solid #DFE0E2',
 marginBottom:'20px',
          }}></div>
          </div>
      
      <div className="survey-row">
   
    <div className="survey-column">
        <label>{t("LABEL_SURVEY_START_DATE")} <span style={{color:"red"}}>*</span></label>
        <Controller
          control={controlSurveyForm}
          name="fromDate"
          // defaultValue={surveyFormState?.fromDate}
          defaultValue={surveyDetails.fromDate}
          onChange={handleFieldChange}
          rules={{ required: true, validate: !enableEndDateTimeOnly? { isValidFromDate }:null }}
          render={({ onChange, value }) => <TextInput name="fromDate" type="date" onChange={handleFieldChange} defaultValue={surveyDetails.fromDate} 
          // disable={disableInputs}
          disable={readOnly||false}
          />}
        />
     
        {formErrors && formErrors?.fromDate && formErrors?.fromDate?.type === "required" && (
          <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_REQUIRED`)}</CardLabelError>
        )}
        {formErrors && formErrors?.fromDate && formErrors?.fromDate?.type === "isValidFromDate" && (
          <CardLabelError>{t(`EVENTS_FROM_DATE_ERROR_INVALID`)}</CardLabelError>
        )}
      </div>

      {/* <span className="surveyformfield"> */}
      <div className="survey-column">
        <label>{t("LABEL_SURVEY_START_TIME")} <span style={{color:"red"}}>*</span></label>
        <Controller
          control={controlSurveyForm}
          name="fromTime"
          defaultValue={surveyDetails.fromTime}
          rules={{ required: true, validate: { isValidFromTime } }}
          render={({ onChange, value }) => <TextInput name="fromTime" type="time" onChange={handleFieldChange} defaultValue={surveyDetails.fromTime} 
          // disable={disableInputs}
          disable={readOnly||false}
           />}
        />
        {formErrors && formErrors?.fromTime && formErrors?.fromTime?.type === "required" && (
          <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_REQUIRED`)}</CardLabelError>
        )}
        {formErrors && formErrors?.fromTime && formErrors?.fromTime?.type === "isValidFromDate" && (
          <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_INVALID`)}</CardLabelError>
        )}
      </div>
      </div>

      <div className="survey-row">
   
    <div className="survey-column">
        <label>{t("LABEL_SURVEY_END_DATE")} <span style={{color:"red"}}>*</span></label>
        <Controller
          control={controlSurveyForm}
          name="toDate"
          defaultValue={surveyDetails.toDate}
          rules={{ required: true, validate: { isValidToDate } }}
          render={({ onChange, value }) => <TextInput name="toDate" type="date" onChange={handleFieldChange} defaultValue={surveyDetails.toDate} 
          //disable={enableEndDateTimeOnly ? !enableEndDateTimeOnly : disableInputs}
          disable={readOnly||false}
          />}
        />
        {formErrors && formErrors?.toDate && formErrors?.toDate?.type === "required" && (
          <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_REQUIRED`)}</CardLabelError>
        )}
        {formErrors && formErrors?.toDate && formErrors?.toDate?.type === "isValidToDate" && (
          <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_INVALID`)}</CardLabelError>
        )}{" "}
      </div>

      {/* <span className="surveyformfield"> */}
      <div className="survey-column">
        <label>{t("LABEL_SURVEY_END_TIME")} <span style={{color:"red"}}>*</span></label>

        <Controller
          control={controlSurveyForm}
          name="toTime"
          defaultValue={surveyDetails?.toTime}
          rules={{ required: true, validate: { isValidToTime } }}
          render={({ onChange, value }) => <TextInput name="toTime" type="time" onChange={handleFieldChange} defaultValue={surveyDetails.toTime}
           //disable={enableEndDateTimeOnly ? !enableEndDateTimeOnly : disableInputs}
           disable={readOnly||false}
           />}
        />
        {formErrors && formErrors?.toTime && formErrors?.toTime?.type === "required" && (
          <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_REQUIRED`)}</CardLabelError>
        )}
        {formErrors && formErrors?.toTime && formErrors?.toTime?.type === "isValidToDate" && (
          <CardLabelError>{t(`EVENTS_TO_DATE_ERROR_INVALID`)}</CardLabelError>
        )}
      </div>
      </div>
    </div>
  );
};

export default SurveySettingsForms;
