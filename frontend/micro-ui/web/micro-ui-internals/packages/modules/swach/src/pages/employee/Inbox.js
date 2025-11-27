import React, { useCallback, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Header } from "@mseva/digit-ui-react-components";
import { Params_Count } from "../../constants/Employee";
import DesktopInbox from "../../components/DesktopInbox";
import MobileInbox from "../../components/MobileInbox";

const SEARCH_PARAMS_KEY = "swach_inbox_search_params";

const Inbox = ({ initialStates = {} }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { uuid } = Digit.UserService.getUser().info;
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortParams, setSortParams] = useState(initialStates?.sortParams || [{ id: "applicationStatus", desc: false }]);
  const [isInitializing, setIsInitializing] = useState(true);
  const filterChangeTimeoutRef = useRef(null);
  
  // Restore searchParams from sessionStorage or use initialStates
  const getInitialSearchParams = () => {
    try {
      const savedParams = Digit.SessionStorage.get(SEARCH_PARAMS_KEY);
      return savedParams || initialStates.searchParams || {};
    } catch (e) {
      return initialStates.searchParams || {};
    }
  };
  
  const [searchParams, setSearchParams] = useState(getInitialSearchParams);
  const [complaints, setComplaints] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let isMobile = Digit.Utils.browser.isMobile();

  const ttID = localStorage.getItem("punjab-tenantId");
  const sessionEmpTenant = Digit.SessionStorage.get("Employee.tenantId");
  const tenantIdCheck = sessionEmpTenant || ttID || tenantId;
  const selectedTenant = searchParams?.filters?.swachfilters?.tenants;
  const { data: localities } = Digit.Hooks.useBoundaryLocalities(selectedTenant || tenantIdCheck, "admin", {}, t);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (filterChangeTimeoutRef.current) {
        clearTimeout(filterChangeTimeoutRef.current);
      }
    };
  }, []);

  // Persist searchParams to sessionStorage whenever it changes
  useEffect(() => {
    if (searchParams && Object.keys(searchParams).length > 0) {
      Digit.SessionStorage.set(SEARCH_PARAMS_KEY, searchParams);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isInitializing) return;
    
    (async () => {
      setIsLoading(true);
      try {
        const { swachfilters = {}, pgrQuery = {} } = searchParams?.filters || {};
        const applicationStatus = swachfilters.applicationStatus?.map((e) => e.code).join(",");
        const serviceCode = pgrQuery.serviceCode;
        const locality = pgrQuery.locality;
        const filteredTenentId = swachfilters.tenants;
        
        if (!filteredTenentId) {
          setIsLoading(false);
          return;
        }

        // Fetch count
        const response = await Digit.SwachService.count(filteredTenentId, {
          ...(applicationStatus && { applicationStatus }),
          ...(serviceCode && { serviceCode }),
          ...(locality && { locality })
        });
        if (response?.count) {
          setTotalRecords(response.count);
        }

        // Prepare pagination params
        const paginationParams = {
          limit: isMobile ? 100 : pageSize,
          offset: isMobile ? 0 : pageOffset,
          sortBy: sortParams?.[0]?.id,
          sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC"
        };

        // Call the inbox service
        const transformedData = await Digit.SwachService.InboxServiceApicall({
          tenantId: filteredTenentId,
          filters: {
            ...searchParams,
            ...paginationParams
          }
        });

        setComplaints(transformedData);
      } catch (e) {
        console.error("Error fetching inbox:", e);
        setComplaints({ table: [] });
      } finally {
        setIsLoading(false);
      }
      // Do not remove the below commented code

      // console.log("application Status",applicationStatus)
      // console.log("assigneeCode", assigneeCode);
      // console.log("uuid", uuid);
      // //  if (!assigneeCode) return;
      // if (assigneeCode==uuid) {
      //   // let response = await Digit.Hooks.swach.useCount(tenantId, Params_Count,assigneeCode,applicationStatus?.length > 0 ?  applicationStatus : {});
      //   let response = await Digit.Hooks.swach.useCount(tenantId, Params_Count,assigneeCode, applicationStatus);
      // console.log("useCount response in inbox in  if block", response);
      // if (response) {
      //   setTotalRecords(response);
      // }
      // }
      // else{
      //   let response = await Digit.SwachService.count(tenantId, applicationStatus?.length > 0 ? { applicationStatus } : {});
      //   console.log("useCount response in inbox else block", response);
      // if (response?.count) {
      //   setTotalRecords(response.count);
      // }
      // }
    })();
  }, [searchParams, pageOffset, pageSize, sortParams, isMobile, isInitializing]);

  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + pageSize);
  };

  const fetchPrevPage = () => {
    setPageOffset((prevState) => Math.max(0, prevState - pageSize));
  };

  const handlePageSizeChange = (e) => {
    setPageOffset(0);
    setPageSize(Number(e.target.value));
  };

  const handleFilterChange = (filterParam) => {
    // Preserve tenant from sessionStorage if filter doesn't have one
    if (!filterParam?.swachfilters?.tenants) {
      try {
        const savedParams = Digit.SessionStorage.get(SEARCH_PARAMS_KEY);
        const savedTenant = savedParams?.filters?.swachfilters?.tenants;
        if (savedTenant) {
          filterParam.swachfilters.tenants = savedTenant;
        }
      } catch (e) {
      }
    }
    
    // Clear any pending filter changes
    if (filterChangeTimeoutRef.current) {
      clearTimeout(filterChangeTimeoutRef.current);
    }
    
    // Debounce filter changes during initialization to prevent multiple API calls
    if (isInitializing) {
      filterChangeTimeoutRef.current = setTimeout(() => {
        setSearchParams({ ...searchParams, filters: filterParam });
        setIsInitializing(false);
      }, 300);
    } else {
      setSearchParams({ ...searchParams, filters: filterParam });
    }
  };

  const onSearch = (params = "") => {
    setSearchParams({ ...searchParams, search: params });
  };

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
          localities={localities}
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
