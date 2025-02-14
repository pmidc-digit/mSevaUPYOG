import { UPDATE_SURVEY_FORM, SET_SURVEY_STEP, SET_SURVEY_VALIDITY } from "./types";

export const updateSurveyForm = (key, value) => ({
  type: UPDATE_SURVEY_FORM,
  payload: { key, value },
}); 

export const setSurveyStep = (step) => ({
  type: SET_SURVEY_STEP,
  payload: step,
});

export const setSurveyValidity = (isValid) => ({
  type: SET_SURVEY_VALIDITY,
  payload: isValid,
});