import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ApplicationTable from "../../../components/inbox/ApplicationTable";

const GarbageTable = ({ data, ...props }) => {
  const { t } = useTranslation();
  const tenantId = localStorage.getItem("CITIZEN.CITY");

  const GetCell = (value) => <span className="cell-text">{value}</span>;

  const GetMobCell = (value) => <span className="sla-cell">{value}</span>;
  const inboxColumns = () => [
    {
      Header: t("Application Number"),
      Cell: ({ row }) => {
        // /digit-ui/citizen/garbagecollection/application/${bill?.applicationNo}/${bill?.tenantId}
        return (
          <div>
            <span className="link">
              <Link to={`/digit-ui/citizen/garbagecollection/application/${row.original?.applicationNo}/${tenantId}`}>
                {row.original?.["applicationNo"]}
              </Link>
              {/* <Link to={`${props.parentRoute}/challansearch/` + row.original?.["challanNo"]}>{row.original?.["challanNo"]}</Link> */}
            </span>
          </div>
        );
      },
    },
    {
      Header: t("Connection Number"),
      Cell: ({ row }) => {
        return GetCell(`${row.original?.connectionNo ? row.original?.connectionNo : "N/A"}`);
      },
    },
    {
      Header: t("Application Status"),
      Cell: ({ row }) => {
        return GetCell(t(`${row.original?.applicationStatus}`));
      },
    },

    {
      Header: t("UC_COMMON_TABLE_COL_STATUS"),
      Cell: ({ row }) => {
        return GetCell(t(`${row.original?.status}`));
      },
    },
    {
      Header: t("Connection Type"),
      Cell: ({ row }) => {
        return GetCell(t(`${row.original?.connectionCategory}`));
      },
    },
  ];

  return (
    <ApplicationTable
      t={t}
      data={data}
      columns={inboxColumns(data)}
      className="challan-desktop-applicationtable"
      getCellProps={(cellInfo) => {
        return {
          style: {
            minWidth: cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
          },
        };
      }}
      onPageSizeChange={props.onPageSizeChange}
      currentPage={props.currentPage}
      onNextPage={props.onNextPage}
      onPrevPage={props.onPrevPage}
      onLastPage={props.onLastPage}
      onFirstPage={props.onFirstPage}
      pageSizeLimit={props.pageSizeLimit}
      onSort={props.onSort}
      disableSort={props.disableSort}
      sortParams={props.sortParams}
      totalRecords={props.totalRecords}
    />
  );
};

export default GarbageTable;
