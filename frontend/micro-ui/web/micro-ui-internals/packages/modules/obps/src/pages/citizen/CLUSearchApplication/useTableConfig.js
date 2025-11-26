import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const useSearchApplicationTableConfig = () => {
    const {t} = useTranslation();
    
    const GetCell = (value) => <span className="cell-text">{value}</span>;
    
    return useMemo( () => ([
        {
          Header: t("BPA_APPLICATION_NUMBER_LABEL"),
          accessor: "applicationNo",
          disableSortBy: true,
          Cell: ({ row }) => {
            return (
              <div>
                <span className="link">
                  <Link to={`/digit-ui/citizen/obps/clu/application-overview/${row.original["applicationNo"]}`}>
                    {row.original["applicationNo"]}
                  </Link>
                </span>
              </div>
            );
          },
        },
        {
          Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
          disableSortBy: true,
          accessor: (row) => t(row?.date|| "-"),
        },
        {
          Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"),
          accessor: (row) => t(row?.applicationStatus|| "-"),
          disableSortBy: true,
        },

      ]), [] )
}

export default useSearchApplicationTableConfig