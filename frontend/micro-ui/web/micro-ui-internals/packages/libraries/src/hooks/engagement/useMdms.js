import { MdmsService, getGeneralCriteria } from "../../services/elements/MDMS";
import { useQuery } from "react-query";

export const useEngagementMDMS = (tenantId, moduleCode, type, config = {}, payload = []) => {
  const useDocumentCategory = () => {
    return useQuery(type, () => MdmsService.getDataByCriteria(tenantId, getGeneralCriteria(tenantId, moduleCode, type), moduleCode), config);
  };

  const useSurveyAnswerTypes = () => {
    return useQuery([type, tenantId], () => MdmsService.getSurveyAnswerTypes(tenantId, moduleCode, type), config);
  };

  const _default = () => {
    return useQuery([tenantId, moduleCode, type], () => MdmsService.getMultipleTypes(tenantId, moduleCode, type), config);
  };

  switch (type) {
    case "DocumentsCategory":
      return useDocumentCategory();
    case "questionType":
      return useSurveyAnswerTypes();
    default:
      return _default();
  }
};
