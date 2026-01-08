import React from "react";
import { Link } from "react-router-dom";

const GetCell = (value) => <span className="cell-text">{value}</span>;

const GetSlaCell = (value) => {
  if (isNaN(value)) return <span className="sla-cell-success">0</span>;
  return value < 0 ? <span className="sla-cell-error">{value}</span> : <span className="sla-cell-success">{value}</span>;
};

const GetMobCell = (value) => <span className="sla-cell">{value}</span>;

export const TableConfig = (t) => ({
  ADS: {
    inboxColumns: (props) => [
      {
        Header: t("ADS_BOOKING_NO"),
        Cell: ({ row }) => {
          return (
            <div>
              <span className="link">
                <Link to={`${props.parentRoute}/applicationsearch/application-details/` + `${row?.original?.searchData?.["bookingNo"]}`}>
                  {row.original?.searchData?.["bookingNo"]}
                </Link>
              </span>
            </div>
          );
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.["bookingNo"]),
      },

      {
        Header: t("ADS_APPLICANT_NAME"),
        Cell: (row) => {
          return GetCell(`${row?.cell?.row?.original?.searchData?.applicantDetail?.["applicantName"]}`);
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.applicantDetail?.["applicantName"]),
      },
      {
        Header: t("AD _TYPE"),
        Cell: ({ row }) => {
          return GetCell(`${row.original?.searchData?.cartDetails?.[0]?.["addType"]}`);
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.cartDetails?.[0]?.["addType"]),
      },

      // {
      //   Header: t("PTR_BREED_TYPE"),
      //   Cell: ({ row }) => {
      //     return GetCell(`${row.original?.searchData?.applicantDetails?.["breedType"]}`);
      //   },
      //   mobileCell: (original) => GetMobCell(original?.searchData?.petDetails?.["breedType"]),
      // },

      {
        Header: t("BOOKING_STATUS"),
        Cell: ({ row }) => {
          return GetCell(t(`${row?.original?.searchData?.["bookingStatus"]}` || `${row?.original?.workflowData?.state?.["applicationStatus"]}`));
        },
        mobileCell: (original) =>
          GetMobCell(t(`ES_ADS_COMMON_STATUS_${original?.searchData?.["bookingStatus"] || original?.workflowData?.state?.["applicationStatus"]}`)),
      },

      {
        Header: t("ADS_DATE"),
        Cell: ({ row }) => {
          const createdTime = row.original?.searchData?.["applicationDate"];
          const dateStr = createdTime ? new Date(createdTime).toLocaleDateString("en-GB") : "";
          return GetCell(dateStr);
        },
        mobileCell: (original) => {
          const createdTime = original?.searchData?.["applicationDate"];
          const dateStr = createdTime ? new Date(createdTime).toLocaleDateString("en-GB") : "";
          return GetMobCell(dateStr);
        },
      },
    ],
    serviceRequestIdKey: (original) => original?.[t("ADS_BOOKING_NO")]?.props?.children,
  },
});
