import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer } from "@mseva/digit-ui-react-components";
//
import { updateSurveyForm ,goPrev,goNext} from "../../../../redux/actions/surveyFormActions";


const SurveyFormCategoryDetails = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
       const categories = useSelector(state => state.engagement.surveyForm.categories);
    function goNext(data) {
        console.log("data in go next",categories)
        let f=0;
        let alertMsg="";
        // let index=1
  
        categories.map((category, index)=>{
            // if(category.questions.length===0){
            //   alert("Please select fetch questions by cliccking on Go button and select at least one question for each category");
            //   return;
            // }

            if(category.title.length>500){ 
              alertMsg+=`-> Please enter a Section Title that is 500 characters or fewer for section ${index+1} card\n`
              f=1;
             // return;
            }

            if(category.selectedQuestions.length===0){
             
              alertMsg+=`-> Please select at least one question for section ${index+1} card\n`
              f=1;
             // return;
            }
          })
    
        const totalWeightage = categories.reduce((sum, category) => sum + parseFloat(category.weightage), 0);
       console.log("tot weight",Math.round(totalWeightage))
        if (Math.round(totalWeightage) > 100) {
          alertMsg+=`The total weightage of sections should not exceed 100.\n`
          f=1;
          //alert('The total weightage of categories should not exceed 100.');
         // return;
        }
        if (Math.round(totalWeightage) < 100) {
          alertMsg+=`The total weightage of sections should not be less than 100.\n`
          f=1;
           // alert('The total weightage of categories should sum upto 100.');
           // return;
          }
          categories.map((category,index)=>{
            const totalQuesWeightage = category.selectedQuestions.reduce((sum, question) => sum + parseFloat(question.weightage), 0);
            if(Math.round(totalQuesWeightage)>100){
              alertMsg+= `The total weightage of questions in section ${index+1} titled "${category?.title}" should sum upto 100.\n`
              f=1;
              //alert('The total weightage of questions in each category should sum upto 100.');
             // return;
            }
            if(Math.round(totalQuesWeightage)<100){
              alertMsg+= `The total weightage of questions in section ${index+1} titled "${category?.title}" should sum upto 100.\n`
              f=1;
              //alert('The total weightage of questions in each category should sum upto 100.');
             // return;
            }
          })

          if(f===1){
            alert(alertMsg);
            return;
          }
      //  dispatch(nextStep());
       //goNext()
        console.log(`Data in step ${config.currStepNumber} is: \n`, data);
        onGoNext();
    }
   //const state = useSelector(state => state.engagement.surveyForm);
    function onGoBack(data) {
        onBackClick(config.key, data);
          dispatch(goPrev())
        
    }

    const onFormValueChange = (setValue = true, data) => {
        console.log("onFormValueChange data in SurveyFormCategoryDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
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
    const lineStyle={
      border:'1px solid #DFE0E2',
       marginBottom:'20px',
        marginLeft:'-10px'
    }
    const headerStyle={
      marginLeft:'-10px'
    }
    return (
        <React.Fragment>
            <FormComposer
                 box={true}
                 lineStyle={lineStyle}
                 sectionHeadStyle={headerStyle}
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

export default SurveyFormCategoryDetails;
