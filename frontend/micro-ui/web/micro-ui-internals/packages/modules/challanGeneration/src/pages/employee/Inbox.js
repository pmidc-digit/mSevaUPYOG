import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { InboxPagination, InboxWrapper } from "../../../../templates/Inbox/components";
import ChallanInboxFilters from "../../components/inbox/ChallanInboxFilters";
import ChallanInboxSearch from "../../components/inbox/ChallanInboxSearch";
import useChallanInboxTableConfig from "../../components/inbox/useChallanInboxTableConfig";

const DEFAULT_FILTERS = {
  challanNo: "",
  mobileNumber: "",
  status: [],
  businessService: [],
};

const Inbox = ({ parentRoute, initialStates = {} }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const isMobile = Digit.Utils.browser.isMobile();
  const storedInboxState = Digit.SessionStorage.get("Challan.INBOX");
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...(initialStates?.searchParams || {}),
    ...(storedInboxState?.filters || {}),
  }));
  const [pageSize, setPageSize] = useState(storedInboxState?.pageSize || (isMobile ? 50 : 10));
  const [pageOffset, setPageOffset] = useState(0);

  const inboxFilters = useMemo(
    () => ({
      ...filters,
      limit: pageSize,
      offset: pageOffset,
      sortOrder: "DESC",
    }),
    [filters, pageOffset, pageSize]
  );

  const { isLoading, data } = Digit.Hooks.challangeneration.useInbox({
    tenantId,
    filters: inboxFilters,
    config: { enabled: Boolean(tenantId) },
  });

  const statuses = useMemo(() => {
    return (data?.statuses || []).reduce((accumulator, status) => {
      const statusCode = status?.applicationstatus || status?.statusCode;
      const count = status?.count ?? status?.totalCount ?? status?.noOfRecords ?? 0;

      if (!statusCode) return accumulator;

      const existing = accumulator.find((item) => item.applicationstatus === statusCode);
      if (existing) {
        existing.count += count;
        existing.totalCount = existing.count;
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

  const table = data?.table || [];
  const totalCount = data?.totalCount || 0;

  useEffect(() => {
    Digit.SessionStorage.set("Challan.INBOX", { filters, pageSize });
  }, [filters, pageSize]);

  const updateFilters = useCallback((nextValues) => {
    setPageOffset(0);
    setFilters((current) => ({ ...current, ...nextValues }));
  }, []);

  const handleSearch = useCallback(
    ({ challanNo, mobileNumber }) => {
      updateFilters({
        challanNo: String(challanNo || "").trim(),
        mobileNumber: String(mobileNumber || "").trim(),
      });
    },
    [updateFilters]
  );

  const handleStatusChange = useCallback(
    (selectedStatuses) => {
      updateFilters({ status: selectedStatuses });
    },
    [updateFilters]
  );

  const handleOffenceTypeChange = useCallback(
    (offenceTypes) => {
      updateFilters({ businessService: offenceTypes });
    },
    [updateFilters]
  );

  const tableProps = useChallanInboxTableConfig({
    parentRoute,
    tenantId,
    table,
    totalCount,
  });

  return (
    <InboxWrapper
      title={t("ES_COMMON_INBOX")}
      totalCount={totalCount}
      isLoading={isLoading}
      tableData={table}
      tableProps={tableProps}
      tableHeader="ACTION_TEST_CHALLANGENERATION"
      filterSection={
        <ChallanInboxFilters
          statuses={statuses}
          isInboxLoading={isLoading}
          selectedStatuses={filters.status}
          selectedOffenceTypes={filters.businessService}
          onStatusChange={handleStatusChange}
          onOffenceTypeChange={handleOffenceTypeChange}
        />
      }
      topBar={<ChallanInboxSearch values={filters} onSearch={handleSearch} />}
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
