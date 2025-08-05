import { useQuery } from "react-query";
import { MdmsService } from "../../services/elements/MDMS";

const useULBList = (tenantId, moduleCode, type, config = {}) => {
  const useULBType = () => {
<<<<<<< HEAD
    return useQuery("BPA_ULB_TYPE", () => MdmsService.BPAUlb(tenantId, moduleCode, type), config);
  };
=======
    return useQuery("BPA_ULB_TYPE", () => MdmsService.BPAUlb(tenantId, moduleCode ,type), config);
  };
  
>>>>>>> dba611404f82ba8fe5fcb4fe595c3c2122f84e58

  switch (type) {
    case "Ulb":
      return useULBType();
    default:
      return null;
  }
};

<<<<<<< HEAD
export default useULBList;
=======


export default useULBList;
>>>>>>> dba611404f82ba8fe5fcb4fe595c3c2122f84e58
