import React, { useState, useEffect, useMemo, useRef, useReducer, useCallback } from "react";
import SearchFormFieldsComponent from "./SearchFormFieldsComponent";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  CloseSvg,
  SearchForm,
  Table,
  SearchAction,
  PopUp,
  DetailsCard,
  Loader,
  Header,
} from "@mseva/digit-ui-react-components";
import { epochToDisplayDate, formatAmount, getInitialFieldValue, getReportTitle, isAmountColumn, toNumber } from "../util";

// Result rendering follows the old rainmaker reportResult.js:
//  - S. No column, hidden columns (showColumn: false) are not shown
//  - epoch columns as dd/mm/yyyy, currency / total columns with Indian digit grouping, right aligned
//  - "Total" row for columns marked total: true (over all rows)
//  - PDF (page size from additionalConfig.print.pdfPageSize, landscape when > 6 columns) and XLS of ALL rows

function activateModal(state, action) {
  switch (action.type) {
    case "set":
      return action.payload;
    case "remove":
      return false;
    default:
      return state;
  }
}

const Icon = ({ d, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {d}
  </svg>
);
const SearchIcon = () => <Icon d={[<circle key="c" cx="11" cy="11" r="7" />, <path key="p" d="M20 20l-3.5-3.5" />]} />;
const DownloadIcon = () => <Icon d={[<path key="a" d="M12 4v11" />, <path key="b" d="M7 10l5 5 5-5" />, <path key="c" d="M5 20h14" />]} />;
const ChevronIcon = () => <Icon d={<path d="M6 9l6 6 6-6" />} />;
const EmptyIcon = () => <Icon d={[<rect key="r" x="4" y="3" width="16" height="18" rx="2" />, <path key="l" d="M8 8h8M8 12h8M8 16h5" />]} />;

const DownloadMenu = ({ options, label, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="rpt-download" ref={ref}>
      <button type="button" className="rpt-btn rpt-btn--secondary" aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={() => setOpen(!open)}>
        <DownloadIcon />
        {label}
        <ChevronIcon />
      </button>
      {open ? (
        <div className="rpt-menu" role="menu">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                o.onClick();
              }}
            >
              <span className="rpt-file-badge" style={{ background: o.color }}>
                {o.badge}
              </span>
              {o.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const ReportSearchApplication = ({
  onSubmit,
  onReset,
  isLoading,
  isMetaError,
  data,
  tableData,
  isTableDataLoading,
  Count,
  searchData,
  reportName,
  resultLabel,
  tenantId,
}) => {
  const { t } = useTranslation();
  const { register, control, handleSubmit, getValues, reset, formState } = useForm({
    defaultValues: { ...searchData },
  });
  const tableRef = useRef();
  const [searchText, setSearchText] = useState("");
  const [currentlyActiveMobileModal, setActiveMobileModal] = useReducer(activateModal, false);
  const isMobile = window.Digit.Utils.browser.isMobile();

  const reportDetails = data?.reportDetails;
  const reportTitle = getReportTitle(reportDetails, reportName, t);

  // initialValue from metadata (old componentWillReceiveProps)
  useEffect(() => {
    const fields = reportDetails?.searchParams || [];
    const init = {};
    fields.forEach((f) => {
      const v = getInitialFieldValue(f, t);
      if (v !== undefined) init[f.name] = v;
    });
    if (Object.keys(init).length) reset({ ...getValues(), ...init });
  }, [reportDetails]);

  const headers = tableData?.reportHeader || [];
  const rowData = tableData?.reportData || [];

  useEffect(() => setSearchText(""), [tableData]);

  const visibleIdx = useMemo(() => headers.map((h, i) => (h?.showColumn === false ? -1 : i)).filter((i) => i > -1), [headers]);

  const formatCell = useCallback(
    (row, index) => {
      const header = headers[index] || {};
      const raw = row?.[index];
      if (raw === null || raw === undefined || raw === "") return "";
      if (header.type === "epoch") return epochToDisplayDate(raw);
      if (header.type === "stringarray") {
        const parts = String(raw).split(",");
        return parts.map((p) => (header.localisationRequired ? t(`${header.localisationPrefix || ""}${p}`) : p)).join(" ");
      }
      if (isAmountColumn(header)) return formatAmount(raw);
      if (header.localisationRequired) return t(`${header.localisationPrefix || ""}${raw}`);
      return raw;
    },
    [headers, t]
  );

  const totals = useMemo(() => {
    const result = {};
    visibleIdx.forEach((i) => {
      if (!headers[i]?.total) return;
      let sum;
      rowData.forEach((row) => {
        const n = toNumber(row?.[i]);
        if (typeof n === "number" && !isNaN(n)) sum = (sum || 0) + n;
      });
      result[i] = sum;
    });
    return result;
  }, [rowData, headers, visibleIdx]);
  const hasTotals = Object.keys(totals).length > 0 && rowData.length > 0;

  // numbers (incl. "1,234.50" and epoch dates) sort numerically, everything else by displayed text
  const makeSortType = useCallback(
    (index) => (rowA, rowB) => {
      const a = rowA.original?.[index];
      const b = rowB.original?.[index];
      const isEmpty = (v) => v === null || v === undefined || v === "";
      if (isEmpty(a) || isEmpty(b)) return isEmpty(a) === isEmpty(b) ? 0 : isEmpty(a) ? -1 : 1;
      const na = Number(String(a).replace(/,/g, "").trim());
      const nb = Number(String(b).replace(/,/g, "").trim());
      if (Number.isFinite(na) && Number.isFinite(nb)) return na === nb ? 0 : na > nb ? 1 : -1;
      return String(formatCell(rowA.original, index)).localeCompare(String(formatCell(rowB.original, index)), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    },
    [formatCell]
  );

  const columns = useMemo(
    () => [
      {
        Header: t("REPORTS_SNO") !== "REPORTS_SNO" ? t("REPORTS_SNO") : "S. No",
        id: "__sno",
        disableSortBy: true,
        accessor: (row, rowIndex) => rowIndex + 1,
        // running number of the row as displayed (after sorting), not its position in the API data
        Cell: ({ row, page, state }) => (
          <span className="cell-text rpt-sno">{(state?.pageIndex || 0) * (state?.pageSize || 0) + (page || []).indexOf(row) + 1}</span>
        ),
      },
      ...visibleIdx.map((index) => {
        const label = t(headers[index]?.label);
        const isAmount = isAmountColumn(headers[index]);
        return {
          // amount headers are right aligned to sit above their right aligned values
          Header: isAmount ? () => <span className="rpt-th--num">{label}</span> : label,
          isStatusColumn: !isAmount && /status/i.test(String(label)),
          id: `col_${index}`,
          sortType: makeSortType(index),
          sortDescFirst: false,
          accessor: (row) => row?.[index],
          Cell: ({ row }) => <span className="cell-text">{formatCell(row.original, index)}</span>,
        };
      }),
    ],
    [visibleIdx, headers, formatCell, makeSortType, t]
  );

  // ---- downloads (all rows, not only the visible page) ----
  const exportHeaders = useMemo(() => ["S. No", ...visibleIdx.map((i) => t(headers[i]?.label))], [visibleIdx, headers, t]);
  const getExportRows = () => {
    const rows = rowData.map((row, r) => [r + 1, ...visibleIdx.map((i) => formatCell(row, i))]);
    if (hasTotals) rows.push(["Total", ...visibleIdx.map((i) => (i in totals && totals[i] !== undefined ? formatAmount(totals[i]) : ""))]);
    return rows;
  };

  const downloadOptions = [
    {
      key: "pdf",
      label: "PDF document",
      badge: "PDF",
      color: "#dc2626",
      onClick: () => {
        const pageSize = String(reportDetails?.additionalConfig?.print?.pdfPageSize || "LEGAL").toUpperCase();
        const pageOrientation = visibleIdx.length > 6 ? "landscape" : "portrait";
        Digit.Download.TablePDF("mSeva Reports", exportHeaders, getExportRows(), reportName, {
          subheading: reportTitle,
          pageSize,
          pageOrientation,
          subtitle: resultLabel,
          emptyCellText: "",
        });
      },
    },
    {
      key: "xls",
      label: "Excel spreadsheet",
      badge: "XLS",
      color: "#16a34a",
      onClick: () => {
        // unique column keys so two columns with the same label don't overwrite each other
        const keys = [];
        exportHeaders.forEach((h) => {
          let k = `${h}`;
          let n = 2;
          while (keys.includes(k)) k = `${h} (${n++})`;
          keys.push(k);
        });
        const json = getExportRows().map((row) => {
          const obj = {};
          keys.forEach((k, i) => (obj[k] = row[i]));
          return obj;
        });
        const downloadedOn = new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        Digit.Download.Excel(json, reportName, {
          headerRows: [["mSeva Reports"], [reportTitle], ...(resultLabel ? [[resultLabel]] : []), [`Downloaded on: ${downloadedOn}`]],
        });
      },
    },
  ];

  const searchFormFieldsComponentProps = { formState, Controller, register, control, t, reset, data, tenantId, onReset };

  const totalLabel = t("REPORTS_TOTAL") !== "REPORTS_TOTAL" ? t("REPORTS_TOTAL") : "Total";
  const totalIdx = visibleIdx.filter((i) => i in totals);

  // last row of the table: totals for columns marked "total" in report metadata
  const tableFooterRow = useMemo(() => {
    if (!hasTotals) return null;
    const row = { __sno: totalLabel };
    totalIdx.forEach((i) => (row[`col_${i}`] = totals[i] === undefined ? "" : formatAmount(totals[i])));
    return row;
  }, [hasTotals, totals, totalIdx, totalLabel]);

  const TotalsRow = () =>
    hasTotals ? (
      <div className="rpt-summary" aria-label={totalLabel}>
        {totalIdx.map((i, n) => (
          <div key={i} className={`rpt-stat${n === totalIdx.length - 1 ? " rpt-stat--accent" : ""}`}>
            <div className="rpt-stat-label" title={t(headers[i]?.label)}>
              {totalLabel} {t(headers[i]?.label)}
            </div>
            <div className="rpt-stat-value">{totals[i] === undefined ? "-" : formatAmount(totals[i])}</div>
          </div>
        ))}
      </div>
    ) : null;

  const NoData = () => (
    <div className="rpt-empty">
      <EmptyIcon />
      {t(tableData?.display)
        .split("\\n")
        .map((text, index) => (
          <p key={index}>{text}</p>
        ))}
    </div>
  );

  const recordCount = rowData.length;
  const recordsText = `${recordCount} ${recordCount === 1 ? "record" : "records"}`;

  if (isLoading) return <Loader />;
  if (isMetaError || (data && !reportDetails)) {
    return (
      <div className="rpt-page">
        <div className="rpt-card">
          <div className="rpt-empty">
            <EmptyIcon />
            <p>{t("REPORTS_NOT_FOUND") !== "REPORTS_NOT_FOUND" ? t("REPORTS_NOT_FOUND") : `Report "${reportName}" could not be loaded`}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    const mobileCards = rowData.map((row, r) => {
      const obj = { "S. No": r + 1 };
      visibleIdx.forEach((i) => (obj[t(headers[i]?.label)] = formatCell(row, i)));
      return obj;
    });
    return (
      <div className="rpt-page">
        <Header>{reportTitle}</Header>
        <div className="searchBox">
          <SearchAction text={t("ES_COMMON_SEARCH")} handleActionClick={() => setActiveMobileModal({ type: "set", payload: "SearchFormComponent" })} />
        </div>
        {currentlyActiveMobileModal ? (
          <PopUp>
            <SearchForm
              onSubmit={(formData) => {
                setActiveMobileModal({ type: "remove" });
                onSubmit(formData);
              }}
              handleSubmit={handleSubmit}
              id="search-form"
              className="rm-mb form-field-flex-one inboxPopupMobileWrapper"
            >
              <div className="InboxMobilePopupCloseButtonWrapper" onClick={() => setActiveMobileModal({ type: "remove" })}>
                <CloseSvg />
              </div>
              <div className="MobilePopupHeadingWrapper">
                <h2>{t("ES_COMMON_SEARCH")}:</h2>
              </div>
              <SearchFormFieldsComponent {...searchFormFieldsComponentProps} />
            </SearchForm>
          </PopUp>
        ) : null}
        {resultLabel && tableData && !tableData.display ? (
          <div className="rpt-meta">
            <span>{resultLabel}</span>
            <span className="rpt-chip">{recordsText}</span>
          </div>
        ) : null}
        {isTableDataLoading ? (
          <Loader />
        ) : tableData?.display ? (
          <div className="rpt-card">
            <NoData />
          </div>
        ) : tableData ? (
          <React.Fragment>
            <TotalsRow />
            <DetailsCard data={mobileCards} isTwoDynamicPrefix={true} />
          </React.Fragment>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rpt-page">
      <div className="rpt-page-header">
        <h1>{reportTitle}</h1>
        <p>Set the search criteria and click Search to generate the report.</p>
      </div>

      <section className="rpt-card">
        <div className="rpt-card-head">
          <h2>Search criteria</h2>
          <span className="rpt-hint">
            Fields marked <span className="rpt-required">*</span> are required
          </span>
        </div>
        <SearchForm onSubmit={onSubmit} handleSubmit={handleSubmit} className="rpt-filter-form">
          <SearchFormFieldsComponent {...searchFormFieldsComponentProps} />
        </SearchForm>
      </section>

      {isTableDataLoading ? (
        <section className="rpt-card">
          <Loader />
        </section>
      ) : tableData?.display ? (
        <section className="rpt-card">
          <NoData />
        </section>
      ) : tableData ? (
        <section className="rpt-card">
          <div className="rpt-results-head">
            <div>
              <h2>Results</h2>
              <div className="rpt-meta">
                <span className="rpt-chip">{recordsText}</span>
                {resultLabel ? <span>{resultLabel}</span> : null}
              </div>
            </div>
            <div className="rpt-toolbar">
              <div className="rpt-search">
                <SearchIcon />
                <input
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={t("REPORTS_SEARCH_IN_RESULTS") !== "REPORTS_SEARCH_IN_RESULTS" ? t("REPORTS_SEARCH_IN_RESULTS") : "Search in results"}
                  aria-label="Search in results"
                />
              </div>
              <DownloadMenu options={downloadOptions} label={t("CS_COMMON_DOWNLOAD")} disabled={!recordCount} />
            </div>
          </div>

          <TotalsRow />

          <div className="rpt-table-wrap">
            <Table
              tableRef={tableRef}
              t={t}
              className={"table reports-table"}
              data={rowData}
              columns={columns}
              onSearch={searchText}
              searchAllFields={true}
              getCellProps={(cellInfo) => {
                const index = cellInfo?.column?.id?.startsWith("col_") ? Number(cellInfo.column.id.slice(4)) : -1;
                return {
                  style: {
                    padding: "12px 16px",
                    fontSize: "14px",
                    textAlign: index > -1 && isAmountColumn(headers[index]) ? "right" : "left",
                    wordBreak: cellInfo?.column?.Header === t("reports.hrms.role") ? "break-all" : null,
                    width: cellInfo?.column?.id === "__sno" ? "64px" : null,
                  },
                };
              }}
              manualPagination={false}
              totalRecords={Count}
              isReportTable={true}
              footerRow={tableFooterRow}
              disableSort={false}
              manualSort={false}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default ReportSearchApplication;
