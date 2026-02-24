import React from "react";
import { Table } from "@mseva/digit-ui-react-components";

const ApplicationTable = ({
  t,
  currentPage,
  columns,
  data,
  getCellProps,
  disableSort,
  onSort,
  onNextPage,
  onPrevPage,
  onPageSizeChange,
  pageSizeLimit,
  sortParams,
  totalRecords,
}) => {
  
  // include pageSizeLimit and currentPage in key to force remount when pagination size/page changes
  const tableKey = `table-${pageSizeLimit}-${currentPage}-${sortParams?.[0]?.id || ""}-${sortParams?.[0]?.desc ? "d" : "a"}`;
   
  return (
    <Table
      key={tableKey}
      t={t}
      data={data}
      currentPage={currentPage}
      columns={columns}
      getCellProps={getCellProps}
      onNextPage={onNextPage}
      onPrevPage={onPrevPage}
      pageSizeLimit={pageSizeLimit}
      disableSort={disableSort}
      onPageSizeChange={onPageSizeChange}
      onSort={onSort}
      sortParams={sortParams}
      totalRecords={totalRecords}
    />
  );
};

export default ApplicationTable;