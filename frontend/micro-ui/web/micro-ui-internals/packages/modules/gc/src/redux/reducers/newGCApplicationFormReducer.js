// reducers/employeeFormReducer.js
import { UPDATE_GC_NEW_APPLICATION_FORM, SET_GC_NEW_APPLICATION_FORM_STEP, RESET_STATE } from "../actions/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const newGCApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_GC_NEW_APPLICATION_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_GC_NEW_APPLICATION_FORM_STEP:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_STATE:
      return initialState;
    default:
      return state;
  }
};

export default newGCApplicationFormReducer;
