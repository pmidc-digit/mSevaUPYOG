import React, { useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const useChallanInboxTableConfig = ({ parentRoute, tenantId, table, totalCount }) => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        Header: t("UC_CHALLAN_NO"),
        accessor: "challanNo",
        disableSortBy: true,
        Cell: ({ row }) => (
          <Link to={`${parentRoute}/application/${row.original?.applicationId}/${tenantId}`}>
            <span className="link">{row.original?.applicationId}</span>
          </Link>
        ),
      },
      {
        Header: t("UC_COMMON_TABLE_COL_PAYEE_NAME"),
        accessor: "offenderName",
        disableSortBy: true,
      },
      {
        Header: t("CHALLAN_OFFENCE_TYPE"),
        accessor: "offenceTypeName",
        disableSortBy: true,
      },
      {
        Header: t("UC_COMMON_TOTAL_AMT"),
        accessor: "amount",
        disableSortBy: true,
        Cell: ({ row }) => {
          const total = Number(row.original?.amount || 0);
          const waiver = Number(row.original?.feeWaiver || 0);
          return <span className="cell-text">{total - waiver}</span>;
        },
      },
      {
        Header: t("UC_COMMON_TABLE_COL_STATUS"),
        accessor: "challanStatus",
        disableSortBy: true,
        Cell: ({ row }) => <span className="cell-text">{t(row.original?.challanStatus || row.original?.applicationStatus || "CS_NA")}</span>,
      },
      {
        Header: t("WF_INBOX_HEADER_CREATED_DATE"),
        accessor: "date",
        disableSortBy: true,
        Cell: ({ row }) => {
          const createdDate = Number(row.original?.date);
          return <span className="cell-text">{Number.isFinite(createdDate) ? format(new Date(createdDate), "dd/MM/yyyy") : "-"}</span>;
        },
      },
    ],
    [parentRoute, t, tenantId]
  );

  return {
    data: table,
    columns,
    totalRecords: totalCount,
    disableSort: true,
    customTableWrapperClassName: "challan-new-inbox-table-wrapper",
  };
};

export default useChallanInboxTableConfig;
