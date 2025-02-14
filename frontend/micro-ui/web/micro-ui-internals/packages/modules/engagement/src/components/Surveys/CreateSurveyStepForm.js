import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//import { Toast } from "@upyog/digit-ui-react-components";
//
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { newConfig } from "../../config/config";
import Toast from "../../../../../react-components/src/atoms/Toast";
import { setSurveyStep} from "../../redux/actions/surveyFormActions";
import CardHeader from "../../../../../react-components/src/atoms/CardHeader";
 
//Config for steps
const surveyConfig = [
  {
    head: "HR_EMPLOYEE_DETAILS",
    stepLabel: "HR_NEW_EMPLOYEE_FORM_HEADER",//"HR_EMPLOYEE_DETAILS_STEP_LABEL",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "SurveyFormPage",
    key: "SurveyFormPage",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "HR_ADMINISTRATIVE_DETAILS",
    stepLabel: "HR_ADMINISTRATIVE_DETAILS_STEP_LABEL",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "AdministrativeDetails",
    key: "administrativeDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_BUTTON_SUBMIT",
    },
  },
  {
    head: "HR_SUMMARY",
    stepLabel: "HR_SUMMARY_STEP_LABEL",
    stepNumber: 3,
    isStepEnabled: false,
    type: "component",
    component: "Summary",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_SUBMIT",
    },
  },
];

const updatedSurveyConfig = surveyConfig.map((item) => {
  return { ...item, currStepConfig: newConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const CreateSurveyStepForm = () => {
  const history=useHistory();
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

  console.log("formState: ",formState);
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
