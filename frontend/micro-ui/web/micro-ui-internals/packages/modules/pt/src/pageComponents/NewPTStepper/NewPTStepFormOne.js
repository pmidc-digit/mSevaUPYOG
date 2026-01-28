import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTNewApplication_FORM } from "../../redux/action/PTNewApplicationActions";
import { useState } from "react";
import PropertyAddressDetails from "../../components/PropertyAddressDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const NewPTStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.pt.PTNewApplicationFormReducer.formData;
  });

  function goNext(data) {
    dispatch(UPDATE_PTNewApplication_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  console.log("me rendering instead");

  return (
    <React.Fragment>
      <div className="employeeCard">
        <PropertyAddressDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />
        {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
      </div>
    </React.Fragment>
  );
};

export default NewPTStepFormOne;
