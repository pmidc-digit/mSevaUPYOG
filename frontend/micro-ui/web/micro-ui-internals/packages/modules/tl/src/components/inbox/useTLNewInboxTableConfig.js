import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { convertEpochToDateDMY } from "../../utils";

const useTLNewInboxTableConfig = ({ table, totalCount }) => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        Header: t("WF_INBOX_HEADER_APPLICATION_NO"),
        accessor: "applicationId",
        disableSortBy: true,
        Cell: ({ row }) => (
          <Link to={`/digit-ui/employee/tl/application-details/${row.original?.applicationId}`}>
            <span className="link">{row.original?.applicationId}</span>
          </Link>
        ),
      },
      { Header: t("TL_COMMON_TABLE_COL_LIC_NO"), accessor: "licenseNumber", disableSortBy: true },
      { Header: t("TL_COMMON_TABLE_COL_TRADE_NAME"), accessor: "tradeName", disableSortBy: true },
      { Header: t("TL_COMMON_TABLE_COL_OWN_NAME"), accessor: "ownerName", disableSortBy: true },
      {
        Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
        accessor: "date",
        disableSortBy: true,
        Cell: ({ row }) => <span className="cell-text">{row.original?.date ? convertEpochToDateDMY(row.original.date) : "-"}</span>,
      },
      {
        Header: t("TL_COMMON_TABLE_COL_APP_TYPE"),
        accessor: "businessService",
        disableSortBy: true,
        Cell: ({ row }) => <span className="cell-text">{t(row.original?.businessService ? `CS_COMMON_INBOX_${row.original.businessService.toUpperCase()}` : "NA")}</span>,
      },
      {
        Header: t("WF_INBOX_HEADER_STATUS"),
        accessor: "status",
        disableSortBy: true,
        Cell: ({ row }) => <span className="cell-text">{t(row.original?.businessService ? `WF_${row.original.businessService.toUpperCase()}_${row.original?.status}` : "NA")}</span>,
      },
    ],
    [t]
  );

  return {
    data: table,
    columns,
    totalRecords: totalCount,
    disableSort: true,
    customTableWrapperClassName: "tl-new-inbox-table-wrapper",
  };
};

export default useTLNewInboxTableConfig;
