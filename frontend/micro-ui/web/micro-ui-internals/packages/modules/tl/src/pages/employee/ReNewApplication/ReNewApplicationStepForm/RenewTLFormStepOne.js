// RenewFormStepOne.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/tlNewApplicationActions";
import _ from "lodash";

const RenewTLFormStepOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

//   const currentStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData[config.key] || {});
//     const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData.TraidDetails);
const reduxStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData.TraidDetails);
const [localStepData, setLocalStepData] = useState(reduxStepData);





  const validateStepData = (data) => {
    const { tradedetils, tradeUnits, validityYears, address, cpt } = data;
    return (
      tradedetils?.[0]?.financialYear?.code &&
      tradedetils?.[0]?.tradeName &&
      tradedetils?.[0]?.structureSubType?.code &&
      tradeUnits?.[0]?.tradeSubType?.code &&
      validityYears?.code &&
      (cpt?.details?.address?.locality?.code || address?.locality?.code)
    );
  };

  const goNext = () => {
    if (!validateStepData(localStepData)) {
      setError(t("Please fill all mandatory fields."));
      setShowToast(true);
      return;
    }
    onGoNext();
  };

  const onGoBack = () => {
    onBackClick(config.key, localStepData);
  };

  const onFormValueChange = (setValue, data) => {
    if (!_.isEqual(data, localStepData)) {
        dispatch(UPDATE_tlNewApplication(config.key, data));
        setLocalStepData(data); // important: update local copy too
      }      
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={localStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(config.texts.submitBarLabel)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default RenewTLFormStepOne;
