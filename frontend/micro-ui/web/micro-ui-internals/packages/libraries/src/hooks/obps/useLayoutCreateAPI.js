import { useMutation } from "react-query";
import { OBPSService } from "../../services/elements/OBPS";

export const useLayoutCreateAPI = (tenantId, type = true) => {
  if (type) {
    return useMutation((details) =>
      OBPSService.LayoutCreate({ tenantId, ...details })
    );
  } else {
    return useMutation((details) =>
      OBPSService.LayoutUpdate({ tenantId, ...details })
    );
  }
};

export default useLayoutCreateAPI;
