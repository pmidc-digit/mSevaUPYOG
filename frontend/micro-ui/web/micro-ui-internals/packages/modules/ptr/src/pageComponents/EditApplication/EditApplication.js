import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import { UPDATE_PTRNewApplication_FORM, RESET_PTR_NEW_APPLICATION_FORM } from "../../redux/action/PTRNewApplicationActions";
import { Loader } from "@mseva/digit-ui-react-components";

//
// import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { citizenConfig } from "../../config/Create/citizenStepperConfig";
import { SET_PTRNewApplication_STEP } from "../../redux/action/PTRNewApplicationActions";
// import { onSubmit } from "../utils/onSubmitCreateEmployee";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";

//Config for steps
const createEmployeeConfig = [
  {
    head: "OWNER DETAILS",
    stepLabel: "ES_TITILE_OWNER_DETAILS",
    stepNumber: 1,
    isStepEnabled: true,
    type: "component",
    component: "NewPTRStepFormOne",
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
];

const updatedCreateEmployeeconfig = createEmployeeConfig.map((item) => {
  return { ...item, currStepConfig: citizenConfig.filter((newConfigItem) => newConfigItem.stepNumber === item.stepNumber) };
});

const EditApplication = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const formState = useSelector((state) => state.ptr.PTRNewApplicationFormReducer);
  const formData = formState.formData;
  const step = formState.step;

  let tenantId;
  if (window.location.pathname.includes("employee")) {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  } else {
    tenantId = window.localStorage.getItem("CITIZEN.CITY") || Digit.ULBService.getCurrentTenantId();
  }
  const { data: mdmsPetData } = Digit.Hooks.ptr.usePTRPetMDMS(tenantId);

  const { id } = useParams();

  const setStep = (updatedStepNumber) => {
    dispatch(SET_PTRNewApplication_STEP(updatedStepNumber));
  };

  useEffect(() => {
    // dispatch(RESET_PTR_NEW_APPLICATION_FORM());
    dispatch(SET_PTRNewApplication_STEP(1));
  }, [dispatch]);
  const { isLoading, data: applicationDetails } = Digit.Hooks.ptr.usePTRSearch({
    tenantId,
    filters: { applicationNumber: id },
    config: { staleTime: 0, refetchOnMount: "always" },
  });

  useEffect(() => {
    if (!isLoading && mdmsPetData && applicationDetails?.PetRegistrationApplications?.[0]) {
      const petObject = applicationDetails.PetRegistrationApplications[0];
      const ownerDetailsFromAPI = petObject.owner || {};
      const toDateOrNull = (val) => (val && Number(val) > 0 ? new Date(Number(val)) : null);

      // Map API codes to MDMS objects
      const petTypeObj = mdmsPetData?.petTypes?.find((pt) => pt.name === petObject.petDetails?.petType) || null;
      const breedTypeObj = mdmsPetData?.breedTypes?.find((bt) => bt.name === petObject.petDetails?.breedType) || null;
      const genderTypeObj = mdmsPetData?.genderTypes?.find((gt) => gt.name === petObject.petDetails?.petGender) || null;
      const formatDateOrNull = (val) => (val && Number(val) > 0 ? new Date(Number(val)).toLocaleDateString() : null);
      const petDetailsFromAPI = {
        ...petObject.petDetails,
        petType: petTypeObj,
        breedType: breedTypeObj,
        petGender: genderTypeObj,
        lastVaccineDate: petObject.petDetails?.lastVaccineDate,
        adoptionDate: formatDateOrNull(petObject.petDetails?.adoptionDate),
        birthDate: formatDateOrNull(petObject.petDetails?.birthDate),
      };

      const documentsFromAPI = petObject.documents || [];
      const addressFromAPI = petObject.address || {};

      const formattedDocuments = {
        documents: {
          documents: documentsFromAPI.map((doc) => ({
            documentType: doc?.documentType || "",
            id: doc?.id || "",
            uuid: doc?.id || "",
            documentUid: doc?.documentUid || doc?.filestoreId || "",
            documentAttachment: doc?.filestoreId || "",
            filestoreId: doc?.filestoreId || "",
          })),
        },
      };

      const [firstName = "", lastName = ""] = (ownerDetailsFromAPI.name || "").split(" ");

      const ownerWithAddress = {
        ...ownerDetailsFromAPI,
        firstName,
        lastName,
        pincode: addressFromAPI.pincode || "",
        address: addressFromAPI.addressId || "",
      };

      dispatch(UPDATE_PTRNewApplication_FORM("ownerDetails", ownerWithAddress));
      dispatch(UPDATE_PTRNewApplication_FORM("petDetails", petDetailsFromAPI));
      dispatch(UPDATE_PTRNewApplication_FORM("documents", formattedDocuments));
      dispatch(UPDATE_PTRNewApplication_FORM("apiData", applicationDetails));
      dispatch(UPDATE_PTRNewApplication_FORM("CreatedResponse", petObject));
      dispatch(UPDATE_PTRNewApplication_FORM("applicationData", petObject));
    }
  }, [isLoading, applicationDetails, mdmsPetData]);

  if (isLoading || !formData.ownerDetails) {
    return <Loader />;
  }

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
        {t("PET_REGISTRATION_APPLICATION")}
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

export default EditApplication;
