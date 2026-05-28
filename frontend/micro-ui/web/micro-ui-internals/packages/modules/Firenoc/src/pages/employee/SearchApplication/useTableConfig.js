import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const useSearchApplicationTableConfig = () => {
    const {t} = useTranslation();

    const getRedirectionLink = (bService) => {
        let redirectBS = bService === "BPAREG"?"search/application/stakeholder":"search/application/bpa";
        return redirectBS;
    }
    
    const GetCell = (value) => <span className="cell-text">{value}</span>;
    
    return useMemo( () => ([
        {
          Header: t("NOC_APPLICATION_NUMBER"),
          accessor: "applicationNo",
          id: "applicationNo",
          disableSortBy: true,
          Cell: ({ row }) => {
            const status = row.original["applicationStatus"];
            const appNo = row.original["applicationNo"];
            const tId = row.original["tenantId"] || window.localStorage.getItem("Employee.tenant-id");
            const linkPath = status === "INITIATED"
              ? `/digit-ui/employee/firenoc/new-application/${appNo}?tenantId=${tId}`
              : `/digit-ui/employee/firenoc/inbox/application-overview/${appNo}`;
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
          Header: t("NOC_FIRENOC_NUMBER") || "NOC No",
          accessor: "fireNOCNumber",
          id: "fireNOCNumber",
          disableSortBy: true,
          Cell: ({ row }) => GetCell(row.original["fireNOCNumber"] || "-"),
        },
        {
          Header: t("NOC_TYPE") || "NOC Type",
          accessor: "fireNOCType",
          id: "fireNOCType",
          disableSortBy: true,
          Cell: ({ row }) => GetCell(row.original["fireNOCType"] ? t(`NOC_${row.original["fireNOCType"]}`) : "-"),
        },
        {
          Header: t("NOC_APPLICANT_NAME") || "Applicant Name",
          accessor: "applicantName",
          id: "applicantName",
          disableSortBy: true,
          Cell: ({ row }) => GetCell(row.original["applicantName"] || "-"),
        },
        {
          Header: t("TL_COMMON_TABLE_COL_APP_DATE"),
          disableSortBy: true,
          accessor: "date",
          id: "date",
          Cell: ({ row }) => GetCell(row.original["date"] || "-"),
        },
        {
          Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"),
          accessor: "applicationStatus",
          id: "applicationStatus",
          disableSortBy: true,
          Cell: ({ row }) => GetCell(row.original["applicationStatus"] ? t(row.original["applicationStatus"]) : "-"),
        },
        {
          Header: t("NOC_TENANT_ID") || "Tenant Id",
          accessor: "tenantId",
          id: "tenantId",
          disableSortBy: true,
          Cell: ({ row }) => GetCell(row.original["tenantId"] || "-"),
        },

      ]), [] )
}

export default useSearchApplicationTableConfig