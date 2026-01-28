import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTNewApplication_FORM } from "../../redux/action/PTNewApplicationActions";
import OwnerDetails from "../../components/OwnerDetails";
import { useState } from "react";
import _ from "lodash";

const NewPTStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const stateId = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId();

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
  return (
    <React.Fragment>
      <div className="employeeCard">
        <OwnerDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />
        {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
      </div>
    </React.Fragment>
  );
};

export default NewPTStepFormThree;
