import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_CHBApplication_FORM } from "../../redux/action/CHBApplicationActions";
import { useState } from "react";
import CHBCitizenOne from "../CHBCitizenSecond";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const NewADSStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.chb.CHBApplicationFormReducer.formData;
  });

  function goNext(data) {
    dispatch(UPDATE_CHBApplication_FORM(config.key, data));
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
      <CHBCitizenOne onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewADSStepFormOne;
