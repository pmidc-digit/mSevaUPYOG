import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTNewApplication_FORM } from "../../../../redux/action/PTNewApplicationActions";

const PTOwnerTransfershipStepTwo = ({ config, onGoNext, onBackClick, t }) => {
  const isFirstRender = useRef(true);
  const [showToast, setShowToast] = useState(null);

  const stateId = Digit.ULBService.getStateId();
  const { data: mdmsData } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", [
    "Documents",
    "MutationDocuments",
  ]);

  const formData = useSelector(
    (state) => state.pt.PTNewApplicationFormReducer?.formData || {}
  );

  const validation = (stepData) => {
    const mutationDocs = mdmsData?.PropertyTax?.MutationDocuments || [];
    const commonDocs = mdmsData?.PropertyTax?.Documents || [];

    const propertyTaxDocuments = mutationDocs?.map?.((doc) => commonDocs.find((e) => doc.code === e.code) || doc) || [];
    
    // Extract required documents
    const requiredDocs = propertyTaxDocuments.filter((doc) => doc.required).map((doc) => doc.code);

    // If transferee has a special category (ownerType != NONE), also require OWNER.SPECIALCATEGORYPROOF
    const transfereeOwners = formData?.TransferorDetails?.owners || [];
    const isSpecialCategoryRequired = transfereeOwners.some((owner) => {
      const code = owner?.ownerType?.code || owner?.ownerType;
      return code && code !== "NONE";
    });

    if (isSpecialCategoryRequired && !requiredDocs.includes("OWNER.SPECIALCATEGORYPROOF")) {
      requiredDocs.push("OWNER.SPECIALCATEGORYPROOF");
    }

    const uploadedDocs = Array.isArray(stepData?.documents)
      ? stepData.documents
      : stepData?.documents?.documents || [];
    const uploadedDocCodes = uploadedDocs.map((doc) => doc.documentType || "");

    // For dropdowns: match if uploadedDoc starts with requiredDoc (prefix check)
    const missingDocs = requiredDocs.filter(
      (reqDoc) => !uploadedDocCodes.some((uploaded) => uploaded && uploaded.startsWith(reqDoc))
    );

    return missingDocs;
  };

  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);

    const missingFields = validation(data);
    if (missingFields.length > 0) {
      setShowToast({
        key: "error",
        label: `${t("PT_" + missingFields[0].replace(/\./g, "_").toUpperCase())} ${t("Document is missing")}`,
      });
      return;
    }

    dispatch(UPDATE_PTNewApplication_FORM(config.key, data || {}));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in Property details step one: ", data, "\n Bool: ", !_.isEqual(data, localStepData));
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!_.isEqual(data, localStepData)) {
      console.log("the formValuechange is called in step two", data);
      dispatch(UPDATE_PTNewApplication_FORM(config.key, data));
      console.log("Dispatching UPDATE_PTNewApplication_FORM with key:", config.key, "and data:", data);
    }
  };

  const currentStepData = useSelector(function (state) {
    console.log("state in step two ", state);

    return state.pt.PTNewApplicationFormReducer?.formData &&
      state.pt.PTNewApplicationFormReducer?.formData?.DocuementDetails
      ? state.pt.PTNewApplicationFormReducer?.formData?.DocuementDetails
      : {};
  });

  const reduxStepData = useSelector(
    (state) =>
      state.pt.PTNewApplicationFormReducer?.formData
        ?.DocuementDetails
  );

  console.log("Step twoo formdata +", formData);
  const [localStepData, setLocalStepData] = useState(reduxStepData);
  console.log("reduxStepData in step twoo: +", localStepData);
  
  useEffect(() => {
    setLocalStepData(reduxStepData);
  }, [reduxStepData]);
  
  const dispatch = useDispatch();

  const closeToast = () => {
    setShowToast(null);
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={localStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && (
        <Toast
          error={showToast.key === "error"}
          label={t(showToast.label)}
          onClose={closeToast}
          isDleteBtn={true}
        />
      )}
    </React.Fragment>
  );
};

export default PTOwnerTransfershipStepTwo;
