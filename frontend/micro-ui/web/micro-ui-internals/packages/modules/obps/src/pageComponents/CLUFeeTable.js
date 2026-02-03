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
    <div className="custom-fee-table-wrapper">
      <table className="customTable table-border-style custom-fee-table">
        <thead>
          <tr>
            <th className="custom-fee-table-header">{t("BPA_TAXHEAD_CODE")}</th>
            <th className="custom-fee-table-header">{t("BPA_AMOUNT")}</th>
            <th className="custom-fee-table-header">{t("BPA_REMARKS")}</th>
          </tr>
        </thead>
        <tbody>
          {feeDataWithTotal.map(
            (row, i) => (
              (
                <tr key={row.index || i}>
                  <td className="custom-fee-table-cell custom-fee-table-cell-taxhead">{t(row.title) || t("CS_NA")}</td>
                  {/* <td>{row.amount !== null && row.amount !== undefined ? `₹ ${row.amount.toLocaleString()}` : t("CS_NA")}</td> */}
                  <td className="custom-fee-table-cell custom-fee-table-cell-amount">
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

                  <td className="custom-fee-table-cell custom-fee-table-cell-remark">
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
        <div className="custom-fee-history-section">
          <div onClick={() => setShowHistory(!showHistory)} className="custom-fee-history-toggle">
            <CardSubHeader>
              {t("BPA_FEE_HISTORY_LABEL")} {showHistory ? "▲" : "▼"}
            </CardSubHeader>
          </div>

          {showHistory && (
            <>
              <div className="custom-fee-history-table-wrapper">
                <table className="customTable table-border-style custom-fee-history-table">
                  <thead>
                    <tr>
                      {Object.keys(feeHistory).map((taxHeadCode) => (
                        <th key={taxHeadCode} className="custom-fee-history-header">{t(taxHeadCode)}</th>
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
                              <td key={taxHeadCode} className="custom-fee-history-cell">
                                {h ? (
                                  <div className="custom-fee-history-content">
                                    <div className="custom-fee-history-row custom-fee-history-label">
                                      <strong>{t("BPA_FEE2_LABEL")}:</strong> {h.estimateAmount}
                                    </div>
                                    <div className="custom-fee-history-row custom-fee-history-label">
                                      <strong>{t("BPA_REMARK_LABEL")}:</strong> <span className="custom-fee-history-label-value">{h.remarks || t("CS_NA")}</span>
                                    </div>
                                    <div>
                                      <strong>{t("BPA_UPDATED_BY_LABEL")}:</strong> <span className="custom-fee-history-label-value">{h.who || t("UNKNOWN")}</span>
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
