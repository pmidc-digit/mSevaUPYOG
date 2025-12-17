import Urls from "../../atoms/urls";
import { Request } from "../../atoms/Utils/Request";

export const SearchEmpMap = (tenantId, filters = {}) => {
  // Extract limit and offset, default to safe values
  const { limit = 10, offset = 0, ...otherFilters } = filters;
  
  return Request({
    url: Urls.hrms.search,
    useCache: false,
    method: "POST",
    auth: true,
    userService: true,
    params: { 
      tenantId, 
      limit: Number(limit), 
      offset: Number(offset),
      ...otherFilters 
    },
  });
};