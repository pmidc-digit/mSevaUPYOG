import {
  Card,
  CardSubHeader,
  CardSectionHeader,
  Header,
  LinkButton,
  Row,
  StatusTable,
  MultiLink,
  PopUp,
  Toast,
  SubmitBar,
  Menu,
  ActionBar,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import { useHistory, useParams, Link } from "react-router-dom";
import getChbAcknowledgementData from "../../getChbAcknowledgementData";
import CHBWFApplicationTimeline from "../../pageComponents/CHBWFApplicationTimeline";
import CHBDocument from "../../pageComponents/CHBDocument";
import ApplicationTable from "../../components/inbox/ApplicationTable";
import { pdfDownloadLink } from "../../utils";
import NDCDocumentTimline from "../../components/NDCDocument";
import NDCModal from "../../pageComponents/NDCModal";
import { Loader } from "../../components/Loader";

import get from "lodash/get";
import { size } from "lodash";
import NewApplicationTimeline from "../../../../templates/ApplicationDetails/components/NewApplicationTimeline";

const CHBApplicationDetails = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dataRes = useParams();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const state = tenantId?.split(".")[0];
  const [acknowldgementData, setAcknowldgementData] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [popup, setpopup] = useState(false);
  const [getEmployees, setEmployees] = useState([]);
  const [getWorkflowService, setWorkflowService] = useState([]);
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const [getLoader, setLoader] = useState(false);
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [errorOne, setErrorOne] = useState(null);
  const [showErrorToast, setShowErrorToastt] = useState(null);

  const acknowledgementIds = dataRes?.id;

  const { isLoading, isError, data, refetch } = Digit.Hooks.chb.useChbSearch({
    tenantId,
    filters: { bookingNo: acknowledgementIds },
  });

  const mutation = Digit.Hooks.chb.useChbCreateAPI(tenantId, false);

  const [billData, setBillData] = useState(null);

  // Getting HallsBookingDetails
  const hallsBookingApplication = get(data, "hallsBookingApplication", []);
  const chbId = get(data, "hallsBookingApplication[0].bookingNo", []);

  let chb_details = (hallsBookingApplication && hallsBookingApplication.length > 0 && hallsBookingApplication[0]) || {};
  const application = chb_details;

  sessionStorage.setItem("chb", JSON.stringify(application));

  const [loading, setLoading] = useState(false);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: acknowledgementIds,
    moduleCode: "chb-services",
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
            roles: ["CHB_APPROVER"],
            tenantId: "pb",
            assigneeRoles: [],
            isTerminateState: false,
          },
          {
            action: "ASSIGN",
            roles: ["CHB_APPROVER"],
            tenantId: "pb",
            assigneeRoles: ["CHB_APPROVER"],
            isTerminateState: false,
          },
          {
            action: "REJECT",
            roles: ["CHB_APPROVER"],
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
  const [displayData, setDisplayData] = useState({});

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
    const ndcObject = data?.hallsBookingApplication?.[0];
    if (ndcObject) {
      const applicantData = {
        name: ndcObject?.owners?.[0]?.name,
        mobile: ndcObject?.owners?.[0]?.mobileNumber,
        email: ndcObject?.owners?.[0]?.emailId,
        address: ndcObject?.NdcDetails?.[0]?.additionalDetails?.propertyAddress,
        // createdDate: ndcObject?.owners?.[0]?.createdtime ? format(new Date(ndcObject?.owners?.[0]?.createdtime), "dd/MM/yyyy") : "",
        applicationNo: ndcObject?.bookingNo,
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
        isDuePending: item?.isDuePending,
      }));

      setDisplayData({ applicantData, Documents, NdcDetails });
    }
  }, [data?.hallsBookingApplication]);

  useEffect(() => {
    let WorkflowService = null;
    (async () => {
      setLoader(true);
      WorkflowService = await Digit.WorkflowService.init(tenantId, "chb-services");
      setLoader(false);
      setWorkflowService(WorkflowService?.BusinessServices?.[0]?.states);
      // setComplaintStatus(applicationStatus);
    })();
  }, [tenantId]);

  function onActionSelect(action) {
    const payload = {
      Licenses: [action],
    };

    const filterNexState = action?.state?.actions?.filter((item) => item.action == action?.action);
    const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState[0]?.nextState);

    setEmployees(filterRoles?.[0]?.actions);

    const appNo = displayData?.applicantData?.applicationNo;
    if (action?.action == "APPLY") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      history.push(`/digit-ui/employee/payment/collect/chb-services/${appNo}/${tenantId}?tenantId=${tenantId}`);
    } else if (action?.action == "EDIT") {
      history.push(`/digit-ui/employee/ndc/create/${appNo}`);
    } else if (action?.action == "CANCEL") {
      handleCancel();
    } else {
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const handleCancel = async () => {
    console.log("displayData?.applicantData", data?.hallsBookingApplication);
    // return
    setLoader(true);
    // ✅ Final payload
    const finalPayload = {
      hallsBookingApplication: {
        ...application,
        workflow: {
          action: "CANCEL",
        },
      },
    };
    try {
      const response = await Digit.CHBServices.update({ tenantId, ...finalPayload });

      workflowDetails.revalidate();

      // ✅ Delay navigation so toast shows
      setTimeout(() => {
        history.push("/digit-ui/employee/chb/inbox");
        window.location.reload();
      }, 2000);
      setLoader(false);
    } catch (err) {
      setLoader(false);
      return err;
    }
  };

  const fetchBillData = async () => {
    setLoading(true);
    const result = await Digit.PaymentService.fetchBill(tenantId, { businessService: "chb-services", consumerCode: acknowledgementIds });

    setBillData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchBillData();
  }, [tenantId, acknowledgementIds]);

  const { isLoading: auditDataLoading, isError: isAuditError, data: auditResponse } = Digit.Hooks.chb.useChbSearch(
    {
      tenantId,
      filters: { bookingNo: chbId, audit: true },
    },
    {
      enabled: true,
    }
  );

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "chb-services",
      consumerCodes: acknowledgementIds,
      isEmployee: false,
    },
    { enabled: acknowledgementIds ? true : false }
  );

  let docs = [];
  docs = application?.documents;

  const getChbAcknowledgement = async () => {
    const applications = application || {}; // getting application details
    const tenantInfo = tenants.find((tenant) => tenant.code === applications.tenantId);
    const acknowldgementDataAPI = await getChbAcknowledgementData({ ...applications }, tenantInfo, t);
    Digit.Utils.pdf.generate(acknowldgementDataAPI);
  };

  let documentDate = t("CS_NA");
  if (chb_details?.additionalDetails?.documentDate) {
    const date = new Date(chb_details?.additionalDetails?.documentDate);
    const month = Digit.Utils.date.monthNames[date.getMonth()];
    documentDate = `${date.getDate()} ${month} ${date.getFullYear()}`;
  }

  async function getRecieptSearch({ tenantId, payments, ...params }) {
    let application = data?.hallsBookingApplication?.[0];
    let fileStoreId = application?.paymentReceiptFilestoreId;
    if (!fileStoreId) {
      let response = { filestoreIds: [payments?.fileStoreId] };
      response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments, ...application }] }, "chbservice-receipt");
      const updatedApplication = {
        ...application,
        paymentReceiptFilestoreId: response?.filestoreIds[0],
      };
      await mutation.mutateAsync({
        hallsBookingApplication: updatedApplication,
      });
      fileStoreId = response?.filestoreIds[0];
      refetch();
    }
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
    window.open(fileStore[fileStoreId], "_blank");
  }

  async function getPermissionLetter({ tenantId, payments, ...params }) {
    let application = {
      hallsBookingApplication: (data?.hallsBookingApplication || []).map((app) => {
        return {
          ...app,
          bookingSlotDetails: [...(app.bookingSlotDetails || [])].sort((a, b) => {
            return new Date(a.bookingDate) - new Date(b.bookingDate);
          }),
        };
      }),
    };

    let fileStoreId = application?.permissionLetterFilestoreId;
    if (!fileStoreId) {
      const response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments, ...application }] }, "chb-permissionletter");
      fileStoreId = response?.filestoreIds[0];
    }
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
    window.open(fileStore[fileStoreId], "_blank");
  }

  let dowloadOptions = [];

  dowloadOptions.push({
    label: t("CHB_DOWNLOAD_ACK_FORM"),
    onClick: () => getChbAcknowledgement(),
  });

  if (reciept_data && reciept_data?.Payments.length > 0 && recieptDataLoading == false) {
    dowloadOptions.push({
      label: t("CHB_FEE_RECEIPT"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
    dowloadOptions.push({
      label: t("CHB_PERMISSION_LETTER"),
      onClick: () => getPermissionLetter({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
  }

  const columns = [
    { Header: `${t("CHB_HALL_NUMBER")}`, accessor: "communityHallCode" },
    { Header: `${t("CHB_COMMUNITY_HALL_NAME")}`, accessor: "hallName" },
    { Header: `${t("CHB_HALL_CODE")}`, accessor: "hallCode" },
    { Header: `${t("CHB_BOOKING_DATE")}`, accessor: "bookingDate" },
    { Header: `${t("PT_COMMON_TABLE_COL_STATUS_LABEL")}`, accessor: "bookingStatus" },
  ];

  const slotlistRows =
    chb_details?.bookingSlotDetails?.map((slot) => ({
      communityHallCode: `${t(chb_details?.communityHallCode)}`,
      hallName: chb_details?.communityHallName,
      hallCode: t(slot.hallCode) + " - " + slot.capacity,
      bookingDate: slot.bookingDate,
      bookingStatus: t(`WF_CHB_${slot?.status}`),
    })) || [];

  const submitAction = async (modalData) => {
    const payloadData = data?.hallsBookingApplication;

    // ✅ Extract the actual booking object from the array
    const bookingData = Array.isArray(payloadData) ? payloadData[0] : payloadData;

    const filtData = modalData?.Licenses?.[0];

    let checkAssigne;
    if (filtData.action == "SENDBACKTOCITIZEN") {
      checkAssigne = [payloadData?.owners?.[0]?.uuid];
    }

    const workflow = {
      action: filtData.action,
      assignes: filtData?.assignee || checkAssigne,
      comment: filtData?.comment,
      documents: filtData?.wfDocuments,
    };

    // ✅ Validation
    if (
      !filtData?.assignee &&
      filtData.action !== "SENDBACKTOCITIZEN" &&
      filtData.action !== "APPROVE" &&
      filtData.action !== "REJECT" &&
      filtData.action !== "SENDBACK" &&
      filtData.action !== "NOT_VERIFIED" &&
      filtData.action !== "VERIFIED"
    ) {
      setErrorOne("Assignee is Mandatory");
      setShowErrorToastt(true);

      return;
    } else if (!filtData?.comment) {
      setErrorOne("Comment is Mandatory");
      setShowErrorToastt(true);

      return;
    }

    // ✅ Final payload
    const finalPayload = {
      hallsBookingApplication: {
        ...bookingData,
        workflow,
      },
    };

    // return;

    try {
      const response = await Digit.CHBServices.update({ tenantId, ...finalPayload });

      // ✅ Show success first
      setShowToast({ key: "success", message: "Successfully updated the status" });
      setError("Successfully updated the status");

      workflowDetails.revalidate();

      // ✅ Delay navigation so toast shows
      setTimeout(() => {
        history.push("/digit-ui/employee/chb/inbox");
        window.location.reload();
      }, 2000);

      setSelectedAction(null);
      setShowModal(false);
    } catch (err) {
      setErrorOne("Something went wrong");
      setShowErrorToastt(true);
    }
  };

  const filteredActions = actions?.filter((a) => a.action !== "SUBMIT" && a.action !== "EDIT");

  return (
    <React.Fragment>
      <div>
        <Card>
          <CardSubHeader style={{ fontSize: "24px" }}>{t("CHB_APPLICANT_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CHB_APPLICANT_NAME")} text={chb_details?.applicantDetail?.applicantName || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_MOBILE_NUMBER")} text={chb_details?.applicantDetail?.applicantMobileNo || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_EMAIL_ID")} text={chb_details?.applicantDetail?.applicantEmailId || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_BOOKING_NO")} text={chb_details?.bookingNo} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("CHB_EVENT_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CHB_SPECIAL_CATEGORY")} text={t(chb_details?.specialCategory?.category) || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_PURPOSE")} text={t(chb_details?.purpose?.purpose) || t("CS_NA")} />
            <Row className="border-none" label={t("CHB_PURPOSE_DESCRIPTION")} text={chb_details?.purposeDescription || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("SLOT_DETAILS")}</CardSubHeader>
          <ApplicationTable
            t={t}
            data={slotlistRows}
            columns={columns}
            getCellProps={(cellInfo) => ({
              style: {
                minWidth: "150px",
                padding: "10px",
                fontSize: "16px",
                paddingLeft: "20px",
              },
            })}
            isPaginationRequired={false}
            totalRecords={slotlistRows.length}
          />
          <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
              {docs?.length > 0 ? (
                docs?.map((doc, index) => (
                  <React.Fragment key={index}>
                    <div>
                      <CHBDocument value={docs} Code={doc?.documentType} index={index} />
                      <CardSectionHeader style={{ marginTop: "10px", fontSize: "15px" }}>{t(doc?.documentType)}</CardSectionHeader>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
              )}
            </Card>
          </StatusTable>
        </Card>

        <CardSubHeader>{t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}</CardSubHeader>
        <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
        {actions && actions.length > 0 && !actions.some((a) => a.action === "SUBMIT") && (
          <ActionBar>
            {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
              <Menu localeKeyPrefix={`WF_EDITRENEWAL`} options={filteredActions} optionKey={"action"} t={t} onSelect={onActionSelect} />
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
            id={acknowledgementIds}
            applicationDetails={data}
            applicationData={data}
            closeModal={closeModal}
            submitAction={submitAction}
            actionData={workflowDetails?.data?.timeline}
            workflowDetails={workflowDetails}
            showToast={showToast}
            getEmployees={getEmployees}
            closeToast={closeToast}
            errors={error}
            showErrorToast={showErrorToast}
            errorOne={errorOne}
            closeToastOne={closeToastOne}
          />
        ) : null}
        {showToast && <Toast error={showToast.key == "error" ? true : false} label={error} isDleteBtn={true} onClose={closeToast} />}
        {(isLoading || auditDataLoading || getLoader || workflowDetails.isLoading || recieptDataLoading) && <Loader page={true} />}
      </div>
    </React.Fragment>
  );
};

export default CHBApplicationDetails;
