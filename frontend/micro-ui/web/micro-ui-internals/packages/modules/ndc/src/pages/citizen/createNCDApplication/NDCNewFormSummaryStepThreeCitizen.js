import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
//
import { FormComposer } from "@mseva/digit-ui-react-components";

const NDCNewFormSummaryStepThreeCitizen = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  // Retrieve the entire formData object from the Redux store
  const formData = useSelector((state) => state.ndc.NDCForm.formData || {});
  // console.log("state.pt.PTNewApplicationForm Form data in Summary Step: ", useSelector((state) => state.pt.PTNewApplicationForm.formData));
  // Function to handle the "Next" button click
  const goNext = async (data) => {
    console.log("Full form data submitted: ", formData);
    
    // try {const res = await onSubmit(formData); // wait for the API response
    // console.log("API response: ", res);

    // // Check if the API call was successful
    // if (res.isSuccess) {
    //   console.log("Submission successful, moving to next step.", res.response);
    //   const applicationNumber = res?.response?.Properties?.[0]?.acknowldgementNumber;
    //   dispatch(RESET_PtNewApplication());
    //   history.replace(`/digit-ui/citizen/pt/property/response/${applicationNumber}`);
    //   // onGoNext();
    // } else {
    //   console.error("Submission failed, not moving to next step.", res.response);
    // }}catch(error){
    //     alert(`Error: ${error.message}`);
    //     console.error("Submission failed, not moving to next step.", error);
    // }

    // onGoNext();
  };

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

export {NDCNewFormSummaryStepThreeCitizen};