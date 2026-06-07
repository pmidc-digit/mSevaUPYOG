import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@mseva/digit-ui-react-components";
import { Link } from "react-router-dom";

import DesktopInbox from "../../components/DesktopInbox";
import MobileInbox from "../../components/MobileInbox";

const Inbox = ({
  useNewInboxAPI,
  parentRoute,
  moduleCode = "PT",
  initialStates = {},
  filterComponent,
  isInbox,
  rawWfHandler,
  rawSearchHandler,
  combineResponse,
  wfConfig,
  searchConfig,
  middlewaresWf,
  middlewareSearch,
  EmptyResultInboxComp,
}) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const { t } = useTranslation();
  const [enableSarch, setEnableSearch] = useState(() => (isInbox ? {} : { enabled: false }));
  const [TableConfig, setTableConfig] = useState(() => Digit.ComponentRegistryService?.getComponent("PTInboxTableConfig"));
  // const [getSearchFi]
  const [pageOffset, setPageOffset] = useState(initialStates.pageOffset || 0);
  const [pageSize, setPageSize] = useState(initialStates.pageSize || 10);
  const [sortParams, setSortParams] = useState(initialStates.sortParams || [{ id: "createdTime", desc: false }]);
  const [searchParams, setSearchParams] = useState(initialStates.searchParams || {});

  let isMobile = window.Digit.Utils.browser.isMobile();
  let paginationParams = isMobile
    ? { limit: 100, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
    : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };

  const { isFetching, isLoading: hookLoading, searchResponseKey, data, searchFields, ...rest } = useNewInboxAPI
    ? Digit.Hooks.useNewInboxGeneral({
        tenantId,
        ModuleCode: moduleCode,
        filters: { ...searchParams, ...paginationParams, sortParams },
      })
    : Digit.Hooks.useInboxGeneral({
        tenantId,
        businessService: moduleCode,
        isInbox,
        filters: { ...searchParams, ...paginationParams, sortParams },
        rawWfHandler,
        rawSearchHandler,
        combineResponse,
        wfConfig,
        searchConfig: { ...enableSarch, ...searchConfig },
        middlewaresWf,
        middlewareSearch,
      });

  useEffect(() => {
    setPageOffset(0);
  }, [searchParams]);

  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + pageSize);
  };

  const fetchPrevPage = () => {
    setPageOffset((prevState) => prevState - pageSize);
  };

  const handleFilterChange = (filterParam) => {
    let keys_to_delete = filterParam.delete;
    let _new = { ...searchParams, ...filterParam };
    if (keys_to_delete) keys_to_delete.forEach((key) => delete _new[key]);
    delete filterParam.delete;
    setSearchParams({ ..._new });
    setEnableSearch({ enabled: true });
  };

  const handleSort = useCallback((args) => {
    if (args.length === 0) return;
    setSortParams(args);
  }, []);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  const totalCount = Number(data?.[0]?.totalCount);

  if (rest?.data?.length !== null) {
    if (isMobile) {
      return (
        <MobileInbox
          data={data}
          isLoading={hookLoading}
          isSearch={!isInbox}
          searchFields={searchFields}
          onFilterChange={handleFilterChange}
          onSearch={handleFilterChange}
          onSort={handleSort}
          parentRoute={parentRoute}
          searchParams={searchParams}
          sortParams={sortParams}
          linkPrefix={`${parentRoute}/application-details/`}
          tableConfig={rest?.tableConfig?res?.tableConfig:TableConfig(t)["PT"]}
          filterComponent={filterComponent}
          EmptyResultInboxComp={EmptyResultInboxComp}
          useNewInboxAPI={useNewInboxAPI}
        />
        // <div></div>
      );
    } else {
      return (
        <div>
          {isInbox && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
              <Header>
                {t("ES_COMMON_INBOX")}
                {totalCount ? <p className="inbox-count">{totalCount}</p> : null}
              </Header>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "12px", marginLeft: "auto" }}>
                <Link to="/digit-ui/employee/pt/new-application" style={{ textDecoration: "none" }}>
                  <button className="TL-new-application-btn" type="button">
                    <span className="TL-plus-icon">+</span> {t("ES_TITLE_NEW_REGISTRATION")}
                  </button>
                </Link>
                <Link to="/digit-ui/employee/pt/search" style={{ textDecoration: "none" }}>
                  <button className="TL-new-application-btn" type="button">
                    {t("PT_SEARCH_PROPERTY")}
                  </button>
                </Link>
                <Link to="/digit-ui/employee/pt/application-search" style={{ textDecoration: "none" }}>
                  <button className="TL-new-application-btn" type="button">
                    {t("ES_COMMON_APPLICATION_SEARCH")}
                  </button>
                </Link>
              </div>
            </div>
          )}
          {!isInbox && <Header>{t("SEARCH_PROPERTY")}</Header>}
          
          <DesktopInbox
            moduleCode={moduleCode}
            data={data}
            tableConfig={TableConfig(t)["PT"]}
            isLoading={hookLoading}
            defaultSearchParams={initialStates.searchParams}
            isSearch={!isInbox}
            onFilterChange={handleFilterChange}
            searchFields={searchFields}
            onSearch={handleFilterChange}
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
            totalRecords={totalCount}
            filterComponent={filterComponent}
            EmptyResultInboxComp={EmptyResultInboxComp}
            useNewInboxAPI={useNewInboxAPI}
          />
        </div>
      );
    }
  }
};

export default Inbox;
