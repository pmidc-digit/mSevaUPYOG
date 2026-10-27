import { Request } from "../atoms/Utils/Request";
import Urls from "../atoms/urls";

const AccessControlService = {
  getAccessControl: (roles = []) => {
    const roleCodes = roles && roles.length > 0 ? roles : ["CITIZEN"];
    return Request({
      url: Urls.access_control,
      method: "POST",
      auth: true,
      useCache: false,
      userService: true,
      data: {
        roleCodes: roleCodes,
        tenantId: Digit.ULBService.getStateId() || "pb",
        actionMaster: "actions-test",
        enabled: true,
      },
      reqTimestamp: true,
    });
  },
};
export default AccessControlService;
