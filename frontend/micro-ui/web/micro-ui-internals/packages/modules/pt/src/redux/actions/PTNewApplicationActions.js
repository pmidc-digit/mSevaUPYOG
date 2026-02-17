import {UPDATE_PtNewApplication_FORM, SET_PtNewApplication_STEP, RESET_PtNewApplication_STEP } from "./types";

export const UPDATE_PtNewApplication = (key, value) => ({
  type: UPDATE_PtNewApplication_FORM,
  payload: { key, value },
});

export const SET_PtNewApplication = (step) => ({
  type: SET_PtNewApplication_STEP,
  payload: step,
});

export const RESET_PtNewApplication = (step) => ({
  type: RESET_PtNewApplication_STEP,
});

// export const setEmployeeValidity = (isValid) => ({
//   type: SET_EMPLOYEE_VALIDITY,
//   payload: isValid,
// });