import {
  Header,
  Row,
  StatusTable,
  Loader,
  Card,
  CardSubHeader,
  ActionBar,
  SubmitBar,
  Menu,
  Toast,
  ConnectingCheckPoints,
  CheckPoint,
  TLTimeLine,
  DisplayPhotos,
  StarRated,
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import NDCDocument from "../../../pageComponents/NDCDocument";
import NDCDocumentTimline from "../../../components/NDCDocument";
import NDCModal from "../../../pageComponents/NDCModal";

const getTimelineCaptions = (checkpoint, index, arr, t) => {
  const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint;
  console.log("wfDocuments", wfDocuments);
  const caption = {
    date: checkpoint?.auditDetails?.lastModified,
    name: checkpoint?.assigner?.name,
    mobileNumber: checkpoint?.assigner?.mobileNumber,
    source: checkpoint?.assigner?.source,
  };

  return (
    <div>
      {comment?.length > 0 && (
        <div className="TLComments">
          <h3>{t("WF_COMMON_COMMENTS")}</h3>
          <p style={{ overflowX: "scroll" }}>{comment}</p>
        </div>
      )}

      {thumbnailsToShow?.thumbs?.length > 0 && (
        <DisplayPhotos
          srcs={thumbnailsToShow.thumbs}
          onClick={(src, idx) => {
            let fullImage = thumbnailsToShow.fullImage?.[idx] || src;
            Digit.Utils.zoomImage(fullImage);
          }}
        />
      )}

      {wfDocuments?.length > 0 && (
        <div>
          {wfDocuments?.map((doc, index) => (
            <div key={index}>
              <NDCDocumentTimline value={wfDocuments} Code={doc?.documentType} index={index} />
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "8px" }}>
        {caption.date && <p>{caption.date}</p>}
        {caption.name && <p>{caption.name}</p>}
        {caption.mobileNumber && <p>{caption.mobileNumber}</p>}
        {caption.source && <p>{t("ES_COMMON_FILED_VIA_" + caption.source.toUpperCase())}</p>}
      </div>
    </div>
  );
};

const ApplicationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const state = tenantId?.split(".")[0];
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);

  const [showErrorToast, setShowErrorToastt] = useState(null);
  const [errorOne, setErrorOne] = useState(null);
  const [displayData, setDisplayData] = useState({});
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const { isLoading, data: applicationDetails } = Digit.Hooks.ndc.useSearchEmployeeApplication({ uuid: id }, tenantId);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: "ndc-services",
    role: "EMPLOYEE",
  });

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  let workflowDetailsTemp = {
    data: {
      actionState: {
        nextActions: [
          {
            action: "APPROVE",
            roles: ["NDC_ADMIN"],
            tenantId: "pb",
            assigneeRoles: [],
            isTerminateState: false,
          },
          {
            action: "ASSIGN",
            roles: ["NDC_ADMIN"],
            tenantId: "pb",
            assigneeRoles: ["NDC_ADMIN"],
            isTerminateState: false,
          },
          {
            action: "REJECT",
            roles: ["NDC_ADMIN"],
            tenantId: "pb",
            assigneeRoles: [],
            isTerminateState: true,
          },
        ],
      },
    },
  };

  let user = Digit.UserService.getUser();
  const menuRef = useRef();
  if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    user = userInfo?.value;
  }
  const userRoles = user?.info?.roles?.map((e) => e.code);
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetailsTemp?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

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

  const closeToastOne = () => {
    setShowErrorToastt(null);
  };

  const removeDuplicatesByUUID = (arr) => {
    const seen = new Set();
    return arr.filter((item) => {
      if (seen.has(item.uuid)) {
        return false;
      } else {
        seen.add(item.uuid);
        return true;
      }
    });
  };

  useEffect(() => {
    const ndcObject = applicationDetails?.Applications?.[0];
    console.log("ndcObject", ndcObject);
    if (ndcObject) {
      const applicantData = {
        name: ndcObject?.owners?.[0]?.name,
        mobile: ndcObject?.owners?.[0]?.mobileNumber,
        email: ndcObject?.owners?.[0]?.emailId,
        address: ndcObject?.NdcDetails?.[0]?.additionalDetails?.propertyAddress,
        // createdDate: ndcObject?.owners?.[0]?.createdtime ? format(new Date(ndcObject?.owners?.[0]?.createdtime), "dd/MM/yyyy") : "",
        applicationNo: ndcObject?.uuid,
      };
      const Documents = removeDuplicatesByUUID(ndcObject?.Documents || []);
      const NdcDetails = removeDuplicatesByUUID(ndcObject?.NdcDetails || [])?.map((item) => ({
        businessService:
          item?.businessService === "WS"
            ? "NDC_WATER_SERVICE_CONNECTION"
            : item?.businessService === "SW"
            ? "NDC_SEWERAGE_SERVICE_CONNECTION"
            : item?.businessService === "PT"
            ? "NDC_PROPERTY_TAX"
            : item?.businessService,
        consumerCode: item?.consumerCode || "",
        status: item?.status || "",
        dueAmount: item?.dueAmount || 0,
        propertyType: item?.additionalDetails?.propertyType || "",
      }));

      setDisplayData({ applicantData, Documents, NdcDetails });
    }
  }, [applicationDetails?.Applications]);

  useEffect(() => {
    console.log("applicationDetails", applicationDetails);
    if (applicationDetails) {
      setIsDetailsLoading(true);
      const { Applicant: details } = applicationDetails?.Applications?.[0];
      setIsDetailsLoading(false);
    }
  }, [applicationDetails]);

  function onActionSelect(action) {
    console.log("action", action);
    const payload = {
      Licenses: [action],
    };
    if (action?.action == "APPLY") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      const appNo = displayData?.applicantData?.applicationNo;

      history.push(`/digit-ui/employee/payment/collect/NDC/${appNo}/${tenantId}?tenantId=${tenantId}`);
    } else {
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const submitAction = async (data) => {
    // setShowModal(false);
    // setSelectedAction(null);
    const payloadData = applicationDetails?.Applications[0];

    console.log("data", data);

    const updatedApplicant = {
      ...payloadData,
      workflow: {},
    };

    const filtData = data?.Licenses?.[0];
    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData?.assignee,
      comment: filtData?.comment,
      documents: filtData?.wfDocuments,
    };

    console.log("filtData", filtData);

    if (!filtData?.assignee && filtData.action == "FORWARD") {
      setShowToast({ key: "error" });
      setError("Assignee is mandatory");

      return;
    } else if (!filtData?.comment && (filtData?.action == "FORWARD" || filtData?.action == "REJECT")) {
      // setShowToast({ key: "error", message: "Comment is mandatory" });
      // setError("Comment is mandatory");
      setErrorOne("Comment is mandatory");
      setShowErrorToastt(true);

      return;
    }

    const finalPayload = {
      Applications: [updatedApplicant],
    };

    try {
      const response = await Digit.NDCService.NDCUpdate({ tenantId, details: finalPayload });

      // ✅ Show success first
      setShowToast({ key: "success", message: "Successfully updated the status" });
      setError("Successfully updated the status");

      workflowDetails.revalidate();

      // ✅ Delay navigation so toast shows
      setTimeout(() => {
        history.push("/digit-ui/employee/ndc/inbox");
        window.location.reload();
      }, 2000);

      setSelectedAction(null);
      setShowModal(false);
    } catch (err) {
      setShowToast({ key: "error", message: "Something went wrong" });
      setError("Something went wrong");
    }
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  if (isLoading || isDetailsLoading) {
    return <Loader />;
  }

  // useEffect(() => {
  //   if (showToast) {
  //     const timer = setTimeout(() => {
  //       setShowToast(null);
  //     }, 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showToast]);

  // useEffect(() => {
  //   if (showErrorToast) {
  //     const timer = setTimeout(() => {
  //       setShowErrorToastt(null);
  //     }, 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showErrorToast]);

  return (
    <div className={"employee-main-application-details"}>
      <div>
        <Header styles={{ fontSize: "32px" }}>{t("NDC_APP_OVER_VIEW_HEADER")}</Header>
      </div>
      <Card>
        <CardSubHeader>{t("NDC_APPLICATION_DETAILS_OVERVIEW")}</CardSubHeader>
        <StatusTable>
          {displayData?.applicantData &&
            Object.entries(displayData?.applicantData)?.map(([key, value]) => (
              <Row
                key={key}
                label={t(`${key?.toUpperCase()}`)}
                text={
                  Array.isArray(value)
                    ? value.map((item) => (typeof item === "object" ? t(item?.code || "N/A") : t(item || "N/A"))).join(", ")
                    : typeof value === "object"
                    ? t(value?.code || "N/A")
                    : t(value || "N/A")
                }
              />
            ))}
        </StatusTable>
      </Card>
      <Card>
        <CardSubHeader>{t("NDC_APPLICATION_NDC_DETAILS_OVERVIEW")}</CardSubHeader>
        {displayData?.NdcDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NDC_BUSINESS_SERVICE")} text={t(`${detail.businessService}`) || detail.businessService} />
              <Row label={t("NDC_CONSUMER_CODE")} text={detail.consumerCode || "N/A"} />
              {/* <Row label={t("NDC_STATUS")} text={t(detail.status) || detail.status} /> */}
              <Row label={t("NDC_DUE_AMOUNT")} text={detail.dueAmount?.toString() || "0"} />
              <Row label={t("NDC_PROPERTY_TYPE")} text={t(detail.propertyType) || detail.propertyType} />
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("NDC_APPLICATION_DOCUMENTS_OVERVIEW")}</CardSubHeader>
        <div style={{ display: "flex", gap: "16px" }}>
          {Array.isArray(displayData?.Documents) && displayData?.Documents?.length > 0 ? (
            <NDCDocument value={{ workflowDocs: displayData?.Documents }}></NDCDocument>
          ) : (
            <div>{t("TL_NO_DOCUMENTS_MSG")}</div>
          )}
        </div>
      </Card>

      {workflowDetails?.data?.timeline && (
        <Card>
          <CardSubHeader>{t("NDC_APPLICATION_TIMELINE")}</CardSubHeader>
          {workflowDetails?.data?.timeline.length === 1 ? (
            <CheckPoint isCompleted={true} label={t("NDC_STATUS_" + workflowDetails?.data?.timeline[0]?.status)} />
          ) : (
            <ConnectingCheckPoints>
              {workflowDetails?.data?.timeline.map((checkpoint, index, arr) => (
                <CheckPoint
                  keyValue={index}
                  isCompleted={index === 0}
                  label={t("NDC_STATUS_" + checkpoint.status)}
                  customChild={getTimelineCaptions(checkpoint, index, arr, t)}
                />
              ))}
            </ConnectingCheckPoints>
          )}
        </Card>
      )}

      {actions && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix={`WF_EMPLOYEE_${"NDC"}`}
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
        <NDCModal
          t={t}
          action={selectedAction}
          tenantId={tenantId}
          state={state}
          id={id}
          applicationDetails={applicationDetails}
          applicationData={applicationDetails?.applicationData}
          closeModal={closeModal}
          submitAction={submitAction}
          actionData={workflowDetails?.data?.timeline}
          workflowDetails={workflowDetails}
          showToast={showToast}
          closeToast={closeToast}
          errors={error}
          showErrorToast={showErrorToast}
          errorOne={errorOne}
          closeToastOne={closeToastOne}
        />
      ) : null}
      {showToast && <Toast error={showToast.key == "error" ? true : false} label={error} isDleteBtn={true} onClose={closeToast} />}
    </div>
  );
};

export default ApplicationOverview;
