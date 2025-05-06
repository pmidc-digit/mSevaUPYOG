import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import { newConfig } from "../../../../config/Create/stepFormConfigCitizen";
import { SET_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { useLocation } from "react-router-dom/cjs/react-router-dom";

//Config for steps
const createEmployeeConfig = [
  {
    head: "Personal Details",
    stepLabel: "Property Address", //"HR_EMPLOYEE_DETAILS_STEP_LABEL",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "PTNewFormStepOneCitizen",
    key: "PersonalDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "ES_NEW_APPLICATION_PROPERTY_ASSESSMENT",
    stepLabel: "Property Assesment",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "PTNewFormStepTwoCitizen",
    key: "PropertyDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "ES_NEW_APPLICATION_OWNERSHIP_DETAILS",
    stepLabel: "Owner Details",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "PTNewFormStepThreeCitizen",
    key: "ownerShipDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "ES_NEW_APPLICATION_DOCUMENTS_REQUIRED",
    stepLabel: "Document Info",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "PTNewFormStepFourCitizen",
    key: "DocummentDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "Summary",
    stepLabel: "Summary",
    stepNumber: 5,
    isStepEnabled: true,
    type: "component",
    component: "PTNewFormSummaryStepFiveCitizen",
    key: "PTSummary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Submit",
    },
  },
];

let updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: newConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const CreateEmployeeStepForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.pt.PTNewApplicationForm);
  const formData = formState.formData;
  const step = location?.state?.edit === true ? location?.state?.currentStepNumber : formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  useEffect(() => {
    if (location?.state?.edit === true) {
      // updatedCreateEmployeeconfig= createEmployeeConfig.filter((item)=>item.stepNumber===location.state.currentStepNumber)
    }
  }, []);

  useEffect(() => {
    console.log("checking data in everystep===", formData);
  }, [formData]);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_PtNewApplication(updatedStepNumber));
  };

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

  return (
    <div className="pageCard">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("HR_COMMON_CREATE_EMPLOYEE_HEADER")}
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

export default CreateEmployeeStepForm;
