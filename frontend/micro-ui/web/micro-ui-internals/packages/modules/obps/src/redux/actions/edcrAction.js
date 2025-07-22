export const SUBMIT_EDCR_FORM = "SUBMIT_EDCR_FORM";

export const submitEDCRForm = (formPayload) => {
  return {
    type: SUBMIT_EDCR_FORM,
    payload: formPayload,
  };
};
