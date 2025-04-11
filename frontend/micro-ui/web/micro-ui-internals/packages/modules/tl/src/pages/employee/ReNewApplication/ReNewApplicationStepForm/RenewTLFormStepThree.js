// RenewFormStepThree.jsx

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_tlNewApplication } from "../../../../redux/action/tlNewApplicationActions";
import _ from "lodash";

const RenewTLFormStepThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData[config.key] || {});
  const reduxStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData.Documents);
  const [localStepData, setLocalStepData] = useState(reduxStepData);

  const validateDocuments = (data) => {
    const requiredTypes = ["OWNERIDPROOF", "OWNERSHIPPROOF", "OWNERSELF"];
    const uploadedDocs = data?.documents?.documents || [];
    return requiredTypes.every((type) => uploadedDocs.some((doc) => doc?.documentType === type));
  };

  const goNext = () => {
    console.log("localStepData in step 3: formData:", localStepData);
    if (!validateDocuments(localStepData)) {
      setError(t("Please upload all mandatory documents."));
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
      setLocalStepData(data);
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

export default RenewTLFormStepThree;
