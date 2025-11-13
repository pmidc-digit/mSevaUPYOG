import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_CHBApplication_FORM } from "../../redux/action/CHBApplicationActions";
import { useState } from "react";
import _ from "lodash";

const NewADSStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  const { data: docData, isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "Documents" }]);
  const checkFormData = useSelector((state) => state.chb.CHBApplicationFormReducer.formData || {});

  const currentStepData = useSelector(function (state) {
    return state.chb.CHBApplicationFormReducer.formData && state.chb.CHBApplicationFormReducer.formData[config?.key]
      ? state.chb.CHBApplicationFormReducer.formData[config?.key]
      : {};
  });

  console.log("currentStepData===", currentStepData);
  console.log("checkFormData===", checkFormData);

  function goNext(finalData) {
    console.log("Current Data", finalData);
    console.log("data?????....=====", docData?.CHB?.Documents);

    const missingFields = validation(finalData);

    if (missingFields.length > 0) {
      setError(`${t("CHB_MESSAGE_" + missingFields[0].replace(".", "_").toUpperCase())}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    onGoNext();
  }

  function validation(formData) {
    if (!isLoading) {
      const chbDocumentsType = docData?.CHB?.Documents || [];
      const uploadedDocs = formData?.documents?.documents || [];

      console.log("chbDocumentsType", chbDocumentsType);
      console.log("uploadedDocs", uploadedDocs);

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
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_CHBApplication_FORM(config.key, data));
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
