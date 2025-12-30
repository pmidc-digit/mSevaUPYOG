import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import Stepper from "../../../../react-components/src/customComponents/Stepper";
import { newConfig } from "../components/config/config";
import { setEmployeeStep } from "../redux/actions/employeeFormActions";
import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";

//Config for steps
const createEmployeeConfig = [
  {
    head: "HR_EMPLOYEE_DETAILS",
    stepLabel: "HR_NEW_EMPLOYEE_FORM_HEADER",//"HR_EMPLOYEE_DETAILS_STEP_LABEL",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "EmployeeDetails",
    key: "employeeDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "TL_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "ADMIN_DETAILS",
    stepLabel: "ADMIN_DETAILS",
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

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: newConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const CreateEmployeeStepForm = () => {
  const history=useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.hrms.employeeForm);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const setStep = (updatedStepNumber) => {
    dispatch(setEmployeeStep(updatedStepNumber));
  };

  const handleSubmit = () => {
    //const data = { ...formData.employeeDetails, ...formData.administrativeDetails };
    let data = {};
    createEmployeeConfig.forEach((config) => {
      if (config.isStepEnabled) {
        data = { ...data, ...formData[config.key] };
      }
    });
    onSubmit(data, tenantId, setShowToast, history);
  };

  console.log("formState: ",formState);
  return (
    <div className="card">
      <CardHeader styles={{fontSize:"28px" ,fontWeight:"400", color: "#1C1D1F"}} divider={true}>{t("HR_COMMON_CREATE_EMPLOYEE_HEADER")}</CardHeader>
      <Stepper stepsList={updatedCreateEmployeeconfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
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

export default CreateEmployeeStepForm;
