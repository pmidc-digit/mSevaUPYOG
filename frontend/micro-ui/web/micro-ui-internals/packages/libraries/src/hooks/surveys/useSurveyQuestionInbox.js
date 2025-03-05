import { Surveys } from "../../services/elements/Surveys";
import { useQuery } from "react-query";

const useSearch = (filters, config) => {
  const { searchForm, filterForm } = filters;
  const { tenantIds, categoryName, questionStatement } = searchForm; //question
  const { status } = filterForm;
  const validTenantId = typeof tenantIds === "object" ? tenantIds.code : tenantIds;

  var finalFilters = {
    tenantId: validTenantId,
    categoryId: categoryName ? categoryName.value : "",
    //uuid: question ? question.value : "",
    questionStatement: questionStatement ? questionStatement.trim() : "",
    status: status && status.code === "ALL" ? "" : status ? status.code : ""
    //isActive: status ? status.bool : null,
    //isActive: isActive ? isActive.id : ""
};

  //clearing out empty string params from payload
  Object.keys(finalFilters).forEach((key) => {
    if (finalFilters[key] === "") {
      delete finalFilters[key];
    }
  });

  return useQuery(
    [
      "search_survey_questions",
      tenantIds,
      categoryName,
      questionStatement,
      //question,
      //isActive,
      status,
    ],
    () => Surveys.searchQuestions(finalFilters),
    { ...config, refetchInterval: 6000 }
  );
};

export default useSearch;
