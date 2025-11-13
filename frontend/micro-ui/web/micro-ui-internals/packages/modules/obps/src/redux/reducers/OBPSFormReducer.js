import { UPDATE_OBPS_FORMType, SET_OBPS_STEPType, RESET_OBPS_FORMType, UPDATE_OBPS_CoOrdinatesType } from "../actions/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
  coordinates:{}
};

const OBPSFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_OBPS_FORMType:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_OBPS_STEPType:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_OBPS_FORMType:
      return initialState;

    case UPDATE_OBPS_CoOrdinatesType:
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

export default OBPSFormReducer;
