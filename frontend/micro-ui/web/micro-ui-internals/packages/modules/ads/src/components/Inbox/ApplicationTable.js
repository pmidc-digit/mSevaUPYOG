import React from "react";
import { Table } from "@mseva/digit-ui-react-components";

const ApplicationTable = ({
  t,
  currentPage,
  columns,
  data,
  className,
  styles,
  customTableWrapperClassName,
  getCellProps,
  getRowProps,
  disableSort,
  onSort,
  onNextPage,
  onPrevPage,
  onPageSizeChange,
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
      className={className}
      styles={styles}
      customTableWrapperClassName={customTableWrapperClassName}
      getCellProps={getCellProps}
      getRowProps={getRowProps}
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
