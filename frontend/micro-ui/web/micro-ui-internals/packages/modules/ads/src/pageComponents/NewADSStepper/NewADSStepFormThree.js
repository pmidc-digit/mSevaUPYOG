import React from "react";
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
  // const { isLoading: isDocsLoading, data: mdmsData } = Digit.Hooks.ads.useADSDocumentsMDMS(
  //   stateId,
  //   "Advertisements",
  //   ["Documents"]
  // );

  const { isLoading, data: mdmsData } = Digit.Hooks.ads.useADSDocumentsMDMS(stateId);

  const currentStepData = useSelector(function (state) {
    return state.ads.ADSNewApplicationFormReducer.formData && state.ads.ADSNewApplicationFormReducer.formData[config?.key]
      ? state.ads.ADSNewApplicationFormReducer.formData[config?.key]
      : {};
  });


  const makeDocumentsValidator = (mdms) => {
    const requiredCodes = (mdms?.NDC?.Documents || []).filter((d) => d?.required).map((d) => d.code);

    return (documents = []) => {
      const errors = {};
      if (!requiredCodes?.length) return errors;
      for (const code of requiredCodes) {
        const satisfied = documents?.some((doc) => doc?.documentType?.includes?.(code) && (doc?.filestoreId || doc?.fileStoreId));
        if (!satisfied) {
          errors.missingRequired = "ADS_MISSING_REQUIRED_DOCUMENTS";
          break;
        }
      }
      return errors;
    };
  };

  function goNext(finaldata) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, finaldata);
    const missingFields = validation(finaldata);
    console.log("missingFields", missingFields);
    if (missingFields.length > 0) {
      setError(`You haven't uploaded: ${missingFields[0].replace(".", "_").toUpperCase()}`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return;
    }
    onGoNext();
    //}
  }

  function validation(documents) {
    console.log("documents", documents);
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
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_ADSNewApplication_FORM(config.key, data));
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

export default NewADSStepFormThree;
