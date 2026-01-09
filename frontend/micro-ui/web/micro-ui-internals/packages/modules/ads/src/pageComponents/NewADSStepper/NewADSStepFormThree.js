import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_ADSNewApplication_FORM } from "../../redux/action/ADSNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const NewADSStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const stateId = Digit.ULBService.getStateId();
  const { isLoading, data: mdmsData } = Digit.Hooks.ads.useADSDocumentsMDMS(stateId);

  const currentStepData = useSelector(function (state) {
    return state.ads.ADSNewApplicationFormReducer.formData && state.ads.ADSNewApplicationFormReducer.formData[config?.key]
      ? state.ads.ADSNewApplicationFormReducer.formData[config?.key]
      : {};
  });

  function goNext(finaldata) {
    const missingFields = validation(finaldata);
    if (missingFields.length > 0) {
      setError(`${t(missingFields[0].replace(/\./g, "_").toUpperCase())} is required`);
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

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_ADSNewApplication_FORM(config?.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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

export default NewADSStepFormThree;
