import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useChallanGenerationMDMS = (tenantId, moduleCode, type, filter, config = {}) => {
  const useChallanGenerationBillingService = () => {
    return useQuery("CHALLANGENERATION_BILLING_SERVICE", () => MdmsService.getChallanGenerationBillingService(tenantId, moduleCode, type, filter), config);
  };
  const useChallanGenerationApplcationStatus = () => {
    return useQuery("CHALLANGENERATION_APPLICATION_STATUS", () => MdmsService.getChallanGenerationApplcationStatus(tenantId, moduleCode, type, filter), config);
  };

  switch (type) {
    case "BusinessService":
      return useChallanGenerationBillingService();
    case "applicationStatus":
      return useChallanGenerationApplcationStatus();
    default:
      return null;
  }
};

export default useChallanGenerationMDMS;
