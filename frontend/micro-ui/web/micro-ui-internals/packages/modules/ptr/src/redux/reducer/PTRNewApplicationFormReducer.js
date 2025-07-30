// reducers/employeeFormReducer.js
import { UPDATE_PTRNewApplication_FORMType, SET_PTRNewApplication_STEPType, RESET_PTR_NEW_APPLICATION_FORMType } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const PTRNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PTRNewApplication_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_PTRNewApplication_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_PTR_NEW_APPLICATION_FORMType:
      return initialState;
    default:
      return state;
  }
};

export default PTRNewApplicationFormReducer;