import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const NewNDCInboxTable = ({ rows = [], parentRoute, columns = [], title }) => {
  const { t } = useTranslation();

  const data = useMemo(() => rows || [], [rows]);
  const resolvedColumns = useMemo(() => columns || [], [columns]);

  const getAccessorValue = (row, accessor) => {
    if (!accessor) return "";
    if (typeof accessor === "function") return accessor(row);
    if (typeof accessor === "string") {
      return accessor.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), row);
    }
    return "";
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();
    if (value.includes("approved")) return "approved";
    if (value.includes("rejected")) return "rejected";
    if (value.includes("forward")) return "forwarded";
    if (value.includes("process")) return "in-progress";
    if (value.includes("pending")) return "pending";
    if (value.includes("new")) return "new";
    return "default";
  };

  const renderStatusIcon = (statusClass) => {
    switch (statusClass) {
      case "approved":
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
      case "rejected":
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        );
      case "forwarded":
        return (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="M13 5l7 7-7 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="ndc-new-table-card">
      <div className="ndc-new-table-header">{title || t("Assigned Applications")}</div>
      <div className="ndc-new-table-wrapper">
        <table className="ndc-new-table">
          <thead>
            <tr>
              {resolvedColumns.map((column, index) => (
                <th
                  key={column.id || column.accessor || index}
                  className={column.headerClassName || (column.type === "action" ? "ndc-new-table-action" : "")}
                >
                  {typeof column.Header === "function" ? column.Header() : column.Header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => {
              const rowStatus = row?.status || row?.applicationStatus || "";
              const rowStatusClass = getStatusClass(rowStatus);
              return (
                <tr key={row?.applicationId || row?.uuid || row?.id} className={`ndc-new-row ${rowStatusClass}`}>
                  {resolvedColumns.map((column, index) => {
                    const value = getAccessorValue(row, column.accessor);
                    if (column.Cell) {
                      const secondaryValue = column.subAccessor
                        ? getAccessorValue(row, column.subAccessor)
                        : undefined;
                      const secondaryDisplayValue = column.subFormatter
                        ? column.subFormatter(secondaryValue, row)
                        : secondaryValue;

                      if (column.subAccessor || column.subFormatter) {
                        return (
                          <td
                            key={column.id || column.accessor || index}
                            className={column.className || (column.type === "action" ? "ndc-new-table-action" : "")}
                          >
                            <div className="ndc-new-cell-stack">
                              <div className="ndc-new-cell-primary">
                                {column.Cell({ row: { original: row }, value, parentRoute })}
                              </div>
                              {/* {secondaryDisplayValue ? (
                                <div className="ndc-new-cell-secondary">{secondaryDisplayValue}</div>
                              ) : null} */}
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={column.id || column.accessor || index}
                          className={column.className || (column.type === "action" ? "ndc-new-table-action" : "")}
                        >
                          {column.Cell({ row: { original: row }, value, parentRoute })}
                        </td>
                      );
                    }

                    if (column.type === "status") {
                      const statusValue = value || row?.status || row?.applicationStatus || "-";
                      const statusLabel = String(statusValue || "-").toLowerCase();
                      const statusClass = getStatusClass(statusValue);
                      return (
                        <td key={column.id || column.accessor || index}>
                          <span className={`ndc-new-status-pill ${statusClass}`}>
                            {renderStatusIcon(statusClass)}
                            <span>{statusLabel}</span>
                          </span>
                        </td>
                      );
                    }

                    const displayValue = column.formatter ? column.formatter(value, row) : value;
                    const secondaryValue = column.subAccessor
                      ? getAccessorValue(row, column.subAccessor)
                      : undefined;
                    const secondaryDisplayValue = column.subFormatter
                      ? column.subFormatter(secondaryValue, row)
                      : secondaryValue;

                    if (column.subAccessor || column.subFormatter) {
                      return (
                        <td key={column.id || column.accessor || index} className={column.className}>
                          <div className="ndc-new-cell-stack">
                            <div className="ndc-new-cell-primary">{displayValue ?? "-"}</div>
                            {/* {secondaryDisplayValue ? (
                              <div className="ndc-new-cell-secondary">{secondaryDisplayValue}</div>
                            ) : null} */}
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={column.id || column.accessor || index} className={column.className}>
                        {displayValue ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewNDCInboxTable;
