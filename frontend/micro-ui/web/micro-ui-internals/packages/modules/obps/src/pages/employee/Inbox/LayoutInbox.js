import React, { Fragment, useCallback, useEffect, useMemo, useReducer, useState, useRef } from "react";
import { Loader, Card, Table, CaseIcon, Dropdown } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import NewFilterFormFieldComponent from "../../../../../templates/Inbox/NewFilterFormFieldsComponent";
import { InboxTopBar, InboxWrapper, InboxPagination } from "../../../../../templates/Inbox/components";
import LayoutSearchFormFields from "./LayoutSearchFormFields";
import useInboxMobileCardsData from "./useInboxMobileCardsData";
import useLayoutTableConfig from "./useLayoutTableConfig";
import { Link } from "react-router-dom";
import { businessServiceListLayout } from "../../../utils";

const LayoutInbox = ({ parentRoute }) => {
  const { t } = useTranslation();
  let user = Digit.UserService.getUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scroll(0, 0);
    queryClient.invalidateQueries("INBOX_DATA");
  }, []);

  const userRoles = user?.info?.roles?.map((role) => role.code) || [];

  const hasViewOBPSCardRole = userRoles.includes("OBPAS_READ_ONLY");

  // const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentTenantId() : localStorage.getItem("CITIZEN.CITY");
  const isEmployee = window.location.href.includes("employee");
  const defaultAssignee = isEmployee && !hasViewOBPSCardRole ? "ASSIGNED_TO_ME" : "ASSIGNED_TO_ALL";
  const { data: cities } = Digit.Hooks.useTenants();
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
      moduleName: "layout-service",
      applicationStatus: [],
      businessService: "Layout_mcUp",
      assignee: "ASSIGNED_TO_ALL",
      // businessServiceArray: businessServiceListLayout(true) || [],
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
        Digit.SessionStorage.set("LAYOUT.INBOX", { ...state, searchForm: payload.data });
        return { ...state, searchForm: payload.data };
      case "mutateFilterForm":
        Digit.SessionStorage.set("LAYOUT.INBOX", { ...state, filterForm: payload.data });
        return { ...state, filterForm: payload.data };
      case "mutateTableForm":
        Digit.SessionStorage.set("LAYOUT.INBOX", { ...state, tableForm: payload.data });
        return { ...state, tableForm: payload.data };
      case "mutateSelectedTenantId":
        Digit.SessionStorage.set("LAYOUT.INBOX", { ...state, selectedTenantId: payload.data });
        return { ...state, selectedTenantId: payload.data };
      default:
        break;
    }
  }

  const InboxObjectInSessionStorage = Digit.SessionStorage.get("LAYOUT.INBOX");

  const onSearchFormReset = (setSearchFormValue) => {
    setSearchFormValue("mobileNumber", null);
    setSearchFormValue("applicationNumber", null);
    dispatch({ action: "mutateSearchForm", data: searchFormDefaultValues });
  };

  const onFilterFormReset = (setFilterFormValue) => {
    setFilterFormValue("moduleName", "layout-service");
    setFilterFormValue("applicationStatus", "");
    setFilterFormValue("assignee", "ASSIGNED_TO_ALL");
    dispatch({ action: "mutateFilterForm", data: filterFormDefaultValues });
  };

  const onSortFormReset = (setSortFormValue) => {
    setSortFormValue("sortOrder", "DESC");
    dispatch({ action: "mutateTableForm", data: tableOrderFormDefaultValues });
  };

  // Merge session storage with defaults to ensure tableForm has correct values
  const formInitValue = useMemo(() => {
    if (InboxObjectInSessionStorage) {
      const sessionLimit = parseInt(InboxObjectInSessionStorage.tableForm?.limit, 10);
      const validLimit = [10, 20, 30, 40, 50].includes(sessionLimit) ? sessionLimit : tableOrderFormDefaultValues.limit;
      return {
        filterForm: InboxObjectInSessionStorage.filterForm || filterFormDefaultValues,
        searchForm: InboxObjectInSessionStorage.searchForm || searchFormDefaultValues,
        tableForm: {
          ...tableOrderFormDefaultValues,
          ...(InboxObjectInSessionStorage.tableForm || {}),
          // Ensure limit is a valid number, reset offset to start from first page
          limit: validLimit,
          isCitizenView: "false", // always override
          offset: 0,
        },
        selectedTenantId: InboxObjectInSessionStorage.selectedTenantId || selectedTenantIdDefaultValues,
      };
    }
    return {
      filterForm: filterFormDefaultValues,
      searchForm: searchFormDefaultValues,
      tableForm: tableOrderFormDefaultValues,
      selectedTenantId: selectedTenantIdDefaultValues,
    };
  }, [InboxObjectInSessionStorage, filterFormDefaultValues, searchFormDefaultValues, selectedTenantIdDefaultValues, tableOrderFormDefaultValues]);

  const [formState, dispatch] = useReducer(formReducer, formInitValue);

  // State management for table, statuses, and totalCount
  const [tableData, setTableData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [totalCountData, setTotalCountData] = useState(0);
  const [assigneeCounts, setAssigneeCounts] = useState({
    ASSIGNED_TO_ME: 0,
    ASSIGNED_TO_ALL: 0,
  });

  const setSelectedTenantIdValue = useCallback(
    (key, value) => {
      dispatch({ action: "mutateSelectedTenantId", data: { ...formState.selectedTenantId, [key]: value } });
    },
    [formState.selectedTenantId]
  );

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
    selectedTenantIdDefaultValues,
    filterFormDefaultValues,
    searchFormDefaultValues,
    tableOrderFormDefaultValues,
  ]);

  const { isLoading: isInboxLoading, data: inboxData } = Digit.Hooks.obps.useLayoutInbox({
    tenantId: effectiveTenantId,
    filters: memoizedFilters,
    config: {
      staleTime: 0,
      refetchOnMount: "always",
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

  const { data: assignedToMeInboxData } = Digit.Hooks.obps.useLayoutInbox({
    tenantId: effectiveTenantId,
    filters: assignedToMeFilters,
    config: {
      staleTime: 0,
      refetchOnMount: "always",
    },
  });

  const { data: assignedToAllInboxData } = Digit.Hooks.obps.useLayoutInbox({
    tenantId: effectiveTenantId,
    filters: assignedToAllFilters,
    config: {
      staleTime: 0,
      refetchOnMount: "always",
    },
  });

  useEffect(() => {
    setAssigneeCounts({
      ASSIGNED_TO_ME: 0,
      ASSIGNED_TO_ALL: 0,
    });
  }, [effectiveTenantId]);

  useEffect(() => {
    if (!assignedToMeInboxData || !assignedToAllInboxData) return;

    setAssigneeCounts({
      ASSIGNED_TO_ME: assignedToMeInboxData?.totalCount || 0,
      ASSIGNED_TO_ALL: assignedToAllInboxData?.totalCount || 0,
    });
  }, [assignedToAllInboxData, assignedToMeInboxData]);

  useEffect(() => {
    if (inboxData) {
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

  const onMobileSortOrderData = (data) => {
    const { sortOrder } = data;
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, sortOrder } });
  };

  const onFilterFormSubmit = (data) => {
    data.hasOwnProperty("") && delete data?.[""];
    // Only reset offset when filtering, preserve the current limit
    dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } });
    dispatch({ action: "mutateFilterForm", data });
  };

  const propsForInboxTable = useLayoutTableConfig({
    parentRoute,
    onPageSizeChange,
    formState,
    totalCount: totalCountData,
    table: tableData,
    dispatch,
    onSortingByData,
  });

  // Setup form with react-hook-form
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

  const onResetFilterForm = useCallback(() => {
    onFilterFormReset(setFilterFormValue);
  }, [setFilterFormValue]);

  const handleFilterChange = useCallback(
    (filterData) => {
      const resolvedStatuses = getResolvedStatusIds(filterData.applicationStatus || []);

      // Update form values
      if (filterData.applicationStatus) {
        setFilterFormValue("applicationStatus", resolvedStatuses);
      }
      if (filterData.assignee) {
        setFilterFormValue("assignee", filterData.assignee);
      }
      // Dispatch to reducer to trigger data refetch
      dispatch({
        action: "mutateFilterForm",
        data: {
          ...formState?.filterForm,
          applicationStatus: resolvedStatuses,
          assignee: filterData.assignee || formState?.filterForm?.assignee || "ASSIGNED_TO_ALL",
        },
      });
    },
    [formState?.filterForm, getResolvedStatusIds, setFilterFormValue]
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

  // Form sync with reducer state
  useEffect(() => {
    if (formState?.filterForm) {
      setFilterFormValue("moduleName", formState.filterForm.moduleName || "layout-service");
      setFilterFormValue("applicationStatus", formState.filterForm.applicationStatus || []);
      setFilterFormValue("assignee", formState.filterForm.assignee || "ASSIGNED_TO_ALL");
      setFilterFormValue("businessService", formState.filterForm.businessService || "Layout_mcUp");
    }
  }, [
    formState?.filterForm?.moduleName,
    formState?.filterForm?.applicationStatus,
    formState?.filterForm?.assignee,
    formState?.filterForm?.businessService,
    setFilterFormValue,
  ]);

  // Search debounce
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const value = String(topBarSearch || "").trim();
      const nextSearchForm = value ? { applicationNumber: value } : {};
      // Only reset offset when searching, preserve the current limit
      dispatch({ action: "mutateTableForm", data: { ...formState.tableForm, offset: 0 } });
      dispatch({ action: "mutateSearchForm", data: nextSearchForm });
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [topBarSearch]);

  // Initialize filter form
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

  return (
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
          showAssigneeCards={isEmployee && !hasViewOBPSCardRole}
          isInboxLoading={isInboxLoading}
          assigneeCounts={assigneeCounts}
          handleFilter={handleFilterChange}
        />
      }
      topBar={
        <InboxTopBar
          statuses={[]}
          activeTab={activeStatusTab}
          onTabClick={onStatusTabClick}
          searchValue={topBarSearch}
          onSearchChange={(e) => setTopBarSearch(e.target.value)}
          searchPlaceholder="Search by application number..."
          totalCount={totalCountData}
          showClearTab={false}
          showAll={false}
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
  );
};

export default LayoutInbox;
