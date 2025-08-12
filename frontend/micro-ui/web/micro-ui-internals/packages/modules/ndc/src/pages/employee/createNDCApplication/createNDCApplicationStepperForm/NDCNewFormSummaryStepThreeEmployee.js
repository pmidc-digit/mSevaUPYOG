import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { FormComposer } from "@mseva/digit-ui-react-components";
import NDCSummary from "../../../../pageComponents/NDCSummary";

const NDCNewFormSummaryStepThreeEmployee = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  const formData = useSelector((state) => state.ndc.NDCForm.formData || {});
  // console.log("state.pt.PTNewApplicationForm Form data in Summary Step: ", useSelector((state) => state.pt.PTNewApplicationForm.formData));
  // Function to handle the "Next" button click

  const goNext = async (action) => {
    console.log("yeah", action);
    console.log("formData", formData);
    const actionStatus = action?.action;
    try {
      const res = await onSubmit(formData, actionStatus); // wait for the API response

      // Check if the API call was successful
      if (res?.isSuccess) {
        history.push("/digit-ui/employee/ndc/response/" + res?.response?.Applications?.[0]?.uuid);
      } else {
        console.error("Submission failed, not moving to next step.", res?.response);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    }
  };

  function mapToNDCPayload(inputData, actionStatus) {
    const applicant = Digit.UserService.getUser()?.info || {};

    // Clone and modify workflow action
    const updatedApplication = {
      ...formData?.apiData?.Applications?.[0],
      workflow: {
        ...formData?.apiData?.Applications?.[0]?.workflow,
        action: actionStatus,
      },
      NdcDetails: formData?.apiData?.Applications?.[0]?.NdcDetails,
      Documents: [], // We'll populate below
    };

    // const payload = {
    //   Applications: updatedApplicant,
    //   NdcDetails: formData.apiData.NdcDetails,
    //   Documents: [], // Add documents mapping if needed
    // };

    (inputData?.DocummentDetails?.documents?.documents || []).forEach((doc) => {
      updatedApplication.Documents.push({
        uuid: doc?.documentUid,
        documentType: doc?.documentType,
        documentAttachment: doc?.fileStoreId,
      });
    });

    // Final payload matches update API structure
    const payload = {
      Applications: [updatedApplication],
    };

    return payload;
  }

  const onSubmit = async (data, actionStatus) => {
    console.log("coming here btw");
    const finalPayload = mapToNDCPayload(data, actionStatus);

    // const response = await Digit.NDCService.NDCcreate({ tenantId, filters: { skipWorkFlow: true }, details: finalPayload });

    const response = await Digit.NDCService.NDCUpdate({ tenantId, details: finalPayload });

    if (response?.ResponseInfo?.status === "successful") {
      return { isSuccess: true, response };
    } else {
      return { isSuccess: false, response };
    }
  };

  // Function to handle the "Back" button click
  const onGoBack = (data) => {
    onBackClick(config.key, data);
  };

  return (
    <React.Fragment>
      <NDCSummary formData={formData} goNext={goNext} />
      {/* <FormComposer
        defaultValues={formData} // Pass the entire formData as default values
        config={config.currStepConfig} // Configuration for the current step
        onSubmit={goNext} // Handle form submission
        // onFormValueChange={onFormValueChange} // Handle form value changes
        // label={t(`${config?.texts?.submitBarLabel}`)} // Submit button label
        currentStep={config.currStepNumber} // Current step number
        onBackClick={onGoBack} // Handle back button click
        goNext={goNext}
      /> */}
    </React.Fragment>
  );
};

export { NDCNewFormSummaryStepThreeEmployee };
