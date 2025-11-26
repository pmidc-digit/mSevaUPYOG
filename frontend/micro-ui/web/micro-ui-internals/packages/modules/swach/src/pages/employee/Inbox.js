import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Header } from "@mseva/digit-ui-react-components";
import { Params_Count } from "../../constants/Employee";
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
  const [complaints, setComplaints] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let isMobile = Digit.Utils.browser.isMobile();

  const ttID = localStorage.getItem("punjab-tenantId");
  const sessionEmpTenant = Digit.SessionStorage.get("Employee.tenantId");
  const tenantIdCheck = sessionEmpTenant || ttID || tenantId;

  const { data: localities } = Digit.Hooks.useBoundaryLocalities(tenantIdCheck, "admin", {}, t);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const applicationStatus = searchParams?.filters?.swachfilters?.applicationStatus?.map((e) => e.code).join(",");
        const serviceCode = searchParams?.filters?.pgrQuery?.serviceCode;
        const locality = searchParams?.filters?.pgrQuery?.locality;
        const filteredTenentId = searchParams?.filters?.swachfilters?.tenants;
        const assigneeCode = searchParams?.filters?.wfFilters?.assignee?.[0]?.code;
        
        if (!filteredTenentId) {
          setIsLoading(false);
          return;
        }

        // Fetch count
        let response = await Digit.SwachService.count(filteredTenentId, {
          ...(applicationStatus?.length > 0 ? { applicationStatus } : {}),
          ...(serviceCode ? { serviceCode } : {}),
          ...(locality ? { locality } : {})
        });
        if (response?.count) {
          setTotalRecords(response.count);
        }

        // Prepare pagination params
        const paginationParams = isMobile
          ? { limit: 100, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
          : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };

        // Call the inbox service
        const transformedData = await Digit.SwachService.InboxServiceApicall({
          tenantId: filteredTenentId,
          filters: {
            ...searchParams,
            sortBy: paginationParams.sortBy,
            sortOrder: paginationParams.sortOrder,
            limit: paginationParams.limit,
            offset: paginationParams.offset,
          }
        });

        console.log("Transformed Data:", transformedData);
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
  }, [searchParams, pageOffset, pageSize, sortParams, isMobile]);

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
    setSearchParams({ ...searchParams, filters: filterParam });
  };

  const onSearch = (params = "") => {
    setSearchParams({ ...searchParams, search: params });
  };

  // Hook call removed - now fetching in useEffect
  // let { data: complaints, isLoading, refetch } = Digit.Hooks.swach.useInbox({
  //   tenantId: tenantIdCheck,
  //   filters: { ...searchParams, ...paginationParams, sortParams },
  //   config: {},
  // });
console.log("Complaints Data:", complaints);
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
