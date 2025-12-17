import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Table } from "@mseva/digit-ui-react-components";
import BadgeCell from "../common/BadgeCell";
import { BADGE_STYLES, PRIMARY_COLOR } from "../../utils/empMappingUtils";

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
        Cell: ({ row }) => (
          <Link
            to={`/digit-ui/employee/hrms/Mapdetails/${filterULB?.code || tenantId}/${row.original.employeeCode}/${row.original.uuid}`}
            style={{ color: PRIMARY_COLOR, fontWeight: "600", textDecoration: "none" }}
          >
            {row.original.employeeCode}
          </Link>
        ),
      },
      {
        Header: t("HR_CATEGORY_LABEL"),
        accessor: "categoryName",
        Cell: ({ value }) => <BadgeCell value={value} style={BADGE_STYLES.category} />,
      },
      {
        Header: t("HR_SUB_CATEGORY_LABEL"),
        accessor: "subCategoryName",
        Cell: ({ value }) => <BadgeCell value={value} style={BADGE_STYLES.subCategory} />,
      },
      {
        Header: t("HR_ZONE_LABEL"),
        accessor: "zoneName",
        Cell: ({ value }) => <BadgeCell value={value} style={BADGE_STYLES.zone} />,
      },
    ],
    [t, filterULB, tenantId]
  );

  if (!hasSearched) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
        <h3 style={{ margin: "0 0 8px 0", color: "#505A5F" }}>
          {t("COMMON_NO_SEARCH_YET") || "Apply filters to search"}
        </h3>
        <p style={{ margin: 0, fontSize: "14px" }}>
          {t("COMMON_SELECT_FILTERS_MESSAGE") ||
            "Select one or more filters above and click Search to view employee mappings"}
        </p>
      </div>
    );
  }

  if (mappingData.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        <p>{t("COMMON_TABLE_NO_RECORD_FOUND")}</p>
      </div>
    );
  }

  return (
    <Table
      t={t}
      data={mappingData}
      columns={columns}
      className="customTable table-border-style"
      manualPagination={true}
      isPaginationRequired={false}
      disableSort={false}
      getCellProps={() => ({ style: { padding: "12px", fontSize: "14px" } })}
    />
  );
};

export default MappingTable;
