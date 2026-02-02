import React, { useState, Fragment } from "react";
import {
  TextInput,
  CardSubHeader,
  CardSectionSubText,
} from "@mseva/digit-ui-react-components";
import CustomUploadFile from "../components/CustomUploadFile";
import { amountToWords } from "../utils";

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
  const [showHistory, setShowHistory] = useState(false);
  const lastUpdatedBy = feeHistory?.LAYOUT_TOTAL?.[0]?.who || "";

  return (
    <div className="layout-fee-table-container">
      <table className="customTable table-border-style">
        <thead>
          <tr>
            <th>{t("BPA_TAXHEAD_CODE")}</th>
            <th>{t("BPA_AMOUNT")}</th>
            <th>{t("BPA_FILE_UPLOAD")}</th>
            <th>{t("BPA_REMARKS")}</th>
          </tr>
        </thead>
        <tbody>
          {feeDataWithTotal.map(
            (row, i) => (
              (
                <tr key={row.index || i}>
                  <td>{t(row.title) || t("CS_NA")}</td>
                  <td>
                    {row?.taxHeadCode === "LAYOUT_TOTAL" ? (
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
                        disable={disable}
                        step={1}
                        onBlur={onAdjustedAmountBlur}
                      />
                    )}
                  </td>
                  <td>
                    {row?.taxHeadCode === "LAYOUT_TOTAL" ? null : (
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
                  </td>
                  <td>
                    {row?.taxHeadCode === "LAYOUT_TOTAL" ? (
                    <div>
                      <strong>{row.grandTotal.toLocaleString("en-IN")}</strong>
                      <div style={{ fontSize: "0.9em", color: "#555", marginTop: "4px" }}>{amountToWords(row.grandTotal)}</div>
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
                          padding: "4px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
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
                                        <strong>{t("BPA_FEE2_LABEL")}</strong>
                                      </td>
                                      <td>{h.estimateAmount}</td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <strong>{t("BPA_REMARK_LABEL")}</strong>
                                      </td>
                                      <td>{h.remarks || t("CS_NA")}</td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <strong>{t("BPA_UPDATED_BY_LABEL")}</strong>
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
};
