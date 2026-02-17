// reducers/employeeFormReducer.js
import { UPDATE_PtNewApplication_FORM, SET_PtNewApplication_STEP, RESET_PtNewApplication_STEP } from "../actions/types";

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
    case RESET_PtNewApplication_STEP:
      return initialState;
    // case SET_EMPLOYEE_VALIDITY:
    //   return {
    //     ...state,
    //     isValid: action.payload,
    //   };
    default:
      return state;
  }
};

export default PTNewApplicationFormReducer;