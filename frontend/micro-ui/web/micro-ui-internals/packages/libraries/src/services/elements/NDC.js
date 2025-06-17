import Urls from "../atoms/urls";
import { Request } from "../atoms/Utils/Request";

export const NDCService = {
  search: ({ tenantId, filters }) =>
    Request({
      url: Urls.ndc.search,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId, ...filters },
    }),

  create: (details, tenantId) =>
    Request({
      url: Urls.ndc.create,
      data: details,
      useCache: true,
      method: "POST",
      params: { tenantId },
      auth: true,
      userService: true,
    }),
};
