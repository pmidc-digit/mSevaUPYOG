import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
import { newConfig } from "../../../components/config/config";
import { setNDCStep } from "../../../redux/actions/NDCFormActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";

//Config for steps
const createEmployeeConfig = [
  {
    head: "APPLICATION_DETAILS",
    stepLabel: "HR_NEW_EMPLOYEE_FORM_HEADER", //"HR_EMPLOYEE_DETAILS_STEP_LABEL",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "PropertyDetailsStep1",
    key: "PropertyDetailsStep1",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_BUTTON_NXT_STEP",
    },
  },
  //   {
  //     head: "PROPERTY_DETAILS",
  //     stepLabel: "ADMIN_DETAILS",
  //     stepNumber: 2,
  //     isStepEnabled: true,
  //     type: "component",
  //     component: "propertyDetails",
  //     key: "propertyDetails",
  //     withoutLabel: true,
  //     texts: {
  //       submitBarLabel: "HR_COMMON_BUTTON_SUBMIT",
  //     },
  //   },
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: newConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const CreateNDCApplicationStep = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.hrms.employeeForm);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const setStep = (updatedStepNumber) => {
    dispatch(setNDCStep(updatedStepNumber));
  };

  const handleSubmit = () => {
    //const data = { ...formData.employeeDetails, ...formData.administrativeDetails };
    let data = {};

    // onSubmit(data, tenantId, setShowToast, history);
  };

  console.log("formState: ", formState);
  return (
    <div className="pageCard">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("HR_COMMON_CREATE_EMPLOYEE_HEADER")}
      </CardHeader>
      <Stepper
        stepsList={updatedCreateEmployeeconfig}
        //   onSubmit={handleSubmit}
        step={step}
        setStep={setStep}
      />
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

export default CreateNDCApplicationStep;
