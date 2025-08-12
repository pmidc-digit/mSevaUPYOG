import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_CHBApplication_FORM } from "../../redux/action/CHBApplicationActions";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import GCCitizenFourth from "../GCCitizenFourth";

const NewADSStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.gc.gcApplicationFormReducer.formData;
  });

  function goNext(data) {
    dispatch(UPDATE_CHBApplication_FORM(config.key, data));
    onGoNext();
    return;
    setError(`Please fill the following field: ${missingFields[0]}`);
    setShowToast(true);
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
      <GCCitizenFourth onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />

      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewADSStepFormFour;
