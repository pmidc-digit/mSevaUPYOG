import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTNewFormStepTwo = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();

  function goNext(data) {
    console.log(`Data== in step 2 next is=======`, data);

    const missingFields = validateStepTwoFields(data);
    if (missingFields.length > 0) {
      alert(`Please fill the following mandatory fields:\n- ${missingFields.join("\n- ")}`);
      return;
    }

    onGoNext();
  }

  const validateStepTwoFields = (data) => {
    const missingFields = [];
  
    const propertyType = data?.PropertyType?.code;
    const usageCategory = data?.usageCategoryMajor?.code;
    const units = data?.units || [];
  
    // 🔒 Always mandatory
    if (!propertyType) missingFields.push("Property Type");
    if (!usageCategory) missingFields.push("Usage Category");
    if (!data?.businessName?.businessName) missingFields.push("Business Name");
  
    // 🔁 Shared unit field validator
    const validateUnitCommonFields = (unit, index) => {
      const prefix = `Unit ${index + 1}`;
      const occupancyCode = unit?.occupancyType?.code;
      const rentedMonths = unit?.RentedMonths?.code;
  
      // Always mandatory for BUILTUP.* and SHARED
      if (!unit?.floorNoCitizen?.code) missingFields.push(`${prefix} - Floor No`);
      
      // If usageCategoryMajor !== RESIDENTIAL or MIXED
      if (
        usageCategory !== "RESIDENTIAL" &&
        usageCategory !== "MIXED" &&
        usageCategory !== "NONRESIDENTIAL.OTHERS"
      ) {
        if (!unit?.subUsageType) missingFields.push(`${prefix} - Sub Usage Type`);
      }
  
      // If NONRESIDENTIAL.OTHERS, only floorNoCitizen is mandatory — handled above
      if (usageCategory === "NONRESIDENTIAL.OTHERS") return;
  
      if (!unit?.occupancyType?.code) missingFields.push(`${prefix} - Occupancy Type`);
      if (!unit?.builtUpArea) missingFields.push(`${prefix} - Built-up Area`);
  
      // Occupancy logic
      if (occupancyCode === "RENTED" || occupancyCode === "PG") {
        if (!unit?.arv) missingFields.push(`${prefix} - ARV`);
        if (!rentedMonths) missingFields.push(`${prefix} - Rented Months`);
  
        if (rentedMonths !== "12" && !unit?.NonRentedMonthsUsage?.code) {
          missingFields.push(`${prefix} - Non-Rented Months Usage`);
        }
      }
    };
  
    // 🧠 Conditional by PropertyType
    switch (propertyType) {
      case "BUILTUP.INDEPENDENTPROPERTY":
        if (!data?.landarea) missingFields.push("Land Area");
        if (!data?.noOfFloors && data?.noOfFloors !== 0) missingFields.push("No. of Floors");
        if (units.length !== Number(data?.noOfFloors)) {
          missingFields.push("Number of unit entries must match No. of Floors");
        }
  
        units.forEach(validateUnitCommonFields);
        break;
  
      case "BUILTUP.SHAREDPROPERTY":
        if (units.length < 1) missingFields.push("At least one Unit is required");
        units.forEach(validateUnitCommonFields);
        break;
  
      case "VACANT":
        if (!data?.landarea) missingFields.push("Land Area");
        break;
  
      default:
        // Handle unexpected property types if needed
        break;
    }
  
    return missingFields;
  };

  function onGoBack(data) {
    console.log(`Data== in step 2 back is=======`, data);
    onBackClick(config.key, data);
  }

  const currentStepData = useSelector(function (state) {
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key]
      ? state.pt.PTNewApplicationForm.formData[config.key]
      : {};
  });

  const onFormValueChange = (setValue = true, data) => {
    console.log("data step 2 ==========", data);
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

export { PTNewFormStepTwo };
