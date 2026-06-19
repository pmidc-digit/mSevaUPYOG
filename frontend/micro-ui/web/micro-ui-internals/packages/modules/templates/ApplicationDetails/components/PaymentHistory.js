import React, { useState } from 'react';
import { useTranslation } from "react-i18next";

const ChevronDown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#505A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.3s ease" }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const PaymentHistory = ({ payments }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const isCitizen = window.location.href.includes("/citizen");
  const isMobile = window.Digit?.Utils?.browser?.isMobile?.() || window.innerWidth <= 780;

  const formatDate = (epoch) => {
    if (!epoch) return "N/A";
    const date = new Date(epoch);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDownloadReceipt = async (payment) => {
    try {
      const tenantId = payment?.tenantId || Digit.ULBService.getCurrentTenantId();
      const businessService = payment?.paymentDetails?.[0]?.businessService || "PT";
      const receiptNo = payment.paymentDetails?.[0]?.receiptNumber || payment.receiptNumber;

      // 1. Fetch latest payment details from /collection-services/payments/{businessService}/_search
      const searchResponse = await Digit.PaymentService.getReciept(tenantId, businessService, { receiptNumbers: receiptNo });
      const latestPayment = searchResponse?.Payments?.[0] || payment;

      // 2. Generate PDF using the fetched payment object
      let pdfKey = "consolidatedreceipt";
      if (businessService === "PT") {
        pdfKey = "property-receipt";
      } else if (businessService === "TL") {
        pdfKey = "tl-receipt";
      }

      const response = await Digit.PaymentService.generatePdf(
        tenantId,
        { Payments: [latestPayment] },
        pdfKey
      );
      
      const fileStoreId = response?.filestoreIds?.[0];
      
      if (fileStoreId) {
        const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
        window.open(fileStore[fileStoreId], "_blank");
      } else {
        console.error("No fileStoreId generated or found.");
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
    }
  };

  return (
    <div id="payment-history" className="accordion" style={{
      width: "100%",
      margin: "auto",
      fontFamily: "Roboto, sans-serif",
      border: "1px solid #ccc",
      borderRadius: "4px",
      marginBottom: '10px'
    }}>
      <div className="accordion-header"
        style={{
          backgroundColor: "#f0f0f0",
          padding: "15px",
          cursor: "pointer"
        }}
        onClick={toggleAccordion}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: 'center'
        }}>
          <h3 style={{ color: '#0b0c0c', fontFamily: 'Noto Sans,sans-serif', fontSize: '24px', fontWeight: '500' }}>
            {t("PT_PAYMENT_HISTORY") || "Payment History"}
          </h3>
          <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.3s ease" }}>
            <ChevronDown />
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="accordion-body" style={{ padding: "15px", backgroundColor: "#fff" }}>
          {payments?.length === 0 && (
            <div style={{ color: 'red', fontSize: '16px' }}>{t("PT_NO_PAYMENTS_FOUND") || "No Payments found"}</div>
          )}
          {payments?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {payments.map((payment, index) => {
                const receiptNo = payment.paymentDetails?.[0]?.receiptNumber || payment.receiptNumber || 'N/A';
                const amountPaid = payment.totalAmountPaid !== undefined ? payment.totalAmountPaid : (payment.amount !== undefined ? payment.amount : '0');
                const rawStatus = payment.paymentStatus || 'N/A';
                const status = rawStatus === 'DEPOSITED' ? 'Deposited' : (rawStatus === 'SUCCESSFUL' ? 'Successful' : rawStatus);
                const paymentDate = payment.transactionDate || payment.paymentDetails?.[0]?.receiptDate || payment.receiptDate;
                const billNo = payment.paymentDetails?.[0]?.bill?.billNumber || 'N/A';
                const billDetails = payment.paymentDetails?.[0]?.bill?.billDetails?.[0];
                const fromPeriod = billDetails?.fromPeriod;
                const toPeriod = billDetails?.toPeriod;
                const billPeriodStr = fromPeriod && toPeriod ? `${formatDate(fromPeriod)} to ${formatDate(toPeriod)}` : 'N/A';

                return (
                  <div key={payment.id || index} style={{
                    padding: "20px 0",
                    borderBottom: index === payments.length - 1 ? "none" : "1px solid #E3E3E3",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    position: "relative"
                  }}>
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div style={{ width: isMobile ? "150px" : "250px", color: "#656565", fontSize: "16px" }}>
                            {t("PT_RECEIPT_NO") || "Receipt No"}
                          </div>
                          <div style={{ color: "#0b0c0c", fontSize: "16px", fontWeight: "400" }}>{receiptNo}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div style={{ width: isMobile ? "150px" : "250px", color: "#656565", fontSize: "16px" }}>
                            {t("PT_AMOUNT_PAID") || "Amount Paid"}
                          </div>
                          <div style={{ color: "#0b0c0c", fontSize: "16px", fontWeight: "400" }}>Rs {amountPaid}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div style={{ width: isMobile ? "150px" : "250px", color: "#656565", fontSize: "16px" }}>
                            {t("PT_PAYMENT_STATUS") || "Payment Status"}
                          </div>
                          <div style={{ color: "#0b0c0c", fontSize: "16px", fontWeight: "400" }}>{t(status)}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div style={{ width: isMobile ? "150px" : "250px", color: "#656565", fontSize: "16px" }}>
                            {t("PT_PAYMENT_DATE") || "Payment Date"}
                          </div>
                          <div style={{ color: "#0b0c0c", fontSize: "16px", fontWeight: "400" }}>{formatDate(paymentDate)}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                          <div style={{ width: isMobile ? "150px" : "250px", color: "#656565", fontSize: "16px" }}>
                            {t("PT_BILL_NO") || "Bill No."}
                          </div>
                          <div style={{ color: "#0b0c0c", fontSize: "16px", fontWeight: "400" }}>{billNo}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
                          <div style={{ width: isMobile ? "150px" : "250px", color: "#656565", fontSize: "16px" }}>
                            {t("PT_BILL_PERIOD") || "Bill Period"}
                          </div>
                          <div style={{ color: "#0b0c0c", fontSize: "16px", fontWeight: "400" }}>{billPeriodStr}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: isMobile ? "15px" : "0", alignSelf: isMobile ? "flex-start" : "center" }}>
                        <button
                          onClick={() => handleDownloadReceipt(payment)}
                         
                          
                        >
                          {t("PT_DOWNLOAD_RECEIPT") || "Download Receipt"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;