import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../../redux/action/RentAndLeaseNewApplicationActions";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import RentAndLeasePropertyDetails from "../RentAndLeasePropertyDetails";
import _ from "lodash";

const NewRentAndLeaseStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData || {};
  });

  function goNext(data) {
    dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM(config.key, data));
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  console.log('config', config)

  return (
    <React.Fragment>
      <div className="employeeCard">
        <RentAndLeasePropertyDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} triggerLoader={config?.currStepConfig?.[0]?.triggerLoader}/>
        {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
      </div>
    </React.Fragment>
  );
};

export default NewRentAndLeaseStepFormOne;

