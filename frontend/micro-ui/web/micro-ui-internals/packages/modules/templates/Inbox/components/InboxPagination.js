// import React from "react";
// import { useTranslation } from "react-i18next";

// const styles = {
//   pagination: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "flex-end",
//     gap: "12px",
//     padding: "12px 20px 18px",
//     borderTop: "1px solid #eef2f7",
//     fontSize: "12px",
//     color: "#6b7280",
//     background: "#ffffff",
//     borderRadius: "0 0 16px 16px",
//     marginTop: "16px",
//   },
//   button: {
//     border: "1px solid #e5e7eb",
//     background: "#ffffff",
//     borderRadius: "8px",
//     padding: "4px 8px",
//     cursor: "pointer",
//     fontFamily: "inherit",
//   },
//   buttonDisabled: {
//     border: "1px solid #e5e7eb",
//     background: "#ffffff",
//     borderRadius: "8px",
//     padding: "4px 8px",
//     fontFamily: "inherit",
//     opacity: 0.5,
//     cursor: "not-allowed",
//   },
//   select: {
//     border: "1px solid #e5e7eb",
//     borderRadius: "8px",
//     padding: "4px 8px",
//     background: "#ffffff",
//     fontFamily: "inherit",
//   },
// };

// const InboxPagination = ({
//   offset = 0,
//   limit = 10,
//   totalCount = 0,
//   onPageSizeChange,
//   onNextPage,
//   onPrevPage,
//   pageSizes = [10, 20, 30, 40, 50],
// }) => {
//   const { t } = useTranslation();

//   if (totalCount <= 0) return null;

//   const startItem = offset + 1;
//   const endItem = Math.min(offset + limit, totalCount);
//   const canGoPrev = offset > 0;
//   const canGoNext = offset + limit < totalCount;

//   return (
//     <div style={styles.pagination}>
//       {t("CS_COMMON_ROWS_PER_PAGE")}:
//       <select style={styles.select} value={limit} onChange={onPageSizeChange}>
//         {pageSizes.map((pageSize) => (
//           <option key={pageSize} value={pageSize}>
//             {pageSize}
//           </option>
//         ))}
//       </select>
//       <span>
//         {startItem}-{endItem} of {totalCount}
//       </span>
//       <button style={canGoPrev ? styles.button : styles.buttonDisabled} onClick={onPrevPage} disabled={!canGoPrev}>
//         ‹
//       </button>
//       <button style={canGoNext ? styles.button : styles.buttonDisabled} onClick={onNextPage} disabled={!canGoNext}>
//         ›
//       </button>
//     </div>
//   );
// };

// export default InboxPagination;


import React from "react";
import { useTranslation } from "react-i18next";


const InboxPagination = ({
  offset = 0,
  limit = 10,
  totalCount = 0,
  onPageSizeChange,
  onNextPage,
  onPrevPage,
  pageSizes = [10, 20, 30, 40, 50],
}) => {
  const { t } = useTranslation();

  if (totalCount <= 0) return null;

  const startItem = offset + 1;
  const endItem = Math.min(offset + limit, totalCount);
  const canGoPrev = offset > 0;
  const canGoNext = offset + limit < totalCount;

  return (
    <div className="new-inbox-pagination">
      {t("CS_COMMON_ROWS_PER_PAGE")}:

      <select
        className="new-inbox-pagination-select"
        value={limit}
        onChange={onPageSizeChange}
      >
        {pageSizes.map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            {pageSize}
          </option>
        ))}
      </select>

      <span className="new-inbox-pagination-info">
        {startItem}-{endItem} of {totalCount}
      </span>

      <button
        className={`new-inbox-pagination-button ${
          !canGoPrev ? "new-inbox-pagination-button-disabled" : ""
        }`}
        onClick={onPrevPage}
        disabled={!canGoPrev}
      >
        ‹
      </button>

      <button
        className={`new-inbox-pagination-button ${
          !canGoNext ? "new-inbox-pagination-button-disabled" : ""
        }`}
        onClick={onNextPage}
        disabled={!canGoNext}
      >
        ›
      </button>
    </div>
  );
};

export default InboxPagination;