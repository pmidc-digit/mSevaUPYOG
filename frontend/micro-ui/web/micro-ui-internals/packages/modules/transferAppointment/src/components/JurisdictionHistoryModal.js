import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Table, Loader } from "@mseva/digit-ui-react-components";
import { formatEpochToDate, resolveTenantDetails } from "../utils/jurisdictionUtils";

const CloseBtn = ({ onClick }) => (
  <div onClick={onClick} style={{ cursor: "pointer", padding: "5px 10px", fontSize: "1.2rem", fontWeight: "bold" }}>
    ✕
  </div>
);

const Heading = ({ label }) => (
  <h1 className="heading-m" style={{ marginLeft: "10px", fontSize: "1.25rem", fontWeight: "700" }}>
    {label}
  </h1>
);

/**
 * Jurisdiction History Modal per TRD JUR-13:
 * "Show a history tab per employee listing all past jurisdiction changes, newest first."
 */
const JurisdictionHistoryModal = ({
  isOpen,
  onClose,
  employee,
  auditHistory = [],
  isLoading = false,
  allTenants = [],
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Transform audit records newest first
  const sortedHistory = [...auditHistory].sort((a, b) => {
    const timeA = a.createdDate || a.timestamp || 0;
    const timeB = b.createdDate || b.timestamp || 0;
    return Number(timeB) - Number(timeA);
  });

  return (
    <Modal
      headerBarMain={
        <Heading
          label={
            t("JUR_HISTORY_TITLE", { name: employee?.user?.name, code: employee?.code }) ||
            `Jurisdiction History - ${employee?.user?.name || ""} (${employee?.code || ""})`
          }
        />
      }
      headerBarEnd={<CloseBtn onClick={onClose} />}
      actionCancelOnSubmit={onClose}
      actionCancelLabel={t("CS_COMMON_CLOSE") || "Close"}
      formId="history-modal"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "65vh",
          overflowY: "auto",
          padding: "10px 0",
          boxSizing: "border-box",
        }}
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#505a5f" }}>
            <Loader />
            <p style={{ marginTop: "1rem", fontWeight: 600, fontSize: "0.95rem" }}>
              {t("JUR_LOADING_HISTORY") || "Loading jurisdiction audit history... Please wait."}
            </p>
          </div>
        ) : sortedHistory.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sortedHistory.map((record, index) => {
              const action = record.action || "UPDATE";
              const isAdd = action === "ADD";
              const tenantDetails = resolveTenantDetails(record.tenantId || record.boundary, allTenants);
              const dateStr = formatEpochToDate(record.createdDate || record.timestamp);

              return (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          backgroundColor: isAdd ? "#e8f5e9" : "#ffebee",
                          color: isAdd ? "#2e7d32" : "#c62828",
                        }}
                      >
                        {action}
                      </span>
                      <strong style={{ fontSize: "1rem" }}>{tenantDetails.ulbName}</strong>
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "#616161" }}>{dateStr}</span>
                  </div>

                  {record.reason && (
                    <div style={{ fontSize: "0.9rem", color: "#424242", marginTop: "4px" }}>
                      <strong>{t("JUR_REASON") || "Reason"}:</strong> {record.reason}
                    </div>
                  )}

                  <div style={{ fontSize: "0.8rem", color: "#757575", marginTop: "6px" }}>
                    {t("JUR_ACTION_BY") || "Changed By"}: {record.createdBy || record.userName || "System"} 
                    {record.role ? ` (${record.role})` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "#757575" }}>
            {t("JUR_NO_HISTORY_AVAILABLE") || "No previous jurisdiction change logs recorded for this employee."}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default JurisdictionHistoryModal;

