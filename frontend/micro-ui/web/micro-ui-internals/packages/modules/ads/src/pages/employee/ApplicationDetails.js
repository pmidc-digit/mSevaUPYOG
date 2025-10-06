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
  PageBasedInput,
  PDFSvg,
  MultiLink,
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import ADSDocument from "../../pageComponents/ADSDocument";
import ADSModal from "../../pageComponents/ADSModal";
import _ from "lodash";
import ApplicationDetailsTemplate from "../../../../templates/ApplicationDetails"; // adjust path if needed
import ADSWFApplicationTimeline from "../../pageComponents/ADSWFApplicationTimeline";
import { pdfDownloadLink } from "../../utils";

const ApplicationDetails = () => {
  const { id } = useParams();
  // const [wfActions, setWfActions] = useState([]);

  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [appDetails, setAppDetails] = useState({});

  const state = tenantId?.split(".")[0];
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState(null);
  const [displayData, setDisplayData] = useState({});
  const docs = Array.isArray(displayData?.Documents) ? displayData.Documents : Array.isArray(displayData?.documents) ? displayData.documents : [];
  const [pdfFiles, setPdfFiles] = useState({});
  const [filesLoading, setFilesLoading] = useState(false);

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

  const getFileUrl = (fileStoreId, pdfFilesMap) => {
    if (!fileStoreId || !pdfFilesMap) return null;

    // Handle different response formats from Filefetch API
    let raw = pdfFilesMap[fileStoreId];

    // If not found by fileStoreId, try searching through the entire map
    if (!raw) {
      // Check if pdfFilesMap is an array of file objects
      if (Array.isArray(pdfFilesMap)) {
        const fileObj = pdfFilesMap.find(
          (file) => file?.fileStoreId === fileStoreId || file?.fileId === fileStoreId || file?.documentDetailId === fileStoreId
        );
        raw = fileObj?.url || fileObj?.fileUrl || null;
      }
      // Check if pdfFilesMap is a single file object
      else if (typeof pdfFilesMap === "object" && pdfFilesMap.url) {
        raw = pdfFilesMap.url;
      }
    }

    if (!raw) return null;

    // Handle comma-separated URLs (different formats)
    if (typeof raw === "string" && raw.includes(",")) {
      const urls = raw.split(",").map((url) => url.trim());
      // Return the first non-thumbnail URL
      const mainUrl = urls.find(
        (url) =>
          !url.toLowerCase().includes("large") &&
          !url.toLowerCase().includes("medium") &&
          !url.toLowerCase().includes("small") &&
          !url.toLowerCase().includes("thumbnail")
      );
      return mainUrl || urls[0];
    }

    // Handle array of URLs
    if (Array.isArray(raw)) return raw[0];

    // Handle object with URL properties
    if (typeof raw === "object") {
      return raw.url || raw.fileUrl || raw[0] || null;
    }

    // Handle string URL
    if (typeof raw === "string") return raw;

    return null;
  };
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    const filesArray = (docs || [])
      .map((d) => {
        // try common keys and shapes
        if (!d) return null;
        if (d.fileStoreId) return d.fileStoreId;
        if (d.fileStoreIds && Array.isArray(d.fileStoreIds)) return d.fileStoreIds[0];
        if (d.fileId) return d.fileId;
        if (d.documentDetailId) return d.documentDetailId;
        // if fileStoreId is nested:
        if (d?.file?.fileStoreId) return d.file.fileStoreId;
        return null;
      })
      .filter(Boolean);

    if (!filesArray?.length) {
      setPdfFiles({});
      setFilesLoading(false);
      return;
    }

    setFilesLoading(true);

    // try stateId first (as before) but fall back to tenantId if needed
    const stateId = Digit?.ULBService?.getStateId?.() || null;
    const argForFilefetch = stateId || tenantId;

    Digit.UploadServices.Filefetch(filesArray, argForFilefetch)
      .then((res) => {
        // robustly find where the mapping lives:
        let data = res?.data ?? res?.files ?? res;
        // if the API returned an array of {fileStoreId, url}, convert to map:
        if (Array.isArray(data)) {
          const asMap = {};
          data.forEach((item) => {
            if (!item) return;
            if (typeof item === "string") {
              // unclear entry, skip
              return;
            }
            const id = item.fileStoreId || item.fileId || item.documentDetailId;
            const url = item.url || item.fileUrl || (typeof item === "string" ? item : null);
            if (id && url) asMap[id] = url;
          });
          data = asMap;
        }

        setPdfFiles(data || {});
      })
      .catch((err) => {
        console.error("Filefetch error:", err);
        setPdfFiles({});
      })
      .finally(() => setFilesLoading(false));
  }, [JSON.stringify(docs)]);

  const { isLoading, data: applicationDetails, refetch } = Digit.Hooks.ads.useADSSearch({
    tenantId,
    filters: { bookingNo: id },
  });

  const normalizedAppObject = applicationDetails?.bookingApplication?.[0] ?? [];
  const bookingObj = normalizedAppObject;
  const application = bookingObj || normalizedAppObject || appDetails || null;

  // derive normalized actions from businessServiceData
  const menuRef = useRef();

  // final filtered actions to display
  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ADDED: states & hooks from old file to support downloads
  const [showOptions, setShowOptions] = useState(false);
  const mutation = Digit.Hooks.ads?.useADSCreateAPI?.(tenantId, false);

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "ADV",
      consumerCodes: displayData?.applicantData?.applicationNo || id,
      isEmployee: false,
    },
    { enabled: !!(displayData?.applicantData?.applicationNo || id) }
  );

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

  const businessServicMINE = "advandhoarding";
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: bookingObj?.bookingNo,
    moduleCode: businessServicMINE,
  });

  // ADD (derived actions)
  const wfActions =
    workflowDetails?.data?.nextActions?.map((a) => ({
      action: a?.action,
      buttonLabel: (a?.action || "").replace(/_/g, " ").toUpperCase(),
    })) || [];

  useEffect(() => {
    const adsObject = bookingObj;
    if (adsObject) {
      const applicantData = {
        applicationNo: adsObject?.bookingNo,
        name: adsObject?.applicantDetail?.applicantName,
        email: adsObject?.applicantDetail?.applicantEmailId,
        mobile: adsObject?.applicantDetail?.applicantMobileNo,
        address: adsObject?.address?.addressLine1,
        pincode: adsObject?.address?.pincode,
        bookingStatus: adsObject?.bookingStatus,
        paymentDate: adsObject?.paymentDate ? new Date(adsObject.paymentDate).toLocaleDateString() : "",
        receiptNo: adsObject?.receiptNo,
      };

      const Documents = removeDuplicatesByUUID(adsObject?.documents || []);
      const AdsDetails =
        adsObject?.cartDetails?.map((item) => ({
          adType: item?.addType,
          location: item?.location,
          faceArea: item?.faceArea,
          bookingDate: item?.bookingDate,
          bookingTime: `${item?.bookingFromTime} - ${item?.bookingToTime}`,
          nightLight: item?.nightLight ? t("YES") : t("NO"),
          status: item?.status,
        })) || [];

      setDisplayData({ applicantData, Documents, AdsDetails });
    } else {
      // if the bookingObj disappears, clear the displayData to avoid showing stale UI
      setDisplayData({});
    }
  }, [bookingObj, t]);

  useEffect(() => {
    // derive loading state from the hook + whether we have the normalized object
    setIsDetailsLoading(isLoading || !bookingObj);

    // populate appDetails from bookingObj (if present)
    if (bookingObj) {
      // keep a simple shape expected by the rest of your UI
      setAppDetails({ ...bookingObj, applicationDetails: [{ title: "ADS_DETAILS_SUMMARY_LABEL" }] });
    } else {
      setAppDetails({});
    }

    // helpful debug during dev — remove later if noisy
    console.debug("bookingObj (normalized):", bookingObj, "isLoading:", isLoading);
  }, [isLoading, bookingObj]);

  function onActionSelect(wfAction) {
    if (!wfAction) return;

    // Quick route for payment
    if (wfAction.action === "PAY") {
      const appNo = displayData?.applicantData?.applicationNo || id;
      return history.push(`/digit-ui/employee/payment/collect/adv-services/${appNo}/${tenantId}?tenantId=${tenantId}`);
    }

    // Direct submit for simple actions (same behavior you had)
    if (wfAction.action === "SUBMIT" || wfAction.action === "INITIATE") {
      const payloadAction = {
        action: wfAction.action,
        comment: wfAction.action || "",
      };
      return submitAction({ Licenses: [payloadAction] });
    }

    // Open modal for others
    setSelectedAction({
      action: wfAction.action,
      comment: "",
    });
    setShowModal(true);
  }

  const submitAction = async (dataPayload) => {
    const payloadSource = applicationDetails?.Applications?.[0] ?? applicationDetails?.data?.[0] ?? applicationDetails?.[0] ?? bookingObj;

    if (!payloadSource) {
      setShowToast({ key: "error", message: "Application data not loaded. Try reloading the page." });
      setError("Application data not loaded");
      return;
    }

    const filtData = dataPayload?.Licenses?.[0] || dataPayload;

    if (!filtData || !filtData.action) {
      setShowToast({ key: "error", message: "No workflow action provided" });
      setError("No workflow action provided");
      return;
    }

    const normalizedAssignee = normalizeAssignees(filtData?.assignee || filtData?.assignees || filtData?.assigneeUuid);

    // Pull businessService from workflowDetails; fallback to "ADV"
    const businessService = workflowDetails?.data?.applicationBusinessService || "ADV";

    // Build minimal workflow payload — let backend resolve state/status
    const formData = {
      tenantId,
      ...payloadSource,
      documents: payloadSource?.documents || payloadSource?.Documents || [],
      workflow: {
        businessService,
        action: filtData.action,
        comments: filtData.comment || filtData.action || "",
        documents: filtData?.wfDocuments ? filtData?.wfDocuments : null,
        ...(normalizedAssignee ? { assignes: normalizedAssignee } : {}),
      },
    };

    // Optional: Only set bookingStatus when absolutely required by backend
    // Otherwise, let workflow transition compute it
    // formData.bookingStatus = payloadSource?.bookingStatus;

    // Validation: FORWARD requires assignee
    if (!filtData?.assignee && filtData.action === "FORWARD") {
      setShowToast({ key: "error", message: "Assignee is mandatory" });
      setError("Assignee is mandatory");
      return;
    }

    try {
      if (!Digit?.ADSServices || typeof Digit.ADSServices.update !== "function") {
        throw new Error("Digit.ADSServices.update is not available in this runtime");
      }

      const response = await Digit.ADSServices.update({ bookingApplication: formData }, tenantId);

      if (response?.ResponseInfo?.status === "SUCCESSFUL" || response?.status === "SUCCESSFUL") {
        setShowToast({ key: "success", message: "Successfully updated the status" });
        setError("Successfully updated the status");

        // Revalidate the workflow details to refresh nextActions/timeline
        workflowDetails?.revalidate?.();

        setTimeout(() => {
          history.push("/digit-ui/employee/ads/inbox");
        }, 1200);

        setSelectedAction(null);
        setShowModal(false);
      } else {
        setShowToast({ key: "error", message: t?.("SOMETHING_WENT_WRONG") || "Failed to update" });
        setError("Failed to update");
      }
    } catch (err) {
      console.error("submitAction error:", err);
      setShowToast({ key: "error", message: "Something went wrong" });
      setError("Something went wrong");
    }
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  // ADDED: functions to generate/print the receipt and permission letter (from old file)
  async function getRecieptSearch({ tenantId: tId, payments }) {
    try {
      let application = reciept_data?.bookingApplication?.[0] || {};
      let fileStoreId = application?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        let response = await Digit.PaymentService.generatePdf(tId, { Payments: [{ ...payments }] }, "advservice-receipt");
        const updatedApplication = {
          ...application,
          paymentReceiptFilestoreId: response?.filestoreIds?.[0],
        };
        if (mutation?.mutateAsync) await mutation.mutateAsync({ bookingApplication: updatedApplication });
        fileStoreId = response?.filestoreIds?.[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } catch (e) {
      console.error("getRecieptSearch error", e);
      setShowToast({ key: "error", message: "Unable to fetch receipt" });
    }
  }
  const handleDownload = async (document, tenantid) => {
    try {
      const tId = tenantid || tenantId;
      const res = await Digit.UploadServices.Filefetch([document?.fileStoreId], tId);
      // some Filefetch responses put mapping in res.data, some directly in res
      const filefetchData = res?.data ?? res;
      const documentLink = pdfDownloadLink(filefetchData, document?.fileStoreId);
      if (documentLink) window.open(documentLink, "_blank");
      else setShowToast({ key: "error", message: "Unable to open document" });
    } catch (e) {
      console.error("handleDownload error", e);
      setShowToast({ key: "error", message: "Unable to download document" });
    }
  };
  async function getPermissionLetter({ tenantId: tId, payments }) {
    try {
      let application = reciept_data?.bookingApplication?.[0] || {};
      let fileStoreId = application?.permissionLetterFilestoreId;
      if (!fileStoreId) {
        const response = await Digit.PaymentService.generatePdf(tId, { bookingApplication: [application] }, "advpermissionletter");
        const updatedApplication = {
          ...application,
          permissionLetterFilestoreId: response?.filestoreIds?.[0],
        };
        if (mutation?.mutateAsync) await mutation.mutateAsync({ bookingApplication: updatedApplication });
        fileStoreId = response?.filestoreIds?.[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } catch (e) {
      console.error("getPermissionLetter error", e);
      setShowToast({ key: "error", message: "Unable to fetch permission letter" });
    }
  }

  // ADDED: build download options from receipt hook
  let downloadOptions = [];
  if (reciept_data && reciept_data?.Payments?.length > 0 && recieptDataLoading === false) {
    downloadOptions.push({
      label: t("ADS_FEE_RECEIPT"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
    downloadOptions.push({
      label: t("ADS_PERMISSION_LETTER"),
      onClick: () => getPermissionLetter({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
  }

  if (isLoading || isDetailsLoading) {
    return <Loader />;
  }

  return (
    <div className={"employee-main-application-details"}>
      {/* Header with MultiLink download dropdown (merged old feature) */}
      <div style={{ marginBottom: "15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Header styles={{ fontSize: "32px" }}>{t("ADS_APP_OVER_VIEW_HEADER")}</Header>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {downloadOptions && downloadOptions?.length > 0 && (
              <div style={{ position: "relative", zIndex: 10 }}>
                <MultiLink
                  className="multilinkWrapper"
                  onHeadClick={() => setShowOptions(!showOptions)}
                  displayOptions={showOptions}
                  options={downloadOptions}
                  downloadBtnClassName={"employee-download-btn-className"}
                  optionsClassName={"employee-options-btn-className"}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Existing cards and document rendering (preserved from your new file) */}
      <Card>
        <CardSubHeader>{t("ADS_APPLICATION_DETAILS_OVERVIEW")}</CardSubHeader>
        <StatusTable>
          {displayData?.applicantData &&
            Object.entries(displayData.applicantData)
              // filter out empty, null, undefined, or empty arrays/objects
              .filter(([_, value]) => {
                if (value === null || value === undefined) return false;
                if (typeof value === "string" && value.trim() === "") return false;
                if (Array.isArray(value) && value.length === 0) return false;
                if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return false;
                return true;
              })
              .map(([key, value]) => (
                <Row
                  key={key}
                  label={t(key?.toUpperCase())}
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
        <CardSubHeader>{t("ADS_APPLICATION_ADS_DETAILS_OVERVIEW")}</CardSubHeader>
        {displayData?.AdsDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("ADS_AD_TYPE")} text={t(detail.adType) || detail.adType} />
              <Row label={t("ADS_LOCATION")} text={detail.location || "N/A"} />
              <Row label={t("ADS_FACE_AREA")} text={detail.faceArea || "N/A"} />
              <Row label={t("CHB_BOOKING_DATE")} text={detail.bookingDate || "N/A"} />
              {/* <Row label={t("ADS_BOOKING_TIME")} text={detail.bookingTime || "N/A"} /> */}
              <Row label={t("ADS_NIGHT_LIGHT")} text={detail.nightLight ? "Yes" : "No"} />
              <Row label={t("ADS_STATUS")} text={t(detail.status) || detail.status} />
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("ADS_APPLICATION_DOCUMENTS_OVERVIEW")}</CardSubHeader>
        <>
          {application?.documents?.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
              {application?.documents.map((doc, idx) => (
                <div key={idx}>
                  {t(doc?.documentType)}
                  <ADSDocument value={application?.documents} Code={doc?.documentType} index={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "0 1.5rem" }}>{t("TL_NO_DOCUMENTS_MSG")}</div>
          )}
        </>

        <ADSWFApplicationTimeline application={application} id={displayData?.applicantData?.applicationNo || id} userType={"employee"} />
        {showToast && (
          <Toast
            error={showToast.key === "error"}
            label={showToast.label ? t(showToast.label) : showToast.message || showToast}
            style={{ bottom: "0px" }}
            onClose={() => {
              setShowToast(null);
            }}
          />
        )}
      </Card>

      {/* BEFORE: !businessLoading && Array.isArray(wfActions) && wfActions.length > 0 */}
      {!workflowDetails?.isLoading && Array.isArray(wfActions) && wfActions?.length > 0 && (
        <ActionBar>
          {displayMenu && (
            <Menu
              localeKeyPrefix={`WF_EMPLOYEE_${"ADS"}`}
              options={wfActions}
              optionKey={"buttonLabel"}
              t={t}
              onSelect={(wfAction) => {
                onActionSelect(wfAction);
                setDisplayMenu(false);
              }}
            />
          )}
          <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      )}

      {showModal ? (
        <ADSModal
          t={t}
          action={selectedAction}
          tenantId={tenantId}
          state={state}
          bookingNo={id}
          applicationDetails={applicationDetails}
          applicationData={applicationDetails?.applicationData}
          closeModal={closeModal}
          submitAction={submitAction}
          // REPLACE these:
          // actionData={businessServiceData?.BusinessServices?.[0]?.states || []}
          // businessService={"ADV"}
          // moduleCode={"ADV"}
          // workflowConfig={businessServiceData}
          // workflowActions={wfActions}

          // WITH minimal info from workflowDetails
          actionData={workflowDetails?.data?.processInstances || []}
          businessService={workflowDetails?.data?.applicationBusinessService || "ADV"}
          moduleCode={"advandhoarding"}
          workflowActions={wfActions}
          showToast={showToast}
          closeToast={closeToast}
          errors={error}
        />
      ) : null}

      {showToast && (
        <Toast
          error={showToast.key === "error"}
          label={showToast.label ? t(showToast.label) : showToast.message || showToast}
          style={{ bottom: "0px" }}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}

      {/* OPTIONAL: if you prefer the old template instead of the cards above, uncomment below and pass the correct data shape
      <ApplicationDetailsTemplate
        applicationDetails={applicationDetails}
        isLoading={isLoading}
        isDataLoading={isLoading}
        applicationData={bookingObj || applicationDetails?.applicationData}
        showToast={showToast}
        setShowToast={setShowToast}
        closeToast={closeToast}
        MenuStyle={{ color: "#FFFFFF", fontSize: "18px" }}
      />
      */}
    </div>
  );
};

export default ApplicationDetails;
