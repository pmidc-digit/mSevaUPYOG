import React, { useState, useEffect } from "react";
import { TextInput, TextArea } from "@mseva/digit-ui-react-components";

import { amountToWords } from "../utils";
import CustomFeeTable from "../../../templates/ApplicationDetails/components/CustomFeeTable";

export const CLUFeeTable = ({
  feeDataWithTotal,
  readOnly,
  feeData,
  handleAdjustedAmountChange,
  handleRemarkChange,
  onAdjustedAmountBlur,
  feeHistory,
  t,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const columns = [
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
        if (row.taxHeadCode === "CLU_TOTAL") {
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
                Rupees {amountToWords(row.grandTotal).replace(' Rupees', '')} only
              </div>
            </div>
          );
        }
        return (
          <TextInput
            t={t}
            type="number"
            isMandatory={false}
            value={feeData[row.index]?.adjustedAmount === null
              ? ""
              : feeData[row.index]?.adjustedAmount ?? row.amount ?? ""}
            onChange={(e) => {
              let val = e.target.value;
              if (val.length > 1 && val.startsWith("0")) {
                val = val.replace(/^0+/, "");
              }
              handleAdjustedAmountChange(row.index, val);
            }}
            disable={readOnly}
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
        if (row.taxHeadCode === "CLU_TOTAL") {
          return " ";
        }

        if (readOnly) {
          return (
            <div>
              {feeData[row.index]?.remark || <TextArea placeholder="Enter remarks" disabled={true} className="custom-fee-table-textarea" />}
            </div>
          );
        }

        return (
          <TextArea
            value={feeData[row.index]?.remark || ""}
            onChange={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
              handleRemarkChange(row.index, e.target.value, row.amount);
            }}
            disabled={false}
            className="custom-fee-table-textarea"
            placeholder="Enter remarks..."
            style={{ height: "50px", overflow: "hidden" }}
          />
        );
      },
    },
  ];

  const renderHistoryCell = (h, key, t) => {
    // This is called per entry, so we only render the value part
    // The labels are shown once in the header via a different approach
    return null; // We'll use a custom history renderer instead
  };

  const renderCustomHistory = () => {
    if (!feeHistory || Object.keys(feeHistory).length === 0) return null;

    const feeTypes = Object.keys(feeHistory);
    // Find the maximum number of history entries across all fee types
    const maxHistoryLength = Math.max(...feeTypes.map(ft => feeHistory[ft]?.length || 0));

    return (
      <div className="custom-fix-fee-history-wrapper">
        {/* Toggle Header */}
        <div 
          className="custom-fix-fee-history-toggle"
          onClick={() => setShowHistory(!showHistory)}
        >
          <span className="custom-fix-fee-history-toggle-text">{t("BPA_FEE_HISTORY_LABEL")}</span>
          <span className="custom-fix-fee-history-toggle-icon">{showHistory ? "▲" : "▼"}</span>
        </div>

        {/* History Table - Visible when showHistory is true */}
        {showHistory && (
          <div className="custom-fix-fee-history-table-container">
            <table className="custom-fix-fee-history-table">
              <thead>
                <tr>
                  <th className="custom-fix-fee-history-table-header">{t("BPA_FEE_HISTORY_DETAILS")}</th>
                  {feeTypes.map((feeType) => (
                    <th key={feeType} className="custom-fix-fee-history-table-header-fee">
                      {t(feeType)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Iterate through each history entry */}
                {Array.from({ length: maxHistoryLength }).map((_, entryIndex) => (
                  <React.Fragment key={entryIndex}>
                    {/* Fee Amount Row */}
                    <tr>
                      <td className="custom-fix-fee-history-table-cell-label">{t("BPA_FEE2_LABEL")}</td>
                      {feeTypes.map((feeType) => (
                        <td key={`${feeType}-fee-${entryIndex}`} className="custom-fix-fee-history-table-cell-value">
                          {feeHistory[feeType]?.[entryIndex] ? `₹ ${feeHistory[feeType][entryIndex].estimateAmount}` : ""}
                        </td>
                      ))}
                    </tr>
                    {/* Remarks Row */}
                    <tr>
                      <td className="custom-fix-fee-history-table-cell-label">{t("BPA_REMARK_LABEL")}</td>
                      {feeTypes.map((feeType) => (
                        <td key={`${feeType}-remark-${entryIndex}`} className="custom-fix-fee-history-table-cell-value">
                          {feeHistory[feeType]?.[entryIndex]?.remarks || t("CS_NA")}
                        </td>
                      ))}
                    </tr>
                    {/* Updated By Row */}
                    <tr>
                      <td className={entryIndex < maxHistoryLength - 1 ? "custom-fix-fee-history-table-cell-separator" : "custom-fix-fee-history-table-cell-separator-last"}>{t("BPA_UPDATED_BY_LABEL")}</td>
                      <td colSpan={feeTypes.length} className={entryIndex < maxHistoryLength - 1 ? "custom-fix-fee-history-table-cell-separator-value" : "custom-fix-fee-history-table-cell-separator-value-last"}>
                        {feeTypes.map(ft => feeHistory[ft]?.[entryIndex]?.who).find(who => who) || t("UNKNOWN")}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };


  const renderMobileCardView = () => {
    return (
      <React.Fragment>
        <div className="custom-fee-mobile-cards">
        {feeDataWithTotal.map((row, i) => (
          <div key={row.index || i} className={`custom-fee-card ${row?.taxHeadCode === "CLU_TOTAL" ? "custom-fee-card-total-row" : ""}`}>

            <div className="custom-fee-card-header">
              <span className="custom-fee-card-type">{t(row.title) || t("CS_NA")}</span>
              {/* {row?.taxHeadCode !== "CLU_TOTAL" && (
                <span className="custom-fee-card-original-amount">₹ {(row.amount || 0).toLocaleString("en-IN")}</span>
              )} */}
            </div>


            {row?.taxHeadCode !== "CLU_TOTAL" && (
              <div className="custom-fee-card-content">
                <div className="custom-fee-card-row">
                  <div className="custom-fee-card-field">
                    <label className="custom-fee-card-label">{t("BPA_AMOUNT_LABEL")}</label>
                    <TextInput
                      t={t}
                      type="number"
                      isMandatory={false}
                      value={
                        feeData[row.index]?.adjustedAmount === null
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
                      disable={readOnly}
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
                      onChange={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                        handleRemarkChange(row.index, e.target.value, row.amount);
                      }}
                      disabled={readOnly}
                      className="custom-fee-table-textarea"
                      placeholder="Enter remarks..."
                      style={{ overflow: "hidden" }}
                    />
                  </div>
                </div>
              </div>
            )}


            {row?.taxHeadCode === "CLU_TOTAL" && (
              <div className="custom-fee-card-total-content">
                <div className="custom-fee-card-total-label">{t("BPA_TOTAL_AMOUNT_LABEL")}</div>
                <div className="custom-fee-card-total-value">
                  <strong>₹ {row.grandTotal.toLocaleString("en-IN")}</strong>
                </div>
                <div className="custom-fee-card-total-words">
                  Rupees {amountToWords(row.grandTotal).replace(' Rupees', '')} only
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




  return (
    isMobile ? renderMobileCardView() : (
      <div>
        <CustomFeeTable
          data={feeDataWithTotal}
          columns={columns}
          extraStyleName="CLU"
          historyData={null}
          historyTitle="BPA_FEE_HISTORY_LABEL"
          onHistoryRender={renderHistoryCell}
          t={t}
          readOnly={readOnly}
        />
        {renderCustomHistory()}
      </div>
    )
  );
};
