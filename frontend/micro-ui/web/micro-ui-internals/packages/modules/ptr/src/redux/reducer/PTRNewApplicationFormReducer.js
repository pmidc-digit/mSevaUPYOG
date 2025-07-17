// reducers/employeeFormReducer.js
import { UPDATE_PTRNewApplication_FORM, SET_PTRNewApplication_STEP, RESET_PTR_NEW_APPLICATION_FORM } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const PTRNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PTRNewApplication_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_PTRNewApplication_STEP:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_PTR_NEW_APPLICATION_FORM:
      return initialState;
    default:
      return state;
  }
};

export default PTRNewApplicationFormReducer;