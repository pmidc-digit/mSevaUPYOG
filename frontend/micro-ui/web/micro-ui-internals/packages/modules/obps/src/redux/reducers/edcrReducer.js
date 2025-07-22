import { SUBMIT_EDCR_FORM } from "../actions/edcrActions";

const initialState = {
  formData: null,
};

const edcrReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBMIT_EDCR_FORM:
      return {
        ...state,
        formData: action.payload,
      };

    default:
      return state;
  }
};

export default edcrReducer;
