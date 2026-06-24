import React, { useMemo, useState } from "react";
import { Table, TextInput } from "@mseva/digit-ui-react-components";

const ApplicationTable = ({ t, columns, data = [], getCellProps, onNextPage, onPrevPage, currentPage, totalRecords, pageSizeLimit, onPageSizeChange }) => {
  const [searchText, setSearchText] = useState("");

  const matchesSearch = (obj, search) => {
    if (!search) return true;
    const s = search.toString().toLowerCase();

    const recurse = (val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        return val.toString().toLowerCase().includes(s) || t("COMMON_MASTERS_DESIGNATION_"+val.toString()).toLowerCase().includes(s) || t("COMMON_MASTERS_DEPARTMENT_"+val.toString()).toLowerCase().includes(s);
      }
      if (Array.isArray(val)) {
        return val.some((it) => recurse(it));
      }
      if (typeof val === "object") {
        return Object.keys(val).some((k) => recurse(val[k]));
      }
      return false;
    };

    return recurse(obj);
  };

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return data;
    try {
      return data.filter((row) => matchesSearch(row, searchText.trim()));
    } catch (e) {
      return data;
    }
  }, [data, searchText]);

  // When searching, show filtered count; otherwise fall back to provided totalRecords
  const displayedTotal = searchText ? filteredData.length : totalRecords;

  return (
    <div>
      <div className="inline-search-container">
        <div className="inline-search-complaint-container">
          <TextInput
            value={searchText}
            onChange={(e) => setSearchText(e?.target?.value)}
            placeholder={t("Search") || "Search"}
          />
        </div>
      </div>
      <Table
        key={pageSizeLimit}
        t={t}
        data={filteredData}
        columns={columns}
        getCellProps={getCellProps}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        currentPage={currentPage}
        totalRecords={displayedTotal}
        onPageSizeChange={onPageSizeChange}
        pageSizeLimit={pageSizeLimit}
        // onSearch={searchText.toString().trim()}
        // globalSearch={"text"}
      />
    </div>
  );
};

export default ApplicationTable;
