import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const useLayoutTableConfig = ({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData }) => {
  const { t } = useTranslation();

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

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL"),
        accessor: "applicationId",
        disableSortBy: true,
        className: "ndc-new-table-app",
        Cell: ({ row }) => (
          <div className="ndc-new-cell-stack">
            <Link to={`${parentRoute}/layout/inbox/application-overview/${row.original?.applicationId}`} className="ndc-new-app-link">
              {row.original?.applicationId || row.original?.applicationNo || "-"}
            </Link>
            {row.original?.locality ? <div className="ndc-new-cell-secondary">{row.original?.locality}</div> : null}
          </div>
        ),
      },
      {
        Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
        accessor: "date",
        Cell: ({ row }) => {
          const dateValue = row.original?.date || row.original?.createdTime;
          return dateValue ? format(new Date(dateValue), "dd/MM/yyyy") : "-";
        },
      },
      {
        Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"),
        accessor: "status",
        Cell: ({ row }) => {
          const statusValue = row.original?.status || row.original?.applicationStatus || "-";
          const statusClass = getStatusClass(statusValue);
          return (
            <span className={`ndc-new-status-pill ${statusClass}`}>
              {renderStatusIcon(statusClass)}
              <span>{String(statusValue || "-").toLowerCase()}</span>
            </span>
          );
        },
      },
      {
        Header: t("CS_COMMON_ACTION"),
        accessor: "action",
        disableSortBy: true,
        className: "ndc-new-table-action",
        Cell: ({ row }) => (
          <span className="ndc-new-action-group">
            <Link
              to={`${parentRoute}/inbox/application-overview/${row.original?.applicationId}`}
              className="ndc-new-icon ndc-new-icon-link"
              aria-label={t("ES_COMMON_VIEW")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
          </span>
        ),
      },
    ];
  }, [parentRoute, t]);

  return {
    getCellProps: () => ({
      style: {
        padding: "16px 20px",
        fontSize: "14px",
      },
    }),
    getRowProps: (row) => ({
      className: `ndc-new-row ${getStatusClass(row?.original?.status || row?.original?.applicationStatus)}`,
    }),
    disableSort: false,
    autoSort: false,
    manualPagination: true,
    initSortId: "applicationDate",
    onPageSizeChange: onPageSizeChange,
    currentPage: formState.tableForm?.offset / formState.tableForm?.limit,
    onNextPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) + parseInt(formState.tableForm?.limit) },
      }),
    onPrevPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) - parseInt(formState.tableForm?.limit) },
      }),
    pageSizeLimit: formState.tableForm?.limit,
    onSort: onSortingByData,
    totalRecords: totalCount,
    onSearch: formState?.searchForm?.message,
    onLastPage: () => {
      const limit = parseInt(formState.tableForm?.limit) || 10
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: Math.floor((totalCount - 1) / limit) * limit },
      })
    },
    onFirstPage: () => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } }),
    data: table,
    columns: tableColumnConfig,
  };
};

export default useLayoutTableConfig;
