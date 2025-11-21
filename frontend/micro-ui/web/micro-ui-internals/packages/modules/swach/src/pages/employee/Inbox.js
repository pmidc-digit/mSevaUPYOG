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

  const transformInboxData = (data) => {
    return {
      table: data?.items?.map((complaint) => {
        const createdTime = complaint?.ProcessInstance?.auditDetails?.createdTime;
        const currentTime = Date.now();
        const timeLeftInMs = currentTime - createdTime;
        const timeLeftInHours = timeLeftInMs / (1000 * 60 * 60);
        const roundedHours = timeLeftInHours?.toFixed(1);
        const slaInMilliseconds = complaint?.ProcessInstance?.stateSla;
        const totalHours = slaInMilliseconds / (1000 * 60 * 60);
        const roundedtotalHours = parseFloat(totalHours?.toFixed(1));

        return {
          serviceRequestId: complaint.ProcessInstance?.businessId,
          complaintSubType: complaint?.businessObject?.service?.serviceCode,
          priorityLevel: complaint.ProcessInstance?.priority,
          locality: complaint?.businessObject?.service?.address?.locality?.code,
          status: (() => {
            const stateValue = complaint?.ProcessInstance?.state?.state;
            if (stateValue === "PENDINGFORREASSIGNMENT") {
              return "PENDINGFORREASSIGNMENT";
            }
            if (stateValue === "REJECTED") {
              return "REJECTED";
            }
            return complaint?.ProcessInstance?.state?.applicationStatus;
          })(),
          taskOwner: complaint.ProcessInstance?.assigner?.name || "-",
          taskEmployee: complaint.ProcessInstance?.assignes?.[0]?.name || "-",
          sla: roundedtotalHours,
          slaElapsed: roundedHours,
          tenantId: complaint.ProcessInstance?.tenantId,
          createdDate: new Date(complaint.ProcessInstance?.auditDetails?.createdTime)?.toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        };
      }) || [],
      totalCount: data?.totalCount,
      nearingSlaCount: data?.nearingSlaCount,
    };
  };

  const fetchInboxData = async (inboxFilters) => {
    const requestBody = {
      inbox: inboxFilters,
      RequestInfo: {
        apiId: "Rainmaker",
        authToken: Digit.UserService.getUser()?.access_token,
        userInfo: Digit.UserService.getUser()?.info,
        msgId: `${new Date().getTime()}|${Digit.StoreData.getCurrentLanguage()}`,
        plainAccessRequest: {}
      }
    };

    const inboxResponse = await fetch("/inbox/v1/_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(requestBody)
    });

    return await inboxResponse.json();
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        debugger;
        const applicationStatus = searchParams?.filters?.swachfilters?.applicationStatus?.map((e) => e.code).join(",");
        const filteredTenentId = searchParams?.filters?.swachfilters?.tenants;
        console.log("filteredTenentId", filteredTenentId);
        const assigneeCode = searchParams?.filters?.wfFilters?.assignee?.[0]?.code;
        
        let response = await Digit.SwachService.count(filteredTenentId, applicationStatus?.length > 0 ? { applicationStatus } : {});
        if (response?.count) {
          setTotalRecords(response.count);
        }

        // Prepare pagination params
        const paginationParams = isMobile
          ? { limit: 100, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
          : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };

        // Build inbox filters
        const USER_UUID = Digit.UserService.getUser()?.info?.uuid;
        const inboxFilters = {
          tenantId: filteredTenentId,
          processSearchCriteria: {
            moduleName: "swach-reform",
            businessService: ["SBMR"],
            ...(applicationStatus ? { status: applicationStatus.split(',') } : {}),
            ...(assigneeCode ? { assignee: assigneeCode === "ASSIGNED_TO_ME" ? USER_UUID : assigneeCode } : {}),
          },
          moduleSearchCriteria: {
            ...(searchParams?.search?.mobileNumber ? { mobileNumber: searchParams.search.mobileNumber } : {}),
            ...(searchParams?.search?.serviceRequestId ? { serviceRequestId: searchParams.search.serviceRequestId } : {}),
            ...(searchParams?.filters?.pgrQuery?.serviceCode?.length > 0 ? { serviceCode: searchParams.filters.pgrQuery.serviceCode } : {}),
            ...(searchParams?.filters?.pgrQuery?.locality?.length > 0 ? { locality: searchParams.filters.pgrQuery.locality } : {}),
            ...(paginationParams.sortBy ? { sortBy: paginationParams.sortBy } : {}),
            ...(paginationParams.sortOrder ? { sortOrder: paginationParams.sortOrder } : {}),
          },
          limit: paginationParams.limit,
          offset: paginationParams.offset,
        };

        // Call inbox API
        const inboxData = await fetchInboxData(inboxFilters);
        console.log("Inbox API Response:", inboxData);
        
        // Transform the data to table format
        const transformedData = transformInboxData(inboxData);
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
  }, [searchParams, pageOffset, pageSize, tenantIdCheck, sessionEmpTenant, sortParams, isMobile]);

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
