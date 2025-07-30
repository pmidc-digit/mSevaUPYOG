import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTRNewApplication_FORM } from "../../redux/action/PTRNewApplicationActions";
import { useState } from "react";
import PTRCitizenDetails from "../PTRCitizenDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const NewPTRStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.ptr.PTRNewApplicationFormReducer.formData;
  });

  function goNext(data) {
    dispatch(UPDATE_PTRNewApplication_FORM(config.key, data));
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

export default NewPTRStepFormOne;
