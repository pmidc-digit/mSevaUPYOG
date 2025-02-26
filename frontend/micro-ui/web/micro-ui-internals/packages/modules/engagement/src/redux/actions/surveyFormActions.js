import { UPDATE_SURVEY_FORM, SET_SURVEY_STEP } from "./types";
import {FIELD_CHANGE,DELETE_CATEGORY, ADD_CATEGORY, ADD_QUESTIONS, GO_PREV, GO_NEXT,RECALCULATE_WEIGHTAGE, UPDATE_CATEGORY, UPDATE_QUESTION_SELECTION, SET_QUESTIONS, NEXT_STEP, PREVIOUS_STEP, SET_STEP_DATA } from "./types";

export const updateSurveyForm = (key, value) => ({
    type: UPDATE_SURVEY_FORM,
    payload: { key, value },
});

export const setSurveyStep = (step) => ({
    type: SET_SURVEY_STEP,
    payload: step,
});


export const fieldChange = (surveyId,data) => ({ type: FIELD_CHANGE, surveyId,data});

// export const addSection = () => ({ type: ADD_SECTION });
// export const addCategory = (sectionId) => ({ type: ADD_CATEGORY, sectionId });
// export const addQuestion = (sectionId, categoryId) => ({ type: ADD_QUESTION, sectionId, categoryId });
// export const updateSection = (sectionId, data) => ({ type: UPDATE_SECTION, sectionId, data });
// export const updateCategory = (sectionId, categoryId, data) => ({ type: UPDATE_CATEGORY, sectionId, categoryId, data });
// export const updateQuestion = (sectionId, categoryId, questionId, data) => ({ type: UPDATE_QUESTION, sectionId, categoryId, questionId, data });
export const addCategory = (id) => ({ type: ADD_CATEGORY,id });
export const addQuestions = (categoryId, questions) => ({ type: ADD_QUESTIONS, categoryId, questions });
export const addQuestionsList = (categoryId, questionsList) => ({ type: ADD_QUESTIONS, categoryId, questionsList });
export const updateCategory = (categoryId, data) => ({ type: UPDATE_CATEGORY, categoryId, data });
export const updateQuestionSelection = (categoryId, questionId, selected) => ({ type: UPDATE_QUESTION_SELECTION, categoryId, questionId, selected });
export const setQuestions = (categoryId, questions) => ({ type: SET_QUESTIONS, categoryId, questions });
export const recalculateWeightage = () => ({ type: RECALCULATE_WEIGHTAGE });
export const deleteCategory = (categoryId) => ({ type: DELETE_CATEGORY, categoryId});
export const goPrev =()=>({type:GO_PREV});
export const goNext =()=>({type:GO_NEXT});
export const nextStep = () => ({ type: NEXT_STEP });
export const previousStep = () => ({ type: PREVIOUS_STEP });
export const setStepData = (step, data) => ({ type: SET_STEP_DATA, step, data });