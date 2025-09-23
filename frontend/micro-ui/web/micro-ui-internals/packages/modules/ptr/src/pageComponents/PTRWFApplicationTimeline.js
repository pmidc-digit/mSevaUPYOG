import {
  ActionLinks,
  CardSectionHeader,
  CheckPoint,
  CloseSvg,
  ConnectingCheckPoints,
  Loader,
  SubmitBar,
  ActionBar,
  Menu,
  Toast,
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import PTRWFCaption from "./PTRWFCaption";
import PTRModal from "./PTRModal";
import PTRWFDocument from "./PTRWFDocument";

const PTRWFApplicationTimeline = (props) => {
  const { t } = useTranslation();
  const businessService = props?.application?.workflow?.businessService;
  const history = useHistory();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const state = tenantId?.split(".")[0];
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const [latestComment, setLatestComment] = useState(null);
  const { isLoading, data } = Digit.Hooks.useWorkflowDetails({
    tenantId: props.application?.tenantId,
    id: props.application?.applicationNumber,
    moduleCode: "ptr",
    config: { staleTime: 0, refetchOnMount: "always" },
  });

  console.log(" majordata :>> ", data);

  function OpenImage(imageSource, index, thumbnailsToShow) {
    window.open(thumbnailsToShow?.fullImage?.[0], "_blank");
  }

  const getTimelineCaptions = (checkpoint) => {
    console.log("checkpoint is :>> ", checkpoint);
    if (checkpoint.state === "OPEN") {
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        source: props.application?.channel || "",
        // mobileNumber: checkpoint?.assignes?.[0]?.mobileNumber,
      };
      return <PTRWFCaption data={caption} />;
    } else if (checkpoint.state) {
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        name: checkpoint?.assignes?.[0]?.name,
        // mobileNumber: checkpoint?.assignes?.[0]?.mobileNumber,
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
                  ? `/digit-ui/citizen/payment/my-bills/${businessService}/${props?.application?.applicationNumber}`
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
    data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });
  console.log("actions here", actions);
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
  };

  function onActionSelect(action) {
    const appNo = props.application?.applicationNumber;
    // route to edit for employee/citizen context
    if (action?.action === "SAVEASDRAFT" || action?.action == "APPLY") {
      const isCitizen = window.location.href.includes("citizen");
      // push to employee or citizen edit route (EditApplication reads useParams().id)
      if (isCitizen) {
        history.push(`/digit-ui/citizen/ptr/petservice/edit-application/${appNo}`);
      } else {
        history.push(`/digit-ui/employee/ptr/petservice/edit-application/${appNo}`);
      }
      return;
    }

    // const payload = {
    //   action: [action],
    // };
    // if (action?.action == "APPLY") {
    //   submitAction(payload);
    // }
    if (action?.action == "PAY") {
      const appNo = props.application?.applicationNumber;
      history.push(`/digit-ui/employee/payment/collect/PTR/${appNo}/${tenantId}`);
    } else {
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const submitAction = async (data) => {
    console.log("data  HUHHHH:>> ", data);
    // setShowModal(false);
    // setSelectedAction(null);
    const payloadData = props.application;

    console.log("payloadData :>> ", payloadData);

    const updatedApplicant = {
      ...payloadData,
      workflow: {},
    };

    const filtData = data?.Licenses?.[0];
    console.log("filtData whyy :>> ", filtData);
    setLatestComment(filtData?.comment);
    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData.action === "SENDBACKTOCITIZEN" ? [props.application?.auditDetails?.createdBy] : filtData?.assignee,
      comments: filtData?.comment,
      documents: filtData?.wfDocuments ? filtData?.wfDocuments : null,
    };
    if (!filtData?.assignee && filtData.action == "FORWARD") {
      // setShowToast(true);
      setShowToast({ key: "error", message: "Assignee is mandatory" });
      setError("Assignee is mandatory");
      return;
    }
    console.log("updatedApplicant :>> ", updatedApplicant);
    const finalPayload = {
      PetRegistrationApplications: [updatedApplicant],
    };
    console.log("finalPayload :>> ", finalPayload);
    try {
      const response = await Digit.PTRService.update({
        // tenantId,
        ...finalPayload,
      });

      if (response?.ResponseInfo?.status == "successful") {
        setShowToast({ key: "success", message: "Successfully updated the status" });
        setError("Successfully updated the status");
        // data.revalidate();

        // ✅ Delay navigation so toast shows
        setTimeout(() => {
          const isCitizen = window.location.href.includes("citizen");
          if (isCitizen) {
            history.push("/digit-ui/citizen/ptr-home");
          } else {
            history.push("/digit-ui/employee/ptr/petservice/inbox");
          }
        }, 2000);

        setSelectedAction(null);
        setShowModal(false);
      }
    } catch (err) {
      setShowToast({ key: "error", message: "Something went wrong" });
      setError("Something went wrong");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      {!isLoading && (
        <Fragment>
          {data?.timeline?.length > 0 && (
            <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px" }}>
              {t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}
            </CardSectionHeader>
          )}
          {data?.timeline && data?.timeline?.length === 1 ? (
            <CheckPoint
              isCompleted={true}
              label={t((data?.timeline[0]?.state && `WF_${businessService}_${data.timeline[0].state}`) || "NA")}
              customChild={getTimelineCaptions(data?.timeline[0])}
            />
          ) : (
            <ConnectingCheckPoints>
              {data?.timeline &&
                data?.timeline.map((checkpoint, index, arr) => {
                  let timelineStatusPostfix = "";
                  if (window.location.href.includes("/obps/")) {
                    if (data?.timeline[index - 1]?.state?.includes("BACK_FROM") || data?.timeline[index - 1]?.state?.includes("SEND_TO_CITIZEN"))
                      timelineStatusPostfix = `_NOT_DONE`;
                    else if (checkpoint?.performedAction === "SEND_TO_ARCHITECT") timelineStatusPostfix = `_BY_ARCHITECT_DONE`;
                    else timelineStatusPostfix = index == 0 ? "" : `_DONE`;
                  }
                  return (
                    <React.Fragment key={index}>
                      <CheckPoint
                        keyValue={index}
                        isCompleted={index === 0}
                        //label={checkpoint.state ? t(`WF_${businessService}_${checkpoint.state}`) : "NA"}
                        label={t(`ES_PTR_COMMON_STATUS_${data?.processInstances[index].state?.["state"]}${timelineStatusPostfix}`)}
                        customChild={getTimelineCaptions(checkpoint)}
                      />
                    </React.Fragment>
                  );
                })}
            </ConnectingCheckPoints>
          )}

          {actions?.length > 0 && actions[0]?.action != "PAY" && (
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
              actionData={data?.timeline}
              workflowDetails={data}
              showToast={showToast}
              closeToast={closeToast}
              errors={error}
              setShowToast={setShowToast}
            />
          ) : null}
        </Fragment>
      )}
      {data && showNextActions(data?.actionState?.nextActions)}
      {showToast && <Toast isDleteBtn={true} error={showToast.key === "error" ? true : false} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default PTRWFApplicationTimeline;
