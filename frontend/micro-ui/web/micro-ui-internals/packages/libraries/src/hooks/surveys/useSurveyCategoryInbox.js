import { Surveys } from "../../services/elements/Surveys";
import { useQuery } from "react-query";

const useSearch = (filters, config) => {
  const { searchForm, filterForm } = filters;
  const { tenantIds, categoryName, isActive } = searchForm;
  const { status } = filterForm;
  const validTenantId = typeof tenantIds === "object" ? tenantIds.code : tenantIds;

  const finalFilters = {
    tenantId: validTenantId,
    id: categoryName?.value ?? "",
    isActive: status?.bool ?? null,
    //isActive: isActive?.id ?? ""
  };

  //clearing out empty string params from payload
  Object.keys(finalFilters).forEach((key) => {
    if (finalFilters[key] === "") {
      delete finalFilters[key];
    }
  });

  return useQuery(
    [
      "search_survey_categories",
      tenantIds,
      categoryName,
      //isActive,
      status,
    ],
    () => Surveys.searchCategory(finalFilters),
    { ...config, refetchInterval: 6000 }
  );
};

export default useSearch;
