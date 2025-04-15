// reducers/employeeFormReducer.js
import { UPDATE_tlNewApplication_FORM, SET_tlNewApplication_STEP, RESET_TL_NEW_APPLICATION_FORM } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const TLNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_tlNewApplication_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_tlNewApplication_STEP:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_TL_NEW_APPLICATION_FORM:
      return initialState;
    default:
      return state;
  }
};

export default TLNewApplicationFormReducer;