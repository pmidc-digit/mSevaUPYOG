import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CardHeader } from "@mseva/digit-ui-react-components";
import cloneDeep from "lodash/cloneDeep";
import { filter } from "lodash";
import SearchApplication from "./Search";

const Search = () => {
  const { t } = useTranslation();
  const user = Digit.UserService.getUser().info;

  let tenantId;
  if(window.location.pathname.includes("employee")){
   tenantId = window.localStorage.getItem("Employee.tenant-id");
  }else{
   tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }
  console.log("tenantId here", tenantId);

  const defaultFilters = {
    offset: 0,
    limit: 10,
    tenantId,
    mobileNumber: user?.mobileNumber
  }

  const [filters, setfilters] = useState(defaultFilters);

  function onSubmit(__data, isFromClear = false) {
    console.log("_data==>", __data);
    let details = cloneDeep(__data);
    let __filters = defaultFilters;

    const hasApplicationNo = !! details.applicationNo;
    const hasMobileNumber = !! details.mobileNumber;
    
     // If only applicationNo is present, remove mobileNumber
    if (hasApplicationNo && !hasMobileNumber) {
      console.log("we are deleteing mobileNumber here");
     delete details.mobileNumber;
    }

    // for (const [key, value] of Object.entries(__data)) {
    //   if(value != undefined && value != null && value != ""){

    //     __filters = {...__filters, [key]:value}        
    //   }
    // }
    //setfilters(isFromClear == true ? details : __filters)
     setfilters(details);
  }
  
  
  const isMobile = window.Digit.Utils.browser.isMobile();

  const [tableData, setTableData] = useState([{ display: "ES_COMMON_NO_DATA" }]);
  const [statuses, setStatuses] = useState([]);
  const [count,setCount] = useState(0);
  const { data, revalidate, isLoading, isSuccess, error } = Digit.Hooks.obps.useLayoutSearchApplicationByIdOrMobile(filters,tenantId,{});

  useEffect(()=>{
    if(data == undefined){
      setTableData([{ display: "ES_COMMON_NO_DATA" }]);
    }
    else if(data?.data?.length>0 ){
      setTableData(data?.data);
      setCount(data?.totalCount);
      setStatuses(data?.statuses || []);
    }
  },[data])

  return (
    <div>
      <CardHeader styles={!isMobile ? {fontSize: "32px", fontWeight: "700"} : {fontSize: "32px", fontWeight: "700", paddingLeft: "10px"}}>{t("Search Layout Application")}</CardHeader>
      <SearchApplication
        t={t}
        tenantId={tenantId}
        onSubmit={onSubmit}
        isLoading={isLoading}
        Count={count}
        error={error}
        data={tableData}
      />
    </div>
  );
};

export default Search;
