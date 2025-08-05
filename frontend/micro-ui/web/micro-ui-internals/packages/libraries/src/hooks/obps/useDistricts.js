import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useDistricts = (tenantId, moduleCode, type, config = {}) => {
  const usedistricttype = () => {
<<<<<<< HEAD
    return useQuery("BPA_DISTRICTS", () => MdmsService.BPADistrict(tenantId, moduleCode, type), config);
  };
=======
    return useQuery("BPA_DISTRICTS", () => MdmsService.BPADistrict(tenantId, moduleCode ,type), config);
  };
  
>>>>>>> dba611404f82ba8fe5fcb4fe595c3c2122f84e58

  switch (type) {
    case "Districts":
      return usedistricttype();
    default:
      return null;
  }
};

<<<<<<< HEAD
export default useDistricts;
=======


export default useDistricts;
>>>>>>> dba611404f82ba8fe5fcb4fe595c3c2122f84e58
