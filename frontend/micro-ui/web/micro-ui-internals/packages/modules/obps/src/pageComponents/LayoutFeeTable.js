import React, { useState, useEffect } from "react";
import { TextInput, TextArea } from "@mseva/digit-ui-react-components";

import { amountToWords } from "../utils";
import CustomFeeTable from "../../../templates/ApplicationDetails/components/CustomFeeTable";

export const LayoutFeeTable = ({
  feeDataWithTotal,
  disable,
  isEmployee,
  feeData,
  handleAdjustedAmountChange,
  handleFileUpload,
  handleFileDelete,
  routeTo,
  t,
  handleRemarkChange,
  onAdjustedAmountBlur,
  feeHistory
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const isCitizen = window.location.href.includes("citizen"); 

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  let columns = [
    {
      key: "title",
      label: "BPA_TAXHEAD_CODE",
      headerLabel: "BPA_TAXHEAD_CODE",
      type: "text",
    },
    {
      key: "amount",
      label: "BPA_AMOUNT",
      headerLabel: "BPA_AMOUNT",
      type: "custom",
      render: (row, rowIndex, t) => {
        if (row.taxHeadCode === "LAYOUT_TOTAL") {
          return (
            <div>
              <strong style={{ fontSize: "14px" }}>
                ₹ {row.grandTotal.toLocaleString("en-IN")}
              </strong>
              <div
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  marginTop: "4px",
                  lineHeight: "1.3",
                }}
              >
                {amountToWords(row.grandTotal)}
              </div>
            </div>
          );
        }
        return (
          <TextInput
            t={t}
            type="number"
            isMandatory={false}
            value={feeData[row.index]?.adjustedAmount === 0
              ? ""
              : feeData[row.index]?.adjustedAmount ?? row.amount ?? ""}
            onChange={(e) => {
              let val = e.target.value;
              if (val.length > 1 && val.startsWith("0")) {
                val = val.replace(/^0+/, "");
              }
              handleAdjustedAmountChange(row.index, val);
            }}
            disable={disable}
            step={1}
            onBlur={onAdjustedAmountBlur}
          />
        );
      },
    },
    {
      key: "remark",
      label: "BPA_REMARKS",
      headerLabel: "BPA_REMARKS",
      type: "custom",
      render: (row, rowIndex, t) => {
        if (row.taxHeadCode === "LAYOUT_TOTAL") {
          return " ";
        }

        if (disable) {
          return (
            <div className="custom-fee-remark-display">
              {feeData[row.index]?.remark || <TextArea placeholder="Enter remarks" disabled={true} className="custom-fee-table-textarea" />}
            </div>
          );
        }

        return (
          <TextArea
            value={feeData[row.index]?.remark || ""}
            onChange={(e) =>
              handleRemarkChange(row.index, e.target.value, row.amount)
            }
            disabled={false}
            className="custom-fee-table-textarea"
            placeholder="Enter remarks..."
          />
        );
      },
    },
  ];

  if(isCitizen){
    columns = [
    {
      key: "title",
      label: "BPA_TAXHEAD_CODE",
      headerLabel: "BPA_TAXHEAD_CODE",
      type: "text",
    },
    {
      key: "amount",
      label: "BPA_AMOUNT",
      headerLabel: "BPA_AMOUNT",
      type: "custom",
      render: (row, rowIndex, t) => {
        if (row.taxHeadCode === "LAYOUT_TOTAL") {
          return (
            <div>
              <strong style={{ fontSize: "14px" }}>
                ₹ {row.grandTotal.toLocaleString("en-IN")}
              </strong>
              <div
                style={{
                  fontSize: "0.85em",
                  color: "#555",
                  marginTop: "4px",
                  lineHeight: "1.3",
                }}
              >
                {amountToWords(row.grandTotal)}
              </div>
            </div>
          );
        }
        return (
          <TextInput
            t={t}
            type="number"
            isMandatory={false}
            value={feeData[row.index]?.adjustedAmount === 0
              ? ""
              : feeData[row.index]?.adjustedAmount ?? row.amount ?? ""}
            onChange={(e) => {
              let val = e.target.value;
              if (val.length > 1 && val.startsWith("0")) {
                val = val.replace(/^0+/, "");
              }
              handleAdjustedAmountChange(row.index, val);
            }}
            disable={disable}
            step={1}
            onBlur={onAdjustedAmountBlur}
          />
        );
      },
    }
  ];
  }


  const renderHistoryCell = (h, key, t) => (
    <div className="custom-fee-history-content">
      <div className="custom-fee-history-row custom-fee-history-label">
        <span className="custom-fee-history-label-bold">{t("BPA_FEE2_LABEL")}:</span> {h.estimateAmount}
      </div>
      <div className="custom-fee-history-row custom-fee-history-label">
        <span className="custom-fee-history-label-bold">{t("BPA_REMARK_LABEL")}:</span>{" "}
        <span className="custom-fee-history-label-value">{h.remarks || t("CS_NA")}</span>
      </div>
      <div>
        <span className="custom-fee-history-label-bold">{t("BPA_UPDATED_BY_LABEL")}:</span>{" "}
        <span className="custom-fee-history-label-value">{h.who || t("UNKNOWN")}</span>
      </div>
    </div>
  );

  const renderMobileCardView = () => {
    return (
      <React.Fragment>
        <div className="custom-fee-mobile-cards">
          {feeDataWithTotal.map((row, i) => (
            <div key={row.index || i} className={`custom-fee-card ${row?.taxHeadCode === "LAYOUT_TOTAL" ? "custom-fee-card-total-row" : ""}`}>
              <div className="custom-fee-card-header">
                <span className="custom-fee-card-type">{t(row.title) || t("CS_NA")}</span>
              </div>

              {row?.taxHeadCode !== "LAYOUT_TOTAL" && (
                <div className="custom-fee-card-content">
                  <div className="custom-fee-card-row">
                    <div className="custom-fee-card-field">
                      <label className="custom-fee-card-label">{t("BPA_AMOUNT_LABEL")}</label>
                      <TextInput
                        t={t}
                        type="number"
                        isMandatory={false}
                        value={
                          feeData[row.index]?.adjustedAmount === 0
                            ? ""
                            : feeData[row.index]?.adjustedAmount ?? row.amount ?? ""
                        }
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.length > 1 && val.startsWith("0")) {
                            val = val.replace(/^0+/, "");
                          }
                          handleAdjustedAmountChange(row.index, val);
                        }}
                        disable={disable}
                        step={1}
                        onBlur={onAdjustedAmountBlur}
                      />
                    </div>
                  </div>

                  <div className="custom-fee-card-row">
                    <div className="custom-fee-card-field">
                      <label className="custom-fee-card-label">{t("BPA_REMARK_LABEL")}</label>
                      <TextArea
                        value={feeData[row.index]?.remark || ""}
                        onChange={(e) => handleRemarkChange(row.index, e.target.value, row.amount)}
                        disabled={disable}
                        className="custom-fee-table-textarea"
                        placeholder="Enter remarks..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {row?.taxHeadCode === "LAYOUT_TOTAL" && (
                <div className="custom-fee-card-total-content">
                  <div className="custom-fee-card-total-label">Total Amount :</div>
                  <div className="custom-fee-card-total-value">
                    <strong>₹ {row.grandTotal.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="custom-fee-card-total-words">
                    {amountToWords(row.grandTotal)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {feeHistory && Object.keys(feeHistory).length > 0 && (
          <div className="custom-fee-mobile-history">
            <div 
              className="custom-fee-history-toggle-mobile"
              onClick={() => setShowHistory(!showHistory)}
            >
              <span className="custom-fee-history-title">{t("BPA_FEE_HISTORY_LABEL")}</span>
              <span className="custom-fee-history-icon">{showHistory ? "▲" : "▼"}</span>
            </div>

            {showHistory && (
              <div className="custom-fee-history-cards">
                {Object.entries(feeHistory).map(([taxHeadCode, historyRows]) => (
                  <div key={taxHeadCode} className="custom-fee-history-card">
                    <div className="custom-fee-history-card-header">{t(taxHeadCode)}</div>
                    <div className="custom-fee-history-card-content">
                      {historyRows.map((h, idx) => (
                        <div key={idx} className="custom-fee-history-entry">
                          <div className="custom-fee-history-item">
                            <span className="custom-fee-history-label-bold">{t("BPA_FEE2_LABEL")}:</span> ₹ {h.estimateAmount}
                          </div>
                          <div className="custom-fee-history-item">
                            <span className="custom-fee-history-label-bold">{t("BPA_REMARK_LABEL")}:</span> {h.remarks || t("CS_NA")}
                          </div>
                          <div className="custom-fee-history-item">
                            <span className="custom-fee-history-label-bold">{t("BPA_UPDATED_BY_LABEL")}:</span> {h.who || t("UNKNOWN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  return isMobile ? renderMobileCardView() : (
    <CustomFeeTable
      data={feeDataWithTotal}
      columns={columns}
      extraStyleName="LAYOUT"
      historyData={feeHistory}
      historyTitle="BPA_FEE_HISTORY_LABEL"
      onHistoryRender={renderHistoryCell}
      t={t}
      readOnly={disable}
    />
  );
};
