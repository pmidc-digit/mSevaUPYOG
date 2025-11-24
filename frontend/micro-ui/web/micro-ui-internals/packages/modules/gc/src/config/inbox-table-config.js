import React from "react";
import { Link } from "react-router-dom";

const GetCell = (value) => <span className="cell-text">{value}</span>;

const GetSlaCell = (value) => {
  if (isNaN(value)) return <span className="sla-cell-success">0</span>;
  return value < 0 ? <span className="sla-cell-error">{value}</span> : <span className="sla-cell-success">{value}</span>;
};

const GetMobCell = (value) => <span className="sla-cell">{value}</span>;

export const TableConfig = (t) => ({
  PTR: {
    inboxColumns: (props) => [
      {
        Header: t("REPORT_FSM_RESULT_APPLICATION_NO"),
        Cell: ({ row }) => {
          console.log("row :>> ", row);
          console.log("row", row);
          return (
            <div>
              <span className="link">
                <Link to={`${props.parentRoute}/petservice/application-details/` + `${row?.original?.searchData?.["applicationNumber"]}`}>
                  {row.original?.searchData?.["applicationNumber"]}
                </Link>
              </span>
            </div>
          );
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.["applicationNumber"]),
      },

      {
        Header: t("REPORT_FSM_RESULT_APPLICANTNAME"),
        Cell: (row) => {
          return GetCell(`${row?.cell?.row?.original?.searchData?.owner?.["name"]}`);
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.owner?.["name"]),
      },
      {
        Header: t("PTR_SEARCH_PET_TYPE"),
        Cell: ({ row }) => {
          return GetCell(`${row.original?.searchData?.petDetails?.["petType"]}`);
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.petDetails?.["petType"]),
      },

      {
        Header: t("PTR_SEARCH_BREED_TYPE"),
        Cell: ({ row }) => {
          return GetCell(`${row.original?.searchData?.petDetails?.["breedType"]}`);
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.petDetails?.["breedType"]),
      },

      {
        Header: t("STATUS"),
        Cell: ({ row }) => {
          const wf = row.original?.workflowData;
          return GetCell(t(`${row?.original?.workflowData?.state?.["applicationStatus"]}`));
        },
        mobileCell: (original) => GetMobCell(t(`ES_PTR_COMMON_STATUS_${original?.workflowData?.state?.["applicationStatus"]}`)),
      },

      {
        Header: t("PTR_DATE"),
        Cell: ({ row }) => {
          const createdTime = row.original?.searchData?.auditDetails?.["createdTime"];
          const dateStr = createdTime ? new Date(createdTime).toLocaleDateString("en-GB") : "";
          return GetCell(dateStr);
        },
        mobileCell: (original) => {
          const createdTime = original?.searchData?.auditDetails?.["createdTime"];
          const dateStr = createdTime ? new Date(createdTime).toLocaleDateString("en-GB") : "";
          return GetMobCell(dateStr);
        },
      },
    ],
    serviceRequestIdKey: (original) => original?.[t("PTR_INBOX_UNIQUE_APPLICATION_NUMBER")]?.props?.children,
  },
});
