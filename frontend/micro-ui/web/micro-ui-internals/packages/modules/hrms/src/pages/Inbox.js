import { Header } from "@mseva/digit-ui-react-components";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DesktopInbox from "../components/inbox/DesktopInbox";
import MobileInbox from "../components/inbox/MobileInbox";

const Inbox = ({ parentRoute, businessService = "HRMS", initialStates = {}, filterComponent, isInbox }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();
  const [pageOffset, setPageOffset] = useState(initialStates.pageOffset || 0);
  const [pageSize, setPageSize] = useState(initialStates.pageSize || 10);
  const [sortParams, setSortParams] = useState(initialStates.sortParams || [{ id: "createdTime", desc: false }]);
  const [searchParams, setSearchParams] = useState(() => {
    return initialStates.searchParams || {};
  });

  const isMobile = window.Digit.Utils.browser.isMobile();
  // Mobile uses the same page size as desktop so that "next" moves by exactly one page
  const paginationParams = { limit: pageSize, offset: pageOffset, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };
  const isupdate = Digit.SessionStorage.get("isupdate");
  const { isLoading: hookLoading, data, ...rest } = Digit.Hooks.hrms.useHRMSSearch(searchParams, tenantId, paginationParams, isupdate);

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
    const keysToDelete = filterParam.delete;
    const newParams = { ...searchParams, ...filterParam };
    if (keysToDelete) keysToDelete.forEach((key) => delete newParams[key]);
    delete newParams.delete;
    setSearchParams({ ...newParams });
  };

  const handleSort = useCallback((args) => {
    if (args.length === 0) return;
    setSortParams(args);
  }, []);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageOffset(0);
  };

  const getSearchFields = () => {
    return [
      {
        label: t("HR_NAME_LABEL"),
        name: "names",
        placeholder: t("HR_NAME_PLACEHOLDER") || "Enter Employee Name",
      },
      {
        label: t("HR_MOB_NO_LABEL"),
        name: "phone",
        maxlength: 10,
        pattern: "[6-9][0-9]{9}",
        title: t("ES_SEARCH_APPLICATION_MOBILE_INVALID"),
        componentInFront: "+91",
        placeholder: t("HR_PHONE_PLACEHOLDER") || "Enter Mobile Number",
      },
      {
        label: t("HR_EMPLOYEE_ID_LABEL"),
        name: "codes",
        placeholder: t("HR_EMPLOYEE_ID_PLACEHOLDER") || "Enter Employee ID",
      },
      {
        label: t("HR_EMPLOYEE_DESG_LABEL"),
        name: "designations",
        type: "dropdown",
      },
    ];
  };

  if (isMobile) {
    return (
      <MobileInbox
        businessService={businessService}
        data={data}
        isLoading={hookLoading}
        defaultSearchParams={initialStates.searchParams}
        isSearch={!isInbox}
        onFilterChange={handleFilterChange}
        searchFields={getSearchFields()}
        onSearch={handleFilterChange}
        onSort={handleSort}
        onNextPage={fetchNextPage}
        tableConfig={rest?.tableConfig}
        onPrevPage={fetchPrevPage}
        currentPage={Math.floor(pageOffset / pageSize)}
        pageSizeLimit={pageSize}
        disableSort={false}
        onPageSizeChange={handlePageSizeChange}
        parentRoute={parentRoute}
        searchParams={searchParams}
        sortParams={sortParams}
        linkPrefix={"/digit-ui/employee/hrms/details/"}
        filterComponent={filterComponent}
      />
    );
  }

  return (
    <div className="hrms-overflow--x-auto">
      {isInbox && <Header>{t("HR_HOME_SEARCH_RESULTS_HEADING")}</Header>}
      <DesktopInbox
        businessService={businessService}
        data={data}
        isLoading={hookLoading}
        defaultSearchParams={initialStates.searchParams}
        isSearch={!isInbox}
        onFilterChange={handleFilterChange}
        searchFields={getSearchFields()}
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
        filterComponent={filterComponent}
      />
    </div>
  );
};

export default Inbox;
