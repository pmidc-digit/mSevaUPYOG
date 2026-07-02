import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Toast, Dropdown } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import NewFilterFormFieldComponent from "../../../../../templates/Inbox/NewFilterFormFieldsComponent";
import { InboxTopBar, InboxWrapper, InboxPagination } from "../../../../../templates/Inbox/components";
import useCLUTableConfig from "./useCLUTableConfig";

const CLUInbox = ({ parentRoute }) => {
  const { t } = useTranslation();
  const [error, setError] = useState({
    error: false,
    label: "",
  });

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const { data: cities } = Digit.Hooks.useTenants();
  // const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentTenantId() : localStorage.getItem("CITIZEN.CITY");

  const [activeStatusTab, setActiveStatusTab] = useState("ALL");
  const [topBarSearch, setTopBarSearch] = useState("");

  const searchFormDefaultValues = useMemo(
    () => ({
      mobileNumber: "",
      applicationNumber: "",
    }),
    []
  );

  const filterFormDefaultValues = useMemo(
    () => ({
      moduleName: "clu-service",
      applicationStatus: [],
      businessService: "clu_mcl",
      assignee: "ASSIGNED_TO_ME",
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
      sortOrder: "ASC",
    }),
    [isMobileDevice]
  );

  function formReducer(state, payload) {
    switch (payload.action) {
      case "mutateSearchForm":
        Digit.SessionStorage.set("CLU.INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("CLU.INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("CLU.INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      case "mutateSelectedTenantId":
        Digit.SessionStorage.set("CLU.INBOX", { ...state, selectedTenantId: payload.data });
        return { ...state, selectedTenantId: payload.data };
      default:
        break;
    }
  }

  const inboxObjectInSessionStorage = Digit.SessionStorage.get("CLU.INBOX");

  const formInitValue = useMemo(() => {
    if (inboxObjectInSessionStorage) {
      const sessionLimit = parseInt(inboxObjectInSessionStorage.tableForm?.limit, 10);
      const validLimit = [10, 20, 30, 40, 50].includes(sessionLimit) ? sessionLimit : tableOrderFormDefaultValues.limit;
      const sessionFilterForm = inboxObjectInSessionStorage.filterForm || filterFormDefaultValues;
      return {
        filterForm: {
          ...sessionFilterForm,
          applicationStatus: [],
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
  }, [inboxObjectInSessionStorage, filterFormDefaultValues, searchFormDefaultValues, tableOrderFormDefaultValues, selectedTenantIdDefaultValues]);

  const [formState, dispatch] = useReducer(formReducer, formInitValue);
  const [tableData, setTableData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topBarStatusData, setTopBarStatusData] = useState([]);
  const [totalCountData, setTotalCountData] = useState(0);
  const [assigneeCounts, setAssigneeCounts] = useState({
    ASSIGNED_TO_ME: 0,
    ASSIGNED_TO_ALL: 0,
  });
  const capturedAssigneeCountsTenant = useRef(null);

  const getResolvedStatuses = useCallback((applicationStatuses = []) => {
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

  const setSelectedTenantIdValue = useCallback(
    (key, value) => {
      dispatch({ action: "mutateSelectedTenantId", data: { ...formState.selectedTenantId, [key]: value } });
    },
    [formState.selectedTenantId]
  );

  const memoizedFilters = useMemo(() => {
    const normalizedFilterForm = {
      ...(formState?.filterForm || filterFormDefaultValues),
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

  const effectiveTenantId = tenantId === "pb.punjab" ? formState?.selectedTenantId?.tenantId || cities?.[0]?.code || tenantId : tenantId;

  useEffect(() => {
    if (tenantId !== "pb.punjab") return;
    if (!cities?.length) return;
    if (formState?.selectedTenantId?.tenantId) return;

    dispatch({
      action: "mutateSelectedTenantId",
      data: { ...(formState?.selectedTenantId || {}), tenantId: cities[0].code },
    });
  }, [cities, formState?.selectedTenantId, tenantId]);

  const { isLoading: isInboxLoading, data: inboxData, isError } = Digit.Hooks.obps.useCLUInbox({
    tenantId: effectiveTenantId,
    filters: memoizedFilters,
    config: {
      enabled: !!tenantId,
    },
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

  const { data: assignedToMeInboxData } = Digit.Hooks.obps.useCLUInbox({
    tenantId: effectiveTenantId,
    filters: assignedToMeFilters,
    config: {
      enabled: !!tenantId,
    },
  });

  const { data: assignedToAllInboxData } = Digit.Hooks.obps.useCLUInbox({
    tenantId: effectiveTenantId,
    filters: assignedToAllFilters,
    config: {
      enabled: !!tenantId,
    },
  });

  useEffect(() => {
    if (capturedAssigneeCountsTenant.current === effectiveTenantId) return;
    setAssigneeCounts({
      ASSIGNED_TO_ME: 0,
      ASSIGNED_TO_ALL: 0,
    });
  }, [effectiveTenantId]);

  useEffect(() => {
    if (!assignedToMeInboxData || !assignedToAllInboxData) return;
    if (capturedAssigneeCountsTenant.current === effectiveTenantId) return;

    setAssigneeCounts({
      ASSIGNED_TO_ME: assignedToMeInboxData?.totalCount || 0,
      ASSIGNED_TO_ALL: assignedToAllInboxData?.totalCount || 0,
    });
    capturedAssigneeCountsTenant.current = effectiveTenantId;
  }, [assignedToAllInboxData, assignedToMeInboxData, effectiveTenantId]);

  useEffect(() => {
    if (inboxData) {
      const duplicateStatusCounts = (inboxData?.statuses || []).reduce((acc, status) => {
        const statusKey = status?.applicationstatus;
        if (!statusKey) return acc;
        acc[statusKey] = (acc[statusKey] || 0) + 1;
        return acc;
      }, {});

      const groupedStatuses = (inboxData?.statuses || []).reduce((acc, status) => {
        const key = status?.applicationstatus;

        if (!key) {
          acc.push(status);
          return acc;
        }

        const count = status?.totalCount ?? status?.count ?? 0;
        const existingStatus = acc.find((item) => item?.applicationstatus === key);

        if (existingStatus) {
          existingStatus.totalCount = (existingStatus.totalCount || 0) + count;
          existingStatus.count = existingStatus.totalCount;
          existingStatus.statusids = [...new Set([...(existingStatus.statusids || []), status?.statusid].filter(Boolean))];
          return acc;
        }

        acc.push({
          ...status,
          selectionValue: undefined,
          selectionValues: status?.statusid ? [status.statusid] : [],
          statusid: `${key}_GROUP`,
          statusids: status?.statusid ? [status.statusid] : [],
          totalCount: count,
          count,
          businessService: null,
          businessservice: null,
        });
        return acc;
      }, []);

      setStatusData(
        groupedStatuses.map((status) => ({
          ...status,
          selectionValue: status?.selectionValue,
          selectionValues: status?.statusids || status?.selectionValues || [],
        }))
      );
      setTopBarStatusData(
        (inboxData?.statuses || []).map((status) => ({
          ...status,
          hasDuplicateName: (duplicateStatusCounts?.[status?.applicationstatus] || 0) > 1,
        }))
      );
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

  const propsForInboxTable = useCLUTableConfig({
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
      const resolvedStatuses = getResolvedStatuses(filterData.applicationStatus || []);

      setFilterFormValue("applicationStatus", resolvedStatuses);
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
    [formState?.filterForm, getResolvedStatuses, setFilterFormValue]
  );

  const filteredTopBarStatuses = useMemo(() => {
    const selectedStatusCodes = formState?.filterForm?.applicationStatus || [];

    if (!selectedStatusCodes.length) {
      return topBarStatusData;
    }

    const selectedStatusKeys = [
      ...new Set(
        statusData
          .filter((status) => (status?.statusids || []).some((statusId) => selectedStatusCodes.includes(statusId)))
          .map((status) => status?.applicationstatus)
          .filter(Boolean)
      ),
    ];

    if (!selectedStatusKeys.length) {
      return topBarStatusData;
    }

    return topBarStatusData.filter((status) => selectedStatusKeys.includes(status?.applicationstatus));
  }, [formState?.filterForm?.applicationStatus, statusData, topBarStatusData]);

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
      setFilterFormValue("moduleName", formState.filterForm.moduleName || "clu-service");
      setFilterFormValue("applicationStatus", formState.filterForm.applicationStatus || []);
      setFilterFormValue("assignee", formState.filterForm.assignee || "ASSIGNED_TO_ME");
      setFilterFormValue("businessService", formState.filterForm.businessService || "clu_mcl");
    }
  }, [
    formState?.filterForm?.moduleName,
    formState?.filterForm?.applicationStatus,
    formState?.filterForm?.assignee,
    formState?.filterForm?.businessService,
    setFilterFormValue,
  ]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const value = String(topBarSearch || "").trim();
      const nextSearchForm = value ? { applicationNumber: value } : {};
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
      const resolvedCode = Array.isArray(status?.statusids) && status.statusids.length ? status.statusids : status?.statusid ? [status.statusid] : [];
      setFilterFormValue("applicationStatus", resolvedCode, { shouldDirty: true, shouldTouch: true });
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
          tenantSelector={
            tenantId === "pb.punjab" && cities?.length ? (
              <div className="new-inbox-tenant-selector">
                <div className="filter-label sub-filter-label" style={{ fontSize: "18px", fontWeight: "600" }}>
                  {t("BPA_CITIES_DROPDOWN_LABEL")}
                </div>
                <div className="new-inbox-tenant-dropdown">
                  <Dropdown
                    option={cities}
                    selected={cities.find((city) => city.code === effectiveTenantId)}
                    select={(value) => setSelectedTenantIdValue("tenantId", value.code)}
                    optionKey="name"
                  />
                </div>
              </div>
            ) : null
          }
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
          // topBar={
          //   // <InboxTopBar
          //   //   statuses={filteredTopBarStatuses}
          //   //   activeTab={activeStatusTab}
          //   //   onTabClick={onStatusTabClick}
          //   //   searchValue={topBarSearch}
          //   //   onSearchChange={(e) => setTopBarSearch(e.target.value)}
          //   //   searchPlaceholder="Search by application number..."
          //   //   totalCount={totalCountData}
          //   // />
          // }
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

export default CLUInbox;
