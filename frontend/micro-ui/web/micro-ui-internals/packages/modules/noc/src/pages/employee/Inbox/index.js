import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import NewFilterFormFieldComponent from "../../../../../templates/Inbox/NewFilterFormFieldsComponent";
import { InboxTopBar, InboxWrapper, InboxPagination } from "../../../../../templates/Inbox/components";
import useInboxTableConfig from "./useInboxTableConfig";

const Inbox = ({ parentRoute }) => {
  const { t } = useTranslation();
  const [error, setError] = useState({
    error: false,
    label: "",
  });

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const { data: cities } = Digit.Hooks.useTenants();

  const [activeStatusTab, setActiveStatusTab] = useState("ALL");
  const [topBarSearch, setTopBarSearch] = useState("");

  const searchFormDefaultValues = useMemo(() => ({}), []);

  const filterFormDefaultValues = useMemo(
    () => ({
      moduleName: "noc-service",
      applicationStatus: [],
      businessService: "obpas_noc",
      locality: [],
      assignee: "ASSIGNED_TO_ME",
      businessServiceArray: [],
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
        Digit.SessionStorage.set("NOC.INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("NOC.INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("NOC.INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      case "mutateSelectedTenantId":
        Digit.SessionStorage.set("NOC.INBOX", { ...state, selectedTenantId: payload.data });
        return { ...state, selectedTenantId: payload.data };
      default:
        break;
    }
  }

  const inboxObjectInSessionStorage = Digit.SessionStorage.get("NOC.INBOX");

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
  const [assigneeCounts, setAssigneeCounts] = useState({
    ASSIGNED_TO_ME: 0,
    ASSIGNED_TO_ALL: 0,
  });
  const hasCapturedAssigneeCounts = useRef(false);

  const effectiveTenantId = tenantId === "pb.punjab" ? formState?.selectedTenantId?.tenantId || cities?.[0]?.code || tenantId : tenantId;

  const memoizedFilters = useMemo(() => {
    return {
      filterForm: formState?.filterForm || filterFormDefaultValues,
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

  const { isLoading: isInboxLoading, data: inboxData, isError } = Digit.Hooks.noc.useInbox({
    tenantId: effectiveTenantId,
    filters: memoizedFilters,
    config: { enabled: !!tenantId },
  });

  const assigneeCountBaseFilters = useMemo(() => {
    const countFilterForm = { ...(memoizedFilters?.filterForm || {}) };
    delete countFilterForm.applicationStatus;

    return {
      ...memoizedFilters,
      filterForm: countFilterForm,
    };
  }, [memoizedFilters]);

  const assignedToMeFilters = useMemo(
    () => ({
      ...assigneeCountBaseFilters,
      filterForm: {
        ...(assigneeCountBaseFilters?.filterForm || {}),
        assignee: "ASSIGNED_TO_ME",
      },
    }),
    [assigneeCountBaseFilters]
  );

  const assignedToAllFilters = useMemo(
    () => ({
      ...assigneeCountBaseFilters,
      filterForm: {
        ...(assigneeCountBaseFilters?.filterForm || {}),
        assignee: "ASSIGNED_TO_ALL",
      },
    }),
    [assigneeCountBaseFilters]
  );

  const { data: assignedToMeInboxData } = Digit.Hooks.noc.useInbox({
    tenantId: effectiveTenantId,
    filters: assignedToMeFilters,
    config: { enabled: !!tenantId },
  });

  const { data: assignedToAllInboxData } = Digit.Hooks.noc.useInbox({
    tenantId: effectiveTenantId,
    filters: assignedToAllFilters,
    config: { enabled: !!tenantId },
  });

  useEffect(() => {
    if (hasCapturedAssigneeCounts.current) return;
    if (!assignedToMeInboxData || !assignedToAllInboxData) return;

    setAssigneeCounts({
      ASSIGNED_TO_ME: assignedToMeInboxData?.totalCount || 0,
      ASSIGNED_TO_ALL: assignedToAllInboxData?.totalCount || 0,
    });
    hasCapturedAssigneeCounts.current = true;
  }, [assignedToAllInboxData, assignedToMeInboxData]);

  useEffect(() => {
    if (inboxData) {
      const groupedStatuses = (inboxData?.statuses || []).reduce((acc, status) => {
        const key = status?.applicationstatus || status?.statusCode;
        const count = status?.totalCount ?? status?.count ?? status?.noOfRecords ?? status?.totalRecords ?? status?.applicationCount ?? 0;

        if (!key) {
          acc.push(status);
          return acc;
        }

        const existingStatus = acc.find((item) => (item?.applicationstatus || item?.statusCode) === key);

        if (existingStatus) {
          existingStatus.totalCount = (existingStatus.totalCount || 0) + count;
          existingStatus.count = existingStatus.totalCount;
          existingStatus.noOfRecords = existingStatus.totalCount;
          existingStatus.totalRecords = existingStatus.totalCount;
          existingStatus.applicationCount = existingStatus.totalCount;
          return acc;
        }

        acc.push({
          ...status,
          totalCount: count,
          count,
          noOfRecords: count,
          totalRecords: count,
          applicationCount: count,
          selectionValue: key,
          selectionValues: [key],
        });
        return acc;
      }, []);

      setStatusData(groupedStatuses);
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
    tenantId,
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
      const resolvedStatuses =
        filterData.applicationStatus?.map((item) => item.applicationstatus || item.statusCode || item.code) || [];

      if (filterData.applicationStatus) {
        setFilterFormValue("applicationStatus", resolvedStatuses);
      }
      if (filterData.assignee) {
        setFilterFormValue("assignee", filterData.assignee);
      }

      dispatch({
        action: "mutateFilterForm",
        data: {
          ...formState?.filterForm,
          applicationStatus: resolvedStatuses,
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
      setFilterFormValue("moduleName", formState.filterForm.moduleName || "noc-service");
      setFilterFormValue("applicationStatus", formState.filterForm.applicationStatus || []);
      setFilterFormValue("assignee", formState.filterForm.assignee || "ASSIGNED_TO_ME");
      setFilterFormValue("businessService", formState.filterForm.businessService || "obpas_noc");
      setFilterFormValue("locality", formState.filterForm.locality || []);
    }
  }, [
    formState?.filterForm?.moduleName,
    formState?.filterForm?.applicationStatus,
    formState?.filterForm?.assignee,
    formState?.filterForm?.businessService,
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
    (label, status) => {
      setActiveStatusTab(label);
      if (label === "CLEAR") {
        setTopBarSearch("");
        return;
      }
      if (label === "ALL") {
        setFilterFormValue("applicationStatus", [], { shouldDirty: true, shouldTouch: true });
        handleFilterFormSubmit(onFilterFormSubmit)();
        return;
      }
      const resolvedCode = status?.applicationstatus || label;
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
              assigneeCounts={assigneeCounts}
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
