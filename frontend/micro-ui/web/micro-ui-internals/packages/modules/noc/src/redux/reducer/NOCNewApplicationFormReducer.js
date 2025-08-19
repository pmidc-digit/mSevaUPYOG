// reducers/employeeFormReducer.js
import { UPDATE_NOCNewApplication_FORMType, SET_NOCNewApplication_STEPType, RESET_NOC_NEW_APPLICATION_FORMType } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const NOCNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_NOCNewApplication_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_NOCNewApplication_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_NOC_NEW_APPLICATION_FORMType:
      return initialState;
    default:
      return state;
  }
};

export default NOCNewApplicationFormReducer;
