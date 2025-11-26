import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../../redux/action/RentAndLeaseNewApplicationActions";
import { useTranslation } from "react-i18next";
import RentAndLeasePropertyDetails from "../RentAndLeasePropertyDetails";
import _ from "lodash";

const NewRentAndLeaseStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

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



  return (
    <React.Fragment>
      <div className="employeeCard">
        <RentAndLeasePropertyDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} config={config}/>
      </div>
    </React.Fragment>
  );
};

export default NewRentAndLeaseStepFormOne;

