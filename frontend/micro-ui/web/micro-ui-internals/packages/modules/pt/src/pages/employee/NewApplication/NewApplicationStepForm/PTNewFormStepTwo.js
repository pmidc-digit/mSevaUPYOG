import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTNewFormStepTwo = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {
    console.log("data in step two", data);
    const missingFields = validateEmployeeStepTwoFields(data);
    if (missingFields.length > 0) {
      alert(`Please fill the following mandatory fields:\n- ${missingFields.join("\n- ")}`);
      return;
    }
    onGoNext();
  }

  const validateEmployeeStepTwoFields = (data) => {
    const missingFields = [];
  
    const propertyType = data?.PropertyType?.code;
    const usageCategory = data?.usageCategoryMajor?.code;
    const units = data?.units || [];
  
    
    if (!propertyType) missingFields.push("Property Type");
    if (!usageCategory) missingFields.push("Usage Category");
    if (!data?.businessName) missingFields.push("Business Name");
  
    
    const validateUnitCommonFields = (unit, index) => {
      const prefix = `Unit ${index + 1}`;
      const occupancyCode = unit?.occupancyType?.code;
      const rentedMonths = unit?.RentedMonths?.code;
  
      if (!unit?.floorNoCitizen?.code) missingFields.push(`${prefix} - Floor No`);
  
      
      if (
        usageCategory !== "RESIDENTIAL" &&
        usageCategory !== "MIXED" &&
        usageCategory !== "NONRESIDENTIAL.OTHERS"
      ) {
        if (!unit?.subUsageType) missingFields.push(`${prefix} - Sub Usage Type`);
      }
  
      // For NONRESIDENTIAL.OTHERS, only floorNo is needed (already checked above)
      if (usageCategory === "NONRESIDENTIAL.OTHERS") return;
  
      if (!unit?.occupancyType?.code) missingFields.push(`${prefix} - Occupancy Type`);
      if (!unit?.builtUpArea) {
        missingFields.push(`${prefix} - Built-up Area`);
      } else if (isNaN(Number(unit?.builtUpArea))) {
        missingFields.push(`${prefix} - Built-up Area must be a valid number`);
      }
  
      if (occupancyCode === "RENTED" || occupancyCode === "PG") {
        if (!unit?.arv) {
          missingFields.push(`${prefix} - Annual Rent Value`);
        } else if (isNaN(Number(unit?.arv))) {
          missingFields.push(`${prefix} - Annual Rent Value must be a valid number`);
        }
        if (!rentedMonths) missingFields.push(`${prefix} - Rented Months`);
  
        if (rentedMonths !== "12" && !unit?.NonRentedMonthsUsage?.code) {
          missingFields.push(`${prefix} - Non-Rented Months Usage`);
        }
      }
    };
  
    // 🧠 Conditional Logic per Property Type
    switch (propertyType) {
      case "BUILTUP.INDEPENDENTPROPERTY":
        if (!data?.landarea) {
          missingFields.push("Land Area");
        } else if (isNaN(Number(data?.landarea))) {
          missingFields.push("Land Area must be a valid number");
        }
        if (data?.noOfFloors === undefined || data?.noOfFloors === null) {
          missingFields.push("No. of Floors");
        }
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
        break;
    }
  
    return missingFields;
  };
  

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PtNewApplication(config.key, data));
    }
  };

  const currentStepData = useSelector(function (state) {
    console.log("state in step two ", state);
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key] 
        ? state.pt.PTNewApplicationForm.formData[config.key] 
        : {};
});
  const dispatch = useDispatch();

 // console.log("currentStepData in  Administrative details: ", currentStepData);

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

export default PTNewFormStepTwo;
