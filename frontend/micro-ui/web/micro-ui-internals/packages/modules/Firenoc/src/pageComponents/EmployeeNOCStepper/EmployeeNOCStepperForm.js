import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { stepperConfig } from "../../config/Create/stepperConfig";
import { SET_NOCNewApplication_STEP, RESET_NOC_NEW_APPLICATION_FORM } from "../../redux/action/NOCNewApplicationActions";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";

const createEmployeeConfig = [
  {
    head: "NOC DETAILS",
    stepLabel: "NOC_NOC_DETAILS_HEADER",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCEmployeeStepFormNocDetails",
    key: "nocDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "PROPERTY DETAILS",
    stepLabel: "NOC_PROPERTY_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCEmployeeStepFormTwo",
    key: "siteDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "APPLICANT DETAILS",
    stepLabel: "NOC_APPLICANT_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCEmployeeStepFormOne",
    key: "applicationDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENT DETAILS",
    stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCEmployeeStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SUMMARY DETAILS",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 5,
    isStepEnabled: true,
    type: "component",
    component: "FIRENOCEmployeeStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: stepperConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const EmployeeNOCStepperForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.noc.NOCNewApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const setStep = (updatedStepNumber) => {
    dispatch(SET_NOCNewApplication_STEP(updatedStepNumber));
  };

  useEffect(() => {
    dispatch(RESET_NOC_NEW_APPLICATION_FORM());
    return () => {
      dispatch(RESET_NOC_NEW_APPLICATION_FORM());
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const handleSubmit = (dataGet) => {};

  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("NOC_REGISTRATION_APPLICATION")}
      </CardHeader>
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

export default EmployeeNOCStepperForm;
