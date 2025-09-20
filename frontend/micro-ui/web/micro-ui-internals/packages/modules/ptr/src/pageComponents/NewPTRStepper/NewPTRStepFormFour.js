import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast, ActionBar, Menu, SubmitBar } from "@mseva/digit-ui-react-components";
import { useState } from "react";
import _ from "lodash";
import { useHistory, useRouteMatch } from "react-router-dom";

const NewPTRStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const { path } = useRouteMatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();
  // const tenantId = window.localStorage.getItem("Citizen.tenant-id");
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const currentStepData = useSelector(function (state) {
    return state.ptr.PTRNewApplicationFormReducer.formData || {};
  });

  const onGoToPTR = () => {
    history.push(`/digit-ui/citizen/ptr-home`);
  };

  function validateStepData(data) {
    const missingFields = [];
    const notFormattedFields = [];

    return { missingFields, notFormattedFields };
  }
  const isCitizen = window.location.href.includes("citizen");

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

    try {
      const res = await onSubmit(currentStepData, data);

      if (res?.isSuccess) {
        const action = res?.response?.PetRegistrationApplications?.[0]?.workflow?.action;

        if (action == "CANCEL") {
          alert("Cancelled Application");
          onGoToPTR();
        } else {
          history.replace(
            `/digit-ui/${isCitizen ? "citizen" : "employee"}/ptr/petservice/response/${currentStepData?.CreatedResponse?.applicationNumber}`,
            { applicationData: currentStepData?.CreatedResponse }
          );
        }
      } else {
        setError(res?.Errors?.message || "Update failed");
        setShowToast(true);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
      setError(error?.message || "Update failed");
      setShowToast(true);
    }
  }

  const onSubmit = async (data, selectedAction) => {
    const { CreatedResponse, ownerDetails, petDetails: petDetailsFromData, documents: documentWrapper } = data;
    const {
      owner, // excluded
      petDetails, // excluded
      documents, // excluded
      ownerName,
      mobileNumber,
      workflow: existingWorkflow,
      ...otherDetails
    } = CreatedResponse;

    const formData = {
      owner: ownerDetails, //change applicant to owner
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
      ownerName: `${ownerDetails?.firstName} ${ownerDetails?.lastName}`, //change to ownerName
      mobileNumber: ownerDetails?.mobileNumber,
    };

    const response = await Digit.PTRService.update({ PetRegistrationApplications: [formData] }, tenantId);
    // return response?.ResponseInfo?.status === "successful";
    if (response?.ResponseInfo?.status === "successful") {
      return { isSuccess: true, response };
    } else {
      return { isSuccess: false, response };
    }
  };

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

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: currentStepData?.CreatedResponse?.applicationNumber,
    moduleCode: "PTR",
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
        {/* Back button */}
        <SubmitBar
          label={t("CS_COMMON_BACK")}
          onSubmit={() => onGoBack(currentStepData)}
          style={{ backgroundColor: "white", color: "black", border: "1px solid", marginRight: "10px" }}
        />

        {/* Take Action menu */}
        {displayMenu && actions ? (
          <Menu localeKeyPrefix={t(`WF_CITIZEN_${"PTR"}`)} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
        ) : null}

        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>

      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default NewPTRStepFormFour;
