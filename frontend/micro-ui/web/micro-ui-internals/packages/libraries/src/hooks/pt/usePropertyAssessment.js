import { PTService } from "../../services/elements/PT";
import { useMutation } from "react-query";

const usePropertyAssessment = (tenantId, config = {}) => {
  return useMutation((data) => {
    if (data.Assessment?.assessmentNumber) {
      return PTService.assessmentUpdate(data, tenantId);
    }
    return PTService.assessmentCreate(data, tenantId);
  });
};

export default usePropertyAssessment;
