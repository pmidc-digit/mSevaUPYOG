// reducers/employeeFormReducer.js
import { UPDATE_GCNewApplication_FORMType, SET_GCNewApplication_STEPType, RESET_GC_NEW_APPLICATION_FORMType } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const GCNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_GCNewApplication_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_GCNewApplication_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_GC_NEW_APPLICATION_FORMType:
      return initialState;
    default:
      return state;
  }
};

export default GCNewApplicationFormReducer;
