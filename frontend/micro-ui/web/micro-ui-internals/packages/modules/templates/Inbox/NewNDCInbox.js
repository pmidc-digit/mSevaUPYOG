import React, { useCallback, useMemo, useReducer, useState, useEffect, useRef } from "react";
import { InboxComposer, ComplaintIcon, Header, FilterForm, Loader, Card, Table } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import NewSearchFormFieldsComponent from "./NewSearchFormFieldsComponent";
import NewFilterFormFieldsComponent from "./NewFilterFormFieldsComponent";
import useNewInboxTableConfig from "./useNewInboxTableConfig";
import useNewInboxMobileCardsData from "./useNewInboxMobileCardsData";
import { businessServiceList } from "../../ndc/src/utils";
import { useForm, useWatch } from "react-hook-form";

const NewNDCInbox = ({ parentRoute, tableColumns }) => {
  const { t } = useTranslation();

  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const [activeStatusTab, setActiveStatusTab] = useState("ALL");
  const [topBarSearch, setTopBarSearch] = useState("");

  const businessServices = useMemo(() => businessServiceList(true) || [], []);
  const searchFormDefaultValues = useMemo(() => ({}), []);

  const filterFormDefaultValues = useMemo(
    () => ({
      moduleName: "ndc-services",
      applicationStatus: [],
      businessService: null,
      locality: [],
      assignee: "ASSIGNED_TO_ALL",
      businessServiceArray: businessServices,
    }),
    [businessServices]
  );
  const tableOrderFormDefaultValues = useMemo(
    () => ({
      sortBy: "",
      limit: window.Digit.Utils.browser.isMobile() ? 50 : 10,
      offset: 0,
      sortOrder: "DESC",
    }),
    []
  );

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
    setFilterFormValue("moduleName", "ndc-services");
    setFilterFormValue("applicationStatus", []);
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

  const handleFilter = useCallback((filterData) => {
    // Update form values
    if (filterData.applicationStatus) {
      setFilterFormValue("applicationStatus", filterData.applicationStatus.map((item) => item.code || item))
    }
    if (filterData.assignee) {
      setFilterFormValue("assignee", filterData.assignee)
    }
    // Dispatch to reducer to trigger data refetch
    dispatch({ 
      action: "mutateFilterForm", 
      data: { 
        ...formState?.filterForm,
        applicationStatus: filterData.applicationStatus?.map((item) => item.code || item) || formState?.filterForm?.applicationStatus || [],
        assignee: filterData.assignee || formState?.filterForm?.assignee || "ASSIGNED_TO_ALL"
      } 
    })
  }, [formState?.filterForm, setFilterFormValue]);

  const prevFilterRef = useRef("");
  const searchDebounceRef = useRef(null);
  const hasInitializedFilterForm = useRef(false);

  useEffect(() => {
    if (formState?.filterForm) {
      setFilterFormValue("assignee", formState.filterForm.assignee || "ASSIGNED_TO_ALL");
      setFilterFormValue("applicationStatus", formState.filterForm.applicationStatus || []);
      setFilterFormValue("moduleName", formState.filterForm.moduleName || "ndc-services");
    }
  }, [formState?.filterForm?.assignee, formState?.filterForm?.applicationStatus, formState?.filterForm?.moduleName, setFilterFormValue]);

  const { isLoading: isInboxLoading, data } = Digit.Hooks.ndc.useInbox({
    tenantId,
    filters: {
      filterForm: formState?.filterForm || filterFormDefaultValues,
      searchForm: formState?.searchForm || searchFormDefaultValues,
      tableForm: formState?.tableForm || tableOrderFormDefaultValues,
    },
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

  const propsForInboxTable = useNewInboxTableConfig({
    ...{ parentRoute, onPageSizeChange, formState, totalCount, table, dispatch, onSortingByData },
  });

  const propsForInboxMobileCards = useNewInboxMobileCardsData({ parentRoute, table });

  const propsForMobileSortForm = { onMobileSortOrderData, sortFormDefaultValues: formState?.tableForm, onSortFormReset };

  const resolvedTableColumns = tableColumns || propsForInboxTable?.columns;

  useEffect(() => {
    const serialized = JSON.stringify(formState?.filterForm || {});
    if (prevFilterRef.current === serialized) return;
    prevFilterRef.current = serialized;
  }, [formState]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const value = String(topBarSearch || "").trim();
      const nextSearchForm = value ? { applicationNo: value } : {};
      dispatch({ action: "mutateTableForm", data: { ...tableOrderFormDefaultValues } });
      dispatch({ action: "mutateSearchForm", data: nextSearchForm });
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [topBarSearch, tableOrderFormDefaultValues]);

  const onResetFilterForm = () => {
    onFilterFormReset(setFilterFormValue);
  };

  const normalizeStatus = useCallback(
    (value) =>
      String(value || "")
        .replace(/[\s-_]+/g, "")
        .toUpperCase(),
    []
  );

  const onStatusTabClick = useCallback(
    (label, statusCode) => {
      setActiveStatusTab(statusCode || label);
      if (label === "CLEAR") {
        setTopBarSearch("");
        return;
      }
      if (label === "ALL") {
        setFilterFormValue("applicationStatus", [], { shouldDirty: true, shouldTouch: true });
        handleFilterFormSubmit(onFilterFormSubmit)();
        return;
      }
      const resolvedCode = statusCode || label;
      setFilterFormValue("applicationStatus", [resolvedCode], { shouldDirty: true, shouldTouch: true });
      handleFilterFormSubmit(onFilterFormSubmit)();
    },
    [handleFilterFormSubmit, onFilterFormSubmit, setFilterFormValue]
  );

  useEffect(() => {
    if (hasInitializedFilterForm.current) return;
    if (resetFilterForm && formState) {
      resetFilterForm(formState?.filterForm);
      hasInitializedFilterForm.current = true;
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
  
        .ndc-new-inbox .ndc-new-filter-card-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
        }
        .ndc-new-inbox .ndc-new-filter-option-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          min-height: 88px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .ndc-new-inbox .ndc-new-filter-option-card.active {
          background: #e0f2fe;
          border-color: #38bdf8;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.18);
        }
        .ndc-new-inbox .ndc-new-filter-option-title {
          font-weight: 700;
          font-size: 14px;
        }
        .ndc-new-inbox .ndc-new-filter-option-subtitle {
          font-size: 12px;
          margin-top: 6px;
          color: white;
        }
        .ndc-new-inbox .ndc-new-filter-status-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
        }
        .ndc-new-inbox .ndc-new-filter-status-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          min-height: 88px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }
        .ndc-new-inbox .ndc-new-filter-status-card.active {
          background: #e0f2fe;
          border-color: #38bdf8;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.18);
        }
        .ndc-new-inbox .ndc-new-filter-status-title {
          font-weight: 700;
          font-size: 14px;
        }
        .ndc-new-inbox .ndc-new-filter-status-count {
          font-size: 22px;
          font-weight: 700;
          margin-top: 8px;
          color: inherit;
        }
        .ndc-new-inbox .ndc-new-filter-card-icon {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 16px;
        }
        .ndc-new-inbox .ndc-new-filter-card-check {
          position: absolute;
          top: 10px;
          left: 12px;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.9);
          color: #111827;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        .ndc-new-inbox .ndc-new-filter-card {
          color: #ffffff;
          border-color: transparent;
        }
        .ndc-new-inbox .ndc-new-filter-card.primary {
          background: #2563eb;
        }
        .ndc-new-inbox .ndc-new-filter-card.success {
          background: #16a34a;
        }
        .ndc-new-inbox .ndc-new-filter-card.warning {
          background: #ea580c;
        }
        .ndc-new-inbox .ndc-new-filter-card.info {
          background: #7c3aed;
        }
        .ndc-new-inbox .ndc-new-filter-card.danger {
          background: #dc2626;
        }
        .ndc-new-inbox .ndc-new-filter-card.indigo {
          background: #4f46e5;
        }
        .ndc-new-inbox .ndc-new-filter-card.teal {
          background: #0f766e;
        }
        .ndc-new-inbox .ndc-new-filter-card.pink {
          background: #db2777;
        }
        .ndc-new-inbox .ndc-new-filter-card.amber {
          background: #d97706;
        }
        .ndc-new-inbox .ndc-new-filter-card.slate {
          background: #475569;
        }
        .ndc-new-inbox .ndc-new-filter-card.active {
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
          transform: translateY(-1px);
        }
        .ndc-new-inbox .ndc-new-filter-show-more {
          margin-top: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .ndc-new-inbox .ndc-new-filter-show-more-icon {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #457fff;
          background: #eff6ff;
        }
        .ndc-new-inbox .ndc-new-filter-show-more:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
        }
        .ndc-new-inbox .ndc-new-layout {
          display: block;
        }
        .ndc-new-inbox .filter-card .heading {
          display: none;
        }
        .ndc-new-inbox .filter-card .submit-bar,
        .ndc-new-inbox .filter-card button[type="submit"] {
          display: none;
        }
        .ndc-new-inbox .ndc-new-top-filters {
          margin: 12px 0 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
        }
        .ndc-new-inbox .ndc-new-inbox-filter-card {
          margin: 0;
        }
        .ndc-new-inbox .ndc-new-filter-card-grid {
          grid-template-columns: repeat(6, 1fr);
        }
        .ndc-new-inbox .ndc-new-filter-status-grid {
          grid-template-columns: repeat(6, 1fr);
        }
        @media (max-width: 1400px) {
          .ndc-new-inbox .ndc-new-filter-card-grid,
          .ndc-new-inbox .ndc-new-filter-status-grid {
            grid-template-columns: repeat(4, minmax(140px, 1fr));
          }
        }
        @media (max-width: 1100px) {
          .ndc-new-inbox .ndc-new-filter-card-grid,
          .ndc-new-inbox .ndc-new-filter-status-grid {
            grid-template-columns: repeat(3, minmax(140px, 1fr));
          }
        }
        @media (max-width: 900px) {
          .ndc-new-inbox .ndc-new-filter-card-grid,
          .ndc-new-inbox .ndc-new-filter-status-grid {
            grid-template-columns: repeat(2, minmax(140px, 1fr));
          }
        }
        @media (max-width: 640px) {
          .ndc-new-inbox .ndc-new-filter-card-grid,
          .ndc-new-inbox .ndc-new-filter-status-grid {
            grid-template-columns: 1fr;
          }
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
          gap: 8px;
          flex-wrap: nowrap;
          overflow-x: auto;
          max-width: calc(100% - 280px);
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .ndc-new-inbox .ndc-new-tabs::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .ndc-new-inbox .ndc-new-tab {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          font-weight: 600;
          font-size: 11px;
          cursor: pointer;
          white-space: nowrap;
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
          border-radius: 10px;
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
          display: block;
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
        .ndc-new-inbox .ndc-new-cell-stack {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ndc-new-inbox .ndc-new-cell-primary {
          font-weight: 600;
          color: #111827;
        }
        .ndc-new-inbox .ndc-new-cell-secondary {
          font-size: 12px;
          color: #64748b;
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
          text-align: left;
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
        .ndc-new-inbox .ndc-new-action-group {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .ndc-new-inbox .ndc-new-icon-link {
          text-decoration: none;
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
        @media (max-width: 768px) {
          .ndc-new-inbox .ndc-new-top-filters {
            padding: 0;
          }
          .ndc-new-inbox .ndc-new-table-topbar {
            flex-wrap: wrap;
          }
          .ndc-new-inbox .ndc-new-tabs {
            max-width: 100%;
            overflow-x: visible;
            flex-wrap: wrap;
          }
          .ndc-new-inbox .ndc-new-search {
            width: 100%;
            min-width: 0;
          }
          .ndc-new-inbox .ndc-new-table-header {
            font-size: 16px;
            padding: 14px 16px;
          }
          .ndc-new-inbox .ndc-new-table th,
          .ndc-new-inbox .ndc-new-table td {
            padding: 12px 14px;
            font-size: 12px;
          }
          .ndc-new-inbox .ndc-new-status-pill {
            font-size: 11px;
            padding: 3px 8px;
          }
        }
        .ndc-new-inbox .ndc-new-tab-count {
          margin-left: 6px;
          padding: 2px 6px;
          border-radius: 999px;
          background: #e2e8f0;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
        }
        .ndc-new-inbox .ndc-new-tab.active .ndc-new-tab-count {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
      `}</style>
      <div className="ndc-new-header">
        <span>{t("NDC Inbox")}</span>
        {totalCount ? <span className="ndc-new-count-pill">{totalCount}</span> : null}
      </div>
      <div className="ndc-new-layout">
        <div className="ndc-new-top-filters">
          <FilterForm onSubmit={onFilterFormSubmit} handleSubmit={handleFilterFormSubmit} id="filter-form" onResetFilterForm={onResetFilterForm}>
            <NewFilterFormFieldsComponent
              registerRef={registerFilterFormField}
              {...{ controlFilterForm, handleFilterFormSubmit, setFilterFormValue, getFilterFormValue, statuses }}
              handleFilter={handleFilter}
            />
          </FilterForm>
        </div>
        <div className="ndc-new-table-topbar">
          <div className="ndc-new-tabs">
            <button type="button" className={`ndc-new-tab ${activeStatusTab === "ALL" ? "active" : ""}`} onClick={() => onStatusTabClick("ALL")}>
              {t("ALL")}
              <span className="ndc-new-tab-count">{totalCount || 0}</span>
            </button>
            {(statuses || []).map((status) => (
              <button
                key={status?.applicationstatus}
                type="button"
                className={`ndc-new-tab ${activeStatusTab === status?.applicationstatus ? "active" : ""}`}
                onClick={() => onStatusTabClick(status?.applicationstatus, status?.applicationstatus)}
              >
                {t(status?.applicationstatus)}
                <span className="ndc-new-tab-count">{status?.count ?? 0}</span>
              </button>
            ))}
            <button type="button" className={`ndc-new-tab ${activeStatusTab === "CLEAR" ? "active" : ""}`} onClick={() => onStatusTabClick("CLEAR")}>
              {t("CLEAR")}
            </button>
          </div>
          <div className="ndc-new-search">
            <span aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="#6B7280" strokeWidth="2" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>

            <input type="text" value={topBarSearch} onChange={(e) => setTopBarSearch(e.target.value)} placeholder="Search by application no..." />
          </div>
        </div>
        {isInboxLoading ? (
          <Loader />
        ) : table?.length < 1 ? (
          <Card className="margin-unset text-align-center">{t("CS_MYAPPLICATIONS_NO_APPLICATION")}</Card>
        ) : (
          <div className="ndc-new-table-card">
            <div className="ndc-new-table-header">{t("Assigned Applications")}</div>
            <Table
              className="ndc-new-table"
              customTableWrapperClassName="ndc-new-table-wrapper"
              isPaginationRequired={false}
              {...propsForInboxTable}
              columns={resolvedTableColumns}
              getRowProps={propsForInboxTable?.getRowProps}
            />
          </div>
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
            <button onClick={onNextPage} disabled={formState.tableForm?.offset + formState.tableForm?.limit >= totalCount}>
              ›
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NewNDCInbox;
