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
  const [displayMenu, setDisplayMenu] = useState(false);
  const menuRef = useRef();

  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [layoutData, setLayoutData] = useState(null);

  let tenantId;
  if (window.location.href.includes("citizen")) tenantId = window.localStorage.getItem("CITIZEN.CITY");
  else tenantId = window.localStorage.getItem("Employee.tenant-id");

  const currentStepData = useSelector((state) => state.obps.LayoutNewApplicationFormReducer.formData || {});
  const applicationNo = currentStepData?.apiData?.Layout?.[0]?.applicationNo || "";
console.log(applicationNo, "NOOOOO");
console.log(currentStepData, "NOOOOO");
  const history = useHistory();

  const user = Digit.UserService.getUser();
  const userRoles = user?.info?.roles?.map((e) => e.code);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  function handleCheckBox(e) {
    setSelectedCheckBox(e.target.checked);
  }

  console.log("selectedCheckBox", selectedCheckBox);

    const coordinates = useSelector(function (state) {
      return state?.obps?.LayoutNewApplicationFormReducer?.coordinates || {};
    });
  const searchApplication = async () => {
    if (!applicationNo) {
      console.log("No application number found");
      return;
    }

    const searchParams = {
      applicationNo: applicationNo,
    };

    console.log("Fetching application for update:", applicationNo);

    try {
      setIsSearching(true);
      const response = await Digit.OBPSService.LayoutSearch(tenantId, searchParams);

      console.log("Fetched Layout data:", response);

      if (response?.Layout?.[0]) {
        setLayoutData(response.Layout[0]);
        dispatch(UPDATE_LayoutNewApplication_FORM("apiData", { Layout: response.Layout }));
        const mergedData = {
          ...currentStepData,
          applicationDetails: {
            ...response.Layout[0]?.layoutDetails?.additionalDetails?.applicationDetails,
            ...currentStepData?.applicationDetails,
          },
          siteDetails: {
            ...response.Layout[0]?.layoutDetails?.additionalDetails?.siteDetails,
            ...currentStepData?.siteDetails,
          },
          coordinates: { ...coordinates },
          documents: currentStepData?.documents || response.Layout[0]?.documents,
        };
        dispatch(UPDATE_LayoutNewApplication_FORM("formData", mergedData));
        console.log("Layout data loaded successfully");
      } else {
        throw new Error("Application not found");
      }
    } catch (error) {
      console.error("Search API Error:", error);
      setShowToast({ key: "true", error: true, message: "Failed to fetch application data" });
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    if (applicationNo) {
      searchApplication();
    }
  }, [applicationNo]);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: applicationNo,
    moduleCode: "Layout_mcUp",
  });

  console.log("workflow Details here==>", workflowDetails);

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

  const goNext = (action) => {
    console.log("formData in parent SummaryPage", currentStepData);

    if (window.location.pathname.includes("edit") && action.action === "EDIT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_SAVE_OR_RESUBMIT_LABEL" });
      return;
    }

    onSubmit(currentStepData, action);
  };

  const onSubmit = async (data, selectedAction) => {
    console.log("formData inside onSubmit", data);

    if (!layoutData) {
      setShowToast({ key: "true", error: true, message: "Application data not loaded. Please wait..." });
      return;
    }

    setIsSubmitting(true);

    const updatedLayout = {
      ...layoutData,
      layoutDetails: {
        ...layoutData.layoutDetails,
        additionalDetails: {
          ...layoutData.layoutDetails.additionalDetails,
          applicationDetails: {
            ...layoutData.layoutDetails.additionalDetails.applicationDetails,
            ...data?.applicationDetails,
          },
          siteDetails: {
            ...layoutData.layoutDetails.additionalDetails.siteDetails,
            ...data?.siteDetails,
          },
          coordinates: { ...coordinates },
        },
      },
      workflow: {
        action: selectedAction?.action || "",
      },
      documents: [],
    };

    const docsArray = data?.documents?.documents?.documents || [];
    docsArray.forEach((doc) => {
      updatedLayout.documents.push({
        uuid: doc?.documentUid || doc?.uuid,
        documentType: doc?.documentType,
        documentAttachment: doc?.filestoreId || doc?.documentAttachment,
      });
    });

    const payload = {
      Layout: updatedLayout,
    };

    console.log("finalPayload here==>", payload);

    try {
      const response = await Digit.OBPSService.LayoutUpdate(payload, tenantId);

      if (response?.ResponseInfo?.status === "successful") {
        console.log("success: Update API");

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
    } finally {
      setIsSubmitting(false);
    }
  };

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    setShowToast(null);
  };

  console.log("currentStepData in StepFour", currentStepData);

  if (isSearching) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Loader />
        <p>{t("LOADING_APPLICATION_DATA")}</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      {isSubmitting && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          zIndex: 9999 
        }}>
          <Loader />
        </div>
      )}

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


