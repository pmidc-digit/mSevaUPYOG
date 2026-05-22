import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EmployeeData, downloadPdfFromURL, amountToWords } from "../../../utils";
import { Header, Loader, Card, CardSectionHeader, StatusTable, Row, SubmitBar, ActionBar,MultiLink } from "@mseva/digit-ui-react-components";
import getNOCSanctionLetter from "../../../utils/getNOCSanctionLetter";
import {getNOCAcknowledgementData} from "../../../utils/getNOCAcknowledgementData";
import NOCDocumentTableView from "../../../pageComponents/NOCDocumentTableView";

const formatDate = (epoch) => {
  if (!epoch) return "-";
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const StatusBadge = ({ status }) => {
  const colorMap = {
    INITIATED: "#f0a500",
    APPLIED: "#1858b8",
    APPROVED: "#00703c",
    REJECTED: "#d4351c",
    CANCELLED: "#888",
  };
  const color = colorMap[status] || "#505A5F";
  return (
    <span
      style={{
        background: `${color}1a`,
        color,
        border: `1px solid ${color}`,
        borderRadius: "12px",
        padding: "2px 10px",
        fontSize: "13px",
        fontWeight: "600",
      }}
    >
      {status || "-"}
    </span>
  );
};

const FireNOCApplicationOverview = () => {
  const { appNo } = useParams();
  const location = useLocation();
  const history = useHistory();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [showOptions, setShowOptions] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const tenantId = queryParams.get("tenantId") || Digit.ULBService.getStateId();
  let EmpData = EmployeeData(tenantId, appNo);


  const { isLoading, data: fireNOC } = Digit.Hooks.firenoc.useFIRENOCApplicationDetails({
    tenantId,
    applicationNumber: appNo,
  });

  const [payment, setPayment] = useState(null);
  const [workflow, setWorkflow] = useState([]);
  const [workflowObj, setWorkflowObj] = useState([]);

  useEffect(() => {
    if (!appNo || !tenantId) return;
    setLoading(true);
    const authToken = Digit.UserService.getUser()?.access_token || "";
    fetch(
      `/collection-services/payments/FIRENOC/_search?tenantId=${encodeURIComponent(tenantId)}&consumerCodes=${encodeURIComponent(appNo)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
          RequestInfo: {
            apiId: "Rainmaker",
            ver: ".01",
            action: "",
            did: "1",
            key: "",
            msgId: `${Date.now()}|en_IN`,
            requesterId: "",
            authToken,
          },
        }),
      }
    )
      .then((r) => r.json())
      .then((data) => setPayment(data?.Payments?.[0] || null))
      .catch(() => {})
      .finally(() => {setLoading(false)});
  }, [appNo, tenantId]);

  useEffect(() => {
    if (!appNo || !tenantId) return;
    const authToken = Digit.UserService.getUser()?.access_token || "";
    fetch(
      `/egov-workflow-v2/egov-wf/process/_search?businessIds=${encodeURIComponent(appNo)}&history=true&tenantId=${encodeURIComponent(tenantId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
          RequestInfo: { apiId: "Mihy", ver: ".01", action: "", did: "1", key: "", msgId: `${Date.now()}|en_IN`, requesterId: "", authToken },
        }),
      }
    )
      .then((r) => r.json())
      .then((data) => setWorkflow([...(data?.ProcessInstances || [])].reverse()))
      .then((data) => setWorkflowObj([...(data || [])]))
      .catch(() => {});
  }, [appNo, tenantId]);

  const finalComment = useMemo(() => {
    if (!workflowObj || workflowObj.length === 0) {
      return "";
    }

    const commentsobj = workflowObj[0]?.data?.timeline
      ?.filter((item) => item?.performedAction === "APPROVE")
      ?.flatMap((item) => item?.wfComment || []);

    const approvercomments = commentsobj?.[0];

    let conditionText = "";
    if (approvercomments?.includes("[#?..**]")) {
      conditionText = approvercomments.split("[#?..**]")[1] || "";
    }

    return conditionText
      ? {
          ConditionLine: "The above approval is subjected to the following conditions:\n",
          ConditionText: conditionText,
        }
      : "";
  }, [workflowObj]);

  if (isLoading) return <Loader />;
  if (!fireNOC)
    return (
      <Card style={{ textAlign: "center", marginTop: "40px" }}>
        {t("COMMON_NO_DATA_FOUND")}
      </Card>
    );

  const details = fireNOC.fireNOCDetails;
  console.log('details', details)
  const owner = details?.applicantDetails?.owners?.[0];
  const building = details?.buildings?.[0];
  const address = details?.propertyDetails?.address;

  const remainingDocs = (fireNOC?.documents || details?.applicantDetails?.additionalDetail?.ownerAuditionalDetail?.documents || [])
    ?.filter(
      (doc) =>
        doc?.documentType !== "OWNER.SITEPHOTOGRAPHONE" &&
        doc?.documentType !== "OWNER.SITEPHOTOGRAPHTWO"
    )
    ?.map((doc) => ({
      ...doc,
      documentUid: doc?.documentUid || doc?.fileStoreId || doc?.filestoreId || doc?.uuid || "",
      documentAttachment: doc?.documentAttachment || doc?.fileStoreId || doc?.filestoreId || doc?.uuid || "",
    }));

  const uomMap = {};
  building?.uoms?.filter((u) => u.active).forEach((u) => {
    uomMap[u.code] = u.value;
  });

  const paymentDetail = payment?.paymentDetails?.[0];
  console.log('paymentDetail', paymentDetail)
  const isPendingPayment = details?.status === "PENDINGPAYMENT";
  
  const dowloadOptions = [];
  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      const Property = fireNOC;
      const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
      console.log('tenantInfo', tenantInfo)
      // const site = Property?.nocDetails?.additionalDetails?.siteDetails;
      const ulbType = tenantInfo?.city?.ulbType;
      const ulbName = tenantInfo?.city?.name;

      const acknowledgementData = await getNOCAcknowledgementData(Property, tenantInfo, ulbType, ulbName, t);
      setTimeout(() => {
        Digit.Utils.pdf.generateFormattedFireNoc(acknowledgementData);
      }, 0);
    } catch (error) {
      // console.error("Error generating acknowledgement:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecieptSearch = async ({ tenantId, payments, pdfkey, EmpData, ...params }) => {
    try {
      setLoading(true);
      const nocSanctionData = await getNOCSanctionLetter(fireNOC, t, EmpData, finalComment);
      const fee = payments?.totalAmountPaid;
      const amountinwords = amountToWords(fee);
      let filestoreID = payments?.fileStoreId;
      if (!filestoreID) {
        try {
          const response = await Digit.PaymentService.generatePdf(
            tenantId,
            { Payments: [{ ...payments, Noc: nocSanctionData.Noc, amountinwords }] },
            pdfkey
          );
          filestoreID = response?.filestoreIds[0];
        } finally {
          setLoading(false);
        }
      }

      const fileStore = await Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: filestoreID,
      });
      await downloadPdfFromURL(fileStore[filestoreID]);
    } finally {
      setLoading(false);
    }
  };

  const getSanctionLetter = async ({ tenantId, payments, pdfkey, EmpData, ...params }) => {
    try {
      setLoading(true);
      const nocSanctionData = await getNOCSanctionLetter(fireNOC, t, EmpData, finalComment);
      const fee = payments?.totalAmountPaid;
      const amountinwords = amountToWords(fee);

      const prevGetLang = Digit.StoreData.getCurrentLanguage;
      console.log("prevGetLang", prevGetLang);
      Digit.StoreData.getCurrentLanguage = () => "pn_IN";

      let response = null;
      try {
        response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments, Noc: nocSanctionData.Noc, amountinwords }] }, pdfkey);
      } finally {
        Digit.StoreData.getCurrentLanguage = prevGetLang;
        setLoading(false);
      }

      const fileStore = await Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: response?.filestoreIds[0],
      });
      await downloadPdfFromURL(fileStore[response?.filestoreIds[0]]);
    } finally {
      setLoading(false);
    }
  };
  dowloadOptions.push({
    label: t("Application Form"),
    onClick: handleDownloadPdf,
  });
  
  if (payment && !loading) {
    dowloadOptions.push({
      label: t("CHB_FEE_RECEIPT"),
      onClick: () => getRecieptSearch({ tenantId: paymentDetail?.tenantId, payments: payment, pdfkey: "firenocreceipt", EmpData }),
    });
  }

  if (payment && !loading) {
    dowloadOptions.push({
      label: t("SANCTION_LETTER"),
      onClick: () => getSanctionLetter({ tenantId: paymentDetail?.tenantId, payments: payment, pdfkey: "firenoc-sanctionletter", EmpData }),
    });
  }
  

  return (
    <React.Fragment>
      <div className="cardHeaderWithOptions">
        <Header>{t("NOC_APPLICATION_DETAILS")}</Header>
        {loading && <Loader />}
        {dowloadOptions && dowloadOptions.length > 0 && (
          <MultiLink
            className="multilinkWrapper"
            onHeadClick={() => setShowOptions(!showOptions)}
            displayOptions={showOptions}
            options={dowloadOptions}
          />
        )}
      </div>
      <div style={{ padding: "24px" }}>
        {/* Application Summary */}
        <Card>
          <CardSectionHeader>{t("NOC_APPLICATION_SUMMARY")}</CardSectionHeader>
          <StatusTable>
            <Row label={t("NOC_APPLICATION_NUMBER")} text={details?.applicationNumber || "-"} />
            <Row label={t("NOC_FIRENOC_NUMBER")} text={fireNOC.fireNOCNumber || "-"} />
            <Row label={t("NOC_APPLICATION_STATUS")} text={<StatusBadge status={details?.status} />} />
            <Row label={t("NOC_FIRENOC_TYPE")} text={details?.fireNOCType || "-"} />
            <Row label={t("NOC_FIRESTATION_ID")} text={details?.firestationId || "-"} />
            <Row label={t("NOC_APPLICATION_DATE")} text={formatDate(details?.applicationDate)} />
            {details?.issuedDate && <Row label={t("NOC_ISSUED_DATE")} text={formatDate(details?.issuedDate)} />}
            {details?.validTo && <Row label={t("NOC_VALID_TILL")} text={formatDate(details?.validTo)} />}
          </StatusTable>
        </Card>

        {/* Applicant Details */}
        <Card style={{ marginTop: "16px" }}>
          <CardSectionHeader>{t("NOC_APPLICANT_DETAILS")}</CardSectionHeader>
          <StatusTable>
            <Row label={t("NOC_OWNER_NAME")} text={owner?.name || "-"} />
            <Row label={t("NOC_MOBILE_NUMBER")} text={owner?.mobileNumber || "-"} />
            <Row label={t("PT_OWNERSHIP_TYPE")} text={details?.applicantDetails?.ownerShipType?.replace("INDIVIDUAL.", "") || "-"} />
          </StatusTable>
        </Card>

        {/* Site / Property Details */}
        <Card style={{ marginTop: "16px" }}>
          <CardSectionHeader>{t("NOC_SITE_DETAILS")}</CardSectionHeader>
          <StatusTable>
            <Row label={t("NOC_CITY")} text={address?.city || address?.tenantId || "-"} />
            <Row label={t("NOC_AREA_TYPE")} text={address?.areaType || "-"} />
            <Row label={t("NOC_LOCALITY")} text={address?.locality?.code || "-"} />
          </StatusTable>
        </Card>

        {/* Building Details */}
        {building && (
          <Card style={{ marginTop: "16px" }}>
            <CardSectionHeader>{t("NOC_BUILDING_DETAILS")}</CardSectionHeader>
            <StatusTable>
              <Row label={t("NOC_BUILDING_NAME")} text={building.name || "-"} />
              <Row label={t("NOC_USAGE_TYPE")} text={building.usageType || "-"} />
              <Row label={t("NOC_USAGE_SUB_TYPE")} text={building.usageSubType || "-"} />
              {uomMap["NO_OF_FLOORS"] !== undefined && <Row label={t("NOC_NO_OF_FLOORS")} text={String(uomMap["NO_OF_FLOORS"])} />}
              {uomMap["HEIGHT_OF_BUILDING"] !== undefined && <Row label={t("NOC_HEIGHT_OF_BUILDING")} text={`${uomMap["HEIGHT_OF_BUILDING"]} m`} />}
              {building.landArea && <Row label={t("NOC_PLOT_AREA")} text={`${building.landArea} sq.m`} />}
              {building.totalCoveredArea && <Row label={t("NOC_COVERED_AREA")} text={`${building.totalCoveredArea} sq.m`} />}
            </StatusTable>
          </Card>
        )}

        {/* Payment Details */}
        {payment && (
          <Card style={{ marginTop: "16px" }}>
            <CardSectionHeader>{t("NOC_PAYMENT_DETAILS")}</CardSectionHeader>
            <StatusTable>
              <Row label={t("PAYMENT_AMOUNT_PAID")} text={`₹ ${payment.totalAmountPaid?.toLocaleString("en-IN") || "-"}`} />
              <Row label={t("PAYMENT_MODE")} text={payment.paymentMode || "-"} />
              <Row label={t("PAYMENT_RECEIPT_NUMBER")} text={paymentDetail?.receiptNumber || "-"} />
              <Row label={t("PAYMENT_TRANSACTION_DATE")} text={formatDate(payment.transactionDate)} />
            </StatusTable>
          </Card>
        )}

        {/* Documents */}
        {remainingDocs?.length > 0 && (
          <Card style={{ marginTop: "16px" }}>
            <CardSectionHeader>{t("NOC_DOCUMENTS")}</CardSectionHeader>
            <StatusTable>
              <NOCDocumentTableView documents={remainingDocs} />
            </StatusTable>
          </Card>
        )}
        {/* Application Timeline */}
        {workflow.length > 0 && (
          <Card style={{ marginTop: "16px" }}>
            <CardSectionHeader>{t("NOC_APPLICATION_TIMELINE")}</CardSectionHeader>
            <div style={{ paddingTop: "8px" }}>
              {workflow.map((step, idx) => {
                const stStatus = step.state?.applicationStatus;
                const dotColor = stStatus === "APPROVED" ? "#00703c" : stStatus === "REJECTED" || stStatus === "CANCELLED" ? "#d4351c" : "#1858b8";
                return (
                  <div key={step.id || idx} style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "16px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                      {idx < workflow.length - 1 && (
                        <div style={{ width: "2px", background: "#b0bec5", flexGrow: 1, minHeight: "24px", marginTop: "2px" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx === workflow.length - 1 ? 0 : "20px" }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#0b0c0c" }}>
                        {t(`WF_${stStatus || step.action}`) !== `WF_${stStatus || step.action}`
                          ? t(`WF_${stStatus || step.action}`)
                          : stStatus || step.action || "-"}
                      </div>
                      {step.action && (
                        <div style={{ fontSize: "12px", color: "#505A5F", marginTop: "2px" }}>
                          {t("NOC_WF_ACTION")}: <strong>{step.action}</strong>
                        </div>
                      )}
                      {step.assigner?.name && (
                        <div style={{ fontSize: "12px", color: "#505A5F" }}>
                          {t("NOC_WF_BY")}: {step.assigner.name}
                        </div>
                      )}
                      {step.auditDetails?.createdTime && (
                        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{formatDate(step.auditDetails.createdTime)}</div>
                      )}
                      {step.comment && (
                        <div style={{ fontSize: "12px", color: "#505A5F", fontStyle: "italic", marginTop: "2px" }}>"{step.comment}"</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
      {isPendingPayment && (
        <ActionBar>
          <SubmitBar
            label={t("NOC_PAY_NOW")}
            onSubmit={() => history.push(`/digit-ui/citizen/payment/collect/FIRENOC/${appNo}?tenantId=${tenantId}`)}
          />
        </ActionBar>
      )}
    </React.Fragment>
  );
};

export default FireNOCApplicationOverview;
