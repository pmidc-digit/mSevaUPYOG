import { useMutation, useQueryClient } from "react-query";
import Urls from "../../services/atoms/urls";
import { Request } from "../../services/atoms/Utils/Request";

const useCount= async(tenantId, Params_Count,assigneeCode, status) => {
// const { service, workflow } = (await Digit.SwachService.search(tenantId, { serviceRequestId: id })).ServiceWrappers[0] || {};
  const paramsWithAssignee = { ...Params_Count, assignee: assigneeCode, status:status };
     let response = await Digit.SwachService.AssigneeWithCount(tenantId, paramsWithAssignee);
     console.log("useCount response", response);
     return response;
 
}
export default useCount;