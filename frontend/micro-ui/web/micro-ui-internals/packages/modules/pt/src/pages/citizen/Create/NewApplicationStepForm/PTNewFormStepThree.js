import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTNewFormStepThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();

  function goNext(data) {
    console.log(`Data== in step 3 next is=======`, data);

    const missingFields = validateStepThreeFields(data);
    if (missingFields.length > 0) {
      alert(`Please fill the following mandatory fields:\n- ${missingFields.join("\n- ")}`);
      return;
    }
    onGoNext();
  }

  const validateStepThreeFields = (data) => {
    const missingFields = [];
  
    const ownershipCategory = data?.ownershipCategory?.code;
    const owners = data?.owners || [];

    if (!ownershipCategory) {
      missingFields.push("Ownership Category is required");
      return missingFields; // Skip further checks if this is missing
    }
  
    // Rule 1: Validate owners count based on ownershipCategory
    if (ownershipCategory === "INDIVIDUAL.SINGLEOWNER" && owners.length !== 1) {
      missingFields.push("Only one owner is allowed for Single Owner");
    }
  
    if (ownershipCategory === "INDIVIDUAL.MULTIPLEOWNERS" && owners.length <= 1) {
      missingFields.push("Multiple owners are required for Multiple Owner category");
    }
  
    // Rule 2: Loop through owners for validations
    owners.forEach((owner, index) => {
      const prefix = `Owner ${index + 1}`;
  
      if (["INDIVIDUAL.SINGLEOWNER", "INDIVIDUAL.MULTIPLEOWNERS"].includes(ownershipCategory)) {
        if (!owner?.name) missingFields.push(`${prefix} - Name`);
        if (!owner?.gender?.code) missingFields.push(`${prefix} - Gender`);
        if (!owner?.mobileNumber) missingFields.push(`${prefix} - Mobile Number`);
        if (!owner?.fatherOrHusbandName) missingFields.push(`${prefix} - Father/Husband Name`);
        if (!owner?.relationship?.code) missingFields.push(`${prefix} - Relationship`);
        if (!owner?.ownerType?.code) missingFields.push(`${prefix} - Owner Type`);
  
        // Conditional doc check if ownerType is not NONE
        if (owner?.ownerType?.code !== "NONE") {
          if (!owner?.documents?.documentType) missingFields.push(`${prefix} - Document Type`);
          if (!owner?.documents?.documentUid) missingFields.push(`${prefix} - Document UID`);
        }
      }
  
      if (["INSTITUTIONALPRIVATE", "INSTITUTIONALGOVERNMENT"].includes(ownershipCategory)) {
        if (!owner?.institution?.name) missingFields.push(`${prefix} - Institution Name`);
        if (!owner?.institution?.type?.name) missingFields.push(`${prefix} - Institution Type`);
        if (!owner?.name) missingFields.push(`${prefix} - Contact Person Name`);
        if (!owner?.altContactNumber) missingFields.push(`${prefix} - Alternate Contact Number`);
        if (!owner?.mobileNumber) missingFields.push(`${prefix} - Mobile Number`);
        if (!owner?.designation) missingFields.push(`${prefix} - Designation`);
        if (!owner?.correspondenceAddress) missingFields.push(`${prefix} - Correspondence Address`);
      }
    });
  
    return missingFields;
  };
  

  function onGoBack(data) {
    console.log(`Data== in step 3 back is=======`, data);
    onBackClick(config.key, data);
  }

  const currentStepData = useSelector(function (state) {
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key]
      ? state.pt.PTNewApplicationForm.formData[config.key]
      : {};
  });

  const onFormValueChange = (setValue = true, data) => {
    console.log("data step 4 ==========", data);
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PtNewApplication(config.key, data));
    }
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
    </React.Fragment>
  );
};

export { PTNewFormStepThree };
