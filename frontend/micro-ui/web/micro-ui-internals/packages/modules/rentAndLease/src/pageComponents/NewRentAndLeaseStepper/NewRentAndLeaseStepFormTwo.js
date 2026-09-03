import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../../redux/action/RentAndLeaseNewApplicationActions";
import RentAndLeaseCitizenDetails from "../RentAndLeaseCitizenDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Controller, useForm } from "react-hook-form";
import LayoutNewApplicantDetails from "../LayoutNewApplicantDetails";

const NewRentAndLeaseStepFormTwo = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    getValues,
    setError,
    clearErrors,
    register,
  } = useForm();

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

  const commonProps = { Controller, control, setValue, errors, trigger, errorStyle, getValues, setError, clearErrors, register };

  const currentStepData = useSelector(function (state) {
    return state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData || {};
  });

  function goNext(data) {
    dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM(config.key, data));
    if (onGoNext && typeof onGoNext === "function") {
      onGoNext();
    } else {
      console.error("NewRentAndLeaseStepFormOne - onGoNext is not a function!", onGoNext);
    }
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  return (
    <React.Fragment>
      <div className="employeeCard ral-owner-details-step">
        <LayoutNewApplicantDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} config={config} t={t} {...commonProps} />
        {/* <RentAndLeaseCitizenDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} config={config}/> */}
      </div>
    </React.Fragment>
  );
};

export default NewRentAndLeaseStepFormTwo;
