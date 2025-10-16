import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_ChallanApplication_FORM } from "../../../redux/action/ChallanApplicationActions";
import { useState } from "react";
import _ from "lodash";

const ChallanStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const { data: docData, isLoading } = Digit.Hooks.useCustomMDMS("pb", "Challan", [{ name: "Documents" }]);

  const checkFormData = useSelector((state) => state.challan.ChallanApplicationFormReducer.formData || {});

  const currentStepData = useSelector(function (state) {
    return state.challan.ChallanApplicationFormReducer.formData && state.challan.ChallanApplicationFormReducer.formData[config?.key]
      ? state.challan.ChallanApplicationFormReducer.formData[config?.key]
      : {};
  });

  console.log("currentStepData===", currentStepData);
  console.log("checkFormData===", checkFormData);

  function goNext(finalData) {
    console.log("Current Data", finalData);
    console.log("data?????....=====", docData?.Challan?.Documents);

    const missingFields = validation(finalData);

    if (missingFields.length > 0) {
      setError(`${t("CHALLAN_MESSAGE_" + missingFields[0].replace(".", "_").toUpperCase())}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    onGoNext();
  }

  function validation(formData) {
    if (!isLoading) {
      const chbDocumentsType = docData?.Challan?.Documents || [];
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
      dispatch(UPDATE_ChallanApplication_FORM(config.key, data));
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

export default ChallanStepFormThree;
