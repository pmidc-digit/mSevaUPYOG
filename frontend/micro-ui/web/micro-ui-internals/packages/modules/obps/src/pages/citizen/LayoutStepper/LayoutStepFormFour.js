import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionBar, CheckBox, FormComposer, Loader, Menu, SubmitBar, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_LayoutNewApplication_FORM } from "../../../redux/actions/LayoutNewApplicationActions";
import { useState } from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";
import LayoutSummary from "../../../pageComponents/LayoutSummary";

const LayoutStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState("");
  const [selectedCheckBox, setSelectedCheckBox] = useState(false);

  const handleCheckBox = (e) => {
    setSelectedCheckBox(e.target.checked);
  };

  console.log("selectedCheckBox", selectedCheckBox);

  const currentStepData = useSelector((state) => state.obps.LayoutNewApplicationFormReducer.formData || {});
  const coordinates = useSelector((state) => state.obps.LayoutNewApplicationFormReducer.coordinates || {});
  const menuRef = useRef();

  const user = Digit.UserService.getUser();
  const userRoles = user?.info?.roles?.map((e) => e.code);
  const [displayMenu, setDisplayMenu] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const history = useHistory();

  let tenantId;

  if (window.location.href.includes("citizen")) tenantId = window.localStorage.getItem("CITIZEN.CITY");
  else {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  }

  const goNext = (action) => {
    console.log("formData in parent SummaryPage", currentStepData);

    onSubmit(currentStepData, action);
  };

  const onSubmit = async (data, selectedAction) => {
    console.log("formData inside onSubmit", data);

    if (window.location.pathname.includes("edit") && selectedAction.action === "EDIT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_SAVE_OR_RESUBMIT_LABEL" });
      return;
    }

    const finalPayload = mapToLayoutPayload(data, selectedAction);
    console.log("finalPayload here==>", finalPayload);

    try {
      const response = await Digit.OBPSService.LayoutUpdate(finalPayload, tenantId);

      if (response?.ResponseInfo?.status === "successful") {
        console.log("success: Update API ");

        if (window.location.href.includes("citizen")) {
          if (selectedAction.action === "CANCEL") {
            setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
            setTimeout(() => {
              history.push(`/digit-ui/citizen/obps/layout/my-application`);
            }, 3000);
          } else {
            console.log("We are calling citizen response page");
            history.replace({
              pathname: `/digit-ui/citizen/obps/layout/response/${response?.Layout?.[0]?.applicationNo}`,
              state: { data: response },
            });
          }
        } else {
          console.log("we are calling employee response page");

          if (selectedAction.action === "CANCEL") {
            setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
            setTimeout(() => {
              history.push(`/digit-ui/employee/obps/layout/inbox`);
            }, 3000);
          } else {
            history.replace({
              pathname: `/digit-ui/employee/obps/layout/response/${response?.Layout?.[0]?.applicationNo}`,
              state: { data: response },
            });
          }
        }
      } else {
        console.error("Submission failed, not moving to next step.", response?.response);
        setShowToast({ key: "true", error: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
      }
    } catch (error) {
      console.log("errors here in goNext - catch block", error);
      setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
    }
  };

  // function mapToLayoutPayload(layoutFormData, selectedAction) {
  //   console.log("layoutFormData", layoutFormData);

  //   const updatedApplication = {
  //     ...layoutFormData?.apiData, // ✅ CORRECT - spreads layoutNo, accountId, id, tenantId, etc.
  //     workflow: {
  //       action: selectedAction?.action || "",
  //     },
  //     layoutDetails: {
  //       ...layoutFormData?.apiData?.layoutDetails, // ✅ CORRECT
  //       additionalDetails: {
  //         ...layoutFormData?.apiData?.layoutDetails?.additionalDetails,
  //         applicationDetails: {
  //           ...layoutFormData?.applicationDetails,
  //           applicantGender: layoutFormData?.applicationDetails?.applicantGender?.code || "",
  //         },
  //         siteDetails: {
  //           ...layoutFormData?.siteDetails,
  //           ulbName: layoutFormData?.siteDetails?.ulbName?.name || "",
  //           roadType: layoutFormData?.siteDetails?.roadType?.name || "",
  //           buildingStatus: layoutFormData?.siteDetails?.buildingStatus?.name || "",
  //           isBasementAreaAvailable: layoutFormData?.siteDetails?.isBasementAreaAvailable?.code || "",
  //           district: layoutFormData?.siteDetails?.district?.name || "",
  //           zone: layoutFormData?.siteDetails?.zone?.name || "",
  //         },
  //         coordinates: { ...coordinates },
  //       },
  //     },
  //     documents: [],
  //   };

  //   const docsArray = layoutFormData?.documents?.documents?.documents || [];
  //   docsArray.forEach((doc) => {
  //     updatedApplication.documents.push({
  //       uuid: doc?.documentUid || doc?.uuid,
  //       documentType: doc?.documentType,
  //       documentAttachment: doc?.filestoreId || doc?.documentAttachment,
  //     });
  //   });

  //   const payload = {
  //     Layout: updatedApplication,
  //   };

  //   return payload;
  // }


  function mapToLayoutPayload(layoutFormData, selectedAction) {
  console.log("[v0] layoutFormData", layoutFormData)
  
  // <CHANGE> Check if we're in EDIT mode or NEW mode
  // In NEW mode: data is at layoutFormData.apiData.Layout[0]
  // In EDIT mode: data is at layoutFormData.apiData directly
  const isEditMode = !layoutFormData?.apiData?.Layout
  const layoutData = isEditMode 
    ? layoutFormData?.apiData 
    : layoutFormData?.apiData?.Layout?.[0]
  
  console.log("[v0] isEditMode:", isEditMode)
  console.log("[v0] layoutData:", layoutData)

  const updatedApplication = {
    ...layoutData,  // <CHANGE> Use layoutData instead of hardcoded path
    workflow: {
      action: selectedAction?.action || "",
    },
    layoutDetails: {
      ...layoutData?.layoutDetails,  // <CHANGE> Use layoutData
      additionalDetails: {
        ...layoutData?.layoutDetails?.additionalDetails,  // <CHANGE> Use layoutData
        applicationDetails: {
          ...layoutFormData?.applicationDetails,
          applicantGender: layoutFormData?.applicationDetails?.applicantGender?.code || "",
        },
        siteDetails: {
          businessService: layoutFormData?.apiData?.Layout?.[0]?.layoutDetails.additionalDetails?.siteDetails?.businessService,
          ...layoutFormData?.siteDetails,
          ulbName: layoutFormData?.siteDetails?.ulbName?.name || "",
          roadType: layoutFormData?.siteDetails?.roadType?.name || "",
          buildingStatus: layoutFormData?.siteDetails?.buildingStatus?.name || "",
          isBasementAreaAvailable: layoutFormData?.siteDetails?.isBasementAreaAvailable?.code || "",
          district: layoutFormData?.siteDetails?.district?.name || "",
          zone: layoutFormData?.siteDetails?.zone?.name || "",
        },
        coordinates: { ...coordinates },
      },
    },
    documents: [],
  };

    const docsArray = layoutFormData?.documents?.documents?.documents || [];
    docsArray.forEach((doc) => {
      updatedApplication.documents.push({
        uuid: doc?.documentUid || doc?.uuid,
        documentType: doc?.documentType,
        documentAttachment: doc?.filestoreId || doc?.documentAttachment,
      });
    });

    const payload = {
      Layout: updatedApplication,
    };

    return payload;
  }



  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(null);
  };

  console.log("currentStepData in StepFour", currentStepData);

  const applicationNo = currentStepData?.apiData?.Layout?.[0]?.applicationNo || "";
  const businessServiceCode = currentStepData?.apiData?.Layout?.[0]?.layoutDetails?.additionalDetails?.siteDetails?.businessService || "";
  console.log("applicationNo here==>", applicationNo);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: applicationNo,
    moduleCode: businessServiceCode,
  });

  console.log("workflow Details here layout==>", workflowDetails);

    console.log("workflow Details here==>", workflowDetails)

  if (workflowDetails?.isLoading) {
    return <Loader />
  }

  const actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  console.log("actions here", actions);

  function onActionSelect(action) {
    goNext(action);
  }

  return (
    <React.Fragment>
      <LayoutSummary currentStepData={currentStepData} t={t} />

      <CheckBox
        label={`I hereby solemnly affirm and declare that I am submitting this application on behalf of the applicant (${
          currentStepData?.applicationDetails?.applicantOwnerOrFirmName || "NA"
        }). I along with the applicant have read the Policy and understand all the terms and conditions of the Policy. We are committed to fulfill/abide by all the terms and conditions of the Policy. The information/documents submitted are true and correct as per record and no part of it is false and nothing has been concealed/misrepresented therein.`}
        onChange={(e) => handleCheckBox(e)}
        value={selectedCheckBox}
        checked={selectedCheckBox}
      />

      {actions && (
        <ActionBar>
          <SubmitBar style={{ background: "white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />

          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu localeKeyPrefix={`WF_EMPLOYEE_LAYOUT`} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
          ) : null}
          {selectedCheckBox && <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />}
        </ActionBar>
      )}

      {showToast && (
        <Toast
          isDleteBtn={true}
          error={showToast?.error}
          warning={showToast?.warning}
          success={showToast?.success}
          label={t(showToast?.message)}
          onClose={closeToast}
        />
      )}
    </React.Fragment>
  );
};

export default LayoutStepFormFour;
