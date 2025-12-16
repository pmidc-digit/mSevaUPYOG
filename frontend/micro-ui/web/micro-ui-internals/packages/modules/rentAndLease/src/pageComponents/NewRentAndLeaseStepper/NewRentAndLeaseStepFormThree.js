import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer } from "@mseva/digit-ui-react-components";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../../redux/action/RentAndLeaseNewApplicationActions";
import _ from "lodash";

const NewRentAndLeaseStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const stateId = Digit.ULBService.getStateId();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const { isLoading, data: mdmsData } = Digit?.Hooks?.rentandlease.useRALDocumentsMDMS(tenantId);

  const { triggerToast } = config?.currStepConfig[0];

  const currentStepData = useSelector(function (state) {
    return state?.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData &&
      state?.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData[config?.key]
      ? state?.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData[config?.key]
      : {};
  });

  function goNext(finaldata) {
    const missingFields = validation(finaldata);
    if (missingFields.length > 0) {
      // triggerToast(`${t("RAL_UPLOAD_MISSING_DOC_MSG")} ${t(missingFields[0].replace(/\./g, "_").toUpperCase())}`, true);
      triggerToast(`${t(missingFields[0].replace(/\./g, "_").toUpperCase())} is required`, true);

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
      dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM(config?.key, data));
    }
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
    </React.Fragment>
  );
};

export default NewRentAndLeaseStepFormThree;
