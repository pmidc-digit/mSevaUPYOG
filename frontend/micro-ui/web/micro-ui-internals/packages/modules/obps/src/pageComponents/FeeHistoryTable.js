import React, {useState, Fragment } from "react";
import {
  TextInput,
  CardSubHeader,
} from "@mseva/digit-ui-react-components";
// import NOCCustomUploadFile from "./NOCCustomUploadFile";

import { amountToWords } from "../utils";
export const FeeHistoryTable = ({  
  t,  
  feeHistory,
}) => {
  
const [showHistory, setShowHistory] = useState(false);

 
  return (
    <div className="noc-table-container">      
      {feeHistory && Object.keys(feeHistory).length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div onClick={() => setShowHistory(!showHistory)} style={{ cursor: "pointer" }}>
            <CardSubHeader>
              {t("BPA_FEE_HISTORY_LABEL")} {showHistory ? "▲" : "▼"}
            </CardSubHeader>
          </div>

          {showHistory && (
            <div className="custom-fix-fee-history-wrapper">

              <div className="custom-fix-fee-history-table-container">
                {/* build table similar to CLUFeeTable.renderCustomHistory */}
                {(() => {
                  const feeTypes = Object.keys(feeHistory || {});
                  if (feeTypes.length === 0) return null;
                  const maxHistoryLength = Math.max(...feeTypes.map((ft) => (feeHistory[ft]?.length || 0)));
                  return (
                    <table className="custom-fix-fee-history-table">
                      <thead>
                        <tr>
                          <th className="custom-fix-fee-history-table-header">Details</th>
                          {feeTypes.map((feeType) => (
                            <th key={feeType} className="custom-fix-fee-history-table-header-fee">
                              {t(feeType)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: maxHistoryLength }).map((_, entryIndex) => (
                          <React.Fragment key={entryIndex}>
                            <tr>
                              <td className="custom-fix-fee-history-table-cell-label">{t("BPA_FEE2_LABEL")}</td>
                              {feeTypes.map((feeType) => (
                                <td key={`${feeType}-fee-${entryIndex}`} className="custom-fix-fee-history-table-cell-value">
                                  {feeHistory[feeType]?.[entryIndex] ? `₹ ${feeHistory[feeType][entryIndex].estimateAmount}` : ""}
                                </td>
                              ))}
                            </tr>

                            <tr>
                              <td className="custom-fix-fee-history-table-cell-label">{t("BPA_REMARK_LABEL")}</td>
                              {feeTypes.map((feeType) => (
                                <td key={`${feeType}-remark-${entryIndex}`} className="custom-fix-fee-history-table-cell-value">
                                  {feeHistory[feeType]?.[entryIndex]?.remarks || t("CS_NA")}
                                </td>
                              ))}
                            </tr>

                            {feeTypes?.some((ft) => feeHistory[ft]?.[entryIndex]?.when) && (
                              <tr>
                                <td className="custom-fix-fee-history-table-cell-label">{t("BPA_LAST_UPDATED_DATE_LABEL")}</td>
                                {feeTypes?.map((feeType) => (
                                  <td key={`${feeType}-date-${entryIndex}`} className="custom-fix-fee-history-table-cell-value">
                                    {feeHistory[feeType]?.[entryIndex]?.when
                                      ? new Date(feeHistory[feeType][entryIndex].when).toLocaleDateString("en-IN")
                                      : t("CS_NA")}
                                  </td>
                                ))}
                              </tr>
                            )}

                            <tr>
                              <td
                                className={
                                  entryIndex < maxHistoryLength - 1
                                    ? "custom-fix-fee-history-table-cell-separator"
                                    : "custom-fix-fee-history-table-cell-separator-last"
                                }
                              >
                                {t("BPA_UPDATED_BY_LABEL")}
                              </td>
                              <td
                                colSpan={feeTypes.length}
                                className={
                                  entryIndex < maxHistoryLength - 1
                                    ? "custom-fix-fee-history-table-cell-separator-value"
                                    : "custom-fix-fee-history-table-cell-separator-value-last"
                                }
                              >
                                {feeTypes.map((ft) => feeHistory[ft]?.[entryIndex]?.who).find((who) => who) || t("UNKNOWN")}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};;