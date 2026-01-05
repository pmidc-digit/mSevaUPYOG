import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_GarbageApplication_FORM } from "../../../redux/action/GarbageApplicationActions";
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
    return state.gc.GarbageApplicationFormReducer.formData;
  });

  function goNext(data) {
    console.log("data aa rea", data);
    dispatch(UPDATE_GarbageApplication_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  const isCitizen = typeof window !== "undefined" && window.location?.href?.includes("citizen");

  return (
    <React.Fragment>
      <div className={!isCitizen ? "employeeCard" : ""}>
        <CHBCitizenOne onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />
      </div>
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewADSStepFormOne;
