import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { newConfig } from "../../config/config";
import Toast from "../../../../../react-components/src/atoms/Toast";
import { setSurveyStep } from "../../redux/actions/surveyFormActions";
import CardHeader from "../../../../../react-components/src/atoms/CardHeader";

//Config for steps
const surveyConfig = [
  {
    head: "SURVEY_DETAILS",
    stepLabel: "SURVEY_DETAILS_STEP_LABEL",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "SurveyFormDetails",
    key: "surveyFormDetails",
    withoutLabel: true,
    texts: {
      // submitBarLabel: "SURVEY_COMMON_BUTTON_NXT_STEP",

      submitBarLabel: "Next Step",
    },
  },
  {
    head: "SURVEY_CATEGORIES",
    stepLabel: "SURVEY_CATEGORIES_STEP_LABEL",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "SurveyFormCategoryDetails",
    key: "surveyFormCategoryDetails",
    withoutLabel: true,
    texts: {
      // submitBarLabel: "SURVEY_COMMON_BUTTON_NXT_STEP",
      submitBarLabel: "Next Step",
    },
  },
  {
    head: "SURVEY_SUMMARY",
    stepLabel: "SURVEY_SUMMARY_STEP_LABEL",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "SurveryFormSummary",
    key: "summary",
    withoutLabel: true,
    texts: {
      // submitBarLabel: "SURVEY_COMMON_SUBMIT",
      submitBarLabel: "Submit",
    },
  },
];

const updatedSurveyConfig = surveyConfig.map((item) => {
  return { ...item, currStepConfig: newConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const CreateSurveyStepForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.engagement.surveyForm);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const setStep = (updatedStepNumber) => {
    dispatch(setSurveyStep(updatedStepNumber));
  };

  const handleSubmit = () => {

  };

  console.log("formState: ", formState);
  return (
    <div class="pageCard">
      <CardHeader divider={true}>{t("SURVEY_FORM")}</CardHeader>
      <Stepper stepsList={updatedSurveyConfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {showToast && (
        <Toast
          error={showToast.key}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
          isDleteBtn={"true"}
        />
      )}
    </div>
  );
};

export default CreateSurveyStepForm;
