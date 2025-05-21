// reducers/employeeFormReducer.js
import { UPDATE_PtNewApplication_FORM, SET_PtNewApplication_STEP, RESET_PT_NEW_APPLICATION_FORM } from "../actions/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const PTNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PtNewApplication_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_PtNewApplication_STEP:
      return {
        ...state,
        step: action.payload,
      };
    // case SET_EMPLOYEE_VALIDITY:
    //   return {
    //     ...state,
    //     isValid: action.payload,
    //   };
    case RESET_PT_NEW_APPLICATION_FORM:
      return initialState;
    default:
      return state;
  }
};

export default PTNewApplicationFormReducer;