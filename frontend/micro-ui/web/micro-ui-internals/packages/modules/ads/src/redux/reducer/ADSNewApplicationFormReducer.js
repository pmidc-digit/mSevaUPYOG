// reducers/employeeFormReducer.js
import { UPDATE_ADSNewApplication_FORMType, SET_ADSNewApplication_STEPType, RESET_ADS_NEW_APPLICATION_FORMType } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const ADSNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ADSNewApplication_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_ADSNewApplication_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_ADS_NEW_APPLICATION_FORMType:
      return initialState;
    default:
      return state;
  }
};

export default ADSNewApplicationFormReducer;
