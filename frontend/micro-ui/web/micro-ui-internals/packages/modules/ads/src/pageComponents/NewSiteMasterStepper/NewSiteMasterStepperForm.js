import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
// import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { SiteMasterConfig } from "../../config/Create/SiteMasterConfig";
import { citizenConfig } from "../../config/Create/citizenStepperConfig";
import { SET_ADSNewApplication_STEP, RESET_ADS_NEW_APPLICATION_FORM } from "../../redux/action/ADSNewApplicationActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
const isEmployee = window.location.href.includes("employee");

//Config for steps

const createEmployeeConfig = [
  {
    head: "PET DETAILS",
    stepLabel: "SITE_MASTER_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "NewSiteMasterFormStepOne",
    key: "pets",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
];


const NewSiteMasterStepperForm = ({ userType }) => {
  const config = createEmployeeConfig;
  const updatedConfig = config.map((item) => {
    return {
      ...item,
      currStepConfig: SiteMasterConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber),
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

  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("ADS_REGISTRATION_APPLICATION")}
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

export default NewSiteMasterStepperForm;
