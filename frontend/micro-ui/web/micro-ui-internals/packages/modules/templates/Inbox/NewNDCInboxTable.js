import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const NewNDCInboxTable = ({ rows = [], parentRoute }) => {
  const { t } = useTranslation();

  const data = useMemo(() => rows || [], [rows]);

  const getDate = (value) => {
    if (!value) return "-";
    try {
      return format(new Date(value), "yyyy-MM-dd");
    } catch (e) {
      return "-";
    }
  };

  const getType = (row) => row?.applicationType || row?.type || row?.serviceType || "-";
  const getStage = (row) => row?.currentStage || row?.wfStatus || row?.status || "-";

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
      <div className="ndc-new-table-header">{t("Assigned Applications")}</div>
      <div className="ndc-new-table-wrapper">
        <table className="ndc-new-table">
          <thead>
            <tr>
              <th>APPLICATION NO</th>
            
              <th>DATE</th>
              <th>STATUS</th>
              {/* <th>CURRENT STAGE</th> */}
              <th className="ndc-new-table-action">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => {
              const status = row?.status || row?.applicationStatus || "-";
              const statusLabel = String(status || "-").toLowerCase();
              const statusClass = getStatusClass(status);
              return (
                <tr key={row?.applicationId || row?.uuid || row?.id} className={`ndc-new-row ${statusClass}`}>
                  <td className="ndc-new-table-app">
                    <Link to={`${parentRoute}/inbox/application-overview/${row?.applicationId}`} className="ndc-new-app-link">
                      {row?.applicationId || row?.applicationNo || "-"}
                    </Link>
                  </td>
                 
                  <td>{getDate(row?.date || row?.createdTime)}</td>
                  <td>
                    <span className={`ndc-new-status-pill ${statusClass}`}>
                      {renderStatusIcon(statusClass)}
                      <span>{statusLabel}</span>
                    </span>
                  </td>
                  {/* <td>{getStage(row)}</td> */}
                  <td className="ndc-new-table-action">
                    <span className="ndc-new-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h4l2-4 4 8 2-4h6" />
                      </svg>
                    </span>
                    <span className="ndc-new-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                  </td>
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
