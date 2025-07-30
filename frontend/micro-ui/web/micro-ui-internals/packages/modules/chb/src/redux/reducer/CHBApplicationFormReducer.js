// reducers/employeeFormReducer.js
import { UPDATE_CHBApplication_FORMType, SET_CHBApplication_STEPType, RESET_CHB_APPLICATION_FORMType } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const CHBApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CHBApplication_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_CHBApplication_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_CHB_APPLICATION_FORMType:
      return initialState;
    default:
      return state;
  }
};

export default CHBApplicationFormReducer;
