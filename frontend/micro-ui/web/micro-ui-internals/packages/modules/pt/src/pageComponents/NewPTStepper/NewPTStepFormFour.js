import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast, ActionBar, Menu, SubmitBar } from "@mseva/digit-ui-react-components";
import { useState } from "react";
import _ from "lodash";
import { useHistory, useRouteMatch } from "react-router-dom";
import { UPDATE_PTNewApplication_FORM } from "../../redux/action/PTNewApplicationActions";
import { Loader } from "../../components/Loader";

const NewPTStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const { path } = useRouteMatch();
  const [showToast, setShowToast] = useState(false);
  const [loader, setLoader] = useState(false);
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

  const updatedOwnerDetails = currentStepData?.ownerDetails || {};
  const updatedPetDetails = currentStepData?.petDetails || {};
  const updatedDocuments = currentStepData?.documents?.documents?.documents || [];

  const onGoToPTR = () => {
    if (isCitizen) {
      history.push(`/digit-ui/citizen/ptr-home`);
    } else {
      history.push(`/digit-ui/employee/ptr/petservice/inbox`);
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
      dispatch(UPDATE_PTNewApplication_FORM(config.key, data));
    }
  };

  async function goNext(selectedAction) {
    const { missingFields, notFormattedFields } = validateStepData(currentStepData);

    if (missingFields.length > 0) {
      setError(`Please fill the following field: ${missingFields[0]}`);
      setShowToast({ key: "error" });
      return;
    }

    if (notFormattedFields.length > 0) {
      setError(`Please format the following field: ${notFormattedFields[0]}`);
      setShowToast({ key: "error" });
      return;
    }

    try {
      const res = await onSubmit(currentStepData, selectedAction);

      if (res?.isSuccess) {
        const action = res?.response?.PetRegistrationApplications?.[0]?.workflow?.action;
        if (action == "CANCEL") {
          alert("Cancelled Application");
          onGoToPTR();
        } else if (action == "SAVEASDRAFT") {
          setShowToast({ key: "success", label: "Successfully saved as draft" });
          setError("Successfully saved as draft");

          setTimeout(() => {
            onGoToPTR();
          }, 1000);
        } else {
          history.replace(
            `/digit-ui/${isCitizen ? "citizen" : "employee"}/ptr/petservice/response/${currentStepData?.CreatedResponse?.applicationNumber}`,
            { applicationData: currentStepData?.CreatedResponse }
          );
        }
      } else {
        setError(res?.Errors?.message || "Update failed");
        setShowToast({ key: "error" });
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
      setError(error?.message || "Update failed");
      setShowToast({ key: "error" });
    }
  }

  const onSubmit = async (data, selectedAction) => {
    setLoader(true);
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
      ...CreatedResponse, // keep untouched fields like applicationNumber, tenantId, etc.

      // Merge updated owner details
      owner: {
        ...CreatedResponse?.owner,
        ...updatedOwnerDetails,
        name: `${updatedOwnerDetails.firstName} ${updatedOwnerDetails.lastName}`,
      },

      address: {
        ...CreatedResponse?.address,
        tenantId: tenantId,
      },

      // Merge updated pet details
      petDetails: {
        ...CreatedResponse?.petDetails,
        ...updatedPetDetails,
        petType: updatedPetDetails?.petType?.name || CreatedResponse?.petDetails?.petType || "",
        breedType: updatedPetDetails?.breedType?.name || CreatedResponse?.petDetails?.breedType || "",
        petGender: updatedPetDetails?.petGender?.name || CreatedResponse?.petDetails?.petGender || "",
      },

      // Rebuild documents array from latest Redux state
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
      // test
      ownerName: `${ownerDetails?.firstName} ${ownerDetails?.lastName}`, //change to ownerName
      mobileNumber: ownerDetails?.mobileNumber,
    };
    try {
      const response = await Digit.PTRService.update({ PetRegistrationApplications: [formData] }, tenantId);
      setLoader(false);
      if (response?.ResponseInfo?.status === "successful") {
        return { isSuccess: true, response };
      } else {
        return { isSuccess: false, response };
      }
    } catch (error) {
      setLoader(false);
      console.log("error");
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
  //     dispatch(UPDATE_PTNewApplication_FORM(config.key, data));
  //   }
  // };

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
        {/* Back button */}
        <SubmitBar label={t("CS_COMMON_BACK")} onSubmit={() => onGoBack(currentStepData)} />

        {/* Take Action menu */}
        {displayMenu && actions ? (
          <Menu localeKeyPrefix={t(`WF_CITIZEN_${"PTR"}`)} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
        ) : null}

        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>

      {showToast && <Toast isDleteBtn={true} error={showToast.key === "error" ? true : false} label={error} onClose={closeToast} />}
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default NewPTStepFormFour;
