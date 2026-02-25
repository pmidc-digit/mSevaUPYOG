import React, { useEffect, useRef, useState } from "react";
import { useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from "react-table";
import { ArrowBack, ArrowForward, ArrowToFirst, ArrowToLast, SortDown, SortUp } from "./svgindex";

const noop = () => {};

const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();
  if (value.includes("approved")) return "approved";
  if (value.includes("rejected")) return "rejected";
  if (value.includes("forward")) return "forwarded";
  if (value.includes("process")) return "in-progress";
  if (value.includes("pending")) return "pending";
  if (value.includes("new")) return "new";
  return "default";
};

const getStatusRowStyle = (statusClass) => {
  return {};
};

const getStatusDisplayText = (value) => String(value || "").toLowerCase().replace(/\s+/g, "");

const extractTextValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => extractTextValue(item)).join(" ").trim();
  if (React.isValidElement(value)) return extractTextValue(value.props?.children);
  return "";
};

console.log("TABLE_JS_LOADED_FROM_REACT_COMPONENTS_ATOMS");

const Table = ({
  className = "table",
  t,
  data,
  columns,
  getCellProps = () => ({}),
  currentPage = 0,
  pageSizeLimit = 10,
  disableSort = true,
  autoSort = false,
  initSortId = "",
  onSearch = false,
  manualPagination = true,
  totalRecords,
  onNextPage,
  onPrevPage,
  globalSearch,
  onSort = noop,
  onPageSizeChange,
  onLastPage,
  onFirstPage,
  isPaginationRequired = true,
  sortParams = [],
  showAutoSerialNo=false,
  customTableWrapperClassName="",
  styles={},
  tableTopComponent,
  tableRef,
  isReportTable=false,
  inboxStyles,
  getRowProps,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, sortBy, globalFilter },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: currentPage, pageSize: pageSizeLimit, sortBy: autoSort ? [{ id: initSortId, desc: false }] : sortParams },
      pageCount: totalRecords > 0 ? Math.ceil(totalRecords / pageSizeLimit) : -1,
      manualPagination: manualPagination,
      disableMultiSort: false,
      disableSortBy: disableSort,
      manualSortBy: autoSort ? false : true,
      autoResetPage: false,
      autoResetSortBy: false,
      disableSortRemove: true,
      disableGlobalFilter: onSearch === false ? true : false,
      globalFilter: globalSearch || "text",
      useControlledState: (state) => {
        return React.useMemo(() => ({
          ...state,
          pageIndex: manualPagination ? currentPage : state.pageIndex,
        }));
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  useEffect(() => {
    onSort(sortBy);
  }, [onSort, sortBy]);

  useEffect(() => setGlobalFilter(onSearch), [onSearch, setGlobalFilter]);

  const isMobile = window.Digit.Utils.browser.isMobile();

  const tref = useRef();
  const tableClassName = `${className || "table"} custom-new-table`.trim();
  const tableWrapperClassName = `${customTableWrapperClassName} custom-new-table-wrapper`.trim();
  const tableStyles = {
    ...styles,
  };


  console.log(isMobile, "IS MOBILE RENDER");

  console.log("loovvvvv1233",rows);

  if (isMobile) {
    return (
      <React.Fragment>
        {tableTopComponent ? tableTopComponent : null}
        <div className="digit-table-mobile-wrapper">
          {page.length === 0 ? (
            <div className="digit-table-mobile-no-data">{t ? t("CS_MYAPPLICATIONS_NO_APPLICATION") : "No data available"}</div>
          ) : (
            page.map((row, rowIndex) => {
              prepareRow(row);
              return (
                <div key={row.id || rowIndex} className="digit-table-mobile-card">
                  {showAutoSerialNo && (
                    <div className="digit-table-mobile-card-row">
                      <span className="digit-table-mobile-card-label">
                        {typeof showAutoSerialNo === "string" ? (t ? t(showAutoSerialNo) : showAutoSerialNo) : (t ? t("TB_SNO") : "S.No")}
                      </span>
                      <span className="digit-table-mobile-card-value">{rowIndex + 1}</span>
                    </div>
                  )}
                  {row.cells.map((cell, cellIndex) => {
                    const columnMeta = [cell.column?.id, cell.column?.accessor, cell.column?.Header]
                      .map((field) => String(field || "").toLowerCase())
                      .join(" ");
                    const isStatusColumn = columnMeta.includes("status");
                    const cellValue = extractTextValue(cell.value) || extractTextValue(cell.render("Cell"));
                    const headerText = typeof cell.column.Header === "string" 
                      ? (t ? t(cell.column.Header) : cell.column.Header) 
                      : (t ? t(cell.column.id || `Column ${cellIndex + 1}`) : cell.column.id || `Column ${cellIndex + 1}`);
                    
                    return (
                      <div key={cell.column.id || cellIndex} className="digit-table-mobile-card-row">
                        <span className="digit-table-mobile-card-label">{headerText}</span>
                        <span className="digit-table-mobile-card-value">
                          {isStatusColumn && cellValue ? (
                            <span className={`digit-table-mobile-status-pill ${getStatusClass(cellValue)}`}>
                              {getStatusDisplayText(cellValue)}
                            </span>
                          ) : (
                            cell.render("Cell")
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        {isPaginationRequired && (
          <div className="digit-table-mobile-pagination">
            <div>
              {t ? t("CS_COMMON_ROWS_PER_PAGE") : "Rows per page"}:
              <select
                value={pageSize}
                className="digit-table-mobile-pagination-select"
                onChange={manualPagination ? onPageSizeChange : (e) => setPageSize(Number(e.target.value))}
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <span>
              {pageIndex * pageSize + 1}-
              {manualPagination
                ? (currentPage + 1) * pageSizeLimit > totalRecords
                  ? totalRecords
                  : (currentPage + 1) * pageSizeLimit
                : pageIndex * pageSize + page?.length}{" "}
              {totalRecords ? `of ${manualPagination ? totalRecords : rows.length}` : ""}
            </span>
            <div className="pagination-controls">
              {!manualPagination && pageIndex !== 0 && <ArrowToFirst onClick={() => gotoPage(0)} />}
              {canPreviousPage && manualPagination && onFirstPage && <ArrowToFirst onClick={() => onFirstPage()} />}
              {canPreviousPage && <ArrowBack onClick={() => (manualPagination ? onPrevPage() : previousPage())} />}
              {canNextPage && <ArrowForward onClick={() => (manualPagination ? onNextPage() : nextPage())} />}
              {!manualPagination && pageIndex !== pageCount - 1 && <ArrowToLast onClick={() => gotoPage(pageCount - 1)} />}
              {rows.length === pageSizeLimit && canNextPage && manualPagination && onLastPage && <ArrowToLast onClick={() => onLastPage()} />}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
  
  return (
    <React.Fragment>
    <div ref={tref} style={tref.current && tref.current.offsetWidth < tref.current.scrollWidth ? {...inboxStyles}: {}}>
    <div className={tableWrapperClassName}>
    {tableTopComponent ? tableTopComponent:null}
      <table className={tableClassName} {...getTableProps()} style={tableStyles} ref={tableRef}>
         
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {showAutoSerialNo&& <th>
              {showAutoSerialNo&& typeof showAutoSerialNo =="string"?t(showAutoSerialNo):t("TB_SNO")}
              </th>}
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>{column.isSorted ? column.isSortedDesc ? <SortDown /> : <SortUp /> : ""}</span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            // rows.slice(0, 10).map((row, i) => {
            prepareRow(row);
            const statusCell = row?.cells?.find((cell) =>
              [cell.column?.id, cell.column?.accessor, cell.column?.Header]
                .map((field) => String(field || "").toLowerCase())
                .join(" ")
                .includes("status")
            );
            const statusValue = String(
              row?.original?.status ||
                row?.original?.applicationStatus ||
                extractTextValue(statusCell?.value) ||
                extractTextValue(statusCell?.render?.("Cell")) ||
                ""
            );
            const normalizedStatusValue = statusValue.toLowerCase();
            const statusClass = getStatusClass(normalizedStatusValue);
            const statusStyle = getStatusRowStyle(statusClass);
            const rowProps = getRowProps ? getRowProps(row) : {};
            return (
              <tr
                {...row.getRowProps({
                  ...rowProps,
                  "data-status": normalizedStatusValue,
                  className: [rowProps?.className, statusClass].filter(Boolean).join(" "),
                  style: {
                    ...statusStyle,
                    ...(rowProps?.style || {}),
                  },
                })}
              >
              {showAutoSerialNo&&  <td >
              {i+1}
              </td>}
                {row.cells.map((cell) => {
                  return (
                    <td
                      // style={{ padding: "20px 18px", fontSize: "16px", borderTop: "1px solid grey", textAlign: "left", verticalAlign: "middle" }}
                      {...cell.getCellProps([
                        (() => {
                          const cellProps = getCellProps(cell) || {};
                          const isActionColumn = String(cell.column?.id || cell.column?.accessor || "").toLowerCase().includes("action");
                          return {
                            ...cellProps,
                            className: [
                              cellProps.className,
                              "custom-new-cell",
                              isActionColumn ? "custom-new-cell-action" : ""
                            ].filter(Boolean).join(" "),
                            style: cellProps.style || {},
                          };
                        })(),
                      ])}
                    >
                      {cell.attachment_link ? (
                        <a className="custom-new-cell-link" href={cell.attachment_link}>
                          {cell.render("Cell")}
                        </a>
                      ) : (
                        (() => {
                          const columnMeta = [cell.column?.id, cell.column?.accessor, cell.column?.Header]
                            .map((field) => String(field || "").toLowerCase())
                            .join(" ");
                          const isStatusColumn = columnMeta.includes("status");
                          const cellValue = extractTextValue(cell.value) || extractTextValue(cell.render("Cell"));
                          const canPill = isStatusColumn && !!String(cellValue || "").trim();
                          if (!canPill) return <React.Fragment> {cell.render("Cell")} </React.Fragment>;
                          const cellStatusClass = getStatusClass(cellValue);
                          return (
                            <span className={`digit-table-status-pill ${cellStatusClass}`}>
                              {getStatusDisplayText(cellValue)}
                            </span>
                          );
                        })()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      </div>
      {isPaginationRequired && (
        <div className="pagination dss-white-pre" >
          {`${t("CS_COMMON_ROWS_PER_PAGE")} :`}
          <select
            className="cp"
            value={pageSize}
            onChange={manualPagination ? onPageSizeChange : (e) => setPageSize(Number(e.target.value))}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span>
            <span>
              {pageIndex * pageSize + 1}
              {"-"}
              {manualPagination
                ? (currentPage + 1) * pageSizeLimit > totalRecords
                  ? totalRecords
                  : (currentPage + 1) * pageSizeLimit
                : (pageIndex * pageSize + page?.length)}{" "}
              {/* {(pageIndex + 1) * pageSizeLimit > rows.length ? rows.length : (pageIndex + 1) * pageSizeLimit}{" "} */}
              {totalRecords ? `of ${manualPagination ? totalRecords : rows.length}` : ""}
            </span>{" "}
          </span>
          {/* to go to first and last page we need to do a manual pagination , it can be updated later*/}
          {!manualPagination&& pageIndex!=0 &&<ArrowToFirst onClick={() => gotoPage(0)} className={"cp"} />}
          {canPreviousPage && manualPagination && onFirstPage && <ArrowToFirst onClick={() => manualPagination && onFirstPage()} className={"cp"} />}
          {canPreviousPage && <ArrowBack onClick={() => (manualPagination ? onPrevPage() : previousPage())} className={"cp"} />}
          {canNextPage && <ArrowForward onClick={() => (manualPagination ? onNextPage() : nextPage())} className={"cp"} />}
          {!manualPagination&& pageIndex != pageCount-1 && <ArrowToLast onClick={() => gotoPage(pageCount-1 )} className={"cp"} />}
          {rows.length == pageSizeLimit && canNextPage && manualPagination && onLastPage && (
            <ArrowToLast onClick={() => manualPagination && onLastPage()} className={"cp"} />
          )}
          {/* to go to first and last page we need to do a manual pagination , it can be updated later*/}
        </div>
      )}
    </React.Fragment>
  );
};

export default Table;
