import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_ADSNewApplication_FORM } from "../../redux/action/ADSNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const NewSiteInspectionStepperFormOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const stateId = Digit.ULBService.getStateId();
  const { isLoading: isDocsLoading, data: mdmsData } = Digit.Hooks.ads.useADSDocumentsMDMS(stateId, "Advertisements", ["Documents"]);

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

  function goNext(data) {
    console.log("goNext data in NewADSStepFormThree: ", data);

    const validator = makeDocumentsValidator(mdmsData);
    const docsArray = currentStepData?.documents?.documents || [];
    const docErrors = validator(docsArray);

    if (docErrors?.missingRequired) {
      setError("Please upload all required documents");
      setShowToast(true);
      return;
    }

    onGoNext();
  }

  function validateStepData(data) {
    const missingFields = [];
    const notFormattedFields = [];

    return { missingFields, notFormattedFields };
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

export default NewSiteInspectionStepperFormOne;
