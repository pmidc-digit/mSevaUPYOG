// RenewSummaryStepFour.jsx

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";

export const RenewTLSummaryStepFour = ({ config, onGoNext, onBackClick, t }) => {
  const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData);
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Monitor checkbox state and enable/disable button
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.declarationChecked) {
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Auto-close toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
      Digit.TLService.fetch_bill({ tenantId: tenantId, filters: { consumerCode: formData?.CreatedResponse?.applicationNumber, businessService: "TL" } });
      
  },[])

  const goNext = async () => {
    // Validate checkbox
    if (!window.declarationChecked) {
      setError(t("TL_PLEASE_ACCEPT_DECLARATION") !== "TL_PLEASE_ACCEPT_DECLARATION" ? t("TL_PLEASE_ACCEPT_DECLARATION") : "Please accept the declaration to proceed");
      setShowToast(true);
      return;
    }
    
    const res = await onSubmit(formData?.CreatedResponse);


    if (res) {
      history.replace(`/digit-ui/citizen/tl/tradelicence/application/${formData?.CreatedResponse?.applicationNumber}/${tenantId}`);
    } else {
      setError("Submission failed. Please try again.");
      setShowToast(true);
    }
  };

  const onSubmit = async (data) => {
   
    let formdata = {...data};
    formdata.tradeLicenseDetail.applicationDocuments = formData?.Documents?.documents?.documents;
    formdata.wfDocuments = formData?.Documents?.documents?.documents;
    formdata.calculation.applicationNumber = formdata.applicationNumber;
    formdata.action = "APPLY";
    formdata.status = "INITIATED";
    formdata


    const response = await Digit.TLService.update({ Licenses: [formdata] }, tenantId);
    return (response?.ResponseInfo?.status === "successful");
  }

  const onGoBack = () => {
    onBackClick(config.key, formData);
  };

  return (
    <React.Fragment>
    <FormComposer
      defaultValues={formData}
      config={config.currStepConfig}
      onSubmit={goNext}
      label={t(config.texts.submitBarLabel)}
      currentStep={config.currStepNumber}
      onBackClick={onGoBack}
      isDisabled={isButtonDisabled}
    />
    {showToast && (
      <Toast
        error={true}
        label={error}
        isDleteBtn={true}
        onClose={() => {
          setShowToast(false);
          setError("");
        }}
      />
    )}
    </React.Fragment>
  );
};
