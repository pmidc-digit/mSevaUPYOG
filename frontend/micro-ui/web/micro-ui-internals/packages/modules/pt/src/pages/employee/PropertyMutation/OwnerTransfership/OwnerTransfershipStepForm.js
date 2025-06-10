import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import { newConfigMutate } from "../../../../config/Mutate/config";
import { SET_PtNewApplication, UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { OwnertransferMapData } from "../../../../utils/OwnertransferMapData";

//Config for steps
const createEmployeeConfig = [
  {
    head: "PT_MUTATION_TRANSFEROR_DETAILS",
    stepLabel: "Transferor Details", //"HR_EMPLOYEE_DETAILS_STEP_LABEL",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "PTOwnerTransfershipStepOne",
    key: "TransferorDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "PT_MUTATION_DOCUMENT_DETAILS",
    stepLabel: "Docuement Details",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "PTOwnerTransfershipStepTwo",
    key: "DocuementDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Next",
    },
  },
  {
    head: "Summary",
    stepLabel: "Summary",
    stepNumber: 3,
    isStepEnabled: true,
    type: "component",
    component: "PTOwnerTransfershipSummaryStepThree",
    key: "PTSummary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "Submit",
    },
  },
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: newConfigMutate.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const CreateEmployeeStepForm = ({ applicationData }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.pt.PTNewApplicationForm);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  // console.log("Form data", formData)
  // console.log("formState: ",formState);
  //console.log("applicationData in ownership transefership", applicationData);
  const defaultValues = OwnertransferMapData(applicationData);
  useEffect(() => {
    console.log("deafult vaules in useEffect ownerTransfer: ", defaultValues);

    Object.entries(defaultValues).forEach(([key, value]) => {
      dispatch(UPDATE_PtNewApplication(key, value));
    });
  }, []);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_PtNewApplication(updatedStepNumber));
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

  return (
    <div className="pageCard">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("HR_COMMON_CREATE_EMPLOYEE_HEADER")}
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

export default CreateEmployeeStepForm;
