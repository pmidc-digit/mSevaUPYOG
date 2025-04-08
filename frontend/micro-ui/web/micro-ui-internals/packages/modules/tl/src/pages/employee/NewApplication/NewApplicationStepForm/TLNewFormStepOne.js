// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// //
// import { FormComposer } from "@mseva/digit-ui-react-components";
// import { UPDATE_tlNewApplication } from "../../../../redux/action/tlNewApplicationActions";

// const TLNewFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
//   function goNext(data) {
//     console.log(`Data in step ${config.currStepNumber} is: \n`, data);
//     onGoNext();
//   }


//   function onGoBack(data) {
//     onBackClick(config.key, data);
//   }

//   const onFormValueChange = (setValue = true, data) => {
//     console.log("onFormValueChange data in AdministrativeDetails: ", data,"\n Bool: ",!_.isEqual(data, currentStepData));
//     if (!_.isEqual(data, currentStepData)) {
//       dispatch(UPDATE_tlNewApplication(config.key, data));
//     }
//   };

  
//   const currentStepData = useSelector(function (state) {
//     return state.tl.tlNewApplicationForm.formData && state.tl.tlNewApplicationForm.formData[config.key] 
//         ? state.tl.tlNewApplicationForm.formData[config.key] 
//         : {};
// });
//   const dispatch = useDispatch();

//   const validateStepData = () => {
    
  
//     return true;
//   };

//   return (
//     <React.Fragment>
//       <FormComposer
//         defaultValues={currentStepData}
//         //heading={t("")}
//         config={config.currStepConfig}
//         onSubmit={goNext}
//         onFormValueChange={onFormValueChange}
//         //isDisabled={!canSubmit}
//         label={t(`${config.texts.submitBarLabel}`)}
//         currentStep={config.currStepNumber}
//         onBackClick={onGoBack}
//       />
//     </React.Fragment>
//   );
// };

// export default TLNewFormStepOne;

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components"; // Added Toast here
import { UPDATE_tlNewApplication } from "../../../../redux/action/tlNewApplicationActions";
import { useState } from "react"; // Added useState for error handling
import _ from "lodash"; // You are already using _

const TLNewFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.tl.tlNewApplicationForm.formData && state.tl.tlNewApplicationForm.formData[config.key] 
      ? state.tl.tlNewApplicationForm.formData[config.key] 
      : {};
  });

  function validateStepData(data) {
    const {
      tradedetils,
      tradeUnits,
      validityYears,
      address,
      cpt
    } = data;

    const mandatoryFieldsPresent =
      tradedetils?.[0]?.financialYear?.code &&
      tradedetils?.[0]?.licenseType?.code &&
      tradedetils?.[0]?.tradeName &&
      tradedetils?.[0]?.structureType?.code &&
      tradedetils?.[0]?.structureSubType?.code &&
      tradedetils?.[0]?.commencementDate &&
      tradeUnits?.[0]?.tradeCategory?.code &&
      tradeUnits?.[0]?.tradeType?.code &&
      tradeUnits?.[0]?.tradeSubType?.code &&
      validityYears?.code &&
      address?.city?.code && 
      (cpt?.details?.address?.locality?.code || address?.locality?.code);

      console.log("Mandatory Fields: ","\n financialYear:",tradedetils?.[0]?.financialYear?.code,"\n licenseType:",tradedetils?.[0]?.licenseType?.code,"\n tradeName:",tradedetils?.[0]?.tradeName,"\n structureType:",tradedetils?.[0]?.structureType?.code,"\n structureSubType:",tradedetils?.[0]?.structureSubType?.code,"\n commencementDate:",tradedetils?.[0]?.commencementDate,"\n tradeCategory:",tradeUnits?.[0]?.tradeCategory?.code,"\n tradeType:",tradeUnits?.[0]?.tradeType?.code,"\n tradeSubType:",tradeUnits?.[0]?.tradeSubType?.code,"\n validityYears:",validityYears?.code,"\n address.city:",address?.city?.code, "\n locality?.code", address?.locality?.code);
      console.log("Mandatory Fields Present: ", mandatoryFieldsPresent);
    return mandatoryFieldsPresent;
  }

  function goNext(data) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, data);

    if (!validateStepData(currentStepData)) {
      setError(t("Please fill all mandatory fields."));
      setShowToast(true);
      return;
    }

    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data,"\n Bool: ",!_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_tlNewApplication(config.key, data));
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
      {showToast && (
        <Toast
          isDleteBtn={true}
          error={true}
          label={error}
          onClose={closeToast}
        />
      )}
    </React.Fragment>
  );
};

export default TLNewFormStepOne;