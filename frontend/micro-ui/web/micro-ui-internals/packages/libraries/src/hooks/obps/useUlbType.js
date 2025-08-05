import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useUlbType = (tenantId, moduleCode, type, config = {}) => {
  const useULB = () => {
<<<<<<< HEAD
    return useQuery("BPA_ULB", () => MdmsService.BPAUlbType(tenantId, moduleCode, type), config);
  };
=======
    return useQuery("BPA_ULB", () => MdmsService.BPAUlbType(tenantId, moduleCode ,type), config);
  };
  
>>>>>>> dba611404f82ba8fe5fcb4fe595c3c2122f84e58

  switch (type) {
    case "UlbType":
      return useULB();
    default:
      return null;
  }
};

<<<<<<< HEAD
export default useUlbType;
=======


export default useUlbType;
>>>>>>> dba611404f82ba8fe5fcb4fe595c3c2122f84e58
