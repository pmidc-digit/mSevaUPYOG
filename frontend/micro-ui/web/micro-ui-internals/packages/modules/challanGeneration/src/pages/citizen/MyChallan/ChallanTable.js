import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ApplicationTable from "../../../components/inbox/ApplicationTable";

const ChallanTable = ({ data, ...props }) => {
  const { t } = useTranslation();
  const tenantId = localStorage.getItem("CITIZEN.CITY");

  const GetCell = (value) => <span className="cell-text">{value}</span>;

  const GetMobCell = (value) => <span className="sla-cell">{value}</span>;
  const inboxColumns = () => [
    {
      Header: t("UC_CHALLAN_NO"),
      Cell: ({ row }) => {
        // /digit-ui/citizen/challangeneration/application/${bill?.challanNo}/${bill?.tenantId}
        return (
          <div>
            <span className="link">
              <Link to={`/digit-ui/citizen/challangeneration/application/${row.original?.challanNo}/${tenantId}`}>{row.original?.["challanNo"]}</Link>
              {/* <Link to={`${props.parentRoute}/challansearch/` + row.original?.["challanNo"]}>{row.original?.["challanNo"]}</Link> */}
            </span>
          </div>
        );
      },
      mobileCell: (original) => GetMobCell(original?.["challanNo"]),
    },
    {
      Header: t("UC_COMMON_TABLE_COL_PAYEE_NAME"),
      Cell: ({ row }) => {
        return GetCell(`${row.original?.citizen?.name}`);
      },
      mobileCell: (original) => GetMobCell(original?.["name"]),
    },
    // {
    //   Header: t("CHALLAN_OFFENCE_TYPE"),
    //   Cell: ({ row }) => {
    //     return GetCell(`${row.original?.["offenceName"]}`);
    //   },
    //   mobileCell: (original) => GetMobCell(original?.["offenceName"]),
    // },
    {
      Header: t("UC_COMMON_TOTAL_AMT"),
      Cell: ({ row }) => {
        const checkAmount = Math.max(row.original?.amount?.[0]?.amount || 0, row.original?.challanAmount || 0);
        const total = checkAmount || 0;
        const waiver = row.original?.feeWaiver || 0;
        const finalAmount = total - waiver;

        // const total = row.original?.challanAmount || 0;
        // const waiver = row.original?.feeWaiver || 0;
        // const finalAmount = total - waiver;

        return GetCell(finalAmount);
        // const finalAmount = row.original?.totalAmount - row.original?.feeWaiver;
        // const finAm = finalAmount ? finalAmount : row.original?.totalAmount;
        // return GetCell(finAm);
      },
      mobileCell: (original) => GetMobCell(original?.["totalAmount"]),
    },
    {
      Header: t("UC_COMMON_TABLE_COL_STATUS"),
      Cell: ({ row }) => {
        const wf = row.original?.challanStatus;
        return GetCell(t(`${row.original?.challanStatus}`));
      },
      mobileCell: (original) => GetMobCell(original?.workflowData?.state?.["state"]),
    },
    // {
    //   Header: t("WF_INBOX_HEADER_CREATED_DATE"),
    //   Cell: ({ row }) => (row.original?.date ? GetCell(format(new Date(row.original?.date), "dd/MM/yyyy")) : ""),
    // },
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

export default ChallanTable;
