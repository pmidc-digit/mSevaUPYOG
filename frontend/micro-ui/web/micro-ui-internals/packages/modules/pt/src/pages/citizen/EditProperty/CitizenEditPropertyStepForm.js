import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
import { stepFormEditConfigCitizen } from "../../../config/Mutate/stepFormEditConfigCitizen";
// import { newConfig } from "../../../config/Create/stepFormConfig";
import { SET_PtNewApplication, UPDATE_PtNewApplication } from "../../../redux/actions/PTNewApplicationActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { mapApplicationDataToDefaultValuesForCitizen } from "../../../utils/EditCitizenFormData";

//Config for steps
const createEmployeeConfig = [
  {
    head: "ES_EDIT_APPLICATION_LOCATION_DETAILS",
    stepLabel: "Property Address", //"HR_EMPLOYEE_DETAILS_STEP_LABEL",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "CitizenPTEditFormStepOne",
    key: "LocationDetails1",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "ES_EDIT_APPLICATION_PROPERTY_ASSESSMENT",
    stepLabel: "Property Assesment",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "CitizenPTEditFormStepTwo",
    key: "PropertyDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "ES_EDIT_APPLICATION_OWNERSHIP_DETAILS",
    stepLabel: "Owner Details",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "CitizenPTEditFormStepThree",
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
    component: "CitizenPTEditFormStepFour",
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
    component: "CitizenPTEditFormSummaryStepFive",
    key: "PTSummary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Submit",
    },
  },
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: stepFormEditConfigCitizen.filter((editConfigItem) => editConfigItem.stepNumber === item.stepNumber) };
});

// const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
//   return { ...item, currStepConfig: newConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
// });

const CitizenEditPropertyStepForm = ({ applicationData }) => {
  console.log("applicationData in CitizenEditPropertyStepForm: ", applicationData);
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.pt.PTNewApplicationForm);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const setStep = (updatedStepNumber) => {
    dispatch(SET_PtNewApplication(updatedStepNumber));
  };
  const defaultValues = mapApplicationDataToDefaultValuesForCitizen(applicationData);
  console.log("default Values in CitizenEditPropertyStepForm are: ", defaultValues);

  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_SUCCESS_DATA", {});
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_HAPPENED", false);
  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
  }, []);

  useEffect(() => {
    console.log("deafult vaules in useEffect: ", defaultValues);

    Object.entries(defaultValues).forEach(([key, value]) => {
      dispatch(UPDATE_PtNewApplication(key, value));
    });
  }, []);
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
        {t("ES_EDIT_PROPERTY_APPLICATION_HEADER")}
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

export default CitizenEditPropertyStepForm;