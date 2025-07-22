import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_ADSNewApplication_FORM } from "../../redux/action/ADSNewApplicationActions";
import { useState } from "react";
import _ from "lodash";

const NewADSStepFormTwo = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.ads.ADSNewApplicationFormReducer.formData && state.ads.ADSNewApplicationFormReducer.formData[config?.key]
      ? state.ads.ADSNewApplicationFormReducer.formData[config?.key]
      : {};
  });

  function goNext(data) {
    const { missingFields, notFormattedFields } = validateStepData(currentStepData);

    if (missingFields.length > 0) {
      setError(`Please fill the following field: ${missingFields[0]}`);
      setShowToast(true);
      return;
    }
    onGoNext();
  }

  function validateStepData(data) {
    const pets = data?.pets || [];

    const missingFields = [];
    const notFormattedFields = [];

    if (!pets?.petName) missingFields.push("PET_NAME");
    if (!pets?.petType) missingFields.push("PET_TYPE");
    if (!pets?.breedType) missingFields.push("BREED_TYPE");
    if (!pets?.petGender) missingFields.push("PET_GENDER");
    if (!pets?.color) missingFields.push("COLOR");
    if (!pets?.lastVaccineDate) missingFields.push("LAST_VACCINE_DATE");
    if (!pets?.vaccinationNumber) missingFields.push("VACCINATION_NUMBER");

    return { missingFields, notFormattedFields };
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_ADSNewApplication_FORM(config.key, data));
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };
  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewADSStepFormTwo;
