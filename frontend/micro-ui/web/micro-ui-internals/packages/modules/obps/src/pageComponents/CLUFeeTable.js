import React,{useState, Fragment} from "react";
import {
  TextInput,
  CardSubHeader,
  CardSectionSubText,
} from "@mseva/digit-ui-react-components";
//import NOCCustomUploadFile from "./NOCCustomUploadFile";
import CustomUploadFile from "../components/CustomUploadFile";
import { amountToWords } from "../utils";

export const CLUFeeTable = ({
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
  //console.log('feeDataWithTotal in fee table==>', feeDataWithTotal)
  const [showHistory, setShowHistory] = useState(false);
  const lastUpdatedBy = feeHistory?.CLU_CLU_FEE?.[0]?.who || "";

  // console.log("feeHistroy here  ==>", feeHistory);
  // console.log("lastUpdatedBy ==>", lastUpdatedBy);

  return (
    <div className="noc-table-container" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", marginBottom: "16px", display: "block" }}>
      <table className="customTable table-border-style" style={{ width: "100%", tableLayout: "auto", minWidth: "600px", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "14px 12px", fontSize: "12px", whiteSpace: "nowrap" }}>{t("BPA_TAXHEAD_CODE")}</th>
            <th style={{ padding: "14px 12px", fontSize: "12px", whiteSpace: "nowrap" }}>{t("BPA_AMOUNT")}</th>
            {/* <th>{t("BPA_ADJUSTED_AMOUNT")}</th> */}
            {/* <th>{t("BPA_FILE_UPLOAD")}</th> */}
            <th style={{ padding: "14px 12px", fontSize: "12px", whiteSpace: "nowrap" }}>{t("BPA_REMARKS")}</th>
          </tr>
        </thead>
        <tbody>
          {feeDataWithTotal.map(
            (row, i) => (
              (
                <tr key={row.index || i}>
                  <td style={{ padding: "14px 12px", fontSize: "13px", minWidth: "150px" }}>{t(row.title) || t("CS_NA")}</td>
                  {/* <td>{row.amount !== null && row.amount !== undefined ? `₹ ${row.amount.toLocaleString()}` : t("CS_NA")}</td> */}
                  <td className="remark-cell">
                    {row?.taxHeadCode === "CLU_TOTAL" ? (
                      ""
                    ) : (
                      <TextInput
                        t={t}
                        type="number"
                        isMandatory={false}
                        value={
                          feeData[row.index]?.adjustedAmount === 0
                          ? ""  : feeData[row.index]?.adjustedAmount ?? row.amount ?? ""
                        }
                       onChange={(e) => {
                         let val = e.target.value;

                        if (val.length > 1 && val.startsWith("0")) {
                         val = val.replace(/^0+/, "");
                        }

                        handleAdjustedAmountChange(row.index, val);
                        }}
                        //  no onBlur here for CLU
                        disable={disable}
                        step={1}
                        onBlur={onAdjustedAmountBlur}
                      />
                    )}
                  </td>
                  {/* <td>
                    {row?.taxHeadCode === "CLU_TOTAL" ? null : (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <CustomUploadFile
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

                  <td className="remark-cell">
                    {row?.taxHeadCode === "CLU_TOTAL" ? (
                    <div>
                      <strong style={{ fontSize: "14px" }}>{row.grandTotal.toLocaleString("en-IN")}</strong>
                      <div style={{ fontSize: "0.85em", color: "#555", marginTop: "4px", lineHeight: "1.3" }}>{amountToWords(row.grandTotal)}</div>
                   </div>
                    ) : (
                      <TextInput
                        t={t}
                        type="text"
                        isMandatory={true}
                        value={feeData[row.index]?.remark || ""}
                        onChange={(e) => handleRemarkChange(row.index, e.target.value, row.amount)}
                        disable={disable}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    )}
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>

      {feeHistory && Object.keys(feeHistory).length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div onClick={() => setShowHistory(!showHistory)} style={{ cursor: "pointer" }}>
            <CardSubHeader>
              {t("BPA_FEE_HISTORY_LABEL")} {showHistory ? "▲" : "▼"}
            </CardSubHeader>
          </div>

          {showHistory && (
            <>
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginTop: "8px", display: "block", width: "100%" }}>
                <table className="customTable table-border-style" style={{ width: "100%", tableLayout: "auto", minWidth: "500px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {Object.keys(feeHistory).map((taxHeadCode) => (
                        <th key={taxHeadCode} style={{ padding: "12px 8px", fontSize: "12px", whiteSpace: "nowrap", minWidth: "120px" }}>{t(taxHeadCode)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.max(...Object.values(feeHistory).map((rows) => rows.length)) }).map((_, rowIdx) => {
                      // compute descending index
                      const maxLen = Math.max(...Object.values(feeHistory).map((rows) => rows.length));
                      const descIdx = maxLen - 1 - rowIdx;

                      return (
                        <tr key={rowIdx}>
                          {Object.entries(feeHistory).map(([taxHeadCode, historyRows]) => {
                            const h = historyRows[descIdx]; // use reversed index
                            return (
                              <td key={taxHeadCode} style={{ padding: "12px 8px", minWidth: "120px", verticalAlign: "top" }}>
                                {h ? (
                                  <div style={{ fontSize: "12px" }}>
                                    <div style={{ marginBottom: "8px" }}>
                                      <strong>{t("BPA_FEE2_LABEL")}:</strong> {h.estimateAmount}
                                    </div>
                                    <div style={{ marginBottom: "8px" }}>
                                      <strong>{t("BPA_REMARK_LABEL")}:</strong> <span style={{ wordBreak: "break-word" }}>{h.remarks || t("CS_NA")}</span>
                                    </div>
                                    <div>
                                      <strong>{t("BPA_UPDATED_BY_LABEL")}:</strong> <span style={{ wordBreak: "break-word" }}>{h.who || t("UNKNOWN")}</span>
                                    </div>
                                  </div>
                                ) : (
                                  t("CS_NA")
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* <span>Last Updated By : {lastUpdatedBy}</span> */}
            </>
          )}
        </div>
      )}
    </div>
  );
};
