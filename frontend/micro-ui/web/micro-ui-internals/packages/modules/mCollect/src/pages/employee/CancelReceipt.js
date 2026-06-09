import {
  ActionBar,
  Card,
  Header,
  Loader,
  SubmitBar,
  Dropdown,
  TextInput,
  Toast,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";

/* Helper functions defined locally to keep this page self-contained */
const convertEpochToDate = (dateEpoch) => {
  if (dateEpoch) {
    const dateFromApi = new Date(dateEpoch);
    let month = dateFromApi.getMonth() + 1;
    let day = dateFromApi.getDate();
    let year = dateFromApi.getFullYear();
    month = (month > 9 ? "" : "0") + month;
    day = (day > 9 ? "" : "0") + day;
    return `${day}/${month}/${year}`;
  } else {
    return 'NA';
  }
};

const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
  if (searcher == "") return str;
  while (str.includes(searcher)) {
    str = str.replace(searcher, replaceWith);
  }
  return str;
};

const checkForNotNull = (value = "") => {
  return value && value != null && value != undefined && value != "" ? true : false;
};

const convertDotValues = (value = "") => {
  return (
    (checkForNotNull(value) && ((value.replaceAll && value.replaceAll(".", "_")) || (value.replace && stringReplaceAll(value, ".", "_")))) || "NA"
  );
};

const convertToLocale = (value = "", key = "") => {
  let convertedValue = convertDotValues(value);
  if (convertedValue == "NA") {
    return "PT_NA";
  }
  return `${key}_${convertedValue}`;
};

const getFinancialYears = (from, to) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (toDate.getYear() - fromDate.getYear() != 0) {
    return `FY${fromDate.getYear() + 1900}-${toDate.getYear() - 100}`;
  }
  return `${fromDate.toLocaleDateString()}-${toDate.toLocaleDateString()}`;
};

const CancelReceipt = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const receiptNumber = queryParams.get("receiptNumbers");
  const businessService = queryParams.get("businessService");
  const tenantId = queryParams.get("tenantId") || Digit.ULBService.getCurrentTenantId();

  const [step, setStep] = useState(0);
  const [selectedReason, setSelectedReason] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [additionalPenalty, setAdditionalPenalty] = useState("");
  const [showToast, setShowToast] = useState(null);

  const [mutationHappened, setMutationHappened, clearMutation] = Digit.Hooks.useSessionStorage("EMPLOYEE_RECEIPT_MUTATION_HAPPENED", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_RECEIPT_MUTATION_SUCCESS_DATA", false);
  const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("EMPLOYEE_RECEIPT_ERROR_DATA", false);

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
    clearError();
  }, []);

  const { isLoading, data } = Digit.Hooks.receipts.useReceiptsSearch(
    { receiptNumbers: receiptNumber, businessServices: businessService },
    tenantId
  );

  const { data: cancelReasons = [], isLoading: isMdmsLoading } = Digit.Hooks.useCustomMDMS(
    tenantId.split(".")[0],
    "common-masters",
    [{ name: "CancelReceiptReason" }],
    {
      select: (data) => {
        const reasons = data?.["common-masters"]?.["CancelReceiptReason"] || [];
        return reasons
          .filter((item) => item.active)
          .map((item) => ({
            ...item,
            name: `CR_REASON_${item.code}`,
          }));
      },
    }
  );

  if (isLoading || isMdmsLoading) {
    return <Loader />;
  }

  const payment = data?.Payments?.[0];
  const pendingDue = payment ? payment.totalDue - payment.totalAmountPaid : 0;

  const handleNextStep = () => {
    setStep(1);
  };

  const handlePrevStep = () => {
    setStep(0);
  };

  const handleCancelReceipt = () => {
    if (!selectedReason) {
      setShowToast({ error: true, label: t("CR_SELECT_REASON_ERROR") || "Please select a cancellation reason." });
      return;
    }

    const isOther = selectedReason?.code?.toUpperCase() === "OTHER" || selectedReason?.code?.toUpperCase() === "OTHERS";
    if (isOther && !additionalDetails.trim()) {
      setShowToast({ error: true, label: t("CR_ADDITIONAL_DETAILS_ERROR") || "More Details is mandatory when 'Others' is selected." });
      return;
    }

    history.push({
      pathname: `/digit-ui/employee/mcollect/response`,
      state: {
        key: "UPDATE",
        action: "CANCEL",
        businessService: businessService,
        paymentWorkflow: {
          additionalDetails: isOther ? additionalDetails : "",
          reason: selectedReason?.code,
          action: "CANCEL",
          tenantId: tenantId,
          paymentId: payment?.id,
        },
      },
    });
  };

  const isOtherSelected = selectedReason?.code?.toUpperCase() === "OTHER" || selectedReason?.code?.toUpperCase() === "OTHERS";

  return (
    <React.Fragment>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <Header style={{ margin: 0, fontSize: "32px", fontWeight: "700" }}>{t("Receipt Number")}</Header>
        <span
          style={{
            background: "#505050",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {t("Receipt No.")} {receiptNumber}
        </span>
      </div>

      {step === 0 && (
        <Card style={{ padding: "24px", maxWidth: "900px" }}>
          <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: "#0b0c0c" }}>
            {t("Receipt Details")}
          </div>

          {/* Panel 1 */}
          <div
            style={{
              border: "1px solid #d6d8d9",
              borderRadius: "4px",
              padding: "24px",
              marginBottom: "24px",
              background: "#f8f9fa",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px 16px" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Receipt Number")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.paymentDetails?.[0]?.receiptNumber || "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Consumer code")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.paymentDetails?.[0]?.bill?.consumerCode || "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Payment date")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {convertEpochToDate(payment?.paymentDetails?.[0]?.receiptDate) || "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Payer Name")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.payerName || "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Payer Number")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.mobileNumber || "NA"}
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2 */}
          <div
            style={{
              border: "1px solid #d6d8d9",
              borderRadius: "4px",
              padding: "24px",
              background: "#f8f9fa",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px 16px" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Service Type")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.paymentDetails?.[0]?.businessService || "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Bill Period")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.paymentDetails?.[0]?.bill?.billDetails?.[0]
                    ? getFinancialYears(
                        payment.paymentDetails[0].bill.billDetails[0].fromPeriod,
                        payment.paymentDetails[0].bill.billDetails[0].toPeriod
                      )
                    : "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Total Amount")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.totalAmountPaid || "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Pending Amount")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {pendingDue || "0"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Payment Mode")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.paymentMode || "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("Transaction ID")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.transactionNumber || "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("G8 Receipt NO")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {payment?.paymentDetails?.[0]?.manualReceiptNumber || "NA"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#505a5f", marginBottom: "6px" }}>{t("G8 Receipt Date")}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b0c0c" }}>
                  {convertEpochToDate(payment?.paymentDetails?.[0]?.manualReceiptDate) || "NA"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <SubmitBar label={t("NEXT STEP >")} onSubmit={handleNextStep} />
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card style={{ padding: "24px", maxWidth: "900px" }}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "16px", fontWeight: "600", color: "#505a5f", display: "block", marginBottom: "8px" }}>
              {t("Reason for Receipt Cancellation")} <span style={{ color: "red" }}>*</span>
            </label>
            <Dropdown
              option={cancelReasons}
              select={setSelectedReason}
              optionKey="name"
              t={t}
              selected={selectedReason}
              placeholder={t("Select Receipt Cancel Reason")}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "16px", fontWeight: "600", color: "#505a5f", display: "block", marginBottom: "8px" }}>
              {t("More Details")}
            </label>
            <TextInput
              disabled={!isOtherSelected}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder={t("Enter Details for Receipt cancellation")}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "16px", fontWeight: "600", color: "#505a5f", display: "block", marginBottom: "8px" }}>
              {t("Additional Penalty (in INR)")}
            </label>
            <TextInput
              disabled={true}
              value={additionalPenalty}
              onChange={(e) => setAdditionalPenalty(e.target.value)}
              placeholder={t("Add Penalty if applicable")}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", marginTop: "24px" }}>
            <button
              type="button"
              className="submit-bar ral-back-btn"
              style={{
                background: "white",
                color: "#f47738",
                border: "1px solid #f47738",
                padding: "8px 24px",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={handlePrevStep}
            >
              {t("< PREVIOUS STEP")}
            </button>
            <SubmitBar label={t("CANCEL RECEIPT >")} onSubmit={handleCancelReceipt} />
          </div>
        </Card>
      )}

      {showToast && (
        <Toast
          error={showToast.error}
          label={showToast.label}
          onClose={() => setShowToast(null)}
        />
      )}
    </React.Fragment>
  );
};

export default CancelReceipt;
