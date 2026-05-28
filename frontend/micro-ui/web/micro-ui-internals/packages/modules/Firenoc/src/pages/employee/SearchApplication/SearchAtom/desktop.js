import React, { useCallback, useEffect, useState, useMemo } from "react";
import { SearchForm, Table, Card, Loader } from "@mseva/digit-ui-react-components";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

const SearchApplicationDesktopView = ({ columns, SearchFormFieldsComponent, onSubmit, data, error, isLoading, Count }) => {
  const { handleSubmit, setValue, getValues } = useFormContext();
  if (getValues("offset") == undefined) setValue("offset", 0);
  if (getValues("limit") == undefined) setValue("limit", 10);

  const [currPage, setCurrPage] = useState(Number(getValues("offset")) / Number(getValues("limit")));
  const { t } = useTranslation();

  const fetchLastPage = () => {
    setValue("offset", Count && Math.ceil(Count / 10) * 10 - getValues("limit"));
    handleSubmit(onSubmit)();
  };

  const fetchFirstPage = () => {
    setValue("offset", 0);
    handleSubmit(onSubmit)();
  };

  const onSort = useCallback((args) => {
    if (args.length === 0) return;
    setValue("sortBy", args.id);
    setValue("sortOrder", args.desc ? "DESC" : "ASC");
  }, []);

  function onPageSizeChange(e) {
    setValue("limit", Number(e.target.value));
    handleSubmit(onSubmit)();
  }

  function nextPage() {
    setValue("offset", Number(getValues("offset")) + Number(getValues("limit")));
    handleSubmit(onSubmit)();
  }
  function previousPage() {
    setValue("offset", Number(getValues("offset")) - Number(getValues("limit")));
    handleSubmit(onSubmit)();
  }

  const [visibleColumnIds, setVisibleColumnIds] = useState([
    "applicationNo",
    "fireNOCNumber",
    "fireNOCType",
    "applicantName",
    "date",
    "applicationStatus",
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [showLocalSearchInput, setShowLocalSearchInput] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const allColumnsList = useMemo(() => [
    { id: "applicationNo", label: t("NOC_APPLICATION_NUMBER") },
    { id: "fireNOCNumber", label: t("NOC_FIRENOC_NUMBER") || "NOC No" },
    { id: "fireNOCType", label: t("NOC_TYPE") || "NOC Type" },
    { id: "applicantName", label: t("NOC_APPLICANT_NAME") || "Applicant Name" },
    { id: "date", label: t("TL_COMMON_TABLE_COL_APP_DATE") },
    { id: "applicationStatus", label: t("PT_COMMON_TABLE_COL_STATUS_LABEL") },
    { id: "tenantId", label: t("NOC_TENANT_ID") || "Tenant Id" },
  ], [t]);

  const toggleColumn = (id) => {
    if (id === "applicationNo") return;
    setVisibleColumnIds((prev) =>
      prev.includes(id) ? prev.filter((colId) => colId !== id) : [...prev, id]
    );
  };

  const filteredColumns = useMemo(() => {
    return columns.filter((col) => visibleColumnIds.includes(col.id));
  }, [columns, visibleColumnIds]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!localSearchTerm) return data;
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(localSearchTerm.toLowerCase())
      )
    );
  }, [data, localSearchTerm]);

  useEffect(() => {
    if (!(getValues("offset") == undefined || getValues("limit") == undefined)) setCurrPage(Number(getValues("offset")) / Number(getValues("limit")));
  }, [getValues("offset"), getValues("limit")]);

  const TableComponent = () => {
    if (isLoading) {
      return <Loader />;
    } else {
      return data?.[0]?.display ? (
        <Card style={{ marginTop: 20 }}>
          {t(data?.[0]?.display)
            .split("\\n")
            .map((text, index) => (
              <p key={index} style={{ textAlign: "center" }}>
                {text}
              </p>
            ))}
        </Card>
      ) : (
        <React.Fragment>
          {!isLoading && data && data.length > 0 && !data?.[0]?.display && (
            <div id="print-table-container">
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  background: "#fff", 
                  border: "1px solid #E4E7EB",
                  borderBottom: "none",
                  borderTopLeftRadius: "6px",
                  borderTopRightRadius: "6px",
                  padding: "16px 20px", 
                  marginTop: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <div style={{ color: "#0B0C0C", fontSize: "18px", fontWeight: "700" }}>
                  {`${t("SEARCH_RESULTS_FOR_NOC") || "Search Results for NOC"} (${Count || 0})`}
                </div>
                
                <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "20px", position: "relative" }}>
                  {showLocalSearchInput && (
                    <input
                      type="text"
                      placeholder={t("SEARCH_IN_TABLE") || "Search in table..."}
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                      style={{
                        border: "1px solid #A0AEC0",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        fontSize: "14px",
                        width: "200px",
                        outline: "none"
                      }}
                      autoFocus
                    />
                  )}

                  {/* Search Icon */}
                  <button
                    type="button"
                    onClick={() => setShowLocalSearchInput(!showLocalSearchInput)}
                    style={{
                      background: "none",
                      border: "none",
                      color: showLocalSearchInput || localSearchTerm ? "#F47738" : "#505A5F",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#F47738"}
                    onMouseLeave={(e) => e.currentTarget.style.color = showLocalSearchInput || localSearchTerm ? "#F47738" : "#505A5F"}
                    title={t("SEARCH_TABLE") || "Search in Table"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>

                  {/* Print Icon */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#505A5F",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#F47738"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#505A5F"}
                    title={t("PRINT_TABLE") || "Print"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                  </button>

                  {/* Columns Selection Dropdown Toggle Button */}
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{
                        background: "none",
                        border: "none",
                        color: isDropdownOpen ? "#F47738" : "#505A5F",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        transition: "color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#F47738"}
                      onMouseLeave={(e) => e.currentTarget.style.color = isDropdownOpen ? "#F47738" : "#505A5F"}
                      title={t("SHOW_HIDE_COLUMNS") || "Columns"}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                        <line x1="15" y1="3" x2="15" y2="21"></line>
                      </svg>
                    </button>

                    {isDropdownOpen && (
                      <React.Fragment>
                        <div 
                          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
                          onClick={() => setIsDropdownOpen(false)} 
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "32px",
                            right: "0px",
                            zIndex: "1000",
                            background: "#ffffff",
                            border: "1px solid #E4E7EB",
                            borderRadius: "6px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            padding: "12px",
                            minWidth: "220px",
                            animation: "fadeIn 0.15s ease-out",
                          }}
                        >
                          <div style={{ fontWeight: "700", fontSize: "13px", color: "#4A5568", marginBottom: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "6px" }}>
                            {t("SELECT_COLUMNS") || "Select Columns"}
                          </div>
                          {allColumnsList.map((col) => (
                            <label
                              key={col.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "6px 4px",
                                cursor: col.id === "applicationNo" ? "not-allowed" : "pointer",
                                fontSize: "14px",
                                color: col.id === "applicationNo" ? "#A0AEC0" : "#2D3748",
                                userSelect: "none",
                              }}
                            >
                              <input
                                type="checkbox"
                                disabled={col.id === "applicationNo"}
                                checked={visibleColumnIds.includes(col.id)}
                                onChange={() => toggleColumn(col.id)}
                                style={{
                                  cursor: col.id === "applicationNo" ? "not-allowed" : "pointer",
                                  accentColor: "#F47738",
                                }}
                              />
                              {col.label}
                            </label>
                          ))}
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                </div>
                
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  @keyframes slideIn {
                    from { transform: scaleX(0); opacity: 0; transform-origin: right; }
                    to { transform: scaleX(1); opacity: 1; transform-origin: right; }
                  }
                  @media print {
                    html, body, #root, #root > *, .app-container, .app-wrapper, main {
                      height: auto !important;
                      overflow: visible !important;
                    }
                    /* Completely collapse and hide layout panels and search forms to remove blank space */
                    header, footer, form, .sidebar, .header, .left-side-menu, .employee-card-wrapper {
                      display: none !important;
                      height: 0 !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    body * {
                      visibility: hidden !important;
                    }
                    #print-table-container, #print-table-container * {
                      visibility: visible !important;
                    }
                    #print-table-container {
                      position: relative !important;
                      width: 100%;
                      background: white !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      display: block !important;
                    }
                    .no-print, .no-print *, .pagination, .table-footer, .pagination-container {
                      display: none !important;
                      height: 0 !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    #print-table-container table:not(.print-only-table):not(.print-only-mobile-container table) {
                      display: none !important;
                    }
                    #print-table-container .print-only-table {
                      display: table !important;
                      width: 100% !important;
                      table-layout: auto !important;
                    }
                    #print-table-container .print-only-table tr {
                      page-break-inside: avoid !important;
                      break-inside: avoid !important;
                    }
                    #print-table-container .print-only-table th,
                    #print-table-container .print-only-table td {
                      padding: 6px 8px !important;
                      font-size: 11px !important;
                      word-break: break-all !important;
                      white-space: normal !important;
                    }
                    #print-table-container .print-only-mobile-container {
                      display: block !important;
                      width: 100% !important;
                    }
                    #print-table-container .print-only-mobile-container table {
                      display: table !important;
                      width: 100% !important;
                    }
                    #print-table-container .print-only-mobile-container tr {
                      page-break-inside: avoid !important;
                      break-inside: avoid !important;
                    }
                  }
                `}</style>
              </div>
              
              {/* Desktop Wide Screen View */}
              {!isSmallScreen && (
                <div className="no-print">
                  <Table
                    t={t}
                    data={filteredData.slice(currPage * Number(getValues("limit")), (currPage + 1) * Number(getValues("limit")))}
                    columns={filteredColumns}
                    getCellProps={(cellInfo) => {
                      return {
                        style: {
                          minWidth: cellInfo.column.Header === t("ES_INBOX_APPLICATION_NO") ? "240px" : "",
                          padding: "20px 18px",
                          fontSize: "16px",
                        },
                      };
                    }}
                    onPageSizeChange={onPageSizeChange}
                    currentPage={currPage}
                    onNextPage={nextPage}
                    onPrevPage={previousPage}
                    pageSizeLimit={Number(getValues("limit"))}
                    onSort={onSort}
                    totalRecords={Count}
                    disableSort={false}
                    onLastPage={fetchLastPage}
                    onFirstPage={fetchFirstPage}
                    sortParams={[{ id: getValues("sortBy"), desc: getValues("sortOrder") === "DESC" ? true : false }]}
                  />
                </div>
              )}

              {/* Mobile / Small Screen Card List View */}
              {isSmallScreen && (
                <div className="no-print" style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #E4E7EB", borderTop: "none" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                    <tbody>
                      {filteredData.slice(currPage * 10, (currPage + 1) * 10).map((row, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                          {/* Visual separation spacer bar between records */}
                          {rowIndex > 0 && (
                            <tr style={{ background: "#F4F5F6", height: "16px" }}>
                              <td colSpan="2" style={{ padding: 0, height: "16px", borderBottom: "1px solid #E4E7EB" }} />
                            </tr>
                          )}
                          {filteredColumns.map((col, colIndex) => {
                            let cellValue = "-";
                            if (col.Cell) {
                              const rowProps = { original: row };
                              cellValue = col.Cell({ row: rowProps });
                            } else if (typeof col.accessor === "function") {
                              cellValue = col.accessor(row);
                            } else if (col.accessor) {
                              cellValue = row[col.accessor];
                            }
                            
                            return (
                              <tr 
                                key={col.id} 
                                style={{ 
                                  borderBottom: "1px solid #E4E7EB"
                                }}
                              >
                                <td 
                                  style={{ 
                                    padding: "12px 20px", 
                                    fontSize: "14px", 
                                    fontWeight: "600",
                                    color: "#505A5F", 
                                    width: "45%",
                                    textAlign: "left",
                                    verticalAlign: "middle"
                                  }}
                                >
                                  {col.Header}
                                </td>
                                <td 
                                  style={{ 
                                    padding: "12px 20px", 
                                    fontSize: "14px", 
                                    color: "#0B0C0C", 
                                    width: "55%",
                                    textAlign: "left",
                                    verticalAlign: "middle"
                                  }}
                                >
                                  {cellValue}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile View Pagination Controls */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#fff" }}>
                    <button 
                      onClick={previousPage} 
                      disabled={currPage === 0}
                      style={{
                        padding: "8px 16px",
                        background: currPage === 0 ? "#E4E7EB" : "#F47738",
                        color: currPage === 0 ? "#A0AEC0" : "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: currPage === 0 ? "not-allowed" : "pointer",
                        fontWeight: "600"
                      }}
                    >
                      {t("COMMON_PREV") || "Previous"}
                    </button>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#505A5F" }}>
                      {currPage + 1}
                    </span>
                    <button 
                      onClick={nextPage} 
                      disabled={Count && (currPage + 1) * 10 >= Count}
                      style={{
                        padding: "8px 16px",
                        background: Count && (currPage + 1) * 10 >= Count ? "#E4E7EB" : "#F47738",
                        color: Count && (currPage + 1) * 10 >= Count ? "#A0AEC0" : "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: Count && (currPage + 1) * 10 >= Count ? "not-allowed" : "pointer",
                        fontWeight: "600"
                      }}
                    >
                      {t("COMMON_NEXT") || "Next"}
                    </button>
                  </div>
                </div>
              )}
              
              {isSmallScreen ? (
                <div 
                  className="print-only-mobile-container"
                  style={{
                    display: "none",
                    width: "100%"
                  }}
                >
                  {filteredData.map((row, rowIndex) => (
                    <table 
                      key={rowIndex}
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: rowIndex === 0 ? "0px" : "24px",
                        border: "1px solid #E4E7EB",
                        background: "#fff",
                        pageBreakInside: "avoid",
                        breakInside: "avoid"
                      }}
                    >
                      <tbody>
                        {filteredColumns.map((col) => {
                          let cellValue = "-";
                          if (col.Cell) {
                            const rowProps = { original: row };
                            cellValue = col.Cell({ row: rowProps });
                          } else if (typeof col.accessor === "function") {
                            cellValue = col.accessor(row);
                          } else if (col.accessor) {
                            cellValue = row[col.accessor];
                          }
                          
                          return (
                            <tr key={col.id} style={{ borderBottom: "1px solid #E4E7EB" }}>
                              <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#505A5F", width: "45%", borderRight: "1px solid #E4E7EB" }}>
                                {col.Header}
                              </td>
                              <td style={{ padding: "12px 16px", fontSize: "14px", color: "#0B0C0C", width: "55%" }}>
                                {cellValue}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ))}
                </div>
              ) : (
                <table 
                  className="print-only-table"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "20px",
                    display: "none",
                    background: "#fff"
                  }}
                >
                  <thead>
                    <tr style={{ background: "#F4F5F6", borderBottom: "2px solid #E4E7EB" }}>
                      {filteredColumns.map((col) => (
                        <th 
                          key={col.id} 
                          style={{ 
                            padding: "12px 16px", 
                            textAlign: "left", 
                            fontWeight: "700", 
                            fontSize: "14px", 
                            color: "#505A5F",
                            border: "1px solid #E4E7EB"
                          }}
                        >
                          {col.Header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, rowIndex) => (
                      <tr 
                        key={rowIndex} 
                        style={{ 
                          borderBottom: "1px solid #E4E7EB",
                          background: rowIndex % 2 === 0 ? "#fff" : "#F9FAFB" 
                        }}
                      >
                        {filteredColumns.map((col) => {
                          let cellValue = "-";
                          if (col.Cell) {
                            const rowProps = { original: row };
                            cellValue = col.Cell({ row: rowProps });
                          } else if (typeof col.accessor === "function") {
                            cellValue = col.accessor(row);
                          } else if (col.accessor) {
                            cellValue = row[col.accessor];
                          }
                          
                          return (
                            <td 
                              key={col.id} 
                              style={{ 
                                padding: "12px 16px", 
                                fontSize: "14px", 
                                color: "#0B0C0C",
                                border: "1px solid #E4E7EB"
                              }}
                            >
                              {cellValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </React.Fragment>
      );
    }
  };

  return (
    <React.Fragment>
      <SearchForm onSubmit={onSubmit} handleSubmit={handleSubmit}>
        <SearchFormFieldsComponent onSubmit={onSubmit} handleSubmit={handleSubmit} isMobileView={false} />
      </SearchForm>
      <TableComponent />
    </React.Fragment>
  );
};

export default SearchApplicationDesktopView;
