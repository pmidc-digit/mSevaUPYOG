import { format } from "date-fns";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MultiLink } from "@mseva/digit-ui-react-components";
import { PrimaryDownlaodIcon } from "../../../utils/svgindex";
import { fetchUrl } from "../../../utils";
import { ActionMenu } from "../../../components/ActionMenu";

const Download = ({ dowloadOptions }) => {
  return <ActionMenu options={dowloadOptions} />;
};

const useInboxTableConfig = ({ onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData, tenantId }) => {
  const GetCell = (value) => <span className="cell-text styled-cell">{value}</span>;
  const GetStatusCell = (value) =>  value === "Accepted" ? <span className="sla-cell-success " style={{background:"none",padding:"unset"}}>{value}</span> : <span className="sla-cell-error" style={{background:"none",padding:"unset"}}>{value}</span>;
  const { t } = useTranslation();

  const tableColumnConfig = useMemo(() => {
    return [
      {
        Header: t("EDCR_COMMON_TABLE_SCRUTINY_NO"),
        disableSortBy: true,
        Cell: ({ row }) => {
          return <div>{row.original?.edcrNumber !== "null" ? <span className="">{row.original["edcrNumber"]}</span> : "NA"}</div>;
        },
      },
      {
        Header: t("EDCR_COMMON_TABLE_APPL_NO"),
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <div>
              <span className="">{row.original["applicationId"]}</span>
            </div>
          );
        },
      },
      {
        Header: t("CS_APPLICATION_DETAILS_APPLICATION_DATE"),
        accessor: "createdDate",
        Cell: ({ row }) => (row.original?.["date"] ? GetCell(format(new Date(row.original?.["date"]), "dd/MM/yyyy")) : ""),
      },

      {
        Header: t("EDCR_COMMON_TABLE_CITY_LABEL"),
        accessor: (row) => t(row?.locality),
        disableSortBy: true,
      },
      {
        Header: t("EDCR_COMMON_TABLE_APPL_NAME"),
        accessor: (row) => row?.owner,
        disableSortBy: true,
      },      
      {
        Header: t("EDCR_COMMON_TABLE_COL_STATUS"),
        accessor: (row) => GetStatusCell(row?.status),
        disableSortBy: true,
      },
      {
        Header: t("PT_COMMON_TABLE_COL_ACTION_LABEL"),
        Cell: ({ row }) => {
          return (
            <Download
              dowloadOptions={[
                {
                  label: t("Building Plan"),
                  onClick: () => fetchUrl(`${row.original["dxfFileurl"]}`, tenantId),
                  // onClick: () => window.open(`${row.original["dxfFileurl"]}`, tenantId),
                },
                {
                  label: t("EDCR_SCUTINY_REPORT"),
                  onClick: () => fetchUrl(`${row.original["planReportUrl"]}`, tenantId),
                },
              ]}
            />
          );
        },
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
    className: "table edcr-citizen-inbox",
    disableSort: false,
    autoSort: false,
    manualPagination: true,
    initSortId: "createdDate",
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

export default useInboxTableConfig;
