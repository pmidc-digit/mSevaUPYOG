import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CardHeader } from "@mseva/digit-ui-react-components";
import { businessServiceList } from "../../../utils";
import cloneDeep from "lodash/cloneDeep";
import { filter } from "lodash";
import SearchApplication from "./Search";

const Search = ({ path }) => {
  const { t } = useTranslation();
  const user = Digit.UserService.getUser().info;
  let tenantId;

  if(window.location.pathname.includes("employee")){
   tenantId = window.localStorage.getItem("Employee.tenant-id");
  }else{
   tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }

  const defaultFilters = {
    offset: 0,
    limit: 10,
    tenantId,
    mobileNumber: user?.mobileNumber
  }

  const [filters, setfilters] = useState(defaultFilters);

  function onSubmit(__data, isFromClear = false) {
    let details = cloneDeep(__data);

    var fromDate = details?.fromDate ? new Date(details?.fromDate) : null;
    if (fromDate) fromDate.setSeconds(fromDate.getSeconds() - 19800);
    var toDate = details?.toDate ? new Date(details?.toDate) : null;
    if (toDate) toDate.setSeconds(toDate.getSeconds() + 86399 - 19800);

    const transformedData = {
      ...details,
      ...(fromDate ? { fromDate: fromDate.getTime() } : {}),
      ...(toDate ? { toDate: toDate.getTime() } : {}),
    };

    let cleanedFilters = Object.keys(transformedData)
      .filter((k) => transformedData[k] !== undefined && transformedData[k] !== null && transformedData[k] !== "")
      .reduce((acc, key) => {
        let val = transformedData[key];
        if (typeof val === "object" && val !== null && val.code !== undefined) {
          val = val.code;
        }
        return { ...acc, [key]: val };
      }, {});

    const baseFilters = {
      offset: defaultFilters.offset,
      limit: defaultFilters.limit,
      tenantId: defaultFilters.tenantId,
    };

    const newFilters = { ...baseFilters, ...cleanedFilters };
    if (JSON.stringify(filters) === JSON.stringify(newFilters)) {
      refetch();
    } else {
      setfilters(newFilters);
    }
  }
  
  
  const isMobile = window.Digit.Utils.browser.isMobile();

  const [tableData, setTableData] = useState([{ display: "ES_COMMON_NO_DATA" }]);
  const [count,setCount] = useState(0);
  const { data, revalidate, isLoading, isSuccess, error, refetch } = Digit.Hooks.firenoc.useFIRENOCSearchApplication(filters,tenantId,{});

  useEffect(()=>{
    if(data == undefined){
      setTableData([{ display: "ES_COMMON_NO_DATA" }]);
    }
    else if(data?.data?.length>0 ){
      setTableData(data?.data);
      setCount(data?.totalCount);
    }
  },[data])

  return (
    <div>
      <CardHeader styles={!isMobile ? {fontSize: "32px", fontWeight: "700"} : {fontSize: "32px", fontWeight: "700", paddingLeft: "10px"}}>{t("ACTION_TEST_SEARCH_NOC_APPLICATION")}</CardHeader>
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
