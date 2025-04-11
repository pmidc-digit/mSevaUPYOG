// renewEmployeeConfig.js

import { newConfig } from "../../../../config/newConfig";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { SET_tlNewApplication, UPDATE_tlNewApplication } from "../../../../redux/action/tlNewApplicationActions";
import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import cloneDeep from "lodash/cloneDeep";
import { convertEpochToDate, stringReplaceAll } from "../../../../utils";
import { mapApplicationDataToDefaultValues } from "../../../../utils/mapApplicationDataToDefaultValues";

const renewEmployeeConfig = [
  {
    head: "Traid Details",
    stepLabel: "Traid Details",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "RenewTLFormStepOne",
    key: "TraidDetailsRenew",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "Owner Details",
    stepLabel: "Owner Details",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "RenewTLFormStepTwo",
    key: "OwnerDetailsRenew",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_BUTTON_NXT_STEP",
    },
  },
  {
    head: "Documents",
    stepLabel: "Documents",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "RenewTLFormStepThree",
    key: "DocumentsRenew",
    withoutLabel: true,
    texts: {
      submitBarLabel: "HR_COMMON_BUTTON_SUBMIT",
    },
  },
  {
    head: "Summary",
    stepLabel: "Summary",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "RenewTLSummaryStepFour",
    key: "SummaryTLRenew",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Submit",
    },
  },
];

// Attach correct currStepConfig
const updatedRenewEmployeeConfig = renewEmployeeConfig.map((item) => {
  return {
    ...item,
    currStepConfig: newConfig.filter((conf) => conf.stepNumber === item.stepNumber),
  };
});

// const RenewTLStepForm = (props) => {
//     const history = useHistory();
//     const { t } = useTranslation();
//     const dispatch = useDispatch();
//     const [showToast, setShowToast] = useState(null);
  
//     const formState = useSelector((state) => state.tl.tlNewApplicationForm);
//     const formData = formState.formData;
//     const step = formState.step;
//     const applicationData = cloneDeep(props?.location?.state?.applicationData) || {};
//     const applicationDetails = props?.location?.state?.applicationDetails || [];
    

//     const defaultValues = mapApplicationDataToDefaultValues(props?.location?.state?.applicationData);
    
        
//     useEffect(() => {
//         console.log("RenewTLStepForm props: ", props);
//         console.log("Default_Values_RenewTL_Stepper_Form: ", defaultValues);
      
//         Object.entries(defaultValues).forEach(([key, value]) => {
//           dispatch(UPDATE_tlNewApplication(key, value));
//         });
//       }, []);


//     useEffect(() => {
//         console.log("RenewTLStepForm formData: ", formData);
//     },[formData])
//     const setStep = (updatedStepNumber) => {
//       dispatch(SET_tlNewApplication(updatedStepNumber));
//     };
  
//     const handleSubmit = () => {
//       // We can trigger final API call here after Summary Submit
//     };
  
//     return (
//       <div className="pageCard">
//         <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
//           {t("TL_RENEW_TRADE_LICENSE")}
//         </CardHeader>
//         <Stepper stepsList={updatedRenewEmployeeConfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
//         {showToast && (
//           <Toast
//             error={showToast.key}
//             label={t(showToast.label)}
//             onClose={() => setShowToast(null)}
//             isDleteBtn={"true"}
//           />
//         )}
//       </div>
//     );
//   };

const RenewTLStepForm = (props) => {
    const history = useHistory();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [showToast, setShowToast] = useState(null);
  
    const formState = useSelector((state) => state.tl.tlNewApplicationForm);
    const formData = formState.formData;
    const step = formState.step;
    const applicationData = cloneDeep(props?.location?.state?.applicationData) || {};
    const applicationDetails = props?.location?.state?.applicationDetails || [];

    const propertyId = new URLSearchParams(window.location.search).get("propertyId") ||
      applicationDetails.find((details) => details?.title === "PT_DETAILS")?.values
        .find((value) => value?.title === "TL_PROPERTY_ID")?.value;

    const tenantId = applicationData?.tenantId || "";
    const isImmovable = applicationData?.tradeLicenseDetail?.structureType?.split(".")[0] === "IMMOVABLE";

    const { data: propertyDetails } = Digit.Hooks.pt.usePropertySearch({
      filters: { propertyIds: propertyId },
      tenantId: tenantId,
    }, { enabled: isImmovable && !!propertyId });

    const defaultValues = mapApplicationDataToDefaultValues(applicationData, t, propertyId, propertyDetails);
        
    useEffect(() => {
        console.log("RenewTLStepForm props: ", props);
        console.log("Default_Values_RenewTL_Stepper_Form: ", defaultValues);
      
        Object.entries(defaultValues).forEach(([key, value]) => {
          dispatch(UPDATE_tlNewApplication(key, value));
        });
      }, []);  // Important to depend on defaultValues

    useEffect(() => {
        console.log("RenewTLStepForm formData: ", formData);
    },[formData])

    const setStep = (updatedStepNumber) => {
      dispatch(SET_tlNewApplication(updatedStepNumber));
    };
  
    const handleSubmit = () => {
      // Final API call after Summary Submit
    };
  
    return (
      <div className="pageCard">
        <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
          {t("TL_RENEW_TRADE_LICENSE")}
        </CardHeader>
        <Stepper stepsList={updatedRenewEmployeeConfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
        {showToast && (
          <Toast
            error={showToast.key}
            label={t(showToast.label)}
            onClose={() => setShowToast(null)}
            isDleteBtn={"true"}
          />
        )}
      </div>
    );
};
  
  export default RenewTLStepForm;  