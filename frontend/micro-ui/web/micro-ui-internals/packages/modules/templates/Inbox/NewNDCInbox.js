import React, { useCallback, useMemo, useReducer, useState, useEffect } from "react";
import {
  InboxComposer,
  ComplaintIcon,
  Header,
  FilterForm,
  Loader,
  Card,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import NewSearchFormFieldsComponent from "./NewSearchFormFieldsComponent";
import NewFilterFormFieldsComponent from "./NewFilterFormFieldsComponent";
import NewNDCInboxTable from "./NewNDCInboxTable";
import useNewInboxTableConfig from "./useNewInboxTableConfig";
import useNewInboxMobileCardsData from "./useNewInboxMobileCardsData";
import { businessServiceList } from "../../ndc/src/utils";
import { useForm } from "react-hook-form";

const NewNDCInbox = ({ parentRoute }) => {
  const { t } = useTranslation();

  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const [getFilter, setFilter] = useState();
  const [activeStatusTab, setActiveStatusTab] = useState("ALL");
  const [topBarSearch, setTopBarSearch] = useState("");

  const searchFormDefaultValues = {};

  const filterFormDefaultValues = {
    moduleName: "ndc-services",
    applicationStatus: [],
    businessService: null,
    locality: [],
    assignee: "ASSIGNED_TO_ALL",
    businessServiceArray: businessServiceList(true) || [],
  };
  const tableOrderFormDefaultValues = {
    sortBy: "",
    limit: window.Digit.Utils.browser.isMobile() ? 50 : 10,
    offset: 0,
    sortOrder: "DESC",
  };

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("NDC.NEW_INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("NDC.NEW_INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("NDC.NEW_INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      default:
        break;
    }
  }
  const InboxObjectInSessionStorage = Digit.SessionStorage.get("NDC.NEW_INBOX");

  const onSearchFormReset = (setSearchFormValue) => {
    setSearchFormValue("sourceRefId", null);
    setSearchFormValue("applicationNo", null);
    setSearchFormValue("mobileNumber", null);
    dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues });
  };

  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("moduleName", "bpa-services");
    setFilterFormValue("applicationStatus", "");
    setFilterFormValue("locality", []);
    setFilterFormValue("assignee", "ASSIGNED_TO_ALL");
    setFilterFormValue("applicationType", []);
    dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues });
  };

  const onSortFormReset = (setSortFormValue) => {
    setSortFormValue("sortOrder", "DESC");
    dispatch({ action: "mutateTableForm", data: tableOrderFormDefaultValues });
  };

  const formInitValue = useMemo(() => {
    return (
      InboxObjectInSessionStorage || {
        filterForm: filterFormDefaultValues,
        searchForm: searchFormDefaultValues,
        tableForm: tableOrderFormDefaultValues,
      }
    );
  }, [
    Object.values(InboxObjectInSessionStorage?.filterForm || {}),
    Object.values(InboxObjectInSessionStorage?.searchForm || {}),
    Object.values(InboxObjectInSessionStorage?.tableForm || {}),
  ]);

  const [formState, dispatch] = useReducer(formReducer, formInitValue);

  const onPageSizeChange = (e) => {
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: e.target.value } });
  };

  const onNextPage = () =>
    dispatch({
      action: "mutateTableForm",
      data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) + parseInt(formState.tableForm?.limit) },
    });

  const onPrevPage = () =>
    dispatch({
      action: "mutateTableForm",
      data: { ...formState.tableForm, offset: parseInt(formState.tableForm?.offset) - parseInt(formState.tableForm?.limit) },
    });

  const onSortingByData = (e) => {
    if (e.length > 0) {
      const [{ id, desc }] = e;
      const sortOrder = desc ? "DESC" : "ASC";
      const sortBy = id;
      if (!(formState.tableForm.sortBy === sortBy && formState.tableForm.sortOrder === sortOrder)) {
        dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, sortBy: id, sortOrder: desc ? "DESC" : "ASC" } });
      }
    }
  };

  const onMobileSortOrderData = (data) => {
    const { sortOrder } = data;
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, sortOrder } });
  };

  const { data: localitiesForEmployeesCurrentTenant, isLoading: loadingLocalitiesForEmployeesCurrentTenant } = Digit.Hooks.useBoundaryLocalities(
    tenantId,
    "revenue",
    {},
    t
  );

  const handleFilter = (filterStatus) => {
    setFilter(filterStatus);
  };

  const { isLoading: isInboxLoading, data } = Digit.Hooks.ndc.useInbox({
    tenantId,
    filters: { ...formState, getFilter },
  });

  const [table, setTable] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (data) {
      setStatuses(data?.statuses || []);
      setTable(data?.table || []);
      setTotalCount(data?.totalCount || 0);
    }
  }, [data]);

  const PropsForInboxLinks = {
    logoIcon: <ComplaintIcon />,
    headerText: `${t("MODULE_NKS_NO_DUE_CERTIFICATE_FEES")}`,
    links: [
      {
        text: "",
        link: "",
        accessTo: [""],
      },
    ],
  };

  const SearchFormFields = useCallback(
    ({ registerRef, searchFormState, searchFieldComponents }) => (
      <NewSearchFormFieldsComponent {...{ registerRef, searchFormState, searchFieldComponents }} />
    ),
    []
  );

  const FilterFormFields = useCallback(
    ({ registerRef, controlFilterForm, setFilterFormValue, getFilterFormValue }) => (
      <NewFilterFormFieldsComponent
        {...{
          statuses,
          isInboxLoading,
          registerRef,
          controlFilterForm,
          setFilterFormValue,
          filterFormState: formState?.filterForm,
          getFilterFormValue,
          localitiesForEmployeesCurrentTenant,
          loadingLocalitiesForEmployeesCurrentTenant,
        }}
        handleFilter={handleFilter}
      />
    ),
    [statuses, isInboxLoading, localitiesForEmployeesCurrentTenant, loadingLocalitiesForEmployeesCurrentTenant]
  );

  const onSearchFormSubmit = (data) => {
    data.hasOwnProperty("") && delete data?.[""];
    dispatch({ action: "mutateTableForm", data: { ...tableOrderFormDefaultValues } });
    dispatch({ action: "mutateSearchForm", data });
  };

  const onFilterFormSubmit = (data) => {
    data.hasOwnProperty("") && delete data?.[""];
    dispatch({ action: "mutateTableForm", data: { ...tableOrderFormDefaultValues } });
    dispatch({ action: "mutateFilterForm", data });
  };

  const propsForSearchForm = {
    SearchFormFields,
    onSearchFormSubmit,
    searchFormDefaultValues: formState?.searchForm,
    resetSearchFormDefaultValues: searchFormDefaultValues,
    onSearchFormReset,
  };

  const propsForFilterForm = {
    FilterFormFields,
    onFilterFormSubmit,
    filterFormDefaultValues: formState?.filterForm,
    resetFilterFormDefaultValues: filterFormDefaultValues,
    onFilterFormReset,
  };

  const propsForInboxTable = useNewInboxTableConfig({ ...{ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData } });

  const propsForInboxMobileCards = useNewInboxMobileCardsData({ parentRoute, table });

  const propsForMobileSortForm = { onMobileSortOrderData, sortFormDefaultValues: formState?.tableForm, onSortFormReset };

  const {
    register: registerFilterFormField,
    control: controlFilterForm,
    handleSubmit: handleFilterFormSubmit,
    setValue: setFilterFormValue,
    getValues: getFilterFormValue,
    reset: resetFilterForm,
  } = useForm({
    defaultValues: { ...filterFormDefaultValues },
  });

  const onResetFilterForm = () => {
    onFilterFormReset(setFilterFormValue);
  };

  useEffect(() => {
    if (resetFilterForm && formState) {
      resetFilterForm(formState?.filterForm);
    }
  }, [formState, resetFilterForm]);

  const isMobile = window.Digit.Utils.browser.isMobile();

  if (isMobile) {
    return (
      <div className="ndc-new-inbox">
        <InboxComposer
          {...{
            isInboxLoading,
            PropsForInboxLinks,
            ...propsForSearchForm,
            ...propsForFilterForm,
            ...propsForMobileSortForm,
            propsForInboxTable,
            propsForInboxMobileCards,
            formState,
          }}
        />
      </div>
    );
  }

  return (
    <div className="ndc-new-inbox">
      <style>{`
        .ndc-new-inbox {
          margin-top: 32px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
        }
        .ndc-new-inbox .ndc-new-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .ndc-new-inbox .ndc-new-count-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 8px;
          border-radius: 999px;
          background: #2563eb;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
        }
        .ndc-new-inbox .ndc-new-inbox-filter-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
          border-radius: 12px;
          padding: 16px;
        }
        .ndc-new-inbox .ndc-new-filter-card-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .ndc-new-inbox .ndc-new-filter-option-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ndc-new-inbox .ndc-new-filter-option-card.active {
          background: #e0f2fe;
          border-color: #38bdf8;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.18);
        }
        .ndc-new-inbox .ndc-new-filter-option-title {
          font-weight: 600;
        }
        .ndc-new-inbox .ndc-new-filter-option-subtitle {
          font-size: 12px;
          margin-top: 4px;
        }
        .ndc-new-inbox .ndc-new-filter-status-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .ndc-new-inbox .ndc-new-filter-status-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }
        .ndc-new-inbox .ndc-new-filter-status-card.active {
          background: #e0f2fe;
          border-color: #38bdf8;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.18);
        }
        .ndc-new-inbox .ndc-new-filter-status-title {
          font-weight: 600;
        }
        .ndc-new-inbox .ndc-new-filter-status-count {
          font-size: 12px;
          margin-top: 6px;
        }
        .ndc-new-inbox .ndc-new-filter-show-more {
          margin-top: 12px;
          background: #f1f5f9;
          border: 1px dashed #94a3b8;
          border-radius: 999px;
          padding: 8px 14px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          color: #0f172a;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .ndc-new-inbox .ndc-new-filter-show-more:hover {
          background: #e2e8f0;
          border-color: #64748b;
        }
        .ndc-new-inbox .ndc-new-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
        }
        .ndc-new-inbox .filter-card .heading {
          display: none;
        }
        .ndc-new-inbox .ndc-new-filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          margin-bottom: 12px;
          font-weight: 700;
        }
        .ndc-new-inbox .ndc-new-filters-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .ndc-new-inbox .ndc-new-refresh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
        }
        .ndc-new-inbox .ndc-new-filters-scroll {
          max-height: 70vh;
          overflow-y: auto;
          padding-right: 6px;
        }
        .ndc-new-inbox .ndc-new-table-card {
          margin-top: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
          overflow: hidden;
        }
        .ndc-new-inbox .ndc-new-table-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }
        .ndc-new-inbox .ndc-new-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ndc-new-inbox .ndc-new-tab {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
        }
        .ndc-new-inbox .ndc-new-tab.active {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 6px 14px rgba(37, 99, 235, 0.25);
        }
        .ndc-new-inbox .ndc-new-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          min-width: 260px;
          background: #f8fafc;
          color: #6b7280;
          font-size: 12px;
        }
        .ndc-new-inbox .ndc-new-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 12px;
          color: #111827;
        }
        .ndc-new-inbox .ndc-new-table-header {
          padding: 18px 20px;
          font-size: 18px;
          font-weight: 700;
          border-bottom: 1px solid #e2e8f0;
        }
        .ndc-new-inbox .ndc-new-table-wrapper {
          overflow-x: auto;
        }
        .ndc-new-inbox .ndc-new-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ndc-new-inbox .ndc-new-table th {
          text-align: left;
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #6b7280;
          padding: 14px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .ndc-new-inbox .ndc-new-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #eef2f7;
          font-size: 14px;
          color: #334155;
        }
        .ndc-new-inbox .ndc-new-row.pending {
          background: #fff7ed;
        }
        .ndc-new-inbox .ndc-new-row.rejected {
          background: #fef2f2;
        }
        .ndc-new-inbox .ndc-new-row.approved {
          background: #f0fdf4;
        }
        .ndc-new-inbox .ndc-new-table-app {
          font-weight: 600;
          color: #111827;
        }
        .ndc-new-inbox .ndc-new-table-action {
          text-align: right;
          white-space: nowrap;
        }
        .ndc-new-inbox .ndc-new-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          background: #e2e8f0;
          color: #111827;
          border: 1px solid transparent;
        }
        .ndc-new-inbox .ndc-new-status-pill.approved {
          background: #f0fdf4;
          color: #15803d;
          border-color: #86efac;
        }
        .ndc-new-inbox .ndc-new-status-pill.rejected {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .ndc-new-inbox .ndc-new-status-pill.forwarded {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }
        .ndc-new-inbox .ndc-new-status-pill.in-progress {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .ndc-new-inbox .ndc-new-status-pill.pending {
          background: #ffedd5;
          color: #c2410c;
        }
        .ndc-new-inbox .ndc-new-status-pill.new {
          background: #f3f4f6;
          color: #111827;
        }
        .ndc-new-inbox .ndc-new-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          margin-left: 8px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          color: #94a3b8;
        }
        .ndc-new-inbox .ndc-new-app-link {
          color: #2563eb;
          text-decoration: none;
        }
        .ndc-new-inbox .ndc-new-app-link:hover {
          text-decoration: underline;
        }
        .ndc-new-inbox .ndc-new-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 12px 20px 18px;
          border-top: 1px solid #eef2f7;
          font-size: 12px;
          color: #6b7280;
        }
        .ndc-new-inbox .ndc-new-pagination button {
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 8px;
          padding: 4px 8px;
          cursor: pointer;
        }
        .ndc-new-inbox .ndc-new-pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ndc-new-inbox .ndc-new-pagination select {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 4px 8px;
          background: #ffffff;
        }
      `}</style>
      <div className="ndc-new-header">
        <span>{t("NDC Inbox")}</span>
        {totalCount ? <span className="ndc-new-count-pill">{totalCount}</span> : null}
      </div>
      <div className="ndc-new-layout">
        <div className="filters-container ndc-new-filters-scroll">
          <div className="ndc-new-filters-header">
            <span className="ndc-new-filters-title">🔍 Filters:</span>
            <span className="ndc-new-refresh">⟳</span>
          </div>
          <FilterForm onSubmit={onFilterFormSubmit} handleSubmit={handleFilterFormSubmit} id="filter-form" onResetFilterForm={onResetFilterForm}>
            <NewFilterFormFieldsComponent
              registerRef={registerFilterFormField}
              {...{ controlFilterForm, handleFilterFormSubmit, setFilterFormValue, getFilterFormValue, statuses }}
              handleFilter={handleFilter}
            />
          </FilterForm>
        </div>
        <div>
          <div className="ndc-new-table-topbar">
            <div className="ndc-new-tabs">
              {["ALL", "DRAFT", "PENDING APPROVAL", "APPROVED", "REJECTED"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`ndc-new-tab ${activeStatusTab === label ? "active" : ""}`}
                  onClick={() => setActiveStatusTab(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="ndc-new-search">
              <span aria-hidden="true">🔍</span>
              <input
                type="text"
                value={topBarSearch}
                onChange={(e) => setTopBarSearch(e.target.value)}
                placeholder="Search by name or ID..."
              />
            </div>
          </div>
          {isInboxLoading ? (
            <Loader />
          ) : table?.length < 1 ? (
            <Card className="margin-unset text-align-center">{t("CS_MYAPPLICATIONS_NO_APPLICATION")}</Card>
          ) : (
            <NewNDCInboxTable rows={table} parentRoute={parentRoute} searchQuery={topBarSearch} statusFilter={activeStatusTab} />
          )}
          {totalCount > 0 ? (
            <div className="ndc-new-pagination">
              {t("CS_COMMON_ROWS_PER_PAGE")}:
              <select value={formState.tableForm?.limit} onChange={onPageSizeChange}>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
              <span>
                {formState.tableForm?.offset + 1}-{Math.min(formState.tableForm?.offset + formState.tableForm?.limit, totalCount)} of {totalCount}
              </span>
              <button onClick={onPrevPage} disabled={formState.tableForm?.offset <= 0}>
                ‹
              </button>
              <button
                onClick={onNextPage}
                disabled={formState.tableForm?.offset + formState.tableForm?.limit >= totalCount}
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NewNDCInbox;
