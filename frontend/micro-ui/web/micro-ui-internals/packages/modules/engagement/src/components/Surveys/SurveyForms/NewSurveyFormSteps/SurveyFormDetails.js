import React from "react";
import { useDispatch, useSelector } from "react-redux";
//import { FormComposer } from "@mseva/digit-ui-react-components";
//
import {FormComposer} from "../../../../../../../react-components/src/hoc/FormComposer";
import { updateSurveyForm} from "../../../../redux/actions/surveyFormActions";
import { Header } from "@mseva/digit-ui-react-components";


const SurveyFormDetails = ({ config, onGoNext, onBackClick, t }) => {
 const dispatch = useDispatch();
        const surveyDetails = useSelector(state => state.engagement.surveyForm.surveyDetails);
 
    function goNext(data) {
        console.log(`Data in step ${config.currStepNumber} is: \n`, data);
        let f=0;
        let alertMsg=""
        surveyDetails.map((item)=>{
           if(item.name===''){
            f=1;
            alertMsg+="Please enter survey name\n"
           }
           if(item.fromDate===''){
            f=1;
            alertMsg+="Please enter From date\n"
           }
           if(item.fromTime===''){
            f=1;
            alertMsg+="Please enter From time\n"
           }
           if(item.toDate===''){
            f=1;
            alertMsg+="Please enter To date\n"
           }
           if(item.toTime===''){
            f=1;
            alertMsg+="Please enter To time\n"
            }
        })
        if(f===1){
            alert(alertMsg);
            return;
        }
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
