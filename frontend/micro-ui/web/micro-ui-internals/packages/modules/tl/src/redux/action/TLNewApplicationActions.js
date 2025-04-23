import {UPDATE_tlNewApplication_FORM, SET_tlNewApplication_STEP, RESET_TL_NEW_APPLICATION_FORM } from "./types";

export const UPDATE_tlNewApplication = (key, value) => ({
  type: UPDATE_tlNewApplication_FORM,
  payload: { key, value },
});

export const SET_tlNewApplication = (step) => ({
  type: SET_tlNewApplication_STEP,
  payload: step,
});

export const RESET_tlNewApplicationForm = () => ({
  type: RESET_TL_NEW_APPLICATION_FORM,
});

// export const setEmployeeValidity = (isValid) => ({
//   type: SET_EMPLOYEE_VALIDITY,
//   payload: isValid,
// });