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
    head: "APPLICANT_DETAILS",
    stepLabel: "Applicant Details",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "PropertyDetailsStep1",
    key: "PropertyDetailsStep1",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next Step",
    },
  },
  {
    head: "PROPERTY_DETAILS",
    stepLabel: "Property Details",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "PropertyDetailsStep2",
    key: "PropertyDetailsStep2",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Submit",
    },
  },
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: newConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const CreateNDCApplicationStep = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.ndc.NDCForm);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const setStep = (updatedStepNumber) => {
    dispatch(setNDCStep(updatedStepNumber));
  };

  const handleSubmit = (data) => {
    //const data = { ...formData.employeeDetails, ...formData.administrativeDetails };
    console.log("data=====", data);
    // onSubmit(data, tenantId, setShowToast, history);
  };

  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        No Due Certification Form
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

export default CreateNDCApplicationStep;
