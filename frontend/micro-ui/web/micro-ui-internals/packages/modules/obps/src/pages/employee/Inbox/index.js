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
  const defaultAssignee = isEmployee ? "ASSIGNED_TO_ME" : "ASSIGNED_TO_ALL";
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
      assignee: defaultAssignee,
      applicationType: [],
    }),
    [defaultAssignee]
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
      setFilterFormValue("assignee", defaultAssignee);
      setFilterFormValue("applicationType", []);
      dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues });
    },
    [defaultAssignee, filterFormDefaultValues]
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
      const sessionFilterForm = inboxObjectInSessionStorage.filterForm || {};
      return {
        filterForm: {
          ...filterFormDefaultValues,
          ...sessionFilterForm,
          assignee: isEmployee ? sessionFilterForm?.assignee || defaultAssignee : defaultAssignee,
        },
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
  }, [
    defaultAssignee,
    filterFormDefaultValues,
    inboxObjectInSessionStorage,
    isEmployee,
    searchFormDefaultValues,
    selectedTenantIdDefaultValues,
    tableOrderFormDefaultValues,
  ]);

  const [formState, dispatch] = useReducer(formReducer, formInitValue);
  const [tableData, setTableData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topBarStatusData, setTopBarStatusData] = useState([]);
  const [totalCountData, setTotalCountData] = useState(0);
  const [assigneeCounts, setAssigneeCounts] = useState({
    ASSIGNED_TO_ME: 0,
    ASSIGNED_TO_ALL: 0,
  });
  const hasCapturedAssigneeCounts = useRef(false);

  const getResolvedStatusIds = useCallback((applicationStatuses = []) => {
    return [
      ...new Set(
        applicationStatuses.reduce((acc, item) => {
          if (Array.isArray(item?.statusids) && item.statusids.length) {
            acc.push(...item.statusids);
          } else if (item?.statusid) {
            acc.push(item.statusid);
          } else if (item?.code) {
            acc.push(item.code);
          }
          return acc;
        }, [])
      ),
    ];
  }, []);

  const effectiveTenantId =
    isEmployee && tenantId === "pb.punjab" ? formState?.selectedTenantId?.tenantId || cities?.[0]?.code || tenantId : tenantId;

  const memoizedFilters = useMemo(() => {
    const normalizedFilterForm = {
      ...(formState?.filterForm || filterFormDefaultValues),
      businessService:
        formState?.filterForm?.businessService === "BPA" ? OBPS_BPA_NOR_BUSINESS_SERVICES : formState?.filterForm?.businessService || null,
    };

    if (!normalizedFilterForm?.applicationStatus?.length) {
      delete normalizedFilterForm.applicationStatus;
    }

    return {
      filterForm: normalizedFilterForm,
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

  const { data: assignedToMeInboxData } = Digit.Hooks.obps.useBPAInbox({
    tenantId: effectiveTenantId,
    filters: assignedToMeFilters,
    config: { enabled: !!tenantId && isEmployee },
  });

  const { data: assignedToAllInboxData } = Digit.Hooks.obps.useBPAInbox({
    tenantId: effectiveTenantId,
    filters: assignedToAllFilters,
    config: { enabled: !!tenantId && isEmployee },
  });

  useEffect(() => {
    if (!isEmployee) return;
    if (hasCapturedAssigneeCounts.current) return;
    if (!assignedToMeInboxData || !assignedToAllInboxData) return;

    setAssigneeCounts({
      ASSIGNED_TO_ME: assignedToMeInboxData?.totalCount || 0,
      ASSIGNED_TO_ALL: assignedToAllInboxData?.totalCount || 0,
    });
    hasCapturedAssigneeCounts.current = true;
  }, [assignedToAllInboxData, assignedToMeInboxData, isEmployee]);

  useEffect(() => {
    if (inboxData) {
      const duplicateStatusCounts = (inboxData?.statuses || []).reduce((acc, status) => {
        const statusKey = status?.applicationstatus;
        if (!statusKey) return acc;
        acc[statusKey] = (acc[statusKey] || 0) + 1;
        return acc;
      }, {});

      const topBarStatuses = (inboxData?.statuses || []).reduce((acc, status) => {
        const statusKey = status?.applicationstatus;
        const businessService = status?.businessService || status?.businessservice;
        const isDuplicateStatus = (duplicateStatusCounts?.[statusKey] || 0) > 1;

        if (!statusKey || !isDuplicateStatus) {
          acc.push({
            ...status,
            hasDuplicateName: isDuplicateStatus,
          });
          return acc;
        }

        const bucketType = businessService === "BPA_LOW" ? "SELF_CERTIFICATION" : "OTHERS";
        const existingStatus = acc.find((item) => item?.applicationstatus === statusKey && item?.bucketType === bucketType);
        const count = status?.totalCount ?? status?.count ?? 0;

        if (existingStatus) {
          existingStatus.totalCount = (existingStatus.totalCount || 0) + count;
          existingStatus.count = existingStatus.totalCount;
          existingStatus.statusids = [...new Set([...(existingStatus.statusids || []), status?.statusid].filter(Boolean))];
          return acc;
        }

        acc.push({
          ...status,
          statusid: `${statusKey}_${bucketType}`,
          statusids: status?.statusid ? [status.statusid] : [],
          totalCount: count,
          count,
          hasDuplicateName: true,
          bucketType,
          businessServiceLabel: bucketType === "SELF_CERTIFICATION" ? "Self Certification" : "Others",
        });
        return acc;
      }, []);

      const groupedStatuses = (inboxData?.statuses || []).reduce((acc, status) => {
        const statusKey = status?.applicationstatus;
        if (!statusKey) {
          acc.push(status);
          return acc;
        }

        const count = status?.totalCount ?? status?.count ?? 0;
        const existingStatus = acc.find((item) => item?.applicationstatus === statusKey);

        if (existingStatus) {
          existingStatus.totalCount = (existingStatus.totalCount || 0) + count;
          existingStatus.count = existingStatus.totalCount;
          existingStatus.statusids = [...new Set([...(existingStatus.statusids || []), status?.statusid].filter(Boolean))];
          return acc;
        }

        acc.push({
          ...status,
          statusid: `${statusKey}_GROUP`,
          statusids: status?.statusid ? [status.statusid] : [],
          totalCount: count,
          count,
          businessService: null,
          businessservice: null,
        });
        return acc;
      }, []);

      setStatusData(groupedStatuses);
      setTopBarStatusData(topBarStatuses);
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
      const resolvedIds = getResolvedStatusIds(filterData.applicationStatus || []);

      setFilterFormValue("applicationStatus", resolvedIds);
      if (filterData.assignee) {
        setFilterFormValue("assignee", filterData.assignee);
      }

      dispatch({
        action: "mutateFilterForm",
        data: {
          ...formState?.filterForm,
          applicationStatus: resolvedIds,
          assignee: filterData.assignee || formState?.filterForm?.assignee || defaultAssignee,
        },
      });
    },
    [defaultAssignee, formState?.filterForm, getResolvedStatusIds, setFilterFormValue]
  );

  const filteredTopBarStatuses = useMemo(() => {
    const selectedStatusIds = formState?.filterForm?.applicationStatus || [];

    if (!selectedStatusIds.length) {
      return topBarStatusData;
    }

    const selectedStatusKeys = [
      ...new Set(
        statusData
          .filter((status) => (status?.statusids || []).some((statusId) => selectedStatusIds.includes(statusId)))
          .map((status) => status?.applicationstatus)
          .filter(Boolean)
      ),
    ];

    if (!selectedStatusKeys.length) {
      return topBarStatusData;
    }

    return topBarStatusData.filter((status) => {
      return selectedStatusKeys.includes(status?.applicationstatus);
    });
  }, [formState?.filterForm?.applicationStatus, topBarStatusData]);

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
      setFilterFormValue("assignee", formState.filterForm.assignee || defaultAssignee);
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
    defaultAssignee,
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
        dispatch({
          action: "mutateTableForm",
          data: { ...formState.tableForm, offset: 0 },
        });
        dispatch({
          action: "mutateFilterForm",
          data: { ...formState.filterForm, applicationStatus: [] },
        });
        return;
      }
      const resolvedCode = Array.isArray(status?.statusids) && status.statusids.length ? status.statusids : status?.statusid ? [status.statusid] : [];
      setFilterFormValue("applicationStatus", resolvedCode, { shouldDirty: true, shouldTouch: true });
      dispatch({
        action: "mutateTableForm",
        data: { ...formState.tableForm, offset: 0 },
      });
      dispatch({
        action: "mutateFilterForm",
        data: { ...formState.filterForm, applicationStatus: resolvedCode },
      });
    },
    [formState.filterForm, formState.tableForm, setFilterFormValue]
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

  console.log("yes coming here");

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
              showAssigneeCards={isEmployee}
              handleFilter={handleFilterChange}
            />
          }
          topBar={
            <InboxTopBar
              statuses={filteredTopBarStatuses}
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
