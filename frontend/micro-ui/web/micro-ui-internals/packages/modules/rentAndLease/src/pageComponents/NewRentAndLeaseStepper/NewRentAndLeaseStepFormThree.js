import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../../redux/action/RentAndLeaseNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const NewRentAndLeaseStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const stateId = Digit.ULBService.getStateId();
  const { isLoading, data: mdmsData } = Digit.Hooks.ads.useADSDocumentsMDMS(stateId);

  // const currentStepData = useSelector(function (state) {
  //   return state?.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData || {};
  // });

   const currentStepData = useSelector(function (state) {
      return state?.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData && state?.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData[config?.key]
        ? state?.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData[config?.key]
        : {};
    });
  console.log("currentStepData", currentStepData);

  function goNext(finaldata) {
    const missingFields = validation(finaldata);
    if (missingFields.length > 0) {
      setError(`You haven't uploaded: ${missingFields[0].replace(".", "_").toUpperCase()}`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return;
    }
    onGoNext();
  }

  function validation(documents) {
    if (!isLoading) {
      const ndcDocumentsType = mdmsData || [];
      const documentsData = documents?.documents?.documents || [];

      // Step 1: Extract required document codes from ndcDocumentsType
      const requiredDocs = ndcDocumentsType.filter((doc) => doc.required).map((doc) => doc.code);

      // Step 2: Extract uploaded documentTypes
      const uploadedDocs = documentsData.map((doc) => doc.documentType);

      // Step 3: Identify missing required document codes
      const missingDocs = requiredDocs.filter((reqDoc) => !uploadedDocs.includes(reqDoc));

      return missingDocs;
    }
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM(config?.key, data));
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <React.Fragment>
      <div className="employeeCard">
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
      </div>
    </React.Fragment>
  );
};

export default NewRentAndLeaseStepFormThree;
