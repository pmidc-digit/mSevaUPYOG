import Urls from "../atoms/urls";
import { ServiceRequest } from "../atoms/Utils/Request";

export const LocationService = {
  getLocalities: (tenantId) => {
    return ServiceRequest({
      serviceName: "getLocalities",
      url: Urls.location.localities,
      params: { tenantId: tenantId },
      useCache: true,
    });
  },
  getRevenueLocalities: async (tenantId) => {
    const response = await ServiceRequest({
      serviceName: "getRevenueLocalities",
      url: Urls.location.revenue_localities,
      params: { tenantId: tenantId },
      useCache: true,
    });
    return response;
  },
  getRevenueBlocks: async (data) => {
    const response = await ServiceRequest({
      serviceName: "getRevenueBlocks",
      url: Urls.location.revenue_blocks,
      params: data ,
      useCache: true,
    });
    return response;
  },
};
