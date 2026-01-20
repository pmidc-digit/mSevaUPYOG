import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import Stepper from "../../../../../../react-components/src/customComponents/Stepper";
import { config } from "../../../config/ocCertificateConfig";
import { SET_OBPS_STEP, UPDATE_OBPS_FORM, RESET_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";


export const OCStepperForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.obps.OBPSFormReducer);
  console.log("FORMSTATE-Inital-OBPS", formState);
  const step = formState.step;
  const isMobile = window.Digit.Utils.browser.isMobile();

  const createEmployeeConfig = [
  {
    head: t("Basic Details"),
    stepLabel: t("Basic Details"),
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "OCStepFormOne",
    key: "BasicDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: t("Plot Details"),
    stepLabel: t("Plot Details"),
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "OCStepFormTwo",
    key: "PlotDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: t("Scrutiny Details"),
    stepLabel: t("Scrutiny Details"),
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "OCStepFormThree",
    key: "ScrutinyDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
//   {
//     head: t("Site Details"),
//     stepLabel: t("Site Details"),
//     stepNumber: 4,
//     isStepEnabled: true,
//     type: "component",
//     component: "NewSelfCertificationStepFormFour",
//     key: "LocationDetails",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "Next",
//     },
//   },
//   {
//     head: t("Additional Details"),
//     stepLabel: t("Additional Details"),
//     stepNumber: 5,
//     isStepEnabled: true,
//     type: "component",
//     component: "NewSelfCertificationStepFormFive",
//     key: "AdditionalDetails",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "Next",
//     },
//   },
//   {
//     head: t("Owner Details"),
//     stepLabel: t("Owner Details"),
//     stepNumber: 6,
//     isStepEnabled: true,
//     type: "component",
//     component: "NewSelfCertificationStepFormSix",
//     key: "OwnerDetails",
//     withoutLabel: true,
//     texts: {
//       submitBarLabel: "Next",
//     },
//   },
  {
    head: t("Documents Details"),
    stepLabel: t("Documents Details"),
    stepNumber: 4,
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
    head: t("Summary Details"),
    stepLabel: t("Summary Details"),
    stepNumber: 5,
    isStepEnabled: true,
    type: "component",
    component: "NewSelfCertificationStepFormEight",
    key: "SummaryDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: config.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

  const setStep = (updatedStepNumber) => {
    dispatch(SET_OBPS_STEP(updatedStepNumber));
  };

  const handleSubmit = () => {};

  useEffect(() => {
    const unlisten = history.listen(() => {
      dispatch(RESET_OBPS_FORM());
    });

    return () => unlisten();
  }, [history, dispatch]);

  return (
    <div className={isMobile?"":"card"}>
      <CardHeader divider={true}>
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