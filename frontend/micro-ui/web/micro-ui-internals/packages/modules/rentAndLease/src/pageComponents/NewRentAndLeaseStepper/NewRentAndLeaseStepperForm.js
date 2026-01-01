import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import Stepper from "../../../../../react-components/src/customComponents/Stepper";
import { citizenConfig, employeeConfig } from "../../config/Create/citizenStepperConfig";
import {
  SET_RENTANDLEASE_NEW_APPLICATION_STEP,
  RESET_RENTANDLEASE_NEW_APPLICATION_FORM,
  UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM,
} from "../../redux/action/RentAndLeaseNewApplicationActions";
import { CardHeader, Toast } from "@mseva/digit-ui-react-components";
import { Loader } from "../../../../challanGeneration/src/components/Loader";

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
  const [loading, setLoading] = useState(false);
  const formState = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer || { formData: {}, step: 1 });
  const formData = formState?.formData || {};
  const step = formState?.step || 1;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const { id } = useParams();

  const triggerToast = (labelKey, isError = false) => {
    setShowToast({ label: labelKey, key: isError });
  };

  const triggerLoader = (status) => {
    setLoading(status);
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      Digit.RentAndLeaseService.search({ tenantId, filters: { applicationNumbers: id } })
        .then((result) => {
          if (result?.AllotmentDetails?.length > 0) {
            const allotmentDetails = result?.AllotmentDetails?.[0];
            dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("responseData", allotmentDetails));

            // ✅ Set CreatedResponse to prevent "create" API call in Step 2
            dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("CreatedResponse", result));

            // --- Map Property Details ---
            const rawAdditionalDetails = allotmentDetails?.additionalDetails || {};
            const apiAdditionalDetails = Array.isArray(rawAdditionalDetails) ? rawAdditionalDetails[0] : rawAdditionalDetails;

            // Create a NEW object for the form, merging root fields and additionalDetails
            const formPropertyDetails = {
              ...apiAdditionalDetails,
              startDate: allotmentDetails?.startDate,
              endDate: allotmentDetails?.endDate,
              penaltyType: allotmentDetails?.penaltyType || apiAdditionalDetails?.penaltyType,
              // latePayment: allotmentDetails?.latePayment || "2%",
              // Add other root fields if they are missing in additionalDetails but needed in form
            };

            // Define Options for Dropdown Mapping
            const propertyTypeOptions = [
              { name: t("ON_RENT"), code: "rent", i18nKey: "rent" },
              { name: t("ON_LEASE"), code: "lease", i18nKey: "lease" },
            ];
            const propertySpecificOptions = [
              { name: t("COMMERCIAL"), code: "Commercial", i18nKey: "Commercial" },
              { name: t("RESIDENTIAL"), code: "Residential", i18nKey: "Residential" },
            ];
            const locationTypeOptions = [
              { name: t("PRIME"), code: "Prime", i18nKey: "Prime" },
              { name: t("NON_PRIME"), code: "Non-Prime", i18nKey: "Non-Prime" },
            ];

            // Map Dropdowns: API String -> Form Object

            // 1. allotmentType (API) -> propertyType (Form)
            if (apiAdditionalDetails.allotmentType) {
              const matchedOption = propertyTypeOptions.find((opt) => opt.code === apiAdditionalDetails.allotmentType);
              formPropertyDetails.propertyType = matchedOption || {
                code: apiAdditionalDetails.allotmentType,
                name: apiAdditionalDetails.allotmentType,
              };
            }

            // 2. propertyType (API) -> propertySpecific (Form)
            if (apiAdditionalDetails.propertyType) {
              const matchedOption = propertySpecificOptions.find((opt) => opt.code === apiAdditionalDetails.propertyType);
              formPropertyDetails.propertySpecific = matchedOption || {
                code: apiAdditionalDetails.propertyType,
                name: apiAdditionalDetails.propertyType,
              };
            }

            // 3. locationType (API) -> locationType (Form)
            if (apiAdditionalDetails.locationType) {
              const matchedOption = locationTypeOptions.find((opt) => opt.code === apiAdditionalDetails.locationType);
              formPropertyDetails.locationType = matchedOption || {
                code: apiAdditionalDetails.locationType,
                name: apiAdditionalDetails.locationType,
              };
            }

            // Format Dates (Timestamp -> YYYY-MM-DD)
            if (formPropertyDetails.startDate) {
              formPropertyDetails.startDate = new Date(formPropertyDetails.startDate).toISOString().split("T")[0];
            }
            if (formPropertyDetails.endDate) {
              formPropertyDetails.endDate = new Date(formPropertyDetails.endDate).toISOString().split("T")[0];
            }

            // ✅ Populate selectedProperty to match Create flow structure
            formPropertyDetails.selectedProperty = {
              ...formPropertyDetails,
            };

            dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", formPropertyDetails));

            // --- Map Applicant Details ---
            const owners = allotmentDetails?.OwnerInfo || [];
            const applicants = owners.map((owner) => ({
              name: owner?.name,
              mobileNumber: owner?.mobileNo,
              emailId: owner?.emailId,
              pincode: owner?.correspondenceAddress?.pincode || owner?.permanentAddress?.pincode,
              address: owner?.correspondenceAddress?.addressId || owner?.permanentAddress?.addressId || "",
            }));

            const ownershipType = applicants.length > 1 ? "MULTIPLE" : "SINGLE";

            dispatch(
              UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("applicantDetails", {
                applicants,
                ownershipType,
              })
            );

            // --- Map Document Details ---
            if (allotmentDetails?.Document?.length > 0) {
              const documents = allotmentDetails.Document.map((doc) => ({
                documentType: doc.documentType,
                fileStoreId: doc.fileStoreId,
                documentUid: doc.documentUid,
                id: doc.id,
                docId: doc?.docId,
                allotmentId: doc?.allotmentId,
              }));
              dispatch(
                UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("documents", {
                  documents: {
                    documents: documents,
                  },
                })
              );
            }
          }
        })
        .catch((e) => {
          triggerToast("CS_COMMON_ERROR", true);
        })
        .finally(() => setLoading(false));
    }
  }, [id, tenantId, dispatch, t]);

  const config = userType === "employee" ? createEmployeeConfig : createApplicationConfig;

  // Build the final step configuration by enriching each step and its fields
  const updatedCreateApplicationConfig = config.map((item) => {
    // Pick the base step config depending on user type (employee vs citizen)
    const baseStepConfig = (userType === "employee" ? employeeConfig : citizenConfig).filter(
      (newConfigItem) => newConfigItem.stepNumber === item.stepNumber
    );

    // Enrich each step config with utility handlers (toast, loader)
    // and also propagate them down to every field in the step body
    const enrichedStepConfig = baseStepConfig.map((stepConf) => ({
      ...stepConf,
      triggerToast,
      triggerLoader,
      body: stepConf.body.map((field) => ({
        ...field,
        triggerToast,
        triggerLoader,
      })),
    }));

    // Return the updated step object with enriched currStepConfig
    return {
      ...item,
      currStepConfig: enrichedStepConfig,
    };
  });

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

  // Auto close toast after 2 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="card">
      <CardHeader styles={{ fontSize: "28px", fontWeight: "400", color: "#1C1D1F" }} divider={true}>
        {t("RENT_AND_LEASE_APPLICATION")}
      </CardHeader>
      <Stepper stepsList={updatedCreateApplicationConfig} onSubmit={handleSubmit} step={step} setStep={setStep} />
      {/* Loader controlled by child via triggerLoader */}
      {loading && <Loader page={true} />}
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
