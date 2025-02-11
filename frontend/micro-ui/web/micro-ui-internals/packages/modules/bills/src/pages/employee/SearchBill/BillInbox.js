import { Header } from "@mseva/digit-ui-react-components";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DesktopInbox from "../../../components/inbox/BillsDesktopInbox";
import MobileInbox from "../../../components/inbox/BillsMobileInbox";
import BillGenieDetails from "../BillGenieDetails";
import ApplicationTable from "../../../components/inbox/ApplicationTable";
import { Link } from "react-router-dom";
import { getActionButton, getBillNumber } from "../../../utils";
const BillInbox = ({ parentRoute, initialStates, businessService, filterComponent, isInbox }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [enableSarch, setEnableSearch] = useState(() => (isInbox ? {} : { enabled: false }));
  const GetCell = (value) => <span className="cell-text">{value}</span>;

  const { t } = useTranslation();
  const [pageOffset, setPageOffset] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [pageSize, setPageSize] = useState(10);
  const [sortParams, setSortParams] = useState(initialStates?.sortParams || [{ id: "applicationDate", desc: false }]);
  const [setSearchFieldsBackToOriginalState, setSetSearchFieldsBackToOriginalState] = useState(false);

  const [billsData,setBillsData]=useState([])
  const [searchParams, setSearchParams] = useState(() => {
    return initialStates?.searchParams || {};
  });

  let isMobile = window.Digit.Utils.browser.isMobile();
  let paginationParams = isMobile
    ? { limit: 10, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" }
    : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.desc ? "DESC" : "ASC" };

  const { isFetching, isLoading: hookLoading, searchResponseKey, data, searchFields, ...rest } = Digit.Hooks.useBillSearch({
    tenantId,
    filters: { ...searchParams, businessService, ...paginationParams, sortParams },
    config: {
      cacheTime : 0
    },
  });

  useEffect(() => {
    setTotalRecords(data?.Bills?.length);
  }, [data]);

  useEffect(() => {
    setPageOffset(0);
  }, [searchParams]);

  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + pageSize);
  };

  const fetchPrevPage = () => {
    setPageOffset((prevState) => prevState - pageSize);
  };

  const fetchFirstPage = () => {
    setPageOffset((prevState) => 0);
  };

  const fetchLastPage = () => {
    setPageOffset(totalRecords && Math.ceil(totalRecords / 10) * 10 - pageSize);
  };

  const handleFilterChange = (filterParam) => {
    let keys_to_delete = filterParam?.delete;
    let _new = {};
    if (isMobile) {
      _new = { ...filterParam };
    } else {
      _new = { ...searchParams, ...filterParam };
    }

    if (keys_to_delete) keys_to_delete.forEach((key) => delete _new[key]);
    delete _new?.delete;
    delete filterParam?.delete;
    setSetSearchFieldsBackToOriginalState(true);
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
  const [ulbLists, setulbLists] = useState([]);
const [ulbValue,setUlbValue]=useState([])
const [serviceValue,setServiceValue]=useState([])
  const { isLoading, data: generateServiceType } = Digit.Hooks.useCommonMDMS(tenantId, "BillingService", "BillsGenieKey");
  const filterServiceType = generateServiceType?.BillingService?.BusinessService?.filter((element) => element.billGineiURL);
  // const getUlbLists = generateServiceType?.tenant?.tenants?.filter((element) => element.code === tenantId);
  const getUlbLists = generateServiceType?.tenant?.tenants;
 const defaultULB= getUlbLists?.filter((item)=>item.code===tenantId)
 console.log("defaultULB",defaultULB)
   console.log("genServ",generateServiceType)
   console.log("get Ulbs",getUlbLists)
  let serviceTypeList = [];
  if (filterServiceType) {
    serviceTypeList = filterServiceType.map((element) => {
      return {
         name: Digit.Utils.locale.getTransformedLocale(`BILLINGSERVICE_BUSINESSSERVICE_${element.code}`),
        //name: element.businesService,
        url: element.billGineiURL,
        businesService: element.code,
      };
    });
  }
console.log("service list",serviceTypeList)
  useEffect(() => {
      if (getUlbLists) {
        setulbLists(getUlbLists);
      }

    }, []);
   console.log("ulbList",ulbLists)
      const userUlbs = [];

  const getSearchFields = () => {
    return [
      {
        label: t("LABEL_FOR_ULB"),
        name: "ulb",
        type:'dropdown',
        option:getUlbLists,
        selected: ulbValue,
        select:setUlbValue,
        defaultValue: defaultULB

      },
      {
        label: t("ABG_SERVICE_CATEGORY_LABEL"),
        name: "serviceCategory",
        type:'dropdown',
        option: serviceTypeList,
        selected: serviceValue,
        select: setServiceValue

      },
      {
        label: "Property Tax Unique ID",
        name: "ptUniqueId",
      },
      {
        label: t("ABG_BILL_NUMBER_LABEL"),
        name: "billNo",
      },
  
      {
        label: t("ABG_MOBILE_NO_LABEL"),
        name: "mobileNumber",
        maxlength: 10,

        pattern: Digit.Utils.getPattern("MobileNo"),

        type: "mobileNumber",

        title: t("ES_SEARCH_APPLICATION_MOBILE_INVALID"),
        componentInFront: "+91",
      },
    ];
  };
console.log("isInbox",isInbox)

const getBills=(data)=>{
  setBillsData(data)
  console.log("onSearchData",data)
}
const data2=[];

 const columns = React.useMemo(() => {
   return [
      {
        Header: t("ABG_COMMON_TABLE_COL_BILL_NO"),
        disableSortBy: true,
        Cell: ({ row }) => {
          //console.log("row",row)
          return (
            
            <div>
              <span className="link">
                {GetCell(getBillNumber(row.original?.businessService, row.original?.consumerCode, row.original?.billNumber))}
              </span>
            </div>
          );
        },
      },
      {
        Header: t("ABG_COMMON_TABLE_COL_CONSUMER_NAME"),
        disableSortBy: true,
        Cell: ({ row }) => {
          return GetCell(`${row.original?.payerName}`);
        },
      },
      {
        Header: "Bill Date",
        disableSortBy: true,
        Cell: ({ row }) => {
          
          return GetCell(`${row.original?.billDate}`);
        },
      },
      {
        Header: "Bill Amount",
        disableSortBy: true,
        Cell: ({ row }) => {
          
          return GetCell(`${row.original?.totalAmount}`);
        },
      },
      {
        Header: "Status",
        disableSortBy: true,
        Cell: ({ row }) => {
          
          return GetCell(`${row.original?.status}`);
        },
      },
      {
        Header: "Action",
        disableSortBy: true,
        Cell: ({ row }) => {
          
          return GetCell("-");
        },
      },
     
     
    ];
 })
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

  if (isMobile) {
    return (
      <MobileInbox
        data={data}
        isLoading={hookLoading}
        searchFields={getSearchFields()}
        onFilterChange={handleFilterChange}
        onSearch={handleFilterChange}
        onSort={handleSort}
        parentRoute={parentRoute}
        searchParams={searchParams}
        sortParams={sortParams}
        totalRecords={totalRecords}
      />
    );
  } else {
    return (
      <div>
        {/* {isInbox && <Header>{t("ABG_SEARCH_BILL_COMMON_HEADER")}</Header>} */}
        <Header>{"Bill Genie"}</Header>
        <DesktopInbox
          data={data}
          tableConfig={rest?.tableConfig}
          isLoading={hookLoading}
          defaultSearchParams={initialStates?.searchParams}
          isSearch={!isInbox}
          onFilterChange={handleFilterChange}
          searchFields={getSearchFields()}
          setSearchFieldsBackToOriginalState={setSearchFieldsBackToOriginalState}
          setSetSearchFieldsBackToOriginalState={setSetSearchFieldsBackToOriginalState}
          onSearch={handleFilterChange}
          onSort={handleSort}
          onNextPage={fetchNextPage}
          onPrevPage={fetchPrevPage}
          onFirstPage={fetchFirstPage}
          onLastPage={fetchLastPage}
          currentPage={Math.floor(pageOffset / pageSize)}
          pageSizeLimit={10}
          disableSort={false}
          onPageSizeChange={handlePageSizeChange}
          parentRoute={parentRoute}
          searchParams={searchParams}
          sortParams={sortParams}
          totalRecords={totalRecords}
          filterComponent={filterComponent}
          onSearchData={getBills}
        />
      {/* <BillGenieDetails/> */}
      <ApplicationTable
        t={t}
        data={billsData}
        columns={columns}
        getCellProps={(cellInfo) => {
          return {
            style: {
             // maxWidth: cellInfo.column.Header === t("HR_EMP_ID_LABEL") ? "140px" : "",
              padding: "20px 18px",
              fontSize: "16px",
            },
          };
        }}
        // onPageSizeChange={props.onPageSizeChange}
        // currentPage={props.currentPage}
        // onNextPage={props.onNextPage}
        // onPrevPage={props.onPrevPage}
        // onLastPage={props.onLastPage}
        // onFirstPage={props.onFirstPage}
        // pageSizeLimit={props.pageSizeLimit}
        // onSort={props.onSort}
        // disableSort={props.disableSort}
        // sortParams={props.sortParams}
        // totalRecords={props.totalRecords}
      />
      </div>
    );
  }
};

export default BillInbox;
