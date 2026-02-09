import React, { useState } from "react";
import { TextInput } from "@mseva/digit-ui-react-components";

const CustomFeeTable = ({
  data = [],
  columns = [],
  t,
  readOnly = false,
  extraStyleName = "",
  historyData = null,
  historyTitle = "History",
  onHistoryRender = null,
}) => {
  const [showHistory, setShowHistory] = useState(false);


  const getModuleStyles = (moduleName) => {
    switch (moduleName) {
      case "CLU":
        return {
          tableClass: "custom-fee-table",
          wrapperClass: "custom-fee-table-wrapper",
          headerClass: "custom-fee-table-header",
          cellClass: "custom-fee-table-cell",
        };
      case "Layout":
        return {
          tableClass: "layout-fee-table",
          wrapperClass: "layout-fee-table-wrapper",
          headerClass: "layout-fee-table-header",
          cellClass: "layout-fee-table-cell",
        };
      case "NOC":
        return {
          tableClass: "noc-fee-table",
          wrapperClass: "noc-fee-table-wrapper",
          headerClass: "noc-fee-table-header",
          cellClass: "noc-fee-table-cell",
        };
      default:
        return {
          tableClass: "custom-fee-table",
          wrapperClass: "custom-fee-table-wrapper",
          headerClass: "custom-fee-table-header",
          cellClass: "custom-fee-table-cell",
        };
    }
  };

  const styles = getModuleStyles(extraStyleName);


  const renderCell = (column, row, rowIndex) => {
    const { key, type, render, onChange, onBlur, getValue, disable, className, step, isMandatory = false } = column;


    let value = getValue ? getValue(row) : row[key] || "";


    if (value === null) return "";


    const isDisabled = typeof disable === "function" ? disable(row) : (disable || readOnly);

    switch (type) {
      case "text":
        return (
          <span className={className}>
            {t(value) || value || t("CS_NA")}
          </span>
        );

      case "number":
        return (
          <TextInput
            t={t}
            type="number"
            isMandatory={isMandatory}
            value={value === 0 ? "" : value}
            onChange={(e) => {
              if (onChange) {
                let val = e.target.value;
                if (val.length > 1 && val.startsWith("0")) {
                  val = val.replace(/^0+/, "");
                }
                onChange(row.index, val, row);
              }
            }}
            onBlur={(e) => {
              if (onBlur) {
                onBlur(e, row.index, row);
              }
            }}
            disable={isDisabled}
            step={step || 1}
            className={className || "custom-fee-table-input"}
          />
        );

      case "textarea":
      case "text-input":
        return (
          <TextInput
            t={t}
            type="text"
            isMandatory={isMandatory}
            value={value}
            onChange={(e) => {
              if (onChange) {
                onChange(row.index, e.target.value, row);
              }
            }}
            onBlur={(e) => {
              if (onBlur) {
                onBlur(e, row.index, row);
              }
            }}
            disable={isDisabled}
            className={className || "custom-fee-table-input"}
          />
        );

      case "custom":

        return render ? render(row, rowIndex, t) : value;

      default:
        return value;
    }
  };

  return (
    <React.Fragment>

      <div className={styles.wrapperClass}>
        <table className={`customTable table-border-style ${styles.tableClass}`}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`${styles.headerClass} ${styles.headerClass}-${col.key}`}>
                  {t(col.headerLabel || col.label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.index || rowIndex}>
                {columns.map((col) => (
                  <td key={col.key} className={`${styles.cellClass} ${styles.cellClass}-${col.key}`}>
                    {renderCell(col, row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
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
