import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
// import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { employeeConfig } from "../../config/Create/employeeStepperConfig";
import { citizenConfig } from "../../config/Create/citizenStepperConfig";
import { SET_ADSNewApplication_STEP, RESET_ADS_NEW_APPLICATION_FORM } from "../../redux/action/ADSNewApplicationActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import ReservationTimer from "../ADSReservationsTimer";
const isEmployee = window.location.href.includes("employee");

//Config for steps
const createEmployeeConfig = [
  {
    head: "PET DETAILS",
    stepLabel: "ADS_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "NewADSStepFormTwo",
    key: "ads",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "OWNER DETAILS",
    stepLabel: "ES_APPLICANT_DETAILA",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "NewADSStepFormOne",
    key: "ownerDetails",
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
    component: "NewADSStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  // {
  //   head: "PENALTY DETAILS",
  //   // stepLabel: "ES_TITILE_PENALTY_DETAILS",
  //   stepLabel: "Penalty Details",
  //   stepNumber: 4,
  //   isStepEnabled: true,
  //   type: "component",
  //   component: "NewADSStepFormFour",
  //   key: "penalty",
  //   hideInCitizen: true,
  //   withoutLabel: true,
  //   texts: {
  //     submitBarLabel: "CS_COMMON_NEXT",
  //   },
  // },
  {
    head: "SUMMARY DETAILS",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "NewADSStepFormFive",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },
];

const createCitizenConfig = [
  {
    head: "PET DETAILS",
    stepLabel: "ADS_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "NewADSStepFormTwo",
    key: "ads",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "OWNER DETAILS",
    stepLabel: "ES_APPLICANT_DETAILA",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "NewADSStepFormOne",
    key: "ownerDetails",
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
    component: "NewADSStepFormThree",
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
    component: "NewADSStepFormFive",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },
];

const NewADSStepperForm = ({ userType }) => {
  const config = userType === "employee" ? createEmployeeConfig : createCitizenConfig;
  const updatedConfig = config.map((item) => {
    return {
      ...item,
      currStepConfig: (userType === "employee" ? employeeConfig : citizenConfig).filter(
        (newConfigItem) => newConfigItem.stepNumber === item.stepNumber
      ),
    };
  });
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.ads.ADSNewApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const setStep = (updatedStepNumber) => {
    dispatch(SET_ADSNewApplication_STEP(updatedStepNumber));
  };

  useEffect(() => {
    dispatch(RESET_ADS_NEW_APPLICATION_FORM());
  }, []);

  const handleSubmit = (dataGet) => {
    //const data = { ...formData.employeeDetails, ...formData.administrativeDetails };
    // let data = {};
    // createEmployeeConfig.forEach((config) => {
    //   if (config.isStepEnabled) {
    //     data = { ...data, ...formData[config.key] };
    //   }
    // });
    // onSubmit(data, tenantId, setShowToast, history);
  };

  const createTime = formData?.reservationExpiry;

  return (
    <div className="card">
      <CardHeader className="ads-heading-large" divider={true}>
        {t("ADS_REGISTRATION_APPLICATION")}
        {createTime && (
          <ReservationTimer
            t={t}
            createTime={createTime} // supply when reservation created
          />
        )}
      </CardHeader>
      <Stepper stepsList={updatedConfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
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
