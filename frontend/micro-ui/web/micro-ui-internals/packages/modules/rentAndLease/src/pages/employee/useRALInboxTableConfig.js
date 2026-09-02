import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const formatDate = (dateEpoch) => {
  if (!dateEpoch) return "NA";

  const date = new Date(dateEpoch);
  if (Number.isNaN(date.getTime())) return "NA";

  return date.toLocaleDateString("en-GB");
};

const getPropertyDetails = (searchData) => {
  const additionalDetails = Array.isArray(searchData?.additionalDetails)
    ? searchData.additionalDetails[0]
    : searchData?.additionalDetails || {};

  return additionalDetails?.propertyDetails?.[0] || additionalDetails;
};

const useRALInboxTableConfig = ({ parentRoute, table, totalCount }) => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        Header: t("APPLICATION_NUMBER"),
        accessor: "applicationNumber",
        disableSortBy: true,
        Cell: ({ row }) => {
          const applicationNumber = row.original?.searchData?.applicationNumber;
          const tenantId = row.original?.searchData?.tenantId;

          return (
            <Link to={`${parentRoute}/property/${applicationNumber}/${tenantId}`}>
              <span className="link">{applicationNumber || "NA"}</span>
            </Link>
          );
        },
      },
      {
        Header: t("RENT_LEASE_PROPERTY_NAME"),
        accessor: "propertyName",
        disableSortBy: true,
        Cell: ({ row }) => <span className="cell-text">{getPropertyDetails(row.original?.searchData)?.propertyName || "NA"}</span>,
      },
      {
        Header: t("RAL_ALLOTMENT_TYPE"),
        accessor: "allotmentType",
        disableSortBy: true,
        Cell: ({ row }) => {
          const propertyDetails = getPropertyDetails(row.original?.searchData);
          const applicationType = propertyDetails?.applicationType || row.original?.searchData?.applicationType || "NEW";
          const allotmentType = propertyDetails?.allotmentType || "NA";

          return <span className="cell-text">{`${t(String(allotmentType).toUpperCase())} (${t(String(applicationType).toUpperCase())})`}</span>;
        },
      },
      {
        Header: t("RENT_AMOUNT"),
        accessor: "rentAmount",
        disableSortBy: true,
        Cell: ({ row }) => <span className="cell-text">{getPropertyDetails(row.original?.searchData)?.baseRent || "NA"}</span>,
      },
      {
        Header: t("CS_CREATED_DATE"),
        accessor: "createdTime",
        disableSortBy: true,
        Cell: ({ row }) => <span className="cell-text">{formatDate(row.original?.searchData?.auditDetails?.createdTime)}</span>,
      },
      {
        Header: t("UC_COMMON_TABLE_COL_STATUS"),
        accessor: "status",
        disableSortBy: true,
        Cell: ({ row }) => {
          const status = row.original?.searchData?.status || row.original?.workflowData?.state?.state;
          return <span className="ral-new-inbox-status">{status ? t(`WF_RENT_N_LEASE_NEW_${status}`) : "NA"}</span>;
        },
      },
    ],
    [parentRoute, t]
  );

  return {
    data: table,
    columns,
    totalRecords: totalCount,
    disableSort: true,
    customTableWrapperClassName: "ral-new-inbox-table-wrapper",
    getCellProps: () => ({ className: "ral-new-inbox-cell" }),
  };
};

export default useRALInboxTableConfig;
