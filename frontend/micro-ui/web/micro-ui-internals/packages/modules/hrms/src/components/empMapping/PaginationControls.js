import React from "react";

// The mapping API returns no total count, so the controls only know whether a next page exists
const PaginationControls = ({ t, pageOffset, pageSize, rowCount, currentPage, hasNextPage, onPrevious, onNext, onPageSizeChange }) => {
  return (
    <>
      {/* Page Size Selector */}
      <div className="hrms-pagination__page-size-selector">
        <span>{`${t("COMMON_ROWS_PER_PAGE") || "Rows per page"}:`}</span>
        <select value={pageSize} onChange={onPageSizeChange} className="hrms-pagination__page-size-select">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Pagination Navigation */}
      <div className="hrms-pagination__controls">
        <div className="hrms-pagination__info">
          {t("COMMON_SHOWING")} {pageOffset + 1} {t("COMMON_TO")} {pageOffset + rowCount}
        </div>

        <div className="hrms-pagination__buttons">
          <button
            onClick={onPrevious}
            disabled={pageOffset === 0}
            className={`hrms-pagination__btn ${pageOffset === 0 ? "hrms-pagination__btn--disabled" : ""}`}
          >
            ← {t("COMMON_PREVIOUS")}
          </button>

          <span className="hrms-pagination__page-info">
            {t("COMMON_PAGE")} {currentPage + 1}
          </span>

          <button
            onClick={onNext}
            disabled={!hasNextPage}
            className={`hrms-pagination__btn ${!hasNextPage ? "hrms-pagination__btn--disabled" : ""}`}
          >
            {t("COMMON_NEXT")} →
          </button>
        </div>
      </div>
    </>
  );
};

export default PaginationControls;
