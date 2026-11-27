import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, RemoveableTag, SearchIcon } from "@mseva/digit-ui-react-components";
import { InboxWrapper } from "../../../../templates/Inbox/components";
import { Link } from "react-router-dom";

const getRoleDisplayName = (role, t) => {
  if (!role) return "N/A";
  if (role.labelKey) {
    const translated = t(role.labelKey);
    if (translated !== role.labelKey) return translated;
  }
  if (role.code) {
    const normalizedCode = role.code.replace(/\s+/g, "_").toUpperCase();
    const translationKey = `ACCESSCONTROL_ROLES_ROLES_${normalizedCode}`;
    const translated = t(translationKey);
    if (translated !== translationKey) return translated;
  }
  return role.name || role.code || "N/A";
};

const DesktopInbox = ({ tableConfig, filterComponent, ...props }) => {
  const { t } = useTranslation();
  const storedTenantIds = Digit.SessionStorage.get("HRMS_TENANTS");
  const { data: tenantsData } = Digit.Hooks.useTenants();
  const currentUlB = Digit.ULBService.getCurrentTenantId();
  const isStateLevelTenant = currentUlB === "pb.punjab";
  const cityChange = Digit.SessionStorage.get("Employee.tenantId");

  const statusOptions = useMemo(
    () => [
      { code: true, name: t("HR_ACTIVATE_HEAD") || "Active" },
      { code: false, name: t("HR_DEACTIVATE_HEAD") || "Inactive" },
    ],
    [t]
  );

  const mappedTenantOptions = useMemo(() => {
    const list = tenantsData && tenantsData.length > 0 ? tenantsData : storedTenantIds || [];
    return [...list]
      .sort((x, y) => x?.name?.localeCompare(y?.name))
      .map((city) => ({
        ...city,
        i18text: Digit.Utils.locale.getCityLocale(city.code) || city.name || city.code,
      }));
  }, [tenantsData, storedTenantIds]);

  const [selectedTenant, setSelectedTenant] = useState(() => {
    const initialCode =
      props?.searchParams?.tenantId ||
      (currentUlB === "pb.punjab" ? Digit.SessionStorage.get("punjab-tenantId") || "pb.amritsar" : currentUlB);
    return { code: initialCode };
  });

  useEffect(() => {
    if (!mappedTenantOptions.length) return;
    const changeCity = cityChange || currentUlB;
    let targetCode = changeCity;
    if (changeCity === "pb.punjab") {
      targetCode = Digit.SessionStorage.get("punjab-tenantId") || "pb.amritsar";
      Digit.SessionStorage.set("punjab-tenantId", targetCode);
    }
    const matching = mappedTenantOptions.find((ele) => ele.code === targetCode);
    if (matching && (!selectedTenant?.i18text || matching.code !== selectedTenant?.code)) {
      setSelectedTenant(matching);
    }
  }, [mappedTenantOptions, cityChange, currentUlB]);

  const activeTenantCode = selectedTenant?.code || props?.searchParams?.tenantId || currentUlB;
  const { data: mdmsData } = Digit.Hooks.hrms.useHrmsMDMS(activeTenantCode, "egov-hrms", "HRMSRolesandDesignation");

  // Unified filter + search states
  const [department, setDepartment] = useState(null);
  const [selectedRolesList, setSelectedRolesList] = useState([]);
  const [employeeStatus, setEmployeeStatus] = useState(() => statusOptions[0]);
  const [nameInput, setNameInput] = useState(props?.searchParams?.names || "");
  const [phoneInput, setPhoneInput] = useState(props?.searchParams?.phone || "");
  const [codeInput, setCodeInput] = useState(props?.searchParams?.codes || "");
  const [designation, setDesignation] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [quickSearchCache, setQuickSearchCache] = useState({ key: null, employees: null });

  const isQuickSearchActive = Boolean(searchText.trim());
  const quickSearchFilterKey = useMemo(
    () => JSON.stringify({ tenant: activeTenantCode, params: props.searchParams || {} }),
    [activeTenantCode, props.searchParams]
  );

  useEffect(() => {
    if (!isQuickSearchActive || quickSearchCache.key === quickSearchFilterKey) return;
    let cancelled = false;
    const fetchLimit = Math.max(1000, Number(props.totalRecords) || 1000);
    Digit.HRMSService.search(activeTenantCode, { limit: fetchLimit, offset: 0 }, props.searchParams || {})
      .then((response) => {
        if (!cancelled) {
          setQuickSearchCache({ key: quickSearchFilterKey, employees: response?.Employees || [] });
        }
      })
      .catch(() => {
        // Fall back to current-page employees if background full fetch fails
      });
    return () => {
      cancelled = true;
    };
  }, [isQuickSearchActive, quickSearchCache.key, quickSearchFilterKey, activeTenantCode, props.searchParams, props.totalRecords]);

  const departmentOptions = useMemo(
    () => Digit.Utils.locale.convertToLocaleData(mdmsData?.MdmsRes?.["common-masters"]?.Department, "COMMON_MASTERS_DEPARTMENT") || [],
    [mdmsData]
  );

  const roleOptions = useMemo(
    () =>
      (mdmsData?.MdmsRes?.["ACCESSCONTROL-ROLES"]?.roles || []).map((role) => ({
        ...role,
        i18text: getRoleDisplayName(role, t),
        code: role.code,
      })),
    [mdmsData, t]
  );

  const designationOptions = useMemo(() => {
    const list = mdmsData?.MdmsRes?.["common-masters"]?.Designation;
    if (!list) return [];
    return list
      .filter((desig) => desig.active)
      .map((desig) => {
        const key = `COMMON_MASTERS_DESIGNATION_${desig.code}`;
        const translated = t(key);
        return {
          code: desig.code,
          name: desig.name,
          i18text: translated !== key ? translated : desig.name,
        };
      })
      .sort((a, b) => a.i18text.localeCompare(b.i18text));
  }, [mdmsData, t]);

  const roleDropdownSelected = useMemo(() => {
    if (selectedRolesList.length > 1) return { i18text: `${selectedRolesList.length} selected` };
    return selectedRolesList[0] || { i18text: " ", code: "" };
  }, [selectedRolesList]);

  const handleSelectTenant = (val) => {
    if (!isStateLevelTenant || !val) return;
    Digit.SessionStorage.set("punjab-tenantId", val.code);
    setSelectedTenant(val);
  };

  const handleSelectRole = (val) => {
    if (!val?.code) return;
    setSelectedRolesList((prev) => (prev.some((r) => r.code === val.code) ? prev : [...prev, val]));
  };

  const handleRemoveRole = (index) => {
    setSelectedRolesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const deleteKeys = [];
    const nextParams = {};

    if (!props.isSearch) {
      if (selectedTenant?.code) nextParams.tenantId = selectedTenant.code;
      else deleteKeys.push("tenantId");

      if (department?.code) nextParams.departments = department.code;
      else deleteKeys.push("departments");

      if (selectedRolesList.length > 0) nextParams.roles = selectedRolesList.map((r) => r.code).join(",");
      else deleteKeys.push("roles");

      if (employeeStatus !== null && employeeStatus !== undefined) nextParams.isActive = employeeStatus.code;
      else deleteKeys.push("isActive");
    }

    const trimmedName = String(nameInput || "").trim();
    const trimmedPhone = String(phoneInput || "").replace(/\D/g, "");
    const trimmedCode = String(codeInput || "").trim();

    if (trimmedName) nextParams.names = trimmedName;
    else deleteKeys.push("names");

    if (trimmedPhone) nextParams.phone = trimmedPhone;
    else deleteKeys.push("phone");

    if (trimmedCode) nextParams.codes = trimmedCode;
    else deleteKeys.push("codes");

    if (designation?.code) nextParams.designations = designation.code;
    else deleteKeys.push("designations");

    props.onSearch({ ...nextParams, delete: deleteKeys });
  };

  const handleClearAll = () => {
    setDepartment(null);
    setSelectedRolesList([]);
    setEmployeeStatus(statusOptions[0]);
    setNameInput("");
    setPhoneInput("");
    setCodeInput("");
    setDesignation(null);
    setSearchText("");

    let resetCode = currentUlB;
    if (currentUlB === "pb.punjab") {
      resetCode = "pb.amritsar";
      Digit.SessionStorage.set("punjab-tenantId", resetCode);
    }
    const resetTenant = mappedTenantOptions.find((ele) => ele.code === resetCode);
    if (resetTenant) setSelectedTenant(resetTenant);

    const keysToDelete = Object.keys(props?.searchParams || {}).filter((k) => k !== "isActive");
    props.onSearch({ isActive: true, delete: keysToDelete });
  };

  const employees = props?.data?.Employees;
  const sourceEmployees =
    isQuickSearchActive && quickSearchCache.key === quickSearchFilterKey && Array.isArray(quickSearchCache.employees)
      ? quickSearchCache.employees
      : employees;
  const getLatestAssignment = (emp) => [...(emp?.assignments || [])].sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate))[0];

  const data = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query || !sourceEmployees) return employees;
    return sourceEmployees.filter((emp) => {
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
  }, [employees, sourceEmployees, searchText, t]);

  const GetCell = (value) => (
    <span className="cell-text">{value !== undefined && value !== null && String(value).trim() !== "" ? t(value) : "N/A"}</span>
  );
  const GetSlaCell = (value) =>
    value == "INACTIVE" ? <span className="sla-cell-error">{t(value) || ""}</span> : <span className="sla-cell-success">{t(value) || ""}</span>;

  const columns = useMemo(
    () => [
      {
        Header: t("HR_EMP_ID_LABEL"),
        disableSortBy: true,
        exportValue: (row) => row?.code || "N/A",
        Cell: ({ row }) =>
          row.original?.code ? (
            <span className="link">
              <Link to={`/digit-ui/employee/hrms/details/${row.original.tenantId}/${row.original.code}`}>{row.original.code}</Link>
            </span>
          ) : (
            GetCell(null)
          ),
      },
      {
        Header: t("HR_EMP_NAME_LABEL"),
        disableSortBy: true,
        exportValue: (row) => row?.user?.name || "N/A",
        Cell: ({ row }) => GetCell(row.original?.user?.name),
      },
      {
        Header: t("HR_ROLE_NO_LABEL"),
        disableSortBy: true,
        exportValue: (row) => (Array.isArray(row?.user?.roles) ? String(row.user.roles.length) : "N/A"),
        Cell: ({ row }) => {
          const roles = row.original?.user?.roles;
          if (!Array.isArray(roles)) return GetCell(null);
          return (
            <div className="tooltip">
              {" "}
              {GetCell(String(roles.length))}
              {roles.length > 0 && (
                <span className="tooltiptext whitespace-nowrap">
                  {roles.map((ele, index) => (
                    <span key={index}>
                      {`${index + 1}. ` + t(`ACCESSCONTROL_ROLES_ROLES_${ele.code}`)} <br />{" "}
                    </span>
                  ))}
                </span>
              )}
            </div>
          );
        },
      },
      {
        Header: t("HR_DESG_LABEL"),
        disableSortBy: true,
        exportValue: (row) => {
          const desig = [...(row?.assignments || [])].sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate))[0]?.designation;
          return desig ? t(`COMMON_MASTERS_DESIGNATION_${desig}`) : "N/A";
        },
        Cell: ({ row }) => {
          const desig = [...(row.original?.assignments || [])].sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate))[0]?.designation;
          return GetCell(desig ? `COMMON_MASTERS_DESIGNATION_${desig}` : null);
        },
      },
      {
        Header: t("HR_DEPT_LABEL"),
        disableSortBy: true,
        exportValue: (row) => {
          const dept = [...(row?.assignments || [])].sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate))[0]?.department;
          return dept ? t(`COMMON_MASTERS_DEPARTMENT_${dept}`) : "N/A";
        },
        Cell: ({ row }) => {
          const dept = [...(row.original?.assignments || [])].sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate))[0]?.department;
          return GetCell(dept ? `COMMON_MASTERS_DEPARTMENT_${dept}` : null);
        },
      },
      {
        Header: t("HR_STATUS_LABEL"),
        disableSortBy: true,
        exportValue: (row) => (row?.isActive === undefined || row?.isActive === null ? "N/A" : t(row.isActive ? "ACTIVE" : "INACTIVE")),
        Cell: ({ row }) =>
          row.original?.isActive === undefined || row.original?.isActive === null
            ? GetCell(null)
            : GetSlaCell(row.original.isActive ? "ACTIVE" : "INACTIVE"),
      },
    ],
    [t]
  );

  const fetchAllEmployeesForExport = useCallback(async () => {
    if (quickSearchCache.key === quickSearchFilterKey && Array.isArray(quickSearchCache.employees)) {
      return quickSearchCache.employees;
    }
    try {
      const fetchLimit = Math.max(1000, Number(props.totalRecords) || 1000);
      const response = await Digit.HRMSService.search(activeTenantCode, { limit: fetchLimit, offset: 0 }, props.searchParams || {});
      return response?.Employees || [];
    } catch (e) {
      return data || [];
    }
  }, [activeTenantCode, props.searchParams, props.totalRecords, quickSearchCache, quickSearchFilterKey, data]);

  const tableData = data || [];

  const translateOrFallback = (key, fallback) => {
    const val = t(key);
    return val && val !== key ? val : fallback;
  };

  const tableProps = {
    key: isQuickSearchActive ? `quick-search-${props.pageSizeLimit}` : props.pageSizeLimit,
    data: tableData,
    columns,
    getCellProps: (cellInfo) => ({
      className: `p-5 text-base min-w-[150px] ${cellInfo.column.Header == t("HR_EMP_ID_LABEL") ? "max-w-[150px]" : ""}`,
    }),
    isPaginationRequired: true,
    manualPagination: !isQuickSearchActive,
    onPageSizeChange: props.onPageSizeChange,
    currentPage: props.currentPage,
    onNextPage: props.onNextPage,
    onPrevPage: props.onPrevPage,
    pageSizeLimit: props.pageSizeLimit,
    onSort: props.onSort,
    disableSort: props.disableSort,
    sortParams: props.sortParams,
    totalRecords: isQuickSearchActive ? tableData.length : props.totalRecords,
    customTableWrapperClassName: "hrms-new-inbox-table-wrapper",
  };

  const topBar = (
    <form className="new-inbox-topbar pt-new-inbox-search hrms-unified-card" onSubmit={handleSearchSubmit}>
      {!props.isSearch && (
        <div className="hrms-unified-row hrms-unified-row--filters">
          <div className="hrms-unified-field">
            <label className="hrms-unified-label">{t("HR_CITY_LABEL") || t("HR_ULB_LABEL")}</label>
            <Dropdown
              option={mappedTenantOptions}
              selected={selectedTenant}
              select={handleSelectTenant}
              optionKey="i18text"
              t={t}
              disable={!isStateLevelTenant}
            />
          </div>
          <div className="hrms-unified-field">
            <label className="hrms-unified-label">{t("HR_COMMON_TABLE_COL_DEPT")}</label>
            <Dropdown
              option={departmentOptions}
              selected={department}
              select={setDepartment}
              optionKey="i18text"
              t={t}
              placeholder={t("Select")}
            />
          </div>
          <div className="hrms-unified-field">
            <label className="hrms-unified-label">{t("HR_COMMON_TABLE_COL_ROLE")}</label>
            <Dropdown
              option={roleOptions}
              selected={roleDropdownSelected}
              select={handleSelectRole}
              optionKey="i18text"
              t={t}
              placeholder={t("Select")}
            />
          </div>
          <div className="hrms-unified-field">
            <label className="hrms-unified-label">{t("HR_EMP_STATUS_LABEL")}</label>
            <Dropdown
              option={statusOptions}
              selected={employeeStatus}
              select={setEmployeeStatus}
              optionKey="name"
              t={t}
            />
          </div>
        </div>
      )}

      {!props.isSearch && selectedRolesList.length > 0 && (
        <div className="tag-container hrms-selected-roles-strip">
          {selectedRolesList.map((role, index) => (
            <RemoveableTag
              key={role.code || index}
              text={`${String(role.i18text || "").slice(0, 22)}${String(role.i18text || "").length > 22 ? " ..." : ""}`}
              onClick={() => handleRemoveRole(index)}
            />
          ))}
        </div>
      )}

      <div className="hrms-unified-row hrms-unified-row--search">
        <div className="hrms-unified-field">
          <label className="hrms-unified-label">{t("HR_NAME_LABEL")}</label>
          <input
            type="text"
            className="hrms-unified-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder={translateOrFallback("HR_NAME_PLACEHOLDER", "Enter Employee Name")}
          />
        </div>
        <div className="hrms-unified-field">
          <label className="hrms-unified-label">{t("HR_MOB_NO_LABEL")}</label>
          <div className="hrms-unified-phone-wrap">
            <span className="hrms-unified-phone-prefix">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className="hrms-unified-input hrms-unified-phone-input"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
              placeholder={translateOrFallback("HR_PHONE_PLACEHOLDER", "Enter Mobile Number")}
            />
          </div>
        </div>
        <div className="hrms-unified-field">
          <label className="hrms-unified-label">{t("HR_EMPLOYEE_ID_LABEL")}</label>
          <input
            type="text"
            className="hrms-unified-input"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder={translateOrFallback("HR_EMPLOYEE_ID_PLACEHOLDER", "Enter Employee ID")}
          />
        </div>
        <div className="hrms-unified-field">
          <label className="hrms-unified-label">{t("HR_EMPLOYEE_DESG_LABEL")}</label>
          <Dropdown
            option={designationOptions}
            selected={designation}
            select={setDesignation}
            optionKey="i18text"
            t={t}
            placeholder={translateOrFallback("HR_SELECT_DESIGNATION", "Select Designation")}
          />
        </div>
        <div className="hrms-unified-actions">
          <button type="submit" className="pt-new-inbox-search-button">
            {t("ES_COMMON_SEARCH")}
          </button>
          <button type="button" className="pt-new-inbox-clear-button" onClick={handleClearAll}>
            {t("HR_COMMON_CLEAR_SEARCH")}
          </button>
        </div>
      </div>
    </form>
  );

  const tableSearchInput =
    employees?.length > 0 ? (
      <div className="new-inbox-search hrms-table-quick-search">
        <SearchIcon />
        <input
          type="text"
          className="new-inbox-search-input"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t("HR_SEARCH_TABLE_PLACEHOLDER") !== "HR_SEARCH_TABLE_PLACEHOLDER" ? t("HR_SEARCH_TABLE_PLACEHOLDER") : "Search employees..."}
        />
        {searchText && (
          <button
            type="button"
            onClick={() => setSearchText("")}
            aria-label="Clear search"
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#64748b", fontSize: "15px", lineHeight: 1 }}
          >
            &times;
          </button>
        )}
      </div>
    ) : null;

  return (
    <React.Fragment>
      <style>{`
        /* Keep HRMS Breadcrumb horizontal even when pinned on scroll */
        .hrms-breadcrumb-wrapper .inbox-sticky-breadcrumbs.is-pinned {
          width: 100% !important;
          padding: 10px 24px !important;
          z-index: 999 !important;
        }
        .hrms-breadcrumb-wrapper .bread-crumb {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          gap: 6px !important;
          white-space: nowrap !important;
        }
        .hrms-breadcrumb-wrapper .bread-crumb li {
          display: inline-flex !important;
          align-items: center !important;
          width: auto !important;
        }

        /* Single Unified Card matching PT design */
        .hrms-unified-card {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 14px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .hrms-unified-row {
          display: grid;
          gap: 12px;
          align-items: start;
          width: 100%;
        }
        .hrms-unified-row--filters {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          padding-bottom: 12px;
          border-bottom: 1px solid #eef2f7;
        }
        .hrms-selected-roles-strip {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          width: 100%;
          padding: 8px 12px;
          background: #f0f6ff;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          box-sizing: border-box;
        }
        .hrms-selected-roles-strip .tag {
          margin: 0 !important;
        }
        .hrms-unified-row--search {
          grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
        }
        @media (max-width: 1100px) {
          .hrms-unified-row--filters,
          .hrms-unified-row--search {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .hrms-unified-actions {
            padding-top: 0 !important;
            grid-column: 1 / -1;
          }
        }
        .hrms-unified-field {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .hrms-unified-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e3a8a;
          line-height: 18px;
          margin: 0 0 6px 0;
        }
        .hrms-unified-input {
          box-sizing: border-box !important;
          width: 100% !important;
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          padding: 0 12px !important;
          border: 1px solid #c6d4e5 !important;
          border-radius: 8px !important;
          background: #ffffff !important;
          color: #0b0c0c !important;
          font: inherit;
          font-size: 0.88rem !important;
          outline: none !important;
        }
        .hrms-unified-input:focus {
          border-color: #1d4ed8 !important;
        }
        .hrms-unified-phone-wrap {
          display: flex;
          align-items: center;
          width: 100%;
          height: 42px;
        }
        .hrms-unified-phone-prefix {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 42px;
          padding: 0 10px;
          background: #f8fafc;
          border: 1px solid #c6d4e5;
          border-right: none;
          border-radius: 8px 0 0 8px;
          color: #475569;
          font-weight: 600;
          font-size: 0.84rem;
          box-sizing: border-box;
        }
        .hrms-unified-phone-input {
          border-radius: 0 8px 8px 0 !important;
        }
        .hrms-unified-card .select-wrap {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
        .hrms-unified-card .select,
        .hrms-unified-card .select-active {
          width: 100% !important;
          min-width: 0 !important;
          height: 42px !important;
          min-height: 42px !important;
          max-height: 42px !important;
          margin: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          border: 1px solid #c6d4e5 !important;
          border-radius: 8px !important;
          background: #ffffff !important;
          box-sizing: border-box !important;
          display: flex !important;
          align-items: center !important;
        }
        .hrms-unified-card .select-active {
          border-color: #1d4ed8 !important;
        }
        .hrms-unified-card .select input,
        .hrms-unified-card .select-active input {
          height: 100% !important;
          min-height: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          margin: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        .hrms-unified-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 24px;
          flex: 0 0 auto;
        }
        .hrms-unified-actions .pt-new-inbox-search-button,
        .hrms-unified-actions .pt-new-inbox-clear-button {
          height: 42px !important;
          min-height: 42px !important;
          white-space: nowrap;
        }
        .hrms-table-quick-search {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          min-width: 260px !important;
          height: 36px !important;
          padding: 0 12px !important;
          border: 1px solid #c6d4e5 !important;
          border-radius: 8px !important;
          background: #ffffff !important;
          box-sizing: border-box !important;
        }
        .hrms-table-quick-search svg {
          flex-shrink: 0 !important;
          position: static !important;
          margin: 0 !important;
        }
        .hrms-table-quick-search .new-inbox-search-input,
        .hrms-table-quick-search input {
          flex: 1 1 auto !important;
          min-width: 0 !important;
          width: 100% !important;
          height: 32px !important;
          min-height: 0 !important;
          padding: 0 4px !important;
          margin: 0 !important;
          border: none !important;
          outline: none !important;
          background: transparent !important;
          font-size: 0.85rem !important;
          color: #0b0c0c !important;
          box-shadow: none !important;
        }
      `}</style>
      <InboxWrapper
        title={!props.isSearch ? t("HR_HOME_SEARCH_RESULTS_HEADING") : t("ES_COMMON_SEARCH")}
        totalCount={searchText.trim() ? tableData.length : props.badgeCount ?? props.totalRecords ?? tableData.length ?? 0}
        isLoading={props.isLoading}
        tableData={tableData}
        tableProps={tableProps}
        tableHeader="HR_HOME_SEARCH_RESULTS_HEADING"
        emptyMessage={t("COMMON_TABLE_NO_RECORD_FOUND").replace(/\\n/g, " ")}
        topBar={topBar}
        tableHeaderAction={tableSearchInput}
        fetchAllData={fetchAllEmployeesForExport}
        showExport={true}
        showTableOnEmpty={true}
        showSkeletonOnLoad={true}
        skeletonRows={Math.min(props.pageSizeLimit || 8, 10)}
      />
    </React.Fragment>
  );
};

export default DesktopInbox;
