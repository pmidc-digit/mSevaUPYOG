import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const useSearchApplicationTableConfig = () => {
  const { t } = useTranslation();

  const GetCell = (value) => <span className="cell-text">{value}</span>;

  return useMemo(() => ([
    {
      Header: t("NOC_APPLICATION_NUMBER"),
      accessor: "applicationNo",
      disableSortBy: true,
      Cell: ({ row }) => {
        const status = row.original["applicationStatus"];
        const appNo = row.original["applicationNo"];
        const tId = row.original["tenantId"] || window.localStorage.getItem("CITIZEN.CITY");
        const linkPath = status === "INITIATED"
          ? `/digit-ui/citizen/firenoc/new-application/${appNo}?tenantId=${tId}`
          : `/digit-ui/citizen/firenoc/search/application-overview/${appNo}`;
        return (
          <div>
            <span className="link">
              <Link to={linkPath}>
                {appNo}
              </Link>
            </span>
          </div>
        );
      },
    },
    {
      Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
      disableSortBy: true,
      accessor: (row) => t(row?.date || "-"),
    },
    {
      Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"),
      accessor: (row) => t(row?.applicationStatus || "-"),
      disableSortBy: true,
    },

  ]), [])
}

export default useSearchApplicationTableConfig