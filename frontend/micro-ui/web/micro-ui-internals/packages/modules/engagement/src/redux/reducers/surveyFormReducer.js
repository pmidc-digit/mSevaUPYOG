// reducers/SURVEYFormReducer.js
import { UPDATE_SURVEY_FORM, SET_SURVEY_STEP, SET_SURVEY_VALIDITY } from "../actions/types";

const initialState = {
  step: 1,
  isValid: false,
  formData: {},
};

const surveyFormReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SURVEY_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.key]: action.payload.value,
        },
      };
    case SET_SURVEY_STEP:
      return {
        ...state,
        step: action.payload,
      };
    case SET_SURVEY_VALIDITY:
      return {
        ...state,
        isValid: action.payload,
      };
    default:
      return state;
  }
};

export default surveyFormReducer;