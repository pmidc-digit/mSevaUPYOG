// reducers/employeeFormReducer.js
import { UPDATE_EMPLOYEE_FORM, SET_EMPLOYEE_STEP, SET_EMPLOYEE_VALIDITY } from "../actions/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const employeeFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_EMPLOYEE_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_EMPLOYEE_STEP:
      return {
        ...state,
        step: action.payload,
      };
    case SET_EMPLOYEE_VALIDITY:
      return {
        ...state,
        isValid: action.payload,
      };
    default:
      return state;
  }
};

export default employeeFormReducer;