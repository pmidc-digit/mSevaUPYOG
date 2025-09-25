import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTRNewApplication_FORM } from "../../redux/action/PTRNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const NewPTRStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const stateId = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: mdmsDocsData, isLoading } = Digit.Hooks.ptr.useDocumentsMDMS(tenantId);

  const currentStepData = useSelector(function (state) {
    return state.ptr.PTRNewApplicationFormReducer.formData && state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
      ? state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
      : {};
  });

  const makeDocumentsValidator = (mdms) => {
    const requiredDocs = (mdms || []).filter((d) => d?.required);
    console.log("requiredDocs are:>> ", requiredDocs);

    return (documents = []) => {
      const errors = {};
      const missingDocs = [];
      const docsArray = Array.isArray(documents) ? documents : [];
      if (!requiredDocs.length) return errors;
      for (const doc of requiredDocs) {
        const satisfied = docsArray.some((d) => d.documentType?.includes(doc.code) && (d.filestoreId || d.fileStoreId));
        if (!satisfied) {
          missingDocs.push(t(doc?.code.replaceAll(".", "_")));
          // or doc.name if available
        }
      }
      if (missingDocs.length > 0) {
        errors.missingRequired = "PTR_MISSING_REQUIRED_DOCUMENTS";
        errors.missingDocs = missingDocs;
      }
      return errors;
    };
  };

  function goNext(data) {
    const validator = makeDocumentsValidator(mdmsDocsData);
    const docErrors = validator(data?.documents?.documents || []);

    if (docErrors?.missingRequired) {
      const missingDocNames = docErrors.missingDocs?.join(", ") || "";
      setError(`You haven't uploaded: ${missingDocNames}`);
      setShowToast(true);
      return;
    }
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PTRNewApplication_FORM(config.key, data));
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

export default NewPTRStepFormThree;
