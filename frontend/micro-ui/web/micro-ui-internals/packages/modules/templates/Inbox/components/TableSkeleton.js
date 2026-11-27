import React from "react";

const DEFAULT_WIDTHS = ["58%", "76%", "42%", "82%", "70%", "52%"];

/**
 * Reusable shimmer skeleton for inbox/data tables.
 * Accepts optional `columns` (react-table style `{ Header }`) to keep real column headers visible while loading.
 */
const TableSkeleton = ({
  columns = [],
  rows = 8,
  columnCount = 6,
  showHeader = true,
  className = "",
}) => {
  const hasColumns = Array.isArray(columns) && columns.length > 0;
  const colTotal = hasColumns ? columns.length : Math.max(1, columnCount);
  const rowIndices = Array.from({ length: Math.max(1, rows) }, (_, i) => i);
  const colIndices = Array.from({ length: colTotal }, (_, i) => i);

  return (
    <div className={`inbox-table-skeleton-wrap ${className}`.trim()} aria-busy="true" aria-label="Loading table data">
      <style>{`
        @keyframes inboxTableShimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .inbox-table-skeleton-wrap {
          width: 100%;
          overflow-x: auto;
          background: #ffffff;
        }
        .inbox-table-skeleton-table {
          width: 100%;
          border-collapse: collapse;
          background: #ffffff;
        }
        .inbox-table-skeleton-th {
          padding: 14px 20px;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #475569;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .inbox-table-skeleton-td {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
        }
        .inbox-table-skeleton-bar {
          display: block;
          height: 14px;
          border-radius: 6px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: inboxTableShimmer 1.4s ease-in-out infinite;
        }
        .inbox-table-skeleton-bar--header {
          height: 12px;
          width: 70%;
        }
      `}</style>
      <table className="inbox-table-skeleton-table table ndc-new-table">
        {showHeader && (
          <thead>
            <tr>
              {colIndices.map((colIdx) => {
                const headerContent = hasColumns ? columns[colIdx]?.Header : null;
                return (
                  <th key={colIdx} className="inbox-table-skeleton-th">
                    {headerContent ? (
                      typeof headerContent === "function" ? headerContent() : headerContent
                    ) : (
                      <span className="inbox-table-skeleton-bar inbox-table-skeleton-bar--header" />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody>
          {rowIndices.map((rowIdx) => (
            <tr key={rowIdx}>
              {colIndices.map((colIdx) => {
                const baseWidth = DEFAULT_WIDTHS[(colIdx + rowIdx) % DEFAULT_WIDTHS.length];
                return (
                  <td key={colIdx} className="inbox-table-skeleton-td">
                    <span className="inbox-table-skeleton-bar" style={{ width: baseWidth }} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
