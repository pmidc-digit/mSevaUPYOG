import Urls from "../atoms/urls";
import { Request } from "../atoms/Utils/Request";
import InboxServiceApicall from "../molecules/SWACH/inboxApiCall";

export const SwachService = {
  search: (tenantId, filters = {}) => {
    return Request({
      url: Urls.Swach_search,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId: tenantId, ...filters },
    });
  },
  create: (details, tenantId) =>
    Request({
      url: Urls.Swach_Create,
      data: details,
      useCache: true,
      method: "POST",
      params: { tenantId },
      auth: true,
      userService: true,
    }),
  update: (details) =>
    Request({
      url: Urls.Swach_update,
      data: details,
      useCache: true,
      auth: true,
      method: "POST",
      params: { tenantId: details.tenantId },
      userService: true,
    }),
  count: (tenantId, params) =>
    Request({
      url: Urls.Swach_count,
      useCache: true,
      auth: true,
      method: "POST",
      params: { tenantId, ...params },
    }),
  AssigneeWithCount: (tenantId, params) =>
    Request({
      url: Urls.Swach_Assignee_Count,
      useCache: true,
      auth: true,
      method: "POST",
      params: { tenantId, ...params },
    }),

  employeeSearch: (tenantId, roles, isActive) => {
    return Request({
      url: Urls.EmployeeSearch,
      params: { tenantId, roles, isActive },
      auth: true,
    });
  },

  SwachOpensearch: ({ tenantId, filters }) =>
    Request({
     url: Urls.Swach_search,
     useCache: false,
     method: "POST",
     auth: false ,
     userService: false,
     params: { tenantId, ...filters },
   }),
   
    SwachAttendence: ({ tenantId, filters }) =>
    Request({
     url: Urls.Swach_attendence,
     useCache: false,
     method: "POST",
     auth: false ,
     userService: false,
     params: { tenantId, ...filters },
   }),
    SwachViewAttendence: ({ tenantId, filters }) =>
    Request({
     url: Urls.Swach_ViewAttendence,
     useCache: false,
     method: "POST",
     auth: false ,
     userService: false,
     params: { tenantId, ...filters },
   }),
   InboxServiceApicall:InboxServiceApicall
};
