import { useQuery, useMutation } from "react-query";

import { OBPSService } from "../../services/elements/OBPS";

export const useCLUCreateAPI = (tenantId, type = true) => {
  if (type) {
    return useMutation((details) =>
      OBPSService.CLUCreate({ tenantId, details })
    );
  } else {
    return useMutation((details) =>
      OBPSService.CLUUpdate({ tenantId, details })
    );
  }
};

export default useCLUCreateAPI;
