import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { InboxPagination, InboxWrapper } from "../../../../templates/Inbox/components";
import RALInboxFilters from "./RALInboxFilters";
import RALInboxSearch from "./RALInboxSearch";
import useRALInboxTableConfig from "./useRALInboxTableConfig";

const DEFAULT_FILTERS = {
  uuid: { code: "ASSIGNED_TO_ALL", name: "ES_INBOX_ASSIGNED_TO_ALL" },
  services: ["RENT_N_LEASE_NEW", "RENT_AND_LEASE_LG"],
  applicationStatus: [],
  locality: [],
  applicationNumber: "",
  mobileNumber: "",
};

const Inbox = ({ parentRoute, initialStates = {}, moduleCode = "RAL" }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const isMobile = Digit.Utils.browser.isMobile();
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...(initialStates?.searchParams || {}),
    applicationStatus: Array.isArray(initialStates?.searchParams?.applicationStatus) ? initialStates.searchParams.applicationStatus : [],
  }));
  const [pageSize, setPageSize] = useState(initialStates?.pageSize || (isMobile ? 50 : 10));
  const [pageOffset, setPageOffset] = useState(initialStates?.pageOffset || 0);

  const inboxFilters = useMemo(
    () => ({
      ...filters,
      limit: pageSize,
      offset: pageOffset,
      sortBy: "createdTime",
      sortOrder: "DESC",
    }),
    [filters, pageOffset, pageSize]
  );

  const { isFetching, isLoading, data } = Digit.Hooks.useNewInboxGeneral({
    tenantId,
    ModuleCode: moduleCode,
    filters: inboxFilters,
    config: { enabled: Boolean(tenantId) },
  });

  const rawStatuses = data?.[0]?.statusMap || [];
  const statuses = useMemo(() => {
    return rawStatuses.reduce((accumulator, status) => {
      const statusCode = status?.applicationstatus || status?.applicationStatus || status?.state;
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
  }, [rawStatuses]);

  const table = useMemo(() => (data || []).filter((row) => !row?.dataEmpty), [data]);
  const totalCount = Number(data?.[0]?.totalCount || 0);
  const selectedStatuses = useMemo(
    () =>
      (filters.applicationStatus || [])
        .map((status) => status?.applicationStatus || status?.applicationstatus || status?.state || status?.code || status)
        .filter(Boolean),
    [filters.applicationStatus]
  );

  const updateFilters = useCallback((nextValues) => {
    setPageOffset(0);
    setFilters((current) => ({ ...current, ...nextValues }));
  }, []);

  const handleSearch = useCallback(
    ({ applicationNumber, mobileNumber }) => {
      updateFilters({
        applicationNumber: String(applicationNumber || "").trim(),
        mobileNumber: String(mobileNumber || "").trim(),
      });
    },
    [updateFilters]
  );

  const handleStatusChange = useCallback(
    (selectedStatusCodes) => {
      const applicationStatus = selectedStatusCodes.map((statusCode) => {
        const matchingStatus = rawStatuses.find(
          (status) => (status?.applicationstatus || status?.applicationStatus || status?.state) === statusCode
        );

        return {
          ...matchingStatus,
          applicationStatus: matchingStatus?.applicationStatus || matchingStatus?.applicationstatus || matchingStatus?.state || statusCode,
          state: matchingStatus?.state || matchingStatus?.applicationStatus || matchingStatus?.applicationstatus || statusCode,
        };
      });

      updateFilters({ applicationStatus });
    },
    [rawStatuses, updateFilters]
  );

  const tableProps = useRALInboxTableConfig({ parentRoute, table, totalCount });

  return (
    <InboxWrapper
      title={t("ES_COMMON_INBOX")}
      totalCount={totalCount}
      isLoading={isLoading || isFetching}
      tableData={table}
      tableProps={tableProps}
      tableHeader="RENT_AND_LEASE_APPLICATION"
      filterSection={
        <RALInboxFilters
          statuses={statuses}
          isInboxLoading={isLoading || isFetching}
          selectedStatuses={selectedStatuses}
          onStatusChange={handleStatusChange}
        />
      }
      topBar={<RALInboxSearch values={filters} onSearch={handleSearch} />}
      pagination={
        <InboxPagination
          offset={pageOffset}
          limit={pageSize}
          totalCount={totalCount}
          onPageSizeChange={(event) => {
            setPageSize(Number(event.target.value));
            setPageOffset(0);
          }}
          onNextPage={() => setPageOffset((current) => current + pageSize)}
          onPrevPage={() => setPageOffset((current) => Math.max(0, current - pageSize))}
        />
      }
    />
  );
};

export default Inbox;
