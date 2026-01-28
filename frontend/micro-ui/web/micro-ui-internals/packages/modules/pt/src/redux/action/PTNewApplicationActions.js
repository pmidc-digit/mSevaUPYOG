import { UPDATE_PTNewApplication_FORMType, SET_PTNewApplication_STEPType, RESET_PT_NEW_APPLICATION_FORMType } from "./types";

export const UPDATE_PTNewApplication_FORM = (key, value) => ({
  type: UPDATE_PTNewApplication_FORMType,
  payload: { key, value },
});

export const SET_PTNewApplication_STEP = (step) => ({
  type: SET_PTNewApplication_STEPType,
  payload: step,
});

export const RESET_PT_NEW_APPLICATION_FORM = () => ({
  type: RESET_PT_NEW_APPLICATION_FORMType,
});

// export const setEmployeeValidity = (isValid) => ({
//   type: SET_EMPLOYEE_VALIDITY,
//   payload: isValid,
// });
