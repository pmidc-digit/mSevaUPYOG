import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_ADSNewApplication_FORM } from "../../redux/action/ADSNewApplicationActions";
import { useState } from "react";
import ADSCitizenSecond from "../ADSCitizenSecond";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const NewADSStepFormTwo = ({ config, onBackClick, onGoNext }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.ads.ADSNewApplicationFormReducer.formData;
  });

  function goNext(data) {
    dispatch(UPDATE_ADSNewApplication_FORM(config.key, data));
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
        <ADSCitizenSecond onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />
        {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewADSStepFormTwo;
