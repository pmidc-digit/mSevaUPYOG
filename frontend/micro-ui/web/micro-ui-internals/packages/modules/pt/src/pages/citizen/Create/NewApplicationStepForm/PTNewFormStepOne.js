import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "@mseva/digit-ui-react-components";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTNewFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();

  function goNext(data) {
    console.log(`Data== in step ${config.currStepNumber} is=======`, data);
    // let f = 0;
    // config.currStepConfig[0].body.map((item) => {
      // if(item.isMandatory && (data[item.key]===''||data[item.key]===undefined)){
      //   f=1;
      //   return
      // }
    // });
    const missingFields = validateStepOneFields(data);

  if (missingFields.length > 0) {
    alert(`Please fill the following mandatory fields:\n- ${missingFields.join("\n- ")}`);
    return;
  }
    // if (f === 0) {
      onGoNext();
    // }
  }

  const validateStepOneFields = (data) => {
    const missingFields = [];
  
    if (!data?.address?.city?.code) {
      missingFields.push("City");
    }
  
    if (!data?.address?.locality?.code) {
      missingFields.push("Locality");
    }
  
    if (!data?.yearOfCreation?.yearOfCreation?.code) {
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

  const currentStepData = useSelector(function (state) {
    return state.pt.PTNewApplicationForm.formData && state.pt.PTNewApplicationForm.formData[config.key]
      ? state.pt.PTNewApplicationForm.formData[config.key]
      : {};
  });

  const onFormValueChange = (setValue = true, data) => {
    console.log("data step 1 ==========", data);
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

export { PTNewFormStepOne };
