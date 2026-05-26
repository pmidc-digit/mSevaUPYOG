import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
//
import Stepper from "../../../../../../../react-components/src/customComponents/Stepper";
import { newConfigMutate } from "../../../../config/Mutate/config";
import { SET_PTNewApplication_STEP, UPDATE_PTNewApplication_FORM, RESET_PT_NEW_APPLICATION_FORM } from "../../../../redux/action/PTNewApplicationActions";
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
    stepLabel: "Document Details",
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
  const formState = useSelector((state) => state.pt.PTNewApplicationFormReducer);
  console.log("form state",formState)
  const formData = formState?.formData;
  const step = formState?.step;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  // console.log("Form data", formData)
  // console.log("formState: ",formState);
  console.log("applicationData in ownership transefership", applicationData);
  const defaultValues = OwnertransferMapData(applicationData);

  const { data: mutationDocs } = Digit.Hooks.pt.useMDMS(Digit.ULBService.getStateId(), "PropertyTax", "MutationDocuments");

  useEffect(() => {
    console.log("deafult vaules in useEffect ownerTransfer: ", defaultValues);
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        dispatch(UPDATE_PTNewApplication_FORM(key, value));
      });
    }
  }, [applicationData, dispatch]);

  const setStep = (updatedStepNumber) => {
    dispatch(SET_PTNewApplication_STEP(updatedStepNumber));
  };

  const handleSubmit = () => {
    const originalData = formData?.originalData || {};
    const transferorDetails = formData?.TransferorDetails || {};
    const transfereeOwners = transferorDetails?.owners || [];
    const ownershipCategory = transferorDetails?.ownershipCategory || {};
    const additionalDetails = transferorDetails?.additionalDetails || {};

    const activeOriginalOwners = originalData?.owners?.filter((owner) => owner.status === "ACTIVE") || [];

    // Safely extract uploaded documents
    let uploadedDocs = [];
    if (formData?.DocuementDetails?.documents) {
      if (Array.isArray(formData.DocuementDetails.documents)) {
        uploadedDocs = formData.DocuementDetails.documents;
      } else if (Array.isArray(formData.DocuementDetails.documents.documents)) {
        uploadedDocs = formData.DocuementDetails.documents.documents;
      }
    } else if (formData?.documents) {
      if (Array.isArray(formData.documents)) {
        uploadedDocs = formData.documents;
      } else if (Array.isArray(formData.documents.documents)) {
        uploadedDocs = formData.documents.documents;
      }
    }

    // Filter previous documents
    let prevDocs = [];
    if (mutationDocs?.PropertyTax?.MutationDocuments) {
      prevDocs =
        originalData?.documents?.filter(
          (oldDoc) => !mutationDocs.PropertyTax.MutationDocuments.some((mut) => oldDoc.documentType.includes(mut.code))
        ) || [];
    } else {
      prevDocs = originalData?.documents || [];
    }

    const submitData = {
      Property: {
        ...originalData,
        creationReason: "MUTATION",
        owners: [
          ...activeOriginalOwners.map((e) => ({
            ...e,
            landlineNumber: transfereeOwners[0]?.altContactNumber,
            altContactNumber: transfereeOwners[0]?.altContactNumber,
            status: "INACTIVE",
          })),
          ...transfereeOwners.map((owner, index) => {
            let obj = {};
            let gender = typeof owner.gender === "object" ? owner.gender?.code : owner.gender;
            if (!gender || gender === "") gender = null;

            let ownerType = typeof owner.ownerType === "object" ? owner.ownerType?.code : owner.ownerType;
            if (!ownerType || ownerType === "") ownerType = null;

            let relationship = typeof owner.relationship === "object" ? owner.relationship?.code : owner.relationship;
            if (!relationship || relationship === "") relationship = null;

            let institutionType = typeof owner?.institutionType === "object" ? owner.institutionType?.code : owner?.institutionType;
            if (!institutionType || institutionType === "") institutionType = null;

            let additionalOwnerDetails = { ownerSequence: index, ownerName: owner?.name };

            const identityProof = uploadedDocs?.find((e) => e.documentType?.includes("OWNER.IDENTITYPROOF"));
            obj.documents = identityProof ? [identityProof] : [];

            if (owner.documents) {
              let { documentUid, documentType } = owner.documents;
              const docTypeCode = typeof documentType === "object" ? documentType?.code : documentType;
              obj.documents = [...obj.documents, { documentUid, documentType: docTypeCode, fileStoreId: documentUid }];
            }

            return {
              ...owner,
              gender,
              ownerType,
              relationship,
              institutionType,
              landlineNumber: owner?.altContactNumber,
              ...obj,
              status: "ACTIVE",
              additionalDetails: additionalOwnerDetails,
            };
          }),
        ],
        additionalDetails: {
          ...additionalDetails,
          isMutationInCourt: typeof additionalDetails.isMutationInCourt === "object" ? additionalDetails.isMutationInCourt?.code : additionalDetails.isMutationInCourt,
          reasonForTransfer: typeof additionalDetails?.reasonForTransfer === "object" ? additionalDetails?.reasonForTransfer?.code : additionalDetails?.reasonForTransfer,
          isPropertyUnderGovtPossession: typeof additionalDetails?.isPropertyUnderGovtPossession === "object" ? additionalDetails?.isPropertyUnderGovtPossession?.code : additionalDetails?.isPropertyUnderGovtPossession,
          documentDate: additionalDetails?.documentDate ? new Date(additionalDetails?.documentDate).getTime() : null,
          marketValue: Number(additionalDetails?.marketValue),
        },
        ownershipCategory: ownershipCategory?.code,
        documents: [
          ...prevDocs,
          ...uploadedDocs.map((e) =>
            e.documentType.includes("OWNER.TRANSFERREASONDOCUMENT") ? { ...e, documentType: e.documentType.split(".")[2] } : e
          ),
        ],
        workflow: { action: "OPEN", businessService: "PT.MUTATION", moduleName: "PT", tenantId: originalData.tenantId },
      },
    };

    if (submitData.Property.ownershipCategory && !submitData.Property.ownershipCategory.includes("INDIVIDUAL")) {
      submitData.Property.institution = {
        nameOfAuthorizedPerson: transfereeOwners[0]?.name,
        name: transfereeOwners[0]?.institutionName,
        designation: transfereeOwners[0]?.designation,
        tenantId: originalData.tenantId,
        type: typeof transfereeOwners[0]?.institutionType === "object" ? transfereeOwners[0]?.institutionType?.code : transfereeOwners[0]?.institutionType,
      };
    }

    console.log("Submitting mutation data:", submitData);

    // Reset Redux stepper form state
    dispatch(RESET_PT_NEW_APPLICATION_FORM());

    // Redirect to Response page
    history.replace("/digit-ui/employee/pt/response", { Property: submitData.Property, key: "UPDATE", action: "SUBMIT" });
  };

  return (
    <div className="card">
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
