import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
import { cluStepperConfig } from "../../../config/cluStepperConfig";
import { SET_OBPS_STEP, RESET_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";

//Config for steps
const createEmployeeConfig = [
  {
    head: "APPLICATION DETAILS",
    stepLabel: "BPA_APPLICATION_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "CLUStepFormOne",
    key: "applicationDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SITE DETAILS",
    stepLabel: "BPA_SITE_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "CLUStepFormTwo",
    key: "siteDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENT DETAILS",
    stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "CLUStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SUMMARY DETAILS",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "CLUStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },

];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: cluStepperConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

// console.log("updatedCreateEmployeeconfig: ", updatedCreateEmployeeconfig);

const CLUStepperForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.obps.OBPSFormReducer);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  // console.log("formStatePTR: ", formState);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_OBPS_STEP(updatedStepNumber));
  };

  useEffect(() => {
    dispatch(RESET_OBPS_FORM());
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // console.log("formData",formData);

  const handleSubmit = (dataGet) => {

  };

  // console.log("formState: ",formState);
  return (
    <div className="card">
      <CardHeader divider={true}>
        {t("BPA_CHANGE_OF_LAND_REGISTRATION_APPLICATION")}
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

export default CLUStepperForm;
