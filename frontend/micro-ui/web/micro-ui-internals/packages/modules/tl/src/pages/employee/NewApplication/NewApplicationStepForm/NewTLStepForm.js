import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import { newConfig } from "../../../../config/newConfig";
import { SET_tlNewApplication } from "../../../../redux/action/tlNewApplicationActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";

//Config for steps
const createEmployeeConfig = [
  {
    head: "Traid Details",
    stepLabel: "Traid Details",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "TLNewFormStepOne",
    key: "TraidDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "Owner Details",
    stepLabel: "Owner Details",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "TLNewFormStepTwo",
    key: "OwnerDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "Documents",
    stepLabel: "Documents",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "TLNewFormStepThree",
    key: "Documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_BUTTON_SUBMIT",
    }, 
  },
  {
    head: "Summary",
    stepLabel: "Summary",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "TLNewSummaryStepFour",
    key: "SummaryTL",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Submit",
    },
  },
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: newConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const NewTLStepForm = () => {
  const history=useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.tl.tlNewApplicationForm);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const setStep = (updatedStepNumber) => {
    dispatch(SET_tlNewApplication(updatedStepNumber));
  };

  // console.log("formData",formData);

  const handleSubmit = () => {
    //const data = { ...formData.employeeDetails, ...formData.administrativeDetails };
    // let data = {};
    // createEmployeeConfig.forEach((config) => {
    //   if (config.isStepEnabled) {
    //     data = { ...data, ...formData[config.key] };
    //   }
    // });
    // onSubmit(data, tenantId, setShowToast, history);
  };

  // console.log("formState: ",formState);
  return (
    <div className="pageCard">
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

export default NewTLStepForm;