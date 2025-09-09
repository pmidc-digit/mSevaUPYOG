import { Request } from "../atoms/Utils/Request"
import Urls from "../atoms/urls";

export const NOCService = {
  NOCsearch: ({ tenantId, filters }) =>
    Request({
      url: Urls.noc.nocSearch,
      useCache: false,
      method: "POST",
      auth: true,
      userService: false,
      params: { tenantId, ...filters },
    }),
   NOCcreate: ({ tenantId, filters, details }) => {
    return Request({
      url: Urls.noc.nocCreate,
      data: details,
      useCache: true,
      method: "POST",
      params: { tenantId, ...filters },
      auth: true,
      userService: true,
    });
  },
   NOCUpdate: ({ tenantId, filters, details }) =>
    Request({
      url: Urls.noc.update,
      data: details,
      useCache: true,
      userService: true,
      method: "POST",
      params: { tenantId, ...filters },
      auth: true,
    }),
}