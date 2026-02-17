import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const useNewInboxTableConfig = ({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData }) => {
  const { t } = useTranslation();

  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("NOC_HOME_SEARCH_RESULTS_APP_NO_LABEL"),
        accessor: "uuid",
        disableSortBy: true,
        Cell: ({ row }) => (
          <div>
            <Link to={`${parentRoute}/inbox/application-overview/${row.original?.applicationId}`}>
              <span className="link">{row.original?.applicationId}</span>
            </Link>
          </div>
        ),
      },
      {
        Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
        accessor: "createdtime",
        Cell: ({ row }) => (row.original?.date ? GetCell(format(new Date(row.original?.date), "dd/MM/yyyy")) : ""),
      },
      {
        Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"),
        accessor: "status",
        Cell: ({ row }) => t(row.original?.status),
      },
    ];
  }, [parentRoute, t]);

  return {
    getCellProps: () => {
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
    totalRecords: totalCount,
    onSearch: formState?.searchForm?.message,
    onLastPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: Math.ceil(totalCount / 10) * 10 - parseInt(formState.tableForm?.limit) },
      }),
    onFirstPage: () => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } }),
    data: table,
    columns: tableColumnConfig,
  };
};

export default useNewInboxTableConfig;
