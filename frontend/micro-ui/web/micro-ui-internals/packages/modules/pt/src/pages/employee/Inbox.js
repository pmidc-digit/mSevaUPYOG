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
      const totalCount = Number(data?.[0]?.totalCount) || 0;
      return (
        <div style={{ padding: "0 0 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px 16px",
              borderBottom: "2px solid #e5e7eb",
              marginBottom: "20px",
              background: "#fff",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Header style={{ margin: 0 }}>
                  {isInbox ? t("ES_COMMON_INBOX") : t("SEARCH_PROPERTY")}
                </Header>
                {isInbox && totalCount > 0 && (
                  <span
                    style={{
                      background: "#1671c8",
                      color: "#fff",
                      borderRadius: "12px",
                      padding: "2px 10px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {totalCount}
                  </span>
                )}
              </div>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
                {isInbox ? t("PT_INBOX_SUBTITLE", { defaultValue: "Property Tax — Pending Applications" }) : t("PT_SEARCH_SUBTITLE", { defaultValue: "Search registered properties" })}
              </p>
            </div>

            {/* <Link
              to="/digit-ui/employee/pt/new-application"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #0b4e9b 0%, #1671c8 100%)",
                color: "#fff",
                padding: "9px 18px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: "0 2px 6px rgba(11,78,155,0.3)",
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
              {t("ES_TITLE_NEW_REGISTRATION")}
            </Link> */}
          </div>

          <div style={{ padding: "0 24px" }}>
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
        </div>
      );
    }
  }
};

export default Inbox;
