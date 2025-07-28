import {UPDATE_PTRNewApplication_FORMType, SET_PTRNewApplication_STEPType, RESET_PTR_NEW_APPLICATION_FORMType } from "./types";

export const UPDATE_PTRNewApplication_FORM = (key, value) => ({
  type: UPDATE_PTRNewApplication_FORMType,
  payload: { key, value },
});

export const SET_PTRNewApplication_STEP = (step) => ({
  type: SET_PTRNewApplication_STEPType,
  payload: step,
});

export const RESET_PTR_NEW_APPLICATION_FORM = () => ({
  type: RESET_PTR_NEW_APPLICATION_FORMType,
});

// export const setEmployeeValidity = (isValid) => ({
//   type: SET_EMPLOYEE_VALIDITY,
//   payload: isValid,
// });