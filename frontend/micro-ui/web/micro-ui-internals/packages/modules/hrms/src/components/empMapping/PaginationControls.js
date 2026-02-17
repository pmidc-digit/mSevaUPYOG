import React,{Fragment} from "react";

const PaginationControls = ({ 
  t, 
  pageOffset, 
  pageSize, 
  totalRecords, 
  currentPage, 
  totalPages,
  onPrevious,
  onNext,
  onPageSizeChange 
}) => {
  return (
    <>
      {/* Page Size Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", justifyContent: "flex-end" }}>
        <span style={{ fontSize: "14px", color: "#666" }}>
          {t("COMMON_ROWS_PER_PAGE") || "Rows per page:"}:
        </span>
        <select
          value={pageSize}
          onChange={onPageSizeChange}
          style={{
            padding: "6px 12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Pagination Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          padding: "10px 0",
        }}
      >
        <div style={{ fontSize: "14px", color: "#666" }}>
          {t("COMMON_SHOWING")} {pageOffset + 1} {t("COMMON_TO")} {Math.min(pageOffset + pageSize, totalRecords)}{" "}
          {t("COMMON_OF")} {totalRecords}
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={onPrevious}
            disabled={pageOffset === 0}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              backgroundColor: pageOffset === 0 ? "#f5f5f5" : "white",
              cursor: pageOffset === 0 ? "not-allowed" : "pointer",
              borderRadius: "4px",
              fontSize: "14px",
              opacity: pageOffset === 0 ? 0.5 : 1,
            }}
          >
            ← {t("COMMON_PREVIOUS")}
          </button>

          <span style={{ fontSize: "14px", color: "#666" }}>
            {t("COMMON_PAGE")} {currentPage + 1} {t("COMMON_OF")} {totalPages || 1}
          </span>

          <button
            onClick={onNext}
            disabled={pageOffset + pageSize >= totalRecords}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              backgroundColor: pageOffset + pageSize >= totalRecords ? "#f5f5f5" : "white",
              cursor: pageOffset + pageSize >= totalRecords ? "not-allowed" : "pointer",
              borderRadius: "4px",
              fontSize: "14px",
              opacity: pageOffset + pageSize >= totalRecords ? 0.5 : 1,
            }}
          >
            {t("COMMON_NEXT")} →
          </button>
        </div>
      </div>
    </>
  );
};

export default PaginationControls;
