import Urls from "../atoms/urls";
import { Request } from "../atoms/Utils/Request";

export const GCService = {
  create: (details, tenantId) =>
    Request({
      url: Urls.gc.create,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: true,
      method: "POST",
      params: {},
      auth: true,
    }),

  search: ({ tenantId, filters, auth }) =>
    Request({
      url: Urls.gc.search,
      useCache: false,
      method: "POST",
      auth: auth === false ? auth : true,
      userService: auth === false ? auth : true,
      params: { tenantId, ...filters },
    }),

  update: (details, tenantId) =>
    Request({
      url: Urls.gc.update,
      data: details,
      useCache: false,
      setTimeParam: false,
      userService: true,
      method: "POST",
      params: {},
      auth: true,
    }),
  validateConnection: ({ tenantId, filters, auth }) =>
    Request({
      url: Urls.gc.validateConnection,
      useCache: false,
      method: "POST",
      auth: auth === false ? auth : true,
      userService: auth === false ? auth : true,
      params: { tenantId, ...filters },
    }),

  location: ({ tenantId, filters, auth }) =>
    Request({
      url: Urls.gc.location,
      useCache: false,
      method: "POST",
      auth: auth === false ? auth : true,
      userService: auth === false ? auth : true,
      params: { tenantId, ...filters },
    }),
};
