import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_CHBApplication_FORM } from "../../redux/action/CHBApplicationActions";
import { useState } from "react";
import _ from "lodash";

const NewADSStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.chb.CHBApplicationFormReducer.formData && state.chb.CHBApplicationFormReducer.formData[config?.key]
      ? state.chb.CHBApplicationFormReducer.formData[config?.key]
      : {};
  });

  function goNext(data) {
    console.log("goNext data in NewPTRStepFormThree: ", data);

    const { missingFields, notFormattedFields } = validateStepData(currentStepData);

    if (missingFields.length > 0) {
      setError(`Please fill the following field: ${missingFields[0]}`);
      setShowToast(true);
      return;
    }
    onGoNext();
  }

  function validateStepData(data) {
    // const pets = data?.pets || [];

    const missingFields = [];
    const notFormattedFields = [];

    return { missingFields, notFormattedFields };
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(UPDATE_CHBApplication_FORM(config.key, data));
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

export default NewADSStepFormThree;
