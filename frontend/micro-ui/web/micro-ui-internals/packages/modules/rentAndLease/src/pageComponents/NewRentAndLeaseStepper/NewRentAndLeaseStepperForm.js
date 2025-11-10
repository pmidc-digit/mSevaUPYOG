import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { citizenConfig,employeeConfig } from "../../config/Create/citizenStepperConfig";
import {
  SET_RENTANDLEASE_NEW_APPLICATION_STEP,
  RESET_RENTANDLEASE_NEW_APPLICATION_FORM,
  UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM,
} from "../../redux/action/RentAndLeaseNewApplicationActions";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { Loader } from "../../components/Loader";

//Config for steps
const createApplicationConfig = [
   {
    head: "PROPERTY DETAILS",
    // stepLabel: "ES_TITILE_PROPERTY_DETAILS",
    stepLabel: "Property Details",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "NewRentAndLeaseStepFormOne",
    key: "propertyDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "OWNER DETAILS",
    stepLabel: "ES_TITILE_OWNER_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "NewRentAndLeaseStepFormTwo",
    key: "applicantDetails",
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
    component: "NewRentAndLeaseStepFormThree",
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
    component: "NewRentAndLeaseStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },
];


const createEmployeeConfig = [
   {
    head: "PROPERTY DETAILS",
    // stepLabel: "ES_TITILE_PROPERTY_DETAILS",
    stepLabel: "Property Details",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "NewRentAndLeaseStepFormOne",
    key: "propertyDetails",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_NEXT",
    },
  },
  {
    head: "OWNER DETAILS",
    stepLabel: "ES_TITILE_OWNER_DETAILS",
    stepNumber: 2,
    isStepEnabled: true,
    type: "component",
    component: "NewRentAndLeaseStepFormTwo",
    key: "applicantDetails",
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
    component: "NewRentAndLeaseStepFormThree",
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
    component: "NewRentAndLeaseStepFormFour",
    key: "summary",
    withoutLabel: true,
    texts: {
      submitBarLabel: "CS_COMMON_SUBMIT",
    },
  },
];

const NewRentAndLeaseStepperForm = ({ userType }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer || { formData: {}, step: 1 });
  const formData = formState?.formData || {};
  const step = formState?.step || 1;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const pathParts = window.location.pathname.split("/");
  const id = pathParts.find((part) => part.startsWith("UC-RL-"));
  const shouldEnableSearch = Boolean(id && id.startsWith("UC-RL-"));

  // If you have a search hook for RentAndLease, use it here
  // const { isLoading, data: applicationData } = Digit.Hooks.rentAndLease?.useRentAndLeaseSearch({
  //   tenantId,
  //   filters: { applicationNumber: id },
  //   enabled: shouldEnableSearch,
  // });

  // useEffect(() => {
  //   if (id && applicationData?.RentAndLeaseApplications?.length) {
  //     dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("responseData", applicationData.RentAndLeaseApplications));
  //   }
  // }, [applicationData, id, dispatch]);


   const config = userType === "employee" ? createEmployeeConfig : createApplicationConfig;
  const updatedCreateApplicationConfig = config.map((item) => {
    return {
      ...item,
      currStepConfig: (userType === "employee" ? employeeConfig : citizenConfig).filter(
        (newConfigItem) => newConfigItem.stepNumber === item.stepNumber
      ),
    };
  });

// const updatedCreateApplicationConfig = createApplicationConfig.map((item) => {
//   return { ...item, currStepConfig: citizenConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
// });

  const setStep = (updatedStepNumber) => {
    dispatch(SET_RENTANDLEASE_NEW_APPLICATION_STEP(updatedStepNumber));
  };

  const handleSubmit = () => {
    // Handle final submission if needed
  };

  useEffect(() => {
    const unlisten = history.listen(() => {
      // route changed
      dispatch(RESET_RENTANDLEASE_NEW_APPLICATION_FORM());
    });

    return () => unlisten();
  }, [history, dispatch]);

  return (
    <div className="pageCard">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {/* {t("RENT_AND_LEASE_APPLICATION")} */}
        New Rent and Lease Application
      </CardHeader>
      <Stepper stepsList={updatedCreateApplicationConfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {/* {isLoading && <Loader page={true} />} */}
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

export default NewRentAndLeaseStepperForm;

