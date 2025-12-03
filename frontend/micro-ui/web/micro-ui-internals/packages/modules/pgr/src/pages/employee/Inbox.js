import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Header } from "@mseva/digit-ui-react-components";

import DesktopInbox from "../../components/DesktopInbox";
import MobileInbox from "../../components/MobileInbox";

const Inbox = ({initialStates={}}) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  //const [searchParams, setSearchParams] = useState({ filters: { wfFilters: { assignee: [{ code: uuid }] } }, search: "", sort: {} });

  const [sortParams, setSortParams] = useState(initialStates?.sortParams || [{ id: "applicationStatus", desc: false }]);
  const [searchParams, setSearchParams] = useState(initialStates.searchParams || {});
  const [complaints, setComplaints] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let isMobile = Digit.Utils.browser.isMobile();

  const ttID = localStorage.getItem("punjab-tenantId");
  const tenantIdCheck = ttID || tenantId;
  const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantIdCheck, "admin", {}, t);

  useEffect(() => {
    // Skip if already loading
    if (isLoading) return;

    (async () => {
      setIsLoading(true);
      try {
        // Prepare pagination params
        const paginationParams = isMobile
          ? { limit: 100, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
          : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };

        // ✅ Call the inbox API service (NO separate count call)
        const transformedData = await Digit.PGRService.InboxApiPgrCall({
          tenantId: tenantIdCheck,
          filters: {
            ...searchParams,
            sortBy: paginationParams.sortBy,
            sortOrder: paginationParams.sortOrder,
            limit: paginationParams.limit,
            offset: paginationParams.offset,
          }
        });


        setComplaints(transformedData);
        
        // ✅ Use totalCount from the same API response
        if (transformedData?.totalCount !== undefined) {
          setTotalRecords(transformedData.totalCount);
        }
      } catch (e) {
        console.error("Error fetching inbox:", e);
        setComplaints({ table: [] });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [searchParams, pageOffset, pageSize, sortParams, isMobile, tenantIdCheck]);

  const fetchNextPage = useCallback(() => {
    setPageOffset((prevState) => prevState + pageSize);
  }, [pageSize]);

  const fetchPrevPage = useCallback(() => {
    setPageOffset((prevState) => Math.max(0, prevState - pageSize));
  }, [pageSize]);

  const handlePageSizeChange = useCallback((e) => {
    setPageOffset(0);
    setPageSize(Number(e.target.value));
  }, []);

  const handleFilterChange = useCallback((filterParam) => {
    setSearchParams((prev) => ({ ...prev, filters: filterParam }));
    setPageOffset(0);
  }, []);

  const onSearch = useCallback((params = "") => {
    setSearchParams((prev) => ({ ...prev, search: params }));
    setPageOffset(0);
  }, []);



  if (complaints?.table !== undefined) {
    if (isMobile) {
      return (
        <MobileInbox
          data={complaints?.table}
          isLoading={isLoading}
          onFilterChange={handleFilterChange}
          onSearch={onSearch}
          searchParams={searchParams}
          onNextPage={fetchNextPage}
          onPrevPage={fetchPrevPage}
          onPageSizeChange={handlePageSizeChange}
          currentPage={Math.floor(pageOffset / pageSize)}
          totalRecords={totalRecords}
          pageSizeLimit={pageSize}
        />
      );
    } else {
      return (
        <div>
          <Header>{t("ES_COMMON_INBOX")}</Header>
          <DesktopInbox
            data={complaints?.table}
            isLoading={isLoading}
            onFilterChange={handleFilterChange}
            onSearch={onSearch}
            searchParams={searchParams}
            onNextPage={fetchNextPage}
            onPrevPage={fetchPrevPage}
            onPageSizeChange={handlePageSizeChange}
            currentPage={Math.floor(pageOffset / pageSize)}
            totalRecords={totalRecords}
            pageSizeLimit={pageSize}
            localities={localities}
          />
        </div>
      );
    }
  } else {
    return <Loader />;
  }
};

export default Inbox;
