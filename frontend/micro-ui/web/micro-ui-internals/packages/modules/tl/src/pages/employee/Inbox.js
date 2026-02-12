import { Header, Loader } from "@mseva/digit-ui-react-components";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DesktopInbox from "../../components/inbox/DesktopInbox";
import MobileInbox from "../../components/inbox/MobileInbox";

const Inbox = ({ parentRoute, businessService = "TL", initialStates = {}, filterComponent, isInbox }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [enableSarch, setEnableSearch] = useState(() => (isInbox ? {} : { enabled: false }));

  const { t } = useTranslation();
  const [pageOffset, setPageOffset] = useState(initialStates?.pageOffset || 0);
  const [pageSize, setPageSize] = useState(initialStates?.pageSize || 10);
  const [sortParams, setSortParams] = useState(initialStates?.sortParams || [{ id: "applicationDate", desc: true }]);
  const [setSearchFieldsBackToOriginalState, setSetSearchFieldsBackToOriginalState] = useState(false);
  const [searchParams, setSearchParams] = useState(initialStates?.searchParams || {});
  const [totalRecords, setTotalRecords] = useState(undefined);

  const ttID = localStorage.getItem("punjab-tenantId");
  const tenantIdCheck = ttID || tenantId;

  const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantIdCheck, "admin", {}, t);
 

  let isMobile = window.Digit.Utils.browser.isMobile();
  let paginationParams = isMobile
    ? { limit: 100, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
    : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };

  const { isFetching, isLoading, searchResponseKey, data, searchFields, ...rest } = Digit.Hooks.tl.useInbox({
    tenantId,
    filters: { ...searchParams, ...paginationParams, sortParams },
    config: {},
  });

  // useEffect(() => {
  //   (async () => {
  //     // debugger;
  //     // const applicationStatus = searchParams?.filters?.tlfilters?.applicationStatus?.map((e) => e.code).join(",");
  //     // const assigneeCode = searchParams?.filters?.wfFilters?.assignee?.[0]?.code;
  //     // let response = await Digit.SwachService.count(tenantId, applicationStatus?.length > 0 ? { applicationStatus } : {});
  //     // if (response?.count) {
  //     //   setTotalRecords(response.count);
  //     // }
  //   })();
  // }, [searchParams, pageOffset, pageSize]);

  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + pageSize);
  };

  const fetchPrevPage = () => {
    setPageOffset((prevState) => prevState - pageSize);
  };

  const handleFilterChange = (filterParam) => {
    setSearchParams({ ...searchParams, filters: filterParam });
  };

  const onSearch = (params = "") => {
    setSearchParams({ ...searchParams, search: params });
  };

  // const handleSort = useCallback((args) => {
  //   if (args.length === 0) return;
  //   setSortParams(args);
  // }, []);

  const handleSort = useCallback((args) => {
    if (args?.length === 0) return;
    setSortParams(args);
  }, []);

  const handlePageSizeChange = (e) => {
    setPageOffset(0);
    setPageSize(Number(e.target.value));
  };

  const getSearchFields = () => {
    return [
      {
        label: t("TL_HOME_SEARCH_RESULTS_APP_NO_LABEL"),
        name: "applicationNumber",
        placeholder: t("TL_HOME_SEARCH_RESULTS_APP_NO_PLACEHOLDER"),
      },
      {
        label: t("CORE_COMMON_MOBILE_NUMBER"),
        name: "mobileNumber",
        placeholder: t("TL_HOME_SEARCH_RESULTS_OWN_MOB_PLACEHOLDER"),
        maxlength: 10,

        pattern: Digit.Utils.getPattern("MobileNo"),

        type: "mobileNumber",

        title: t("ES_SEARCH_APPLICATION_MOBILE_INVALID"),
        componentInFront: "+91",
      },
    ];
  };

  //DONOT DELETE NEEDS IMPOVEMENT
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  // const { t } = useTranslation();

  // const isMobile = window.Digit.Utils.browser.isMobile();

  // // let paginationParams = isMobile
  // //   ? { limit: 100, offset: 0, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
  // //   : { limit: pageSize, offset: pageOffset, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };

  // const [ filters, setFilters, clearFilter ] = Digit.Hooks.useSessionStorage(`${businessService}.${tenantId}`, {
  //   offset: 0,
  //   limit: 10,
  //   applicationType: "NEW"
  // })

  // const { inbox: inboxData, wf: wfData, isLoading: dataLoading } = Digit.Hooks.tl.useInbox({
  //   tenantId,
  //   filters,
  //   config:{}
  // })
  if (data?.table?.length !== null) {
    if (isMobile) {
      return (
        <MobileInbox
          data={data}
          isLoading={isLoading}
          searchFields={getSearchFields()}
          onFilterChange={handleFilterChange}
          onSearch={onSearch}
          onNextPage={fetchNextPage}
          onPrevPage={fetchPrevPage}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
          parentRoute={parentRoute}
          searchParams={searchParams}
          sortParams={sortParams}
          filterComponent={filterComponent}
          localities={localities}
        />
      );
    } else {
      return (
        <div>
          {isInbox && (
            <Header>
              {t("ES_COMMON_INBOX")}
              {data?.totalCount ? <p className="inbox-count">{data?.totalCount}</p> : null}
            </Header>
          )}
          <DesktopInbox
            businessService={businessService}
            data={data}
            tableConfig={rest?.tableConfig}
            isLoading={isLoading}
            defaultSearchParams={initialStates.searchParams}
            isSearch={!isInbox}
            onFilterChange={handleFilterChange}
            searchFields={getSearchFields()}
            setSearchFieldsBackToOriginalState={setSearchFieldsBackToOriginalState}
            setSetSearchFieldsBackToOriginalState={setSetSearchFieldsBackToOriginalState}
            onSearch={onSearch}
            onSort={handleSort}
            onNextPage={fetchNextPage}
            onPrevPage={fetchPrevPage}
            currentPage={Math.floor(pageOffset / pageSize)}
            pageSizeLimit={pageSize}
            disableSort={false}
            onPageSizeChange={handlePageSizeChange}
            parentRoute={parentRoute}
            searchParams={searchParams}
            sortParams={sortParams}
            totalRecords={totalRecords}
            filterComponent={filterComponent}
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
