import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { SET_OBPS_STEP, UPDATE_OBPS_FORM, RESET_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState } from "react";
import PlotDetails from "../../../pageComponents/PlotDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const NewSelfCertificationStepFormTwo = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.obps.OBPSFormReducer.formData;
  });

  function goNext(key, data) {
    dispatch(UPDATE_OBPS_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  const scrutinyDetails = JSON.parse(sessionStorage.getItem("Digit.BUILDING_PERMIT"))?.value || {};
  console.log("me rendering instead", JSON.parse(sessionStorage.getItem("Digit.BUILDING_PERMIT")));

  return (
    <React.Fragment>
      <PlotDetails onGoBack={onGoBack} onSelect={goNext} formData={scrutinyDetails} t={t} currentStepData={currentStepData}/>
      <div></div>
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewSelfCertificationStepFormTwo;
