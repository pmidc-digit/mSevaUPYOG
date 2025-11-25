import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast, ActionBar, Menu, SubmitBar } from "@mseva/digit-ui-react-components";
import { useState } from "react";
import _ from "lodash";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM,
} from "../../redux/action/RentAndLeaseNewApplicationActions";

const NewRentAndLeaseStepFormFour = ({ config, onGoNext, onBackClick, t: tProp }) => {
  const dispatch = useDispatch();
  const { t: tHook } = useTranslation();
  const t = tProp || tHook;
  const { path } = useRouteMatch();
  // const [showToast, setShowToast] = useState(false);
  // const [error, setError] = useState("");
  const history = useHistory();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const currentStepData = useSelector(function (state) {
    return state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData || {};
  });

  const updatedApplicantDetails = currentStepData?.applicantDetails || {};
  const updatedPropertyDetails = currentStepData?.propertyDetails || {};
  const updatedDocuments = currentStepData?.documents?.documents?.documents || [];

  const onGoToRentAndLease = () => {
    const isCitizen = window.location.href.includes("citizen");
    if (isCitizen) {
      history.push(`/digit-ui/citizen/rent-and-lease-home`);
    } else {
      history.push(`/digit-ui/employee/rent-and-lease/inbox`);
    }
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
      config?.currStepConfig?.[0]?.triggerToast(`Please fill the following field: ${missingFields[0]}`,true);
      return;
    }

    if (notFormattedFields.length > 0) {
      config?.currStepConfig?.[0]?.triggerToast(`Please format the following field: ${notFormattedFields[0]}`,true);
      return;
    }

    try {
      const res = await onSubmit(currentStepData, selectedAction);

      if (res?.isSuccess) {
        const action = res?.response?.RentAndLeaseApplications?.[0]?.workflow?.action;
        if (action == "CANCEL") {
          onGoToRentAndLease();
        } else if (action == "SAVEASDRAFT") {
          config?.currStepConfig?.[0]?.triggerToast("Successfully saved as draft");
          setTimeout(() => {
            onGoToRentAndLease();
          }, 1000);
        } else {
          history.replace(
            `/digit-ui/${isCitizen ? "citizen" : "employee"}/rent-and-lease/response/${currentStepData?.CreatedResponse?.applicationNumber}`,
            { applicationData: currentStepData?.CreatedResponse }
          );
        }
      } else {
        config?.currStepConfig?.[0]?.triggerToast((res?.Errors?.message || "Update failed"),false);
      }
    } catch (error) {
      config?.currStepConfig?.[0]?.triggerToast((error?.message || "Update failed"),true);
    }
  }

  const onSubmit = async (data, selectedAction) => {
    // Adapt this to your RentAndLease service structure
    // This is a placeholder - you'll need to adjust based on your actual API structure
    const { CreatedResponse, applicantDetails, propertyDetails: propertyDetailsFromData, documents: documentWrapper } = data;
    const { applicant, propertyDetails, documents, applicantName, mobileNumber, workflow: existingWorkflow, ...otherDetails } = CreatedResponse || {};

    const formData = {
      ...CreatedResponse,
      applicant: {
        ...CreatedResponse?.applicant,
        ...updatedApplicantDetails,
        name: `${updatedApplicantDetails.firstName || ""} ${updatedApplicantDetails.lastName || ""}`.trim(),
      },
      address: {
        ...CreatedResponse?.address,
        tenantId: tenantId,
      },
      propertyDetails: {
        ...CreatedResponse?.propertyDetails,
        ...updatedPropertyDetails,
      },
      documents: updatedDocuments.map((doc) => {
        const originalDoc =
          (CreatedResponse?.documents || []).find((d) => d.documentUid === doc?.documentUid || d.filestoreId === doc?.filestoreId) || {};

        return {
          id: originalDoc?.id || doc?.id,
          uuid: originalDoc?.uuid || doc?.uuid,
          documentUid: doc?.documentUid || originalDoc?.documentUid || doc?.filestoreId || "",
          documentType: doc?.documentType || originalDoc?.documentType || "",
          documentAttachment: doc?.filestoreId || originalDoc?.documentAttachment || "",
          filestoreId: doc?.filestoreId || originalDoc?.filestoreId || "",
        };
      }),
      workflow: {
        ...existingWorkflow,
        action: selectedAction?.action || "",
        comments: "",
        status: selectedAction?.action || "",
      },
      applicantName: `${applicantDetails?.firstName || ""} ${applicantDetails?.lastName || ""}`.trim(),
      mobileNumber: applicantDetails?.mobileNumber,
    };

    // Adapt this to your actual service call
    // const response = await Digit.RentAndLeaseService.update({ RentAndLeaseApplications: [formData] }, tenantId);
    // if (response?.ResponseInfo?.status === "successful") {
    //   return { isSuccess: true, response };
    // } else {
    //   return { isSuccess: false, response };
    // }

    // Placeholder response - replace with actual service call
    return { isSuccess: true, response: { RentAndLeaseApplications: [formData] } };
  };

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  // const closeToast = () => {
  //   setShowToast(false);
  //   setError("");
  // };

  const menuRef = useRef();
  let user = Digit.UserService.getUser();
  const [displayMenu, setDisplayMenu] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  // Adapt workflow details hook for RentAndLease
  // const workflowDetails = Digit.Hooks.useWorkflowDetails({
  //   tenantId: tenantId,
  //   id: currentStepData?.CreatedResponse?.applicationNumber,
  //   moduleCode: "RENTANDLEASE",
  // });

  const userRoles = user?.info?.roles?.map((e) => e.code);
  // let actions =
  //   workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
  //     return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
  //   }) ||
  //   workflowDetails?.data?.nextActions?.filter((e) => {
  //     return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
  //   });

  let actions = [];

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
        <SubmitBar
          label={t("CS_COMMON_BACK")}
          onSubmit={() => onGoBack(currentStepData)}
          style={{ backgroundColor: "white", color: "#2947a3", border: "1px solid", marginRight: "10px" }}
        />        

        {displayMenu && actions && actions.length > 0 ? (
          <Menu localeKeyPrefix={t(`WF_CITIZEN_${"RENTANDLEASE"}`)} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
        ) : null}

        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>

      {/* {showToast && <Toast isDleteBtn={true} error={showToast.key === "error" ? true : false} label={error} onClose={closeToast} />} */}
    </React.Fragment>
  );
};

export default NewRentAndLeaseStepFormFour;
