import { useQuery, useQueryClient } from "react-query";

const useCLUSearch = (params, tenantId, config) => {
  return async () => {
    const data = await Digit.OBPSService.CLUSearch({ filters: params, tenantId, config });
    return { data };
  };
};

export const useCLUCitizenSearchApplication = (params, tenantId, config = {}, t) => {
  const client = useQueryClient();

  const result = useQuery(["CLU_APPLICATIONS_LIST", params], useCLUSearch(params, tenantId, config), {
    staleTime: Infinity,
    select: (data) => {
      //console.log("data in useCLUCitizenSearchApplication hook ", data);
      const applications = data?.data?.Clu || [];
      const count = data?.data?.count || 0;

      // console.log("count in hook", count);
      // console.log("applications in hook", applications);

      const mappedData = applications?.map((owner) => ({
        BPA_APPLICATION_NUMBER_LABEL : owner?.applicationNo,
        // TL_LOCALIZATION_OWNER_NAME: owner?.owners[0]?.name,
        TL_HOME_SEARCH_RESULTS_APP_STATUS_LABEL: `BPA_STATUS_${owner?.applicationStatus}`,

        Applications: owner,
      }));

      return {
        data: mappedData,
        count,
        revalidate: () => client.invalidateQueries(["CLU_APPLICATIONS_LIST", params])
      };
    },
  });

  return { ...result, revalidate: () => client.invalidateQueries(["CLU_APPLICATIONS_LIST", params]) };
};


export const useCLUSearchApplication = (params, tenantId, config = {}, t) => {
  const client = useQueryClient();
  const result = useQuery(["CLU_SEARCH_APPLICATION", params], useCLUSearch(params, tenantId, config), {
    staleTime: Infinity,
    select: (data) => {
      return{
        resData: data?.data,
        revalidate: () => client.invalidateQueries(["CLU_SEARCH_APPLICATION", params])
      }
    },
  });

  return { ...result, revalidate: () => client.invalidateQueries(["CLU_SEARCH_APPLICATION", params]) };
};

export const useCLUSearchApplicationByIdOrMobile = (params, tenantId, config = {}, t) => {
  const client = useQueryClient();
  const result = useQuery(["CLU_SEARCH_APPLICATION_BY_ID_MOBILENO", params], useCLUSearch(params, tenantId, config), {
    staleTime: Infinity,
    select: (data) => {

    let tableData;

    if(data?.data?.Clu?.length == 0){
      tableData=[{ display: "ES_COMMON_NO_DATA" }];
    }
    else{
    tableData = data?.data?.Clu?.map((application) => {
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
  return { ...result, revalidate: () => client.invalidateQueries(["CLU_SEARCH_APPLICATION", params]) };
};

const useCLUCheckListSearchFn = (params, tenantId) => {
  return async () => {
    return await Digit.OBPSService.CLUCheckListSearch({ tenantId, filters: params, });
  };
};

export const useCLUCheckListSearch = (params, tenantId, config = {}) => {
  const client = useQueryClient();

  const result = useQuery(
    ["CLU_CHECKLIST_SEARCH", params],
    useCLUCheckListSearchFn(params, tenantId),
    {
      staleTime: Infinity,
      ...config,
    }
  );

  return {
    ...result,
    revalidate: () => client.invalidateQueries(["CLU_CHECKLIST_SEARCH", params]),
  };
};


