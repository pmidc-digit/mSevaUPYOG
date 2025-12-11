import { ActionLinks, CardSectionHeader, CloseSvg, SubmitBar, ActionBar, Menu, Toast } from "@mseva/digit-ui-react-components";
import React, { Fragment, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import PTRModal from "./PTRModal";

// ===== OLD TIMELINE IMPLEMENTATION (Replaced by TimelineHOC) =====
// The following imports and code were used for the manual timeline rendering
// before we created the generic TimelineHOC component
// import { CheckPoint, ConnectingCheckPoints } from "@mseva/digit-ui-react-components";
// import PTRWFCaption from "./PTRWFCaption";
// import PTRWFDocument from "./PTRWFDocument";
// ===== END OLD IMPLEMENTATION =====

import ApplicationTimeline from "../../../templates/ApplicationDetails/components/ApplicationTimeline";
import { Loader } from "../components/Loader";

const PTRWFApplicationTimeline = (props) => {
  const { t } = useTranslation();
  const businessService = props?.application?.workflow?.businessService;
  const history = useHistory();
  const tenantId = props.application?.tenantId;
  const state = tenantId?.split(".")[0];
  const [getEmployees, setEmployees] = useState([]);
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const [latestComment, setLatestComment] = useState(null);
  const [getLoader, setLoader] = useState(false);
  const [getWorkflowService, setWorkflowService] = useState([]);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: props.application?.tenantId,
    id: props.application?.applicationNumber,
    moduleCode: "ptr",
    role: "EMPLOYEE",
    // config: { staleTime: 0, refetchOnMount: "always" },
  });

  console.log("workflowDetails", workflowDetails);

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  const isLoading = false;

  console.log("data ==== ??Asdasdsadbkahjsdb", workflowDetails);

  const isCitizen = window.location.href.includes("citizen");

  const showNextActions = (nextActions) => {
    let nextAction = nextActions?.length > 0 && nextActions[0];
    const next = nextActions?.map((action) => action?.action);
    if (next?.includes("PAY") || next?.includes("EDIT")) {
      let currentIndex = next.indexOf("EDIT") || next.indexOf("PAY");
      currentIndex = currentIndex != -1 ? currentIndex : next.indexOf("PAY");
      nextAction = nextActions[currentIndex];
    }
    switch (nextAction?.action) {
      case "PAY":
        return props?.userType === "citizen" ? (
          <div style={{ marginTop: "1em", bottom: "0px", width: "100%", marginBottom: "1.2em" }}>
            <Link
              to={{
                // history.push(`/digit-ui/employee/payment/collect/PTR/${appNo}/${tenantId}?tenantId=${tenantId}`);
                // pathname: `/digit-ui/employee/payment/collect/pet-services/${props?.application?.applicationNumber}/${tenantId}`,
                // pathname: `/digit-ui/citizen/payment/my-bills/${businessService}/${props?.application?.applicationNumber}`,

                pathname: isCitizen
                  ? `/digit-ui/citizen/payment/collect/pet-services/${props?.application?.applicationNumber}/${tenantId}?tenantId=${tenantId}`
                  : `/digit-ui/employee/payment/collect/pet-services/${props?.application?.applicationNumber}/${tenantId}?tenantId=${tenantId}`,

                state: { tenantId: props.application.tenantId, applicationNumber: props?.application?.applicationNumber },
              }}
            >
              <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} />
            </Link>
          </div>
        ) : null;

      case "SUBMIT_FEEDBACK":
        return (
          <div style={{ marginTop: "24px" }}>
            <Link to={`/digit-ui/citizen/fsm/rate/${props.id}`}>
              <SubmitBar label={t("CS_APPLICATION_DETAILS_RATE")} />
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  let user = Digit.UserService.getUser();
  const menuRef = useRef();
  const userRoles = user?.info?.roles?.map((e) => e.code);
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  console.log("check actions", actions);

  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const closeToast = () => {
    setShowToast(null);
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
    setShowToast(false);
  };

  function onActionSelect(action) {
    const payload = {
      action: [action],
    };

    console.log("action", action);

    const filterNexState = action?.state?.actions?.filter((item) => item.action == action?.action);
    console.log("filterNexState", filterNexState);
    const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState[0]?.nextState);
    console.log("filterRoles", filterRoles);
    setEmployees(filterRoles?.[0]?.actions);

    if (action?.action == "APPLY") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      const appNo = props.application?.applicationNumber;
      history.push(`/digit-ui/employee/payment/collect/PTR/${appNo}/${tenantId}`);
    } else {
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const submitAction = async (data) => {
    // setShowModal(false);
    // setSelectedAction(null);
    const payloadData = props.application;

    const updatedApplicant = {
      ...payloadData,
      workflow: {},
    };

    const filtData = data?.Licenses?.[0];
    setLatestComment(filtData?.comment);
    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData.action === "SENDBACKTOCITIZEN" ? [props.application?.auditDetails?.createdBy] : filtData?.assignee,
      comments: filtData?.comment,
      documents: filtData?.wfDocuments ? filtData?.wfDocuments : null,
    };
    // if (!filtData?.assignee && filtData.action == "FORWARD") {
    //   // setShowToast(true);
    //   setShowToast({ key: "error", message: "Assignee is mandatory" });
    //   setError("Assignee is mandatory");
    //   return;
    // }
    const finalPayload = {
      PetRegistrationApplications: [updatedApplicant],
    };
    try {
      const response = await Digit.PTRService.update({
        // tenantId,
        ...finalPayload,
      });

      if (response?.ResponseInfo?.status == "successful") {
        // ✅ Show success first
        setShowToast({ key: "success", message: "Successfully updated the status" });
        setError("Successfully updated the status");
        // data.revalidate();

        // ✅ Delay navigation so toast shows
        setTimeout(() => {
          history.push("/digit-ui/employee/ptr/petservice/inbox");
        }, 2000);

        setSelectedAction(null);
        setShowModal(false);
      }
    } catch (err) {
      setShowToast({ key: "error", message: "Something went wrong" });
      setError("Something went wrong");
    }
  };

  useEffect(() => {
    const fetchWorkflowService = async () => {
      try {
        setLoader(true);
        const WorkflowService = await Digit.WorkflowService.init(tenantId, "ptr");
        setWorkflowService(WorkflowService?.BusinessServices?.[0]?.states || []);
      } catch (error) {
        console.error("Error fetching workflow service:", error);
      } finally {
        setLoader(false);
      }
    };

    if (tenantId) {
      fetchWorkflowService();
    }
  }, [tenantId]);

  /* ===== OLD HELPER FUNCTIONS (Commented out for reference) =====
  const getTimelineCaptions = (checkpoint) => {
    if (checkpoint.state === "OPEN") {
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        source: props.application?.channel || "",
        // mobileNumber: checkpoint?.assigner?.mobileNumber,
      };
      return <PTRWFCaption data={caption} />;
    } else if (checkpoint.state) {
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        name: checkpoint?.assigner?.name,
        // mobileNumber: checkpoint?.assigner?.mobileNumber,
        // comment: latestComment,
        comment: checkpoint.state === "INITIATED" ? null : checkpoint?.wfComment?.[0],
        wfDocuments: checkpoint?.wfDocuments,
        thumbnailsToShow: checkpoint?.thumbnailsToShow,
      };
      return (
        <div>
          <PTRWFCaption data={caption} OpenImage={OpenImage} />
          {checkpoint?.wfDocuments?.length > 0 && (
            <div>
              {checkpoint?.wfDocuments?.map((doc, index) => (
                <div key={index}>
                  <PTRWFDocument value={checkpoint?.wfDocuments} Code={doc?.documentType} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      const caption = {
        date: Digit.DateUtils.ConvertTimestampToDate(props.application?.auditDetails.lastModified),
        name: checkpoint?.assigner?.name,
        comment: t(checkpoint?.comment),
      };
      return <PTRWFCaption data={caption} />;
    }
  };

  const OpenImage = (imageSource, index, thumbnailsToShow) => {
    window.open(thumbnailsToShow?.fullImage?.[0], "_blank");
  };
  =================================================================== */

  return (
    <React.Fragment>
      <Fragment>
        {/* ===== OLD TIMELINE IMPLEMENTATION (Commented out for reference) ===== */}
        {/* 
        {workflowDetails?.data?.timeline && workflowDetails?.data?.timeline?.length === 1 ? (
          <CheckPoint
            isCompleted={true}
            label={t(`${workflowDetails?.data?.timeline[0]?.state}`)}
            customChild={getTimelineCaptions(workflowDetails?.data?.timeline[0])}
          />
        ) : (
          <ConnectingCheckPoints>
            {workflowDetails?.data?.timeline &&
              workflowDetails?.data?.timeline.map((checkpoint, index, arr) => {
                return (
                  <React.Fragment key={index}>
                    <CheckPoint
                      keyValue={index}
                      isCompleted={index === 0}
                      label={t(`${checkpoint.state}`)}
                      customChild={getTimelineCaptions(checkpoint)}
                    />
                  </React.Fragment>
                );
              })}
          </ConnectingCheckPoints>
        )} 
        */}
        {/* =================================================================== */}

        <ApplicationTimeline workflowDetails={workflowDetails} t={t} />

        {actions?.length > 0 && actions[0]?.action != "PAY" && !isCitizen && (
          <ActionBar>
            {displayMenu ? (
              <Menu
                localeKeyPrefix={`WF_EMPLOYEE_${"PTR"}`}
                options={actions}
                optionKey={"action"}
                t={t}
                onSelect={onActionSelect}
                // style={MenuStyle}
              />
            ) : null}
            <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
          </ActionBar>
        )}

        {showModal ? (
          <PTRModal
            t={t}
            action={selectedAction}
            tenantId={tenantId}
            state={state}
            id={props.application?.applicationNumber}
            applicationDetails={props.application}
            closeModal={closeModal}
            submitAction={submitAction}
            actionData={workflowDetails?.data?.timeline}
            workflowDetails={workflowDetails?.data}
            showToast={showToast}
            closeToast={closeToast}
            getEmployees={getEmployees}
            errors={error}
            setShowToast={setShowToast}
          />
        ) : null}
      </Fragment>
      {workflowDetails?.data && showNextActions(workflowDetails?.data?.actionState?.nextActions)}
      {showToast && <Toast error={showToast.key == "error" ? true : false} label={error} isDleteBtn={true} onClose={closeToast} />}
      {getLoader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default PTRWFApplicationTimeline;
