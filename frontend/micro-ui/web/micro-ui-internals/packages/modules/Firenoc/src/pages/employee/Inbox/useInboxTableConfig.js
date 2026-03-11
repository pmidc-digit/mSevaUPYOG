import React, { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const useInboxTableConfig = ({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData }) => {
  const { t } = useTranslation();

  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
  const GetStatusCell = (value) => value === "CS_NA" ? t(value) : 
    value === "Active" || value > 0 ? <span className="sla-cell-success">{value}</span> : <span className="sla-cell-error">{value}</span>;

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("NOC_APPLICATION_NUMBER"),
        accessor: "applicationNo",
        disableSortBy: true,
        Cell: ({ row }) => {
          console.log('row in inbox', row)
          return (
            <div>
              <Link to={`${parentRoute}/inbox/application-overview/${row.original["applicationId"]}`}>
                <span className="link">{row.original["applicationId"]}</span>
              </Link>
            </div>
          );
        },
      },
      {
        Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
        accessor: "applicationDate",
        Cell: ({ row }) => (row.original?.["date"] ? GetCell(format(new Date(row.original?.["date"]), "dd/MM/yyyy")) : ""),
      },
      // {
      //   Header: t("ES_INBOX_LOCALITY"),
      //   accessor: (row) => t(row?.locality),
      // disableSortBy: true,

      // },
      // {
      //   Header: t("NOC_MODULE_SOURCE_LABEL"),
      //   accessor: (row) => t(`MODULE_${row?.source}`),
      //   disableSortBy: true,
      // },
      {
        Header: t("NOC_PRIMARY_OWNER_NAME_LABEL"),
        accessor: (row) => row?.owner,
        disableSortBy: true,
      },
      {
        Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"),
        accessor: (row) => t(row?.status),
        disableSortBy: true,
      },
      {
        Header: t("CM_TIMELINE_ACTION_TAKEN"),
        accessor: (row) => t(row?.action),
        disableSortBy: true,
      }
      // {
      //   Header: t("ES_INBOX_LOCALITY"),
      //   accessor: (row) => t(row?.locality),
      //   disableSortBy: true,
      // },
      // {
      //   Header: t("ES_INBOX_SLA_DAYS_REMAINING"),
      //   accessor: (row) => GetStatusCell(row?.sla),
      // },
    ];
  });

  return {
    getCellProps: (cellInfo) => {
      return {
        style: {
          padding: "20px 18px",
          fontSize: "16px",
        },
      };
    },
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
    // sortParams: [{id: getValues("sortBy"), desc: getValues("sortOrder") === "DESC" ? true : false}],
    totalRecords: totalCount,
    onSearch: formState?.searchForm?.message,
    onLastPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: Math.ceil(totalCount / 10) * 10 - parseInt(formState.tableForm?.limit) },
      }),
    onFirstPage: () => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } }),
    // globalSearch: {searchForItemsInTable},
    // searchQueryForTable,
    data: table,
    columns: tableColumnConfig,
  };
};

export default useInboxTableConfig;
