import { roundToNearestMinutes } from "date-fns/esm";
import Urls from "../atoms/urls";
import { Request } from "../atoms/Utils/Request";
import { SearchEmpMap } from "../molecules/HRMS/SearchEmpMap";
import { EmpMapDetails } from "../molecules/HRMS/EmpMapDetails";
import { CreateEmpMapping } from "../molecules/HRMS/CreateEmpMapping";
import { DeleteEmpMapping } from "../molecules/HRMS/DeleteEmpMapping";

const HrmsService = {
  search: (tenantId, filters, searchParams) =>
    Request({
      url: Urls.hrms.search,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId, ...filters, ...searchParams },
    }),
  create: (data, tenantId) =>
    Request({
      data: data,
      url: Urls.hrms.create,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId },
    }),
  update: (data, tenantId) =>
    Request({
      data: data,
      url: Urls.hrms.update,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId },
    }),
  count: (tenantId) =>
    Request({
      url: Urls.hrms.count,
      useCache: false,
      method: "POST",
      auth: true,
      userService: true,
      params: { tenantId },
    }),
   ssoAuthenticateUser: (data)=>
    Request({
      url: Urls.hrms.sso_authenticate_user,
      method: "POST",
      data: data
      //useCache: false,
      // auth: true,
      // userService: true,
      // params: { tenantId },
    }),
  SearchEmpMap: SearchEmpMap,
  EmpMapDetails: EmpMapDetails,
  CreateEmpMapping: CreateEmpMapping,
  DeleteEmpMapping: DeleteEmpMapping
};

export default HrmsService;
