import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useRentAndLeaseMDMS = (tenantId, moduleCode, type, filter, config = {}) => {
  const useRentAndLeaseBillingService = () => {
    return useQuery("RentAndLease_BILLING_SERVICE", () => MdmsService.getRentAndLeaseBillingService(tenantId, moduleCode, type, filter), config);
  };
  const useRentAndLeaseApplcationStatus = () => {
    return useQuery("RentAndLease_APPLICATION_STATUS", () => MdmsService.getRentAndLeaseApplcationStatus(tenantId, moduleCode, type, filter), config);
  };

  switch (type) {
    case "BusinessService":
      return useRentAndLeaseBillingService();
    case "applicationStatus":
      return useRentAndLeaseApplcationStatus();
    default:
      return null;
  }
};

export default useRentAndLeaseMDMS;
