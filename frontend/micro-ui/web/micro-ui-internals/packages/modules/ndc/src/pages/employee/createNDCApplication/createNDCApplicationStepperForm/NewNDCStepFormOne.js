import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { updateNDCForm } from "../../../../redux/actions/NDCFormActions";
import { useState } from "react";

export const NewNDCStepFormOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const currentStepData = useSelector((state) =>
    state.ndc.NDCForm.formData && state.ndc.NDCForm.formData[config.key] ? state.ndc.NDCForm.formData[config.key] : {}
  );

  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    const missingFields = validateStepData(currentStepData);

    if (missingFields.length > 0) {
      setError(`Please fill the following fields: ${missingFields.join(", ")}`);
      setShowToast(true);
      return;
    }

    onGoNext();
  }

  function validateStepData(data) {
    const missingFields = [];
    const invalidFields = [];

    const cpt = data?.cpt || {};
    const cptDetails = cpt?.details || {};
    const propertyDetails = data?.PropertyDetails || {};
    const NDCReason = data?.NDCReason || {};

    // Mandatory Field Checks
    if (!propertyDetails?.firstName) missingFields.push("First Name");
    if (!propertyDetails?.lastName) missingFields.push("Last Name");
    if (!propertyDetails?.mobileNumber) missingFields.push("Mobile Number");
    if (!propertyDetails?.address) missingFields.push("Address");
    if (!propertyDetails?.email) missingFields.push("Email");
    if (propertyDetails?.waterConnection?.length === 0) missingFields.push("Water Connection");
    if (propertyDetails?.sewerageConnection?.length === 0) missingFields.push("Sewerage Connection");
    if (!NDCReason?.code) missingFields.push("NDC Reason");
    if (!cpt?.id) missingFields.push("CPT ID");
    if (!cptDetails || Object.keys(cptDetails).length === 0) missingFields.push("CPT Details");

    // Format Validations
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (propertyDetails?.firstName && !nameRegex.test(propertyDetails.firstName)) {
      invalidFields.push("First Name (only alphabets allowed)");
    }

    if (propertyDetails?.lastName && !nameRegex.test(propertyDetails.lastName)) {
      invalidFields.push("Last Name (only alphabets allowed)");
    }

    if (propertyDetails?.email && !emailRegex.test(propertyDetails.email)) {
      invalidFields.push("Email (invalid format)");
    }

    if (propertyDetails?.mobileNumber && !mobileRegex.test(propertyDetails.mobileNumber)) {
      invalidFields.push("Mobile Number (must be a valid 10-digit Indian number)");
    }

    const allErrors = [...missingFields, ...invalidFields];
    return allErrors;
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    // console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateNDCForm(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};
