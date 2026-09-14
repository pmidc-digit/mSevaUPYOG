import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "./Card";
import CardSubHeader from "./CardSubHeader";
import SubmitBar from "./SubmitBar";
import "./PaymentHistory.scss";

const roundMoney = (value = 0) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const getBillDetailKey = (billDetail) => billDetail?.demandId || billDetail?.id || "";

const getAdvanceCarryForward = (billDetail, advanceTaxHead) =>
  roundMoney(
    (billDetail?.billAccountDetails || [])
      .filter((accountDetail) => advanceTaxHead && accountDetail?.taxHeadCode === advanceTaxHead)
      .reduce((total, accountDetail) => total + Math.abs(Number(accountDetail?.amount || 0)), 0)
  );

const formatMonth = (period) => {
  if (!period) return "-";
  const date = new Date(Number(period));

  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
};

const formatDate = (period) => {
  if (!period) return "-";
  const date = new Date(Number(period));

  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(roundMoney(amount));

export const getPaymentHistory = (billResponse, receiptResponse, advanceTaxHead) => {
  const months = new Map();
  const ignoredBillStatuses = ["CANCELLED", "PAYMENT_CANCELLED", "EXPIRED"];

  (billResponse?.Bill || []).forEach((bill) => {
    if (ignoredBillStatuses.includes(bill?.status)) return;

    (bill?.billDetails || []).forEach((billDetail) => {
      // A regenerated bill can cover the same calendar month as an expired bill.
      // demandId keeps the current demand separate from its superseded counterpart.
      const key = getBillDetailKey(billDetail);
      if (!key) return;

      const month = months.get(key) || {
        key,
        fromPeriod: billDetail?.fromPeriod,
        toPeriod: billDetail?.toPeriod,
        billNumber: bill?.billNumber || "-",
        billStatus: bill?.status,
        billed: 0,
        receipts: [],
      };

      month.billed = roundMoney(month.billed + Number(billDetail?.amount || 0));
      months.set(key, month);
    });
  });

  (receiptResponse?.Payments || []).forEach((payment) => {
    if (payment?.instrumentStatus !== "APPROVED") return;

    (payment?.paymentDetails || []).forEach((paymentDetail) => {
      if (!paymentDetail?.receiptNumber) return;

      (paymentDetail?.bill?.billDetails || []).forEach((billDetail) => {
        const key = getBillDetailKey(billDetail);
        if (!key) return;

        // A payment response contains a historical bill snapshot. It must not
        // create timeline rows, otherwise cancelled or regenerated bills leak in.
        const month = months.get(key);
        if (!month) return;

        const advanceCarryForward = getAdvanceCarryForward(billDetail, advanceTaxHead);

        month.receipts.push({
          receiptNumber: paymentDetail.receiptNumber,
          date: payment?.transactionDate || paymentDetail?.receiptDate,
          mode: payment?.paymentMode || "-",
          // The payment snapshot includes the carry-forward in amountPaid.
          // Keep it separate so a month's paid amount cannot exceed its billed amount.
          amount: roundMoney(Math.max(0, Number(billDetail?.amountPaid || 0) - advanceCarryForward)),
          advanceCarryForward,
          transactionNumber: payment?.transactionNumber,
          payment: payment,
        });
        months.set(key, month);
      });
    });
  });

  const rows = [...months.values()]
    .map((month) => {
      const billed = roundMoney(month.billed);
      const paid = roundMoney(month.receipts.reduce((total, receipt) => total + receipt.amount, 0));
      const advance = roundMoney(month.receipts.reduce((total, receipt) => total + receipt.advanceCarryForward, 0));
      const due = Math.max(0, roundMoney(billed - paid));
      const status = billed > 0 && due === 0 ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : "DUE";

      return { ...month, billed, paid, advance, due, status };
    })
    .sort((first, second) => Number(second.fromPeriod || 0) - Number(first.fromPeriod || 0));

  return {
    rows,
    totals: rows.reduce(
      (totals, row) => ({
        billed: roundMoney(totals.billed + row.billed),
        paid: roundMoney(totals.paid + row.paid),
        advance: roundMoney(totals.advance + row.advance),
        due: roundMoney(totals.due + row.due),
      }),
      { billed: 0, paid: 0, advance: 0, due: 0 }
    ),
  };
};

/** Fetches billing/payment history for a consumer and business service.
 * tenantId defaults to the current ULB. pdfKey enables receipt downloads for
 * services with a configured PDF template; RL retains its existing template.
 */
const PaymentHistory = ({ consumerCode, service, tenantId: tenantIdProp, title = "Payment History", pdfKey, advanceCarryForwardTaxHead }) => {
  const { t } = useTranslation();
  const tenantId = tenantIdProp || Digit.ULBService.getCurrentTenantId();
  const advanceTaxHead = advanceCarryForwardTaxHead || (service === "rl-services" ? "RL_ADVANCE_CARRYFORWARD" : undefined);
  const receiptPdfKey = pdfKey || (service === "rl-services" ? "rl-receipt-employee" : undefined);
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const { printReceipt } = Digit.Hooks.usePrintBillReceipt({
    tenantId, setLoader: setIsDownloading, setShowToast: setDownloadError, t, pdfkey: receiptPdfKey,
  });

  useEffect(() => {
    let active = true;
    setHistory(null);
    setError(null);
    setDownloadError(null);
    setExpandedMonth(null);
    if (!consumerCode || !service || !tenantId) {
      setIsLoading(false);
      return undefined;
    }
    setIsLoading(true);
    const fetchHistory = async () => {
      try {
        const [bills, receipts] = await Promise.all([
          Digit.PaymentService.searchBill(tenantId, { consumerCode, service }),
          Digit.PaymentService.recieptSearch(tenantId, service, { consumerCodes: consumerCode, limit: 200 }),
        ]);
        if (active) setHistory(getPaymentHistory(bills, receipts, advanceTaxHead));
      } catch (error) {
        if (active) setError("Unable to load payment history. Please try again.");
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchHistory();
    return () => { active = false; };
  }, [consumerCode, service, tenantId, advanceTaxHead]);

  const onDownloadReceipt = (receipt) => printReceipt({
    businessService: service,
    receiptNumber: receipt.receiptNumber,
    billOrPaymentResponse: { Payments: [receipt.payment] },
    rootKey: "PAYMENTS",
  });
  const [expandedMonth, setExpandedMonth] = useState(null);
  const rows = history?.rows || [];
  const totals = history?.totals || { billed: 0, paid: 0, advance: 0, due: 0 };

  return (
    <Card className="payment-history">
      <div className="payment-history__header">
        <div>
          <CardSubHeader className="payment-history__title">{t(title)}</CardSubHeader>
          <p className="payment-history__consumer">Consumer code: {consumerCode || "-"}</p>
        </div>
        <div className="payment-history__totals" aria-label="Payment history totals">
          <div>
            <span>Total billed</span>
            <strong>{formatCurrency(totals.billed)}</strong>
          </div>
          <div>
            <span>Total paid</span>
            <strong>{formatCurrency(totals.paid + totals.advance)}</strong>
          </div>
          <div>
            <span>Advance payment</span>
            <strong>{formatCurrency(totals.advance)}</strong>
          </div>
          <div>
            <span>Total due</span>
            <strong>{formatCurrency(totals.due)}</strong>
          </div>
        </div>
      </div>

      {downloadError && <div className="payment-history__message--error" role="alert">{downloadError.label}</div>}
      {isLoading ? (
        <div className="payment-history__message" role="status">
          Loading payment history...
        </div>
      ) : error ? (
        <div className="payment-history__message payment-history__message--error" role="alert">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="payment-history__message">No billing/payment history found for this consumer code.</div>
      ) : (
        <div className="payment-history__table-wrap">
          <table className="payment-history__table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Bill No.</th>
                <th>Billed</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isExpanded = expandedMonth === row.key;

                return (
                  <React.Fragment key={row.key}>
                    <tr>
                      <td>
                        <button
                          type="button"
                          className="payment-history__month-button"
                          onClick={() => setExpandedMonth(isExpanded ? null : row.key)}
                          aria-expanded={isExpanded}
                          disabled={!row.receipts.length}
                        >
                          <span aria-hidden="true">{row.receipts.length ? (isExpanded ? "−" : "+") : ""}</span>
                          {formatMonth(row.fromPeriod)}
                        </button>
                      </td>
                      <td>{row.billNumber}</td>
                      <td>{formatCurrency(row.billed)}</td>
                      <td>{formatCurrency(row.paid)}</td>
                      <td>{formatCurrency(row.due)}</td>
                      <td>
                        <span className={`payment-history__status payment-history__status--${row.status.toLowerCase()}`}>
                          {row.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="payment-history__receipts-row">
                        <td colSpan="6">
                          <div className="payment-history__receipts">
                            {row.receipts.map((receipt, index) => (
                              <div key={`${receipt.receiptNumber}-${index}`} className="payment-history__receipt">
                                <strong>{receipt.receiptNumber}</strong>
                                <span>{formatDate(receipt.date)}</span>
                                <span>{receipt.mode}</span>
                                <span>{formatCurrency(receipt.amount)}</span>
                                {receipt.transactionNumber && <span>Txn: {receipt.transactionNumber}</span>}
                                {receiptPdfKey && <div style={{ marginLeft: "auto" }}>
                                  <SubmitBar
                                    disabled={isDownloading}
                                    label={t("CS_COMMON_DOWNLOAD")}
                                    onSubmit={() => onDownloadReceipt(receipt)}
                                  />
                                </div>}

                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};


export default PaymentHistory;
