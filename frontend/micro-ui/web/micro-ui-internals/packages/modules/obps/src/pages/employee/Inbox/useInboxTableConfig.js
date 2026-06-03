import React, { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { encryptId } from "../../../utils/index";

const useInboxTableConfig = ({ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData }) => {
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
  const GetStatusCell = (value, isSelfCertification) =>
    value === "CS_NA" ? (
      t(value)
    ) : value === "Active" || (value > 10 && isSelfCertification === "Yes") ? (
      <span className="sla-cell-error">{value}</span>
    ) : (
      <span className="sla-cell-success">{value}</span>
    );
  const { t } = useTranslation();
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentTenantId() : localStorage.getItem("CITIZEN.CITY");

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("BPA_APPLICATION_NUMBER_LABEL"),
        accessor: "applicationNo",
        disableSortBy: true,
        Cell: ({ row }) => {
          const encryptedId = encryptId(row.original["applicationId"]);
          console.log("wholerowindatacell", row);
          return (
            <div>
              <Link
                to={
                  window.location.href.includes("/citizen")
                    ? `${parentRoute}/bpa-app/${encryptedId}`
                    : tenantId === "pb.punjab"
                    ? `${parentRoute}/inbox/bpa/${encryptedId}/${row.original["tenantId"]}`
                    : `${parentRoute}/inbox/bpa/${encryptedId}`
                }
              >
                <span className="link">{row.original["applicationId"]}</span>
              </Link>
            </div>
          );
        },
      },
      // {
      //     Header: t("CS_APPLICATION_DETAILS_APPLICATION_DATE"),
      //     accessor: "applicationDate",
      //     Cell: ({row}) => row.original?.["date"] ? GetCell(format(new Date(row.original?.["date"]), 'dd/MM/yyyy')) : ""
      //     },
      {
        Header: t("BPA_COMMON_TABLE_COL_APP_DATE_LABEL"),
        accessor: "createdDate",
        Cell: ({ row }) => {
          return row.original?.["createdDate"] ? GetCell(format(new Date(row.original?.["createdDate"]), "dd/MM/yyyy")) : "-";
        },
        disableSortBy: true,
      },
      {
        Header: t("CS_APPLICATION_DETAILS_SUBMISSION_DATE"),
        accessor: "submissionDate",
        Cell: ({ row }) => {
          return row.original?.["submissionDate"] ? GetCell(format(new Date(row.original?.["submissionDate"]), "dd/MM/yyyy")) : "-";
        },
        disableSortBy: true,
      },
      {
        Header: t("CS_APPLICATION_DETAILS_APPROVAL_DATE"),
        accessor: "approvalDate",
        Cell: ({ row }) => {
          return row.original?.["approvalDate"] ? GetCell(format(new Date(row.original?.["approvalDate"]), "dd/MM/yyyy")) : "-";
        },
        disableSortBy: true,
      },
      // {
      //     Header: t("ES_INBOX_LOCALITY"),
      //     accessor: (row) => t(row?.locality),
      //     disableSortBy: true,
      // },
      {
        Header: t("WF_INBOX_HEADER_OWNER_NAME"),
        accessor: (row) => t(row?.owner),
        disableSortBy: true,
      },
      {
        Header: t("CATEGORY"),
        accessor: (row) => row?.category,
        disableSortBy: true,
      },
      {
        Header: t("EVENTS_STATUS_LABEL"),
        accessor: (row) => (row?.state ? t(`WF_${row?.businessService}_${row?.state}`) : t(`-`)),
        disableSortBy: true,
      },
      {
        Header: t("ZONE"),
        accessor: (row) => t(row?.zone),
        disableSortBy: true,
      },
      {
        Header: t("BPA_SEARCH_APPLICATION_TYPE_LABEL"),
        accessor: (row) => t(row?.applicationType),
        disableSortBy: true,
      },
      {
        Header: t("IS_SELF_CERTIFICATION"),
        accessor: (row) => t(row?.selfCertification),
        disableSortBy: true,
      },
      {
        Header: t("TIME_TAKEN"),
        accessor: (row) => GetStatusCell(row?.sla, row?.selfCertification),
        disableSortBy: true,
      },
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
    tableStyle: { overflowX: "auto" },
    className: "table cancel-table",
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
