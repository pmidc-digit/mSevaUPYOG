import { config } from "../../../../config/citizen/RenewApplicationStepFormConfig";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";

import { SET_tlNewApplication, UPDATE_tlNewApplication } from "../../../../redux/action/TLNewApplicationActions";
import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import { Loader, CardHeader, Toast } from "@mseva/digit-ui-react-components";
import cloneDeep from "lodash/cloneDeep";
import { convertEpochToDate, stringReplaceAll } from "../../../../utils";
import { mapApplicationDataToDefaultValues } from "../../../../utils/mapApplicationDataToDefaultValues";

const renewEmployeeConfig = [
  {
    head: "Trade Details",
    stepLabel: "Trade Details",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "RenewTLFormStepOneCitizen",
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
    component: "RenewTLFormStepTwoCitizen",
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
    component: "RenewTLFormStepThreeCitizen",
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
    component: "RenewTLSummaryStepFourCitizen",
    key: "SummaryTL",
    withoutLabel: true,
    texts: {
      submitBarLabel: "TL_RENEWAL_BUTTON_SUBMIT",
    },
  },
];

// Attach correct currStepConfig
const updatedRenewEmployeeConfig = renewEmployeeConfig.map((item) => {
  return {
    ...item,
    currStepConfig: config.filter((conf) => conf.stepNumber === item.stepNumber),
  };
});

export const RenewTLStepForm = (props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const { id: licenseNo, tenantId } = useParams();

  const formState = useSelector((state) => state.tl.tlNewApplicationForm);
  const formData = formState.formData;
  const step = formState.step;
  // const applicationData = cloneDeep(props?.location?.state?.applicationData) || {};
  const applicationDetails = props?.location?.state?.applicationDetails || [];

  let filter1 = {};

  if (licenseNo) filter1.licenseNumbers = licenseNo;
  if (tenantId) filter1.tenantId = tenantId;
  const { isLoading, isError, error, data } = Digit.Hooks.tl.useTradeLicenseSearch({ filters: filter1 }, { filters: filter1 });

  const applicationData = data?.Licenses?.[0];

  console.log("RenewTLStepForm props: ", formState);

  console.log("applicationData===", applicationData);

  // const propertyId =
  //   new URLSearchParams(window.location.search).get("id") ||
  //   applicationDetails.find((details) => details?.title === "PT_DETAILS")?.values.find((value) => value?.title === "TL_PROPERTY_ID")?.value;

  // const tenantId = applicationData?.tenantId || "";
  const isImmovable = applicationData?.tradeLicenseDetail?.structureType?.split(".")[0] === "IMMOVABLE";
  const propertyId = applicationData?.tradeLicenseDetail?.additionalDetail?.propertyId;

  const { data: propertyDetails } = Digit.Hooks.pt.usePropertySearch(
    {
      filters: { propertyIds: propertyId },
      tenantId: tenantId,
    },
    { enabled: isImmovable && !!propertyId }
  );

  let defaultValues;
  if (applicationData) defaultValues = mapApplicationDataToDefaultValues(applicationData, t, propertyId, propertyDetails);
  console.log("Default_Values_RenewTL_Stepper_Form: ", defaultValues);

  useEffect(() => {
    if (defaultValues) {
      const updatedDefaultValues = JSON.parse(JSON.stringify(defaultValues));
      Object.entries(updatedDefaultValues).forEach(([key, value]) => {
        dispatch(UPDATE_tlNewApplication(key, value));
      });
    }
  }, [applicationData, propertyId, propertyDetails]); // Important to depend on defaultValues

  useEffect(() => {
    console.log("RenewTLStepForm formData: ", formData);
  }, [formData]);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_tlNewApplication(updatedStepNumber));
  };

  const handleSubmit = () => {
    // Final API call after Summary Submit
  };

  return (
    <div className="card">
      {applicationData && (
        <div>
          {isLoading ? (
            <Loader />
          ) : (
            <div>
              <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
                {t("ES_TITLE_RENEW_TRADE_LICESE_APPLICATION")}
              </CardHeader>
              <Stepper stepsList={updatedRenewEmployeeConfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
              {showToast && <Toast error={showToast.key} label={t(showToast.label)} onClose={() => setShowToast(null)} isDleteBtn={"true"} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
