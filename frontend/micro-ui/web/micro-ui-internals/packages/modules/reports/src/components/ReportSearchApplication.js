import React, { useState, useEffect, useMemo, useRef, useReducer, useCallback } from "react";
import SearchFormFieldsComponent from "./SearchFormFieldsComponent";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  CloseSvg,
  SearchForm,
  Table,
  Card,
  SearchAction,
  PopUp,
  DetailsCard,
  Loader,
  MultiLink,
  Header,
  TextInput,
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
  const [isDisplayDownloadMenu, setIsDisplayDownloadMenu] = useState(false);
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

  const visibleIdx = useMemo(() => headers.map((h, i) => (h?.showColumn === false ? -1 : i)).filter((i) => i > -1), [headers]);

  const formatCell = useCallback(
    (row, index) => {
      const header = headers[index] || {};
      const raw = row?.[index];
      if (raw === null || raw === undefined || raw === "") return "-";
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

  const columns = useMemo(
    () => [
      {
        Header: t("REPORTS_SNO") !== "REPORTS_SNO" ? t("REPORTS_SNO") : "S. No",
        id: "__sno",
        disableSortBy: true,
        accessor: (row, rowIndex) => rowIndex + 1,
        Cell: ({ row }) => <span className="cell-text">{row.index + 1}</span>,
      },
      ...visibleIdx.map((index) => ({
        Header: t(headers[index]?.label),
        id: `col_${index}`,
        disableSortBy: true,
        accessor: (row) => row?.[index],
        Cell: ({ row }) => <span className="cell-text">{formatCell(row.original, index)}</span>,
      })),
    ],
    [visibleIdx, headers, formatCell, t]
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
      label: "pdf",
      onClick: () => {
        const pageSize = String(reportDetails?.additionalConfig?.print?.pdfPageSize || "LEGAL").toUpperCase();
        const pageOrientation = visibleIdx.length > 6 ? "landscape" : "portrait";
        Digit.Download.TablePDF(`mSeva Reports - ${reportTitle}`, exportHeaders, getExportRows(), reportName, {
          pageSize,
          pageOrientation,
          subtitle: resultLabel,
        });
        setIsDisplayDownloadMenu(false);
      },
    },
    {
      label: "xls",
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
        Digit.Download.Excel(json, reportName);
        setIsDisplayDownloadMenu(false);
      },
    },
  ];

  const searchFormFieldsComponentProps = { formState, Controller, register, control, t, reset, data, tenantId, onReset };

  const TotalsRow = () =>
    hasTotals ? (
      <Card style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: "12px 32px" }}>
        <strong style={{ width: "100%" }}>{t("REPORTS_TOTAL") !== "REPORTS_TOTAL" ? t("REPORTS_TOTAL") : "Total"}</strong>
        {visibleIdx
          .filter((i) => i in totals)
          .map((i) => (
            <div key={i}>
              <span style={{ color: "#505A5F" }}>{t(headers[i]?.label)}: </span>
              <strong>{totals[i] === undefined ? "-" : formatAmount(totals[i])}</strong>
            </div>
          ))}
      </Card>
    ) : null;

  const NoData = () => (
    <Card style={{ marginTop: 20 }}>
      {t(tableData?.display)
        .split("\\n")
        .map((text, index) => (
          <p key={index} style={{ textAlign: "center" }}>
            {text}
          </p>
        ))}
    </Card>
  );

  if (isLoading) return <Loader />;
  if (isMetaError || (data && !reportDetails)) {
    return (
      <Card style={{ marginTop: 20 }}>
        <p style={{ textAlign: "center" }}>{t("REPORTS_NOT_FOUND") !== "REPORTS_NOT_FOUND" ? t("REPORTS_NOT_FOUND") : `Report "${reportName}" could not be loaded`}</p>
      </Card>
    );
  }

  if (isMobile) {
    const mobileCards = rowData.map((row, r) => {
      const obj = { "S. No": r + 1 };
      visibleIdx.forEach((i) => (obj[t(headers[i]?.label)] = formatCell(row, i)));
      return obj;
    });
    return (
      <React.Fragment>
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
        {resultLabel && tableData && !tableData.display ? <p style={{ margin: "12px 0" }}>{resultLabel}</p> : null}
        {isTableDataLoading ? (
          <Loader />
        ) : tableData?.display ? (
          <NoData />
        ) : tableData ? (
          <React.Fragment>
            <DetailsCard data={mobileCards} isTwoDynamicPrefix={true} />
            <TotalsRow />
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Header>{reportTitle}</Header>
      <SearchForm onSubmit={onSubmit} handleSubmit={handleSubmit}>
        <SearchFormFieldsComponent {...searchFormFieldsComponentProps} />
      </SearchForm>

      {isTableDataLoading ? (
        <Loader />
      ) : tableData?.display ? (
        <NoData />
      ) : tableData ? (
        <React.Fragment>
          {resultLabel ? <p className="report-result-table-header" style={{ margin: "16px 0 8px" }}>{resultLabel}</p> : null}
          <Table
            tableRef={tableRef}
            t={t}
            className={"table reports-table "}
            data={rowData}
            columns={columns}
            onSearch={searchText}
            searchAllFields={true}
            getCellProps={(cellInfo) => {
              const index = cellInfo?.column?.id?.startsWith("col_") ? Number(cellInfo.column.id.slice(4)) : -1;
              return {
                style: {
                  padding: "20px 18px",
                  fontSize: "16px",
                  textAlign: index > -1 && isAmountColumn(headers[index]) ? "right" : "left",
                  wordBreak: cellInfo?.column?.Header === t("reports.hrms.role") ? "break-all" : null,
                  minWidth: cellInfo?.column?.id === "__sno" ? "80px" : null,
                },
              };
            }}
            manualPagination={false}
            totalRecords={Count}
            tableTopComponent={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ minWidth: 240, maxWidth: 360, flex: 1 }}>
                  <TextInput
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={t("ES_COMMON_SEARCH")}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <MultiLink
                  className="multilinkWrapper"
                  onHeadClick={() => setIsDisplayDownloadMenu(!isDisplayDownloadMenu)}
                  displayOptions={isDisplayDownloadMenu}
                  options={downloadOptions}
                  downloadBtnClassName={"reports-download-btn"}
                  downloadOptionsClassName={"reports-options-download"}
                  reportStyles={{ position: "relative" }}
                />
              </div>
            }
            isReportTable={true}
          />
          <TotalsRow />
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

export default ReportSearchApplication;
