// reducers/RentAndLeaseNewApplicationFormReducer.js
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORMType, SET_RENTANDLEASE_NEW_APPLICATION_STEPType, RESET_RENTANDLEASE_NEW_APPLICATION_FORMType } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const RentAndLeaseNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_RENTANDLEASE_NEW_APPLICATION_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_RENTANDLEASE_NEW_APPLICATION_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_RENTANDLEASE_NEW_APPLICATION_FORMType:
      return initialState;
    default:
      return state;
  }
};

export default RentAndLeaseNewApplicationFormReducer;

