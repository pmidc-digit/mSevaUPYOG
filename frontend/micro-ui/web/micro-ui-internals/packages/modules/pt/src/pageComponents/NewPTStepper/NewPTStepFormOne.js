import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTNewApplication_FORM } from "../../redux/action/PTNewApplicationActions";
import PropertyAddressDetails from "../../components/PropertyAddressDetails";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const NewPTStepFormOne = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const PTNewApplicationModal = Digit?.ComponentRegistryService?.getComponent("PTNewApplicationModal");

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
  useEffect(() => {
      setShowApplicationModal(true);
    }, []);

  return (
    <React.Fragment>
      <div className="employeeCard">
        <PropertyAddressDetails onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />
        {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
        {showApplicationModal ? <PTNewApplicationModal /> : null}
      </div>
    </React.Fragment>
  );
};

export default NewPTStepFormOne;
