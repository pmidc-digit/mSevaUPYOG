import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTNewApplication_FORM } from "../../redux/action/PTNewApplicationActions";
import _ from "lodash";

const NewPTStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  // Fetch MDMS docs

  console.log("tenantIdforproperty", tenantId);

  const { data: docData, isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [{ name: "Documents" }]);

  console.log("docData", docData);

  // const currentStepData = useSelector(function (state) {
  //   return state.pt.PTNewApplicationFormReducer.formData;
  // });

  // const currentStepData = useSelector(function (state) {
  //   return state.pt.PTNewApplicationFormReducer.formData;
  // });

  const { currentStepData, isSpecialCategoryRequired } = useSelector(function (state) {
    const formData = state.pt.PTNewApplicationFormReducer?.formData || {};
    const ownerTypeCode = formData?.ownerDetails?.owners?.[0]?.ownerType?.code;
    return {
      currentStepData: formData[config?.key] || {},
      isSpecialCategoryRequired: ownerTypeCode !== undefined && ownerTypeCode !== "NONE",
    };
  });

  console.log("currentStepData", currentStepData);
  console.log("[NewPTStepFormFour] isSpecialCategoryRequired:", isSpecialCategoryRequired);

  const goNext = async (finalData) => {
    const missingFields = validation(finalData);
    if (missingFields.length > 0) {
      setError(`${t("PT_" + missingFields[0].replace(".", "_").toUpperCase())} document is missing`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    onGoNext();
  };

  function validation(formData) {
    const chbDocumentsType = docData?.["PropertyTax"]?.Documents || [];
    const uploadedDocs = formData?.documents?.documents || [];
    // Extract required docs from MDMS
    const requiredDocs = chbDocumentsType?.filter((doc) => doc.required).map((doc) => doc.code);

    // If owner has a special category (ownerType != NONE), also require SPECIALCATEGORYPROOF
    if (isSpecialCategoryRequired && !requiredDocs.includes("OWNER.SPECIALCATEGORYPROOF")) {
      requiredDocs.push("OWNER.SPECIALCATEGORYPROOF");
    }

    // Extract uploaded document codes
    const uploadedDocCodes = uploadedDocs?.map((doc) => doc.documentType || []);

    // For dropdowns: match if uploadedDoc starts with requiredDoc (prefix check)
    const missingDocs = requiredDocs?.filter((reqDoc) => !uploadedDocCodes.some((uploaded) => uploaded && uploaded.startsWith(reqDoc)));

    console.log("[validation] requiredDocs:", requiredDocs, "| uploadedDocCodes:", uploadedDocCodes, "| missingDocs:", missingDocs);
    return missingDocs;
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange", data, "\n Bool: ", !_.isEqual(data, currentStepData));

    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PTNewApplication_FORM(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };
  const enrichedConfig = (config?.currStepConfig || []).map((step) => {
    return {
      ...step,
      body: (step.body || []).map((field) => {
        if (field.component === "PropertySelectDocs") {
          return {
            ...field,
            isSpecialCategoryRequired: isSpecialCategoryRequired,
          };
        }
        return field;
      }),
    };
  });

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        config={enrichedConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast isDeleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewPTStepFormFour;
