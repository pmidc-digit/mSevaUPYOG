// reducers/employeeFormReducer.js
import { UPDATE_PTNewApplication_FORMType, SET_PTNewApplication_STEPType, RESET_PT_NEW_APPLICATION_FORMType } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const PTNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PTNewApplication_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_PTNewApplication_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_PT_NEW_APPLICATION_FORMType:
      return initialState;
    default:
      return state;
  }
};

export default PTNewApplicationFormReducer;
