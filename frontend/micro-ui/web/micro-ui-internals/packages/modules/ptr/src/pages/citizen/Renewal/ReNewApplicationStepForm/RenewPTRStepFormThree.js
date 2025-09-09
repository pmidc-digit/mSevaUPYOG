// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
// import { UPDATE_PTRNewApplication_FORM } from "../../redux/action/PTRNewApplicationActions";
// import { useState } from "react";
// import _ from "lodash";

// const NewPTRStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
//   const dispatch = useDispatch();
//   const [showToast, setShowToast] = useState(false);
//   const [error, setError] = useState("");

//   const currentStepData = useSelector(function (state) {
//     return state.ptr.PTRNewApplicationFormReducer.formData && state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
//       ? state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
//       : {};
//   });

//   function goNext(data) {
//     console.log("goNext data in NewPTRStepFormThree: ", data);

//     const { missingFields, notFormattedFields } = validateStepData(currentStepData);

//     if (missingFields.length > 0) {
//       setError(`Please fill the following field: ${missingFields[0]}`);
//       setShowToast(true);
//       return;
//     }
//     onGoNext();
//   }

//   function validateStepData(data) {
//     // const pets = data?.pets || [];

//     const missingFields = [];
//     const notFormattedFields = [];

//     return { missingFields, notFormattedFields };
//   }

//   function onGoBack(data) {
//     onBackClick(config.key, data);
//   }

//   const onFormValueChange = (setValue = true, data) => {
//     console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
//     if (!_.isEqual(data, currentStepData)) {
//       dispatch(UPDATE_PTRNewApplication_FORM(config.key, data));
//     }
//   };

//   const closeToast = () => {
//     setShowToast(false);
//     setError("");
//   };
//   return (
//     <React.Fragment>
//       <FormComposer
//         defaultValues={currentStepData}
//         config={config.currStepConfig}
//         onSubmit={goNext}
//         onFormValueChange={onFormValueChange}
//         label={t(`${config.texts.submitBarLabel}`)}
//         currentStep={config.currStepNumber}
//         onBackClick={onGoBack}
//       />
//       {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
//     </React.Fragment>
//   );
// };

// export default NewPTRStepFormThree;

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTRNewApplication_FORM } from "../../redux/action/PTRNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const RenewPTRStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const stateId = Digit.ULBService.getStateId();
  const { isLoading: isDocsLoading, data: mdmsData } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", ["Documents"]);
  console.log('mdmsData', mdmsData)

  const currentStepData = useSelector(function (state) {
    return state.ptr.PTRNewApplicationFormReducer.formData && state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
      ? state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
      : {};
  });

  console.log('mdms?.NDC?.Documents', mdmsData?.NDC?.Documents)
  const makeDocumentsValidator = (mdms) => {
  const requiredCodes = (mdms?.NDC?.Documents || [])
    .filter((d) => d?.required)
    .map((d) => d.code);

  return (documents = []) => {
    const errors = {};
    if (!requiredCodes?.length) return errors;
    for (const code of requiredCodes) {
      const satisfied = documents?.some(
        (doc) =>
          doc?.documentType?.includes?.(code) &&
          (doc?.filestoreId || doc?.fileStoreId)
      );
      console.log('satisfied', satisfied)
      if (!satisfied) {
        errors.missingRequired = "PTR_MISSING_REQUIRED_DOCUMENTS";
        break;
      }
    }
    return errors;
  };
};

console.log('currentStepData?.documents?.documents ', currentStepData?.documents?.documents )

  function goNext(data) {
    console.log("goNext data in NewPTRStepFormThree: ", data);

    const validator = makeDocumentsValidator(mdmsData);
    const docErrors = validator(data?.documents?.documents  || []);
    console.log('docErrors', docErrors)

    // if (docErrors?.missingRequired) {
    //   setError("Please fill in all required fields");
    //   setShowToast(true);
    //   return;
    // }
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_PTRNewApplication_FORM(config.key, data));
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

export default RenewPTRStepFormThree;
