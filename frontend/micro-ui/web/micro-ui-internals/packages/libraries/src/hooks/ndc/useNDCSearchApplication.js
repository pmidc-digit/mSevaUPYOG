import { useQuery, useQueryClient } from "react-query";

const useNDCSearch = (params, tenantId, config) => {
    return async () => {
        const data = await Digit.NDCService.NDCsearch({filters: params, tenantId, config});
        const Applications = data?.Applications;

        return {data};
    }
}

export const useNDCSearchApplication = (params, tenantId, config = {}, t) => {
    const client = useQueryClient();
    const result = useQuery(["NDC_APPLICATIONS_LIST", params], useNDCSearch(params, tenantId, config), {
        staleTime: Infinity,
        select: (data) => {
            const objData = data?.data?.Applications
            return objData?.map((owner) => ({
                NDC_COMMON_TABLE_COL_OWN_NAME: owner?.Applicant?.firstname + " " + owner?.Applicant?.lastname,
                NDC_COMMON_TABLE_COL_STATUS: owner?.Applicant?.applicationStatus
            }))
        }
    })

    return { ...result, revalidate: () => client.invalidateQueries(["NDC_APPLICATIONS_LIST", params]) };
}