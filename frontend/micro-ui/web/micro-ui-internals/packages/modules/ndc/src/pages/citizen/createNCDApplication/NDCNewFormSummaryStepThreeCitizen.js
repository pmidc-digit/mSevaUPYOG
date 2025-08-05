import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
//
import { FormComposer } from "@mseva/digit-ui-react-components";

const NDCNewFormSummaryStepThreeCitizen = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  const formData = useSelector((state) => state.ndc.NDCForm.formData || {});
  // console.log("state.pt.PTNewApplicationForm Form data in Summary Step: ", useSelector((state) => state.pt.PTNewApplicationForm.formData));
  // Function to handle the "Next" button click

  const goNext = async (data) => {
    try {
      const res = await onSubmit(formData); // wait for the API response

      // Check if the API call was successful
      if (res?.isSuccess) {
        history.push("/digit-ui/citizen/ndc/response/" + res?.response?.Applicant?.uuid);
      } else {
        console.error("Submission failed, not moving to next step.", res?.response);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    }
  };

  function mapToNDCPayload(inputData) {
    const applicant = Digit.UserService.getUser()?.info || {};

    const payload = {
      Applicant: formData.apiData.Applicant,
      NdcDetails: formData.apiData.NdcDetails,
      Documents: [], // Add documents mapping if needed
    };

    (inputData?.DocummentDetails?.documents?.documents || []).forEach((doc) => {
      payload.Documents.push({
        uuid: doc?.documentUid,
        documentType: doc?.documentType,
        documentAttachment: doc?.fileStoreId,
      });
    });

    return payload;
  }

  const onSubmit = async (data) => {
    const finalPayload = mapToNDCPayload(data);

    // const response = await Digit.NDCService.NDCcreate({ tenantId, filters: { skipWorkFlow: true }, details: finalPayload });

    const response = await Digit.NDCService.NDCUpdate({ tenantId, filters: { skipWorkFlow: true }, details: finalPayload });

    if (response?.ResponseInfo?.status === "successful") {
      return { isSuccess: true, response };
    } else {
      return { isSuccess: false, response };
    }
  };

  const fetchBill = async (data) => {
    const result = await Digit.PaymentService.fetchBill(tenantId, {
      businessService: "NDC",
      consumerCode: data?.uuid,
    });
  };

  useEffect(() => {
    console.log("formData", formData);
    if (formData.apiData.Applicant) fetchBill(formData.apiData.Applicant);
  }, [formData]);

  // Function to handle the "Back" button click
  const onGoBack = (data) => {
    onBackClick(config.key, data);
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={formData} // Pass the entire formData as default values
        config={config.currStepConfig} // Configuration for the current step
        onSubmit={goNext} // Handle form submission
        // onFormValueChange={onFormValueChange} // Handle form value changes
        label={t(`${config.texts.submitBarLabel}`)} // Submit button label
        currentStep={config.currStepNumber} // Current step number
        onBackClick={onGoBack} // Handle back button click
      />
    </React.Fragment>
  );
};

export { NDCNewFormSummaryStepThreeCitizen };
