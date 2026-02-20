import React from "react";
import { Link } from "react-router-dom";

const GetCell = (value) => <span className="cell-text">{value}</span>;

const GetSlaCell = (value) => {
  if (isNaN(value)) return <span className="sla-cell-success">0</span>;
  return value < 0 ? <span className="sla-cell-error">{value}</span> : <span className="sla-cell-success">{value}</span>;
};

const GetMobCell = (value) => <span className="sla-cell">{value}</span>;

const getAdsStatusText = (t, original) => {
  const rawStatus = original?.searchData?.["bookingStatus"] || original?.workflowData?.state?.["applicationStatus"] || "";
  const translatedStatus = t(`ES_ADS_COMMON_STATUS_${rawStatus}`);
  if (translatedStatus && translatedStatus !== `ES_ADS_COMMON_STATUS_${rawStatus}`) return translatedStatus;
  const fallback = t(`${rawStatus}`);
  return fallback && fallback !== `${rawStatus}` ? fallback : rawStatus;
};

const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (value.includes("approved") || value.includes("booked")) return "approved";
  if (value.includes("rejected") || value.includes("cancelled") || value.includes("expired")) return "rejected";
  if (value.includes("forward")) return "forwarded";
  if (value.includes("process")) return "in-progress";
  if (value.includes("pending")) return "pending";
  if (value.includes("new")) return "new";
  return "default";
};

const getStatusRowStyle = (statusClass) => {
  if (statusClass === "approved") return { background: "#ffffff" };
  if (statusClass === "rejected") return { background: "#fffefe" };
  if (statusClass === "forwarded") return { background: "#fcfdff" };
  if (statusClass === "in-progress") return { background: "#f8fafc" };
  if (statusClass === "pending") return { background: "#fffdf9" };
  if (statusClass === "new") return { background: "#fbfdff" };
  return { background: "#ffffff" };
};

const getStatusDisplayText = (statusValue) => String(statusValue || "-").toLowerCase();

const renderStatusIcon = (statusClass) => {
  switch (statusClass) {
    case "approved":
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "rejected":
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      );
    case "forwarded":
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14" />
          <path d="M13 5l7 7-7 7" />
        </svg>
      );
    default:
      return null;
  }
};

export const TableConfig = (t) => ({
  ADS: {
    getRowProps: () => (row) => {
      const statusText = getAdsStatusText((key) => key, row?.original);
      const statusClass = getStatusClass(statusText);
      return {
        className: `ndc-new-row ${statusClass}`,
        style: getStatusRowStyle(statusClass),
      };
    },
    inboxColumns: (props) => [
      {
        Header: t("ADS_BOOKING_NO"),
        accessor: "bookingNo",
        disableSortBy: true,
        className: "ndc-new-table-app",
        Cell: ({ row }) => {
          const bookingNo = row?.original?.searchData?.["bookingNo"] || "-";
          return (
            <div className="ndc-new-cell-stack">
              <Link to={`${props.parentRoute}/applicationsearch/application-details/` + `${bookingNo}`} className="ndc-new-app-link ndc-new-cell-primary">
                {bookingNo}
              </Link>
            </div>
          );
        },
        mobileCell: (original) => GetMobCell(original?.searchData?.["bookingNo"]),
      },

      {
        Header: t("ADS_APPLICANT_NAME"),
        accessor: "applicantName",
        Cell: ({ row }) => <span className="ndc-new-cell-primary">{row?.original?.searchData?.applicantDetail?.["applicantName"] || "-"}</span>,
        mobileCell: (original) => GetMobCell(original?.searchData?.applicantDetail?.["applicantName"]),
      },
      {
        Header: t("AD _TYPE"),
        accessor: "adType",
        Cell: ({ row }) => <span className="ndc-new-cell-primary">{row.original?.searchData?.cartDetails?.[0]?.["addType"] || "-"}</span>,
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
        id: "status",
        accessor: (row) => getAdsStatusText(t, row),
        className: "ndc-new-table-status",
        Cell: ({ value }) => {
          const statusValue = String(value || "-");
          const statusClass = getStatusClass(statusValue);
          return (
            <span className={`ndc-new-status-pill ${statusClass}`}>
              {renderStatusIcon(statusClass)}
              <span>{getStatusDisplayText(statusValue)}</span>
            </span>
          );
        },
        mobileCell: (original) => GetMobCell(getAdsStatusText(t, original)),
      },

      {
        Header: t("ADS_DATE"),
        accessor: "applicationDate",
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
