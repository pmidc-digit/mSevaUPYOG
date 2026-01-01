import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@mseva/digit-ui-react-components";

import DesktopInbox from "../../components/DesktopInbox";
import MobileInbox from "../../components/MobileInbox";

const Inbox = ({
  parentRoute,
  businessService = "PT",
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
}) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();
  const [pageOffset, setPageOffset] = useState(initialStates.pageOffset || 0);
  const [pageSize, setPageSize] = useState(initialStates.pageSize || 10);
  const [sortParams, setSortParams] = useState(initialStates.sortParams || [{ id: "createdTime", desc: false }]);
  const { isLoading, data: countData } = Digit.Hooks.mcollect.useMCollectCount(tenantId);
  const [searchParams, setSearchParams] = useState(initialStates.searchParams || {});
  const [businessIdToOwnerMappings, setBusinessIdToOwnerMappings] = useState({});
  const [isLoader, setIsLoader] = useState(false);

  const isMobile = window.Digit.Utils.browser.isMobile();
  const paginationParams = {
    limit: isMobile ? 10 : pageSize,
    offset: isMobile ? 0 : pageOffset,
    sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC",
  };

  const isMcollectAppChanged = Digit.SessionStorage.get("isMcollectAppChanged");

  const { isLoading: hookLoading, data, ...rest } = Digit.Hooks.mcollect.useMCollectSearch({
    tenantId,
    filters: { ...searchParams, ...paginationParams },
    isMcollectAppChanged,
  });

  // useEffect(() => {
  //   if (!hookLoading && !data?.challans?.length) setIsLoader(false);
  //   else if (hookLoading || data?.challans?.length) setIsLoader(true);
  // }, [hookLoading, data]);

  useEffect(() => {
    async function fetchBills() {
      let businessServiceMap = {};

      data?.challans?.forEach((item) => {
        if (item.businessService !== "ADVT.Canopy_Fee") {
          if (!businessServiceMap[item.businessService]) businessServiceMap[item.businessService] = [];
          businessServiceMap[item.businessService].push(item.challanNo);
        }
      });

      let processInstanceArray = [];
      for (let key in businessServiceMap) {
        const consumerCodes = businessServiceMap[key].join(",");
        const res = await Digit.PaymentService.fetchBill(tenantId, { consumerCode: consumerCodes, businessService: key });
        processInstanceArray = [...processInstanceArray, ...(res?.Bill || [])];
      }

      const mapping = {};
      processInstanceArray.forEach((item) => {
        mapping[item?.consumerCode] = {
          businessService: item?.businessService,
          totalAmount: item?.billDetails?.[0]?.totalAmount || 0,
          dueDate: item?.billDetails?.[0]?.expiryDate,
        };
      });

      setBusinessIdToOwnerMappings(mapping);
      setIsLoader(false);
    }

    if (data?.challans?.length > 0) {
      fetchBills();
    }
  }, [data]);

  const formedData = (data?.challans || []).map((item) => ({
    challanNo: item?.challanNo,
    name: item?.citizen?.name,
    applicationStatus: item?.applicationStatus,
    businessService: item?.businessService,
    totalAmount: businessIdToOwnerMappings[item.challanNo]?.totalAmount || 0,
    dueDate: businessIdToOwnerMappings[item.challanNo]?.dueDate || "NA",
    tenantId: item?.tenantId,
    receiptNumber: item?.receiptNumber,
  }));

  useEffect(() => {
    setPageOffset(0);
  }, [searchParams]);

  const fetchNextPage = () => setPageOffset((prev) => prev + pageSize);
  const fetchPrevPage = () => setPageOffset((prev) => prev - pageSize);
  const fetchLastPage = () => setPageOffset(data?.totalCount ? Math.ceil(data.totalCount / 10) * 10 - pageSize : 0);
  const fetchFirstPage = () => setPageOffset(0);

  const handleFilterChange = (filterParam) => {
    let keys_to_delete = filterParam.delete;
    let _new = { ...searchParams, ...filterParam };
    if (keys_to_delete) keys_to_delete.forEach((key) => delete _new[key]);
    delete _new.delete;
    setSearchParams(_new);
  };

  const handleSort = useCallback((args) => {
    if (args.length === 0) return;
    setSortParams(args);
  }, []);

  const handlePageSizeChange = (e) => setPageSize(Number(e.target.value));

  const getSearchFields = () => [
    { label: t("UC_CHALLAN_NO"), name: "challanNo" },
    {
      label: t("UC_MOBILE_NO_LABEL"),
      name: "mobileNumber",
      maxlength: 10,
      pattern: "[6-9][0-9]{9}",
      title: t("ES_SEARCH_APPLICATION_MOBILE_INVALID"),
      componentInFront: "+91",
    },
    { label: t("UC_RECEPIT_NO_LABEL"), name: "receiptNumber" },
  ];

  if (rest?.data?.length !== null) {
    if (isMobile) {
      return (
        <MobileInbox
          data={formedData}
          defaultSearchParams={initialStates.searchParams}
          isLoading={hookLoading}
          isSearch={!isInbox}
          searchFields={getSearchFields()}
          onFilterChange={handleFilterChange}
          onSearch={handleFilterChange}
          onSort={handleSort}
          parentRoute={parentRoute}
          searchParams={searchParams}
          sortParams={sortParams}
          tableConfig={rest?.tableConfig}
          filterComponent={filterComponent}
        />
      );
    } else {
      return (
        <div>
          {isInbox && <Header>{t("ACTION_TEST_NATIONAL_MCOLLECT")}</Header>}
          <DesktopInbox
            businessService={businessService}
            data={formedData}
            tableConfig={rest?.tableConfig}
            isLoading={hookLoading}
            defaultSearchParams={initialStates.searchParams}
            isSearch={!isInbox}
            onFilterChange={handleFilterChange}
            searchFields={getSearchFields()}
            onSearch={handleFilterChange}
            onSort={handleSort}
            onNextPage={fetchNextPage}
            onPrevPage={fetchPrevPage}
            onLastPage={fetchLastPage}
            onFirstPage={fetchFirstPage}
            currentPage={Math.floor(pageOffset / pageSize)}
            pageSizeLimit={pageSize}
            disableSort={false}
            onPageSizeChange={handlePageSizeChange}
            parentRoute={parentRoute}
            searchParams={searchParams}
            sortParams={sortParams}
            totalRecords={data?.totalCount}
            filterComponent={filterComponent}
            isLoader={isLoader}
          />
        </div>
      );
    }
  }

  return null;
};

export default Inbox;
