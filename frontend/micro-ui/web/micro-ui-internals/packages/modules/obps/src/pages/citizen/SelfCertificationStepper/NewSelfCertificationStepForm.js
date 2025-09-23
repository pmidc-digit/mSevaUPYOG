import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
import { config } from "../../../config/selfCertificationConfig";
import { SET_OBPS_STEP, UPDATE_OBPS_FORM, RESET_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";

const createEmployeeConfig = [
  {
    head: "Basic Details",
    stepLabel: "Basic Details",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "NewSelfCertificationStepFormOne",
    key: "BasicDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "Plot Details",
    stepLabel: "Plot Details",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "NewSelfCertificationStepFormTwo",
    key: "PlotDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "Scrutiny Details",
    stepLabel: "Scrutiny Details",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "NewSelfCertificationStepFormThree",
    key: "ScrutinyDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "Location Details",
    stepLabel: "Location Details",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "NewSelfCertificationStepFormFour",
    key: "LocationDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "Additional Details",
    stepLabel: "Additional Details",
    stepNumber: 5,
    isStepEnabled: true,
    type: "component",
    component: "NewSelfCertificationStepFormFive",
    key: "AdditionalDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "Owner Details",
    stepLabel: "Owner Details",
    stepNumber: 6,
    isStepEnabled: true,
    type: "component",
    component: "NewSelfCertificationStepFormSix",
    key: "OwnerDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "Documents Details",
    stepLabel: "Documents Details",
    stepNumber: 7,
    isStepEnabled: true,
    type: "component",
    component: "NewSelfCertificationStepFormSeven",
    key: "DocumentsDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "Summary Details",
    stepLabel: "Summary Details",
    stepNumber: 8,
    isStepEnabled: true,
    type: "component",
    component: "NewSelfCertificationStepFormEight",
    key: "SummaryDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  }
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: config.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

console.log("updatedCreateEmployeeconfig", updatedCreateEmployeeconfig)

export const NewSelfCertificationStepForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.obps.OBPSFormReducer);
  console.log("FORMSTATE-Inital-OBPS", formState)
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

//   const id = window.location.pathname.split("/").pop();

//   const { isLoading, data: applicationDetails } = Digit.Hooks.ndc.useSearchEmployeeApplication({ uuid: id }, tenantId);

//   useEffect(() => {
//     if (applicationDetails?.Applications.length) {
//       dispatch(UPDATE_OBPS_FORM("responseData", applicationDetails?.Applications));
//     }
//   }, [applicationDetails]);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_OBPS_STEP(updatedStepNumber));
  };

  const handleSubmit = () => {};

  useEffect(() => {
    const unlisten = history.listen(() => {
      // route changed
      dispatch(RESET_OBPS_FORM());
      // dispatch(updateNDCForm("reset", {}));
      // dispatch(setNDCStep(1));
    });

    return () => unlisten();
  }, [history, dispatch]);

  return (
    <div className="pageCard">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("bpa_header_application")}
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
