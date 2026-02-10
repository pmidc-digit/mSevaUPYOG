import React, {useState, Fragment } from "react";
import {
  TextInput,
  CardSubHeader,
} from "@mseva/digit-ui-react-components";
// import NOCCustomUploadFile from "./NOCCustomUploadFile";

import { amountToWords } from "../utils";
export const NOCFeeTable = ({
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
  feeHistory,
  timeObj

}) => {
  
const [showHistory, setShowHistory] = useState(false);

 console.log('feeHistory', feeHistory)
 console.log('timeObj', timeObj)
 console.log("feeHistory keys", Object.keys(feeHistory || {}));
  return (
    <div
      className="noc-table-container"
      style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", marginBottom: "16px", display: "block" }}
    >
      <table className="customTable table-border-style" style={{ width: "100%", tableLayout: "auto", minWidth: "600px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "14px 12px", fontSize: "12px", whiteSpace: "nowrap" }}>{t("BPA_TAXHEAD_CODE")}</th>
            <th style={{ padding: "14px 12px", fontSize: "12px", whiteSpace: "nowrap" }}>{t("BPA_AMOUNT")}</th>
            {/* <th>{t("BPA_FILE_UPLOAD")}</th> */}
            <th style={{ padding: "14px 12px", fontSize: "12px", whiteSpace: "nowrap" }}>{t("BPA_REMARKS")}</th>
          </tr>
        </thead>
        <tbody>
          {feeDataWithTotal.map((row, i) => (
            <tr key={row.index || i}>
              <td style={{ padding: "14px 12px", fontSize: "13px", minWidth: "150px", fontWeight: "bold" }}>{t(row.title) || t("CS_NA")}</td>
              <td style={{ padding: "14px 12px", minWidth: "130px" }}>
                {row?.taxHeadCode === "NOC_TOTAL" ? (
                  <div>
                    <strong style={{ fontSize: "14px" }}>{`₹ ${row.grandTotal.toLocaleString("en-IN")}`}</strong>
                    <div style={{ fontSize: "0.85em", color: "#555", marginTop: "4px", lineHeight: "1.3" }}>{amountToWords(row.grandTotal)}</div>
                  </div>
                ) : (
                  // <TextInput
                  //   t={t}
                  //   type="number"
                  //   isMandatory={false}
                  //   value={
                  //     feeData[row.index]?.adjustedAmount === 0
                  //       ? ""
                  //       : feeData[row.index]?.adjustedAmount ?? row.amount ?? ""
                  //   }
                  //   onChange={(e) => {
                  //     let val = e.target.value;

                  //     if (val.length > 1 && val.startsWith("0")) {
                  //       val = val.replace(/^0+/, "");
                  //     }

                  //     handleAdjustedAmountChange(row.index, val);
                  //   }}
                  //   // ❌ no onBlur here for NOC
                  //   disable={disable}
                  //   step={1}
                  //   onBlur={onAdjustedAmountBlur}
                  // />

                  <TextInput
                    t={t}
                    type="text" // ✅ keep as text
                    isMandatory={false}
                    value={feeData[row.index]?.adjustedAmount === 0 ? "" : feeData[row.index]?.adjustedAmount ?? row.amount ?? ""}
                    onChange={(e) => {
                      let val = e.target.value;

                      // Allow only digits + optional decimal point
                      if (/^\d*\.?\d*$/.test(val)) {
                        // Remove leading zeros if more than one digit before decimal
                        if (val.length > 1 && val.startsWith("0") && !val.startsWith("0.")) {
                          val = val.replace(/^0+/, "");
                        }
                        handleAdjustedAmountChange(row.index, val);
                      }
                    }}
                    onKeyPress={(e) => {
                      // Block anything except digits and one decimal point
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                      // Prevent multiple decimals
                      if (e.key === "." && e.target.value.includes(".")) {
                        e.preventDefault();
                      }
                    }}
                    disable={disable}
                    onBlur={onAdjustedAmountBlur}
                    className="responsive-table-input"
                  />
                )}
              </td>
              {/* <td>
                {row?.taxHeadCode === "NOC_TOTAL" ? null : (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <NOCCustomUploadFile
                      key={row.index}
                      id={`file-${row.id}`}
                      onUpload={(file) => handleFileUpload(row.index, file || null)}
                      onDelete={() => handleFileDelete(row.index)}
                      message={row.filestoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                      uploadedFile={row.filestoreId}
                      disabled={disable}
                    />
                  </div>
                )}
              </td> */}

              <td style={{ padding: "14px 12px", minWidth: "200px" }}>
                {row?.taxHeadCode === "NOC_TOTAL" ? (
                  " "
                ) : (
                  <TextInput
                    t={t}
                    type="text"
                    isMandatory={true}
                    value={feeData[row.index]?.remark ?? row.remark ?? ""}
                    onChange={(e) => handleRemarkChange(row.index, e.target.value, row.amount)}
                    disable={disable}
                    className="responsive-table-input"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {feeHistory && Object.keys(feeHistory).length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div onClick={() => setShowHistory(!showHistory)} style={{ cursor: "pointer" }}>
            <CardSubHeader>
              {t("FEE_HISTORY")} {showHistory ? "▲" : "▼"}
            </CardSubHeader>
          </div>

          {showHistory && (
            <>
              {/* {timeObj && (
                <div style={{ marginBottom: "8px", fontStyle: "italic" }}>
                  {t("TOTAL_TIME_TAKEN")}: {timeObj?.days} {t("DAYS")} {timeObj?.hours} {t("HOURS")} {timeObj?.minutes} {t("MINUTES")} {timeObj?.seconds} {t("SECONDS")} 
                </div>
              )} */}
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginTop: "8px", display: "block", width: "100%" }}>
                <table
                  className="customTable table-border-style"
                  style={{ width: "100%", tableLayout: "auto", minWidth: "500px", borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ padding: "12px 8px", fontSize: "12px", minWidth: "120px" }}>
                        {t("LABELS")}
                      </th>
                      {Array.from({ length: Math.max(...Object.values(feeHistory).map((rows) => rows.length)) }).map((_, idx) => (
                        <th key={idx} colSpan={Object.keys(feeHistory).length} style={{ padding: "12px 8px", fontSize: "12px", textAlign: "center" }}>
                          {t("ENTRY")} {idx + 1}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {Array.from({ length: Math.max(...Object.values(feeHistory).map((rows) => rows.length)) }).flatMap((_, idx) =>
                        Object.keys(feeHistory).map((taxHeadCode) => (
                          <th
                            key={`${idx}-${taxHeadCode}`}
                            style={{ padding: "12px 8px", fontSize: "12px", whiteSpace: "nowrap", minWidth: "120px" }}
                          >
                            {t(taxHeadCode)}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {["FEE", "REMARK", "LAST_UPDATED_BY"].map((labelKey) => (
                      <tr key={labelKey}>
                        <td style={{ fontWeight: "bold", padding: "12px 8px" }}>{t(labelKey)}</td>
                        {Array.from({ length: Math.max(...Object.values(feeHistory).map((rows) => rows.length)) }).flatMap((_, idx) =>
                          Object.entries(feeHistory).map(([taxHeadCode, historyRows]) => {
                            const h = historyRows[idx];
                            let value;
                            if (labelKey === "FEE") value = h?.estimateAmount || t("CS_NA");
                            if (labelKey === "REMARK") value = h?.remarks || t("CS_NA");
                            if (labelKey === "LAST_UPDATED_BY") value = h?.who || t("UNKNOWN");
                            return (
                              <td key={`${labelKey}-${idx}-${taxHeadCode}`} style={{ padding: "12px 8px", fontSize: "12px" }}>
                                {value}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};;
