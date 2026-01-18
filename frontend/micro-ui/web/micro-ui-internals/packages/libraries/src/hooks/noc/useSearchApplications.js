import { NOCSearch } from "../../services/molecules/NOC/Search";
import { useQuery, useQueryClient } from "react-query";

const useNOCSearch = (params, tenantId, config) => {
  return async () => {
    const data = await Digit.NOCService.NOCsearch({ filters: params, tenantId, config });
    return { data };
  };
};

export const useNOCCitizenSearchApplication = (params, tenantId, config = {}, t) => {
  const client = useQueryClient();

  const result = useQuery(["NOC_APPLICATIONS_LIST", params], useNOCSearch(params, tenantId, config), {
    staleTime: Infinity,
    select: (data) => {
      //console.log("data in useNOCCitizenSearchApplication hook ", data);
      const applications = data?.data?.Noc || [];
      const count = data?.data?.count || 0;

      // console.log("count in hook", count);
      // console.log("applications in hook", applications);

      const mappedData = applications?.map((owner) => ({
        NOC_APPLICATION_NUMBER : owner?.applicationNo,
        // TL_LOCALIZATION_OWNER_NAME: owner?.owners[0]?.name,
        TL_HOME_SEARCH_RESULTS_APP_STATUS_LABEL: owner?.applicationStatus,

        Applications: owner,
      }));

      return {
        data: mappedData,
        count,
        revalidate: () => client.invalidateQueries(["NOC_APPLICATIONS_LIST", params])
      };
    },
  });

  return { ...result, revalidate: () => client.invalidateQueries(["NOC_APPLICATIONS_LIST", params]) };
};


export const useNOCSearchApplication = (params, tenantId, config = {}, t) => {
  const client = useQueryClient();
  const result = useQuery(["NOC_SEARCH_APPLICATION", params], useNOCSearch(params, tenantId, config), {
    staleTime: Infinity,
    select: (data) => {
      return{
        resData: data?.data,
        revalidate: () => client.invalidateQueries(["NOC_SEARCH_APPLICATION", params])
      }
    },
  });

  return { ...result, revalidate: () => client.invalidateQueries(["NOC_SEARCH_APPLICATION", params]) };
};

export const useNOCSearchApplicationByIdOrMobile = (params, tenantId, config = {}, t) => {
  const client = useQueryClient();
  const result = useQuery(["NOC_SEARCH_APPLICATION_BY_ID_MOBILENO", params], useNOCSearch(params, tenantId, config), {
    staleTime: Infinity,
    select: (data) => {

    let tableData;

    if(data?.data?.Noc?.length == 0){
      tableData=[{ display: "ES_COMMON_NO_DATA" }];
    }
    else{
    tableData = data?.data?.Noc?.map((application) => {
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
  return { ...result, revalidate: () => client.invalidateQueries(["NOC_SEARCH_APPLICATION", params]) };
};

const useNOCCheckListSearchFn = (params, tenantId) => {
  return async () => {
    return await Digit.NOCService.NOCCheckListSearch({ tenantId, filters: params, });
  };
};

export const useNOCCheckListSearch = (params, tenantId, config = {}) => {
  const client = useQueryClient();

  const result = useQuery(
    ["NOC_CHECKLIST_SEARCH", params],
    useNOCCheckListSearchFn(params, tenantId),
    {
      staleTime: Infinity,
      ...config,
    }
  );

  // Add a helper to revalidate if you want
  return {
    ...result,
    revalidate: () => client.invalidateQueries(["NOC_CHECKLIST_SEARCH", params]),
  };
};


// export const useNOCSearchApplication = (tenantId,filters, config = {}) => {
//   return useQuery(
//     ["APPLICATION_SEARCH", "NOC_SEARCH", tenantId, ...Object.entries(filters)],
//     () => NOCSearch.all(tenantId, filters),
//     config
//   );
// };
