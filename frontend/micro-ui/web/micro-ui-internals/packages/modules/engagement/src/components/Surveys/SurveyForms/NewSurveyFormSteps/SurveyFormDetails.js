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
            alertMsg+="Please enter Survey Name\n"
           }
           if(item.name.length>500){
            f=1;
            alertMsg+="Please enter a Survey Name that is 500 characters or fewer\n"
           }
           if(item.description.length>500){
            f=1;
            alertMsg+="Please enter a Survey Description that is 500 characters or fewer\n"
           }
           if(item.fromDate===''){
            f=1;
            alertMsg+="Please enter Survey Start Date\n"
           }
           if(item.fromTime===''){
            f=1;
            alertMsg+="Please enter Survey Start Time\n"
           }
           if(item.toDate===''){
            f=1;
            alertMsg+="Please enter Survey End Date\n"
           }
           if(item.toTime===''){
            f=1;
            alertMsg+="Please enter Survey End Time\n"
            }
            if((item.description).length>140){
                f=1;
                alertMsg+="Please enter description less than 140 characters\n"
            }

            let start = new Date(`${item.fromDate}T${item.fromTime}`);
            let end = new Date(`${item.toDate}T${item.toTime}`);
        
            // Check if start date is greater than end date
            if (start > end) {
                f=1;
                alertMsg+="Start date and time must be before end date and time.\n";
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
  const headerStyle={
    marginLeft:'-10px'
  }
  const lineStyle={
    border:'1px solid #DFE0E2',
     marginBottom:'20px',
      marginLeft:'-10px'
  }

    // console.log("currentStepData in  Administrative details: ", currentStepData);

    return (
        <React.Fragment>
           
            <FormComposer
                defaultValues={currentStepData}
                //heading={t("")}
                box={true}
                lineStyle={lineStyle}
                sectionHeadStyle={headerStyle}
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
