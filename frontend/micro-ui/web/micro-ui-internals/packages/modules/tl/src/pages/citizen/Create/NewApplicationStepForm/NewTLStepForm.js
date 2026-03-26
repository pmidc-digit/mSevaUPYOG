import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
//
import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import { config } from "../../../../config/citizen/NewApplicationStepFormConfig";
import { SET_tlNewApplication, RESET_tlNewApplicationForm, UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import { mapApplicationDataToDefaultValues } from "../../../../utils/mapApplicationDataToDefaultValues";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { Loader } from "../../../../components/Loader";

//Config for steps
const createEmployeeConfig = [
  {
    head: "",
    stepLabel: "Trade Details",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "TLNewFormStepOneCitizen",
    key: "TraidDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "TL_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "Owner Details",
    stepLabel: "Owner Details",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "TLNewFormStepTwoCitizen",
    key: "OwnerDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "TL_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "Documents",
    stepLabel: "Documents",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "TLNewFormStepThreeCitizen",
    key: "Documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "TL_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "Summary",
    stepLabel: "Summary",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "TLNewSummaryStepFourCitizen",
    key: "SummaryTL",
    withoutLabel: true,
    texts: {
      submitBarLabel: "TL_COMMON_BUTTON_SUBMIT",
    },
  },
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: config.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const NewTLStepForm = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.tl.tlNewApplicationForm);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const resumeAppNo = new URLSearchParams(location.search).get("resume");
  const resumeAppTenantId = new URLSearchParams(location.search).get("appTenantId");
  const [isReduxReady, setIsReduxReady] = useState(!resumeAppNo);

  const { data: resumeSearchResult, isLoading: isResumeLoading } = Digit.Hooks.tl.useTradeLicenseSearch(
    { tenantId: resumeAppTenantId || tenantId, filters: { applicationNumber: resumeAppNo } },
    { enabled: !!resumeAppNo }
  );
  const resumeAppData = resumeSearchResult?.Licenses?.[0];

  const setStep = (updatedStepNumber) => {
    dispatch(SET_tlNewApplication(updatedStepNumber));
  };

  useEffect(() => {
    if (resumeAppNo) return; // Skip reset when resuming an existing application
    dispatch(RESET_tlNewApplicationForm());
  }, []);

  useEffect(() => {
    if (!resumeAppNo || !resumeAppData) return;
    const defaultValues = mapApplicationDataToDefaultValues(resumeAppData, t);
    const updated = JSON.parse(JSON.stringify(defaultValues));
    Object.entries(updated).forEach(([key, value]) => {
      dispatch(UPDATE_tlNewApplication(key, value));
    });
    dispatch(UPDATE_tlNewApplication("CreatedResponse", resumeAppData));
    dispatch(SET_tlNewApplication(1));
    setIsReduxReady(true);
  }, [resumeAppData]);


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

  if (resumeAppNo && (isResumeLoading || !isReduxReady)) return <Loader page={true} />;

  return (
    <div className="employeeCard">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("New Trade License Application")}
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

export default NewTLStepForm;
