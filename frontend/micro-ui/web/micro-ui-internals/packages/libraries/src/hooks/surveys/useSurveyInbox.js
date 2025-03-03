import { Surveys } from "../../services/elements/Surveys";
import { useMutation, useQuery } from "react-query";
/* import { isObject, isObjectLike } from "lodash"; */

const useSearch = (filters, config) => {
    const { filterForm, searchForm } = filters
    const { status } = filterForm
    const { title, tenantIds} = searchForm
    //const { sortBy, limit, offset, sortOrder } = tableForm;
    const validTenantId = typeof tenantIds === 'object' ? tenantIds.code : tenantIds;
    const validStatus = typeof status === 'object' ? status.code : status;

    const finalFilters = {
        tenantId: validTenantId,
        status: validStatus === "ALL" ? "" : validStatus,
        title
       
    }

    //clearing out empty string params from payload
    Object.keys(finalFilters).forEach(key => {
        if (finalFilters[key] === '') {
            delete finalFilters[key];
        }
    });


    return useQuery(["search_surveys", title, tenantIds], () => Surveys.search(finalFilters), { ...config, refetchInterval: 6000 });
};

export default useSearch;
