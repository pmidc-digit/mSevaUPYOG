import React, { useState } from "react";
import { TextInput, LinkButton } from "@mseva/digit-ui-react-components";


const CustomFeeTable = ({
  data = [],
  columns = [],
  t,
  readOnly = false,
  localState = {},
  onStateChange = () => {},
  renderTableBody = () => null,
  historyData = null,
  historyTitle = "History",
  onHistoryRender = null,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <React.Fragment>

      <div className="custom-fee-table-wrapper">
        <table className="customTable table-border-style custom-fee-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.id} className={`custom-fee-table-header custom-fee-table-header-${col.id}`}>
                  {t(col.headerLabel || col.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>


      {historyData && Object.keys(historyData).length > 0 && (
        <div className="custom-fee-history-section">
          <div
            onClick={() => setShowHistory(!showHistory)}
            className="custom-fee-history-toggle"
          >
            <h4 style={{ margin: 0, cursor: "pointer" }}>
              {t(historyTitle)} {showHistory ? "▲" : "▼"}
            </h4>
          </div>

          {showHistory && (
            <div className="custom-fee-history-table-wrapper">
              <table className="customTable table-border-style custom-fee-history-table">
                <thead>
                  <tr>
                    {Object.keys(historyData).map((key) => (
                      <th key={key} className="custom-fee-history-header">
                        {t(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({
                    length: Math.max(...Object.values(historyData).map((rows) => rows?.length || 0)),
                  }).map((_, rowIdx) => {
                    const maxLen = Math.max(...Object.values(historyData).map((rows) => rows?.length || 0));
                    const descIdx = maxLen - 1 - rowIdx;

                    return (
                      <tr key={rowIdx}>
                        {Object.entries(historyData).map(([key, historyRows]) => {
                          const h = historyRows?.[descIdx];
                          return (
                            <td key={key} className="custom-fee-history-cell">
                              {h ? (
                                onHistoryRender ? onHistoryRender(h, key, t) : JSON.stringify(h)
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
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default CustomFeeTable;
