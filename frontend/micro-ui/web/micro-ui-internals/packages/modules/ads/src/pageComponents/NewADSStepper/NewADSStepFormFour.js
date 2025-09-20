import React, { Fragment ,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_ADSNewApplication_FORM } from "../../redux/action/ADSNewApplicationActions";
import ADSPenalty from "../ADSPenalty";
import { useTranslation } from "react-i18next";

const NewADSStepFormFour = ({ config, onGoNext, onBackClick }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const { currentStepData, isLoading } = useSelector((state) => ({
    currentStepData: state.ads.ADSNewApplicationFormReducer?.formData,
    isLoading:
      state.ads.ADSNewApplicationFormReducer?.isLoading ||
      !state.ads.ADSNewApplicationFormReducer?.formData,
  }));

  const goNext = (penaltyData) => {
    // Save into Redux under `penalty` key
    const updatedData = {
      ...currentStepData,
      penalty: penaltyData,
    };
    dispatch(UPDATE_ADSNewApplication_FORM(config.key, updatedData));
    onGoNext();
  };

  const goBack = (penaltyData) => {
    const updatedData = {
      ...currentStepData,
      penalty: penaltyData,
    };
    onBackClick(config.key, updatedData);
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  if (isLoading) return null;

  return (
    <>
      <ADSPenalty
        onGoBack={goBack}
        goNext={goNext}
        currentStepData={currentStepData?.penalty}
        t={t}
      />
      {showToast && (
        <Toast
          isDleteBtn={true}
          error={true}
          label={error}
          onClose={closeToast}
        />
      )}
    </>
  );
};

export default NewADSStepFormFour;
