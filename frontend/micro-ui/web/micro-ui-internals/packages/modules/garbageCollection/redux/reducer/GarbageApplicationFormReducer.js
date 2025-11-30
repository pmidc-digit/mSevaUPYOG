// reducers/employeeFormReducer.js
import { UPDATE_Garbage_Application_FORMType, SET_Garbage_Application_STEPType, RESET_Garbage__APPLICATION_FORMType } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const GarbageApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_Garbage_Application_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_Garbage_Application_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_Garbage__APPLICATION_FORMType:
      return initialState;
    default:
      return state;
  }
};

export default GarbageApplicationFormReducer;
