import React, { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { encryptId } from "../../../utils/index";

const ColumnSearchHeader = ({ column }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <span>{column.searchLabel}</span>
    <input
      type="search"
      aria-label={`Search ${column.searchLabel}`}
      placeholder="Search…"
      value={column.searchValue}
      onChange={(event) => column.updateSearch(event.target.value)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      style={{
        width: "100%",
        minWidth: 110,
        padding: "8px 10px",
        border: "1px solid #cbd5e1",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 400,
        background: "white",
        color: "#334155",
      }}
    />
  </div>
);

const cellText = (value) => {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(cellText).join(" ");
  if (React.isValidElement(value)) return cellText(value.props.children);
  return String(value);
};

const useInboxTableConfig = ({
  parentRoute,
  onPageSizeChange,
  formState,
  totalCount,
  table,
  dispatch,
  onSortingByData,
  globalSearch,
  cities,
  enableColumnSearch = false,
}) => {
  const [columnSearch, setColumnSearch] = useState({});
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
  const isCitizenOthers = window.location.href.includes("/citizen-others") || window.location.href.includes("/citizen-stakeholder-inbox");

  const isOther = window.location.href.includes("/citizen-others");
  const isCitizenStakeholder = window.location.href.includes("/citizen-stakeholder-inbox");

  const filterCityName = (id, cityNames) => {
    const fiterData = cityNames?.find((item) => item?.code === id);
    return fiterData?.ulbName;
  };

  const tableColumnConfig = useMemo(() => {
    const columns = [
      {
        Header: t("Sr No."),
        accessor: "serialNumber",
        Cell: ({ row }) => GetCell((Number(formState?.tableForm?.offset) || 0) + (enableColumnSearch ? table.indexOf(row.original) : row.index) + 1),
        disableSortBy: true,
      },
      {
        Header: t("BPA_APPLICATION_NUMBER_LABEL"),
        accessor: "applicationNo",
        disableSortBy: true,
        Cell: ({ row }) => {
          const encryptedId = encryptId(row.original["applicationId"]);
          const currentUrl = window.location.href;
          let link;
          if (currentUrl.includes("/citizen-others") || currentUrl.includes("/citizen-stakeholder-inbox")) {
            link = `/digit-ui/citizen/obps/stakeholder/${row.original.applicationId}`;
          } else if (currentUrl.includes("/citizen")) {
            link = `${parentRoute}/bpa-app/${encryptedId}`;
          } else if (row.original?.tenantId) {
            link = `${parentRoute}/inbox/bpa/${encryptedId}?tenantId=${row.original.tenantId}`;
          } else {
            link = `${parentRoute}/inbox/bpa/${encryptedId}`;
          }
          return (
            <div>
              <Link to={link}>
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
      // !isCitizenOthers &&
      !isCitizenOthers && {
        Header: t("CS_APPLICATION_DETAILS_APPROVAL_DATE"),
        accessor: "approvalDate",
        Cell: ({ row }) => {
          return row.original?.["approvalDate"] ? GetCell(format(new Date(row.original?.["approvalDate"]), "dd/MM/yyyy")) : "-";
        },
        disableSortBy: true,
      },
      isCitizenOthers && {
        Header: t("CS_APPLICATION_DETAILS_APPROVAL_DATE"),
        accessor: "issuedDate",
        Cell: ({ row }) => {
          return row.original?.["issuedDate"] ? GetCell(format(new Date(row.original?.["issuedDate"]), "dd/MM/yyyy")) : "-";
        },
        disableSortBy: true,
      },
      // {
      //     Header: t("ES_INBOX_LOCALITY"),
      //     accessor: (row) => t(row?.locality),
      //     disableSortBy: true,
      // },
      !isCitizenOthers && {
        Header: t("WF_INBOX_HEADER_OWNER_NAME"),
        accessor: (row) => t(row?.owner),
        disableSortBy: true,
      },
      {
        Header: t("ULB"),
        accessor: (row) => filterCityName(row?.tenantId, cities),
        disableSortBy: true,
      },
      isCitizenOthers && {
        Header: t("Applicant Name"),
        accessor: (row) => t(row?.professionalOwner),
        disableSortBy: true,
      },
      !isCitizenOthers && {
        Header: t("CATEGORY"),
        accessor: (row) => row?.category,
        disableSortBy: true,
      },
      {
        Header: t("EVENTS_STATUS_LABEL"),
        accessor: (row) => (row?.state ? t(`WF_${row?.businessService}_${row?.state}`) : t(`-`)),
        disableSortBy: true,
      },
      !isCitizenOthers && {
        Header: t("ZONE"),
        accessor: (row) => t(row?.zone),
        disableSortBy: true,
      },
      !isCitizenOthers && {
        Header: t("Risk Type"),
        // accessor: (row) => t(row?.original?._searchData?.businessObject?.additionalDetails?.riskType),
        // disableSortBy: true,
        accessor: "riskType",
        Cell: ({ row }) => {
          return t(row?.original?._searchData?.businessObject?.additionalDetails?.riskType);
        },
        disableSortBy: true,
      },
      !isCitizenOthers && {
        Header: t("IS_SELF_CERTIFICATION"),
        accessor: (row) => t(row?.selfCertification),
        disableSortBy: true,
      },
      isCitizenOthers && {
        Header: t("License Type"),
        accessor: (row) => t(row?.applicationType),
        disableSortBy: true,
      },
      isCitizenStakeholder && {
        Header: t("Architect ID"),
        accessor: (row) => t(row?.architectID),
        disableSortBy: true,
      },
      isOther && {
        Header: t("License Number"),
        accessor: (row) => t(row?.licenseNumber),
        disableSortBy: true,
      },
      {
        Header: t("Time Taken in Days"),
        accessor: (row) => GetStatusCell(row?.sla, row?.selfCertification),
        disableSortBy: true,
      },
    ];
    return columns.filter(Boolean);
  }, [t, tenantId, parentRoute, formState?.tableForm?.offset, cities, enableColumnSearch, table]);

  const searchableColumns = useMemo(
    () =>
      tableColumnConfig.map((column, index) => ({
        ...column,
        id: column.id || (typeof column.accessor === "string" ? column.accessor : `inbox-column-${index}`),
      })),
    [tableColumnConfig]
  );

  const filteredTable = useMemo(() => {
    if (!enableColumnSearch) return table;
    return (table || []).filter((row, rowIndex) =>
      searchableColumns.every((column) => {
        const query = (columnSearch[column.id] || "").trim().toLocaleLowerCase();
        if (!query) return true;
        let value;
        if (column.accessor === "serialNumber") value = (Number(formState?.tableForm?.offset) || 0) + rowIndex + 1;
        else if (column.accessor === "applicationNo") value = row.applicationId;
        else if (["createdDate", "submissionDate", "approvalDate", "issuedDate"].includes(column.accessor)) {
          value = row[column.accessor] ? format(new Date(row[column.accessor]), "dd/MM/yyyy") : "-";
        } else value = typeof column.accessor === "function" ? column.accessor(row) : row[column.accessor];
        return cellText(value).toLocaleLowerCase().includes(query);
      })
    );
  }, [enableColumnSearch, table, searchableColumns, columnSearch, formState?.tableForm?.offset]);

  const displayColumns = useMemo(
    () =>
      enableColumnSearch
        ? searchableColumns.map((column) => ({
            ...column,
            searchLabel: column.Header,
            searchValue: columnSearch[column.id] || "",
            updateSearch: (value) => setColumnSearch((previous) => ({ ...previous, [column.id]: value })),
            Header: ColumnSearchHeader,
          }))
        : tableColumnConfig,
    [enableColumnSearch, searchableColumns, tableColumnConfig, columnSearch]
  );

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
    customTableWrapperClassName: "obps-inbox-table-scroll",
    stickyHorizontalScrollbar: true,
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
    onSearch: globalSearch,
    searchAllFields: true,
    onLastPage: () =>
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: Math.ceil(totalCount / 10) * 10 - parseInt(formState.tableForm?.limit) },
      }),
    onFirstPage: () => dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } }),
    // globalSearch: {searchForItemsInTable},
    // searchQueryForTable,
    data: filteredTable,
    columns: displayColumns,
  };
};

export default useInboxTableConfig;
