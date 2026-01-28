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
      <div className="hrms-pagination__page-size-selector">
        <span>
          {t("COMMON_ROWS_PER_PAGE") || "Rows per page:"}:
        </span>
        <select
          value={pageSize}
          onChange={onPageSizeChange}
          className="hrms-pagination__page-size-select"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Pagination Navigation */}
      <div className="hrms-pagination__controls">
        <div className="hrms-pagination__info">
          {t("COMMON_SHOWING")} {pageOffset + 1} {t("COMMON_TO")} {Math.min(pageOffset + pageSize, totalRecords)}{" "}
          {t("COMMON_OF")} {totalRecords}
        </div>

        <div className="hrms-pagination__buttons">
          <button
            onClick={onPrevious}
            disabled={pageOffset === 0}
            className={`hrms-pagination__btn ${pageOffset === 0 ? 'hrms-pagination__btn--disabled' : ''}`}
          >
            ← {t("COMMON_PREVIOUS")}
          </button>

          <span className="hrms-pagination__page-info">
            {t("COMMON_PAGE")} {currentPage + 1} {t("COMMON_OF")} {totalPages || 1}
          </span>

          <button
            onClick={onNext}
            disabled={pageOffset + pageSize >= totalRecords}
            className={`hrms-pagination__btn ${pageOffset + pageSize >= totalRecords ? 'hrms-pagination__btn--disabled' : ''}`}
          >
            {t("COMMON_NEXT")} →
          </button>
        </div>
      </div>
    </>
  );
};

export default PaginationControls;
