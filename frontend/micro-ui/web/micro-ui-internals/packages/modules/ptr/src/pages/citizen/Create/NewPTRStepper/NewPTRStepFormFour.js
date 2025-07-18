import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_PTRNewApplication_FORM } from "../../../../redux/action/PTRNewApplicationActions";
import { useState } from "react";
import _ from "lodash"; 

const NewPTRStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
    const [showToast, setShowToast] = useState(false);
    const [error, setError] = useState("");
  
    const currentStepData = useSelector(function (state) {
      return state.ptr.PTRNewApplicationFormReducer.formData || {};
    });

    function validateStepData(data) {
      const missingFields = [];
      const notFormattedFields = [];

      

      return {missingFields, notFormattedFields};
    }

    function goNext(data) {
        const {missingFields, notFormattedFields} = validateStepData(currentStepData);

        // if (missingFields.length > 0) {
        //   setError(`Please fill the following field: ${missingFields[0]}`);
        //   setShowToast(true);
        //   return;
        // }

        // if (notFormattedFields.length > 0) {
        //   setError(`Please format the following field: ${notFormattedFields[0]}`);
        //   setShowToast(true);
        //   return;
        // }

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

export default NewPTRStepFormFour;