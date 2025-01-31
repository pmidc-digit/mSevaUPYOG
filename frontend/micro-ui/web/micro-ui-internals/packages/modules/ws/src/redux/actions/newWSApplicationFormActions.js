import { UPDATE_WS_NEW_APPLICATION_FORM, SET_WS_NEW_APPLICATION_FORM_STEP, RESET_STATE } from "./types";

export const updateWSNewApplicationForm = (key, value) => ({
  type: UPDATE_WS_NEW_APPLICATION_FORM,
  payload: { key, value },
});

export const setWSNewApplicationFormStep = (step) => ({
  type: SET_WS_NEW_APPLICATION_FORM_STEP,
  payload: step,
});


export const resetWSApplicationForm = () => ({
  type: RESET_STATE
});
