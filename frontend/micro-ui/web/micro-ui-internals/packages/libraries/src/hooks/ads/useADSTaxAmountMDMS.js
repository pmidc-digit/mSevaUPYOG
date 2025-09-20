import { MdmsService } from "../../services/elements/MDMS";
import { useQuery } from "react-query";
/**
 * Custom hook to fetch TaxAmount data from MDMS based on tenantId, moduleCode, and type.
 * It conditionally retrieves either required TaxAmount for a specific screen or multiple 
 * types of TaxAmount based on the provided type.
 */

const useADSTaxAmountMDMS = (tenantId, moduleCode, type, config = {}) => {
  
  const useADSTaxAmountRequiredScreen = () => {
    return useQuery("ADS_TAXAMOUNT_REQ_SCREEN", () => MdmsService.getADSTaxAmount(tenantId, moduleCode), config);
  };
  
  const _default = () => {
    return useQuery([tenantId, moduleCode, type], () => MdmsService.getMultipleTypes(tenantId, moduleCode, type), config);
  };

  switch (type) {
    case "TaxAmount":
      return useADSTaxAmountRequiredScreen();
    
    default:
      return _default();
  }
};

export default useADSTaxAmountMDMS;
