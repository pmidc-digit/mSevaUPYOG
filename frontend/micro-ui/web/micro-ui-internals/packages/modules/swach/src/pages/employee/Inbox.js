import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Header } from "@mseva/digit-ui-react-components";

import DesktopInbox from "../../components/DesktopInbox";
import MobileInbox from "../../components/MobileInbox";

const Inbox = ({ initialStates = {} }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { uuid } = Digit.UserService.getUser().info;
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortParams, setSortParams] = useState(initialStates?.sortParams || [{ id: "applicationStatus", desc: false }]);
  // const [searchParams, setSearchParams] = useState({ filters: { wfFilters: { assignee: [{ code: "" }] } }, search: "", sort: {} });
  const [searchParams, setSearchParams] = useState(initialStates.searchParams || {});
  let isMobile = Digit.Utils.browser.isMobile();

  const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantId, "admin", {}, t);

  useEffect(() => {
    (async () => {
      const applicationStatus = searchParams?.filters?.swachfilters?.applicationStatus?.map((e) => e.code).join(",");
      let response = await Digit.SwachService.count(tenantId, applicationStatus?.length > 0 ? { applicationStatus } : {});
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
    setSearchParams({ ...searchParams, search: params });
  };

  let paginationParams = isMobile
    ? { limit: 100, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
    : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };

  // let complaints = Digit.Hooks.swach.useInboxData(searchParams) || [];
  // let { data: complaints, isLoading: swachLoading } = Digit.Hooks.swach.useInboxData({ ...searchParams, offset: pageOffset, limit: pageSize });
  // console.log("complaints ----- ", complaints);

  let { data: complaints, isLoading, refetch } = Digit.Hooks.swach.useInbox({
    tenantId,
    filters: { ...searchParams, ...paginationParams, sortParams },
    config: {},
  });

  // console.log("swachData=======", swachData);

  if (complaints?.table?.length !== null) {
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
