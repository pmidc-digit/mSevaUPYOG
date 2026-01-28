import { Card, CardSubHeader, Header, Loader, Row, StatusTable, MultiLink, Toast } from "@mseva/digit-ui-react-components";
import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams, Link } from "react-router-dom";
import ADSDocument from "../../pageComponents/ADSDocument";
import { pdfDownloadLink, transformBookingResponseToBookingData, transformAdsData } from "../../utils";
import get from "lodash/get";
import NewApplicationTimeline from "../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import getAcknowledgement from "../../getAcknowledgment";
import ADSCartDetails from "../../pageComponents/ADSCartDetails";
/*
 * ADSApplicationDetails includes hooks for data fetching, translation, and state management.
 * The component displays various application details, such as applicant information,
 * booking data, and related documents, using components  ApplicationTable.
 */
const ADSApplicationDetails = () => {
  const [wfActionsState, setWfActionsState] = useState([]); // not strictly required but kept for parity
  const { t } = useTranslation();
  const history = useHistory();
  const { acknowledgementIds, tenantId } = useParams();
  const [showOptions, setShowOptions] = useState(false);
  const [showToast, setShowToast] = useState(null);

  // removed businessServiceData & businessLoading (we now use workflowDetails)
  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const menuRef = useRef();
  const [actionError, setActionError] = useState(null);

  function normalizeAssignees(assignee) {
    if (!assignee) return null;

    const extract = (item) => {
      if (!item) return null;
      if (typeof item === "string") return item;
      // common object shapes: { uuid }, { id }, { employeeId }, { code }
      return item.uuid || item.id || item.employeeId || item.code || null;
    };

    if (Array.isArray(assignee)) {
      const mapped = assignee.map((it) => extract(it)).filter(Boolean);
      return mapped.length ? mapped : null;
    }

    // single object or string
    const single = extract(assignee);
    return single ? [single] : null;
  }

  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { isLoading, error, data: adsData, refetch } = Digit.Hooks.ads.useADSSearch({
    tenantId,
    filters: { bookingNo: acknowledgementIds },
  });
  const new_data = transformBookingResponseToBookingData(adsData);

  const mutation = Digit.Hooks.ads.useADSCreateAPI(tenantId, false);

  useEffect(() => {
    refetch();
  }, [acknowledgementIds, refetch]);
  const BookingApplication = get(adsData, "bookingApplication", []);
  const adsId = get(adsData, "bookingApplication[0].bookingNo", []);
  let ads_details = (BookingApplication && BookingApplication.length > 0 && BookingApplication[0]) || {};
  const application = ads_details;

  const businessServicMINE = "advandhoarding";
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: acknowledgementIds,
    moduleCode: businessServicMINE,
  });

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "adv-services",
      consumerCodes: acknowledgementIds,
      isEmployee: false,
    },
    { enabled: acknowledgementIds ? true : false }
  );
  const wfActions =
    workflowDetails?.data?.nextActions?.map((a) => ({
      ...a,
      action: a?.action,
      buttonLabel: (a?.action || "").replace(/_/g, " ").toUpperCase(),
      assignee: a?.assignee || null,
      nextStateUuid: a?.nextState || null,
    })) || [];

  useEffect(() => {
    setWfActionsState(wfActions);
  }, [JSON.stringify(wfActions)]); // stringify so deep changes trigger effect

  // removed refreshBusinessService & its useEffect
  const closeMenu = () => {
    setDisplayMenu(false);
  };
  Digit.Hooks.useClickOutside && Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const { isLoading: auditDataLoading, isError: isAuditError, data: auditResponse } = Digit.Hooks.ads.useADSSearch(
    {
      tenantId,
      filters: { bookingNo: adsId, audit: true },
    },
    {
      enabled: true,
    }
  );

  let docs = [];
  docs = application?.documents ?? [];

  // Use workflowDetails.isLoading instead of businessLoading
  if (isLoading || auditDataLoading || workflowDetails?.isLoading) {
    return <Loader />;
  }

  let documentDate = t("CS_NA");
  if (ads_details?.additionalDetails?.documentDate) {
    const date = new Date(ads_details?.additionalDetails?.documentDate);
    const month = Digit.Utils.date.monthNames[date.getMonth()];
    documentDate = `${date.getDate()} ${month} ${date.getFullYear()}`;
  }
  // in progress
  async function getRecieptSearch({ tenantId, payments, ...params }) {
    let application = new_data;
    const response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments, ...application }] }, "adv-bill");
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  }

  async function getPermissionLetter({ tenantId, payments, ...params }) {
    let application = new_data;
    let fileStoreId = application?.permissionLetterFilestoreId;

    if (!fileStoreId) {
      const response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments, ...application }] }, "adv-permissionletter");
      fileStoreId = response?.filestoreIds[0];
    }

    const fileStore = await Digit.PaymentService.printReciept(tenantId, {
      fileStoreIds: fileStoreId,
    });

    window.open(fileStore[fileStoreId], "_blank");
  }

  const downloadAcknowledgement = async (application) => {
    try {
      if (!application) {
        throw new Error("Booking Application data is missing");
      }

      getAcknowledgement(application, t);
      setShowToast({
        key: "success",
        message: "ADV_ACKNOWLEDGEMENT_DOWNLOADED_SUCCESSFULLY",
      });
      setActionError("Acknowledgment downloaded successfully");
    } catch (error) {
      console.error("Acknowledgement download error:", error);
      setShowToast({
        key: "error",
        message: `ADV_ACKNOWLEDGEMENT_DOWNLOAD_ERROR: ${error.message}`,
      });
      setActionError("Something went wrong");
    }
  };

  function onActionSelect(wfAction) {
    if (!wfAction) return;

    if (wfAction.action === "PAY") {
      const appNo = ads_details?.bookingNo || acknowledgementIds;
      return history.push(`/digit-ui/citizen/payment/collect/adv-services/${appNo}/${tenantId}?tenantId=${tenantId}`);
    }

    if (wfAction.action === "SUBMIT" || wfAction.action === "INITIATE") {
      const payloadAction = {
        action: wfAction.action,
        assignee: wfAction.assignee || null,
        comment: wfAction.comment || "",
        nextState: wfAction.nextState || wfAction.nextStateUuid || null,
        status: wfAction.status || wfAction.nextStateUuid || "",
      };
      return submitAction({ Licenses: [payloadAction] });
    }

    // otherwise open modal and pass raw action object
    setSelectedAction({
      action: wfAction.action,
      assignee: wfAction.assignee || null,
      comment: wfAction.comment || "",
      nextState: wfAction.nextState || wfAction.nextStateUuid || null,
      status: wfAction.status || null,
      rawAction: wfAction,
    });
    setShowModal(true);
  }

  const submitAction = async (dataPayload) => {
    const payloadSource = adsData?.bookingApplication?.[0] ?? ads_details ?? null;
    if (!payloadSource) {
      setShowToast({ key: "error", message: "Application data not loaded. Try reloading the page." });
      setActionError("Application data not loaded");
      return;
    }
    // Support both shapes: old { Licenses: [...] } or raw object (from wfActions)
    const filtData = dataPayload?.Licenses?.[0] || dataPayload;
    const normalizedAssignee = normalizeAssignees(filtData?.assignee || filtData?.assignees || filtData?.assigneeUuid);

    if (!filtData || !filtData.action) {
      setShowToast({ key: "error", message: "No workflow action provided" });
      setActionError("No workflow action provided");
      return;
    }

    // Find the matching state using live workflowDetails (falls back to filtData.status)
    const matchingState =
      workflowDetails?.data?.processInstances?.find((p) => (p?.nextActions || []).some((a) => a?.action === filtData.action))?.state?.state ||
      filtData.status ||
      "";

    const formData = {
      tenantId: tenantId,
      ...payloadSource,
      bookingStatus: filtData.status
        ? filtData.status === "INITIATED"
          ? "BOOKING_CREATED"
          : filtData.status === "REFUND"
          ? "CANCELLED"
          : filtData.status
        : filtData.nextState === "INITIATED"
        ? "BOOKING_CREATED"
        : filtData.nextState === "REFUND"
        ? "CANCELLED"
        : payloadSource?.bookingStatus,
      documents: payloadSource?.documents || payloadSource?.Documents || [],
      workflow: {
        // Use live workflow businessService if available
        businessService: workflowDetails?.data?.applicationBusinessService || "ADV",
        states: matchingState || filtData.status || "",
        action: filtData.action || "",
        comments: filtData.comment || filtData.action || "",
        status: filtData.status || filtData.nextState || "",
        ...(normalizedAssignee ? { assignee: normalizedAssignee } : {}),
        // assignee: filtData.assignee[0] || filtData.assignee || null,
      },
    };

    const requestBody = { bookingApplication: formData };
    // enforce assignee for FORWARD (same as before)
    if (!filtData?.assignee && filtData.action === "FORWARD") {
      setShowToast({ key: "error", message: "Assignee is mandatory" });
      setActionError("Assignee is mandatory");
      return;
    }

    try {
      if (!Digit?.ADSServices || typeof Digit.ADSServices.update !== "function") {
        throw new Error("Digit.ADSServices.update is not available in this runtime");
      }

      const response = await Digit.ADSServices.update(requestBody, tenantId);

      if (response?.ResponseInfo?.status === "SUCCESSFUL" || response?.status === "SUCCESSFUL") {
        setShowToast({ key: "success", message: "Successfully updated the status" });
        setActionError("Successfully updated the status");

        // refresh live workflow details so UI picks up new actions
        workflowDetails?.revalidate?.();

        setTimeout(() => {
          history.push("/digit-ui/citizen/ads-home");
        }, 1200);

        setSelectedAction(null);
        setShowModal(false);
      } else {
        console.error("ADS update returned non-successful response:", response);
        setShowToast({ key: "error", message: (t && t("SOMETHING_WENT_WRONG")) || "Failed to update" });
        setActionError("Failed to update");
      }
    } catch (err) {
      console.error("submitAction error:", err);
      if (err?.message && err.message.includes("ADSServices.update is not available")) {
        setShowToast({ key: "error", message: "Update function not available. Check Digit.ADSServices" });
        setActionError("Update function not available");
      } else {
        setShowToast({ key: "error", message: "Something went wrong" });
        setActionError("Something went wrong");
      }
    }
  };

  const handleDownload = async (document, tenantid) => {
    let tenantId = tenantid ? tenantid : tenantId;
    const res = await Digit.UploadServices.Filefetch([document?.fileStoreId], tenantId);
    let documentLink = pdfDownloadLink(res.data, document?.fileStoreId);
    window.open(documentLink, "_blank");
  };

  let dowloadOptions = [];

  const cartData = transformAdsData(ads_details?.cartDetails);
  dowloadOptions.push({
    label: t("PTR_PET_DOWNLOAD_ACK_FORM"),
    onClick: () => downloadAcknowledgement(application),
  });

  if (reciept_data && reciept_data?.Payments.length > 0 && !recieptDataLoading) {
    dowloadOptions.push({
      label: t("CHB_FEE_RECEIPT"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
    dowloadOptions.push({
      label: t("CHB_PERMISSION_LETTER"),
      onClick: () => getPermissionLetter({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
  }

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px" }}>{t("ADS_BOOKING_DETAILS")}</Header>
          {dowloadOptions && dowloadOptions.length > 0 && (
            <MultiLink
              className="multilinkWrapper"
              onHeadClick={() => setShowOptions(!showOptions)}
              displayOptions={showOptions}
              options={dowloadOptions}
            />
          )}
        </div>
        <Card>
          <StatusTable></StatusTable>
          <CardSubHeader style={{ fontSize: "24px" }}>{t("ADS_APPLICANT_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("ADS_APPLICANT_NAME")} text={ads_details?.applicantDetail?.applicantName || t("CS_NA")} />
            <Row className="border-none" label={t("ADS_MOBILE_NUMBER")} text={ads_details?.applicantDetail?.applicantMobileNo || t("CS_NA")} />
            <Row className="border-none" label={t("ADS_EMAIL_ID")} text={ads_details?.applicantDetail?.applicantEmailId || t("CS_NA")} />
            <Row className="border-none" label={t("PTR_ADDRESS")} text={ads_details?.address?.addressLine1 || t("CS_NA")} />
            <Row className="border-none" label={t("ADS_ADDRESS_PINCODE")} text={ads_details?.address?.pincode || t("CS_NA")} />
            <Row className="border-none" label={t("ADS_BOOKING_NO")} text={ads_details?.bookingNo} />
            <Row className="border-none" label={t("BOOKING_STATUS")} text={t(ads_details?.bookingStatus)} />
            {ads_details?.receiptNo && (
              <Row className="border-none" label={t("CITIZEN_SUCCESS_ADVT_HOARDINGS_PAYMENT_RECEIPT_NO")} text={ads_details?.receiptNo} />
            )}
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ADS_APPLICATION_ADS_DETAILS_OVERVIEW")}</CardSubHeader>
          <ADSCartDetails cartDetails={cartData ?? []} t={t} />

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ADS_DOCUMENTS_DETAILS")}</CardSubHeader>
          <StatusTable>
            {docs?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
                {docs.map((doc, index) => (
                  <div key={index}>
                    <ADSDocument value={docs} Code={doc?.documentType} index={index} />
                    {t(doc?.documentType)}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "0 1.5rem" }}>{t("TL_NO_DOCUMENTS_MSG")}</div>
            )}
          </StatusTable>
          <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
        </Card>

        {showToast && <Toast error={showToast.key === "error"} label={actionError || error} onClose={() => setShowToast(null)} isDleteBtn={true} />}
      </div>
    </React.Fragment>
  );
};

export default ADSApplicationDetails;
