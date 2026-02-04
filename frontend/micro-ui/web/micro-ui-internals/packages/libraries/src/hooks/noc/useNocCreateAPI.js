import { useQuery, useMutation } from "react-query";

import { NOCService } from "../../services/elements/NOC";

export const useNocCreateAPI = (tenantId, type = true) => {
  if (type) {
    // Create NOC
    return useMutation((details) =>
      NOCService.NOCcreate({ tenantId, details })
    );
  } else {
    // Update NOC
    return useMutation((details) =>
      NOCService.NOCUpdate({ tenantId, details })
    );
  }
};

export default useNocCreateAPI;
