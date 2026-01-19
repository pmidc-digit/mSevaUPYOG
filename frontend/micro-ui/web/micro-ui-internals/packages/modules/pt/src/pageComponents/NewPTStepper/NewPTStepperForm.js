import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
// import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { citizenConfig } from "../../config/Create/citizenStepperConfig";
import { SET_PTNewApplication_STEP, RESET_PT_NEW_APPLICATION_FORM, UPDATE_PTNewApplication_FORM } from "../../redux/action/PTNewApplicationActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { Loader } from "../../components/Loader";

//Config for steps
const createEmployeeConfig = [
  {
    head: "PROPERTY ADDRESS",
    stepLabel: "PROPERTY_ADDRESS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "NewPTStepFormOne",
    key: "propertyAddress",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "PROPERTY DETAILS",
    stepLabel: "PT_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "NewPTStepFormTwo",
    key: "petDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "OWNER DETAILS",
    stepLabel: "ES_TITILE_OWNER_DETAILS",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "NewPTStepFormTwo",
    key: "petDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "DOCUMENTS",
    stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
    stepNumber: 4,
    isStepEnabled: true,
    type: "component",
    component: "NewPTStepFormThree",
    key: "documents",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "SUMMARY",
    stepLabel: "ES_TITILE_SUMMARY_DETAILS",
    stepNumber: 5,
    isStepEnabled: true,
    type: "component",
    component: "NewPTStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },
];

// const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
//   return {
//     ...item,
//     currStepConfig: citizenConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber).map((config) => ({ ...config, isEdit })),
//   };
// });
const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: citizenConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const NewPTStepperForm = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.pt.PTNewApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  // const id = window.location.pathname.split("/").pop();

  const pathParts = window.location.pathname.split("/");
  const id = pathParts.find((part) => part.startsWith("PB-PTR-"));
  console.log("id", id);

  const shouldEnableSearch = Boolean(id && id.startsWith("PB-PTR-"));

  console.log("shouldEnableSearch", shouldEnableSearch);

  // const isEdit = !!id;

  const { isLoading, data: applicationData } = Digit.Hooks.ptr.usePTRSearch({
    tenantId,
    filters: { applicationNumber: id },
    enabled: shouldEnableSearch,
  });

  useEffect(() => {
    if (id && applicationData?.PetRegistrationApplications?.length) {
      dispatch(UPDATE_PTNewApplication_FORM("responseData", applicationData.PetRegistrationApplications));
    }
  }, [applicationData, id, dispatch]);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_PTNewApplication_STEP(updatedStepNumber));
  };

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

  useEffect(() => {
    const unlisten = history.listen(() => {
      // route changed
      dispatch(RESET_PT_NEW_APPLICATION_FORM());
      // dispatch(updateNDCForm("reset", {}));
      // dispatch(setNDCStep(1));
    });

    return () => unlisten();
  }, [history, dispatch]);

  return (
    <div>
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("PT_CREATE_PROPERTY")}
      </CardHeader>
      <Stepper stepsList={updatedCreateEmployeeconfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {isLoading && <Loader page={true} />}
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

export default NewPTStepperForm;
