import { useQuery, useQueryClient } from "react-query"



const useLayoutSearch= (params, tenantId, config) => {  
  return async () => {
    // <CHANGE> Fixed method name from Layoutsearch to LayoutSearch and updated parameters to match service signature
    // Clean up empty values from params to avoid sending empty search criteria
    const cleanParams = {};
    for (const [key, value] of Object.entries(params || {})) {
      if (value !== null && value !== undefined && value !== "") {
        cleanParams[key] = value;
      }
    }
    const data = await Digit.OBPSService.LayoutSearch(tenantId, {}, cleanParams, { includeMobileNumber: false });
    console.log("((((((((((((");
    return { data };
  }
}

export const useLayoutCitizenSearchApplication = (params, tenantId, config = {}, t) => {
  const client = useQueryClient()

  const result = useQuery(["LAYOUT_APPLICATIONS_LIST", params], useLayoutSearch(params, tenantId, config), {
    staleTime: Number.POSITIVE_INFINITY,
    ...config,
    select: (data) => {
      const applications = data?.data?.Layout || []
      const count = data?.data?.count || 0

      const mappedData = applications?.map((owner) => ({
        LAYOUT_APPLICATION_NUMBER: owner?.applicationNo,
        TL_HOME_SEARCH_RESULTS_APP_STATUS_LABEL: owner?.applicationStatus,
        Applications: owner,
      }))

      return {
        data: mappedData,
        count,
        revalidate: () => client.invalidateQueries(["LAYOUT_APPLICATIONS_LIST", params]),
      }
    },
  })

  return { ...result, revalidate: () => client.invalidateQueries(["LAYOUT_APPLICATIONS_LIST", params]) }
}

export const useLayoutSearchApplication = (params, tenantId, config = {}, t) => {
  const client = useQueryClient()
  const result = useQuery(["LAYOUT_SEARCH_APPLICATION", params], useLayoutSearch(params, tenantId, config), {
    staleTime: Number.POSITIVE_INFINITY,
    select: (data) => {
      return {
        resData: data?.data,
        revalidate: () => client.invalidateQueries(["LAYOUT_SEARCH_APPLICATION", params]),
      }
    },
  })

  return { ...result, revalidate: () => client.invalidateQueries(["LAYOUT_SEARCH_APPLICATION", params]) }
}

export const useLayoutSearchApplicationByIdOrMobile = (params, tenantId, config = {}, t) => {
  const client = useQueryClient();
  console.log("ttttt");
  const result = useQuery(["LAYOUT_SEARCH_APPLICATION_BY_ID_MOBILENO", params], useLayoutSearch(params, tenantId, config), {
    staleTime: Infinity,
    select: (data) => {

    let tableData;

    console.log(data, "LAYOU APPLOICATION");

    if(data?.data?.Layout?.length == 0){
      tableData=[{ display: "ES_COMMON_NO_DATA" }];
    }
    else{
    tableData = data?.data?.Layout?.map((application) => {
          return {
            applicationNo: application?.applicationNo,
           // date: Digit.DateUtils.ConvertEpochToDate(application?.auditDetails?.lastModifiedBy),
            date: Digit.DateUtils.ConvertEpochToDate(application?.auditDetails?.createdTime),
            locality: `${application?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
            applicationStatus: `${application?.applicationStatus}`,
          };
    });

    }

    return {
        data: tableData,
        totalCount: data?.data?.count || 0,
    }

    },
  });
  return { ...result, revalidate: () => client.invalidateQueries(["LAYOUT_SEARCH_APPLICATION", params]) };
};
