import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, ActionBar, Menu, SubmitBar } from "@mseva/digit-ui-react-components";
import { useState } from "react";
import _ from "lodash";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../../redux/action/RentAndLeaseNewApplicationActions";

const NewRentAndLeaseStepFormFour = ({ config, onGoNext, onBackClick, t: tProp }) => {
  const dispatch = useDispatch();
  const { t: tHook } = useTranslation();
  const t = tProp || tHook;
  const history = useHistory();
  const { triggerToast } = config?.currStepConfig[0];
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const currentStepData = useSelector(function (state) {
    return state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData || {};
  });

  const applicationNumber = currentStepData?.CreatedResponse?.AllotmentDetails?.[0]?.applicationNumber;

  const updatedApplicantDetails = currentStepData?.applicantDetails || {};
  const updatedPropertyDetails = currentStepData?.propertyDetails || {};
  const updatedDocuments = currentStepData?.documents?.documents?.documents || [];

  const onGoToRentAndLease = () => {
    history.push(`/digit-ui/employee/rentandlease/inbox`);
    // const isCitizen = window.location.href.includes("citizen");
    // if (isCitizen) {
    //   history.push(`/digit-ui/citizen/rent-and-lease-home`);
    // } else {
    //   history.push(`/digit-ui/employee/rent-and-lease/inbox`);
    // }
  };

  function validateStepData(data) {
    const missingFields = [];
    const notFormattedFields = [];
    return { missingFields, notFormattedFields };
  }

  const isCitizen = window.location.href.includes("citizen");

  const onFormValueChange = (setValue = true, data) => {
    const prevStepData = currentStepData[config.key] || {};
    if (!_.isEqual(data, prevStepData)) {
      dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM(config.key, data));
    }
  };

  async function goNext(selectedAction) {
    const { missingFields, notFormattedFields } = validateStepData(currentStepData);

    if (missingFields.length > 0) {
      triggerToast(`Please fill the following field: ${missingFields[0]}`, true);
      return;
    }

    if (notFormattedFields.length > 0) {
      triggerToast(`Please format the following field: ${notFormattedFields[0]}`, true);
      return;
    }

    try {
      const res = await onSubmit(currentStepData, selectedAction);

      if (res?.isSuccess) {
        const action = res?.response?.AllotmentDetails?.[0]?.workflow?.action;
        const status = res?.response?.AllotmentDetails?.[0]?.status;
        if (action == "CANCEL") {
          onGoToRentAndLease();
        } else if (status == "DRAFTED" || status == "INITIATED" || action == "DRAFT" || action == "SAVEASDRAFT" || action == "SAVEDRAFT") {
          triggerToast(t("RAL_SAVEDASDRAPT_MESSAGE"));
          setTimeout(() => {
            onGoToRentAndLease();
          }, 2000);
        } else {
          history.replace(`/digit-ui/${isCitizen ? "citizen" : "employee"}/rentandlease/response/${applicationNumber}`, {
            applicationData: currentStepData?.CreatedResponse,
          });
        }
      } else {
        triggerToast(t(res?.Errors?.message || "Update failed"), true);
      }
    } catch (error) {
      triggerToast(t(error?.message || "Update failed"), true);
    }
  }

  const { id } = useParams();

  const onSubmit = async (data, selectedAction) => {
    const { CreatedResponse } = data;
    const { workflow: existingWorkflow } = CreatedResponse || {};

    let formData = {};

    if (id) {
      // EDIT FLOW: Merge updated form data
      const originalOwners = CreatedResponse?.AllotmentDetails?.[0]?.OwnerInfo || [];
      const updatedApplicants = updatedApplicantDetails?.applicants || [];

      const mergedOwnerInfo = updatedApplicants.map((applicant, index) => {
        const originalOwner = originalOwners[index] || {};
        return {
          ...originalOwner,
          name: applicant?.name,
          mobileNo: applicant?.mobileNumber,
          emailId: applicant?.emailId,
          additionalDetails: {
            ...originalOwner?.additionalDetails,
            panDocument: applicant?.panDocument,
            aadhaarDocument: applicant?.aadhaarDocument,
          },
          correspondenceAddress: {
            ...originalOwner?.correspondenceAddress,
            pincode: applicant?.pincode,
            addressId: applicant?.address,
            address: applicant?.address,
          },
          permanentAddress: {
            ...originalOwner?.permanentAddress,
            pincode: applicant?.pincode,
            addressId: applicant?.address,
            address: applicant?.address,
          },
        };
      });

      const rawAdditionalDetails = CreatedResponse?.AllotmentDetails?.[0]?.additionalDetails || {};
      const originalAdditionalDetails = Array.isArray(rawAdditionalDetails) ? rawAdditionalDetails[0] : rawAdditionalDetails;

      const mergedAdditionalDetails = {
        ...originalAdditionalDetails,
        ...updatedPropertyDetails,
        allotmentType: updatedPropertyDetails?.propertyType?.code || originalAdditionalDetails?.allotmentType,
        propertyType: updatedPropertyDetails?.propertySpecific?.code || originalAdditionalDetails?.propertyType,
        locationType: updatedPropertyDetails?.locationType?.code || originalAdditionalDetails?.locationType,
      };

      // Get the allotmentId from CreatedResponse for new documents
      const allotmentIdForNewDocs = CreatedResponse?.AllotmentDetails?.[0]?.id;

      formData = {
        ...CreatedResponse?.AllotmentDetails?.[0],
        startDate: updatedPropertyDetails?.startDate
          ? new Date(updatedPropertyDetails?.startDate).getTime()
          : CreatedResponse?.AllotmentDetails?.[0]?.startDate,
        endDate: updatedPropertyDetails?.endDate
          ? new Date(updatedPropertyDetails?.endDate).getTime()
          : CreatedResponse?.AllotmentDetails?.[0]?.endDate,
        penaltyType: updatedPropertyDetails?.penaltyType || CreatedResponse?.AllotmentDetails?.[0]?.penaltyType,
        OwnerInfo: mergedOwnerInfo,
        additionalDetails: [mergedAdditionalDetails],
        propertyId: updatedPropertyDetails?.propertyId || updatedPropertyDetails?.selectedProperty?.propertyId,
        Document: updatedDocuments.map((doc) => {
          const originalDoc =
            (CreatedResponse?.AllotmentDetails?.[0]?.Document || [])?.find(
              (d) => d.documentUid === doc?.documentUid || d.fileStoreId === doc?.fileStoreId || d.documentType === doc?.documentType
            ) || {};

          // Check if this is a new document (not found in original documents)
          const isNewDocument = !originalDoc?.documentUid && !originalDoc?.fileStoreId;

          // Get docId and allotmentId
          const docId = doc?.docId || originalDoc?.docId;
          const allotmentId = doc?.allotmentId || originalDoc?.allotmentId || (isNewDocument ? allotmentIdForNewDocs : undefined);

          return {
            documentType: doc?.documentType || originalDoc?.documentType || "",
            fileStoreId: doc?.fileStoreId || originalDoc?.fileStoreId || "",
            documentUid: doc?.documentUid || originalDoc?.documentUid,
            id: doc?.id || originalDoc?.id,
            // Only include docId if it exists (backend generates it for new documents)
            ...(docId ? { docId } : {}),
            // Always include allotmentId (use parent allotment ID for new documents)
            ...(allotmentId ? { allotmentId } : {}),
            active: true,
          };
        }),
        workflow: {
          ...existingWorkflow,
          action: selectedAction?.action || "",
          comments: "",
          assignees: [],
          documents: [],
        },
      };
    } else {
      // NORMAL FLOW: Use original logic
      const originalOwners = CreatedResponse?.AllotmentDetails?.[0]?.OwnerInfo || [];
      const updatedApplicants = updatedApplicantDetails?.applicants || [];

      const mergedOwnerInfo = updatedApplicants.map((applicant, index) => {
        const originalOwner = originalOwners[index] || {};
        return {
          ...originalOwner,
          name: applicant?.name,
          mobileNo: applicant?.mobileNumber,
          emailId: applicant?.emailId,
          additionalDetails: {
            ...originalOwner?.additionalDetails,
            panDocument: applicant?.panDocument,
            aadhaarDocument: applicant?.aadhaarDocument,
          },
          correspondenceAddress: {
            ...originalOwner?.correspondenceAddress,
            pincode: applicant?.pincode,
            addressId: applicant?.address,
            address: applicant?.address,
          },
          permanentAddress: {
            ...originalOwner?.permanentAddress,
            pincode: applicant?.pincode,
            addressId: applicant?.address,
            address: applicant?.address,
          },
        };
      });

      const rawAdditionalDetails = CreatedResponse?.AllotmentDetails?.[0]?.additionalDetails || {};
      const originalAdditionalDetails = Array.isArray(rawAdditionalDetails) ? rawAdditionalDetails[0] : rawAdditionalDetails;

      const mergedAdditionalDetails = {
        ...originalAdditionalDetails,
        ...updatedPropertyDetails,
        allotmentType: updatedPropertyDetails?.propertyType?.code || originalAdditionalDetails?.allotmentType,
        propertyType: updatedPropertyDetails?.propertySpecific?.code || originalAdditionalDetails?.propertyType,
        locationType: updatedPropertyDetails?.locationType?.code || originalAdditionalDetails?.locationType,
      };

      formData = {
        ...CreatedResponse?.AllotmentDetails?.[0],
        startDate: updatedPropertyDetails?.startDate
          ? new Date(updatedPropertyDetails?.startDate).getTime()
          : CreatedResponse?.AllotmentDetails?.[0]?.startDate,
        endDate: updatedPropertyDetails?.endDate
          ? new Date(updatedPropertyDetails?.endDate).getTime()
          : CreatedResponse?.AllotmentDetails?.[0]?.endDate,
        penaltyType: updatedPropertyDetails?.penaltyType || CreatedResponse?.AllotmentDetails?.[0]?.penaltyType,
        OwnerInfo: mergedOwnerInfo,
        additionalDetails: [mergedAdditionalDetails],
        propertyId: updatedPropertyDetails?.propertyId || updatedPropertyDetails?.selectedProperty?.propertyId,
        Document: updatedDocuments.map((doc) => {
          const originalDoc =
            (CreatedResponse?.AllotmentDetails?.[0]?.Document || [])?.find(
              (d) => d.documentUid === doc?.documentUid || d.fileStoreId === doc?.fileStoreId || d.documentType === doc?.documentType
            ) || {};

          const docId = doc?.docId || originalDoc?.docId;
          const allotmentId = doc?.allotmentId || originalDoc?.allotmentId;

          return {
            documentType: doc?.documentType || originalDoc?.documentType || "",
            fileStoreId: doc?.fileStoreId || originalDoc?.fileStoreId || "",
            ...(docId ? { docId } : {}),
            ...(allotmentId ? { allotmentId } : {}),
            active: true,
          };
        }),
        workflow: {
          ...existingWorkflow,
          action: selectedAction?.action || "",
          comments: "",
          status: selectedAction?.action || "",
        },
      };
    }

    // Adapt this to your actual service call
    const response = await Digit.RentAndLeaseService.update({ AllotmentDetails: [formData] }, tenantId);
    if (response?.AllotmentDetails && response?.AllotmentDetails.length > 0) {
      return { isSuccess: true, response: { RentAndLeaseApplications: response.AllotmentDetails } };
    } else if (response?.ResponseInfo?.status === "successful") {
      return { isSuccess: true, response };
    } else {
      return { isSuccess: false, response };
    }
  };

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const menuRef = useRef();
  let user = Digit.UserService.getUser();
  const [displayMenu, setDisplayMenu] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const businessService = "RENT_N_LEASE_NEW";
  // Adapt workflow details hook for RentAndLease
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: applicationNumber,
    moduleCode: businessService,
  });

  const userRoles = user?.info?.roles?.map((e) => e.code);
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  function onActionSelect(action) {
    goNext(action);
  }

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      <ActionBar>
        <SubmitBar label={t("CS_COMMON_BACK")} onSubmit={() => onGoBack(currentStepData)} />

        {displayMenu && actions && actions.length > 0 ? (
          // <Menu options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
          <Menu localeKeyPrefix={t(`WF_${"RENTANDLEASE"}`)} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
        ) : null}

        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>
    </React.Fragment>
  );
};

export default NewRentAndLeaseStepFormFour;
