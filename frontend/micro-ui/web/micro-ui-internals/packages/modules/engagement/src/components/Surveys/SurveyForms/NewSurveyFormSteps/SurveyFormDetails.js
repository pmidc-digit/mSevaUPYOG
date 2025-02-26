import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer } from "@mseva/digit-ui-react-components";
//
import { updateSurveyForm} from "../../../../redux/actions/surveyFormActions";


const SurveyFormDetails = ({ config, onGoNext, onBackClick, t }) => {
    function goNext(data) {
        console.log(`Data in step ${config.currStepNumber} is: \n`, data);
        onGoNext();
    }

    function onGoBack(data) {
        onBackClick(config.key, data);
      
    }

    const onFormValueChange = (setValue = true, data) => {
        console.log("d",data)
        console.log("onFormValueChange data in SurveyFormDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
        if (!_.isEqual(data, currentStepData)) {
            dispatch(updateSurveyForm(config.key, data));
        }
    };

    const currentStepData = useSelector(function (state) {
        return state.engagement.surveyForm.formData && state.engagement.surveyForm.formData[config.key]
            ? state.engagement.surveyForm.formData[config.key]
            : {};
    });
    const dispatch = useDispatch();

    // console.log("currentStepData in  Administrative details: ", currentStepData);

    return (
        <React.Fragment>
            <FormComposer
                defaultValues={currentStepData}
                //heading={t("")}
                config={config.currStepConfig}
                onSubmit={goNext}
                onFormValueChange={onFormValueChange}
                //isDisabled={!canSubmit}
                label={t(`${config.texts.submitBarLabel}`)}
                currentStep={config.currStepNumber}
                onBackClick={onGoBack}
            />
        </React.Fragment>
    );
};

export default SurveyFormDetails;
