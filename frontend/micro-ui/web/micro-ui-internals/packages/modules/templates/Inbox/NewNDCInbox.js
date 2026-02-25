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
      <div className="custom-new-inbox">
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
    <div className="custom-new-inbox">

      <div className="custom-new-header">
        <span>{t("NDC Inbox")}</span>
        {totalCount ? <span className="custom-new-count-pill">{totalCount}</span> : null}
      </div>
      <div className="custom-new-layout">
        <div className="custom-new-top-filters">
          <FilterForm onSubmit={onFilterFormSubmit} handleSubmit={handleFilterFormSubmit} id="filter-form" onResetFilterForm={onResetFilterForm}>
            <NewFilterFormFieldsComponent
              registerRef={registerFilterFormField}
              {...{ controlFilterForm, handleFilterFormSubmit, setFilterFormValue, getFilterFormValue, statuses }}
              handleFilter={handleFilter}
            />
          </FilterForm>
        </div>
        <div className="custom-new-table-topbar">
          <div className="custom-new-tabs">
            <button type="button" className={`custom-new-tab ${activeStatusTab === "ALL" ? "active" : ""}`} onClick={() => onStatusTabClick("ALL")}>
              {t("ALL")}
              <span className="custom-new-tab-count">{totalCount || 0}</span>
            </button>
            {(statuses || []).map((status) => (
              <button
                key={status?.applicationstatus}
                type="button"
                className={`custom-new-tab ${activeStatusTab === status?.applicationstatus ? "active" : ""}`}
                onClick={() => onStatusTabClick(status?.applicationstatus, status?.applicationstatus)}
              >
                {t(status?.applicationstatus)}
                <span className="custom-new-tab-count">{status?.count ?? 0}</span>
              </button>
            ))}
            <button type="button" className={`custom-new-tab ${activeStatusTab === "CLEAR" ? "active" : ""}`} onClick={() => onStatusTabClick("CLEAR")}>
              {t("CLEAR")}
            </button>
          </div>
          <div className="custom-new-search">
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
          <div className="custom-new-table-card">
            <div className="custom-new-table-header">{t("Assigned Applications")}</div>
            <Table
              className="custom-new-table"
              customTableWrapperClassName="custom-new-table-wrapper"
              isPaginationRequired={false}
              {...propsForInboxTable}
              columns={resolvedTableColumns}
              getRowProps={propsForInboxTable?.getRowProps}
            />
          </div>
        )}
        {totalCount > 0 ? (
          <div className="custom-new-pagination">
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
