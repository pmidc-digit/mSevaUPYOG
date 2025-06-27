import { Request } from "../atoms/Utils/Request"
import Urls from "../atoms/urls";

export const NDCService = {
    NDCcreate: ({ tenantId, filters, details }) => {
        return Request({
            url: Urls.ndc.create,
            data: details,
            useCache: true,
            method: "POST",
            params: { tenantId, ...filters },
            auth: true,
            userService: true,
        })
    }, 
    NDCsearch: ({tenantId, filters}) =>
    Request({
      url: Urls.ndc.search,
      useCache: false,
      setTimeParam: false,
      userService: true,
      method: "POST",
      params: { tenantId, ...filters },
      auth: true,
    }),
}