import {UPDATE_PTRNewApplication_FORM, SET_PTRNewApplication_STEP, RESET_PTR_NEW_APPLICATION_FORM } from "./types";

export const UPDATE_PTRNewApplication_FORM = (key, value) => ({
  type: UPDATE_PTRNewApplication_FORM,
  payload: { key, value },
});

export const SET_PTRNewApplication_STEP = (step) => ({
  type: SET_PTRNewApplication_STEP,
  payload: step,
});

export const RESET_PTR_NEW_APPLICATION_FORM = () => ({
  type: RESET_PTR_NEW_APPLICATION_FORM,
});

// export const setEmployeeValidity = (isValid) => ({
//   type: SET_EMPLOYEE_VALIDITY,
//   payload: isValid,
// });