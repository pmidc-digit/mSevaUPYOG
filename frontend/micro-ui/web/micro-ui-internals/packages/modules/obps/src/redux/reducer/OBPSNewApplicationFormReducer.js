import { RESET_OBPS_NEW_APPLICATION_FORM, SET_obpsNewApplication_STEP, UPDATE_obpsNewApplication_FORM } from "../action/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const OBPSNewApplicationFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_obpsNewApplication_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_obpsNewApplication_STEP:
      return {
        ...state,
        step: action.payload,
      };
    case RESET_OBPS_NEW_APPLICATION_FORM:
      return initialState;
    default:
      return state;
  }
};

export default OBPSNewApplicationFormReducer;
