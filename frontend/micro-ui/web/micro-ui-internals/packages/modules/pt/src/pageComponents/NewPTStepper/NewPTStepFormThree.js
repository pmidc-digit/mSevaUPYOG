import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTNewApplication_FORM } from "../../redux/action/PTNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const NewPTStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const stateId = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  // Fetch MDMS docs
  const { data: mdmsDocsData, isLoading } = Digit.Hooks.ptr.useDocumentsMDMS(tenantId);

  const currentStepData = useSelector(function (state) {
    return state.ptr.PTRNewApplicationFormReducer.formData && state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
      ? state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
      : {};
  });

  function validation(documents) {
    if (!isLoading) {
      const ptrDocumentsType = mdmsDocsData || [];
      const documentsData = documents?.documents?.documents || [];

      console.log("ptrDocumentsType", ptrDocumentsType);
      console.log("documentsData", documentsData);
      console.log("mdmsDocsData", mdmsDocsData);
      console.log("documentsData===", documents);

      // Step 1: Extract required doc codes
      const requiredDocs = ptrDocumentsType?.filter((doc) => doc.required)?.map((doc) => doc.code);

      // Step 2: Extract uploaded doc types
      const uploadedDocs = documentsData?.map((doc) => doc.documentType);

      // Step 3: Identify missing docs
      const missingDocs = requiredDocs.filter((reqDoc) => !uploadedDocs?.includes(reqDoc));

      return missingDocs;
    }
    return [];
  }

  function goNext(data) {
    // const validator = makeDocumentsValidator(mdmsDocsData);
    // const docErrors = validator(data?.documents?.documents || []);

    // if (docErrors?.missingRequired) {
    //   const missingDocNames = docErrors.missingDocs?.join(", ") || "";
    //   setError(`You haven't uploaded: ${missingDocNames}`);
    //   setShowToast(true);
    //   return;
    // }
    // onGoNext();
    const missingFields = validation(data);

    if (missingFields.length > 0) {
      setError(`${t(missingFields[0].replace(".", "_").toUpperCase())} is required`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return;
    }

    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PTNewApplication_FORM(config.key, data));
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

export default NewPTStepFormThree;
