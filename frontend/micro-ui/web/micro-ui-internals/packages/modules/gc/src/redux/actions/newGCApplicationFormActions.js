import { UPDATE_GC_NEW_APPLICATION_FORM, SET_GC_NEW_APPLICATION_FORM_STEP, RESET_STATE } from "./types";

export const updateGCNewApplicationForm = (key, value) => ({
  type: UPDATE_GC_NEW_APPLICATION_FORM,
  payload: { key, value },
});

export const setGCNewApplicationFormStep = (step) => ({
  type: SET_GC_NEW_APPLICATION_FORM_STEP,
  payload: step,
});

export const resetGCApplicationForm = () => ({
  type: RESET_STATE,
});
