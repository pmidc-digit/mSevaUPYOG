import React, { Fragment, useCallback, useMemo, useReducer, useState, useEffect } from "react"
import { CaseIcon, Header, Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { InboxTopBar, InboxWrapper, InboxPagination } from "../../../../../templates/Inbox/components";
import NewFilterFormFieldsComponent from "../../../../../templates/Inbox/NewFilterFormFieldsComponent";
import useInboxTableConfig from "./useInboxTableConfig";
import { Link } from "react-router-dom";

const Inbox = ({ parentRoute }) => {

  const { t } = useTranslation()
  const [error, setError] = useState({
    error: false,
    label: ""
  });
  const [activeStatusTab, setActiveStatusTab] = useState("ALL");
  const [topBarSearch, setTopBarSearch] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const isMobile = window.Digit.Utils.browser.isMobile();
  
  // const tenantId = Digit.ULBService.getStateId();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  const searchFormDefaultValues = {}

  const filterFormDefaultValues = {
    moduleName: "BPAREG",
    applicationStatus: [],
    businessService: null,
    locality: [],
    assignee: "ASSIGNED_TO_ALL",
    licenseType: [],
  }
  const tableOrderFormDefaultValues = {
    sortBy: "",
    limit: window.Digit.Utils.browser.isMobile()?50:10,
    offset: 0,
    sortOrder: "DESC"
  }

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("STAKEHOLDER.INBOX", { ...state, searchForm: payload.data })
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("STAKEHOLDER.INBOX", { ...state, filterForm: payload.data })
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("STAKEHOLDER.INBOX", { ...state, tableForm: payload.data })
        return { ...state, tableForm: payload.data };
      default:
        break;
    }
  }
  const InboxObjectInSessionStorage = Digit.SessionStorage.get("STAKEHOLDER.INBOX")

  const onSearchFormReset = (setSearchFormValue) => {
    setSearchFormValue("mobileNumber", null);
    setSearchFormValue("applicationNo", null);
    dispatch({action: "mutateSearchForm", data: searchFormDefaultValues});
  }

  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("moduleName", "BPAREG");
    // setFilterFormValue("businessService", {code: "BPA", name:t("BPA")});
    setFilterFormValue("applicationStatus", "");
    setFilterFormValue("locality", []);
    setFilterFormValue("assignee", "ASSIGNED_TO_ALL");
    setFilterFormValue("licenseType", []);
    dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues });
  }
  
  const onSortFormReset = (setSortFormValue) => {
    setSortFormValue("sortOrder", "DESC")
    dispatch({action: "mutateTableForm", data: tableOrderFormDefaultValues})
  }

  const formInitValue = useMemo(() => {
    return InboxObjectInSessionStorage || {
      filterForm: filterFormDefaultValues,
      searchForm: searchFormDefaultValues,
      tableForm: tableOrderFormDefaultValues
    }
  }
    , [Object.values(InboxObjectInSessionStorage?.filterForm || {}), Object.values(InboxObjectInSessionStorage?.searchForm || {}), Object.values(InboxObjectInSessionStorage?.tableForm || {})])

  const [formState, dispatch] = useReducer(formReducer, formInitValue)
  const onPageSizeChange = (e) => {
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: e.target.value } })
  }

  const onSortingByData = (e) => {
    if(e.length > 0){
      const [{id, desc}] = e
      const sortOrder = desc ? "DESC" : "ASC"
      const sortBy = id
      if(!(formState.tableForm.sortBy === sortBy && formState.tableForm.sortOrder === sortOrder)){
        dispatch({action: "mutateTableForm", data:{ ...formState.tableForm, sortBy: id, sortOrder: desc ? "DESC" : "ASC" }})
      }
    }
  }

  const onMobileSortOrderData = (data) => {
    const {sortOrder} = data
    dispatch({action: "mutateTableForm", data:{ ...formState.tableForm, sortOrder }})
  }

  const { data: localitiesForEmployeesCurrentTenant, isLoading: loadingLocalitiesForEmployeesCurrentTenant } = Digit.Hooks.useBoundaryLocalities("pb", "revenue", {}, t);

  const { isLoading: isInboxLoading, data: { table, statuses, totalCount } = {}, isError } = Digit.Hooks.obps.useBPAInbox({
    tenantId: tenantId === "pb" ? "pb.punjab" : tenantId,
    filters: { 
      ...formState,
      searchForm: {
        ...formState.searchForm,
        ...(topBarSearch && { applicationNo: topBarSearch })
      }
    }
  });

  console.log("isInboxLoading", isInboxLoading, "table", table, "statuses", statuses, "totalCount", totalCount);

  const onNextPage = () => {
    dispatch({
      action: "mutateTableForm",
      data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) + parseInt(formState.tableForm?.limit) },
    });
  };

  const onPrevPage = () => {
    dispatch({
      action: "mutateTableForm",
      data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) - parseInt(formState.tableForm?.limit) },
    });
  };

  const onStatusTabClick = useCallback(
    (label, statusCode) => {
      setActiveStatusTab(statusCode || label);
      if (label === "CLEAR") {
        setTopBarSearch("");
        return;
      }
      if (label === "ALL") {
        dispatch({
          action: "mutateFilterForm",
          data: { ...formState.filterForm, applicationStatus: [] },
        });
        return;
      }
      const resolvedCode = statusCode || label;
      dispatch({
        action: "mutateFilterForm",
        data: { ...formState.filterForm, applicationStatus: [resolvedCode] },
      });
    },
    [formState.filterForm, dispatch]
  );

  const propsForInboxTable = useInboxTableConfig({ ...{ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData } });

  const {
    control: controlFilterForm,
    setValue: setFilterFormValue,
    getValues: getFilterFormValue,
  } = useForm({
    defaultValues: { ...filterFormDefaultValues },
  });

  useEffect(() => {
    if(isError) {
      setError({
        error: true,
        label: t("ES_OBPS_INBOX_ERROR")
      })
      setTimeout(() => {
        window.location.href = `/digit-ui/employee/`
      }, 5000)
    }
  },[isError])

  return (
    <>
      {!isError && (
        <>
          {/* Mobile Filter Drawer */}
          {isMobile && showFilterDrawer && (
            <div className="filter-drawer-overlay" onClick={() => setShowFilterDrawer(false)}>
              <div className="filter-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="filter-drawer-header">
                  <h3>{t("COMMON_FILTERS")}</h3>
                  <button 
                    className="filter-drawer-close" 
                    onClick={() => setShowFilterDrawer(false)}
                    aria-label="Close filters"
                  >
                    ✕
                  </button>
                </div>
                <div className="filter-drawer-content">
                  <NewFilterFormFieldsComponent
                    registerRef={() => {}}
                    controlFilterForm={controlFilterForm}
                    setFilterFormValue={setFilterFormValue}
                    filterFormState={formState?.filterForm}
                    getFilterFormValue={getFilterFormValue}
                    statuses={statuses}
                    isInboxLoading={isInboxLoading}
                    showLicenseTypeFilter={true}
                    handleFilter={(filterData) => {
                      dispatch({ 
                        action: "mutateFilterForm", 
                        data: { 
                          ...formState?.filterForm,
                          applicationStatus: filterData.applicationStatus?.map((item) => item.code) || [],
                          ...(filterData.locality ? { locality: filterData.locality } : {}),
                          ...(filterData.assignee ? { assignee: filterData.assignee } : {}),
                          ...(filterData.licenseType ? { licenseType: filterData.licenseType } : {}),
                        } 
                      });
                    }}
                  />
                </div>
                <div className="filter-drawer-footer">
                  <button 
                    className="filter-apply-btn"
                    onClick={() => setShowFilterDrawer(false)}
                  >
                    {t("COMMON_APPLY")}
                  </button>
                </div>
              </div>
            </div>
          )}

          <InboxWrapper
            title={t("ES_COMMON_INBOX")}
            totalCount={totalCount}
            filterSection={
              !isMobile ? (
                <NewFilterFormFieldsComponent
                  registerRef={() => {}}
                  controlFilterForm={controlFilterForm}
                  setFilterFormValue={setFilterFormValue}
                  filterFormState={formState?.filterForm}
                  getFilterFormValue={getFilterFormValue}
                  statuses={statuses}
                  isInboxLoading={isInboxLoading}
                  showLicenseTypeFilter={true}
                  handleFilter={(filterData) => {
                    dispatch({ 
                      action: "mutateFilterForm", 
                      data: { 
                        ...formState?.filterForm,
                        applicationStatus: filterData.applicationStatus?.map((item) => item?.code || item) || [],
                        ...(filterData.locality ? { locality: filterData.locality } : {}),
                        ...(filterData.assignee ? { assignee: filterData.assignee } : {}),
                        ...(filterData.licenseType ? { licenseType: filterData.licenseType } : {}),
                      } 
                    });
                  }}
                />
              ) : null
            }
            topBar={
              <div className="new-inbox-topbar">
                <div className="new-inbox-tabs">
                  {/* Assignee Buttons */}
                  {["ASSIGNED_TO_ME", "ASSIGNED_TO_ALL"].map((assigneeCode) => {
                    const assigneeLabel = assigneeCode === "ASSIGNED_TO_ME" ? t("ES_INBOX_ASSIGNED_TO_ME") : t("ES_INBOX_ASSIGNED_TO_ALL");
                    const isActive = formState.filterForm.assignee === assigneeCode;
                    return (
                      <button
                        key={assigneeCode}
                        type="button"
                        className={`new-inbox-tab ${isActive ? "new-inbox-tab-active" : ""}`}
                        onClick={() => {
                          dispatch({
                            action: "mutateFilterForm",
                            data: { ...formState.filterForm, assignee: assigneeCode }
                          });
                        }}
                      >
                        {assigneeLabel}
                      </button>
                    );
                  })}
                  
                  {/* License Type Buttons */}
                  {[
                    { code: "ARCHITECT", name: "Architect" },
                    { code: "ENGINEER", name: "Engineer" },
                    { code: "TOWNPLANNER", name: "Town Planner" },
                    { code: "SUPERVISOR", name: "Supervisor" },
                  ].map((licenseType) => {
                    const isActive = formState.filterForm.licenseType?.includes(licenseType.code);
                    return (
                      <button
                        key={licenseType.code}
                        type="button"
                        className={`new-inbox-tab ${isActive ? "new-inbox-tab-active" : ""}`}
                        onClick={() => {
                          const currentLicenseTypes = formState.filterForm.licenseType || [];
                          const newLicenseTypes = isActive
                            ? currentLicenseTypes.filter(code => code !== licenseType.code)
                            : [...currentLicenseTypes, licenseType.code];
                          dispatch({
                            action: "mutateFilterForm",
                            data: { ...formState.filterForm, licenseType: newLicenseTypes }
                          });
                        }}
                      >
                        {licenseType.name}
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="new-inbox-search">
                  <span aria-hidden="true" className="new-inbox-search-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="11" cy="11" r="7" stroke="#6B7280" strokeWidth="2" />
                      <line
                        x1="16.65"
                        y1="16.65"
                        x2="21"
                        y2="21"
                        stroke="#6B7280"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="new-inbox-search-input"
                    placeholder="Search by application number..."
                    value={topBarSearch}
                    onChange={(e) => setTopBarSearch(e.target.value)}
                  />
                </div>
              </div>
            }
            isLoading={isInboxLoading}
            tableData={table}
            tableProps={propsForInboxTable}
            tableHeader="Applications"
            pagination={
              <InboxPagination
                offset={formState.tableForm?.offset || 0}
                limit={formState.tableForm?.limit || 10}
                totalCount={totalCount}
                onPageSizeChange={onPageSizeChange}
                onNextPage={onNextPage}
                onPrevPage={onPrevPage}
              />
            }
          />
        </>
      )}
      {error.error && <Toast error label={error.label} onClose={() => setError({ error: false, label: "" })} />}
    </>
  );
}

export default Inbox