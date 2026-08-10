import React, { useState } from 'react';
import { useTranslation } from "react-i18next";

const ChevronDown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#505A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.3s ease" }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const OBPSPaymentHistory = ({ payments }) => {
  console.log("payments",payments)
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const formatDate = (epoch) => {
    if (!epoch) return "N/A";
    const date = new Date(epoch);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

 

  return (
    <div id="obps-payment-history" className="obps-payment-history-container">
      <div className="obps-payment-history-header" onClick={toggleAccordion}>
        <h3 className="obps-payment-history-title">
          {t("PT_PAYMENT_HISTORY") || "Payment History"}
        </h3>
        <span className={`obps-payment-history-chevron ${isOpen ? "open" : ""}`}>
          <ChevronDown />
        </span>
      </div>
      {isOpen && (
        <div className="obps-payment-history-body">
          {payments?.length === 0 ? (
            <div className="obps-payment-history-no-payments">
              {t("PT_NO_PAYMENTS_FOUND") || "No Payments found"}
            </div>
          ) : (
            <div className="obps-payment-history-table-wrapper">
              <table className="custom-fix-fee-history-table obps-payment-history-table">
                <thead>
                  <tr>
                    <th className="custom-fix-fee-history-table-header">{t("PT_RECEIPT_NO") || "Receipt Number"}</th>
                    <th className="custom-fix-fee-history-table-header">{t("PT_TRANSACTION_DATE") || "Transaction Date"}</th>
                    <th className="custom-fix-fee-history-table-header">{t("PT_AMOUNT_PAID") || "Amount Paid"}</th>
                    <th className="custom-fix-fee-history-table-header">{t("PT_PAYMENT_MODE") || "Payment Mode"}</th>
                    <th className="custom-fix-fee-history-table-header">{t("PT_TRANSACTION_ID") || "Transaction ID"}</th>
                    <th className="custom-fix-fee-history-table-header">{t("PT_STATUS") || "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => {
                    const receiptNo = payment.paymentDetails?.[0]?.receiptNumber || payment.receiptNumber || 'N/A';
                    const amountPaid = payment.totalAmountPaid !== undefined ? payment.totalAmountPaid : (payment.amount !== undefined ? payment.amount : '0');
                    const rawStatus = payment.paymentStatus || 'N/A';
                    const status = rawStatus === 'DEPOSITED' ? 'Deposited' : (rawStatus === 'SUCCESSFUL' ? 'Successful' : rawStatus);
                    const paymentDate = payment.transactionDate || payment.paymentDetails?.[0]?.receiptDate || payment.receiptDate;
                    const transactionId = (payment.transactionNumber || payment.instrumentNumber || 'N/A');
                    const isDeposited = rawStatus === 'DEPOSITED' || rawStatus === 'SUCCESSFUL';

                    return (
                      <tr key={payment.id || index}>
                        <td className="custom-fix-fee-history-table-cell-value">{receiptNo}</td>
                        <td className="custom-fix-fee-history-table-cell-value">{formatDate(paymentDate)}</td>
                        <td className="custom-fix-fee-history-table-cell-value">₹{amountPaid}</td>
                        <td className="custom-fix-fee-history-table-cell-value">{payment.paymentMode || 'N/A'}</td>
                        <td className="custom-fix-fee-history-table-cell-value">{transactionId}</td>
                        <td className="custom-fix-fee-history-table-cell-value">
                          <span className={`obps-payment-history-status ${isDeposited ? "deposited" : ""}`}>
                            {t(status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="obps-payment-history-total">
                {t("PT_TOTAL_PAYMENTS") || "Total Payments"}: {payments.length}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OBPSPaymentHistory;
