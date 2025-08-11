import { useQuery, useQueryClient } from "react-query";

const useChallanGenerationCount = (tenantId, config = {}) => {
  return useQuery(["ChallanGeneration_COUNT", tenantId], () => Digit.ChallanGenerationService.count(tenantId), config);
};

export default useChallanGenerationCount;
