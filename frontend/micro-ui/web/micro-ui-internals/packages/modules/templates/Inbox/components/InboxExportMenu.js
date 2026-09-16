import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

const extractText = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return String(val).trim();
  if (Array.isArray(val)) return val.map(extractText).join(" ").trim();
  if (React.isValidElement(val)) return extractText(val.props?.children);
  if (typeof val === "object") return String(val.name || val.code || "");
  return String(val).trim();
};

const formatDate = (val) => {
  const num = Number(val);
  if (!isNaN(num) && num > 10000000000) {
    try {
      const date = new Date(num);
      return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    } catch (e) {
      return "-";
    }
  }
  const str = String(val || "").trim();
  if (!str || str === "0" || str === "null" || str === "undefined") return "-";
  return str;
};

const InboxExportMenu = ({
  columns = [],
  data = [],
  totalCount = 0,
  fetchAllData = null,
  fileName = "Applications",
  t: translate = null,
}) => {
  const { t: localT } = useTranslation();
  const t = translate || localT;
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener("click", handleClickOutside), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const getExportableColumns = useCallback(() => {
    return (columns || []).filter((col) => {
      const colId = String(col.id || col.accessor || col.Header || "").toLowerCase();
      return !colId.includes("action") && colId !== "selection" && colId !== "checkbox";
    });
  }, [columns]);

  const getHeaders = useCallback(() => {
    return getExportableColumns().map((col) => {
      const title = typeof col.Header === "string" ? col.Header : col.id || col.accessor || "Column";
      return t ? t(title) : title;
    });
  }, [getExportableColumns, t]);

  const formatRows = useCallback(
    (records) => {
      const validCols = getExportableColumns();
      return (records || []).map((row, rowIndex) => {
        return validCols.map((col) => {
          const colHeader = String(col.Header || "").toLowerCase();
          const colId = String(col.id || col.accessor || "").toLowerCase();

          // Serial number column
          if (col.accessor === "serialNumber" || colHeader.includes("sr no") || colHeader.includes("s.no")) {
            return String(rowIndex + 1);
          }

          let cellText = "";
          if (col.Cell && typeof col.Cell === "function") {
            try {
              cellText = extractText(col.Cell({ row: { original: row, index: rowIndex } }));
            } catch (e) {}
          }

          if (!cellText) {
            const rawVal = typeof col.accessor === "function" ? col.accessor(row) : (row[col.accessor] ?? row[col.id]);
            cellText = extractText(rawVal);
          }

          // Date columns: format epoch timestamp, convert 0 / null / empty to -
          if (colId.includes("date") || colHeader.includes("date") || colId.includes("time") || colHeader.includes("time")) {
            return formatDate(cellText);
          }

          // Any other column: convert empty / null / undefined to -
          if (!cellText || cellText === "null" || cellText === "undefined") {
            return "-";
          }

          return cellText;
        });
      });
    },
    [getExportableColumns]
  );

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      setIsOpen(false);

      let records = data;
      if (typeof fetchAllData === "function") {
        try {
          const fullRecords = await fetchAllData();
          if (Array.isArray(fullRecords) && fullRecords.length > 0) records = fullRecords;
        } catch (e) {
          console.error("fetchAllData error", e);
        }
      }

      if (!records || !records.length) {
        setIsExporting(false);
        return;
      }

      const headers = getHeaders();
      const rows = formatRows(records);
      const cleanFileName = `${fileName || "Applications"}_${new Date().toISOString().slice(0, 10)}`;

      if (format === "csv" && window?.Digit?.Download?.CSV) {
        window.Digit.Download.CSV("Application Details", headers, rows, cleanFileName);
      } else if (format === "pdf" && window?.Digit?.Download?.TablePDF) {
        window.Digit.Download.TablePDF("Application Details", headers, rows, cleanFileName);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const options = [
    { label: t("CS_COMMON_EXPORT_CSV"), format: "csv" },
    { label: t("CS_COMMON_EXPORT_PDF"), format: "pdf" },
  ];

  return (
    <div ref={menuRef} className="multilinkWrapper margin-unset">
      <div
        className="multilink-labelWrap margin-unset cursor-pointer"
        onClick={() => !isExporting && setIsOpen((prev) => !prev)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#2947a3">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
        </svg>
        <span className="clear-search-label">
          {isExporting ? t("CS_COMMON_EXPORTING") : t("CS_COMMON_EXPORT")}
        </span>
      </div>

      {isOpen && !isExporting && (
        <div className="multilink-optionWrap smallText">
          {options.map((opt) => (
            <div
              key={opt.format}
              className="multilink-option smallText"
              onClick={() => handleExport(opt.format)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxExportMenu;
