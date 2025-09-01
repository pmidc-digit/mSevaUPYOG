import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast, ActionBar, Menu, SubmitBar } from "@mseva/digit-ui-react-components";
import { useState } from "react";
import _ from "lodash";
import { useHistory, useRouteMatch } from "react-router-dom";

const RenewPTRStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const { path } = useRouteMatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();
  const tenantId = window.localStorage.getItem("Citizen.tenant-id");
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  console.log("goNext triggered");

  const currentStepData = useSelector(function (state) {
    return state.ptr.PTRNewApplicationFormReducer.formData || {};
  });

  console.log("currentStepDatafourstep", currentStepData);

  function validateStepData(data) {
    const missingFields = [];
    const notFormattedFields = [];

    return { missingFields, notFormattedFields };
  }

  // async function goNext(data) {
  //   const { missingFields, notFormattedFields } = validateStepData(currentStepData);

  //   if (missingFields.length > 0) {
  //     setError(`Please fill the following field: ${missingFields[0]}`);
  //     setShowToast(true);
  //     return;
  //   }

  //   if (notFormattedFields.length > 0) {
  //     setError(`Please format the following field: ${notFormattedFields[0]}`);
  //     setShowToast(true);
  //     return;
  //   }

  //   const res = await onSubmit(currentStepData);
  //   console.log("API response: ", res);

  //   if (res) {
  //     console.log("Submission successful, moving to next step.");
  //     // history.replace("/digit-ui/citizen/ptr-home");
  //   } else {
  //     console.error("Submission failed, not moving to next step.");
  //   }

  //   onGoNext();
  // }

  async function goNext(data) {
    const { missingFields, notFormattedFields } = validateStepData(currentStepData);

    if (missingFields.length > 0) {
      setError(`Please fill the following field: ${missingFields[0]}`);
      setShowToast(true);
      return;
    }

    if (notFormattedFields.length > 0) {
      setError(`Please format the following field: ${notFormattedFields[0]}`);
      setShowToast(true);
      return;
    }

    const res = await onSubmit(currentStepData, data);
    if (res) {
      history.replace(`/digit-ui/citizen/ptr/petservice/response/${currentStepData?.CreatedResponse?.applicationNumber}`, {
        applicationData: currentStepData?.CreatedResponse,
      });
      // onGoNext();
    } else {
      console.error("Submission failed, not moving to next step.");
      setError(res?.Errors?.message || "Update failed");
      setShowToast(true);
    }
  }

  const onSubmit = async (data, selectedAction) => {
    const { CreatedResponse, ownerDetails, petDetails: petDetailsFromData, documents: documentWrapper } = data;
    const {
      applicant, // excluded
      petDetails, // excluded
      documents, // excluded
      applicantName,
      mobileNumber,
      workflow: existingWorkflow,
      ...otherDetails
    } = CreatedResponse;

    const formData = {
      applicant: ownerDetails,
      documents: documentWrapper?.documents?.documents || [],
      petDetails: {
        ...petDetailsFromData,
        breedType: petDetailsFromData?.breedType?.name || "",
        petType: petDetailsFromData?.petType?.name || "",
        petGender: petDetailsFromData?.petGender?.name || "",
      },
      ...otherDetails,
      workflow: {
        ...existingWorkflow,
        action: selectedAction?.action || "",
        comments: selectedAction?.action || "",
        status: selectedAction?.action || "",
      },
      applicantName: `${ownerDetails?.firstName} ${ownerDetails?.lastName}`,
      mobileNumber: ownerDetails?.mobileNumber,
    };

    const response = await Digit.PTRService.update({ PetRegistrationApplications: [formData] }, tenantId);
    return response?.ResponseInfo?.status === "successful";
  };

  // const onSubmit = async (data, selectedAction) => {
  //   try {
  //     const { CreatedResponse, ownerDetails, petDetails: petDetailsFromData, documents: documentWrapper } = data;

  //     const { applicant, petDetails, documents, applicantName, mobileNumber, workflow: existingWorkflow, ...otherDetails } = CreatedResponse;

  //     const formData = {
  //       applicant: ownerDetails,
  //       documents: documentWrapper?.documents?.documents || [],
  //       petDetails: {
  //         ...petDetailsFromData,
  //         breedType: petDetailsFromData?.breedType?.name || "",
  //         petType: petDetailsFromData?.petType?.name || "",
  //         petGender: petDetailsFromData?.petGender?.name || "",
  //       },
  //       ...otherDetails,
  //       workflow: {
  //         ...existingWorkflow,
  //         action: selectedAction?.action || "",
  //         comments: selectedAction?.action || "",
  //         status: selectedAction?.action || "",
  //       },
  //       applicantName: `${ownerDetails?.firstName} ${ownerDetails?.lastName}`,
  //       mobileNumber: ownerDetails?.mobileNumber,
  //     };

  //     const response = await Digit.PTRService.update({ PetRegistrationApplications: [formData] }, tenantId);

  //     if (response?.ResponseInfo?.status === "successful") {
  //       onGoNext();
  //       // return true;
  //     } else {
  //       setError(err.message || "Update Failed!");
  //       setShowToast(true);
  //     }
  //   } catch (err) {
  //     console.error("Update API error:", err);
  //     setError(err.message || "Something went wrong");
  //     setShowToast(true);
  //     // return false;
  //   }
  // };

  // async function goNext(selectedAction) {
  //   const { missingFields, notFormattedFields } = validateStepData(currentStepData);

  //   if (missingFields.length > 0) {
  //     setError(`Please fill the following field: ${missingFields[0]}`);
  //     setShowToast(true);
  //     return;
  //   }

  //   if (notFormattedFields.length > 0) {
  //     setError(`Please format the following field: ${notFormattedFields[0]}`);
  //     setShowToast(true);
  //     return;
  //   }

  //   try {
  //     const response = await onSubmit(currentStepData, selectedAction);
  //     console.log("response", response);

  //     if (response === true) {
  //       console.log("Submission successful, moving to next step.");
  //       onGoNext();
  //     } else {
  //       console.error("Submission failed due to business logic.");
  //       setError(response?.Errors?.message || "Update failed due to invalid data or workflow state.");
  //       setShowToast(true);
  //     }
  //   } catch (err) {
  //     console.error("API call failed:", err);
  //     setError(err.message || "Something went wrong during submission.");
  //     setShowToast(true);
  //   }
  // }

  // const onSubmit = async (data, selectedAction) => {
  //   const { CreatedResponse, ownerDetails, petDetails: petDetailsFromData, documents: documentWrapper } = data;

  //   const { applicant, petDetails, documents, applicantName, mobileNumber, workflow: existingWorkflow, ...otherDetails } = CreatedResponse;

  //   const formData = {
  //     applicant: ownerDetails,
  //     documents: documentWrapper?.documents?.documents || [],
  //     petDetails: {
  //       ...petDetailsFromData,
  //       breedType: petDetailsFromData?.breedType?.name || "",
  //       petType: petDetailsFromData?.petType?.name || "",
  //       petGender: petDetailsFromData?.petGender?.name || "",
  //     },
  //     ...otherDetails,
  //     workflow: {
  //       ...existingWorkflow,
  //       action: selectedAction?.action || "",
  //       comments: selectedAction?.action || "",
  //       status: selectedAction?.action || "",
  //     },
  //     applicantName: `${ownerDetails?.firstName} ${ownerDetails?.lastName}`,
  //     mobileNumber: ownerDetails?.mobileNumber,
  //   };

  //   console.log("Submitting formData:", formData);

  //   // Return the full response to let goNext handle it
  //   return await Digit.PTRService.update({ PetRegistrationApplications: [formData] }, tenantId);
  // };

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  const menuRef = useRef();
  let user = Digit.UserService.getUser();
  const [displayMenu, setDisplayMenu] = useState(false);
  console.log("displayMenu", displayMenu);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: currentStepData?.CreatedResponse?.applicationNumber,
    moduleCode: "PTR",
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

  // const onFormValueChange = (setValue = true, data) => {
  //   console.log("onFormValueChange data in AdministrativeDetails: ", data, "\n Bool: ", !_.isEqual(data, currentStepData));
  //   if (!_.isEqual(data, currentStepData)) {
  //     dispatch(UPDATE_PTRNewApplication_FORM(config.key, data));
  //   }
  // };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        config={config.currStepConfig}
        onSubmit={goNext}
        // onFormValueChange={onFormValueChange}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      <ActionBar>
        {actions ? (
          <Menu
            localeKeyPrefix={`WF_CITIZEN_${"PTR"}`}
            options={actions}
            optionKey={"action"}
            t={t}
            onSelect={onActionSelect}
            // style={MenuStyle}
          />
        ) : null}
        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        {/* <SubmitBar label="Next" submit="submit" /> */}

        {/* <SubmitBar label={t("WF_TAKE_ACTION")} /> */}
      </ActionBar>

      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default RenewPTRStepFormFour;
