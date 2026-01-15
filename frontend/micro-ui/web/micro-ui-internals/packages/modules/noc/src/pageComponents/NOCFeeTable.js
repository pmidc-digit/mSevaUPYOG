import React, {useState, Fragment } from "react";
import {
  TextInput,
  CardSubHeader,
} from "@mseva/digit-ui-react-components";
// import NOCCustomUploadFile from "./NOCCustomUploadFile";
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
    <div className="noc-table-container">
      <table className="customTable table-border-style">
        <thead>
          <tr>
            <th>{t("BPA_TAXHEAD_CODE")}</th>
            <th>{t("BPA_AMOUNT")}</th>
            {/* <th>{t("BPA_FILE_UPLOAD")}</th> */}
            <th>{t("BPA_REMARKS")}</th>
          </tr>
        </thead>
        <tbody>
          {feeDataWithTotal.map((row, i) => (
            <tr key={row.index || i}>
              <td>{t(row.title) || t("CS_NA")}</td>
              <td>
                {row?.taxHeadCode === "NOC_TOTAL" ? (
                  ""
                ) : (
                  <TextInput
                    t={t}
                    type="number"
                    isMandatory={false}
                    value={feeData[row.index]?.adjustedAmount ?? row.amount ?? ""}
                    onChange={(e) => handleAdjustedAmountChange(row.index, e.target.value)}
                    // ❌ no onBlur here for NOC
                    disable={disable}
                    step={1}
                    onBlur={onAdjustedAmountBlur}
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

              <td>
                {row?.taxHeadCode === "NOC_TOTAL" ? (
                  <strong>{row.grandTotal}</strong>
                ) : (
                  <TextInput
                    t={t}
                    type="text"
                    isMandatory={true}
                    value={feeData[row.index]?.remark ?? row.remark ?? ""}
                    onChange={(e) => handleRemarkChange(row.index, e.target.value, row.amount)}
                    disable={disable}
                    style={{
                      width: "100%",
                      padding: "4px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
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
              {timeObj && (
                <div style={{ marginBottom: "8px", fontStyle: "italic" }}>
                  {t("TOTAL_TIME_TAKEN")}: {timeObj?.days} {t("DAYS")} {timeObj?.hours} {t("HOURS")} {timeObj?.minutes} {t("MINUTES")} {timeObj?.seconds} {t("SECONDS")} 
                </div>
              )}
              <table className="customTable table-border-style" style={{ marginTop: "8px" }}>
                <thead>
                  <tr>
                    {Object.keys(feeHistory).map((taxHeadCode) => (
                      <th key={taxHeadCode}>{t(taxHeadCode)}</th>
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
                            <td key={taxHeadCode}>
                              {h ? (
                                <table className="customTable table-border-style">
                                  <tbody>
                                    <tr>
                                      <td>
                                        <strong>{t("FEE")}</strong>
                                      </td>
                                      <td>{h.estimateAmount}</td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <strong>{t("REMARK")}</strong>
                                      </td>
                                      <td>{h.remarks || t("CS_NA")}</td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <strong>{t("LAST_UPDATED_BY")}</strong>
                                      </td>
                                      <td>{h.who || t("UNKNOWN")}</td>
                                    </tr>
                                  </tbody>
                                </table>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};;
