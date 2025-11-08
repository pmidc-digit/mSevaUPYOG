import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../../redux/action/RentAndLeaseNewApplicationActions";
import { useState } from "react";
import RentAndLeaseSelectProofIdentity from "../RentAndLeaseSelectProofIdentity";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const NewRentAndLeaseStepFormThree = ({ config, onGoNext, onBackClick, t: tProp }) => {
  const dispatch = useDispatch();
  const { t: tHook } = useTranslation();
  const t = tProp || tHook;
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData || {};
  });

  const handleSelect = (key, data) => {
    if (data?.missingDocs && data.missingDocs.length > 0) {
      setError(`Please upload required documents: ${data.missingDocs.join(", ")}`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return;
    }
    if (key && data) {
      dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM(key, data));
    }
    onGoNext();
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  // Get the config from currStepConfig body
  const stepConfig = config?.currStepConfig?.[0]?.body?.[0] || { key: config?.key || "documents" };

  return (
    <React.Fragment>
      <div className="employeeCard">
        <RentAndLeaseSelectProofIdentity
          t={t}
          config={stepConfig}
          onSelect={handleSelect}
          userType="citizen"
          formData={currentStepData}
        />
        {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
      </div>
    </React.Fragment>
  );
};

export default NewRentAndLeaseStepFormThree;

