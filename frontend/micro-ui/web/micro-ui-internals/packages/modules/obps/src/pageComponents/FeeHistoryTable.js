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

 console.log('feeHistory', feeHistory)
 console.log("feeHistory keys", Object.keys(feeHistory || {}));
  return (
    <div className="noc-table-container">      
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
