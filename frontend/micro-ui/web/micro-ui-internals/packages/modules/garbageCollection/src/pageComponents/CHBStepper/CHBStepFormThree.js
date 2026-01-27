import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_GarbageApplication_FORM } from "../../../redux/action/GarbageApplicationActions";
import { useState } from "react";
import { Loader } from "../../components/Loader";
import _ from "lodash";

const NewADSStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  const { data: docData, isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "gc-services-masters", [{ name: "Documents" }]);

  const checkFormData = useSelector((state) => state.gc.GarbageApplicationFormReducer.formData || {});

  const currentStepData = useSelector(function (state) {
    return state.gc.GarbageApplicationFormReducer.formData && state.gc.GarbageApplicationFormReducer.formData[config?.key]
      ? state.gc.GarbageApplicationFormReducer.formData[config?.key]
      : {};
  });

  const goNext = async (finalData) => {
    const missingFields = validation(finalData);
    if (missingFields.length > 0) {
      setError(`${t("GC_" + missingFields[0].replace(".", "_").toUpperCase())}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    onGoNext();
  };

  function validation(formData) {
    if (!isLoading) {
      const chbDocumentsType = docData?.["gc-services-masters"]?.Documents || [];
      const uploadedDocs = formData?.documents?.documents || [];
      // Extract required docs
      const requiredDocs = chbDocumentsType?.filter((doc) => doc.required).map((doc) => doc.code);
      // Extract uploaded document codes
      const uploadedDocCodes = uploadedDocs?.map((doc) => doc.documentType);

      // // Missing required docs
      // const missingDocs = requiredDocs?.filter((reqDoc) => !uploadedDocCodes.includes(reqDoc));

      // For dropdowns: match if uploadedDoc starts with requiredDoc (prefix check)
      const missingDocs = requiredDocs.filter((reqDoc) => !uploadedDocCodes.some((uploaded) => uploaded.startsWith(reqDoc)));

      return missingDocs;
    }
    return [];
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_GarbageApplication_FORM(config.key, data));
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
      {(loader || isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default NewADSStepFormThree;
