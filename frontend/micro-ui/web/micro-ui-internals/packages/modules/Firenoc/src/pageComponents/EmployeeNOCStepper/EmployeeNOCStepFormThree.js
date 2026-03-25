import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const EmployeeNOCStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const stateId = Digit.ULBService.getStateId();

  const currentStepData = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.formData && state.noc.NOCNewApplicationFormReducer.formData[config?.key]
      ? state.noc.NOCNewApplicationFormReducer.formData[config?.key]
      : {};
  });

  // Get applicationType from Step 1 (NOC Details)
  const applicationType = useSelector(function (state) {
    return state?.noc?.NOCNewApplicationFormReducer?.formData?.nocDetails?.fireNOCType?.code || "NEW";
  });

  // Get documents directly from Redux (dispatched by FireNOCDocuments under a dedicated key)
  const reduxDocuments = useSelector(function (state) {
    return state?.noc?.NOCNewApplicationFormReducer?.formData?.uploadedDocuments || {};
  });

  /* Fetch FireNoc Documents MDMS for validation */
  const { isLoading, data: docConfig } = Digit.Hooks.useCustomMDMS(stateId, "FireNoc", [{ name: "Documents" }], {
    select: (d) => {
      const allDocs = d?.FireNoc?.Documents || [];
      const match = allDocs.find((entry) => entry.applicationType === applicationType);
      return match?.allowedDocs?.filter((doc) => doc.active) || [];
    },
  });

  function goNext(finaldata) {
    // Use Redux documents directly since FormComposer/Controller pipeline doesn't relay them
    const missingFields = validation(reduxDocuments);
    if (missingFields.length > 0) {
      setError(`${t("NOC_PLEASE_ATTACH_LABEL")} ${t(missingFields[0].replaceAll(".", "_").toUpperCase())}`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setError("");
      }, 3000);
      return;
    }

    onGoNext();
  }

  function validation(docData) {
    if (isLoading || !docConfig?.length) return [];

    const requiredCodes = docConfig.filter((d) => d.required).map((d) => d.code);
    const documentsData = docData?.documents || [];
    const uploadedTypes = documentsData.filter((d) => d.filestoreId).map((d) => d.documentType);

    return requiredCodes.filter(
      (reqCode) => !uploadedTypes.some((uploaded) => uploaded.startsWith(reqCode))
    );
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
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

export default EmployeeNOCStepFormThree;
