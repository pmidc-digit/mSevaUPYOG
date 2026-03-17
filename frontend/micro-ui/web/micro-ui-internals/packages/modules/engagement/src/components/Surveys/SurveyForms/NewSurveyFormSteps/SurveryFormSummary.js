import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetForm } from "../../../../redux/actions/surveyFormActions";
//
import { goPrev, updateSurveyForm } from "../../../../redux/actions/surveyFormActions";

const SurveryFormSummary = ({ config, onGoNext, onBackClick }) => {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const history = useHistory();
  const closeToast = () => {
    setShowToast(null);
  };
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.engagement.surveyForm.categories);
  const surveyDetails = useSelector((state) => state.engagement.surveyForm.surveyDetails[0]);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  function goNext(data) {
    let catArr = [];
    categories.map((category) => {
      let quesArr = [];
      category.selectedQuestions.map((question) => {
        let quesObj = {
          questionUuid: question.uuid,
          weightage: parseFloat(question.weightage),
          required: question.mandatory,
        };
        quesArr.push(quesObj);
      });

      let obj = {
        title: category.title,
        weightage: parseFloat(category.weightage),
        questions: quesArr,
      };
      catArr.push(obj);
    });

    console.log("survey det", surveyDetails);
    let startDateObj = new Date(`${surveyDetails.fromDate} ${surveyDetails.fromTime}`);
    let startDate = startDateObj.getTime();
    let endDateObj = new Date(`${surveyDetails.toDate} ${surveyDetails.toTime}`);
    let endDate = endDateObj.getTime();
    let SurveyEntityObj = {
      startDate: startDate,
      endDate: endDate,
      tenantId: surveyDetails.ulb.code,
      surveyTitle: surveyDetails.name,
      surveyCategory: surveyDetails.name,
      surveyDescription: surveyDetails.description,
      sections: catArr,
    };

    let filters = {
      SurveyEntity: SurveyEntityObj,
    };

    // history.push("/digit-ui/employee/engagement/surveys/create-response", filters)

    try {
      Digit.Surveys.createSurvey(filters).then((response) => {
        dispatch(resetForm());
        if (response?.Surveys?.length > 0) {
          history.push("/digit-ui/employee/engagement/surveys/create-response", {
            // message: "Survey Successfully Created",
            message: t("ENGAGEMENT_SURVEY_CREATED"),
            response: response?.Surveys,
            isSuccess: true,
          });
          // alert("Survey Successfully Created");
          // setShowToast({ key: true, label: "Survey successfully created" });
        } else {
          setShowToast({ key: true, label: `${response?.Errors?.message}` });
        }
      });
    } catch (error) {
      console.log(error);
    }

    console.log(`Data in step ${config.currStepNumber} is: \n`, data);
    onGoNext();
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
    dispatch(goPrev());
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onFormValueChange data in SurveryFormSummary: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));

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
      {showToast && <Toast error={showToast.key} label={t(showToast.label)} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default SurveryFormSummary;
