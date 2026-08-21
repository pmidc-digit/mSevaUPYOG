import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { encryptId } from "../../../utils";

const useSearchApplicationTableConfig = () => {
    const {t} = useTranslation();

    const GetCell = (value) => <span className="cell-text">{value}</span>;
    return useMemo( () => ([
        {
          Header: t("BPA_APPLICATION_NUMBER_LABEL"),
          accessor: "applicationNo",
          disableSortBy: true,
          Cell: ({ row }) => {
            console.log('row', row)
            return (
              <div>
                <span className="link">
                  <Link to={`/digit-ui/citizen/obps/layout/application-overview/${encryptId(row.original["applicationNo"])}`}>
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
          accessor: (row) => {
            const service = row?.original?.businessService || row?.businessService;
            const serviceKey = service ? String(service).toUpperCase() : "";
            const status = row?.applicationStatus || row?.original?.applicationStatus || row?.status || "-";
            const translationKey = serviceKey ? `WF_EMPLOYEE_LAYOUT_STATUS_${serviceKey}_${status}` : `WF_EMPLOYEE_LAYOUT_STATUS_${status}`;
            return t(translationKey) || status || "-";
          },
          disableSortBy: true,
        },

      ]), [] )
}

export default useSearchApplicationTableConfig