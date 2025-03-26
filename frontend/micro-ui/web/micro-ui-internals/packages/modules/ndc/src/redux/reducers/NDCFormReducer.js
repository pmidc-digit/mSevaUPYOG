// reducers/employeeFormReducer.js
import { SET_NDC_STEP, UPDATE_NDC_FORM } from "../actions/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const NDCFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_NDC_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_NDC_STEP:
      return {
        ...state,
        step: action.payload,
      };

    default:
      return state;
  }
};

export default NDCFormReducer;
