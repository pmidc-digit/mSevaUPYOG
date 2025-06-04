import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "@mseva/digit-ui-react-components";
import { UPDATE_PtNewApplication } from "../../../redux/actions/PTNewApplicationActions";

const PTEditFormStepThree = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);

    const missingFields = validateEmployeeStepThreeFields(data);
    if (missingFields.length > 0) {
      alert(`Please fill the following mandatory fields:\n- ${missingFields.join("\n- ")}`);
      return;
    }
    
    onGoNext();
  }

  const validateEmployeeStepThreeFields = (data) => {
    const missingFields = [];
  
    const ownershipCategory = data?.ownershipCategory?.code;
    const owners = data?.owners || [];
  
    
    if (!ownershipCategory) {
      missingFields.push("Ownership Category is required");
      return missingFields; 
    }
  
    
    if (ownershipCategory === "INDIVIDUAL.SINGLEOWNER" && owners.length !== 1) {
      missingFields.push("Only one owner is allowed for Single Owner");
    }
  
    if (ownershipCategory === "INDIVIDUAL.MULTIPLEOWNERS" && owners.length <= 1) {
      missingFields.push("Multiple owners are required for Multiple Owner category");
    }
  
    
    owners.forEach((owner, index) => {
      const prefix = `Owner ${index + 1}`;
  
      if (["INDIVIDUAL.SINGLEOWNER", "INDIVIDUAL.MULTIPLEOWNERS"].includes(ownershipCategory)) {
        if (!owner?.name) missingFields.push(`${prefix} - Name`);
        if (!owner?.gender?.code) missingFields.push(`${prefix} - Gender`);
        if (!owner?.mobileNumber) {
          missingFields.push(`${prefix} - Mobile Number`);
        } else {
          const isValidMobile = /^[6789]\d{9}$/.test(owner.mobileNumber);
          if (!isValidMobile) {
            missingFields.push(`${prefix} - Mobile Number must start with 6/7/8/9 and be 10 digits`);
          }
        }
        if (!owner?.fatherOrHusbandName) missingFields.push(`${prefix} - Father/Husband Name`);
        if (!owner?.relationship?.code) missingFields.push(`${prefix} - Relationship`);
        if (!owner?.ownerType?.code) missingFields.push(`${prefix} - Owner Type`);
  
        if (owner?.ownerType?.code !== "NONE") {
          if (!owner?.documents?.documentType) missingFields.push(`${prefix} - Document Type`);
          if (!owner?.documents?.documentUid) missingFields.push(`${prefix} - Document UID`);
        }
      }
  
      if (["INSTITUTIONALPRIVATE", "INSTITUTIONALGOVERNMENT"].includes(ownershipCategory)) {
        if (!owner?.institutionName) missingFields.push(`${prefix} - Institution Name`);
        if (!owner?.institutionType?.name) missingFields.push(`${prefix} - Institution Type`);
        if (!owner?.name) missingFields.push(`${prefix} - Contact Person Name`);
        if (!owner?.altContactNumber) {
          missingFields.push(`${prefix} - Landline Number`);
        } else {
          const isValidAltContact = /^[0-9]{11}$/.test(owner.altContactNumber);
          if (!isValidAltContact) {
            missingFields.push(`${prefix} - Landline Number must be 11 digits`);
          }
        }
        if (!owner?.mobileNumber) {
          missingFields.push(`${prefix} - Mobile Number`);
        } else {
          const isValidMobile = /^[6789]\d{9}$/.test(owner.mobileNumber);
          if (!isValidMobile) {
            missingFields.push(`${prefix} - Mobile Number must start with 6/7/8/9 and be 10 digits`);
          }
        }
        if (!owner?.designation) missingFields.push(`${prefix} - Designation`);
        if (!owner?.correspondenceAddress) missingFields.push(`${prefix} - Correspondence Address`);
      }
    });
  
    return missingFields;
  };  

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in personal deatils step 3", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    // if (!_.isEqual(data, currentStepData)) {
    //   dispatch(UPDATE_PtNewApplication(config.key, data));
    // }
    if (!_.isEqual(data, localStepData)) {
      dispatch(UPDATE_PtNewApplication(config.key, data));
      setLocalStepData(data);
    }
  };

  const currentStepData = useSelector(function (state) {
    console.log("state in step three ", state);
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key]
      ? state.pt.PTNewApplicationForm.formData[config.key]
      : {};
  });
  const reduxStepData = useSelector((state) => state.pt.PTNewApplicationForm.formData.ownerShipDetails);
  const [localStepData, setLocalStepData] = useState(reduxStepData);
  console.log("reduxStepData in step three: ", localStepData);
  const dispatch = useDispatch();

  // console.log("currentStepData in  Administrative details: ", currentStepData);

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
    </React.Fragment>
  );
};

export default PTEditFormStepThree;
