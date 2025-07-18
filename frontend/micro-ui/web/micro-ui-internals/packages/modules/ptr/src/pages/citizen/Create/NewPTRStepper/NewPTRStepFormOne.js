import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTRNewApplication_FORM } from "../../../../redux/action/PTRNewApplicationActions";
import { useState } from "react";
import _ from "lodash"; 

const NewPTRStepFormOne = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
    const [showToast, setShowToast] = useState(false);
    const [error, setError] = useState("");
  
    const currentStepData = useSelector(function (state) {
      return state.ptr.PTRNewApplicationFormReducer.formData && state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
        ? state.ptr.PTRNewApplicationFormReducer.formData[config?.key]
        : {};
    });

    function validateStepData(data) {
      const ownerss = data?.ownerss || [];

      const missingFields = [];
      const notFormattedFields = [];

      if(!ownerss?.firstName) missingFields.push("FIRST_NAME");
      if(!ownerss?.lastName) missingFields.push("LAST_NAME");
      if(!ownerss?.emailId) missingFields.push("EMAIL_ID");
      if(!ownerss?.mobileNumber) missingFields.push("MOBILE_NUMBER");
      if(!ownerss?.fatherName) missingFields.push("FATHER_NAME");
      if(!ownerss?.address) missingFields.push("ADDRESS");

      if (ownerss?.mobileNumber && !/^[6-9]\d{9}$/.test(ownerss.mobileNumber)) {
        notFormattedFields.push("MOBILE_NUMBER");
      }

      if (ownerss?.emailId && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(ownerss.emailId)) {
        notFormattedFields.push("EMAIL_ID");
      }if(ownerss?.firstName && !/^[a-zA-Z ]+$/.test(ownerss.firstName)) {
        notFormattedFields.push("FIRST_NAME");
      }if(ownerss?.lastName && !/^[a-zA-Z ]+$/.test(ownerss.lastName)) {
        notFormattedFields.push("LAST_NAME");
      }if(ownerss?.fatherName && !/^[a-zA-Z ]+$/.test(ownerss.fatherName)) {
        notFormattedFields.push("FATHER_NAME");
      }

      return {missingFields, notFormattedFields};
    }

    function goNext(data) {
        const {missingFields, notFormattedFields} = validateStepData(currentStepData);

        if (missingFields.length > 0) {
          setError(`Please fill the following field: ${missingFields[0]}`);
          setShowToast(true);
          return;
        }

        if (notFormattedFields.length > 0) {
          setError(`Please format the following field: ${notFormattedFields[0]}`);
          setShowToast(true);
          return;
        }

        onGoNext();
    }

    function onGoBack(data) {
        onBackClick(config.key, data);
      }
    
      const onFormValueChange = (setValue = true, data) => {
        console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
        if (!_.isEqual(data, currentStepData)) {
          dispatch(UPDATE_PTRNewApplication_FORM(config.key, data));
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
    )
}

export default NewPTRStepFormOne;