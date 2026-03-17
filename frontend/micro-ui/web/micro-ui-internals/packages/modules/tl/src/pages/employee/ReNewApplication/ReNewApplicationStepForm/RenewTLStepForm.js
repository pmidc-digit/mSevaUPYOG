import { config } from "../../../../config/employee/RenewApplicationStepFormConfig";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import { SET_tlNewApplication, UPDATE_tlNewApplication, RESET_tlNewApplicationForm } from "../../../../redux/action/TLNewApplicationActions";
import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import cloneDeep from "lodash/cloneDeep";
import { convertEpochToDate, stringReplaceAll } from "../../../../utils";
import { mapApplicationDataToDefaultValues } from "../../../../utils/mapApplicationDataToDefaultValues";
import { Loader } from "../../../../components/Loader";

const renewEmployeeConfig = [
  {
    head: "Trade Details",
    stepLabel: "Trade Details",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "RenewTLFormStepOne",
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
    component: "RenewTLFormStepTwo",
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
    component: "RenewTLFormStepThree",
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
    component: "RenewTLSummaryStepFour",
    key: "SummaryTL",
    withoutLabel: true,
    texts: {
      submitBarLabel: "TL_RENEWAL_BUTTON_SUBMIT",
    },
  },
];

const RenewTLStepForm = (props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const [isReduxReady, setIsReduxReady] = useState(false);
  const { id: applicationNumber } = useParams();

  const isEditApplication = window.location.href.includes("edit-application-details");

  // Attach correct currStepConfig and dynamic submit label
  const updatedRenewEmployeeConfig = useMemo(() => renewEmployeeConfig.map((item) => {
    const stepConfig = {
      ...item,
      currStepConfig: config.filter((conf) => conf.stepNumber === item.stepNumber),
    };
    // For edit (INITIATED) flow, change Step 4 button from "SUBMIT FOR RENEWAL" to "SUBMIT"
    if (item.stepNumber === 4 && isEditApplication) {
      stepConfig.texts = { ...item.texts, submitBarLabel: "TL_COMMON_BUTTON_SUBMIT" };
    }
    return stepConfig;
  }), [isEditApplication]);

  const formState = useSelector((state) => state.tl.tlNewApplicationForm);
  const formData = formState.formData;
  const step = formState.step;

  // Try to get data from route state first
  const stateApplicationData = props?.location?.state?.applicationData;
  const stateApplicationDetails = props?.location?.state?.applicationDetails;
  const hasStateData = !!stateApplicationData?.applicationNumber;

  // Fallback: fetch from API when route state is missing (direct URL navigation / page refresh)
  const tenantIdForSearch = Digit.ULBService.getCurrentTenantId();
  const { data: searchResult, isLoading: isSearchLoading } = Digit.Hooks.tl.useTradeLicenseSearch(
    {
      tenantId: tenantIdForSearch,
      filters: { applicationNumber },
    },
    {
      enabled: !hasStateData && !!applicationNumber,
    }
  );

  const applicationData = hasStateData
    ? cloneDeep(stateApplicationData)
    : cloneDeep(searchResult?.Licenses?.[0]) || {};

  const applicationDetails = stateApplicationDetails || [];

  const propertyId =
    new URLSearchParams(window.location.search).get("propertyId") ||
    applicationDetails.find((details) => details?.title === "PT_DETAILS")?.values?.find((value) => value?.title === "TL_PROPERTY_ID")?.value;

  const tenantId = applicationData?.tenantId || "";
  const isImmovable = applicationData?.tradeLicenseDetail?.structureType?.split(".")[0] === "IMMOVABLE";

  const { data: propertyDetails } = Digit.Hooks.pt.usePropertySearch(
    {
      filters: { propertyIds: propertyId },
      tenantId: tenantId,
    },
    { enabled: isImmovable && !!propertyId }
  );

  const defaultValues = mapApplicationDataToDefaultValues(applicationData, t, propertyId, propertyDetails);

  const hasApplicationData = !!applicationData?.applicationNumber;

  useEffect(() => {
    if (!hasApplicationData) return; // Don't dispatch empty defaults

    // Clear stale Redux state (e.g. CreatedResponse from a previous flow)
    dispatch(RESET_tlNewApplicationForm());

    const updatedDefaultValues = JSON.parse(JSON.stringify(defaultValues));

    // Set financialYear to {} if it exists
    // if (updatedDefaultValues?.TraidDetails?.tradedetils?.length > 0 && updatedDefaultValues.TraidDetails.tradedetils[0].financialYear) {
    //   updatedDefaultValues.TraidDetails.tradedetils[0].financialYear = "";
    // }

    Object.entries(updatedDefaultValues).forEach(([key, value]) => {
      dispatch(UPDATE_tlNewApplication(key, value));
    });
    setIsReduxReady(true);
  }, [hasApplicationData]); // Re-run when application data becomes available


  // useEffect(() => {
  // }, [formData]);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_tlNewApplication(updatedStepNumber));
  };

  const handleSubmit = () => {
    // Final API call after Summary Submit
  };

  // Show loader while fetching data from API or waiting for Redux to be populated
  if (!isReduxReady || (!hasStateData && (isSearchLoading || !hasApplicationData))) {
    return <Loader page={true} />;
  }

  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("ES_TITLE_RENEW_TRADE_LICESE_APPLICATION")}
      </CardHeader>
      <Stepper stepsList={updatedRenewEmployeeConfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {showToast && <Toast error={showToast.key} label={t(showToast.label)} onClose={() => setShowToast(null)} isDleteBtn={"true"} />}
    </div>
  );
};

export default RenewTLStepForm;
