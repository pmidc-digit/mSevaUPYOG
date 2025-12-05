import Urls from "../../atoms/urls";
import { Request } from "../../atoms/Utils/Request";

export const EmpMapDetails = (tenantId, filters = {}) => {
  // Extract and validate parameters
  const { limit = 10, offset = 0, userUUID, ...otherFilters } = filters;
  
  return Request({
    url: Urls.hrms.empmap_search,
    useCache: false,
    method: "POST",
    auth: true,
    userService: true,
    params: { 
      tenantId,
      limit: Number(limit),
      offset: Number(offset),
      userUUID,
      ...otherFilters 
    },
  });
};