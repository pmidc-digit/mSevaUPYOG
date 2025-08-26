import { Header, Row, StatusTable, Loader, Card, CardSubHeader, ActionBar, SubmitBar, Menu, Toast } from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import NDCDocument from "../../../pageComponents/NDCDocument";
import NDCModal from "../../../pageComponents/NDCModal";

const ApplicationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const state = tenantId?.split(".")[0];
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const [displayData, setDisplayData] = useState({});
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const { isLoading, data: applicationDetails } = Digit.Hooks.ndc.useSearchEmployeeApplication({ uuid: id }, tenantId);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: "NDC",
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
    if (ndcObject) {
      const applicantData = {
        address: ndcObject?.NdcDetails?.[0]?.
          additionalDetails?.propertyAddress,
        email: ndcObject?.owners?.[0]?.emailId,
        mobile: ndcObject?.owners?.[0]?.mobileNumber,
        name: ndcObject?.owners?.[0]?.name,
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

    const updatedApplicant = {
      ...payloadData,
      workflow: {},
    };

    const filtData = data?.Licenses?.[0];
    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData?.assignee,
      comment: filtData?.comment,
      documents: null,
    };

    if (!filtData?.assignee && filtData.action == "FORWARD") {
      // setShowToast(true);
      setShowToast({ key: "error", message: "Assignee is mandatory" });
      setError("Assignee is mandatory");
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

    // const response = await Digit.NDCService.NDCUpdate({ tenantId, details: finalPayload });
    // setShowToast(true);
    // setError("Successfully updated the status");
    // workflowDetails.revalidate();

    // // ✅ Delay navigation so toast shows
    // setTimeout(() => {
    //   history.push("/digit-ui/employee/ndc/inbox");
    // }, 2000);
    // // history.push("/digit-ui/employee/ndc/inbox");

    // setSelectedAction(null);
    // setShowModal(false);
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  if (isLoading || isDetailsLoading) {
    return <Loader />;
  }

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
        />
      ) : null}
      {showToast && <Toast error={showToast.key === "error" ? true : false} label={error} onClose={closeToast} />}
    </div>
  );
};

export default ApplicationOverview;
