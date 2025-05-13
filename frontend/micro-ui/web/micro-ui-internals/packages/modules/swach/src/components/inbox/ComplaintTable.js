import React from "react";
import { Table } from "@mseva/digit-ui-react-components";

const styles = { overflowX: "scroll", overflowY: "hidden" };

const ComplaintTable = ({ t, columns, data, getCellProps, onNextPage, onPrevPage, currentPage, totalRecords, pageSizeLimit, onPageSizeChange }) => (
  <Table
    t={t}
    data={data}
    columns={columns}
    getCellProps={getCellProps}
    onNextPage={onNextPage}
    onPrevPage={onPrevPage}
    currentPage={currentPage}
    totalRecords={totalRecords}
    onPageSizeChange={onPageSizeChange}
    pageSizeLimit={pageSizeLimit}
    inboxStyles={styles}
  />
);

export default ComplaintTable;
