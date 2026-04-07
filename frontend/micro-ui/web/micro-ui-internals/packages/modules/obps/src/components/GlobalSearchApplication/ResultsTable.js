import React from "react";
import { Link } from "react-router-dom";
import { Loader, Table } from "@mseva/digit-ui-react-components";

/**
 * Results Table Component
 * Displays search results in table format (desktop) or cards (mobile)
 * Uses the Table component from react-components for consistent styling
 */
const ResultsTable = ({ 
  data = [], 
  isLoading = false, 
  isMobile = false, 
  t = (key) => key,
  currentPage = 0,
  totalRecords = 0,
  pageSizeLimit = 10,
  onNextPage,
  onPrevPage,
  onFirstPage,
  onLastPage,
  onPageSizeChange,
  tenantId
}) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Loader />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
        No results found
      </div>
    );
  }

  // Helper function to get redirection link based on business service type
  const getRedirectionLink = (bService) => {
    console.log("row.orignal",bService);
    if(bService?.includes("BPA")){
        let service = "obps/search/application/bpa";
        if (window.location.href.includes("/citizen")) {
            service = "obps/bpa";
        }
        return service;
    }else if(bService?.includes("NOC")){
        if (window.location.href.includes("/citizen")) {
            return "noc/search/application-overview";
        }
        return "noc/inbox/application-overview"
    }else if(bService?.includes("CLU")){
        if (window.location.href.includes("/citizen")) {
            return "obps/clu/application-overview";
        }
        return "obps/clu/application-overview"
    }else if(bService?.includes("LAYOUT")){
        if (window.location.href.includes("/citizen")) {
            return "obps/layout/application-overview";
        }
        return "obps/layout/inbox/application-overview"
    }
  };

  // Desktop Table View
  if (!isMobile) {
    const columns = [
      {
        Header: "Application Number",
        accessor: "applicationNo",
        Cell: ({ row }) => (
          <div>
            <span className="link">
              <Link
                to={
                  window.location.href.includes("/citizen")
                    ? `/digit-ui/citizen/${getRedirectionLink(row.original?.businessService) || "search/application/bpa"}/${row.original?.applicationNo}/${tenantId?.code}`
                    : `/digit-ui/employee/${getRedirectionLink(row.original?.businessService) || "search/application/bpa"}/${row.original?.applicationNo}/${tenantId?.code}`
                }
              >
                {row.original?.applicationNo || "-"}
              </Link>
            </span>
          </div>
        ),
      },
      {
        Header: "Location / City",
        accessor: "tenantId",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Service Type",
        accessor: "serviceType",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Owner Name",
        accessor: "ownerName",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Created Date",
        accessor: "createdDate",
        Cell: ({ value }) => value || "-",
      },
    ];

    return (
      <Table
        className="customTable table-border-style"
        t={t}
        data={data}
        columns={columns}
        getCellProps={() => ({ style: {} })}
        disableSort={false}
        autoSort={false}
        manualPagination={true}
        isPaginationRequired={true}
        currentPage={currentPage}
        pageSizeLimit={pageSizeLimit}
        totalRecords={totalRecords}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        onFirstPage={onFirstPage}
        onLastPage={onLastPage}
        onPageSizeChange={onPageSizeChange}
      />
    );
  }

  // Mobile Card View
  return (
    <div className="mobile-results-container">
      {data.map((item, idx) => (
        <div
          key={idx}
          style={{
            padding: "16px",
            marginBottom: "12px",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <strong>App No:</strong>{" "}
            <Link
              to={
                window.location.href.includes("/citizen")
                  ? `/digit-ui/citizen/obps/${getRedirectionLink(item?.businessService) || "search/application/bpa"}/${item?.applicationNo}`
                  : `/digit-ui/employee/obps/${getRedirectionLink(item?.businessService) || "search/application/bpa"}/${item?.applicationNo}`
              }
            >
              {item?.applicationNo || "-"}
            </Link>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Tenant:</strong> {item?.tenantId || "-"}
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Service:</strong> {item?.serviceType || "-"}
          </div>
          <div style={{ marginBottom: "8px" }}>
            <strong>Status:</strong> {item?.status || "-"}
          </div>
          <div>
            <strong>Date:</strong> {item?.createdDate || "-"}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsTable;
