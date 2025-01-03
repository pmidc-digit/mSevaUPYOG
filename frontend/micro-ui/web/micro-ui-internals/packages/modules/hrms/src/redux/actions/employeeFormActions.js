import { UPDATE_EMPLOYEE_FORM, SET_EMPLOYEE_STEP, SET_EMPLOYEE_VALIDITY } from "./types";

export const updateEmployeeForm = (key, value) => ({
  type: UPDATE_EMPLOYEE_FORM,
  payload: { key, value },
});

export const setEmployeeStep = (step) => ({
  type: SET_EMPLOYEE_STEP,
  payload: step,
});

export const setEmployeeValidity = (isValid) => ({
  type: SET_EMPLOYEE_VALIDITY,
  payload: isValid,
});