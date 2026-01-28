import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Table } from "@mseva/digit-ui-react-components";
import BadgeCell from "../common/BadgeCell";


const MappingTable = ({ 
  t, 
  mappingData, 
  hasSearched, 
  filterULB, 
  tenantId 
}) => {
  const columns = useMemo(
    () => [
      {
        Header: t("HR_EMPLOYEE_CODE"),
        accessor: "employeeCode",
        disableSortBy: false,
        Cell: ({ row }) => (
          <Link
            to={`/digit-ui/employee/hrms/Mapdetails/${filterULB?.code || tenantId}/${row.original.employeeCode}/${row.original.uuid}`}
            className="hrms-emp-mapping__employee-link"
          >
            {row.original.employeeCode}
          </Link>
        ),
      },
      {
        Header: t("HR_CATEGORY_LABEL"),
        accessor: "categoryName",
        disableSortBy: false,
        Cell: ({ value }) => <BadgeCell value={value} type="category" />,
      },
      {
        Header: t("HR_SUB_CATEGORY_LABEL"),
        accessor: "subCategoryName",
        disableSortBy: false,
        Cell: ({ value }) => <BadgeCell value={value} type="subCategory" />,
      },
      {
        Header: t("HR_ZONE_LABEL"),
        accessor: "zoneName",
        disableSortBy: false,
        Cell: ({ value }) => <BadgeCell value={value} type="zone" />,
      },
    ],
    [t, filterULB?.code, tenantId]
  );

  if (!hasSearched) {
    return (
      <div className="hrms-emp-mapping__no-search">
        <div className="hrms-emp-mapping__no-search-icon">🔍</div>
        <h3 className="hrms-emp-mapping__no-search-title">
          {t("COMMON_NO_SEARCH_YET") || "Apply filters to search"}
        </h3>
        <p className="hrms-emp-mapping__no-search-text">
          {t("COMMON_SELECT_FILTERS_MESSAGE") ||
            "Select one or more filters above and click Search to view employee mappings"}
        </p>
      </div>
    );
  }

  // Safety check: Ensure mappingData is a valid array
  if (!Array.isArray(mappingData) || mappingData.length === 0) {
    return (
      <div className="hrms-emp-mapping__no-data">
        <p>{t("COMMON_TABLE_NO_RECORD_FOUND")}</p>
      </div>
    );
  }

  return (
    <Table
      t={t}
      data={mappingData}
      columns={columns}
      getCellProps={(cellInfo) => ({
        style: cellInfo.column.style || {},
      })}
      className="customTable table-border-style hrms-emp-mapping__table"
      manualPagination={true}
      isPaginationRequired={false}
      disableSort={false}
    />
  );
};

export default MappingTable;
