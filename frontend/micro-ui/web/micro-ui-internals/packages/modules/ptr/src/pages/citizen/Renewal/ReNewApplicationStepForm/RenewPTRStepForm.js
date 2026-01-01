import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import { citizenConfig } from "../../../../config/Create/renewStepperConfig";
import {
  SET_PTRNewApplication_STEP,
  UPDATE_PTRNewApplication_FORM,
  RESET_PTR_NEW_APPLICATION_FORM,
} from "../../../../redux/action/PTRNewApplicationActions";
import { mapPTRApplicationDataToDefaultValues } from "../../../../utils/index";

//Config for steps
const createEmployeeConfig = [
  {
    head: "OWNER DETAILS",
    stepLabel: "ES_TITILE_OWNER_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "RenewPTRStepFormOne",
    key: "ownerDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "PET DETAILS",
    stepLabel: "ES_TITILE_PET_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "NewPTRStepFormTwo",
    key: "petDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENT DETAILS",
    stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "NewPTRStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SUMMARY DETAILS",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "NewPTRStepFormFour",
    key: "summary",
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

const RenewPTRStepForm = () => {
  const history = useHistory();
  const formData = formState.formData;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.ptr.PTRNewApplicationFormReducer);
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [defaultValues, setDefaultValues] = useState(null);
  console.log("defaultValues", defaultValues);
  console.log("formStatePTR: ", formState);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_PTRNewApplication_STEP(updatedStepNumber));
  };

  useEffect(() => {
    dispatch(RESET_PTR_NEW_APPLICATION_FORM());
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

  const { applicationNumber } = useParams();
  // const userInfo = Digit.UserService.getUser();
  // const args = {};
  console.log("Application Number:", applicationNumber);
  const { data, isLoading, error, isSuccess } = Digit.Hooks.ptr.usePtrApplicationDetail(
    t,
    tenantId,
    applicationNumber
    // {
    //   enabled: !!applicationNumber, // react-query config
    //   staleTime: 300000,
    // }
    // userInfo?.info?.type,
    // args
  );

  console.log("Data", data);
  const applicationData = data?.applicationData?.applicationData;
  console.log("applicationData", applicationData);

  useEffect(() => {
    if (applicationData) {
      const mappedValues = mapPTRApplicationDataToDefaultValues(applicationData, t);
      console.log(mappedValues, "mappedValues");
      setDefaultValues(mappedValues);
    }
  }, [applicationData]);

  useEffect(() => {
    if (defaultValues) {
      const updatedDefaultValues = JSON.parse(JSON.stringify(defaultValues));
      Object.entries(updatedDefaultValues).forEach(([key, value]) => {
        dispatch(UPDATE_PTRNewApplication_FORM(key, value));
      });
    }
  }, [defaultValues]);

  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("PET_RENEWAL_APPLICATION")}
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

export default RenewPTRStepForm;
