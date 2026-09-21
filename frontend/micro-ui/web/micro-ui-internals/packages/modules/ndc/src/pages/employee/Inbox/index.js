import React, { useCallback, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { InboxPagination, InboxWrapper } from "../../../../../templates/Inbox/components";
import { businessServiceList } from "../../../utils";
import NDCInboxFilters from "./NDCInboxFilters";
import NDCInboxSearch from "./NDCInboxSearch";
import useInboxTableConfig from "./useInboxTableConfig";

const Inbox = ({ parentRoute }) => {
  const { t } = useTranslation();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const isMobile = Digit.Utils.browser.isMobile();

  const searchFormDefaultValues = useMemo(
    () => ({
      applicationNo: "",
      mobileNumber: "",
    }),
    []
  );

  const filterFormDefaultValues = useMemo(
    () => ({
      moduleName: "ndc-services",
      applicationStatus: [],
      businessService: null,
      locality: [],
      assignee: "ASSIGNED_TO_ALL",
      businessServiceArray: businessServiceList(true) || [],
    }),
    []
  );

  const tableOrderFormDefaultValues = useMemo(
    () => ({
      sortBy: "",
      limit: isMobile ? 50 : 10,
      offset: 0,
      sortOrder: "DESC",
    }),
    [isMobile]
  );

  function formReducer(state, payload) {
    const nextState = { ...state, [payload.key]: payload.data };
    Digit.SessionStorage.set("NDC.INBOX", nextState);
    return nextState;
  }

  const storedInboxState = Digit.SessionStorage.get("NDC.INBOX");
  const formInitValue = useMemo(
    () => ({
      filterForm: {
        ...filterFormDefaultValues,
        ...(storedInboxState?.filterForm || {}),
        applicationStatus: Array.isArray(storedInboxState?.filterForm?.applicationStatus)
          ? storedInboxState.filterForm.applicationStatus
          : [],
      },
      searchForm: {
        ...searchFormDefaultValues,
        ...(storedInboxState?.searchForm || {}),
      },
      tableForm: {
        ...tableOrderFormDefaultValues,
        ...(storedInboxState?.tableForm || {}),
        limit: Number(storedInboxState?.tableForm?.limit) || tableOrderFormDefaultValues.limit,
        offset: 0,
      },
    }),
    [filterFormDefaultValues, searchFormDefaultValues, storedInboxState, tableOrderFormDefaultValues]
  );

  const [formState, dispatch] = useReducer(formReducer, formInitValue);

  const inboxFilters = useMemo(
    () => ({
      ...formState,
      getFilter: {
        applicationStatus: (formState.filterForm?.applicationStatus || []).map((code) => ({ code })),
      },
    }),
    [formState]
  );

  const { isLoading: isInboxLoading, data } = Digit.Hooks.ndc.useInbox({
    tenantId,
    filters: inboxFilters,
    config: { enabled: Boolean(tenantId) },
  });

  const table = data?.table || [];
  const totalCount = data?.totalCount || 0;
  const statuses = useMemo(() => {
    return (data?.statuses || []).reduce((accumulator, status) => {
      const statusCode = status?.applicationstatus || status?.statusCode || status?.status;
      const count = status?.count ?? status?.totalCount ?? status?.noOfRecords ?? 0;

      if (!statusCode) return accumulator;

      const existingStatus = accumulator.find((item) => item.applicationstatus === statusCode);
      if (existingStatus) {
        existingStatus.count += count;
        existingStatus.totalCount = existingStatus.count;
      } else {
        accumulator.push({
          ...status,
          applicationstatus: statusCode,
          count,
          totalCount: count,
          selectionValue: statusCode,
          selectionValues: [statusCode],
        });
      }

      return accumulator;
    }, []);
  }, [data?.statuses]);

  const updateTableForm = useCallback(
    (nextValues) => {
      dispatch({
        key: "tableForm",
        data: { ...formState.tableForm, ...nextValues },
      });
    },
    [formState.tableForm]
  );

  const handleSearch = useCallback(
    ({ applicationNo, mobileNumber }) => {
      updateTableForm({ offset: 0 });
      dispatch({
        key: "searchForm",
        data: {
          applicationNo: String(applicationNo || "").trim(),
          mobileNumber: String(mobileNumber || "").trim(),
        },
      });
    },
    [updateTableForm]
  );

  const handleStatusChange = useCallback(
    (applicationStatus) => {
      updateTableForm({ offset: 0 });
      dispatch({
        key: "filterForm",
        data: { ...formState.filterForm, applicationStatus },
      });
    },
    [formState.filterForm, updateTableForm]
  );

  const onPageSizeChange = useCallback(
    (event) => {
      updateTableForm({ limit: Number(event.target.value), offset: 0 });
    },
    [updateTableForm]
  );

  const tableProps = useInboxTableConfig({
    parentRoute,
    onPageSizeChange,
    formState,
    totalCount,
    table,
    dispatch,
    onSortingByData: () => {},
  });

  return (
    <InboxWrapper
      title={t("ES_COMMON_INBOX")}
      totalCount={totalCount}
      isLoading={isInboxLoading}
      tableData={table}
      tableProps={tableProps}
      tableHeader="MODULE_NKS_NO_DUE_CERTIFICATE_FEES"
      filterSection={
        <NDCInboxFilters
          statuses={statuses}
          isInboxLoading={isInboxLoading}
          selectedStatuses={formState.filterForm?.applicationStatus}
          onStatusChange={handleStatusChange}
        />
      }
      topBar={<NDCInboxSearch values={formState.searchForm} onSearch={handleSearch} />}
      pagination={
        <InboxPagination
          offset={formState.tableForm?.offset || 0}
          limit={formState.tableForm?.limit || 10}
          totalCount={totalCount}
          onPageSizeChange={onPageSizeChange}
          onNextPage={() => updateTableForm({ offset: formState.tableForm.offset + formState.tableForm.limit })}
          onPrevPage={() => updateTableForm({ offset: Math.max(0, formState.tableForm.offset - formState.tableForm.limit) })}
        />
      }
    />
  );
};

export default Inbox;
