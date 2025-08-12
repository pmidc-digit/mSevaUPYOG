import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
// import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { citizenConfig } from "../../config/Create/citizenStepperConfig";
import { SET_CHBApplication_STEP, RESET_CHB_APPLICATION_FORM } from "../../redux/action/CHBApplicationActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";

//Config for steps
const createEmployeeConfig = [
  {
    head: "Citizen DETAILS",
    stepLabel: "GC_TITILE_CITIZEN_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "CHBStepFormOne",
    key: "citizenDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "Property Details",
    stepLabel: "GC_Property_Details",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "CHBStepFormTwo",
    key: "propertyDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "FEE/BILLING DETAILS",
    stepLabel: "GC_TITILE_FEE_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "CHBStepFormThree",
    key: "feeDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "NOTIFICATION AND ALERTS",
    stepLabel: "ES_TITILE_ALLERT_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "CHBStepFormFour",
    key: "notificationDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENTS DETAILS",
    stepLabel: "GC_TITILE_DOCUMENT_DETAILS",
    stepNumber: 5,
    isStepEnabled: true,
    type: "component",
    component: "NewGCStepFormFive",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },

  // NewPTRStepFormTwo
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: citizenConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

// console.log("updatedCreateEmployeeconfig: ", updatedCreateEmployeeconfig);

const NewADSStepperForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.gc.gcApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const formAllStates = useSelector((state) => state);
  console.log("formAllStates: ", formAllStates);
  // console.log("formStatePTR: ", formState);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_CHBApplication_STEP(updatedStepNumber));
  };

  useEffect(() => {
    dispatch(RESET_CHB_APPLICATION_FORM());
  }, []);

  // console.log("formData",formData);

  const handleSubmit = (dataGet) => {
    console.log("dataGet===", dataGet);
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
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("GC_REGISTRATION_APPLICATION")}
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

export default NewADSStepperForm;
