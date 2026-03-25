import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
// import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { citizenConfig } from "../../config/Create/citizenStepperConfig";
import { SET_PTNewApplication_STEP, RESET_PT_NEW_APPLICATION_FORM, UPDATE_PTNewApplication_FORM } from "../../redux/action/PTNewApplicationActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { Loader } from "../../components/Loader";
import { mapPropertyToFormData } from "./mapPropertyToFormData";

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
  // {
  //   head: "DOCUMENT DETAILS",
  //   stepLabel: "ES_TITILE_DOCUMENT_DETAILS",
  //   stepNumber: 1,
  //   isStepEnabled: true,
  //   type: "component",
  //   component: "NewPTStepFormOne",
  //   key: "documents",
  //   withoutLabel: true,
  //   texts: {
  //     submitBarLabel: "CS_COMMON_NEXT",
  //   },
  // },
  {
    head: "PROPERTY DETAILS",
    stepLabel: "PT_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "NewPTStepFormTwo",
    key: "propertyDetails",
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
    component: "NewPTStepFormThree",
    key: "ownerDetails",
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
    component: "NewPTStepFormFour",
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
    component: "NewPTStepFormFive",
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
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.pt.PTNewApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  // Edit mode detection
  const isEditMode = window.location.pathname.includes("edit-application");
  const pathParts = window.location.pathname.split("/");
  const propertyId = isEditMode ? decodeURIComponent(pathParts[pathParts.length - 1]) : null;
  const [editDataLoaded, setEditDataLoaded] = useState(false);

  // Fetch property data for edit mode
  const { isLoading: isPropertyLoading, data: propertySearchData } = Digit.Hooks.pt.usePropertySearch(
    { tenantId, filters: { propertyIds: propertyId } },
    { enabled: isEditMode && !!propertyId && !editDataLoaded }
  );

  // Pre-fill form with property data when in edit mode
  useEffect(() => {
    if (isEditMode && propertySearchData?.Properties?.length > 0 && !editDataLoaded) {
      const property = propertySearchData.Properties[0];
      const mappedData = mapPropertyToFormData(property);
      if (mappedData) {
        Object.keys(mappedData).forEach((key) => {
          dispatch(UPDATE_PTNewApplication_FORM(key, mappedData[key]));
        });
        dispatch(SET_PTNewApplication_STEP(1));
        setEditDataLoaded(true);
      }
    }
  }, [propertySearchData, isEditMode, editDataLoaded, dispatch]);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_PTNewApplication_STEP(updatedStepNumber));
  };

  const handleSubmit = () => {};

  useEffect(() => {
    const unlisten = history.listen(() => {
      dispatch(RESET_PT_NEW_APPLICATION_FORM());
    });

    return () => unlisten();
  }, [history, dispatch]);

  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t(isEditMode ? "PT_EDIT_PROPERTY" : "PT_CREATE_PROPERTY")}
      </CardHeader>
      <Stepper stepsList={updatedCreateEmployeeconfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {isPropertyLoading && <Loader page={true} />}
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
