import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Table, Card } from "@mseva/digit-ui-react-components";
import { getActiveJurisdictions } from "../utils/jurisdictionUtils";

/**
 * Responsive Results Table
 * - Top search bar filtering by name, designation, department, and mobile number.
 * - Clean headers without sort indicators.
 * - Action column removed, click on employee code or name to open details.
 * - Symmetric pagination.
 */
const JurisdictionTable = ({
  employees = [],
  isLoading = false,
  hasSearched = false,
  onSelectEmployee,
  allTenants = [],
}) => {
  const { t } = useTranslation();

  // Search input state for table filtering
  const [tableSearchText, setTableSearchText] = useState("");

  // Pagination state (default 20 rows per TRD JUR-05)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Reset page when employees change
  useEffect(() => {
    setCurrentPage(0);
  }, [employees]);

  // Normalize data for display
  const allRows = useMemo(() => {
    return employees.map((emp) => {
      const activeJurisdictions = getActiveJurisdictions(emp);
      const currentAssignment =
        emp?.assignments?.find((a) => a?.isCurrentAssignment) || emp?.assignments?.[0] || {};

      return {
        code: emp?.code || "N/A",
        name: emp?.user?.name || "N/A",
        designation: currentAssignment?.designation
          ? t(`COMMON_MASTERS_DESIGNATION_${currentAssignment.designation}`)
          : "N/A",
        department: currentAssignment?.department
          ? t(`COMMON_MASTERS_DEPARTMENT_${currentAssignment.department}`)
          : "N/A",
        mobile: emp?.user?.mobileNumber || "N/A",
        jurisdictionCount: activeJurisdictions.length,
        originalEmployee: emp,
      };
    });
  }, [employees, t]);

  // Filter rows by table search bar (name, designation, department, mobile, code)
  const filteredRows = useMemo(() => {
    if (!tableSearchText || !tableSearchText.trim()) return allRows;
    const q = tableSearchText.toLowerCase().trim();
    return allRows.filter((row) => {
      return (
        String(row.name || "").toLowerCase().includes(q) ||
        String(row.designation || "").toLowerCase().includes(q) ||
        String(row.department || "").toLowerCase().includes(q) ||
        String(row.mobile || "").toLowerCase().includes(q) ||
        String(row.code || "").toLowerCase().includes(q)
      );
    });
  }, [allRows, tableSearchText]);

  // Slice rows for current page
  const paginatedRows = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalRecords = filteredRows.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startRecord = totalRecords > 0 ? currentPage * pageSize + 1 : 0;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalRecords);

  // Table columns without sort indicators and without Actions column
  const columns = useMemo(
    () => [
      {
        Header: t("HR_EMPLOYEE_ID_LABEL") || "Employee Code",
        accessor: "code",
        disableSortBy: true,
        Cell: ({ row, value }) => (
          <span
            onClick={() => onSelectEmployee(row.original.originalEmployee)}
            style={{
              color: "#c84c0e",
              cursor: "pointer",
              fontWeight: 600,
              textDecoration: "underline",
            }}
            title={t("CLICK_TO_MANAGE_JURISDICTIONS") || "Click to view jurisdictions"}
          >
            {value}
          </span>
        ),
      },
      {
        Header: t("HR_NAME_LABEL") || "Name",
        accessor: "name",
        disableSortBy: true,
        Cell: ({ row, value }) => (
          <span
            onClick={() => onSelectEmployee(row.original.originalEmployee)}
            style={{
              cursor: "pointer",
              fontWeight: 600,
              color: "#0b0c0c",
            }}
            title={t("CLICK_TO_MANAGE_JURISDICTIONS") || "Click to view jurisdictions"}
          >
            {value}
          </span>
        ),
      },
      {
        Header: t("HR_DESG_LABEL") || "Designation",
        accessor: "designation",
        disableSortBy: true,
      },
      {
        Header: t("HR_DEPT_LABEL") || "Department",
        accessor: "department",
        disableSortBy: true,
      },
      {
        Header: t("HR_MOB_NO_LABEL") || "Mobile",
        accessor: "mobile",
        disableSortBy: true,
      },
      {
        Header: t("JUR_COUNT_LABEL") || "Jurisdictions",
        accessor: "jurisdictionCount",
        disableSortBy: true,
        Cell: ({ value }) => (
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: "12px",
              backgroundColor: value > 1 ? "#e8f5e9" : "#fff3e0",
              color: value > 1 ? "#2e7d32" : "#e65100",
              fontWeight: 700,
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          >
            {value}
          </span>
        ),
      },
    ],
    [t, onSelectEmployee]
  );

  if (!hasSearched) {
    return (
      <Card
        className="employeeCard-override"
        style={{
          textAlign: "center",
          padding: "2.5rem 1rem",
          color: "#505a5f",
          marginLeft: 0,
          marginRight: 0,
          width: "100%",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
        <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
          {t("ES_SEARCH_TO_VIEW_RECORDS") || "Select a ULB and click Search to view employees."}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="jurisdiction-table-card employeeCard-override"
      style={{
        marginTop: "1rem",
        padding: "1.25rem",
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "100%",
        marginLeft: 0,
        marginRight: 0,
      }}
    >
      {/* Top Bar: Search Bar in place of Export Button & Count */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "1rem",
          width: "100%",
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
          <input
            type="text"
            value={tableSearchText}
            onChange={(e) => {
              setTableSearchText(e.target.value);
              setCurrentPage(0);
            }}
            placeholder={
              t("SEARCH_BY_NAME_DESG_DEPT_MOB") ||
              "Search by Name, Designation, Dept, Mobile..."
            }
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              borderRadius: "4px",
              border: "1px solid #757575",
              fontSize: "0.9rem",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.95rem",
              color: "#757575",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          {tableSearchText && (
            <span
              onClick={() => {
                setTableSearchText("");
                setCurrentPage(0);
              }}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#757575",
                fontWeight: "bold",
                fontSize: "0.85rem",
              }}
              title="Clear search"
            >
              ✕
            </span>
          )}
        </div>
      </div>

      {/* Responsive Table Container (guarantees no viewport breaking) */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
        }}
      >
        {paginatedRows.length > 0 ? (
          <Table
            t={t}
            data={paginatedRows}
            columns={columns}
            getCellProps={(cellInfo) => ({
              style: {
                padding: "12px 14px",
                fontSize: "14px",
                whiteSpace: "nowrap",
              },
            })}
            isPaginationRequired={false}
            disableSort={true}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#505a5f" }}>
            {tableSearchText
              ? t("CS_COMMON_NO_SEARCH_MATCHES") || "No employees match your search criteria."
              : t("CS_COMMON_NO_DATA") || "No employees found with active jurisdiction in the selected ULB."}
          </div>
        )}
      </div>

      {/* Symmetric In-Card Pagination Footer */}
      {totalRecords > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "1.25rem",
            paddingTop: "1rem",
            borderTop: "1px solid #f0f0f0",
            fontSize: "0.9rem",
            color: "#505a5f",
          }}
        >
          {/* Rows Per Page Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{t("CS_COMMON_ROWS_PER_PAGE") || "Rows per page"}:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #d6d5d4",
                backgroundColor: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                outline: "none",
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Showing Count Indicator */}
          <div style={{ fontWeight: 500 }}>
            {t("COMMON_SHOWING") || "Showing"} <strong>{startRecord}</strong> - <strong>{endRecord}</strong>{" "}
            {t("COMMON_OF") || "of"} <strong>{totalRecords}</strong>
          </div>

          {/* Page Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid #d6d5d4",
                backgroundColor: currentPage === 0 ? "#f5f5f5" : "#fff",
                color: currentPage === 0 ? "#9e9e9e" : "#0b0c0c",
                cursor: currentPage === 0 ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              ◀
            </button>
            <span style={{ margin: "0 6px", fontWeight: 600 }}>
              {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid #d6d5d4",
                backgroundColor: currentPage >= totalPages - 1 ? "#f5f5f5" : "#fff",
                color: currentPage >= totalPages - 1 ? "#9e9e9e" : "#0b0c0c",
                cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default JurisdictionTable;
