import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import NewFilterFormFieldComponent from "../../../../../templates/Inbox/NewFilterFormFieldsComponent";
import { InboxTopBar, InboxWrapper, InboxPagination } from "../../../../../templates/Inbox/components";
import useInboxTableConfig from "./useInboxTableConfig";
import { OBPS_BPA_NOR_BUSINESS_SERVICES } from "../../../../../../constants/constants";

const Inbox = ({ parentRoute }) => {
  const { t } = useTranslation();
  const [error, setError] = useState({
    error: false,
    label: "",
  });

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentTenantId() : localStorage.getItem("CITIZEN.CITY");
  const isEmployee = window.location.href.includes("employee");
  const { data: cities } = Digit.Hooks.useTenants();

  const [activeStatusTab, setActiveStatusTab] = useState("ALL");
  const [topBarSearch, setTopBarSearch] = useState("");

  const searchFormDefaultValues = useMemo(() => ({}), []);

  const filterFormDefaultValues = useMemo(
    () => ({
      moduleName: "bpa-services",
      applicationStatus: [],
      businessService: null,
      locality: [],
      assignee: "ASSIGNED_TO_ME",
      applicationType: [],
    }),
    []
  );

  const selectedTenantIdDefaultValues = useMemo(
    () => ({
      tenantId: cities?.[0]?.code || null,
    }),
    [cities]
  );

  const isMobileDevice = Digit.Utils.browser.isMobile();

  const tableOrderFormDefaultValues = useMemo(
    () => ({
      sortBy: "",
      limit: isMobileDevice ? 50 : 10,
      offset: 0,
      sortOrder: "DESC",
    }),
    [isMobileDevice]
  );

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("OBPS.INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("OBPS.INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("OBPS.INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      case "mutateSelectedTenantId":
        Digit.SessionStorage.set("OBPS.INBOX", { ...state, selectedTenantId: payload.data });
        return { ...state, selectedTenantId: payload.data };
      default:
        break;
    }
  }

  const inboxObjectInSessionStorage = Digit.SessionStorage.get("OBPS.INBOX");

  const onFilterFormReset = useCallback(
    (setFilterFormValue) => {
      setFilterFormValue("moduleName", "bpa-services");
      setFilterFormValue("applicationStatus", []);
      setFilterFormValue("businessService", null);
      setFilterFormValue("locality", []);
      setFilterFormValue("assignee", "ASSIGNED_TO_ME");
      setFilterFormValue("applicationType", []);
      dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues });
    },
    [filterFormDefaultValues]
  );

  const onSortFormReset = useCallback(
    (setSortFormValue) => {
      setSortFormValue("sortOrder", "DESC");
      dispatch({ action: "mutateTableForm", data: tableOrderFormDefaultValues });
    },
    [tableOrderFormDefaultValues]
  );

  const formInitValue = useMemo(() => {
    if (inboxObjectInSessionStorage) {
      const sessionLimit = parseInt(inboxObjectInSessionStorage.tableForm?.limit, 10);
      const validLimit = [10, 20, 30, 40, 50].includes(sessionLimit) ? sessionLimit : tableOrderFormDefaultValues.limit;
      return {
        filterForm: inboxObjectInSessionStorage.filterForm || filterFormDefaultValues,
        searchForm: inboxObjectInSessionStorage.searchForm || searchFormDefaultValues,
        tableForm: {
          ...tableOrderFormDefaultValues,
          ...(inboxObjectInSessionStorage.tableForm || {}),
          limit: validLimit,
          offset: 0,
        },
        selectedTenantId: inboxObjectInSessionStorage.selectedTenantId || selectedTenantIdDefaultValues,
      };
    }

    return {
      filterForm: filterFormDefaultValues,
      searchForm: searchFormDefaultValues,
      tableForm: tableOrderFormDefaultValues,
      selectedTenantId: selectedTenantIdDefaultValues,
    };
  }, [inboxObjectInSessionStorage, filterFormDefaultValues, searchFormDefaultValues, tableOrderFormDefaultValues, selectedTenantIdDefaultValues]);

  const [formState, dispatch] = useReducer(formReducer, formInitValue);
  const [tableData, setTableData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [totalCountData, setTotalCountData] = useState(0);

  const effectiveTenantId =
    isEmployee && tenantId === "pb.punjab" ? formState?.selectedTenantId?.tenantId || cities?.[0]?.code || tenantId : tenantId;

  const memoizedFilters = useMemo(() => {
    return {
      filterForm: {
        ...(formState?.filterForm || filterFormDefaultValues),
        businessService:
          formState?.filterForm?.businessService === "BPA" ? OBPS_BPA_NOR_BUSINESS_SERVICES : formState?.filterForm?.businessService || null,
      },
      searchForm: formState?.searchForm || searchFormDefaultValues,
      tableForm: formState?.tableForm || tableOrderFormDefaultValues,
      selectedTenantId: formState?.selectedTenantId || selectedTenantIdDefaultValues,
    };
  }, [
    formState?.filterForm,
    formState?.searchForm,
    formState?.tableForm,
    formState?.selectedTenantId,
    filterFormDefaultValues,
    searchFormDefaultValues,
    tableOrderFormDefaultValues,
    selectedTenantIdDefaultValues,
  ]);

  const { isLoading: isInboxLoading, data: inboxData, isError } = Digit.Hooks.obps.useBPAInbox({
    tenantId: effectiveTenantId,
    filters: memoizedFilters,
    config: { enabled: !!tenantId },
  });

  useEffect(() => {
    if (inboxData) {
      setStatusData(inboxData?.statuses || []);
      setTableData(inboxData?.table || []);
      setTotalCountData(inboxData?.totalCount || 0);
    }
  }, [inboxData]);

  const onPageSizeChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, limit: newLimit, offset: 0 } });
  };

  const onSortingByData = (e) => {
    if (e.length > 0) {
      const [{ id, desc }] = e;
      const sortOrder = desc ? "DESC" : "ASC";
      const sortBy = id;
      if (!(formState.tableForm.sortBy === sortBy && formState.tableForm.sortOrder === sortOrder)) {
        dispatch({
          action: "mutateTableForm",
          data: { ...formState.tableForm, sortBy: id, sortOrder: desc ? "DESC" : "ASC" },
        });
      }
    }
  };

  const onFilterFormSubmit = useCallback(
    (data) => {
      data.hasOwnProperty("") && delete data?.[""];
      dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } });
      dispatch({ action: "mutateFilterForm", data: { ...formState.filterForm, ...data } });
    },
    [formState.tableForm, formState.filterForm]
  );

  const propsForInboxTable = useInboxTableConfig({
    parentRoute,
    onPageSizeChange,
    formState,
    totalCount: totalCountData,
    table: tableData,
    dispatch,
    onSortingByData,
  });

  const {
    control: controlFilterForm,
    handleSubmit: handleFilterFormSubmit,
    setValue: setFilterFormValue,
    getValues: getFilterFormValue,
    reset: resetFilterForm,
  } = useForm({
    defaultValues: { ...filterFormDefaultValues },
  });

  const handleFilterChange = useCallback(
    (filterData) => {
      if (filterData.applicationStatus) {
        setFilterFormValue(
          "applicationStatus",
          filterData.applicationStatus.map((item) => item.code)
        );
      }
      if (filterData.assignee) {
        setFilterFormValue("assignee", filterData.assignee);
      }

      dispatch({
        action: "mutateFilterForm",
        data: {
          ...formState?.filterForm,
          applicationStatus: filterData.applicationStatus?.map((item) => item.code) || [],
          assignee: filterData.assignee || formState?.filterForm?.assignee || "ASSIGNED_TO_ME",
        },
      });
    },
    [formState?.filterForm, setFilterFormValue]
  );

  const searchDebounceRef = useRef(null);
  const hasInitializedFilterForm = useRef(false);

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

  useEffect(() => {
    if (formState?.filterForm) {
      setFilterFormValue("moduleName", formState.filterForm.moduleName || "bpa-services");
      setFilterFormValue("applicationStatus", formState.filterForm.applicationStatus || []);
      setFilterFormValue("assignee", formState.filterForm.assignee || "ASSIGNED_TO_ME");
      setFilterFormValue("businessService", formState.filterForm.businessService || null);
      setFilterFormValue("applicationType", formState.filterForm.applicationType || []);
      setFilterFormValue("locality", formState.filterForm.locality || []);
    }
  }, [
    formState?.filterForm?.moduleName,
    formState?.filterForm?.applicationStatus,
    formState?.filterForm?.assignee,
    formState?.filterForm?.businessService,
    formState?.filterForm?.applicationType,
    formState?.filterForm?.locality,
    setFilterFormValue,
  ]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const value = String(topBarSearch || "").trim();
      const nextSearchForm = value ? { applicationNo: value } : {};
      dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } });
      dispatch({ action: "mutateSearchForm", data: nextSearchForm });
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [topBarSearch]);

  useEffect(() => {
    if (hasInitializedFilterForm.current) return;
    if (resetFilterForm && formState) {
      resetFilterForm(formState?.filterForm);
      hasInitializedFilterForm.current = true;
    }
  }, [formState, resetFilterForm]);

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
    if (isError) {
      setError({
        error: true,
        label: t("ES_OBPS_INBOX_ERROR"),
      });
      setTimeout(() => {
        window.location.href = `/digit-ui/employee/`;
      }, 5000);
    }
  }, [isError, t]);

  return (
    <>
      {!isError && (
        <InboxWrapper
          title={t("ES_COMMON_INBOX")}
          totalCount={totalCountData}
          filterSection={
            <NewFilterFormFieldComponent
              registerRef={() => {}}
              controlFilterForm={controlFilterForm}
              setFilterFormValue={setFilterFormValue}
              filterFormState={formState?.filterForm}
              getFilterFormValue={getFilterFormValue}
              statuses={statusData}
              isInboxLoading={isInboxLoading}
              handleFilter={handleFilterChange}
            />
          }
          topBar={
            <InboxTopBar
              statuses={statusData}
              activeTab={activeStatusTab}
              onTabClick={onStatusTabClick}
              searchValue={topBarSearch}
              onSearchChange={(e) => setTopBarSearch(e.target.value)}
              searchPlaceholder="Search by application number..."
              totalCount={totalCountData}
            />
          }
          isLoading={isInboxLoading}
          tableData={tableData}
          tableProps={propsForInboxTable}
          tableHeader="ES_INBOX_INBOX"
          pagination={
            <InboxPagination
              offset={formState.tableForm?.offset || 0}
              limit={formState.tableForm?.limit || 10}
              totalCount={totalCountData}
              onPageSizeChange={onPageSizeChange}
              onNextPage={onNextPage}
              onPrevPage={onPrevPage}
            />
          }
        />
      )}
      {error.error && <Toast error label={error.label} onClose={() => setError({ error: false, label: "" })} />}
    </>
  );
};

export default Inbox;
