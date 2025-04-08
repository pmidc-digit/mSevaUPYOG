import {UPDATE_tlNewApplication_FORM, SET_tlNewApplication_STEP } from "./types";

export const UPDATE_tlNewApplication = (key, value) => ({
  type: UPDATE_tlNewApplication_FORM,
  payload: { key, value },
});

export const SET_tlNewApplication = (step) => ({
  type: SET_tlNewApplication_STEP,
  payload: step,
});

// export const setEmployeeValidity = (isValid) => ({
//   type: SET_EMPLOYEE_VALIDITY,
//   payload: isValid,
// });