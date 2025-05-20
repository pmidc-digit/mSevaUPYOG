import {UPDATE_PtNewApplication_FORM, SET_PtNewApplication_STEP,RESET_PT_NEW_APPLICATION_FORM  } from "./types";

export const UPDATE_PtNewApplication = (key, value) => ({
  type: UPDATE_PtNewApplication_FORM,
  payload: { key, value },
});

export const SET_PtNewApplication = (step) => ({
  type: SET_PtNewApplication_STEP,
  payload: step,
});

// export const setEmployeeValidity = (isValid) => ({
//   type: SET_EMPLOYEE_VALIDITY,
//   payload: isValid,
// });

export const RESET_ptNewApplicationForm = () => ({
  type: RESET_PT_NEW_APPLICATION_FORM,
});