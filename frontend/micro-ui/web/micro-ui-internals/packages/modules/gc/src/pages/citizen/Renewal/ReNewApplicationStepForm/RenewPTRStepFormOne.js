import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_GCNewApplication_FORM } from "../../../../redux/action/GCNewApplicationActions";
import { useState } from "react";
import PTRCitizenDetails from "../../../../pageComponents/PTRCitizenDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const RenewPTRStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.ptr.PTRNewApplicationFormReducer.formData;
  });

  console.log("currentStepData", currentStepData);

  const reduxStepData = useSelector((state) => state.tl.tlNewApplicationForm.formData.TraidDetails);
  const [localStepData, setLocalStepData] = useState(reduxStepData);

  console.log("reduxStepData", reduxStepData);
  useEffect(() => {
    setLocalStepData(reduxStepData);
  }, [reduxStepData]);

  function goNext(data) {
    dispatch(UPDATE_GCNewApplication_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  return (
    <React.Fragment>
      <PTRCitizenDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default RenewPTRStepFormOne;
