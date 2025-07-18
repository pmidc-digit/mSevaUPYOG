import { UPDATE_obpsNewApplication_FORM, SET_obpsNewApplication_STEP, RESET_OBPS_NEW_APPLICATION_FORM } from "./types";

export const UPDATE_obpsNewApplication = (key, value) => ({
  type: UPDATE_obpsNewApplication_FORM,
  payload: { key, value },
});

export const SET_obpsNewApplication = (step) => ({
  type: SET_obpsNewApplication_STEP,
  payload: step,
});

export const RESET_obpsNewApplicationForm = () => ({
  type: RESET_OBPS_NEW_APPLICATION_FORM,
});

// export const setEmployeeValidity = (isValid) => ({
//   type: SET_EMPLOYEE_VALIDITY,
//   payload: isValid,
// });
