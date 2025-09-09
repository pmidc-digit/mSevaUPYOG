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
      console.log("data in useNOCCitizenSearchApplication hook ", data);
      const applications = data?.data?.Applications || [];
      const count = data?.data?.totalCount || 0;

      const mappedData = applications.map((owner) => ({
        BPA_APPLICATION_NUMBER_LABEL: owner?.applicationNo,
        TL_LOCALIZATION_OWNER_NAME: owner?.owners[0]?.name,
        TL_HOME_SEARCH_RESULTS_APP_STATUS_LABEL: owner?.applicationStatus,

        Applications: owner,
      }));

      return {
        data: mappedData,
        count,
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
      const objData = data?.data;
      return objData;
    },
  });

  return { ...result, revalidate: () => client.invalidateQueries(["NOC_SEARCH_APPLICATION", params]) };
};

// export const useNOCSearchApplication = (tenantId,filters, config = {}) => {
//   return useQuery(
//     ["APPLICATION_SEARCH", "NOC_SEARCH", tenantId, ...Object.entries(filters)],
//     () => NOCSearch.all(tenantId, filters),
//     config
//   );
// };
