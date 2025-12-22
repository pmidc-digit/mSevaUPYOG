import Urls from "../../atoms/urls";
import { Request } from "../../atoms/Utils/Request";

export const CreateEmpMapping = (tenantId, data) => {
  return Request({
    url: Urls.hrms.createEmpMapping,
    useCache: false,
    method: "POST",
    auth: true,
    userService: false,
    data: data,
    params: { tenantId },
  });
};
