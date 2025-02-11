// for getting table for the ad
import React from "react";
import { Table } from "@mseva/digit-ui-react-components";
/*
 * ApplicationTable component renders a table to display application data.
 * It supports pagination, sorting, and customizable cell properties, 
 * making it easy to navigate and manage tabular information.
 */

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
  isPaginationRequired,
  pageSizeLimit,
  sortParams,
  totalRecords,
}) => {
  return (
    <Table
      t={t}
      data={data}
      currentPage={currentPage}
      columns={columns}
      getCellProps={getCellProps}
      onNextPage={onNextPage}
      onPrevPage={onPrevPage}
      pageSizeLimit={pageSizeLimit}
      disableSort={disableSort}
      isPaginationRequired={isPaginationRequired}
      onPageSizeChange={onPageSizeChange}
      onSort={onSort}
      sortParams={sortParams}
      totalRecords={totalRecords}
    />
  );
};
export default ApplicationTable;
