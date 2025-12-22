import Urls from "../../atoms/urls";
import { Request } from "../../atoms/Utils/Request";

export const DeleteEmpMapping = (tenantId, data) => {
  return Request({
    url: Urls.hrms.deleteEmpMapping,
    method: "POST",
    auth: true,
    userService: false,
    data: data,
    params: { tenantId }
  });
};
