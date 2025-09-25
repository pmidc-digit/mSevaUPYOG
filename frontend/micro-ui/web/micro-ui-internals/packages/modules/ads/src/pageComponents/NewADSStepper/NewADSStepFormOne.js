import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_ADSNewApplication_FORM } from "../../redux/action/ADSNewApplicationActions";
import { useState } from "react";
import ADSCitizenDetailsNew from "../ADSCitizenDetailsNew";
import { useTranslation } from "react-i18next";
import _ from "lodash";
const NewADSStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const currentStepData = useSelector(function (state) {
    return state.ads.ADSNewApplicationFormReducer.formData;
  });
  function goNext(data) {
    dispatch(UPDATE_ADSNewApplication_FORM(config.key, data));
    console.log("conifg keyeeee", config.key);
    console.log("dataaaaa", data);

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
      <div className="employeeCard">
        <ADSCitizenDetailsNew onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />{" "}
        {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}{" "}
      </div>
    </React.Fragment>
  );
};
export default NewADSStepFormOne;
