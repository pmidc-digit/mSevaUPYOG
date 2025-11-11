// reducers/employeeFormReducer.js
import { UPDATE_LayoutNewApplication_FORMType, SET_LayoutNewApplication_STEPType, RESET_LAYOUT_NEW_APPLICATION_FORMType, UPDATE_LayoutNewApplication_CoOrdinatesType } from "../actions/types";



const initialState = {
  step: 1,
  isValid: false,
  formData: {},
  coordinates:{}
};

const LayoutNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_LayoutNewApplication_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_LayoutNewApplication_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_LAYOUT_NEW_APPLICATION_FORMType:
      return initialState;

    case UPDATE_LayoutNewApplication_CoOrdinatesType:
      return {
        ...state,
        coordinates: {
          ...state.coordinates,
          [action.payload.key]: action.payload.value,
        },
      };
    default:
      return state;
  }
};

export default LayoutNewApplicationFormReducer;
