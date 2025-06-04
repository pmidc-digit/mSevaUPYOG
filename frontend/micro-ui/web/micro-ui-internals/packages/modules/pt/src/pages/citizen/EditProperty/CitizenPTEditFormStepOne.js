import React,{useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PtNewApplication } from "../../../redux/actions/PTNewApplicationActions";

const CitizenPTEditFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);

    // const missingFields = validateEmployeeStepOneFields(data);

    // if (missingFields.length > 0) {
    //   alert(`Please fill the following mandatory fields:\n- ${missingFields.join("\n- ")}`);
    //   return;
    // }
    
    onGoNext();
  }

  const validateEmployeeStepOneFields = (data) => {
    const missingFields = [];
  
    if (!data?.address?.city?.code) {
      missingFields.push("City");
    }
  
    if (!data?.address?.locality?.code) {
      missingFields.push("Locality");
    }
  
    if (!data?.yearOfCreation?.code) {
      // Note: On employee side it's directly data.yearOfCreation.code (no nested yearOfCreation inside it)
      missingFields.push("Year of Creation");
    }
    const pincode = data?.address?.pincode;
    if (pincode) {
      const isValidLength = /^\d{6}$/.test(pincode);
      const isNumeric = !isNaN(Number(pincode));
  
      if (!isValidLength || !isNumeric) {
        missingFields.push("Pincode must be a 6-digit number");
      }
    }
  
    return missingFields;
  };

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in Property details step one: ", data,"\n Bool: ",!_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PtNewApplication(config.key, data));
      console.log("Dispatching UPDATE_PtNewApplication with key:", config.key, "and data:", data);
    }
  };

  const currentStepData = useSelector(function (state) {
    console.log("state in step one edit ", state);
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key] 
        ? state.pt.PTNewApplicationForm.formData[config.key] 
        : {};
});
const reduxStepData = useSelector((state) => state.pt.PTNewApplicationForm.formData.LocationDetails);
const [localStepData, setLocalStepData] = useState(reduxStepData);
const formData = useSelector((state) => state.pt.PTNewApplicationForm.formData);

useEffect(() => {
  setLocalStepData(reduxStepData);
},[reduxStepData])
console.log("reduxStepData in step one: ", localStepData);
  const dispatch = useDispatch();


  return (
    <React.Fragment>
      {localStepData&&<FormComposer
        defaultValues={localStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />}
    </React.Fragment>
  );
};

export default CitizenPTEditFormStepOne;
