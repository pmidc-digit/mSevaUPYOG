import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_GCNewApplication_FORM } from "../../../../redux/action/GCNewApplicationActions";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PTRCitizenPet from "../PTRCitizenPet";
import _ from "lodash";

const RenewPTRStepFormTwo = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.ptr.PTRNewApplicationFormReducer.formData;
  });

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

  console.log("config", config);

  return (
    <React.Fragment>
      <PTRCitizenPet onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default RenewPTRStepFormTwo;
