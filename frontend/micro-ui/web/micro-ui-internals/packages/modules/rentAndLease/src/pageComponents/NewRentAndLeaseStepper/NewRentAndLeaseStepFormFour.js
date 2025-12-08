import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, ActionBar, Menu, SubmitBar } from "@mseva/digit-ui-react-components";
import { useState } from "react";
import _ from "lodash";
import { useHistory } from "react-router-dom";
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

   const applicationNumber =  currentStepData?.CreatedResponse?.AllotmentDetails?.applicationNumber


  console.log("currentStepDataINFourth", currentStepData);

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
        const action = res?.response?.RentAndLeaseApplications?.[0]?.workflow?.action;
        if (action == "CANCEL") {
          onGoToRentAndLease();
        } else if (action == "SAVEASDRAFT") {
          triggerToast("Successfully saved as draft");
          setTimeout(() => {
            onGoToRentAndLease();
          }, 1000);
        } else {
          history.replace(
            `/digit-ui/${isCitizen ? "citizen" : "employee"}/rentandlease/response/${applicationNumber}`,
            { applicationData: currentStepData?.CreatedResponse }
          );
        }
      } else {
        triggerToast(res?.Errors?.message || "Update failed", true);
      }
    } catch (error) {
      triggerToast(error?.message || "Update failed", true);
    }
  }

  const onSubmit = async (data, selectedAction) => {
    // Adapt this to your RentAndLease service structure
    // This is a placeholder - you'll need to adjust based on your actual API structure
    const { CreatedResponse } = data;
    const { workflow: existingWorkflow } = CreatedResponse || {};

    const formData = {
      ...CreatedResponse?.AllotmentDetails,
      Document: updatedDocuments.map((doc) => {
        const originalDoc =
          (CreatedResponse?.documents || []).find((d) => d.documentUid === doc?.documentUid || d.filestoreId === doc?.filestoreId) || {};

        return {
          documentType: doc?.documentType || originalDoc?.documentType || "",
          filestoreId: doc?.fileStoreId || originalDoc?.fileStoreId || "",
        };
      }),
      workflow: {
        ...existingWorkflow,
        action: selectedAction?.action || "",
        comments: "",
        status: selectedAction?.action || "",
      },
    };

    // Adapt this to your actual service call
    const response = await Digit.RentAndLeaseService.update({ AllotmentDetails: formData }, tenantId);
    console.log("response", response);
    if (response?.responseInfo?.status === "successful") {
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
   console.log( currentStepData?.CreatedResponse?.AllotmentDetails?.applicationNumber," currentStepData?.CreatedResponse?.AllotmentDetails?.applicationNumber")
  // Adapt workflow details hook for RentAndLease
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: applicationNumber,
    moduleCode: businessService,
  });

  console.log("workflowDetails", workflowDetails);

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
        <SubmitBar
          label={t("CS_COMMON_BACK")}
          onSubmit={() => onGoBack(currentStepData)}
          style={{ backgroundColor: "white", color: "#2947a3", border: "1px solid", marginRight: "10px" }}
        />

        {displayMenu && actions && actions.length > 0 ? (
          <Menu options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
        ) : // <Menu localeKeyPrefix={t(`WF_CITIZEN_${"RENTANDLEASE"}`)} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />

        null}

        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>
    </React.Fragment>
  );
};

export default NewRentAndLeaseStepFormFour;
