import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ApplicationTable from "../inbox/ApplicationTable";
import { Card, Loader, SearchIcon } from "@mseva/digit-ui-react-components";
import InboxLinks from "../inbox/ApplicationLinks";
import SearchApplication from "./search";
import { Link } from "react-router-dom";

const DesktopInbox = ({ tableConfig, filterComponent, ...props }) => {
  const { t } = useTranslation();
  const tenantIds = Digit.SessionStorage.get("HRMS_TENANTS");
  const GetCell = (value) => <span className="cell-text">{t(value)}</span>;
  const GetSlaCell = (value) => {
    return value == "INACTIVE" ? (
      <span className="sla-cell-error">{t(value) || ""}</span>
    ) : (
      <span className="sla-cell-success">{t(value) || ""}</span>
    );
  };
  const employees = props?.data?.Employees;
  const [searchText, setSearchText] = useState("");

  const getLatestAssignment = (emp) => [...(emp?.assignments || [])].sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate))[0];

  const data = React.useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query || !employees) return employees;
    return employees.filter((emp) => {
      const assignment = getLatestAssignment(emp);
      const values = [
        emp?.code,
        emp?.user?.name,
        emp?.user?.mobileNumber,
        t("COMMON_MASTERS_DESIGNATION_" + assignment?.designation),
        t("COMMON_MASTERS_DEPARTMENT_" + assignment?.department),
        t(emp?.isActive ? "ACTIVE" : "INACTIVE"),
        ...(emp?.user?.roles || []).map((role) => t(`ACCESSCONTROL_ROLES_ROLES_${role.code}`)),
      ];
      return values.some((value) => value && String(value).toLowerCase().includes(query));
    });
  }, [employees, searchText]);

  const [FilterComponent, setComp] = useState(() => Digit.ComponentRegistryService?.getComponent(filterComponent));

  const columns = React.useMemo(() => {
    return [
      {
        Header: t("HR_EMP_ID_LABEL"),
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <span className="link">
              <Link to={`/digit-ui/employee/hrms/details/${row.original.tenantId}/${row.original.code}`}>{row.original.code}</Link>
            </span>
          );
        },
      },
      {
        Header: t("HR_EMP_NAME_LABEL"),
        disableSortBy: true,
        Cell: ({ row }) => {
          return GetCell(`${row.original?.user?.name}`);
        },
      },
      {
        Header: t("HR_ROLE_NO_LABEL"),
        Cell: ({ row }) => {
          return (
            <div className="tooltip">
              {" "}
              {GetCell(`${row.original?.user?.roles.length}`)}
              <span className="tooltiptext whitespace-nowrap">
                {row.original?.user?.roles.map((ele, index) => (
                  <span>
                    {`${index + 1}. ` + t(`ACCESSCONTROL_ROLES_ROLES_${ele.code}`)} <br />{" "}
                  </span>
                ))}
              </span>
            </div>
          );
        },
        disableSortBy: true,
      },
      {
        Header: t("HR_DESG_LABEL"),
        disableSortBy: true,
        Cell: ({ row }) => {
          return GetCell(
            `${
              t(
                "COMMON_MASTERS_DESIGNATION_" + row.original?.assignments?.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate))[0]?.designation
              ) || ""
            }`
          );
        },
      },
      {
        Header: t("HR_DEPT_LABEL"),
        disableSortBy: true,
        Cell: ({ row }) => {
          return GetCell(
            `${
              t(
                "COMMON_MASTERS_DEPARTMENT_" + row.original?.assignments?.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate))[0]?.department
              ) || ""
            }`
          );
        },
      },
      {
        Header: t("HR_STATUS_LABEL"),
        disableSortBy: true,
        Cell: ({ row }) => {
          return GetSlaCell(`${row.original?.isActive ? "ACTIVE" : "INACTIVE"}`);
        },
      },
    ];
  }, []);

  let result;
  if (props.isLoading) {
    result = <Loader />;
  } else if (data?.length === 0) {
    result = (
      <Card className="mt-5">
        {/* TODO Change localization key */}
        {t("COMMON_TABLE_NO_RECORD_FOUND")
          .split("\\n")
          .map((text, index) => (
            <p key={index} className="text-center">
              {text}
            </p>
          ))}
      </Card>
    );
  } else if (data?.length > 0) {
    result = (
      <ApplicationTable
        t={t}
        data={data}
        columns={columns}
        getCellProps={(cellInfo) => {
          return {
            className: `p-5 text-base min-w-[150px] ${cellInfo.column.Header == t("HR_EMP_ID_LABEL") ? "max-w-[150px]" : ""}`,
          };
        }}
        onPageSizeChange={props.onPageSizeChange}
        currentPage={props.currentPage}
        onNextPage={props.onNextPage}
        onPrevPage={props.onPrevPage}
        pageSizeLimit={props.pageSizeLimit}
        onSort={props.onSort}
        disableSort={props.disableSort}
        //onPageSizeChange={props.onPageSizeChange}
        sortParams={props.sortParams}
        totalRecords={props.totalRecords}
      />
    );
  }

  return (
    <div className="inbox-container">
      {!props.isSearch && (
        <div className="filters-container">
          <InboxLinks parentRoute={props.parentRoute} allLinks={[]} headerText={"HRMS"} businessService={props.businessService} />
          <div>
            {
              <FilterComponent
                defaultSearchParams={props.defaultSearchParams}
                onFilterChange={props.onFilterChange}
                searchParams={props.searchParams}
                type="desktop"
                tenantIds={tenantIds}
              />
            }
          </div>
        </div>
      )}
      <div style={{ flex: 1 }}>
        <SearchApplication
          defaultSearchParams={props.defaultSearchParams}
          onSearch={props.onSearch}
          type="desktop"
          tenantIds={tenantIds}
          searchFields={props.searchFields}
          isInboxPage={!props?.isSearch}
          searchParams={props.searchParams}
        />
        <div className={`result flex-1 ${!props?.isSearch ? "ml-6" : ""}`}>
          {employees?.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginBottom: "12px" }}>
              <div style={{ position: "relative", width: "260px", marginLeft: "auto" }}>
                <span
                  className="flex items-center pointer-events-none"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%) scale(0.85)", opacity: 0.7 }}
                >
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={t("HR_SEARCH_TABLE_PLACEHOLDER") !== "HR_SEARCH_TABLE_PLACEHOLDER" ? t("HR_SEARCH_TABLE_PLACEHOLDER") : "Search employees..."}
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 32px 0 36px",
                    fontSize: "14px",
                    color: "#0B0C0C",
                    background: "#FFFFFF",
                    border: "1px solid #D6D5D4",
                    borderRadius: "6px",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#F47738";
                    e.target.style.boxShadow = "0 0 0 3px rgba(244, 119, 56, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#D6D5D4";
                    e.target.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
                  }}
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText("")}
                    aria-label="Clear search"
                    className="flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", fontSize: "16px", lineHeight: 1 }}
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          )}
          {result}
        </div>
      </div>
    </div>
  );
};

export default DesktopInbox;
