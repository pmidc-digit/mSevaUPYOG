import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Header } from "@mseva/digit-ui-react-components";

import DesktopInbox from "../../components/DesktopInbox";
import MobileInbox from "../../components/MobileInbox";

const Inbox = ({initialStates={}}) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { uuid } = Digit.UserService.getUser().info;
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  //const [searchParams, setSearchParams] = useState({ filters: { wfFilters: { assignee: [{ code: uuid }] } }, search: "", sort: {} });
  
  const [sortParams, setSortParams] = useState(initialStates?.sortParams || [{ id: "applicationStatus", desc: false }]);
  const [searchParams, setSearchParams] = useState(initialStates.searchParams || {});
  let isMobile = Digit.Utils.browser.isMobile();

  const ttID = localStorage.getItem("punjab-tenantId");
  const tenantIdCheck = ttID || tenantId;
  const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantIdCheck, "admin", {}, t);

  useEffect(() => {
    (async () => {
      const applicationStatus = searchParams?.filters?.pgrfilters?.applicationStatus?.map((e) => e.code).join(",");
      let response = await Digit.PGRService.count(tenantId, applicationStatus?.length > 0 ? { applicationStatus } : {});
      if (response?.count) {
        setTotalRecords(response.count);
      }
    })();
  }, [searchParams, pageOffset, pageSize]);

  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + 10);
  };

  const fetchPrevPage = () => {
    setPageOffset((prevState) => prevState - 10);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  const handleFilterChange = (filterParam) => {
    setSearchParams({ ...searchParams, filters: filterParam });
  };

  const onSearch = (params = "") => {
    console.log("params", params);
    setSearchParams({ ...searchParams, search: params });
  };

  const queryParams = useMemo(() => {
    return { ...searchParams, offset: pageOffset, limit: pageSize };
  }, [searchParams, pageOffset, pageSize]);
  // let complaints = Digit.Hooks.pgr.useInboxData(searchParams) || [];
  //let { data: complaints, isLoading } = Digit.Hooks.pgr.useInboxData({ ...searchParams, offset: pageOffset, limit: pageSize }) ;

    let paginationParams = isMobile
    ? { limit: 100, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
    : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };
  
   let { data: complaints, isLoading, refetch } = Digit.Hooks.pgr.useInbox({
    tenantId,
    filters: { ...searchParams, ...paginationParams, sortParams },
    config: {},
  });


  if (complaints?.length !== null) {
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
