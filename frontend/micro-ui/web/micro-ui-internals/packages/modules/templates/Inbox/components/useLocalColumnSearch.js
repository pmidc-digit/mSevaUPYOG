import React, { useMemo, useState } from "react";

export const getColumnText = (value) => {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(getColumnText).join(" ");
  if (React.isValidElement(value)) return getColumnText(value.props.children);
  return String(value);
};

const SearchHeader = ({ column }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <span>{column.searchLabel}</span>
    <input type="search" aria-label={`Search ${column.searchLabel}`} placeholder="Search…"
      value={column.searchValue} onChange={(event) => column.updateSearch(event.target.value)}
      onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}
      style={{ width: "100%", minWidth: 110, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, fontWeight: 400, background: "white", color: "#334155" }} />
  </div>
);

// Only filters the supplied rows; does not dispatch pagination or query changes.
export default function useLocalColumnSearch(columns, data, enabled = false) {
  const [searches, setSearches] = useState({});
  const searchableColumns = useMemo(() => columns.map((column, index) => ({
    ...column,
    id: column.id || (typeof column.accessor === "string" ? column.accessor : `inbox-column-${index}`),
  })), [columns]);
  const filteredData = useMemo(() => !enabled ? data : (data || []).filter((original, index) =>
    searchableColumns.every((column) => {
      const query = (searches[column.id] || "").trim().toLocaleLowerCase();
      if (!query) return true;
      const value = typeof column.accessor === "function" ? column.accessor(original) : original[column.accessor];
      const displayed = column.Cell ? column.Cell({ row: { original, index }, value }) : value;
      return getColumnText(displayed).toLocaleLowerCase().includes(query);
    })
  ), [enabled, data, searchableColumns, searches]);
  const displayColumns = useMemo(() => !enabled ? columns : searchableColumns.map((column) => ({
    ...column,
    ...(column.accessor === "serialNumber" ? { Cell: ({ row }) => column.Cell({ row: { ...row, index: data.indexOf(row.original) } }) } : {}),
    searchLabel: column.Header,
    searchValue: searches[column.id] || "",
    updateSearch: (value) => setSearches((previous) => ({ ...previous, [column.id]: value })),
    Header: SearchHeader,
  })), [enabled, columns, searchableColumns, searches, data]);
  return { data: filteredData, columns: displayColumns };
}
