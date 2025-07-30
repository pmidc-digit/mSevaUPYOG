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
        Header: t("NDC_APP_NO_LABEL"),
        accessor: "uuid",
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <div>
              <Link to={`${parentRoute}/inbox/application-overview/${row.original?.Applicant?.["uuid"]}`}>
                <span className="link">{row.original?.Applicant?.["uuid"]}</span>
              </Link>
            </div>
          );
        },
      },
      {
        Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
        accessor: "createdtime",
        Cell: ({ row }) => (row.original?.Applicant?.["createdtime"] ? GetCell(format(new Date(row.original?.Applicant?.["createdtime"]), "dd/MM/yyyy")) : ""),
      },
      {
        Header: t("ES_INBOX_NAME_LABEL"),
        accessor: (row) =>(row?.Applicant?.firstname ? row?.Applicant?.firstname : "" + " " + row?.original?.Applicant?.lastname? row?.original?.Applicant?.lastname : ""),
      disableSortBy: true,

      },
      {
        Header: t("NDC_EMAIL_LABEL"),
        accessor: (row) => (row?.Applicant?.["email"]? row?.Applicant?.["email"] : "NA"),
        disableSortBy: true,
      },
      {
        Header: t("NOC_STATUS_LABEL"),
        accessor: (row) => (row?.Applicant?.["applicationStatus"] ? row?.Applicant?.["applicationStatus"] : ""),
        disableSortBy: true,
      },
      // {
      //   Header: t("WF_INBOX_HEADER_CURRENT_OWNER"),
      //   accessor: (row) => row?.owner?.Applicant?.["applicationStatus"],
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
